const { getPool } = require('../config/db');

class BlogPost {
  // جلب جميع المقالات (أدمن)
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE site_key = ? ORDER BY published_at DESC, id DESC',
      [site_key]
    );
    return rows;
  }

  // جلب المقالات المنشورة فقط (للمتجر — بدون مصادقة)
  static async findPublishedBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE site_key = ? AND is_published = 1 ORDER BY published_at DESC, id DESC',
      [site_key]
    );
    return rows;
  }

  // جلب مقال واحد بالـ id
  static async findById(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return rows[0] || null;
  }

  // جلب مقال واحد منشور (للمتجر) + زيادة عداد القراءات
  static async findPublishedById(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE id = ? AND site_key = ? AND is_published = 1',
      [id, site_key]
    );
    if (rows[0]) {
      await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = ? AND site_key = ?', [id, site_key]);
      rows[0].views = (rows[0].views || 0) + 1;
    }
    return rows[0] || null;
  }

  // إنشاء مقال
  static async create(site_key, data) {
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO blog_posts (site_key, title, title_en, excerpt, excerpt_en, content, category, category_color, image, read_time, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        site_key,
        data.title || '',
        data.title_en || '',
        data.excerpt || '',
        data.excerpt_en || '',
        data.content || '[]',
        data.category || '',
        data.category_color || '#3b82f6',
        data.image || '📝',
        data.read_time || 3,
        data.is_published !== false ? 1 : 0,
        data.published_at || new Date(),
      ]
    );
    return this.findById(result.insertId, site_key);
  }

  // تحديث مقال
  static async update(id, site_key, data) {
    const pool = getPool();
    const fields = [];
    const values = [];
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.title_en !== undefined) { fields.push('title_en = ?'); values.push(data.title_en); }
    if (data.excerpt !== undefined) { fields.push('excerpt = ?'); values.push(data.excerpt); }
    if (data.excerpt_en !== undefined) { fields.push('excerpt_en = ?'); values.push(data.excerpt_en); }
    if (data.content !== undefined) { fields.push('content = ?'); values.push(typeof data.content === 'string' ? data.content : JSON.stringify(data.content)); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.category_color !== undefined) { fields.push('category_color = ?'); values.push(data.category_color); }
    if (data.image !== undefined) { fields.push('image = ?'); values.push(data.image); }
    if (data.read_time !== undefined) { fields.push('read_time = ?'); values.push(data.read_time); }
    if (data.is_published !== undefined) { fields.push('is_published = ?'); values.push(data.is_published ? 1 : 0); }
    if (data.published_at !== undefined) { fields.push('published_at = ?'); values.push(data.published_at); }
    if (fields.length === 0) return this.findById(id, site_key);
    values.push(id, site_key);
    await pool.query(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ? AND site_key = ?`, values);
    return this.findById(id, site_key);
  }

  // حذف مقال
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM blog_posts WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  // SQL إنشاء الجدول
  static getCreateTableSQL() {
    return `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        title_en VARCHAR(500) NULL,
        excerpt TEXT NULL,
        excerpt_en TEXT NULL,
        content LONGTEXT NULL COMMENT 'JSON array of paragraphs',
        category VARCHAR(100) NULL,
        category_color VARCHAR(20) DEFAULT '#3b82f6',
        image VARCHAR(100) DEFAULT '📝',
        read_time INT DEFAULT 3,
        views INT DEFAULT 0,
        is_published TINYINT(1) DEFAULT 1,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE,
        INDEX idx_blog_site_published (site_key, is_published, published_at)
      )
    `;
  }
}

module.exports = BlogPost;
