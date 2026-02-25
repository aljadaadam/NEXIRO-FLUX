const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');

class Customer {
  static async ensureColumns() {
    const pool = getPool();
    const addCol = async (col, def) => {
      try { await pool.query(`ALTER TABLE customers ADD COLUMN ${col} ${def}`); } catch (e) { /* exists */ }
    };
    await addCol('country', 'VARCHAR(100) NULL');
    await addCol('id_document_url', 'TEXT NULL');
    await addCol('verification_status', "VARCHAR(20) DEFAULT 'none'");
    await addCol('verification_note', 'TEXT NULL');
  }

  // إنشاء زبون جديد
  static async create({ site_key, name, email, phone, password }) {
    const pool = getPool();
    await this.ensureColumns();
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO customers (site_key, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [site_key, name, email, phone || null, hashedPassword]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID (مع عزل بـ site_key إختياري)
  static async findById(id, site_key = null) {
    const pool = getPool();
    await this.ensureColumns();
    let query = 'SELECT id, site_key, name, email, phone, country, wallet_balance, is_verified, is_blocked, last_login_at, created_at, id_document_url, verification_status, verification_note FROM customers WHERE id = ?';
    const params = [id];
    if (site_key) {
      query += ' AND site_key = ?';
      params.push(site_key);
    }
    const [rows] = await pool.query(query, params);
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

    let query = 'SELECT id, site_key, name, email, phone, country, wallet_balance, is_verified, is_blocked, last_login_at, created_at FROM customers WHERE site_key = ?';
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

  static async updateProfile(id, site_key, { name, email, phone, country, password } = {}) {
    const pool = getPool();
    await this.ensureColumns();

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone || null); }
    if (country !== undefined) { updates.push('country = ?'); params.push(country || null); }
    if (password !== undefined && password !== null && String(password).trim() !== '') {
      const hashed = await bcrypt.hash(String(password), 10);
      updates.push('password = ?');
      params.push(hashed);
    }

    if (updates.length === 0) return false;

    params.push(id, site_key);
    const [result] = await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  // رفع وثيقة هوية
  static async uploadIdDocument(id, site_key, documentUrl) {
    const pool = getPool();
    await this.ensureColumns();
    const [result] = await pool.query(
      "UPDATE customers SET id_document_url = ?, verification_status = 'pending' WHERE id = ? AND site_key = ?",
      [documentUrl, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // تحديث حالة التحقق (للأدمن)
  static async updateVerification(id, site_key, status, note) {
    const pool = getPool();
    await this.ensureColumns();
    const updates = ["verification_status = ?"];
    const params = [status];
    if (status === 'verified') {
      updates.push('is_verified = 1');
    } else if (status === 'rejected') {
      updates.push('is_verified = 0');
    }
    if (note !== undefined) {
      updates.push('verification_note = ?');
      params.push(note);
    }
    params.push(id, site_key);
    const [result] = await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      params
    );
    return result.affectedRows > 0;
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
