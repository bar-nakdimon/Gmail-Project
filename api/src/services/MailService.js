const Mail = require('../models/Mail');

class MailService {
  constructor() {
    /**
     * Map of userId to array of Mail objects.
     * This keeps mails isolated per user (sender or recipient).
     */
    this.userMails = new Map();

    /**
     * Global incremental ID for mails.
     * In a real DB this would be auto-generated.
     */
    this.nextId = 1;
  }

  /**
   * Helper to get or create the mail list for a user.
   * @param {string} userId
   * @returns {Array<Mail>} Array of mails for the user
   */
  _getMailsForUser(userId) {
    if (!this.userMails.has(userId)) {
      this.userMails.set(userId, []);
    }
    return this.userMails.get(userId);
  }

  /**
   * Get last 50 mails (sent or received) for a user, sorted descending by timestamp.
   * @param {string} userId
   * @returns {Array<Mail>}
   */
  getLast50MailsForUser(userId) {
    const mails = this._getMailsForUser(userId);
    return mails
      .slice() // copy to avoid mutation
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }

  /**
   * Create a new mail for sender and recipient.
   * Adds the mail to both users' mail lists.
   * @param {Object} params
   * @param {string} params.fromUserId
   * @param {string} params.toUserId
   * @param {string} params.subject
   * @param {string} params.body
   * @returns {Mail} The created mail
   */
  createMail({ fromUserId, toUserId, subject, body }) {
    const mail = new Mail({
      id: this.nextId++,
      fromUserId,
      toUserId,
      subject,
      body,
      timestamp: new Date(),
    });

    this._getMailsForUser(fromUserId).push(mail);

    // Add to recipient's mails if recipient different than sender
    if (toUserId !== fromUserId) {
      this._getMailsForUser(toUserId).push(mail);
    }

    return mail;
  }

  /**
   * Get a mail by mail ID for a user.
   * Only mails where user is sender or recipient are returned.
   * @param {string} userId
   * @param {number} mailId
   * @returns {Mail|null}
   */
  getMailById(userId, mailId) {
    const mails = this._getMailsForUser(userId);
    return mails.find(m => m.id === mailId) || null;
  }

  /**
   * Update a mail's subject and/or body.
   * Only the sender is authorized to update.
   * @param {string} userId
   * @param {number} mailId
   * @param {Object} updateFields
   * @returns {Mail|null} Updated mail or null if unauthorized/not found
   */
  updateMail(userId, mailId, updateFields) {
    const mail = this.getMailById(userId, mailId);
    if (!mail) return null;

    // Only sender can update mail content
    if (mail.fromUserId !== userId) return null;

    if (updateFields.subject !== undefined) mail.subject = updateFields.subject;
    if (updateFields.body !== undefined) mail.body = updateFields.body;

    return mail;
  }

  /**
   * Delete a mail by mail ID.
   * Only sender can delete.
   * @param {string} userId
   * @param {number} mailId
   * @returns {boolean} True if deleted, false if not found or unauthorized
   */
  deleteMail(userId, mailId) {
    const mails = this._getMailsForUser(userId);
    const index = mails.findIndex(m => m.id === mailId);
    if (index === -1) return false;

    if (mails[index].fromUserId !== userId) return false;

    mails.splice(index, 1);
    return true;
  }

  /**
   * Search mails for a user by substring match in subject or body.
   * Case-insensitive.
   * @param {string} userId
   * @param {string} query
   * @returns {Array<Mail>}
   */
  searchMailsByQuery(userId, query) {
    const mails = this._getMailsForUser(userId);
    const lowerQuery = query.toLowerCase();

    return mails.filter(
      mail =>
        (mail.subject && mail.subject.toLowerCase().includes(lowerQuery)) ||
        (mail.body && mail.body.toLowerCase().includes(lowerQuery))
    );
  }

}

module.exports = new MailService();
