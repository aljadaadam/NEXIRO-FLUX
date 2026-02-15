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
    const [rows] = await pool.query('SELECT * FROM sites WHERE domain = ?', [domain.toLowerCase()]);
    return rows[0] || null;
  }

  static async findByCustomDomain(domain) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sites WHERE custom_domain = ?', [domain.toLowerCase()]);
    return rows[0] || null;
  }

  static async findByAnyDomain(domain) {
    const pool = getPool();
    const d = domain.toLowerCase();
    const [rows] = await pool.query(
      'SELECT * FROM sites WHERE domain = ? OR custom_domain = ?',
      [d, d]
    );
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

  static async updateCustomDomain(site_key, custom_domain) {
    const pool = getPool();
    await pool.query(
      'UPDATE sites SET custom_domain = ? WHERE site_key = ?',
      [custom_domain ? custom_domain.toLowerCase() : null, site_key]
    );
    return this.findBySiteKey(site_key);
  }

  static async updateDomain(site_key, domain) {
    const pool = getPool();
    await pool.query(
      'UPDATE sites SET domain = ? WHERE site_key = ?',
      [domain.toLowerCase(), site_key]
    );
    return this.findBySiteKey(site_key);
  }
}

module.exports = Site;