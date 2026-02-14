const express = require('express');
const router = express.Router();
const { provisionSite, getMySite, updateSiteSettings } = require('../controllers/setupController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── إنشاء موقع جديد (بدون مصادقة — أول خطوة بعد الشراء) ───
router.post('/provision', provisionSite);

// ─── الطلبات التالية تحتاج مصادقة ───
router.use(validateSite);

// جلب بيانات الموقع الخاص بالمستخدم
router.get('/my-site', authenticateToken, getMySite);

// تحديث إعدادات الموقع
router.put('/my-site', authenticateToken, updateSiteSettings);

module.exports = router;
