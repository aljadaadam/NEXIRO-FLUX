const { getPool } = require('../config/db');

class Order {
  // إنشاء طلب جديد
  static async create({ site_key, customer_id, product_id, product_name, quantity, unit_price, total_price, payment_method, imei, notes }) {
    const pool = getPool();

    // إنشاء رقم طلب فريد
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const [result] = await pool.query(
      `INSERT INTO orders (site_key, customer_id, order_number, product_id, product_name, quantity, unit_price, total_price, payment_method, imei, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_key, customer_id, order_number, product_id || null, product_name, quantity || 1, unit_price, total_price, payment_method || null, imei || null, notes || null]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT o.*, c.name as customer_name, c.email as customer_email
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // جلب طلبات موقع
  static async findBySiteKey(site_key, { page = 1, limit = 50, status, customer_id } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = `SELECT o.*, c.name as customer_name, c.email as customer_email
                 FROM orders o
                 LEFT JOIN customers c ON o.customer_id = c.id
                 WHERE o.site_key = ?`;
    const params = [site_key];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (customer_id) {
      query += ' AND o.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // تحديث حالة الطلب
  static async updateStatus(id, site_key, status, server_response) {
    const pool = getPool();
    const updates = ['status = ?'];
    const values = [status];

    if (status === 'completed') {
      updates.push('completed_at = NOW()');
    }
    if (server_response) {
      updates.push('server_response = ?');
      values.push(server_response);
    }

    values.push(id, site_key);

    const [result] = await pool.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }

  // تحديث حالة الدفع
  static async updatePaymentStatus(id, site_key, payment_status) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE orders SET payment_status = ? WHERE id = ? AND site_key = ?',
      [payment_status, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // إحصائيات الطلبات
  static async getStats(site_key) {
    const pool = getPool();

    const [totalRows] = await pool.query(
      'SELECT COUNT(*) as total FROM orders WHERE site_key = ?', [site_key]
    );
    const [pendingRows] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE site_key = ? AND status = 'pending'", [site_key]
    );
    const [completedRows] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE site_key = ? AND status = 'completed'", [site_key]
    );
    const [revenueRows] = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) as revenue FROM orders WHERE site_key = ? AND payment_status = 'paid'", [site_key]
    );
    const [todayRows] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE site_key = ? AND DATE(created_at) = CURDATE()', [site_key]
    );
    const [todayRevenueRows] = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) as revenue FROM orders WHERE site_key = ? AND payment_status = 'paid' AND DATE(created_at) = CURDATE()", [site_key]
    );
    const [profitRows] = await pool.query(
      `SELECT COALESCE(SUM(
         GREATEST(
           ((o.unit_price - COALESCE(p.source_price, o.unit_price)) * COALESCE(o.quantity, 1)),
           0
         )
       ), 0) as profit
       FROM orders o
       LEFT JOIN products p ON p.id = o.product_id AND p.site_key = o.site_key
       WHERE o.site_key = ? AND o.payment_status = 'paid'`,
      [site_key]
    );
    const [todayProfitRows] = await pool.query(
      `SELECT COALESCE(SUM(
         GREATEST(
           ((o.unit_price - COALESCE(p.source_price, o.unit_price)) * COALESCE(o.quantity, 1)),
           0
         )
       ), 0) as profit
       FROM orders o
       LEFT JOIN products p ON p.id = o.product_id AND p.site_key = o.site_key
       WHERE o.site_key = ? AND o.payment_status = 'paid' AND DATE(o.created_at) = CURDATE()`,
      [site_key]
    );

    return {
      total: totalRows[0].total,
      pending: pendingRows[0].count,
      completed: completedRows[0].count,
      totalRevenue: parseFloat(revenueRows[0].revenue),
      todayOrders: todayRows[0].count,
      todayRevenue: parseFloat(todayRevenueRows[0].revenue),
      totalProfit: parseFloat(profitRows[0].profit),
      todayProfit: parseFloat(todayProfitRows[0].profit)
    };
  }

  // عدد الطلبات بالموقع
  static async countBySite(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE site_key = ?', [site_key]
    );
    return rows[0].count;
  }
}

module.exports = Order;
