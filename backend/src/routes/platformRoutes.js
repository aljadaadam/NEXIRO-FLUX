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

module.exports = router;
