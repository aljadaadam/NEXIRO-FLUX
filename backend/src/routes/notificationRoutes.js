const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب الإشعارات
router.get('/', authenticateToken, requireRole('admin', 'user'), getNotifications);

// قراءة الكل
router.put('/read-all', authenticateToken, requireRole('admin', 'user'), markAllAsRead);

// قراءة إشعار
router.put('/:id/read', authenticateToken, requireRole('admin', 'user'), markAsRead);

module.exports = router;
