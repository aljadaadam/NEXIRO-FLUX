const { getPool } = require('../config/db');

class Notification {
  // إنشاء إشعار
  static async create({ site_key, recipient_type, recipient_id, title, message, type, link }) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO notifications (site_key, recipient_type, recipient_id, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [site_key, recipient_type || 'admin', recipient_id || null, title, message, type || 'info', link || null]
    );
    return { id: result.insertId, site_key, recipient_type, title, message, type };
  }

  // جلب إشعارات
  static async findBySiteKey(site_key, { recipient_type, recipient_id, limit = 30, unread_only = false } = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM notifications WHERE site_key = ?';
    const params = [site_key];

    if (recipient_type) { query += ' AND recipient_type = ?'; params.push(recipient_type); }
    if (recipient_id) { query += ' AND (recipient_id = ? OR recipient_id IS NULL)'; params.push(recipient_id); }
    if (unread_only) { query += ' AND is_read = 0'; }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // قراءة إشعار
  static async markAsRead(id, site_key) {
    const pool = getPool();
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND site_key = ?', [id, site_key]);
  }

  // قراءة إشعار مع التحقق من المالك (IDOR protection)
  static async markAsReadForRecipient(id, site_key, recipient_id) {
    const pool = getPool();
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND site_key = ? AND (recipient_id = ? OR recipient_id IS NULL)', [id, site_key, recipient_id]);
  }

  // قراءة الكل
  static async markAllAsRead(site_key, recipient_type, recipient_id) {
    const pool = getPool();
    let query = 'UPDATE notifications SET is_read = 1 WHERE site_key = ? AND is_read = 0';
    const params = [site_key];

    if (recipient_type) { query += ' AND recipient_type = ?'; params.push(recipient_type); }
    if (recipient_id) { query += ' AND (recipient_id = ? OR recipient_id IS NULL)'; params.push(recipient_id); }

    await pool.query(query, params);
  }

  // عدد غير المقروءة
  static async countUnread(site_key, recipient_type, recipient_id) {
    const pool = getPool();
    let query = 'SELECT COUNT(*) as count FROM notifications WHERE site_key = ? AND is_read = 0';
    const params = [site_key];

    if (recipient_type) { query += ' AND recipient_type = ?'; params.push(recipient_type); }
    if (recipient_id) { query += ' AND (recipient_id = ? OR recipient_id IS NULL)'; params.push(recipient_id); }

    const [rows] = await pool.query(query, params);
    return rows[0].count;
  }
}

module.exports = Notification;
