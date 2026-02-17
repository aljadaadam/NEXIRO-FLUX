const express = require('express');
const router = express.Router();
const {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getPublicCustomization,
  getStoreCustomization,
  verifyAdminSlug
} = require('../controllers/customizationController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ===== واجهة عامة (للمتجر بدون مصادقة) =====
router.get('/public/:site_key', getPublicCustomization);
router.get('/store', getStoreCustomization);
router.get('/verify-slug/:slug', verifyAdminSlug);

// ===== واجهة الأدمن =====
router.use(validateSite);
router.get('/', authenticateToken, requireRole('admin', 'user'), getCustomization);
router.put('/', authenticateToken, requireRole('admin', 'user'), updateCustomization);
router.delete('/', authenticateToken, requireRole('admin', 'user'), resetCustomization);

module.exports = router;
