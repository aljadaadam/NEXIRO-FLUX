const Notification = require('../models/Notification');

// جلب الإشعارات
async function getNotifications(req, res) {
  try {
    const { site_key } = req.user;
    const { limit, unread_only } = req.query;

    const notifications = await Notification.findBySiteKey(site_key, {
      recipient_type: 'admin',
      limit: parseInt(limit) || 30,
      unread_only: unread_only === 'true'
    });

    const unreadCount = await Notification.countUnread(site_key, 'admin');

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// قراءة إشعار
async function markAsRead(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    await Notification.markAsRead(id, site_key);
    res.json({ message: 'تم' });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// قراءة الكل
async function markAllAsRead(req, res) {
  try {
    const { site_key } = req.user;
    await Notification.markAllAsRead(site_key, 'admin');
    res.json({ message: 'تم قراءة جميع الإشعارات' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
