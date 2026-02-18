const express = require('express');
const router = express.Router();
const {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency
} = require('../controllers/currencyController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// عملات الموقع
router.get('/', authenticateToken, requireRole('admin', 'user'), getCurrencies);
router.post('/', authenticateToken, requireRole('admin', 'user'), createCurrency);
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updateCurrency);
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deleteCurrency);

module.exports = router;
