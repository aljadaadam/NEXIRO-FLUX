const { getPool } = require('../config/db');

class Coupon {
  static getCreateTableSQL() {
    return `
      CREATE TABLE IF NOT EXISTS coupons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(12, 3) NOT NULL,
        max_uses INT NULL DEFAULT NULL,
        used_count INT NOT NULL DEFAULT 0,
        min_order_amount DECIMAL(12, 3) NULL DEFAULT NULL,
        expires_at DATETIME NULL DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_code_site (code, site_key),
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;
  }

  static async findAll(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE site_key = ? ORDER BY created_at DESC',
      [site_key]
    );
    return rows;
  }

  static async findByCode(site_key, code) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE site_key = ? AND code = ?',
      [site_key, code.toUpperCase().trim()]
    );
    return rows[0] || null;
  }

  static async create(site_key, data) {
    const pool = getPool();
    const code = data.code.toUpperCase().trim();
    const [result] = await pool.query(
      `INSERT INTO coupons (site_key, code, discount_type, discount_value, max_uses, min_order_amount, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        site_key,
        code,
        data.discount_type || 'percentage',
        data.discount_value,
        data.max_uses || null,
        data.min_order_amount || null,
        data.expires_at || null,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      ]
    );
    return { id: result.insertId, code, ...data };
  }

  static async update(site_key, id, data) {
    const pool = getPool();
    const fields = [];
    const values = [];

    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code.toUpperCase().trim()); }
    if (data.discount_type !== undefined) { fields.push('discount_type = ?'); values.push(data.discount_type); }
    if (data.discount_value !== undefined) { fields.push('discount_value = ?'); values.push(data.discount_value); }
    if (data.max_uses !== undefined) { fields.push('max_uses = ?'); values.push(data.max_uses || null); }
    if (data.min_order_amount !== undefined) { fields.push('min_order_amount = ?'); values.push(data.min_order_amount || null); }
    if (data.expires_at !== undefined) { fields.push('expires_at = ?'); values.push(data.expires_at || null); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }

    if (fields.length === 0) return null;

    values.push(id, site_key);
    await pool.query(
      `UPDATE coupons SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );
    return true;
  }

  static async delete(site_key, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM coupons WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  static async validate(site_key, code, orderAmount) {
    const coupon = await this.findByCode(site_key, code);
    if (!coupon) return { valid: false, error: 'كود الخصم غير صالح' };
    if (!coupon.is_active) return { valid: false, error: 'كود الخصم غير مفعّل' };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { valid: false, error: 'كود الخصم منتهي الصلاحية' };
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return { valid: false, error: 'كود الخصم استُنفد بالكامل' };
    if (coupon.min_order_amount && orderAmount < parseFloat(coupon.min_order_amount)) {
      return { valid: false, error: `الحد الأدنى للطلب ${coupon.min_order_amount} SDG` };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderAmount * parseFloat(coupon.discount_value)) / 100;
    } else {
      discount = parseFloat(coupon.discount_value);
    }
    // Discount can't exceed order amount
    discount = Math.min(discount, orderAmount);

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 1000) / 1000,
      final_price: Math.round((orderAmount - discount) * 1000) / 1000,
    };
  }

  static async incrementUsage(site_key, id) {
    const pool = getPool();
    await pool.query(
      'UPDATE coupons SET used_count = used_count + 1 WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
  }
}

module.exports = Coupon;
