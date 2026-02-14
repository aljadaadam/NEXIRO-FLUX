const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getAllCustomers,
  toggleBlockCustomer,
  updateCustomerWallet
} = require('../controllers/customerController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// ===== واجهة الزبائن (بدون مصادقة أدمن) =====
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// ===== واجهة الأدمن =====
router.get('/', authenticateToken, getAllCustomers);
router.patch('/:id/block', authenticateToken, toggleBlockCustomer);
router.patch('/:id/wallet', authenticateToken, updateCustomerWallet);

module.exports = router;
