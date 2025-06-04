const mailService = require('../services/MailService');
const userService = require('../services/UserService');
const blacklistService = require('../services/BlacklistService');
const { extractUrls } = require('../utils/urlUtils');

class MailController {
  /**
   * GET /api/mails
   * Returns last 50 mails for authenticated user.
   * 401 if userId missing.
   */
  getInbox(req, res) {
    const userId = req.userId;
    const mails = mailService.getLast50MailsForUser(userId);
    res.status(200).json(mails);
  }

  /**
   * GET /api/mails/search/:query
   * Search mails by query substring for authenticated user.
   * 401 if userId missing, 400 if query missing.
   */
  searchMails(req, res) {
    const userId = req.userId;

    const query = req.params.query;
    if (!query) return res.status(400).json({ error: 'Missing search query' });

    const results = mailService.searchMailsByQuery(userId, query);
    res.status(200).json(results);
  }

  /**
   * POST /api/mails
   * Creates a new mail if no blacklisted URLs found.
   * 401 if userId missing, 400 if missing fields or blacklisted URL,
   * 500 if blacklist check fails.
   */
  async createMail(req, res) {
    const fromUserId = req.userId;
    const { toUserId, subject, body } = req.body;

    if (!toUserId || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields or user ID' });
    }
      // Check if recipient exists
  const recipient = userService.getUserById( Number(toUserId));
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient user not found' });
  }

    const urls = [...extractUrls(subject), ...extractUrls(body)];
    for (const url of urls) {
      try {
        const isBlacklisted = await blacklistService.checkUrl(url);
        if (isBlacklisted) {
          return res.status(400).json({ error: 'Blacklisted URL detected in subject or body' });
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to check blacklist', details: err.message });
      }
    }

    const mail = mailService.createMail({ fromUserId, toUserId, subject, body });
    res.status(201).json(mail);
  }

  /**
   * GET /api/mails/:id
   * Returns mail details if belongs to user.
   * 401 if userId missing, 400 if invalid id, 404 if not found.
   */
  async getMailById(req, res) {
    const userId = req.userId;

    const mailId = parseInt(req.params.id, 10);
    if (isNaN(mailId)) return res.status(400).json({ error: 'Invalid mail ID' });

    const mail = mailService.getMailById(userId, mailId);
    if (!mail) return res.status(404).json({ error: 'Mail not found or access denied' });

    res.status(200).json(mail);
  }

  /**
   * PATCH /api/mails/:id
   * Updates mail subject/body if user is sender.
   * 401 if userId missing, 400 if invalid id or data,
   * 404 if mail not found or no permission.
   */
  async updateMail(req, res) {
    const userId = req.userId;

    const mailId = parseInt(req.params.id, 10);
    if (isNaN(mailId)) return res.status(400).json({ error: 'Invalid mail ID' });

    const updateFields = req.body;
    if (!updateFields || typeof updateFields !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }

     if (updateFields.body) {
      const urls = [
    ...(updateFields.body ? extractUrls(updateFields.body) : []),
    ...(updateFields.subject ? extractUrls(updateFields.subject) : [])
    ];
    for (const url of urls) {
      try {
        const isBlacklisted = await blacklistService.checkUrl(url);
        if (isBlacklisted) {
           return res.status(400).json({ error: 'Blacklisted URL detected in updated subject or body' });
        }
      } catch (err) {
        return res.status(500).json({ error: 'Failed to check blacklist', details: err.message });
      }
    }
  }

    const updatedMail = mailService.updateMail(userId, mailId, updateFields);
    if (!updatedMail) return res.status(404).json({ error: 'Mail not found or no permission' });

    res.status(204).send();
  }

  /**
   * DELETE /api/mails/:id
   * Deletes mail if user is sender.
   * 401 if userId missing, 400 if invalid id,
   * 404 if mail not found or no permission.
   */
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
