const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production environment.');
  }
  return 'biowaste-dev-secret-change-me';
}

const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '12h';

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    getJwtSecret(),
    { expiresIn: TOKEN_TTL }
  );
}

// Verifies the Bearer token and attaches { id, role, name } to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch (err) {
    if (err.message && err.message.includes('JWT_SECRET')) {
      return res.status(500).json({ message: 'Server authentication misconfigured. Please set JWT_SECRET.' });
    }
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole };
