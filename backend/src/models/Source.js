const { getPool } = require('../config/db');
const { encryptApiKey, decryptApiKey, apiKeyLast4 } = require('../utils/apiKeyCrypto');

class Source {
  // إنشاء مصدر جديد
  static async create({ site_key, name, type, url, username, apiKey, profitPercentage, profitAmount, description, syncOnly }) {
    const pool = getPool();

    const encryptedKey = apiKey ? encryptApiKey(apiKey) : null;
    const last4 = apiKey ? apiKeyLast4(apiKey) : null;
    const profit = profitPercentage == null || profitPercentage === '' ? 0 : Number(profitPercentage);
    const profitAmt = profitAmount == null || profitAmount === '' ? null : Number(profitAmount);
    const syncOnlyVal = syncOnly ? 1 : 0;
    
    const [result] = await pool.query(
      'INSERT INTO sources (site_key, name, type, url, username, api_key, api_key_last4, profit_percentage, profit_amount, description, sync_only) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [site_key, name, type, url, username || null, encryptedKey, last4, profit, profitAmt, description, syncOnlyVal]
    );
    
    return this.findById(result.insertId);
  }

  // جلب مصدر بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sources WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static getDecryptedApiKey(sourceRow) {
    return decryptApiKey(sourceRow?.api_key);
  }

  // جلب جميع المصادر للموقع
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM sources WHERE site_key = ? ORDER BY created_at DESC', 
      [site_key]
    );
    return rows;
  }

  // تحديث مصدر
  static async update(id, site_key, { name, type, url, username, apiKey, profitPercentage, profitAmount, description, syncOnly }) {
    const pool = getPool();

    // If apiKey not provided, keep existing one
    let encryptedKey = null;
    let last4 = null;
    if (apiKey !== undefined) {
      encryptedKey = apiKey ? encryptApiKey(apiKey) : null;
      last4 = apiKey ? apiKeyLast4(apiKey) : null;
    }

    const profit = profitPercentage == null || profitPercentage === '' ? 0 : Number(profitPercentage);

    const updates = [];
    const values = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (url !== undefined) { updates.push('url = ?'); values.push(url); }
    if (username !== undefined) { updates.push('username = ?'); values.push(username || null); }
    if (profitPercentage !== undefined) { updates.push('profit_percentage = ?'); values.push(profit); }
    if (profitAmount !== undefined) { updates.push('profit_amount = ?'); values.push(profitAmount == null || profitAmount === '' ? null : Number(profitAmount)); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (syncOnly !== undefined) { updates.push('sync_only = ?'); values.push(syncOnly ? 1 : 0); }
    if (apiKey !== undefined) {
      updates.push('api_key = ?'); values.push(encryptedKey);
      updates.push('api_key_last4 = ?'); values.push(last4);
    }

    if (updates.length === 0) return this.findById(id);
    
    values.push(id, site_key);
    const [result] = await pool.query(
      `UPDATE sources SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  static async updateConnectionStatus(id, site_key, { ok, checkedAt, error, balance, currency }) {
    const pool = getPool();
    const updates = ['last_connection_ok = ?', 'last_connection_checked_at = ?', 'last_connection_error = ?'];
    const values = [ok === null ? null : (ok ? 1 : 0), checkedAt || null, error || null];
    
    if (balance !== undefined) {
      updates.push('last_account_balance = ?');
      values.push(balance || null);
    }
    if (currency !== undefined) {
      updates.push('last_account_currency = ?');
      values.push(currency || null);
    }
    
    values.push(id, site_key);
    
    const [result] = await pool.query(
      `UPDATE sources SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // حذف مصدر
  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM sources WHERE id = ? AND site_key = ?', 
      [id, site_key]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Source;
