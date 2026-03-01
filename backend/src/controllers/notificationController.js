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

// ─── إرسال إعلان بريدي جماعي لزبائن المتجر ───
async function sendEmailBroadcast(req, res) {
  try {
    const { site_key } = req.user;
    const { subject, message, recipient_type } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'العنوان والرسالة مطلوبان', errorEn: 'Subject and message are required' });
    }

    const { getPool } = require('../config/db');
    const pool = getPool();
    const emailService = require('../services/email');
    const emailTemplates = require('../services/emailTemplates');

    // جلب زبائن المتجر
    let emailList = [];
    if (recipient_type === 'all_customers') {
      const [rows] = await pool.query(
        `SELECT DISTINCT email, name FROM customers WHERE site_key = ? AND email IS NOT NULL AND email != '' AND is_blocked = 0`,
        [site_key]
      );
      emailList = rows;
    } else {
      return res.status(400).json({ error: 'نوع المستلمين غير صالح' });
    }

    if (emailList.length === 0) {
      return res.status(400).json({ error: 'لا يوجد زبائن لإرسال البريد', errorEn: 'No customers found' });
    }

    // جلب اسم المتجر
    const [custRows] = await pool.query('SELECT store_name FROM customizations WHERE site_key = ? LIMIT 1', [site_key]);
    const storeName = custRows?.[0]?.store_name || 'المتجر';

    // إرسال الإيميلات
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of emailList) {
      try {
        const html = emailTemplates.broadcast({
          name: recipient.name,
          subject,
          message,
          branding: { storeName, primaryColor: '#7c3aed' },
        });

        const result = await emailService.send({
          to: recipient.email,
          subject,
          html,
          storeName,
        });

        if (result.sent || result.logged) sentCount++;
        else failedCount++;
      } catch {
        failedCount++;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    res.json({
      message: `تم إرسال البريد إلى ${sentCount} زبون`,
      messageEn: `Email sent to ${sentCount} customers`,
      sent: sentCount,
      failed: failedCount,
      total: emailList.length,
    });
  } catch (error) {
    console.error('Error in sendEmailBroadcast:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال البريد' });
  }
}

// ─── عدد الزبائن المتاحين للإرسال ───
async function getBroadcastRecipientCount(req, res) {
  try {
    const { site_key } = req.user;
    const { getPool } = require('../config/db');
    const pool = getPool();
    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) as count FROM customers WHERE site_key = ? AND email IS NOT NULL AND email != '' AND is_blocked = 0`,
      [site_key]
    );
    res.json({ count });
  } catch (error) {
    console.error('Error in getBroadcastRecipientCount:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
  sendEmailBroadcast,
  getBroadcastRecipientCount
};
