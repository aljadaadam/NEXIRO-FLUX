const { getPool } = require('../config/db');

class PurchaseCode {
  // ─── إنشاء جدول أكواد الشراء (يُنادى من db.js) ───
  static getCreateTableSQL() {
    return `
      CREATE TABLE IF NOT EXISTS purchase_codes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        template_id VARCHAR(100) NULL COMMENT 'null = يعمل لجميع القوالب',
        billing_cycle ENUM('monthly', 'yearly', 'lifetime') NOT NULL DEFAULT 'monthly',
        discount_type ENUM('full', 'percentage', 'fixed') NOT NULL DEFAULT 'full' COMMENT 'full=مجاني, percentage=نسبة, fixed=مبلغ ثابت',
        discount_value DECIMAL(10, 2) DEFAULT 0 COMMENT 'النسبة أو المبلغ (0 لـ full)',
        max_uses INT DEFAULT 1 COMMENT 'عدد مرات الاستخدام المسموح',
        used_count INT DEFAULT 0 COMMENT 'عدد مرات الاستخدام الفعلي',
        used_by JSON NULL COMMENT '[{email, site_key, used_at}]',
        expires_at DATETIME NULL COMMENT 'تاريخ انتهاء الكود',
        is_active TINYINT(1) DEFAULT 1,
        note TEXT NULL COMMENT 'ملاحظة داخلية',
        created_by VARCHAR(100) NULL COMMENT 'من أنشأ الكود',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
  }

  // ─── إنشاء كود جديد ───
  static async create(data) {
    const pool = getPool();
    const {
      code,
      template_id = null,
      billing_cycle = 'monthly',
      discount_type = 'full',
      discount_value = 0,
      max_uses = 1,
      expires_at = null,
      note = null,
      created_by = null,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO purchase_codes (code, template_id, billing_cycle, discount_type, discount_value, max_uses, expires_at, note, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), template_id, billing_cycle, discount_type, discount_value, max_uses, expires_at, note, created_by]
    );

    return { id: result.insertId, code: code.toUpperCase(), ...data };
  }

  // ─── البحث عن كود ───
  static async findByCode(code) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM purchase_codes WHERE code = ?', [code.toUpperCase()]);
    return rows[0] || null;
  }

  // ─── التحقق من صلاحية الكود ───
  static async validate(code, templateId = null) {
    const pc = await this.findByCode(code);

    if (!pc) {
      return { valid: false, error: 'الكود غير موجود', errorEn: 'Code not found' };
    }
    if (!pc.is_active) {
      return { valid: false, error: 'الكود معطل', errorEn: 'Code is disabled' };
    }
    if (pc.max_uses > 0 && pc.used_count >= pc.max_uses) {
      return { valid: false, error: 'الكود تم استخدامه بالكامل', errorEn: 'Code has been fully used' };
    }
    if (pc.expires_at && new Date(pc.expires_at) < new Date()) {
      return { valid: false, error: 'الكود منتهي الصلاحية', errorEn: 'Code has expired' };
    }
    if (pc.template_id && templateId && pc.template_id !== templateId) {
      return { valid: false, error: 'الكود لا ينطبق على هذا القالب', errorEn: 'Code does not apply to this template' };
    }

    return {
      valid: true,
      code: pc,
      discount_type: pc.discount_type,
      discount_value: pc.discount_value,
      billing_cycle: pc.billing_cycle,
      template_id: pc.template_id,
    };
  }

  // ─── تسجيل استخدام الكود ───
  static async markUsed(code, email, siteKey) {
    const pool = getPool();
    const pc = await this.findByCode(code);
    if (!pc) return false;

    const usedBy = pc.used_by ? JSON.parse(pc.used_by) : [];
    usedBy.push({ email, site_key: siteKey, used_at: new Date().toISOString() });

    await pool.query(
      `UPDATE purchase_codes SET used_count = used_count + 1, used_by = ? WHERE id = ?`,
      [JSON.stringify(usedBy), pc.id]
    );

    return true;
  }

  // ─── جلب جميع الأكواد ───
  static async findAll(filters = {}) {
    const pool = getPool();
    let sql = 'SELECT * FROM purchase_codes WHERE 1=1';
    const params = [];

    if (filters.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    if (filters.template_id) {
      sql += ' AND (template_id = ? OR template_id IS NULL)';
      params.push(filters.template_id);
    }
    if (filters.search) {
      sql += ' AND (code LIKE ? OR note LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(Number(filters.limit));
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // ─── تحديث كود ───
  static async update(id, data) {
    const pool = getPool();
    const fields = [];
    const params = [];

    const allowedFields = ['template_id', 'billing_cycle', 'discount_type', 'discount_value', 'max_uses', 'expires_at', 'is_active', 'note'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return null;

    params.push(id);
    await pool.query(`UPDATE purchase_codes SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  // ─── جلب كود بالـ ID ───
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM purchase_codes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // ─── حذف كود ───
  static async delete(id) {
    const pool = getPool();
    await pool.query('DELETE FROM purchase_codes WHERE id = ?', [id]);
    return true;
  }

  // ─── إحصائيات ───
  static async getStats() {
    const pool = getPool();
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as disabled,
        SUM(used_count) as total_uses,
        SUM(CASE WHEN max_uses > 0 AND used_count >= max_uses THEN 1 ELSE 0 END) as fully_used,
        SUM(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 ELSE 0 END) as expired
      FROM purchase_codes
    `);
    return stats;
  }

  // ─── توليد كود عشوائي ───
  static generateCode(prefix = 'NX', length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون حروف مشابهة (O,0,I,1)
    let code = prefix + '-';
    for (let i = 0; i < length; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ─── توليد أكواد متعددة ───
  static async generateBatch(count, data) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateCode(data.prefix || 'NX', data.length || 12);
      const created = await this.create({ ...data, code });
      codes.push(created);
    }
    return codes;
  }
}

module.exports = PurchaseCode;
