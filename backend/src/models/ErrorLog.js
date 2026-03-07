const { getPool } = require('../config/db');

class ErrorLog {
  static async log({ site_key, level = 'error', source, message, stack, request_method, request_url, user_id, ip_address }) {
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO error_log (site_key, level, source, message, stack, request_method, request_url, user_id, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [site_key || null, level, source || null, message, stack || null, request_method || null, request_url || null, user_id || null, ip_address || null]
      );
    } catch (err) {
      // Fallback to console if DB logging fails
      console.error('[ErrorLog] Failed to write to DB:', err.message);
      console.error('[ErrorLog] Original error:', message);
    }
  }

  static async findAll({ page = 1, limit = 50, level, site_key, search } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM error_log WHERE 1=1';
    const params = [];

    if (level) { query += ' AND level = ?'; params.push(level); }
    if (site_key) { query += ' AND site_key = ?'; params.push(site_key); }
    if (search) { query += ' AND (message LIKE ? OR source LIKE ? OR request_url LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.query(countQuery, params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return { rows, total: countRows[0].total, page, limit };
  }

  static async deleteOld(days = 30) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM error_log WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [days]);
    return result.affectedRows;
  }

  static async clearAll() {
    const pool = getPool();
    await pool.query('TRUNCATE TABLE error_log');
  }
}

module.exports = ErrorLog;
