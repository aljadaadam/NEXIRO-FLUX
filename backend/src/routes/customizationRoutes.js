const express = require('express');
const router = express.Router();
const {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getPublicCustomization
} = require('../controllers/customizationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ===== واجهة عامة (للمتجر بدون مصادقة) =====
router.get('/public/:site_key', getPublicCustomization);

// ===== واجهة الأدمن =====
router.use(validateSite);
router.get('/', authenticateToken, getCustomization);
router.put('/', authenticateToken, updateCustomization);
router.delete('/', authenticateToken, resetCustomization);

module.exports = router;
