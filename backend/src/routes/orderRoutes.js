const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getOrderStats,
  placeExternalOrder,
  checkExternalOrderStatus,
  bulkCheckExternalOrders
} = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب الطلبات (أدمن)
router.get('/', authenticateToken, getAllOrders);

// إحصائيات الطلبات
router.get('/stats', authenticateToken, getOrderStats);

// فحص جماعي لحالة الطلبات المعلقة
router.post('/bulk-check', authenticateToken, bulkCheckExternalOrders);

// إنشاء طلب
router.post('/', authenticateToken, createOrder);

// إرسال طلب إلى المصدر الخارجي (DHRU FUSION)
router.post('/:id/place-external', authenticateToken, placeExternalOrder);

// متابعة حالة طلب من المصدر الخارجي
router.get('/:id/external-status', authenticateToken, checkExternalOrderStatus);

// تحديث حالة الطلب
router.patch('/:id/status', authenticateToken, updateOrderStatus);

module.exports = router;
