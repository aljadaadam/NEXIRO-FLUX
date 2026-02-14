const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  importProducts,
  syncProducts,
  importFromExternalApi,
  getProductsStats,
  getPublicProducts,
  seedTemplateProducts
} = require('../controllers/productController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');

// ─── Public (بدون مصادقة) ───
router.get('/public', getPublicProducts);

// ─── تعبئة القوالب الافتراضية (بدون مصادقة — يُنفَّذ مرة واحدة) ───
router.get('/seed-templates', seedTemplateProducts);

// التحقق من الموقع قبل أي عملية
router.use(validateSite);

// جلب جميع منتجات الموقع (يحتاج صلاحية products:read)
router.get('/', authenticateToken, checkPermission('products:read'), getAllProducts);

// جلب إحصائيات المنتجات (يحتاج صلاحية products:read)
router.get('/stats', authenticateToken, checkPermission('products:read'), getProductsStats);

// إنشاء منتج جديد (يحتاج صلاحية products:create)
router.post('/', authenticateToken, checkPermission('products:create'), createProduct);

// ============================================
// 1️⃣ SYNC (مزامنة Dashboard ↔ Backend)
// ============================================
// الهدف: مزامنة بين Dashboard والمنتجات في Backend
// الطريقة: جلب/عرض المنتجات الموجودة من Database
// Request: جلب بسيط (GET) أو تحديث
// مثال: GET /api/products/sync ترجع المنتجات الموجودة
router.get('/sync', authenticateToken, checkPermission('products:read'), getAllProducts);

// ============================================
// 2️⃣ IMPORT (استيراد من مصدر خارجي)
// ============================================
// الهدف: جلب منتجات من API خارجي وحفظها
// يدعم:
//   - استيراد مباشر (منتجات جاهزة من Dashboard)
//   - استيراد من unlock-world.net
//   - استيراد من SD-Unlocker
//   - استيراد من أي API خارجي آخر
// اختر المسار المناسب حسب مصدر البيانات:

// استيراد من dashboard (منتجات جاهزة)
router.post('/import', authenticateToken, checkPermission('products:create'), importProducts);

// استيراد من أي API خارجي عام
router.post('/import/sync', authenticateToken, checkPermission('products:sync'), syncProducts);

// استيراد متخصص من SD-Unlocker
router.post('/import/sd-unlocker', authenticateToken, checkPermission('products:sync'), importFromExternalApi);

// استيراد من مصدر خارجي (اسم بديل عام)
router.post('/import-external', authenticateToken, checkPermission('products:sync'), syncProducts);

// تحديث منتج (يحتاج صلاحية products:update)
router.put('/:id', authenticateToken, checkPermission('products:update'), updateProduct);

// حذف منتج (يحتاج صلاحية products:delete)
router.delete('/:id', authenticateToken, checkPermission('products:delete'), deleteProduct);

module.exports = router;