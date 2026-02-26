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
  applyProfitToSourceProducts,
  toggleSyncOnly
} = require('../controllers/sourceController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// جلب جميع المصادر
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllSources);

// إنشاء مصدر جديد (أدمن فقط — عملية حساسة)
router.post('/', authenticateToken, requireRole('admin'), createSource);

// تحديث مصدر
router.put('/:id', authenticateToken, requireRole('admin'), updateSource);

// إحصائيات مصدر (عدد المنتجات + حالة الاتصال)
router.get('/:id/stats', authenticateToken, requireRole('admin', 'user'), getSourceStats);

// اختبار اتصال المصدر (يرفع lastConnection* في DB)
router.post('/:id/test', authenticateToken, requireRole('admin', 'user'), testSourceConnection);

// حذف مصدر (أدمن فقط)
router.delete('/:id', authenticateToken, requireRole('admin'), deleteSource);

// مزامنة منتجات مصدر
router.post('/:id/sync', authenticateToken, requireRole('admin', 'user'), syncSourceProducts);

// تطبيق نسبة ربح جديدة (أدمن فقط — يؤثر على الأسعار)
router.post('/:id/apply-profit', authenticateToken, requireRole('admin'), applyProfitToSourceProducts);

// تبديل وضع المزامنة فقط (إخفاء/إظهار المنتجات للزبائن)
router.patch('/:id/sync-only', authenticateToken, requireRole('admin', 'user'), toggleSyncOnly);

module.exports = router;
