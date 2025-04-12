const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token missing or malformed' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
