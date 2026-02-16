const { getPool } = require('../config/db');

class Product {
  static async create({ site_key, name, arabic_name, description, price, service_type = 'SERVER', category = null, status = 'active', image = null, qnt = null }) {
    const pool = getPool();
    
    const [result] = await pool.query(
      `INSERT INTO products
       (site_key, name, arabic_name, description, price, service_type, category, status, image, qnt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_key, name, arabic_name || null, description, price, service_type, category, status, image, qnt]
    );
    
    return this.findById(result.insertId);
  }

  static async upsertExternalService({
    site_key,
    source_id,
    user_id,
    external_service_key,
    external_service_id,
    group_name,
    group_type,
    service_type,
    name,
    price,
    credit,
    credit_raw,
    service_time,
    service_info,
    minqnt,
    maxqnt,
    qnt,
    server_flag,
    custom_json,
    requires_custom_json,
    raw_json,
    description,
    source_price,
    final_price,
    profit_percentage_applied
  }) {
    const pool = getPool();

    const safeExternalKey = external_service_key == null ? null : String(external_service_key);
    const safeName = name == null ? null : String(name);

    // Check if this product exists and has a custom price
    const [existing] = await pool.query(
      'SELECT id, is_custom_price, price FROM products WHERE site_key = ? AND external_service_key = ?',
      [site_key, safeExternalKey]
    );

    const hasCustomPrice = existing.length > 0 && existing[0].is_custom_price === 1;
    const finalPrice = hasCustomPrice ? existing[0].price : price;

    const [result] = await pool.query(
      `INSERT INTO products (
        site_key,
        source_id,
        user_id,
        external_service_key,
        external_service_id,
        group_name,
        group_type,
        service_type,
        name,
        description,
        price,
        credit,
        credit_raw,
        source_price,
        final_price,
        profit_percentage_applied,
        service_time,
        service_info,
        minqnt,
        maxqnt,
        qnt,
        server_flag,
        custom_json,
        requires_custom_json,
        raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        external_service_id = VALUES(external_service_id),
        group_name = VALUES(group_name),
        group_type = VALUES(group_type),
        service_type = VALUES(service_type),
        name = VALUES(name),
        description = VALUES(description),
        price = IF(is_custom_price = 1, price, VALUES(price)),
        credit = VALUES(credit),
        credit_raw = VALUES(credit_raw),
        source_price = VALUES(source_price),
        final_price = VALUES(final_price),
        profit_percentage_applied = VALUES(profit_percentage_applied),
        service_time = VALUES(service_time),
        service_info = VALUES(service_info),
        minqnt = VALUES(minqnt),
        maxqnt = VALUES(maxqnt),
        qnt = VALUES(qnt),
        server_flag = VALUES(server_flag),
        custom_json = VALUES(custom_json),
        requires_custom_json = VALUES(requires_custom_json),
        raw_json = VALUES(raw_json)`,
      [
        site_key,
        source_id ?? null,
        user_id ?? null,
        safeExternalKey,
        external_service_id ?? null,
        group_name ?? null,
        group_type ?? null,
        service_type ?? null,
        safeName,
        description ?? null,
        finalPrice ?? null,
        credit ?? null,
        credit_raw ?? null,
        source_price ?? null,
        final_price ?? null,
        profit_percentage_applied ?? null,
        service_time ?? null,
        service_info ?? null,
        minqnt ?? null,
        maxqnt ?? null,
        qnt ?? null,
        server_flag ?? null,
        custom_json == null ? null : JSON.stringify(custom_json),
        requires_custom_json == null ? null : JSON.stringify(requires_custom_json),
        raw_json == null ? null : JSON.stringify(raw_json)
      ]
    );

    // NOTE: mysql2 returns insertId=0 on duplicate updates; return a lightweight status.
    return {
      affectedRows: result.affectedRows,
      insertedId: result.insertId || null
    };
  }

  static async countBySource(site_key, source_id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE site_key = ? AND source_id = ?',
      [site_key, source_id]
    );
    return Number(rows?.[0]?.count || 0);
  }

  static async countBySources(site_key, sourceIds) {
    const ids = Array.isArray(sourceIds) ? sourceIds.filter(v => v != null) : [];
    if (ids.length === 0) return {};
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT source_id, COUNT(*) AS count
       FROM products
       WHERE site_key = ? AND source_id IN (${ids.map(() => '?').join(',')})
       GROUP BY source_id`,
      [site_key, ...ids]
    );
    const map = {};
    for (const row of rows) map[String(row.source_id)] = Number(row.count || 0);
    return map;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE site_key = ? ORDER BY created_at DESC', 
      [site_key]
    );
    return rows;
  }

  static async toggleFeatured(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE products SET is_featured = IF(is_featured = 1, 0, 1) WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }

  static async update(id, site_key, { name, arabic_name, description, price, service_type, source_id, image, status, category, qnt }) {
    const pool = getPool();
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (arabic_name !== undefined) { updates.push('arabic_name = ?'); values.push(arabic_name || null); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (price !== undefined) { 
      updates.push('price = ?'); 
      values.push(price);
      // Mark as custom price when manually edited
      updates.push('is_custom_price = 1');
    }
    if (service_type !== undefined) { updates.push('service_type = ?'); values.push(service_type); }
    if (source_id !== undefined) { updates.push('source_id = ?'); values.push(source_id); }
    if (image !== undefined) { updates.push('image = ?'); values.push(image); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (qnt !== undefined) { updates.push('qnt = ?'); values.push(qnt); }
    
    if (updates.length === 0) return this.findById(id);
    
    values.push(id, site_key);
    
    const [result] = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND site_key = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  static async delete(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ? AND site_key = ?', 
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  static async countBySite(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE site_key = ?', 
      [site_key]
    );
    return rows[0].count;
  }
}

module.exports = Product;