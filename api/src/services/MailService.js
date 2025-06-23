const Mail = require('../models/Mail');

class MailService {
  constructor() {
    this.userMails = new Map();
    this.nextId = 1;
  }

  _getMailsForUser(userId) {
    const key = String(userId);
    if (!this.userMails.has(key)) {
      this.userMails.set(key, []);
    }
    return this.userMails.get(key);
  }

  getLast50MailsForUser(userId) {
    const mails = this._getMailsForUser(userId);
    return mails
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }

  createMail({ fromUserId, toUserId, subject, body, isDraft = false }) {
    const mail = new Mail({
      id: this.nextId++,
      fromUserId,
      toUserId: isDraft ? fromUserId : toUserId,
      subject,
      body,
      timestamp: new Date(),
      labels: isDraft ? ['drafts'] : ['sent', 'read'] 
    });

    this._getMailsForUser(fromUserId).push(mail);

    if (!isDraft && (toUserId !== fromUserId)) {
      const clonedMail = JSON.parse(JSON.stringify(mail));
      clonedMail.labels = ['received', 'unread'];
      this._getMailsForUser(toUserId).push(clonedMail);
    }

    return mail;
  }
  

  getMailById(userId, mailId) {
    const mails = this._getMailsForUser(userId);
    return mails.find(m => m.id === mailId) || null;
  }

  updateMail(userId, mailId, updateFields) {
    const mail = this.getMailById(userId, mailId);
    if (!mail) return null;

    if (updateFields.subject !== undefined) mail.subject = updateFields.subject;
    if (updateFields.body !== undefined) mail.body = updateFields.body;
    if (Array.isArray(updateFields.labels)) {
      mail.labels = [...new Set(updateFields.labels)];
    }

    return mail;
  }

    deleteMail(userId, mailId) {
      const mails = this._getMailsForUser(userId);
      const mail = mails.find(m => m.id === mailId);
      if (!mail) return false;

      const trashId = 'trash';

      if (!mail.labels) mail.labels = [];

      if (mail.labels.includes(trashId)) {
        // Second deletion – permanent
        const index = mails.findIndex(m => m.id === mailId);
        if (index !== -1) {
          mails.splice(index, 1);
          return true;
        }
        return false;
      }

      // First deletion – replace all labels with only 'trash'
      mail.labels = [trashId];
      return true;
    }


  removeLabelFromMail(userId, mailId, labelId) {
    const mail = this.getMailById(userId, mailId);
    if (!mail) return null;
    if (!mail.labels) return mail;

    mail.labels = mail.labels.filter(l => l !== labelId);
    return mail;
  }

  addLabelToMail(userId, mailId, labelId) {
    const mail = this.getMailById(userId, mailId);
    if (!mail) return null;

    if (!mail.labels) {
      mail.labels = [];
    }

    if (!mail.labels.includes(labelId)) {
      mail.labels.push(labelId);
    }

    return mail;
  }

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
