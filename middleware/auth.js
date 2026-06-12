const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getTokenFromHeaderOrCookie = (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.split(' ')[1];
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
  return null;
};

const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromHeaderOrCookie(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token user' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden: role required: ' + role });
  next();
};

module.exports = { authenticate, requireRole };
