const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  createPayment,
  updatePaymentStatus,
  getPaymentStats,
  getPaymentById
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب جميع المدفوعات (أدمن)
router.get('/', authenticateToken, getAllPayments);

// إحصائيات المدفوعات
router.get('/stats', authenticateToken, getPaymentStats);

// جلب دفعة بالـ ID
router.get('/:id', authenticateToken, getPaymentById);

// إنشاء عملية دفع
router.post('/', authenticateToken, createPayment);

// تحديث حالة الدفع
router.patch('/:id/status', authenticateToken, updatePaymentStatus);

module.exports = router;
