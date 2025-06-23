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
  constructor() {
    /**
     * A Map storing user labels by userId.
     * Key: userId (string)
     * Value: Array of Label objects belonging to that user.
     */
    this.userLabels = new Map();
  }

  // Init default labels for a user only once
  initDefaultLabels(userId) {
    if (!this.userLabels.has(userId)) {
      this.userLabels.set(userId, [...DEFAULT_LABELS]);
    }
  }

  getAllLabels(userId) {
    this.initDefaultLabels(userId);
    return this.userLabels.get(userId);
  }

  getLabelById(userId, id) {
    return this.getAllLabels(userId).find(label => label.id === id) || null;
  }

  createLabel(userId, name, description) {
    this.initDefaultLabels(userId);
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const all = this.userLabels.get(userId);
    if (all.some(l => l.id === id)) return null; // no duplicates

    const label = { id, name, description };
    all.push(label);
    return label;
  }

  deleteLabel(userId, id) {
    if (DEFAULT_LABELS.find(l => l.id === id)) return false; // permanent label
    const all = this.getAllLabels(userId);
    const index = all.findIndex(l => l.id === id);
    if (index === -1) return false;
    all.splice(index, 1);
    return true;
  }
  
  updateLabel(userId, id, newName) {
  if (DEFAULT_LABELS.find(l => l.id === id)) return false; // cannot rename default labels

  const all = this.getAllLabels(userId);
  const label = all.find(l => l.id === id);
  if (!label) return false;

  // Check if another label with the same name already exists
  const duplicate = all.find(l => l.name.toLowerCase() === newName.toLowerCase() && l.id !== id);
  if (duplicate) return 'duplicate'; // special flag

  label.name = newName;
  return true;
}

}

module.exports = new LabelService();
