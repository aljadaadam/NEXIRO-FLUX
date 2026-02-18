const { getPool } = require('../config/db');

class Currency {
  // جلب عملات الموقع
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM currencies WHERE site_key = ? ORDER BY is_default DESC, name ASC',
      [site_key]
    );
    return rows;
  }

  // جلب عملة واحدة
  static async findById(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM currencies WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return rows[0] || null;
  }

  // إنشاء عملة
  static async create(site_key, data) {
    const pool = getPool();
    // إذا هذه العملة الافتراضية، ألغي الافتراضي عن البقية
    if (data.is_default) {
      await pool.query('UPDATE currencies SET is_default = 0 WHERE site_key = ?', [site_key]);
    }
    const [result] = await pool.query(
      'INSERT INTO currencies (site_key, code, name, symbol, exchange_rate, is_default, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [site_key, data.code, data.name, data.symbol || '$', data.exchange_rate || 1, data.is_default ? 1 : 0, data.is_active !== false ? 1 : 0]
    );
    return this.findById(result.insertId, site_key);
  }

  // تحديث عملة
  static async update(id, site_key, data) {
    const pool = getPool();
    if (data.is_default) {
      await pool.query('UPDATE currencies SET is_default = 0 WHERE site_key = ?', [site_key]);
    }
    const fields = [];
    const values = [];
    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.symbol !== undefined) { fields.push('symbol = ?'); values.push(data.symbol); }
    if (data.exchange_rate !== undefined) { fields.push('exchange_rate = ?'); values.push(data.exchange_rate); }
    if (data.is_default !== undefined) { fields.push('is_default = ?'); values.push(data.is_default ? 1 : 0); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
    if (fields.length === 0) return this.findById(id, site_key);
    values.push(id, site_key);
    await pool.query(`UPDATE currencies SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`, values);
    return this.findById(id, site_key);
  }

  // حذف عملة
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM currencies WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Currency;
