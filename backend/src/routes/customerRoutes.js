const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  verifyOtp,
  getMyCustomerProfile,
  updateMyCustomerProfile,
  getAllCustomers,
  toggleBlockCustomer,
  updateCustomerWallet,
  uploadIdentityDocument,
  getCustomerNotifications,
  markCustomerNotificationRead,
  updateCustomerVerification,
} = require('../controllers/customerController');
const { getAllOrders, createOrder } = require('../controllers/orderController');
const { getAllPayments, createPayment } = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// ===== واجهة الزبائن (بدون مصادقة) =====
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/verify-otp', verifyOtp);

// ===== ملف الزبون (يتطلب توكن زبون) =====
router.get('/me', authenticateToken, requireRole('customer'), getMyCustomerProfile);
router.put('/me', authenticateToken, requireRole('customer'), updateMyCustomerProfile);
router.post('/me/identity', authenticateToken, requireRole('customer'), uploadIdentityDocument);

// ===== إشعارات الزبون =====
router.get('/notifications', authenticateToken, requireRole('customer'), getCustomerNotifications);
router.patch('/notifications/:id/read', authenticateToken, requireRole('customer'), markCustomerNotificationRead);

// ===== طلبات الزبون (/api/customers/orders) — مسارات فريدة للزبائن =====
router.get('/orders', authenticateToken, requireRole('customer'), getAllOrders);
router.post('/orders', authenticateToken, requireRole('customer'), createOrder);

// ===== مدفوعات الزبون (/api/customers/payments) — مسارات فريدة للزبائن =====
router.get('/payments', authenticateToken, requireRole('customer'), getAllPayments);
router.post('/payments', authenticateToken, requireRole('customer'), createPayment);

// ===== واجهة الأدمن لإدارة الزبائن =====
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllCustomers);
router.patch('/:id/block', authenticateToken, requireRole('admin', 'user'), toggleBlockCustomer);
router.patch('/:id/wallet', authenticateToken, requireRole('admin', 'user'), updateCustomerWallet);
router.patch('/:id/verification', authenticateToken, requireRole('admin', 'user'), updateCustomerVerification);

module.exports = router;
