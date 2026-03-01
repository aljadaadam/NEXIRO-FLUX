const express = require('express');
const router = express.Router();
const {
  sendBroadcast,
  getBroadcasts,
  deleteBroadcast,
  getAvailableRecipients,
} = require('../controllers/broadcastController');
const { authenticateToken, requirePlatformAdmin } = require('../middlewares/authMiddleware');

// ─── جميع المسارات تتطلب أدمن المنصة ───

// إرسال إعلان جماعي
router.post('/send', authenticateToken, requirePlatformAdmin, sendBroadcast);

// جلب سجل الإعلانات
router.get('/', authenticateToken, requirePlatformAdmin, getBroadcasts);

// جلب المستلمين المتاحين
router.get('/recipients', authenticateToken, requirePlatformAdmin, getAvailableRecipients);

// حذف إعلان
router.delete('/:id', authenticateToken, requirePlatformAdmin, deleteBroadcast);

module.exports = router;
