function authorizeTenant(req, res, next) {
  // تأكد من أن المستخدم مصادق عليه أولاً
  if (!req.user) {
    return res.status(401).json({ error: 'يجب المصادقة أولاً' });
  }

  const userSiteId = req.user.site_id;
  
  if (!userSiteId) {
    return res.status(403).json({ error: 'لا يمكن الوصول: غير مرتبط بموقع' });
  }

  // تحقق من أن المستخدم يحاول الوصول إلى بيانات موقعه فقط
  if (req.params.site_id && parseInt(req.params.site_id) !== userSiteId) {
    return res.status(403).json({ error: 'غير مصرح بالوصول إلى بيانات هذا الموقع' });
  }

  // تمرير site_id إلى الـ controller
  req.site_id = userSiteId;
  
  next();
}

// ميدلوير للتحقق من صلاحيات الأدمن
function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'هذا الإجراء يحتاج صلاحيات أدمن' });
  }
  next();
}

// ميدلوير للتحقق من صلاحيات الأدمن أو المستخدم العادي
function authorizeUserOrAdmin(req, res, next) {
  const userId = parseInt(req.params.id);
  
  // إذا كان المستخدم يحاول الوصول لبياناته أو كان أدمن في نفس الموقع
  if (req.user.id === userId || req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'غير مصرح بالوصول إلى هذه البيانات' });
}

module.exports = {
  authorizeTenant,
  authorizeAdmin,
  authorizeUserOrAdmin
};