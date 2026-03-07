const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getPublicCustomization,
  getStoreCustomization,
  verifyAdminSlug
} = require('../controllers/customizationController');
const {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const BannerTemplate = require('../models/BannerTemplate');
const Banner = require('../models/Banner');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// Rate limiter for slug verification to prevent brute-force
const slugLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' },
});

// ===== واجهة عامة (للمتجر بدون مصادقة) =====
router.get('/public/:site_key', getPublicCustomization);
router.get('/store', getStoreCustomization);
router.get('/verify-slug/:slug', slugLimiter, verifyAdminSlug);
router.get('/banners/active', getActiveBanners);

// ===== واجهة الأدمن =====
router.use(validateSite);
router.get('/', authenticateToken, requireRole('admin', 'user'), getCustomization);
router.put('/', authenticateToken, requireRole('admin', 'user'), updateCustomization);
router.delete('/', authenticateToken, requireRole('admin'), resetCustomization);

// ===== البانرات (أدمن) =====
router.get('/banners', authenticateToken, requireRole('admin', 'user'), getBanners);
router.post('/banners', authenticateToken, requireRole('admin', 'user'), createBanner);
router.put('/banners/:id', authenticateToken, requireRole('admin', 'user'), updateBanner);
router.delete('/banners/:id', authenticateToken, requireRole('admin', 'user'), deleteBanner);

// ===== متجر البنرات (تصفح + تثبيت) =====
router.get('/banner-store', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const templates = await BannerTemplate.findActive();
    // جلب البنرات المثبتة حالياً للمقارنة
    const { site_key } = req.user;
    const installed = await Banner.findBySiteKey(site_key);
    const installedTemplateIds = installed
      .filter(b => b.template_id)
      .map(b => b.template_id);
    // خريطة template_id → banner_id للحذف من المتجر
    const templateBannerMap = {};
    installed.filter(b => b.template_id).forEach(b => { templateBannerMap[b.template_id] = b.id; });
    res.json({ templates, installedTemplateIds, templateBannerMap });
  } catch (err) {
    console.error('Error fetching banner store:', err);
    res.status(500).json({ error: 'فشل في جلب متجر البنرات' });
  }
});

router.post('/banner-store/install/:templateId', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const { site_key } = req.user;
    const template = await BannerTemplate.findById(req.params.templateId);
    if (!template || !template.is_active) {
      return res.status(404).json({ error: 'القالب غير موجود أو غير متاح' });
    }
    const design = typeof template.design_data === 'string' ? JSON.parse(template.design_data) : template.design_data;
    // إنشاء بنر جديد من القالب
    const banner = await Banner.create(site_key, {
      title: design.title || template.name,
      subtitle: design.subtitle || '',
      description: design.description || '',
      icon: design.icon || '🚀',
      image_url: design.image_url || template.preview_image || '',
      link: design.link || '',
      extra_data: JSON.stringify({ badges: design.badges || [], gradient: design.gradient || '' }),
      is_active: true,
      sort_order: 0,
      template_id: template.id,
    });
    res.status(201).json({ message: 'تم تثبيت البنر بنجاح', banner });
  } catch (err) {
    console.error('Error installing banner:', err);
    res.status(500).json({ error: 'فشل في تثبيت البنر' });
  }
});

module.exports = router;
