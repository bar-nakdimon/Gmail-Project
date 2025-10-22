const userService = require('../services/UserService');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class UserController {
  /**
   * Handles user registration (POST /api/users).
   * Saves uploaded avatar with a generated filename, or assigns a default avatar.
   */
  async register(req, res) {
    try {
      let { username, password, name } = req.body;
      const avatar = req.file;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
       username = username.trim() + '@gmail.com';

      // Check if username already exists
      const existing = await userService.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const avatarUrl = avatar
        ? `${BASE_URL}/uploads/${avatar.filename}`
        : `${BASE_URL}/uploads/default-avatar.svg`;

      const user = await userService.registerUser({ username, password, name, avatarUrl });
      const plainUser = user.toJSON();
      const { password: _, ...userData } = plainUser;

      res.status(201).json(userData);
    } catch (err) {
      console.error('Failed to register user:', err);
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves user details by ID (GET /api/users/:id).
   * Excludes password from the response.
   */
  async getUserById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _, ...userData } = user;
      res.status(200).json(userData);
    } catch (err) {
      console.error('Failed to fetch user by ID:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();
