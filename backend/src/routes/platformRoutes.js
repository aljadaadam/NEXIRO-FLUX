/**
 * ─── Platform Routes ───
 * مسارات خاصة بمنصة NEXIRO-FLUX فقط
 * معزولة تماماً عن مسارات القوالب/المتاجر
 * جميع المسارات محمية بـ requirePlatformAdmin
 */
const router = require('express').Router();
const { authenticateToken, requirePlatformAdmin } = require('../middlewares/authMiddleware');
const broadcastController = require('../controllers/broadcastController');

// ─── Platform middleware: كل المسارات تتطلب أدمن المنصة ───
router.use(authenticateToken, requirePlatformAdmin);

// ─── Broadcasts (إعلانات بريدية) ───
router.post('/broadcasts/send', broadcastController.sendBroadcast);
router.get('/broadcasts', broadcastController.getBroadcasts);
router.get('/broadcasts/recipients', broadcastController.getAvailableRecipients);
router.delete('/broadcasts/:id', broadcastController.deleteBroadcast);

module.exports = router;
