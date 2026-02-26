const express = require('express');
const router = express.Router();
const { 
  provisionSite, getMySite, updateSiteSettings,
  updateCustomDomain, removeCustomDomain, verifyDomainDNS, checkDomainDNS, getSiteByDomain
} = require('../controllers/setupController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── إنشاء موقع جديد (بدون مصادقة — أول خطوة بعد الشراء) ───
router.post('/provision', provisionSite);

// ─── جلب بيانات موقع من الدومين (عام — بدون مصادقة) ───
router.get('/site-by-domain/:domain', getSiteByDomain);

// ─── التحقق من DNS لدومين (عام — يُستخدم في معالج الإعداد) ───
router.get('/check-dns/:domain', checkDomainDNS);

// ─── الطلبات التالية تحتاج مصادقة ───
router.use(validateSite);

// جلب بيانات الموقع الخاص بالمستخدم
router.get('/my-site', authenticateToken, requireRole('admin', 'user'), getMySite);

// تحديث إعدادات الموقع
router.put('/my-site', authenticateToken, requireRole('admin'), updateSiteSettings);

// ─── إدارة الدومين المخصص ───
router.put('/my-site/domain', authenticateToken, requireRole('admin'), updateCustomDomain);
router.delete('/my-site/domain', authenticateToken, requireRole('admin'), removeCustomDomain);
router.get('/my-site/verify-dns', authenticateToken, requireRole('admin'), verifyDomainDNS);

module.exports = router;
