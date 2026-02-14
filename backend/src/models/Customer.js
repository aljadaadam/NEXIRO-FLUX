const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');

class Customer {
  // إنشاء زبون جديد
  static async create({ site_key, name, email, phone, password }) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO customers (site_key, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [site_key, name, email, phone || null, hashedPassword]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, site_key, name, email, phone, wallet_balance, is_verified, is_blocked, last_login_at, created_at FROM customers WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // البحث بالإيميل والموقع
  static async findByEmailAndSite(email, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE email = ? AND site_key = ?',
      [email, site_key]
    );
    return rows[0] || null;
  }

  // جلب جميع زبائن الموقع
  static async findBySiteKey(site_key, { page = 1, limit = 50, search } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = 'SELECT id, site_key, name, email, phone, wallet_balance, is_verified, is_blocked, last_login_at, created_at FROM customers WHERE site_key = ?';
    const params = [site_key];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // عدد الزبائن
  static async countBySite(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM customers WHERE site_key = ?',
      [site_key]
    );
    return rows[0].count;
  }

  // تحديث الرصيد
  static async updateWallet(id, site_key, amount) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE customers SET wallet_balance = wallet_balance + ? WHERE id = ? AND site_key = ?',
      [amount, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // حظر / إلغاء حظر
  static async toggleBlock(id, site_key, blocked) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE customers SET is_blocked = ? WHERE id = ? AND site_key = ?',
      [blocked ? 1 : 0, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // التحقق من كلمة المرور
  static async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  // تحديث آخر تسجيل دخول
  static async updateLastLogin(id) {
    const pool = getPool();
    await pool.query('UPDATE customers SET last_login_at = NOW() WHERE id = ?', [id]);
  }

  // حذف زبون
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM customers WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Customer;
