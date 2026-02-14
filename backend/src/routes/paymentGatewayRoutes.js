const express = require('express');
const router = express.Router();
const {
  getAllGateways,
  getEnabledGateways,
  createGateway,
  updateGateway,
  deleteGateway,
  toggleGateway,
} = require('../controllers/paymentGatewayController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── Public: جلب البوابات المفعّلة (حسب الدولة) ───
router.get('/enabled', getEnabledGateways);

// ─── Protected routes ───
router.use(validateSite);

// جلب جميع البوابات (أدمن)
router.get('/', authenticateToken, getAllGateways);

// إنشاء بوابة جديدة
router.post('/', authenticateToken, createGateway);

// تحديث بوابة
router.put('/:id', authenticateToken, updateGateway);

// تبديل حالة بوابة
router.patch('/:id/toggle', authenticateToken, toggleGateway);

// حذف بوابة
router.delete('/:id', authenticateToken, deleteGateway);

module.exports = router;
