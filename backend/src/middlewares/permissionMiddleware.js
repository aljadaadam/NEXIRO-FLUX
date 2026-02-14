const Permission = require('../models/Permission');

/**
 * Middleware للتحقق من صلاحيات المستخدم
 * @param {string|string[]} requiredPermissions - الصلاحية أو الصلاحيات المطلوبة
 */
function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      const { id: userId, role } = req.user;

      // إذا كان المستخدم ليس أدمن، لا يملك صلاحيات
      if (role !== 'admin') {
        return res.status(403).json({ 
          error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
        });
      }

      // الأدمن لديه كل الصلاحيات تلقائياً — لا حاجة لفحص جدول permissions
      next();
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
