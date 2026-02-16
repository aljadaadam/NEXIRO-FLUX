const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivities, getPlatformStats } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// إحصائيات المنصة الرئيسية (بدون validateSite — يجلب بيانات كل المواقع)
router.get('/platform-stats', authenticateToken, getPlatformStats);

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// جلب إحصائيات لوحة التحكم (للأدمن فقط)
router.get('/stats', authenticateToken, getDashboardStats);

// جلب آخر النشاطات
router.get('/activities', authenticateToken, getRecentActivities);

module.exports = router;