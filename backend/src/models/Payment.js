const { getPool } = require('../config/db');

class Payment {
  // إنشاء عملية دفع
  static async create({ site_key, customer_id, order_id, type, amount, currency, payment_method, payment_gateway_id, status, description }) {
    const pool = getPool();

    const [result] = await pool.query(
      `INSERT INTO payments (site_key, customer_id, order_id, type, amount, currency, payment_method, payment_gateway_id, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_key, customer_id || null, order_id || null, type || 'purchase', amount, currency || 'USD', payment_method, payment_gateway_id || null, status || 'pending', description || null]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // جلب مدفوعات موقع
  static async findBySiteKey(site_key, { page = 1, limit = 50, type, customer_id } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as customer_name FROM payments p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.site_key = ?';
    const params = [site_key];

    if (type) { query += ' AND p.type = ?'; params.push(type); }
    if (customer_id) { query += ' AND p.customer_id = ?'; params.push(customer_id); }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // تحديث حالة الدفع
  static async updateStatus(id, site_key, status) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE payments SET status = ? WHERE id = ? AND site_key = ?',
      [status, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // إحصائيات المدفوعات
  static async getStats(site_key) {
    const pool = getPool();
    const [totalRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE site_key = ? AND status = 'completed'",
      [site_key]
    );
    const [todayRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE site_key = ? AND status = 'completed' AND DATE(created_at) = CURDATE()",
      [site_key]
    );
    const [depositRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE site_key = ? AND type = 'deposit' AND status = 'completed'",
      [site_key]
    );

    return {
      totalRevenue: parseFloat(totalRows[0].total),
      todayRevenue: parseFloat(todayRows[0].total),
      totalDeposits: parseFloat(depositRows[0].total)
    };
  }
}

module.exports = Payment;
