const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getOrderStats
} = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب الطلبات (أدمن)
router.get('/', authenticateToken, getAllOrders);

// إحصائيات الطلبات
router.get('/stats', authenticateToken, getOrderStats);

// إنشاء طلب
router.post('/', authenticateToken, createOrder);

// تحديث حالة الطلب
router.patch('/:id/status', authenticateToken, updateOrderStatus);

module.exports = router;
