const userService = require('../services/UserService');

class UserController {
   /**
   * Handles user registration (POST /api/users).
   * Validates input, registers user, and returns user data excluding password.
   */
  async register(req, res) {
    const { username, password, name, avatarUrl } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const user = userService.registerUser({ username, password, name, avatarUrl });

      // Exclude password from response
      const { password: pwd, ...userData } = user;


      res.status(201).json(userData);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
   /**
   * Retrieves user details by ID (GET /api/users/:id).
   * Excludes password from response.
   */
  getUserById(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: pwd, ...userData } = user;

    res.status(200).json(userData);
  }
}

module.exports = new UserController();
