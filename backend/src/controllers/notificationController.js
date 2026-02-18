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

// إنشاء إشعار (إعلان)
async function createNotification(req, res) {
  try {
    const { site_key } = req.user;
    const { title, message, type, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'العنوان والرسالة مطلوبان' });
    }
    const notification = await Notification.create({
      site_key,
      recipient_type: 'customer',
      recipient_id: null,
      title,
      message,
      type: type || 'info',
      link: link || null
    });
    res.status(201).json({ message: 'تم إنشاء الإشعار', notification });
  } catch (error) {
    console.error('Error in createNotification:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الإشعار' });
  }
}

// تحديث إشعار
async function updateNotification(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { title, message, type, link } = req.body;
    const { getPool } = require('../config/db');
    const pool = getPool();
    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (message !== undefined) { fields.push('message = ?'); values.push(message); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (link !== undefined) { fields.push('link = ?'); values.push(link); }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'لا توجد بيانات للتحديث' });
    }
    values.push(id, site_key);
    const [result] = await pool.query(
      `UPDATE notifications SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'الإشعار غير موجود' });
    }
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
    res.json({ message: 'تم تحديث الإشعار', notification: rows[0] });
  } catch (error) {
    console.error('Error in updateNotification:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الإشعار' });
  }
}

// حذف إشعار
async function deleteNotification(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { getPool } = require('../config/db');
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM notifications WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'الإشعار غير موجود' });
    }
    res.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الإشعار' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  updateNotification,
  deleteNotification
};
