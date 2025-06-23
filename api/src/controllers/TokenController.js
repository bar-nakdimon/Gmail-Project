const userService = require('../services/UserService');
const { createToken } = require('../utils/authHelper');

class TokenController {
  /**
   * Handles user login (POST /api/tokens).
   * Validates credentials and returns user ID on success.
   */
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = userService.verifyUser(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Generate JWT token instead of just userId
    const token = createToken(user);

    res.status(200).json({ token });
  }
}

module.exports = new TokenController();