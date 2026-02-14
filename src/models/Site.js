const { getPool } = require('../config/db');

class Site {
  static async create({ site_key, domain, name }) {
    const pool = getPool();
    
    const [result] = await pool.query(
      'INSERT INTO sites (site_key, domain, name) VALUES (?, ?, ?)',
      [site_key, domain, name]
    );
    
    return this.findBySiteKey(site_key);
  }

  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sites WHERE site_key = ?', [site_key]);
    return rows[0] || null;
  }

  static async findByDomain(domain) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sites WHERE domain = ?', [domain]);
    return rows[0] || null;
  }

  static async findAll() {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sites ORDER BY created_at DESC');
    return rows;
  }

  static async validateSiteKey(site_key) {
    const site = await this.findBySiteKey(site_key);
    return !!site;
  }
}

module.exports = Site;