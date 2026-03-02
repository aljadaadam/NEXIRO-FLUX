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

module.exports = router;
