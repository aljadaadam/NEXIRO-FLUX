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

  // ─── Dynamic tenant check ───
  // If resolveTenant set req.siteKey, verify token matches it
  // Otherwise fall back to SITE_KEY from env
  const expectedSiteKey = req.siteKey || SITE_KEY;

  if (expectedSiteKey && expectedSiteKey !== 'default-site-key' && decoded.site_key !== expectedSiteKey) {
    return res.status(403).json({ 
      error: 'غير مصرح بالوصول: site_key غير مطابق' 
    });
  }

  req.user = { 
    id: decoded.id,
    role: decoded.role,
    site_key: decoded.site_key 
  };

  // Ensure siteKey is always set (from token if not from domain)
  if (!req.siteKey) {
    req.siteKey = decoded.site_key;
  }
  
  next();
}

// ─── التحقق من صلاحية الدور (admin, user, customer) ───
// يُستخدم بعد authenticateToken لضمان فصل مسارات الأدمن عن الزبائن
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'غير مصرح بالوصول لهذا المسار' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};