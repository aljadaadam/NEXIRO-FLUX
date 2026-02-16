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
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── Public: جلب البوابات المفعّلة (حسب الدولة) ───
router.get('/enabled', getEnabledGateways);

// ─── Protected routes ───
router.use(validateSite);

// جلب جميع البوابات (أدمن)
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllGateways);

// إنشاء بوابة جديدة
router.post('/', authenticateToken, requireRole('admin', 'user'), createGateway);

// تحديث بوابة
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updateGateway);

// تبديل حالة بوابة
router.patch('/:id/toggle', authenticateToken, requireRole('admin', 'user'), toggleGateway);

// حذف بوابة
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deleteGateway);

module.exports = router;
