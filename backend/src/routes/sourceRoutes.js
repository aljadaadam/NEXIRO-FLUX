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
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// جلب جميع المصادر
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllSources);

// إنشاء مصدر جديد
router.post('/', authenticateToken, requireRole('admin', 'user'), createSource);

// تحديث مصدر
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updateSource);

// إحصائيات مصدر (عدد المنتجات + حالة الاتصال)
router.get('/:id/stats', authenticateToken, requireRole('admin', 'user'), getSourceStats);

// اختبار اتصال المصدر (يرفع lastConnection* في DB)
router.post('/:id/test', authenticateToken, requireRole('admin', 'user'), testSourceConnection);

// حذف مصدر
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deleteSource);

// مزامنة منتجات مصدر
router.post('/:id/sync', authenticateToken, requireRole('admin', 'user'), syncSourceProducts);

// تطبيق نسبة ربح جديدة على كل منتجات المصدر (بدون تراكم)
router.post('/:id/apply-profit', authenticateToken, requireRole('admin', 'user'), applyProfitToSourceProducts);

module.exports = router;
