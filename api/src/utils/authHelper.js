const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Creates a JWT token for a given user.
 * The token payload contains user's id and username.
 * The token expires in 1 hour.
 * 
 * @param {Object} user - User object with at least id and username properties
 * @returns {string} - Signed JWT token
 */
function createToken(user) {
  return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
}

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 * Returns null if the token is invalid or expired.
 * 
 * @param {string} token - JWT token string
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.warn('JWT verification failed:', err.message);
    return null;
  }
}

module.exports = { createToken, verifyToken };
