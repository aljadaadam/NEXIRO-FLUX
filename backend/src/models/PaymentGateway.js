const { getPool } = require('../config/db');

class PaymentGateway {
  // ─── إنشاء الجدول تلقائياً ───
  static async ensureTable() {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_gateways (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_key VARCHAR(100) NOT NULL,
        type ENUM('paypal','bank_transfer','usdt','binance','wallet','bankak') NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) DEFAULT NULL,
        is_enabled TINYINT(1) DEFAULT 1,
        is_default TINYINT(1) DEFAULT 0,
        config JSON DEFAULT NULL,
        countries JSON DEFAULT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_site (site_key),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  // ─── جلب جميع البوابات لموقع ───
  static async findBySiteKey(site_key) {
    const pool = getPool();
    await this.ensureTable();
    const [rows] = await pool.query(
      'SELECT * FROM payment_gateways WHERE site_key = ? ORDER BY display_order ASC, created_at ASC',
      [site_key]
    );
    return rows.map(r => ({
      ...r,
      config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
      countries: typeof r.countries === 'string' ? JSON.parse(r.countries) : r.countries,
    }));
  }

  // ─── جلب بوابة بالنوع و site_key ───
  static async findByType(type, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM payment_gateways WHERE type = ? AND site_key = ? AND is_enabled = 1 LIMIT 1',
      [type, site_key]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
      countries: typeof r.countries === 'string' ? JSON.parse(r.countries) : r.countries,
    };
  }

  // ─── جلب بوابة بالـ ID ───
  static async findById(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM payment_gateways WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
      countries: typeof r.countries === 'string' ? JSON.parse(r.countries) : r.countries,
    };
  }

  // ─── جلب البوابات المفعّلة حسب الدولة ───
  static async findEnabled(site_key, countryCode = null) {
    const pool = getPool();
    await this.ensureTable();
    const [rows] = await pool.query(
      'SELECT * FROM payment_gateways WHERE site_key = ? AND is_enabled = 1 ORDER BY display_order ASC',
      [site_key]
    );

    let gateways = rows.map(r => ({
      ...r,
      config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
      countries: typeof r.countries === 'string' ? JSON.parse(r.countries) : r.countries,
    }));

    // تصفية بوابات الدفع البنكي حسب الدولة
    if (countryCode) {
      gateways = gateways.filter(gw => {
        if (gw.type !== 'bank_transfer') return true; // غير البنكي يظهر دائماً
        if (!gw.countries || gw.countries.length === 0) return true; // بدون تقييد
        return gw.countries.includes(countryCode.toUpperCase());
      });
    }

    return gateways;
  }

  // ─── إنشاء بوابة ───
  static async create(data) {
    const pool = getPool();
    await this.ensureTable();

    const { site_key, type, name, name_en, is_enabled, is_default, config, countries, display_order } = data;

    // إذا كانت افتراضية، أزل الافتراضي من نفس النوع
    if (is_default) {
      await pool.query(
        'UPDATE payment_gateways SET is_default = 0 WHERE site_key = ? AND type = ?',
        [site_key, type]
      );
    }

    const [result] = await pool.query(
      `INSERT INTO payment_gateways (site_key, type, name, name_en, is_enabled, is_default, config, countries, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        site_key,
        type,
        name,
        name_en || null,
        is_enabled !== undefined ? is_enabled : 1,
        is_default || 0,
        config ? JSON.stringify(config) : null,
        countries ? JSON.stringify(countries) : null,
        display_order || 0,
      ]
    );

    return this.findById(result.insertId, site_key);
  }

  // ─── تحديث بوابة ───
  static async update(id, site_key, data) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const allowed = ['name', 'name_en', 'type', 'is_enabled', 'is_default', 'config', 'countries', 'display_order'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        if (key === 'config' || key === 'countries') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
    }

    if (fields.length === 0) return this.findById(id, site_key);

    // إذا تم تعيين كافتراضي
    if (data.is_default) {
      const existing = await this.findById(id, site_key);
      if (existing) {
        await pool.query(
          'UPDATE payment_gateways SET is_default = 0 WHERE site_key = ? AND type = ?',
          [site_key, existing.type]
        );
      }
    }

    values.push(id, site_key);
    await pool.query(
      `UPDATE payment_gateways SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );

    return this.findById(id, site_key);
  }

  // ─── حذف بوابة ───
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM payment_gateways WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  // ─── تبديل الحالة (تفعيل/تعطيل) ───
  static async toggle(id, site_key) {
    const pool = getPool();
    await pool.query(
      'UPDATE payment_gateways SET is_enabled = NOT is_enabled WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return this.findById(id, site_key);
  }
}

module.exports = PaymentGateway;
