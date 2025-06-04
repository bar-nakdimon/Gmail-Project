const userService = require('../services/UserService');

/**
 * Extract user ID from request headers and verify it exists in users list.
 * Returns the user ID as number if valid, otherwise null.
 * @param {Object} req - Express request object
 * @returns {Promise<number|null>}
 */
async function getUserIdFromRequest(req) {
  const idStr = req.headers['x-user-id'];
  if (!idStr) return null;

  const id = parseInt(idStr, 10);
  if (isNaN(id)) return null;

  const user = await userService.getUserById(id);
  if (!user) return null;

  return id;
}

module.exports = { getUserIdFromRequest };
