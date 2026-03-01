const Permission = require('../models/Permission');

/**
 * Middleware للتحقق من صلاحيات المستخدم
 * @param {string|string[]} requiredPermissions - الصلاحية أو الصلاحيات المطلوبة
 * 
 * الأدمن لديه كل الصلاحيات تلقائياً
 * المستخدم العادي (user/employee) يتم فحص صلاحياته من قاعدة البيانات
 */
function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      const { id: userId, role } = req.user;

      // الأدمن لديه كل الصلاحيات تلقائياً
      if (role === 'admin') return next();

      // دور 'user' (موظف) — فحص الصلاحيات المحددة من قاعدة البيانات
      if (role === 'user') {
        const permissions = typeof requiredPermissions === 'string'
          ? [requiredPermissions]
          : requiredPermissions;

        const userPerms = await Permission.findByUserId(userId);
        const userPermKeys = userPerms.map(p => p.name || p.permission_key || p.key);

        const hasAll = permissions.every(p => userPermKeys.includes(p));
        if (!hasAll) {
          return res.status(403).json({
            error: 'ليس لديك الصلاحية المطلوبة لهذا الإجراء'
          });
        }

        return next();
      }

      // أي دور آخر — ليس لديه صلاحيات إدارية
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن أو موظف' 
      });
    } catch (error) {
      console.error('Error in checkPermission middleware:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء التحقق من الصلاحيات' 
      });
    }
  };
}

module.exports = {
  checkPermission
};
