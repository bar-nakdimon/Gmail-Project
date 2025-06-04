const Label = require('../models/Label');

class LabelService {
  constructor() {
    /**
     * A Map storing user labels by userId.
     * Key: userId (string)
     * Value: Array of Label objects belonging to that user.
     */
    this.userLabels = new Map();

    /**
     * Global incremental ID to assign unique IDs to new labels,
     * across all users. In real DB this would be auto-generated.
     */
    this.nextId = 1;
  }

  /**
   * Internal helper to retrieve the array of labels for a specific user.
   * If none exists, initializes an empty array.
   * 
   * @param {string} userId - The user ID.
   * @returns {Array} - Array of Label objects for the user.
   */
  _getLabelsForUser(userId) {
    if (!this.userLabels.has(userId)) {
      this.userLabels.set(userId, []);
    }
    return this.userLabels.get(userId);
  }

  /**
   * Get all labels for a user.
   * 
   * @param {string} userId - The user ID.
   * @returns {Array} - Array of all labels for the user.
   */
  getAllLabels(userId) {
    return this._getLabelsForUser(userId);
  }

  /**
   * Create a new label for a user.
   * 
   * @param {string} userId - The user ID.
   * @param {Object} data - Label data (name, description).
   * @returns {Label} - The newly created Label object.
   */
  createLabel(userId, data) {
    const labels = this._getLabelsForUser(userId);
    const label = new Label({ id: this.nextId++, userId: userId, ...data });
    labels.push(label);
    return label;
  }

  /**
   * Find a label by ID for a specific user.
   * 
   * @param {string} userId - The user ID.
   * @param {number} id - Label ID.
   * @returns {Label|null} - The label if found, else null.
   */
  getLabelById(userId, id) {
    const labels = this._getLabelsForUser(userId);
    return labels.find(label => label.id === id) || null;
  }

  /**
   * Update a label partially for a user.
   * 
   * @param {string} userId - The user ID.
   * @param {number} id - Label ID.
   * @param {Object} updateFields - Fields to update (name, description).
   * @returns {Label|null} - Updated label or null if not found.
   */
  updateLabel(userId, id, updateFields) {
    const label = this.getLabelById(userId, id);
    if (!label) return null;

    if (updateFields.name !== undefined) label.name = updateFields.name;
    if (updateFields.description !== undefined) label.description = updateFields.description;

    return label;
  }

  /**
   * Delete a label by ID for a user.
   * 
   * @param {string} userId - The user ID.
   * @param {number} id - Label ID.
   * @returns {boolean} - True if deletion succeeded, false if not found.
   */
  deleteLabel(userId, id) {
    const labels = this._getLabelsForUser(userId);
    const idx = labels.findIndex(label => label.id === id);
    if (idx === -1) return false;

    labels.splice(idx, 1);
    return true;
  }
}

module.exports = new LabelService();
