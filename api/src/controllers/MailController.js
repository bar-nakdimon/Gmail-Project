const mailService = require('../services/MailService');
const userService = require('../services/UserService');
const blacklistService = require('../services/BlacklistService');
const labelService = require('../services/LabelService');
const { extractUrls } = require('../utils/urlUtils');
const { sendTcpCommand } = require('../utils/tcpClient');
const MailService = require('../services/MailService');

class MailController {
  // Fetches last 50 mails, enriches with usernames and label objects
async getInbox(req, res) {
  try {
    const userId = req.userId;

    const mails = await mailService.getLast50MailsForUser(userId);
    const allLabels = await labelService.getAllLabels(userId);

    const labelMap = new Map(
      allLabels.map(label => [`${userId}:${label.id}`, label])
    );

    const userIds = Array.from(
      new Set(mails.flatMap(mail => [mail.fromUserId, mail.toUserId]))
    );

    const users = await Promise.all(userIds.map(id => userService.getUserById(id)));
    const userMap = new Map(users.map(user => [user?.id, user]));

    const enriched = mails.map(mail => {
      const fromUser = userMap.get(mail.fromUserId);
      const toUser = userMap.get(mail.toUserId);

      return {
        ...mail,
        fromUsername: fromUser?.username || '',
        toUsername: toUser?.username || '',
        labels: (mail.labels || []).map(id => labelMap.get(`${userId}:${id}`)).filter(Boolean),
        labelIds: (mail.labels || []).filter(id => labelMap.has(`${userId}:${id}`)),
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    console.error('Error in getInbox:', err);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
}


  // Search user's mails by keyword
async searchMails(req, res) {
  try {
    const userId = req.userId;
    const query = req.params.query;

    if (!query) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const results = await mailService.searchMailsByQuery(userId, query);

    const allLabels = await labelService.getAllLabels(userId);
    const labelMap = new Map(allLabels.map(l => [`${userId}:${l.id}`, l]));

    const userIds = Array.from(new Set(results.flatMap(mail => [mail.fromUserId, mail.toUserId])));
    const users = await Promise.all(userIds.map(id => userService.getUserById(id)));
    const userMap = new Map(users.map(u => [u?.id, u]));

    const enriched = results.map(mail => {
      const fromUser = userMap.get(mail.fromUserId);
      const toUser = userMap.get(mail.toUserId);
      return {
        ...mail,
        fromUsername: fromUser?.username || '',
        toUsername: toUser?.username || '',
        labels: (mail.labels || []).map(id => labelMap.get(`${userId}:${id}`)).filter(Boolean),
        labelIds: (mail.labels || []).filter(id => labelMap.has(`${userId}:${id}`)),
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    console.error('Search mails failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


async createMail(req, res) {
  const fromUserId = req.userId;
  const { toUsername, subject, body, isDraft = false } = req.body;

  const sender = await userService.getUserById(fromUserId);

  if (isDraft) {
    if (!subject && !body && !toUsername) {
      return res.status(400).json({ error: 'Cannot save empty draft' });
    }

    const { senderCopy } = await mailService.createMail({
      fromUserId,
      subject,
      body,
      isDraft: true
    });

    return res.status(201).json({
      ...senderCopy,
      fromUsername: sender?.username || '',
      toUsername: ''
    });
  }

  if (!toUsername || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: toUsername, subject, or body' });
  }

  const recipient = await userService.getUserByUsername(toUsername);
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
        break;
      }
    } catch (err) {
      return res.status(500).json({ error: 'Failed to check blacklist', details: err.message });
    }
  }

  const { senderCopy, recipientCopy } = await mailService.createMail({ fromUserId, toUserId, subject, body });

  console.log('containsBlacklisted:', containsBlacklisted);

  if (containsBlacklisted && recipientCopy) {
    const recipientLabels = await labelService.getAllLabels(toUserId);
    console.log('📌 recipientLabels:', recipientLabels.map(l => l.id));

    const spamLabel = recipientLabels.find(l => l.name.toLowerCase() === 'spam');
    console.log('📌 spamLabel:', spamLabel);

    if (spamLabel) {
      await mailService.addLabelToMail(toUserId, recipientCopy.id, spamLabel.id);
      console.log('✅ spam label added to recipient copy');
    }
  }

  return res.status(201).json({
    ...senderCopy,
    fromUsername: sender?.username || '',
    toUsername: recipient?.username || ''
  });
}


async getMailById(req, res) {
  try {
    const userId = parseInt(req.userId, 10);  
    const mailId = parseInt(req.params.id, 10);

    if (isNaN(mailId) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user or mail ID' });
    }

    const mail = await mailService.getMailById(userId, mailId);
    if (!mail) {
      return res.status(404).json({ error: 'Mail not found or access denied' });
    }

    const [allLabels, fromUser, toUser] = await Promise.all([
      labelService.getAllLabels(userId),
      userService.getUserById(mail.fromUserId),
      userService.getUserById(mail.toUserId)
    ]);

    const labelMap = new Map(allLabels.map(label => [`${userId}:${label.id}`, label]));

    const enriched = {
      ...mail.toJSON(),
      fromUsername: fromUser?.username || '',
      toUsername: toUser?.username || '',
      labels: (mail.labels || []).map(id => labelMap.get(`${userId}:${id}`)).filter(Boolean),
      labelIds: (mail.labels || []).filter(id => labelMap.has(`${userId}:${id}`)),
    };

    res.status(200).json(enriched);
  } catch (err) {
    console.error('Failed to get mail by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async updateMail(req, res) {
  try {
    const userId = req.userId;
    const mailId = parseInt(req.params.id, 10);
    const updateFields = req.body;
    console.log('PATCH requested for mailId:', mailId, 'by userId:', userId);
    if (isNaN(mailId)) {
      return res.status(400).json({ error: 'Invalid mail ID' });
    }

    if (!updateFields || typeof updateFields !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }

    const allLabels = await labelService.getAllLabels(userId);
    const validLabelIds = new Set(allLabels.map(l => l.id));
    const spamLabel = allLabels.find(l => l.name.toLowerCase() === 'spam');

    const mailDoc = await mailService.getMailById(userId, mailId);
    if (!mailDoc) {
      return res.status(404).json({ error: 'Mail not found or no permission' });
    }

    const mail = mailDoc.toJSON();

    // LABEL REMOVAL
    if (updateFields.removeLabel) {
      if (!validLabelIds.has(updateFields.removeLabel)) {
        return res.status(400).json({ error: 'Invalid label to remove' });
      }

      const updated = await mailService.removeLabelFromMail(userId, mailId, updateFields.removeLabel);
      if (!updated) {
        return res.status(404).json({ error: 'Mail not found or no permission' });
      }

      return res.status(204).send(); 
    }

    // LABEL REPLACEMENT
    if (updateFields.labels) {
      if (!Array.isArray(updateFields.labels)) {
        return res.status(400).json({ error: 'Labels must be an array of label IDs' });
      }

      if (updateFields.labels.some(id => !validLabelIds.has(id))) {
        return res.status(400).json({ error: 'Invalid label ID(s)' });
      }

     let hadSpamBefore = false;
    let hasSpamNow = false;

    if (spamLabel) {
      const spamId = spamLabel.id;
      hadSpamBefore = (mail.labels || []).includes(spamId);
      hasSpamNow = (updateFields.labels || []).includes(spamId);
    }


      const urls = [
        ...(mail.subject ? extractUrls(mail.subject) : []),
        ...(mail.body ? extractUrls(mail.body) : [])
      ];

      if (spamLabel && !hadSpamBefore && hasSpamNow) {
        for (const url of urls) {
          try {
             console.log('✅ Adding URLs to blacklist');
            await sendTcpCommand(`POST ${url}`);
            await blacklistService.addUrl(url);
          } catch (err) {
            console.warn(`Failed to blacklist URL: ${url}`, err.message);
          }
        }
      } else if (hadSpamBefore && !hasSpamNow) {
        for (const url of urls) {
          try {
            const entry = await blacklistService.getByUrl(url);
            if (entry) {
              await sendTcpCommand(`DELETE ${url}`);
              await blacklistService.deleteUrlById(entry._id); 
            }
          } catch (err) {
            console.warn(`Failed to remove URL from blacklist: ${url}`, err.message);
          }
      }

      }

      const updated = await mailService.updateMail(userId, mailId, { labels: updateFields.labels });

      const labelMap = new Map(allLabels.map(l => [l.id, l]));

      return res.status(200).json({
        ...updated,
        labels: (updated.labels || []).map(id => labelMap.get(id)).filter(Boolean),
        labelIds: (updated.labels || []).filter(id => labelMap.has(id))
      });
    }

    // SUBJECT / BODY updates
    const updates = {};
    if (updateFields.subject !== undefined) updates.subject = updateFields.subject;
    if (updateFields.body !== undefined) updates.body = updateFields.body;

    // DRAFT → SEND conversion
    if (mail.labels.includes('drafts') && updateFields.isDraft === false) {
      const recipient = await userService.getUserByUsername(updateFields.toUsername);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient user not found' });
      }

      updates.toUserId = recipient.id;
      updates.isDraft = false;
      updates.labels = ['sent', 'read'];

      const copy = await mailService.createMail({
        fromUserId: mail.fromUserId,
        toUserId: recipient.id,
        subject: mail.subject,
        body: mail.body,
        isDraft: false
      });

      await mailService.updateMail(recipient.id, copy.id, {
        labels: ['received', 'unread']
      });
    }

    const final = await mailService.updateMail(userId, mailId, updates);

    const labelMap = new Map(allLabels.map(l => [l.id, l]));

    return res.status(200).json({
      ...final,
      labels: (final.labels || []).map(id => labelMap.get(id)).filter(Boolean),
      labelIds: (final.labels || []).filter(id => labelMap.has(id))
    });

  } catch (err) {
    console.error('Failed to update mail:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


async deleteMail(req, res) {
  try {
    const userId = req.userId;
    const mailId = parseInt(req.params.id, 10);

    if (isNaN(mailId)) {
      return res.status(400).json({ error: 'Invalid mail ID' });
    }

    const deleted = await mailService.deleteMail(userId, mailId);
    if (!deleted) {
      return res.status(404).json({ error: 'Mail not found or no permission' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete mail:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

}

module.exports = new MailController();
