const { getPool } = require('../config/db');

class ActivityLog {
  // تسجيل نشاط
  static async log({ site_key, user_id, customer_id, action, entity_type, entity_id, details, ip_address }) {
    const pool = getPool();
    await pool.query(
      'INSERT INTO activity_log (site_key, user_id, customer_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [site_key, user_id || null, customer_id || null, action, entity_type || null, entity_id || null, details ? JSON.stringify(details) : null, ip_address || null]
    );
  }

  // جلب سجل النشاطات
  static async findBySiteKey(site_key, { page = 1, limit = 50, action, entity_type } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM activity_log WHERE site_key = ?';
    const params = [site_key];

    if (action) { query += ' AND action = ?'; params.push(action); }
    if (entity_type) { query += ' AND entity_type = ?'; params.push(entity_type); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = ActivityLog;
