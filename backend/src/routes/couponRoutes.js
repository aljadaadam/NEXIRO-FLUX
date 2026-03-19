const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// Public: validate coupon code
router.post('/validate', validateSite, validateCoupon);

// Admin routes
router.use(validateSite);
router.get('/', authenticateToken, requireRole('admin'), getCoupons);
router.post('/', authenticateToken, requireRole('admin'), createCoupon);
router.put('/:id', authenticateToken, requireRole('admin'), updateCoupon);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteCoupon);

module.exports = router;
