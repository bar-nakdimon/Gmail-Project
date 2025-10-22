const { verifyToken } = require('../utils/authHelper');

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded.userId !== 'number') {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }

  req.user = decoded;
  req.userId = decoded.userId;
  next();
}

module.exports = authenticateUser;
