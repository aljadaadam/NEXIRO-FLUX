const { getPool } = require('../config/db');

class Reservation {
  // إنشاء حجز جديد
  static async create({ name, email, phone, template_id, template_name, plan, message, ip_address }) {
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO reservations (name, email, phone, template_id, template_name, plan, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, template_id, template_name, plan || 'monthly', message || null, ip_address || null]
    );
    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // جلب جميع الحجوزات
  static async findAll({ page = 1, limit = 50, status } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM reservations';
    const params = [];

    if (status && status !== 'all' && status !== 'undefined') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // تحديث حالة الحجز
  static async updateStatus(id, status, admin_notes) {
    const pool = getPool();
    const updates = ['status = ?'];
    const values = [status];

    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      values.push(admin_notes);
    }

    values.push(id);
    const [result] = await pool.query(
      `UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // حذف حجز
  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM reservations WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // إحصائيات
  static async getStats() {
    const pool = getPool();
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM reservations
    `);
    return {
      total: parseInt(stats.total, 10) || 0,
      pending: parseInt(stats.pending, 10) || 0,
      contacted: parseInt(stats.contacted, 10) || 0,
      completed: parseInt(stats.completed, 10) || 0,
      cancelled: parseInt(stats.cancelled, 10) || 0,
    };
  }

  // التحقق من حجز مكرر (نفس الإيميل ونفس القالب خلال 24 ساعة)
  static async checkDuplicate(email, template_id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id FROM reservations
       WHERE email = ? AND template_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
       LIMIT 1`,
      [email, template_id]
    );
    return rows.length > 0;
  }
}

module.exports = Reservation;
