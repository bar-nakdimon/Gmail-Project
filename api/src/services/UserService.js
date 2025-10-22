const User = require('../models/User');
const getNextSequence = require('../utils/getNextSequence');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class UserService {
  static isValidUsername(username) {
    const usernameRegex = /^(?![_.])[a-zA-Z0-9._]{3,20}(?<![_.])@gmail\.com$/;
    return usernameRegex.test(username);
  }

  static isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(password);
  }

  async registerUser({ username, password, name, avatarUrl }) {
    if (!username || !password || !name) {
      throw new Error('Missing required fields: username, password, and name are required.');
    }

    if (!UserService.isValidUsername(username)) {
      throw new Error('Invalid username format.');
    }

    if (!UserService.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number and special character.');
    }

    if (name.length < 2 || name.length > 50) {
      throw new Error('Display name must be between 2 and 50 characters.');
    }

    if (avatarUrl && typeof avatarUrl !== 'string') {
      throw new Error('Invalid avatar URL.');
    }

    const existing = await User.findOne({ username });
    if (existing) throw new Error('Username already exists');

   const nextId = await getNextSequence('user');

    const user = new User({
      id: nextId,
      username,
      password,
      name,
      avatarUrl: avatarUrl || 'http://localhost:3000/uploads/default-avatar.svg'
    });

    return await user.save();
  }


   async verifyUser(username, password) {
    return await User.findOne({ username, password }).lean();
  }

async getUserById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  return await User.findOne({ id: numericId }).lean();
}

   async getUserByUsername(username) {
    return await User.findOne({ username }).lean();
  }
}

module.exports = new UserService();
