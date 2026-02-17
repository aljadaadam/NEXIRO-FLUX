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
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// ===== مسارات عامة (بدون مصادقة) =====
router.post('/login', login);
router.post('/register-admin', registerAdmin); // محمي: يعمل فقط إذا لا يوجد أدمن مسجل
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ===== مسارات الأدمن فقط (توكن أدمن/يوزر — ليس زبون) =====
router.post('/register', authenticateToken, requireRole('admin'), registerUser); // فقط الأدمن يقدر يسجل مستخدمين
router.post('/users', authenticateToken, requireRole('admin'), createUser);
router.get('/profile', authenticateToken, requireRole('admin', 'user'), getMyProfile);
router.get('/users', authenticateToken, requireRole('admin'), getSiteUsers);

// ===== إدارة الصلاحيات (أدمن فقط) =====
router.get('/permissions', authenticateToken, requireRole('admin'), getAllPermissions);
router.get('/users/:userId/permissions', authenticateToken, requireRole('admin'), getUserPermissions);
router.post('/permissions/grant', authenticateToken, requireRole('admin'), grantPermission);
router.post('/permissions/revoke', authenticateToken, requireRole('admin'), revokePermission);

module.exports = router;