const { verifyToken } = require('../utils/token');
const { SITE_KEY } = require('../config/env');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token مطلوب للمصادقة' });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(403).json({ error: 'Token غير صالح أو منتهي' });
  }

  // التحقق من أن site_key في التوكن يطابق SITE_KEY في ملف .env
  if (decoded.site_key !== SITE_KEY) {
    return res.status(403).json({ 
      error: 'غير مصرح بالوصول: site_key غير مطابق' 
    });
  }

  req.user = { 
    id: decoded.id,
    role: decoded.role,
    site_key: decoded.site_key 
  };
  
  next();
}

module.exports = {
  authenticateToken
};