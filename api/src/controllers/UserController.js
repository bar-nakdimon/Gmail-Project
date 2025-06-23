const userService = require('../services/UserService');

class UserController {
  /**
   * Handles user registration (POST /api/users).
   * Saves uploaded avatar with a generated filename, or assigns a default avatar.
   */
  async register(req, res) {
    const { username, password, name } = req.body;
    const avatar = req.file;

    // Basic input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    if (userService.getUserByUsername(username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Determine avatar URL:
    // If an image was uploaded, use the saved file; otherwise use the default SVG
    const avatarUrl = avatar
      ? `http://localhost:3000/uploads/${avatar.filename}`
      : `http://localhost:3000/uploads/default-avatar.svg`;

    // Create user and return data (excluding password)
    try {
      const user = userService.registerUser({ username, password, name, avatarUrl });
      const { password: pwd, ...userData } = user;
      res.status(201).json(userData);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves user details by ID (GET /api/users/:id).
   * Excludes password from the response.
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
