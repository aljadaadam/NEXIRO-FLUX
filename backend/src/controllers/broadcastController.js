const { getPool } = require('../config/db');
const emailService = require('../services/email');
const emailTemplates = require('../services/emailTemplates');

// ─── إرسال إعلان جماعي عبر البريد الإلكتروني ───
async function sendBroadcast(req, res) {
  try {
    const { subject, message, recipients, recipient_type } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        error: 'العنوان والرسالة مطلوبان',
        errorEn: 'Subject and message are required',
      });
    }

    if (!recipient_type || !['all_users', 'individual', 'custom_list'].includes(recipient_type)) {
      return res.status(400).json({
        error: 'نوع المستلمين غير صالح',
        errorEn: 'Invalid recipient type',
      });
    }

    const pool = getPool();
    let emailList = [];

    if (recipient_type === 'all_users') {
      // جلب جميع مستخدمي المنصة فقط (جدول users)
      const [rows] = await pool.query(
        `SELECT DISTINCT email, name FROM users
         WHERE email IS NOT NULL AND email != ''
         ORDER BY name ASC`
      );
      emailList = rows;
    } else if (recipient_type === 'individual') {
      // إرسال لشخص واحد
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          error: 'يجب تحديد مستلم واحد على الأقل',
          errorEn: 'At least one recipient is required',
        });
      }
      emailList = recipients.map(r => ({
        email: r.email,
        name: r.name || r.email.split('@')[0],
      }));
    } else if (recipient_type === 'custom_list') {
      // قائمة إيميلات مخصصة
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          error: 'يجب تحديد مستلم واحد على الأقل',
          errorEn: 'At least one recipient is required',
        });
      }
      emailList = recipients.map(r => ({
        email: r.email || r,
        name: r.name || (r.email || r).split('@')[0],
      }));
    }

    if (emailList.length === 0) {
      return res.status(400).json({
        error: 'لا يوجد مستلمين لإرسال الإعلان',
        errorEn: 'No recipients found',
      });
    }

    // حفظ الإعلان في قاعدة البيانات
    const [insertResult] = await pool.query(
      `INSERT INTO email_broadcasts (subject, message, recipient_type, recipient_count, sent_by, status)
       VALUES (?, ?, ?, ?, ?, 'sending')`,
      [subject, message, recipient_type, emailList.length, req.user.id]
    );
    const broadcastId = insertResult.insertId;

    // إرسال الإيميلات (بشكل متسلسل لتجنب الحظر)
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const recipient of emailList) {
      try {
        const html = emailTemplates.broadcast({
          name: recipient.name,
          subject,
          message,
          branding: { storeName: 'NEXIRO-FLUX', primaryColor: '#7c3aed' },
        });

        const result = await emailService.send({
          to: recipient.email,
          subject,
          html,
          storeName: 'NEXIRO-FLUX',
        });

        if (result.sent || result.logged) {
          sentCount++;
        } else {
          failedCount++;
          errors.push({ email: recipient.email, error: result.error });
        }
      } catch (err) {
        failedCount++;
        errors.push({ email: recipient.email, error: err.message });
      }

      // تأخير بسيط بين الإيميلات (250ms)
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // تحديث حالة الإعلان
    await pool.query(
      `UPDATE email_broadcasts SET status = ?, sent_count = ?, failed_count = ? WHERE id = ?`,
      [failedCount === emailList.length ? 'failed' : 'completed', sentCount, failedCount, broadcastId]
    );

    res.json({
      message: `تم إرسال الإعلان إلى ${sentCount} مستلم`,
      messageEn: `Broadcast sent to ${sentCount} recipients`,
      broadcast: {
        id: broadcastId,
        sent: sentCount,
        failed: failedCount,
        total: emailList.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Error in sendBroadcast:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء إرسال الإعلان',
      errorEn: 'An error occurred while sending the broadcast',
    });
  }
}

// ─── جلب سجل الإعلانات ───
async function getBroadcasts(req, res) {
  try {
    const pool = getPool();
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      `SELECT * FROM email_broadcasts ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM email_broadcasts');

    res.json({ broadcasts: rows, total });
  } catch (error) {
    console.error('Error in getBroadcasts:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإعلانات' });
  }
}

// ─── حذف إعلان ───
async function deleteBroadcast(req, res) {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM email_broadcasts WHERE id = ?', [parseInt(id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'الإعلان غير موجود' });
    }
    res.json({ message: 'تم حذف الإعلان' });
  } catch (error) {
    console.error('Error in deleteBroadcast:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الإعلان' });
  }
}

// ─── جلب قائمة مستخدمي المنصة المسجلين (جدول users فقط) ───
async function getAvailableRecipients(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, email, name, role, is_platform_admin, created_at
       FROM users
       WHERE email IS NOT NULL AND email != ''
       ORDER BY created_at DESC`
    );
    res.json({ recipients: rows, total: rows.length });
  } catch (error) {
    console.error('Error in getAvailableRecipients:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

module.exports = {
  sendBroadcast,
  getBroadcasts,
  deleteBroadcast,
  getAvailableRecipients,
};
