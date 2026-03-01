const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
  sendEmailBroadcast,
  getBroadcastRecipientCount
} = require('../controllers/notificationController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب الإشعارات
router.get('/', authenticateToken, requireRole('admin', 'user'), getNotifications);

// إنشاء إشعار (إعلان)
router.post('/', authenticateToken, requireRole('admin', 'user'), createNotification);

// قراءة الكل
router.put('/read-all', authenticateToken, requireRole('admin', 'user'), markAllAsRead);

// تحديث إشعار
router.put('/:id', authenticateToken, requireRole('admin', 'user'), updateNotification);

// قراءة إشعار
router.put('/:id/read', authenticateToken, requireRole('admin', 'user'), markAsRead);

// حذف إشعار
router.delete('/:id', authenticateToken, requireRole('admin', 'user'), deleteNotification);

// ─── إعلانات بريدية (Email Broadcasts) ───
router.post('/broadcast/send', authenticateToken, requireRole('admin', 'user'), sendEmailBroadcast);
router.get('/broadcast/recipients-count', authenticateToken, requireRole('admin', 'user'), getBroadcastRecipientCount);

module.exports = router;
