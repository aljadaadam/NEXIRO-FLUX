const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ site_key, name, email, password, role = 'user' }) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.query(
      'INSERT INTO users (site_key, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [site_key, name, email, hashedPassword, role]
    );
    
    return this.findById(result.insertId);
  }

  static async findById(id, site_key = null) {
    const pool = getPool();
    let query = 'SELECT id, site_key, name, email, role, created_at FROM users WHERE id = ?';
    const params = [id];
    if (site_key) {
      query += ' AND site_key = ?';
      params.push(site_key);
    }
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  }

  static async findByEmailAndSite(email, site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND site_key = ?', 
      [email, site_key]
    );
    return rows[0] || null;
  }

  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, site_key, name, email, role, created_at FROM users WHERE site_key = ?', 
      [site_key]
    );
    return rows;
  }

  // بحث عن مستخدم بدور محدد في موقع
  static async findByRole(site_key, role) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE site_key = ? AND role = ? LIMIT 1',
      [site_key, role]
    );
    return rows[0] || null;
  }

  static async update(id, site_key, { name, email }) {
    const pool = getPool();
    
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ? AND site_key = ?',
      [name, email, id, site_key]
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND site_key = ?', 
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  static async deleteAdminBySiteKey(site_key) {
    const pool = getPool();
    const [result] = await pool.query(
        'DELETE FROM users WHERE site_key = ? AND role = "admin"', 
        [site_key]
    );
    return result.affectedRows; // إرجاع عدد الصفوف المحذوفة
}


  static async comparePassword(candidatePassword, hashedPassword) {
      try {
          return await bcrypt.compare(candidatePassword, hashedPassword);
      } catch (error) {
          console.error('Bcrypt compare error');
          return false;
      }
  }

  static async countBySite(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE site_key = ?', 
      [site_key]
    );
    return rows[0].count;
  }

  static async countNewTodayBySite(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE site_key = ? AND DATE(created_at) = CURDATE()', 
      [site_key]
    );
    return rows[0].count;
  }

  // Find user by email (any site) or create from Google OAuth
  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  static async findOrCreateByGoogle({ site_key, name, email, googleId, defaultRole = 'user' }) {
    // First check if user exists for this site
    let user = await this.findByEmailAndSite(email, site_key);
    
    if (user) {
      // Update google_id if not set
      if (!user.google_id && googleId) {
        const pool = getPool();
        await pool.query(
          'UPDATE users SET google_id = ? WHERE id = ?',
          [googleId, user.id]
        );
      }
      return { user: await this.findById(user.id), isNew: false };
    }

    // Create new user without password (Google OAuth user)
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO users (site_key, name, email, password, role, google_id) VALUES (?, ?, ?, ?, ?, ?)',
      [site_key, name, email, 'GOOGLE_OAUTH_NO_PASSWORD', defaultRole, googleId]
    );

    return { user: await this.findById(result.insertId), isNew: true };
  }
}

module.exports = User;