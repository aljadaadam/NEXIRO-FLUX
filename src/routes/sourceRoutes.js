const express = require('express');
const router = express.Router();
const { 
  getAllSources, 
  createSource, 
  updateSource, 
  deleteSource,
  syncSourceProducts,
  testSourceConnection,
  getSourceStats,
  applyProfitToSourceProducts
} = require('../controllers/sourceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// جلب جميع المصادر
router.get('/', authenticateToken, getAllSources);

// إنشاء مصدر جديد
router.post('/', authenticateToken, createSource);

// تحديث مصدر
router.put('/:id', authenticateToken, updateSource);

// إحصائيات مصدر (عدد المنتجات + حالة الاتصال)
router.get('/:id/stats', authenticateToken, getSourceStats);

// اختبار اتصال المصدر (يرفع lastConnection* في DB)
router.post('/:id/test', authenticateToken, testSourceConnection);

// حذف مصدر
router.delete('/:id', authenticateToken, deleteSource);

// مزامنة منتجات مصدر
router.post('/:id/sync', authenticateToken, syncSourceProducts);

// تطبيق نسبة ربح جديدة على كل منتجات المصدر (بدون تراكم)
router.post('/:id/apply-profit', authenticateToken, applyProfitToSourceProducts);

module.exports = router;
