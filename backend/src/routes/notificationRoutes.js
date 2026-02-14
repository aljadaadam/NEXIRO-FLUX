const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب الإشعارات
router.get('/', authenticateToken, getNotifications);

// قراءة الكل
router.put('/read-all', authenticateToken, markAllAsRead);

// قراءة إشعار
router.put('/:id/read', authenticateToken, markAsRead);

module.exports = router;
