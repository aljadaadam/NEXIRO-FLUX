const { verifyToken } = require('../utils/token');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token مطلوب للمصادقة' });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Token غير صالح أو منتهي' });
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
    site_key: decoded.site_key,
    is_platform_admin: !!decoded.is_platform_admin
  };

  // Ensure siteKey is always set (from token if not from domain)
  if (!req.siteKey) {
    req.siteKey = decoded.site_key;
  }
  
  next();
}

// ─── التحقق من صلاحية الدور ───
// يُستخدم بعد authenticateToken — users table: admin/user | customers token: customer
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

// ─── التحقق من أن المستخدم أدمن المنصة الرئيسية NEXIRO-FLUX ───
// يعتمد على حقل is_platform_admin في التوكن (مصدره من قاعدة البيانات)
// لا يعتمد على site_key — لأن أدمن موقع فرعي يملك role=admin لكن is_platform_admin=false
// هذا الفصل يمنع أي أدمن موقع فرعي من الوصول لمسارات المنصة الرئيسية

function requirePlatformAdmin(req, res, next) {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
  }
  if (!req.user.is_platform_admin) {
    console.warn(`[authMiddleware] ⚠ Non-platform admin attempted platform access: user_id=${req.user.id}, site_key=${req.user.site_key}, is_platform_admin=${req.user.is_platform_admin}`);
    return res.status(403).json({ error: 'غير مصرح — هذا المسار متاح فقط لأدمن المنصة الرئيسية' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  requirePlatformAdmin
};