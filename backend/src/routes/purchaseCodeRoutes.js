const express = require('express');
const router = express.Router();
const {
  validateCode,
  getAllCodes,
  createCode,
  createBatch,
  updateCode,
  deleteCode,
  getCodeStats,
} = require('../controllers/purchaseCodeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// ─── عام (بدون مصادقة) — للتحقق من الكود أثناء الشراء ───
router.post('/validate', validateCode);

// ─── باقي الطلبات تحتاج مصادقة + صلاحيات أدمن المنصة ───
router.use(authenticateToken);

// جلب جميع الأكواد
router.get('/', getAllCodes);

// إحصائيات
router.get('/stats', getCodeStats);

// إنشاء كود واحد
router.post('/', createCode);

// إنشاء أكواد متعددة
router.post('/batch', createBatch);

// تحديث كود
router.put('/:id', updateCode);

// حذف كود
router.delete('/:id', deleteCode);

module.exports = router;
