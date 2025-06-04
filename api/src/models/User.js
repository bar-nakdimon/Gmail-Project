// User model class representing a user entity in the system
class User {
  /**
   * Constructor to initialize a new User instance
   * @param {Object} params - User properties
   * @param {number} params.id - Unique identifier for the user
   * @param {string} params.username - The user's unique username
   * @param {string} params.password - The password for authentication security
   * @param {string} [params.name] - Optional full name of the user
   * @param {string} [params.avatarUrl] - Optional URL to the user's avatar/profile image
   * */
  constructor({ id, username, password, name = '', avatarUrl = '' }) {
    this.id = id;
    this.username = username;
    this.password = password; 
    this.name = name;
    this.avatarUrl = avatarUrl;
  }
}

// Export the User class for use in other parts of the application
module.exports = User;