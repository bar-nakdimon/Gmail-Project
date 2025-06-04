const { getUserIdFromRequest } = require('../utils/authHelper');

/**
 * Middleware to check and attach authenticated userId to the request object.
 * If userId missing or invalid, responds with 401 Unauthorized.
 */
async function authenticateUser(req, res, next) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid user ID' });
  }
  req.userId = userId;  // Attach userId to request for later use
  next();
}

module.exports = authenticateUser;
