const { getPool } = require('../config/db');

class Banner {
  // جلب بانرات الموقع
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM banners WHERE site_key = ? ORDER BY sort_order ASC, id ASC',
      [site_key]
    );
    return rows;
  }

  // جلب البانرات النشطة فقط (للمتجر)
  static async findActiveBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM banners WHERE site_key = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC',
      [site_key]
    );
    return rows;
  }

  // جلب بانر واحد
  static async findById(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM banners WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return rows[0] || null;
  }

  // إنشاء بانر
  static async create(site_key, data) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO banners (site_key, title, subtitle, icon, image_url, link, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        site_key,
        data.title || null,
        data.subtitle || null,
        data.icon || null,
        data.image_url || null,
        data.link || null,
        data.is_active !== false ? 1 : 0,
        data.sort_order || 0
      ]
    );
    return this.findById(result.insertId, site_key);
  }

  // تحديث بانر
  static async update(id, site_key, data) {
    const pool = getPool();
    const fields = [];
    const values = [];
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.subtitle !== undefined) { fields.push('subtitle = ?'); values.push(data.subtitle); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }
    if (data.link !== undefined) { fields.push('link = ?'); values.push(data.link); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order); }
    if (fields.length === 0) return this.findById(id, site_key);
    values.push(id, site_key);
    await pool.query(`UPDATE banners SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`, values);
    return this.findById(id, site_key);
  }

  // حذف بانر
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM banners WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Banner;
