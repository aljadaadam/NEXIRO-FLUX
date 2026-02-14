const express = require('express');
const router = express.Router();
const { 
  registerAdmin, 
  login, 
  createUser, 
  getMyProfile,
  getSiteUsers,
  getUserPermissions,
  grantPermission,
  revokePermission,
  getAllPermissions
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// تسجيل أدمن جديد للموقع
router.post('/register-admin', registerAdmin);

// تسجيل الدخول
router.post('/login', login);

// إنشاء مستخدم جديد (تتطلب توكن أدمن)
router.post('/users', authenticateToken, createUser);

// الحصول على بيانات الملف الشخصي (تتطلب توكن)
router.get('/profile', authenticateToken, getMyProfile);

// الحصول على جميع مستخدمي الموقع (للأدمن فقط)
router.get('/users', authenticateToken, getSiteUsers);

// ===== إدارة الصلاحيات =====

// الحصول على جميع الصلاحيات المتاحة
router.get('/permissions', authenticateToken, getAllPermissions);

// الحصول على صلاحيات مستخدم معين (للأدمن فقط)
router.get('/users/:userId/permissions', authenticateToken, getUserPermissions);

// منح صلاحية لمستخدم (للأدمن فقط)
router.post('/permissions/grant', authenticateToken, grantPermission);

// إلغاء صلاحية من مستخدم (للأدمن فقط)
router.post('/permissions/revoke', authenticateToken, revokePermission);

module.exports = router;