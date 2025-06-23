const mailService = require('../services/MailService');
const userService = require('../services/UserService');
const blacklistService = require('../services/BlacklistService');
const labelService = require('../services/LabelService');
const { extractUrls } = require('../utils/urlUtils');
const { sendTcpCommand } = require('../utils/tcpClient');

class MailController {
  getInbox(req, res) {
    const userId = req.userId;
    const mails = mailService.getLast50MailsForUser(userId);
    const allLabels = labelService.getAllLabels(userId);
    const labelMap = new Map(allLabels.map(label => [label.id, label]));

    const enriched = mails.map(mail => {
      const fromUser = userService.getUserById(mail.fromUserId);
      const toUser = userService.getUserById(mail.toUserId);
      return {
        ...mail,
        fromUsername: fromUser?.username || '',
        toUsername: toUser?.username || '',
        labels: (mail.labels || []).map(id => labelMap.get(id)).filter(Boolean),
      };
    });

    res.status(200).json(enriched);
  }

  searchMails(req, res) {
    const userId = req.userId;
    const query = req.params.query;
    if (!query) return res.status(400).json({ error: 'Missing search query' });

    const results = mailService.searchMailsByQuery(userId, query);
    res.status(200).json(results);
  }

  async createMail(req, res) {
    const fromUserId = req.userId;
    const { toUsername, subject, body, isDraft = false} = req.body;
    const sender = userService.getUserById(fromUserId);

    if (isDraft) {
      // Allow partial drafts (any non-empty field)
      if (!subject && !body && !toUsername) {
        return res.status(400).json({ error: 'Cannot save empty draft' });
      }

      // Save only to sender with 'draft' label
      const mail = mailService.createMail({
        fromUserId,
        subject,
        body,
        isDraft: true
      });

      return res.status(201).json({
        ...mail,
        fromUsername: sender?.username || '',
        toUsername: toUsername || ''
      });
    }

    if (!toUsername || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: toUsername, subject, or body' });
    }

    const recipient = userService.getUserByUsername(toUsername);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const toUserId = recipient.id;
    const urls = [...extractUrls(subject), ...extractUrls(body)];
    let containsBlacklisted = false;

    for (const url of urls) {
      try {
        const isBlacklisted = await blacklistService.checkUrl(url);
        if (isBlacklisted) {
          containsBlacklisted = true;
          break; // we only need to know if *any* are blacklisted
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to check blacklist', details: err.message });
      }
    }

    // Create the mail first
    const mail = mailService.createMail({ fromUserId, toUserId, subject, body });
    const allSenderLabels = labelService.getAllLabels(fromUserId);
    const sentLabel = allSenderLabels.find(l => l.name.toLowerCase() === 'sent');
    if (sentLabel) {
      mailService.addLabelToMail(fromUserId, mail.id, sentLabel.id);
      }
      if (!containsBlacklisted) {
        const allRecipientLabels = labelService.getAllLabels(toUserId);
        const receivedLabel = allRecipientLabels.find(l => l.name.toLowerCase() === 'received');
        if (receivedLabel) {
          mailService.addLabelToMail(toUserId, mail.id, receivedLabel.id);
        }
      }



    // If blacklisted URLs found, add 'spam' label to mail in recipient's inbox
    if (containsBlacklisted) {
      const allLabels = labelService.getAllLabels(toUserId);
      const spamLabel = allLabels.find(l => l.name.toLowerCase() === 'spam');
      if (spamLabel) {
        mailService.addLabelToMail(toUserId, mail.id, spamLabel.id);
      }
    }

    res.status(201).json({
      ...mail,
      toUsername: recipient?.username || '',
      fromUsername: sender?.username || ''
    });
  }


  async getMailById(req, res) {
    const userId = req.userId;
    const mailId = parseInt(req.params.id, 10);
    if (isNaN(mailId)) return res.status(400).json({ error: 'Invalid mail ID' });

    const mail = mailService.getMailById(userId, mailId);
    if (!mail) return res.status(404).json({ error: 'Mail not found or access denied' });

    const allLabels = labelService.getAllLabels(userId);
    const labelMap = new Map(allLabels.map(label => [label.id, label]));

    const fromUser = userService.getUserById(mail.fromUserId);
    const toUser = userService.getUserById(mail.toUserId);

    const enriched = {
      ...mail,
      fromUsername: fromUser?.username || '',
      toUsername: toUser?.username || '',
      labels: (mail.labels || []).map(id => labelMap.get(id)).filter(Boolean),
    };

    res.status(200).json(enriched);
  }

  async updateMail(req, res) {
    const userId = req.userId;
    const mailId = parseInt(req.params.id, 10);
    if (isNaN(mailId)) return res.status(400).json({ error: 'Invalid mail ID' });

    const updateFields = req.body;
    if (!updateFields || typeof updateFields !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }

    // Handle label removal
    if (updateFields.removeLabel) {
      const allLabels = labelService.getAllLabels(userId);
      const validLabelIds = new Set(allLabels.map(l => l.id));
      if (!validLabelIds.has(updateFields.removeLabel)) {
        return res.status(400).json({ error: 'Invalid label to remove' });
      }

      const updatedMail = mailService.removeLabelFromMail(userId, mailId, updateFields.removeLabel);
      if (!updatedMail) return res.status(404).json({ error: 'Mail not found or no permission' });

      return res.status(204).send();
    }

    // Validate full label list update
    if (updateFields.labels && !Array.isArray(updateFields.labels)) {
      return res.status(400).json({ error: 'Labels must be an array of label IDs' });
    }

    if (updateFields.labels) {
      const allLabels = labelService.getAllLabels(userId);
      const validLabelIds = new Set(allLabels.map(l => l.id));
      if (updateFields.labels.some(id => !validLabelIds.has(id))) {
        return res.status(400).json({ error: 'Invalid label ID(s)' });
      }

      // Detect Spam label toggling
      const oldMail = mailService.getMailById(userId, mailId);
      const spamLabel = allLabels.find(l => l.name.toLowerCase() === 'spam');

      const hadSpamBefore = oldMail.labels?.includes(spamLabel.id);
      const hasSpamNow = updateFields.labels.includes(spamLabel.id);

      const urls = [
        ...(oldMail.subject ? extractUrls(oldMail.subject) : []),
        ...(oldMail.body ? extractUrls(oldMail.body) : [])
      ];

      if (!hadSpamBefore && hasSpamNow) {
        // Marking as spam → add URLs to blacklist
        for (const url of urls) {
          try {
            await sendTcpCommand(`POST ${url}`);
            blacklistService.addUrl(url);
          } catch (err) {
            console.warn(`Failed to blacklist URL: ${url}`, err.message);
          }
        }
      } else if (hadSpamBefore && !hasSpamNow) {
        // Unmarking spam → remove URLs
        for (const [id, url] of blacklistService.urlMap.entries()) {
          if (urls.includes(url)) {
            try {
              await sendTcpCommand(`DELETE ${url}`);
              blacklistService.deleteUrlById(id);
            } catch (err) {
              console.warn(`Failed to remove URL from blacklist: ${url}`, err.message);
            }
          }
        }
      }
    }

    const mail = mailService.getMailById(userId, mailId);
    if (!mail) return res.status(404).json({ error: 'Mail not found or no permission' });
        // Apply other updates
    if (updateFields.subject !== undefined) mail.subject = updateFields.subject;
    if (updateFields.body !== undefined) mail.body = updateFields.body;
    
    // If converting draft to sent
    if (mail.labels.includes('drafts') && updateFields.isDraft === false) {
      const recipient = userService.getUserByUsername(updateFields.toUsername);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient user not found' });
      }

      mail.toUserId = recipient.id;
      mail.isDraft = false;
      const allLabels = labelService.getAllLabels(userId);
      const sentLabel = allLabels.find(l => l.name.toLowerCase() === 'sent');
      const readLabel = allLabels.find(l => l.name.toLowerCase() === 'read');

      mail.labels = [sentLabel?.id, readLabel?.id].filter(Boolean);
      // 👇 NEW: clone mail to recipient's inbox
      const clonedMail = JSON.parse(JSON.stringify(mail));
      clonedMail.labels = ['received', 'unread'];
      clonedMail.timestamp = new Date().toISOString();
      mailService._getMailsForUser(recipient.id).push(clonedMail);
      mail.timestamp = new Date().toISOString();
    }

    mailService.updateMail(userId, mailId, updateFields);

    res.status(204).send();

  }



  async deleteMail(req, res) {
    const userId = req.userId;
    const mailId = parseInt(req.params.id, 10);
    if (isNaN(mailId)) return res.status(400).json({ error: 'Invalid mail ID' });

    const deleted = mailService.deleteMail(userId, mailId);
    if (!deleted) return res.status(404).json({ error: 'Mail not found or no permission' });

    res.status(204).send();
  }
}

module.exports = new MailController();
