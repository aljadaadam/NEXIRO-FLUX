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
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// ===== جميع مسارات /api/orders مخصصة للأدمن فقط =====
// الزبائن يستخدمون /api/customers/orders

// جلب الطلبات (أدمن)
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllOrders);

// إحصائيات الطلبات
router.get('/stats', authenticateToken, requireRole('admin', 'user'), getOrderStats);

// فحص جماعي لحالة الطلبات المعلقة
router.post('/bulk-check', authenticateToken, requireRole('admin', 'user'), bulkCheckExternalOrders);

// إنشاء طلب (من الأدمن)
router.post('/', authenticateToken, requireRole('admin', 'user'), createOrder);

// إرسال طلب إلى المصدر الخارجي (DHRU FUSION)
router.post('/:id/place-external', authenticateToken, requireRole('admin', 'user'), placeExternalOrder);

// متابعة حالة طلب من المصدر الخارجي
router.get('/:id/external-status', authenticateToken, requireRole('admin', 'user'), checkExternalOrderStatus);

// تحديث حالة الطلب
router.patch('/:id/status', authenticateToken, requireRole('admin', 'user'), updateOrderStatus);

module.exports = router;
