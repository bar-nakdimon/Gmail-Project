const User = require('../models/User');

class UserService {
      constructor() {
    this.users = [];
    this.nextId = 1;
  }

    /**
   * Registers a new user.
   * Throws error if username already exists.
   * @param {Object} data - User data { username, password, name, avatarUrl }
   * @returns {User} Newly created user object
   */
  registerUser({ username, password, name, avatarUrl }) {
    // Check if username already exists
    if (this.users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    // Save password as plain text here 
    const user = new User({
      id: this.nextId++,
      username,
      password,
      name: name || '',
      avatarUrl: avatarUrl || '',
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
}

module.exports = new UserService();