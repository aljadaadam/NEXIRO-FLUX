const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  createPayment,
  updatePaymentStatus,
  getPaymentStats,
  getPaymentById
} = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// ===== جميع مسارات /api/payments مخصصة للأدمن فقط =====
// الزبائن يستخدمون /api/customers/payments

// جلب جميع المدفوعات (أدمن)
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllPayments);

// إحصائيات المدفوعات
router.get('/stats', authenticateToken, requireRole('admin', 'user'), getPaymentStats);

// جلب دفعة بالـ ID
router.get('/:id', authenticateToken, requireRole('admin', 'user'), getPaymentById);

// إنشاء عملية دفع (أدمن)
router.post('/', authenticateToken, requireRole('admin', 'user'), createPayment);

// تحديث حالة الدفع (أدمن فقط — لا يسمح للمستخدم العادي)
router.patch('/:id/status', authenticateToken, requireRole('admin'), updatePaymentStatus);

module.exports = router;
