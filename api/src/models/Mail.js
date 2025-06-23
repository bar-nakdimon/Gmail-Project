/**
 * Mail model representing an email message belonging to a specific user.
 */
class Mail {
  /**
   * @param {Object} params - Initialization parameters for the mail
   * @param {number} params.id - Unique identifier for the mail
   * @param {string} params.fromUserId - User ID of the sender
   * @param {string} params.toUserId - User ID of the recipient
   * @param {string} params.subject - Subject of the mail
   * @param {string} params.body - Body content of the mail
   * @param {Date} params.timestamp - Timestamp when mail was sent/received
   */
  constructor({ id, fromUserId, toUserId, subject, body, timestamp = new Date(), labels = [] }) {
    this.id = id;                 // Unique mail ID
    this.fromUserId = fromUserId; // Sender's user ID
    this.toUserId = toUserId;     // Recipient's user ID
    this.subject = subject;       // Mail subject line
    this.body = body;             // Mail body text
    this.timestamp = timestamp;   // When the mail was created
    this.labels = labels;
  }
}

module.exports = Mail;
