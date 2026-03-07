/**
 * ─── Platform Routes ───
 * مسارات خاصة بمنصة NEXIRO-FLUX فقط
 * معزولة تماماً عن مسارات القوالب/المتاجر
 * جميع المسارات محمية بـ requirePlatformAdmin
 */
const router = require('express').Router();
const { authenticateToken, requirePlatformAdmin } = require('../middlewares/authMiddleware');
const broadcastController = require('../controllers/broadcastController');
const { getBanStatus, manualBan, manualUnban } = require('../middlewares/botProtection');
const ErrorLog = require('../models/ErrorLog');
const BannerTemplate = require('../models/BannerTemplate');
const { getPool } = require('../config/db');

// ─── Platform middleware: كل المسارات تتطلب أدمن المنصة ───
router.use(authenticateToken, requirePlatformAdmin);

// ─── Broadcasts (إعلانات بريدية) ───
router.post('/broadcasts/send', broadcastController.sendBroadcast);
router.get('/broadcasts', broadcastController.getBroadcasts);
router.get('/broadcasts/recipients', broadcastController.getAvailableRecipients);
router.delete('/broadcasts/:id', broadcastController.deleteBroadcast);

// ─── Security: Bot Protection Management ───
router.get('/security/bans', getBanStatus);
router.post('/security/ban', manualBan);
router.post('/security/unban', manualUnban);

// ─── Error Log ───
router.get('/errors', async (req, res) => {
  try {
    const { page = 1, limit = 50, level, site_key, search } = req.query;
    const result = await ErrorLog.findAll({ page: Number(page), limit: Number(limit), level, site_key, search });
    res.json(result);
  } catch (err) {
    console.error('Error fetching error logs:', err);
    res.status(500).json({ error: 'فشل في جلب سجل الأخطاء' });
  }
});

router.delete('/errors', async (req, res) => {
  try {
    await ErrorLog.clearAll();
    res.json({ message: 'تم مسح سجل الأخطاء' });
  } catch (err) {
    console.error('Error clearing error logs:', err);
    res.status(500).json({ error: 'فشل في مسح سجل الأخطاء' });
  }
});

// ─── Banner Templates (قوالب البنرات) ───
router.get('/banner-templates', async (req, res) => {
  try {
    const templates = await BannerTemplate.findAll();
    // جلب إحصائيات الشراء لكل قالب
    const pool = getPool();
    const [purchases] = await pool.query(
      `SELECT template_id,
              COUNT(*) as total_purchases,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_purchases,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_purchases,
              SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
       FROM banner_purchases GROUP BY template_id`
    );
    const purchaseStats = {};
    for (const p of purchases) {
      purchaseStats[p.template_id] = {
        total: p.total_purchases,
        completed: Number(p.completed_purchases),
        pending: Number(p.pending_purchases),
        revenue: Number(p.total_revenue) || 0,
      };
    }
    // إجمالي الإحصائيات
    const [totals] = await pool.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue
       FROM banner_purchases`
    );
    const summary = {
      totalPurchases: Number(totals[0]?.total) || 0,
      completedPurchases: Number(totals[0]?.completed) || 0,
      totalRevenue: Number(totals[0]?.revenue) || 0,
    };
    res.json({ templates, purchaseStats, summary });
  } catch (err) {
    console.error('Error fetching banner templates:', err);
    res.status(500).json({ error: 'فشل في جلب قوالب البنرات' });
  }
});

router.post('/banner-templates', async (req, res) => {
  try {
    const { name, preview_image, category, design_data, price, is_active, sort_order } = req.body;
    if (!name || !design_data) return res.status(400).json({ error: 'الاسم وبيانات التصميم مطلوبة' });
    const template = await BannerTemplate.create({ name, preview_image, category, design_data, price, is_active, sort_order });
    res.status(201).json({ message: 'تم إنشاء القالب', template });
  } catch (err) {
    console.error('Error creating banner template:', err);
    res.status(500).json({ error: 'فشل في إنشاء القالب' });
  }
});

router.put('/banner-templates/:id', async (req, res) => {
  try {
    const allowedFields = ['name', 'preview_image', 'category', 'design_data', 'price', 'is_active', 'sort_order'];
    const data = {};
    for (const f of allowedFields) { if (req.body[f] !== undefined) data[f] = req.body[f]; }
    const template = await BannerTemplate.update(req.params.id, data);
    if (!template) return res.status(404).json({ error: 'القالب غير موجود' });
    res.json({ message: 'تم تحديث القالب', template });
  } catch (err) {
    console.error('Error updating banner template:', err);
    res.status(500).json({ error: 'فشل في تحديث القالب' });
  }
});

router.delete('/banner-templates/:id', async (req, res) => {
  try {
    const deleted = await BannerTemplate.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'القالب غير موجود' });
    res.json({ message: 'تم حذف القالب' });
  } catch (err) {
    console.error('Error deleting banner template:', err);
    res.status(500).json({ error: 'فشل في حذف القالب' });
  }
});

module.exports = router;
