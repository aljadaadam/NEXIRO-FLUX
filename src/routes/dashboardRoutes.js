const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// جلب إحصائيات لوحة التحكم (للأدمن فقط)
router.get('/stats', authenticateToken, getDashboardStats);

module.exports = router;