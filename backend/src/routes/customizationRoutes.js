const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getPublicCustomization,
  getStoreCustomization,
  verifyAdminSlug
} = require('../controllers/customizationController');
const {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// Rate limiter for slug verification to prevent brute-force
const slugLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' },
});

// ===== واجهة عامة (للمتجر بدون مصادقة) =====
router.get('/public/:site_key', getPublicCustomization);
router.get('/store', getStoreCustomization);
router.get('/verify-slug/:slug', slugLimiter, verifyAdminSlug);
router.get('/banners/active', getActiveBanners);

// ===== واجهة الأدمن =====
router.use(validateSite);
router.get('/', authenticateToken, requireRole('admin', 'user'), getCustomization);
router.put('/', authenticateToken, requireRole('admin', 'user'), updateCustomization);
router.delete('/', authenticateToken, requireRole('admin', 'user'), resetCustomization);

// ===== البانرات (أدمن) =====
router.get('/banners', authenticateToken, requireRole('admin', 'user'), getBanners);
router.post('/banners', authenticateToken, requireRole('admin', 'user'), createBanner);
router.put('/banners/:id', authenticateToken, requireRole('admin', 'user'), updateBanner);
router.delete('/banners/:id', authenticateToken, requireRole('admin', 'user'), deleteBanner);

module.exports = router;
