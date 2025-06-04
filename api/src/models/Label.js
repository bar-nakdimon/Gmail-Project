/**
 * Label model represents a label entity owned by a specific user.
 */
class Label {
  /**
   * Constructs a new Label instance.
   * 
   * @param {Object} params - The label properties.
   * @param {number} params.id - Unique identifier for the label.
   * @param {string} params.name - Name of the label.
   * @param {string} [params.description] - Optional description of the label.
   * @param {string} params.userId - The ID of the user who owns this label.
   */
  constructor({ id, name, description = '', userId }) {
    this.id = id;                   // Unique label ID
    this.name = name;               // Label name
    this.description = description; // Optional description text
    this.userId = userId;           // Owner user ID to associate label with a user
  }
}

module.exports = Label;
