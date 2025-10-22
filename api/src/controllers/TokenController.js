const userService = require('../services/UserService');
const { createToken } = require('../utils/authHelper');

class TokenController {
  /**
   * Handles user login (POST /api/tokens).
   * Validates credentials and returns JWT token on success.
   */
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const user = await userService.verifyUser(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = createToken(user);
      res.status(200).json({ token });
    } catch (err) {
      res.status(500).json({ error: 'Server error during login', details: err.message });
    }
  }
}

module.exports = new TokenController();
