const { verifyToken } = require('../utils/token');

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
  // إذا resolveTenant حدد الموقع — تأكد أن التوكن تابع لنفس الموقع
  // إذا لم يُحدد (سيناريو نادر) — نعتمد على site_key في التوكن نفسه
  const expectedSiteKey = req.siteKey;

  if (expectedSiteKey && decoded.site_key !== expectedSiteKey) {
    console.warn(`[authMiddleware] ⚠ site_key mismatch: token=${decoded.site_key}, expected=${expectedSiteKey}`);
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