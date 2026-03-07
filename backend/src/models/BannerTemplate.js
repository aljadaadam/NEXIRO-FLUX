const { getPool } = require('../config/db');

class BannerTemplate {
  // جلب جميع القوالب (للمنصة)
  static async findAll() {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM banner_templates ORDER BY sort_order ASC, id DESC');
    return rows;
  }

  // جلب القوالب النشطة فقط (للمتاجر)
  static async findActive() {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM banner_templates WHERE is_active = 1 ORDER BY sort_order ASC, id DESC');
    return rows;
  }

  // جلب قالب واحد
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM banner_templates WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // إنشاء قالب
  static async create(data) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO banner_templates (name, preview_image, category, design_data, price, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.name,
        data.preview_image || null,
        data.category || 'عام',
        JSON.stringify(data.design_data),
        data.price || 0,
        data.is_active !== false ? 1 : 0,
        data.sort_order || 0,
      ]
    );
    return this.findById(result.insertId);
  }

  // تحديث قالب
  static async update(id, data) {
    const pool = getPool();
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.preview_image !== undefined) { fields.push('preview_image = ?'); values.push(data.preview_image); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.design_data !== undefined) { fields.push('design_data = ?'); values.push(JSON.stringify(data.design_data)); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order); }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await pool.query(`UPDATE banner_templates SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  // حذف قالب
  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM banner_templates WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = BannerTemplate;
