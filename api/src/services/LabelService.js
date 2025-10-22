const Label = require('../models/Label');

const DEFAULT_LABELS = [
  { id: 'sent', name: 'Sent', description: 'Mails you sent' },
  { id: 'received', name: 'Received', description: 'Mails you received' },
  { id: 'star', name: 'Star', description: 'Starred mails' },
  { id: 'trash', name: 'Trash', description: 'Deleted mails' },
  { id: 'spam', name: 'Spam', description: 'Marked as spam' },
  { id: 'read', name: 'Read', description: 'Marked as read' },
  { id: 'unread', name: 'Unread', description: 'Marked as unread' },
  { id: 'drafts', name: 'Drafts', description: 'Marked you drafted' }
];

class LabelService {
async initDefaultLabels(userId) {
  const existingLabels = await Label.find({ userId }, { id: 1 });
  const existingIds = new Set(existingLabels.map(l => l.id));

 const toInsert = DEFAULT_LABELS
  .filter(l => !existingIds.has(l.id))
  .map((l, index) => ({
    ...l,
    userId,
    order: index 
  }));


  if (toInsert.length > 0) {
    await Label.insertMany(toInsert);
  }
}

  async getAllLabels(userId) {
    await this.initDefaultLabels(userId);
    return await Label.find({ userId }).sort({ order: 1 }).lean();
  }

  async getLabelById(userId, id) {
    return await Label.findOne({ userId, id }).lean();
  }

  async createLabel(userId, name, description) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const existing = await Label.findOne({ userId, id });
    if (existing) return null;

    const label = new Label({
      id,
      name,
      description,
      userId
    });

    return await label.save();
  }

  async deleteLabel(userId, id) {
    if (DEFAULT_LABELS.find(l => l.id === id)) return false; // cannot delete system label
    const deleted = await Label.deleteOne({ userId, id });
    return deleted.deletedCount > 0;
  }

  async updateLabel(userId, id, newName) {
    if (DEFAULT_LABELS.find(l => l.id === id)) return false;

    const existing = await Label.findOne({ userId, id });
    if (!existing) return false;

    const duplicate = await Label.findOne({
      userId,
      name: newName,
      id: { $ne: id }
    });

    if (duplicate) return 'duplicate';

    existing.name = newName;
    return await existing.save();
  }
}

module.exports = new LabelService();
