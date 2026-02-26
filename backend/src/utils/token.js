const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

function generateToken(userId, role, site_key, is_platform_admin = false) {
  return jwt.sign(
    { 
      id: userId,
      role: role,
      site_key: site_key,
      is_platform_admin: !!is_platform_admin
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};