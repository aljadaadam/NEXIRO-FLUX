const { getPool } = require('../config/db');

class DeliveryZone {
  // جلب مناطق التوصيل لموقع معيّن
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [zones] = await pool.query(
      'SELECT * FROM delivery_zones WHERE site_key = ? ORDER BY country_name ASC',
      [site_key]
    );
    // جلب التفاصيل (المدن) لكل منطقة
    for (const zone of zones) {
      const [regions] = await pool.query(
        'SELECT * FROM delivery_regions WHERE zone_id = ? AND site_key = ? ORDER BY name ASC',
        [zone.id, site_key]
      );
      zone.regions = regions;
    }
    return zones;
  }

  // جلب منطقة واحدة
  static async findById(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM delivery_zones WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    if (!rows[0]) return null;
    const zone = rows[0];
    const [regions] = await pool.query(
      'SELECT * FROM delivery_regions WHERE zone_id = ? AND site_key = ?',
      [zone.id, site_key]
    );
    zone.regions = regions;
    return zone;
  }

  // إنشاء منطقة توصيل
  static async create(site_key, data) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO delivery_zones (site_key, country_name, country_code, is_active) VALUES (?, ?, ?, ?)',
      [site_key, data.country_name, data.country_code || null, data.is_active !== false ? 1 : 0]
    );
    return this.findById(result.insertId, site_key);
  }

  // تحديث منطقة توصيل
  static async update(id, site_key, data) {
    const pool = getPool();
    const fields = [];
    const values = [];
    if (data.country_name !== undefined) { fields.push('country_name = ?'); values.push(data.country_name); }
    if (data.country_code !== undefined) { fields.push('country_code = ?'); values.push(data.country_code); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
    if (fields.length === 0) return this.findById(id, site_key);
    values.push(id, site_key);
    await pool.query(`UPDATE delivery_zones SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`, values);
    return this.findById(id, site_key);
  }

  // حذف منطقة توصيل
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM delivery_zones WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }
}

class DeliveryRegion {
  // إنشاء منطقة فرعية (مدينة/محافظة)
  static async create(site_key, data) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO delivery_regions (zone_id, site_key, name, shipping_cost, estimated_days, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [data.zone_id, site_key, data.name, data.shipping_cost || 0, data.estimated_days || 3, data.is_active !== false ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM delivery_regions WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  // تحديث منطقة فرعية
  static async update(id, site_key, data) {
    const pool = getPool();
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.shipping_cost !== undefined) { fields.push('shipping_cost = ?'); values.push(data.shipping_cost); }
    if (data.estimated_days !== undefined) { fields.push('estimated_days = ?'); values.push(data.estimated_days); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
    if (data.zone_id !== undefined) { fields.push('zone_id = ?'); values.push(data.zone_id); }
    if (fields.length === 0) return null;
    values.push(id, site_key);
    await pool.query(`UPDATE delivery_regions SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`, values);
    const [rows] = await pool.query('SELECT * FROM delivery_regions WHERE id = ? AND site_key = ?', [id, site_key]);
    return rows[0] || null;
  }

  // حذف منطقة فرعية
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM delivery_regions WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }
}

module.exports = { DeliveryZone, DeliveryRegion };
