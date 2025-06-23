const User = require('../models/User');

class UserService {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  /**
   * Validates username format.
   * Username must be 3-20 chars, letters, numbers, dots, underscores; 
   * cannot start or end with dot or underscore.
   */
  static isValidUsername(username) {
    const usernameRegex = /^(?![_.])[a-zA-Z0-9._]{3,20}(?<![_.])$/;
    return usernameRegex.test(username);
  }

  /**
   * Validates password strength.
   * Password must be at least 8 chars and include uppercase, lowercase, number, and special char.
   */
  static isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Registers a new user after validating all fields.
   * Throws error if validation fails or username exists.
   * @param {Object} data - { username, password, name, avatarUrl }
   * @returns {User}
   */
  registerUser({ username, password, name, avatarUrl }) {
    // Validate required fields presence
    if (!username || !password || !name) {
      throw new Error('Missing required fields: username, password, and name are required.');
    }

    // Validate username format
    if (!UserService.isValidUsername(username)) {
      throw new Error('Invalid username format. Username must be 3-20 characters, letters, numbers, dots, underscores; no _ or . at start/end.');
    }

    // Validate password strength
    if (!UserService.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number and special character.');
    }

    // Validate name length (optional)
    if (name.length < 2 || name.length > 50) {
      throw new Error('Display name must be between 2 and 50 characters.');
    }

    // Validate avatarUrl type if provided (optional)
    if (avatarUrl && typeof avatarUrl !== 'string') {
      throw new Error('Invalid avatar URL.');
    }

    // Check if username already exists
    if (this.users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    // Create and store the new user
        const user = new User({
          id: this.nextId++,
          username,
          password,  
          name,
          avatarUrl: avatarUrl || 'http://localhost:3000/uploads/default-avatar.svg',
        });

    this.users.push(user);

    return user;
  }

    /**
   * Verifies a user's credentials.
   * @param {string} username
   * @param {string} password
   * @returns {User|null} The user if valid, otherwise null
   */
    verifyUser(username, password) {
    return this.users.find(u => u.username === username && u.password === password) || null;
  }

  /**
   * Retrieves a user by ID.
   * @param {number} id
   * @returns {User|null}
   */
  getUserById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  /**
 * Retrieves a user by username.
 * @param {string} username
 * @returns {User|null}
 */
  getUserByUsername(username) {
    return this.users.find(u => u.username === username) || null;
  }

}

module.exports = new UserService();