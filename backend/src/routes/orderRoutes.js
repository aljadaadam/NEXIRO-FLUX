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
const { getCronStatus, checkPendingOrders } = require('../services/orderCron');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// ===== جميع مسارات /api/orders مخصصة للأدمن فقط =====
// الزبائن يستخدمون /api/customers/orders

// جلب الطلبات (أدمن)
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllOrders);

// إحصائيات الطلبات
router.get('/stats', authenticateToken, requireRole('admin', 'user'), getOrderStats);

// حالة كرون فحص الطلبات
router.get('/cron-status', authenticateToken, requireRole('admin'), (req, res) => {
  res.json(getCronStatus());
});

// تشغيل فحص يدوي (بدون انتظار الكرون)
router.post('/cron-run', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await checkPendingOrders();
    res.json({ success: true, message: 'تم تشغيل فحص الطلبات', ...getCronStatus() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
