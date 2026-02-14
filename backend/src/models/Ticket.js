const { getPool } = require('../config/db');

class Ticket {
  // إنشاء تذكرة
  static async create({ site_key, customer_id, subject, priority, category }) {
    const pool = getPool();
    const ticket_number = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const [result] = await pool.query(
      'INSERT INTO tickets (site_key, customer_id, ticket_number, subject, priority, category) VALUES (?, ?, ?, ?, ?, ?)',
      [site_key, customer_id || null, ticket_number, subject, priority || 'medium', category || null]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT t.*, c.name as customer_name, c.email as customer_email
       FROM tickets t
       LEFT JOIN customers c ON t.customer_id = c.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // جلب تذاكر الموقع
  static async findBySiteKey(site_key, { page = 1, limit = 50, status, priority } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = `SELECT t.*, c.name as customer_name, c.email as customer_email
                 FROM tickets t
                 LEFT JOIN customers c ON t.customer_id = c.id
                 WHERE t.site_key = ?`;
    const params = [site_key];

    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // تحديث حالة التذكرة
  static async updateStatus(id, site_key, status) {
    const pool = getPool();
    const updates = ['status = ?'];
    const values = [status];

    if (status === 'closed' || status === 'resolved') {
      updates.push('closed_at = NOW()');
    }

    values.push(id, site_key);
    const [result] = await pool.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // تعيين موظف
  static async assignUser(id, site_key, user_id) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE tickets SET user_id = ?, status = "in_progress" WHERE id = ? AND site_key = ?',
      [user_id, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // إضافة رسالة
  static async addMessage({ ticket_id, sender_type, sender_id, message, attachment_url }) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message, attachment_url) VALUES (?, ?, ?, ?, ?)',
      [ticket_id, sender_type, sender_id || null, message, attachment_url || null]
    );
    return { id: result.insertId, ticket_id, sender_type, sender_id, message, attachment_url };
  }

  // جلب رسائل تذكرة
  static async getMessages(ticket_id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticket_id]
    );
    return rows;
  }

  // إحصائيات
  static async getStats(site_key) {
    const pool = getPool();
    const [totalRows] = await pool.query(
      'SELECT COUNT(*) as count FROM tickets WHERE site_key = ?', [site_key]
    );
    const [openRows] = await pool.query(
      "SELECT COUNT(*) as count FROM tickets WHERE site_key = ? AND status IN ('open', 'in_progress', 'waiting')", [site_key]
    );
    const [resolvedRows] = await pool.query(
      "SELECT COUNT(*) as count FROM tickets WHERE site_key = ? AND status IN ('resolved', 'closed')", [site_key]
    );

    return {
      total: totalRows[0].count,
      open: openRows[0].count,
      resolved: resolvedRows[0].count
    };
  }
}

module.exports = Ticket;
