const { getPool } = require('../config/db');

class Branch {
  /**
   * إنشاء فرع جديد
   */
  static async create({ site_key, name, name_en, address, address_en, city, phone, email, lat, lng, working_hours, is_main, image }) {
    const pool = getPool();

    // إذا كان الفرع الرئيسي — إزالة الحالة من الفروع الأخرى
    if (is_main) {
      await pool.query('UPDATE branches SET is_main = 0 WHERE site_key = ?', [site_key]);
    }

    const [result] = await pool.query(
      `INSERT INTO branches (site_key, name, name_en, address, address_en, city, phone, email, lat, lng, working_hours, is_main, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_key, name, name_en || null, address || null, address_en || null, city || null,
       phone || null, email || null, lat || null, lng || null, working_hours || null,
       is_main ? 1 : 0, image || null]
    );
    return this.findById(result.insertId);
  }

  /**
   * جلب فرع حسب ID
   */
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * جلب فرع حسب ID و site_key
   */
  static async findByIdAndSite(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM branches WHERE id = ? AND site_key = ?', [id, site_key]);
    return rows[0] || null;
  }

  /**
   * جلب جميع الفروع لموقع معين
   */
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM branches WHERE site_key = ? ORDER BY is_main DESC, created_at ASC',
      [site_key]
    );
    return rows;
  }

  /**
   * جلب الفروع النشطة فقط (للعرض العام)
   */
  static async findActiveBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM branches WHERE site_key = ? AND status = 'active' ORDER BY is_main DESC, created_at ASC",
      [site_key]
    );
    return rows;
  }

  /**
   * تحديث فرع
   */
  static async update(id, site_key, data) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'name_en', 'address', 'address_en', 'city', 'phone', 'email', 'lat', 'lng', 'working_hours', 'is_main', 'image', 'status'];
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === 'is_main' ? (data[key] ? 1 : 0) : data[key]);
      }
    }

    if (fields.length === 0) return this.findByIdAndSite(id, site_key);

    // إذا تم تعيين كفرع رئيسي — إزالة الحالة من الفروع الأخرى
    if (data.is_main) {
      await pool.query('UPDATE branches SET is_main = 0 WHERE site_key = ? AND id != ?', [site_key, id]);
    }

    values.push(id, site_key);
    await pool.query(
      `UPDATE branches SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );

    return this.findByIdAndSite(id, site_key);
  }

  /**
   * حذف فرع
   */
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM branches WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  /**
   * عد الفروع لموقع
   */
  static async countBySite(site_key) {
    const pool = getPool();
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM branches WHERE site_key = ?',
      [site_key]
    );
    return count;
  }
}

module.exports = Branch;
