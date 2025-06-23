const { verifyToken } = require('../utils/authHelper'); 

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }

  req.user = user;
  req.userId = user.userId;
  next();
}

module.exports = authenticateUser;
