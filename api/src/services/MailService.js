const Mail = require('../models/Mail');
const getNextSequence = require('../utils/getNextSequence');

class MailService {

    async _getMailsForUser(userId, limit = null) {
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) return [];

      const query = Mail.find({ ownId: numericUserId }).sort({ timestamp: -1 });

      if (limit) query.limit(limit);

      return await query.lean();
    }


    async getLast50MailsForUser(userId) {
    return await this._getMailsForUser(userId, 50);
  }


async createMail({ fromUserId, toUserId, subject, body, isDraft = false }) {
  const nextId = await getNextSequence('mail');

  // Determine labels for the sender's copy
  let senderLabels = [];
  if (isDraft) {
    senderLabels = ['drafts'];
  } else if (fromUserId === toUserId) {
    senderLabels = ['sent', 'read', 'received'];
  } else {
    senderLabels = ['sent', 'read'];
  }

  // Create sender's copy
  const mail = new Mail({
    id: nextId,
    fromUserId,
    toUserId,
    ownId: fromUserId,
    subject,
    body,
    timestamp: new Date(),
    labels: senderLabels,
    isDraft
  });

  await mail.save();

  let recipientMail = null;

  // Create recipient's copy only if not a draft and not self-sent
  if (!isDraft && fromUserId !== toUserId) {
    const recipientId = await getNextSequence('mail');
    recipientMail = new Mail({
      id: recipientId,
      fromUserId,
      toUserId,
      ownId: toUserId,
      subject,
      body,
      timestamp: mail.timestamp,
      labels: ['received', 'unread'],
      isDraft: false
    });

    await recipientMail.save();
  }

  return {
    senderCopy: mail.toJSON(),
    recipientCopy: recipientMail?.toJSON() || null
  };
}



async getMailById(userId, mailId) {
  const numericUserId = parseInt(userId, 10);
  const numericMailId = parseInt(mailId, 10);
  if (isNaN(numericUserId) || isNaN(numericMailId)) return null;

  const mail = await Mail.findOne({ id: numericMailId });
  if (!mail) return null;

  console.log('Fetching mail id:', numericMailId, 'for userId:', numericUserId);
console.log('Mail found has ownId:', mail.ownId);


  return mail.ownId === numericUserId ? mail : null;
}



async updateMail(userId, mailId, updateFields) {
  const mail = await this.getMailById(userId, mailId);
  console.log('PATCH requested for mailId:', mailId, 'by userId:', userId);
  if (!mail) return null;

  if (updateFields.subject !== undefined) mail.subject = updateFields.subject;
  if (updateFields.body !== undefined) mail.body = updateFields.body;
  if (Array.isArray(updateFields.labels)) {
    mail.labels = [...new Set(updateFields.labels)];
  }
  if (updateFields.toUserId !== undefined) mail.toUserId = updateFields.toUserId;
  if (updateFields.isDraft !== undefined) mail.isDraft = updateFields.isDraft;

  await mail.save();
  return mail.toJSON(); 
}


  async deleteMail(userId, mailId) {
    const mail = await this.getMailById(userId, mailId);
    if (!mail) return false;

    const trashId = 'trash';

    if (!mail.labels) mail.labels = [];

    if (mail.labels.includes(trashId)) {
      await Mail.deleteOne({ id: mail.id });
      return true;
    }

    mail.labels = [trashId];
    await mail.save();
    return true;
  }

  async removeLabelFromMail(userId, mailId, labelId) {
    const mail = await this.getMailById(userId, mailId);

    if (!mail) return null;

    mail.labels = (mail.labels || []).filter(l => l !== labelId);
    await mail.save();
    return mail.toJSON();
  }

  async addLabelToMail(userId, mailId, labelId) {
    const mail = await this.getMailById(userId, mailId);

    if (!mail) return null;

    if (!mail.labels) {
      mail.labels = [];
    }

    if (!mail.labels.includes(labelId)) {
      mail.labels.push(labelId);
      await mail.save();
    }

    return mail.toJSON();
  }

    async searchMailsByQuery(userId, query) {
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) return [];

      const regex = new RegExp(query, 'i'); // case-insensitive

      return await Mail.find({
        ownId: numericUserId,
        $or: [
          { subject: regex },
          { body: regex }
        ]
      })
      .sort({ timestamp: -1 })
      .lean();
    }

}

module.exports = new MailService();
