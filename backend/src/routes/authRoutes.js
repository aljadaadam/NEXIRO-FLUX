const express = require('express');
const router = express.Router();
const { 
  registerAdmin,
  registerUser,
  login, 
  googleLogin,
  createUser, 
  getMyProfile,
  getSiteUsers,
  getUserPermissions,
  grantPermission,
  revokePermission,
  getAllPermissions,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// تسجيل مستخدم جديد (حساب عادي - ليس أدمن)
router.post('/register', registerUser);

// تسجيل أدمن جديد للموقع (يُستخدم من setup wizard فقط)
router.post('/register-admin', registerAdmin);

// تسجيل الدخول
router.post('/login', login);

// تسجيل الدخول عبر Google OAuth
router.post('/google', googleLogin);

// نسيت كلمة المرور
router.post('/forgot-password', forgotPassword);

// إعادة تعيين كلمة المرور
router.post('/reset-password', resetPassword);

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