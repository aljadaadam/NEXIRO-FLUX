const { getPool } = require('../config/db');

class Payment {
  // ─── التأكد من وجود الأعمدة الإضافية (مرة واحدة فقط) ───
  static _columnsEnsured = false;
  static async ensureColumns() {
    if (this._columnsEnsured) return;
    const pool = getPool();
    const addCol = async (col, def) => {
      try { await pool.query(`ALTER TABLE payments ADD COLUMN ${col} ${def}`); } catch(e) { /* exists */ }
    };
    await addCol('external_id', 'VARCHAR(255) DEFAULT NULL');
    await addCol('meta', 'JSON DEFAULT NULL');
    await addCol('invoice_number', 'VARCHAR(50) DEFAULT NULL AFTER external_id');
    // إنشاء index للبحث السريع
    try { await pool.query('CREATE INDEX idx_payments_invoice ON payments (invoice_number)'); } catch(e) { /* exists */ }
    this._columnsEnsured = true;
  }

  // ─── توليد رقم فاتورة تسلسلي فريد لكل موقع ───
  static async generateInvoiceNumber(pool, site_key) {
    const [lastRow] = await pool.query(
      'SELECT invoice_number FROM payments WHERE site_key = ? AND invoice_number REGEXP "^INV-[0-9]+$" ORDER BY CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED) DESC LIMIT 1',
      [site_key]
    );
    let nextNum = 10000; // يبدأ من INV-10000
    if (lastRow.length > 0) {
      const lastNum = parseInt(lastRow[0].invoice_number.replace('INV-', ''));
      nextNum = lastNum + 1;
    }
    return `INV-${nextNum}`;
  }

  // إنشاء عملية دفع
  static async create({ site_key, customer_id, order_id, type, amount, currency, payment_method, payment_gateway_id, status, description }) {
    const pool = getPool();
    await this.ensureColumns();

    // توليد رقم فاتورة تسلسلي
    const invoice_number = await this.generateInvoiceNumber(pool, site_key);

    const [result] = await pool.query(
      `INSERT INTO payments (site_key, customer_id, order_id, type, amount, currency, payment_method, payment_gateway_id, status, description, invoice_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_key, customer_id || null, order_id || null, type || 'purchase', amount, currency || 'USD', payment_method, payment_gateway_id || null, status || 'pending', description || null, invoice_number]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    const row = rows[0] || null;
    if (row && row.meta && typeof row.meta === 'string') {
      try { row.meta = JSON.parse(row.meta); } catch (e) { /* ignore */ }
    }
    return row;
  }

  // جلب مدفوعات موقع
  static async findBySiteKey(site_key, { page = 1, limit = 50, type, customer_id, search } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as customer_name FROM payments p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.site_key = ?';
    const params = [site_key];

    if (type) { query += ' AND p.type = ?'; params.push(type); }
    if (customer_id) { query += ' AND p.customer_id = ?'; params.push(customer_id); }
    // بحث بالفاتورة أو اسم العميل أو external_id
    if (search) {
      query += ' AND (p.invoice_number LIKE ? OR c.name LIKE ? OR p.external_id LIKE ? OR CAST(p.id AS CHAR) = ?)';
      const like = `%${search}%`;
      params.push(like, like, like, search);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    // Parse meta JSON string from MariaDB
    return rows.map(row => {
      if (row.meta && typeof row.meta === 'string') {
        try { row.meta = JSON.parse(row.meta); } catch (e) { /* ignore */ }
      }
      return row;
    });
  }

  // تحديث حالة الدفع
  static async updateStatus(id, site_key, status) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE payments SET status = ? WHERE id = ? AND site_key = ?',
      [status, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // تحديث ذري: فقط إذا كانت الحالة الحالية تتطابق مع المتوقع (Race-Condition Safe)
  static async updateStatusAtomic(id, site_key, expectedStatus, newStatus) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE payments SET status = ? WHERE id = ? AND site_key = ? AND status = ?',
      [newStatus, id, site_key, expectedStatus]
    );
    return result.affectedRows > 0;
  }

  // إحصائيات المدفوعات
  static async getStats(site_key) {
    const pool = getPool();
    const [totalRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE site_key = ? AND status = 'completed'",
      [site_key]
    );
    const [todayRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE site_key = ? AND status = 'completed' AND DATE(created_at) = CURDATE()",
      [site_key]
    );
    const [depositRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE site_key = ? AND type = 'deposit' AND status = 'completed'",
      [site_key]
    );

    return {
      totalRevenue: parseFloat(totalRows[0].total),
      todayRevenue: parseFloat(todayRows[0].total),
      totalDeposits: parseFloat(depositRows[0].total)
    };
  }

  // ─── تحديث external_id ───
  static async updateExternalId(id, site_key, externalId) {
    const pool = getPool();
    await this.ensureColumns();
    await pool.query(
      'UPDATE payments SET external_id = ? WHERE id = ? AND site_key = ?',
      [externalId, id, site_key]
    );
  }

  // ─── البحث بالـ external_id ───
  static async findByExternalId(externalId, site_key) {
    const pool = getPool();
    await this.ensureColumns();
    const [rows] = await pool.query(
      'SELECT * FROM payments WHERE external_id = ? AND site_key = ?',
      [externalId, site_key]
    );
    return rows[0] || null;
  }

  // ─── بحث بالـ external_id بدون site_key (للـ webhooks) ───
  static async findByExternalIdGlobal(externalId) {
    const pool = getPool();
    await this.ensureColumns();
    const [rows] = await pool.query(
      'SELECT * FROM payments WHERE external_id = ? LIMIT 1',
      [externalId]
    );
    return rows[0] || null;
  }

  // ─── بحث بالـ invoice_number ───
  static async findByInvoiceNumber(invoiceNumber, site_key) {
    const pool = getPool();
    await this.ensureColumns();
    const [rows] = await pool.query(
      'SELECT p.*, c.name as customer_name FROM payments p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.invoice_number = ? AND p.site_key = ?',
      [invoiceNumber, site_key]
    );
    const row = rows[0] || null;
    if (row && row.meta && typeof row.meta === 'string') {
      try { row.meta = JSON.parse(row.meta); } catch (e) { /* ignore */ }
    }
    return row;
  }

  // ─── تحديث metadata ───
  static async updateMeta(id, site_key, newMeta) {
    const pool = getPool();
    await this.ensureColumns();
    // جلب meta الحالي ودمجه
    const [rows] = await pool.query('SELECT meta FROM payments WHERE id = ? AND site_key = ?', [id, site_key]);
    let existing = {};
    if (rows[0]?.meta) {
      existing = typeof rows[0].meta === 'string' ? JSON.parse(rows[0].meta) : rows[0].meta;
    }
    const merged = { ...existing, ...newMeta };
    await pool.query(
      'UPDATE payments SET meta = ? WHERE id = ? AND site_key = ?',
      [JSON.stringify(merged), id, site_key]
    );
  }

  // ─── جلب metadata ───
  static async getMeta(id, site_key) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT meta FROM payments WHERE id = ? AND site_key = ?', [id, site_key]);
    if (!rows[0]?.meta) return null;
    return typeof rows[0].meta === 'string' ? JSON.parse(rows[0].meta) : rows[0].meta;
  }

  // ─── Pending Binance deposits (global, for cron) ───
  static async findPendingBinanceDepositsGlobal({ limit = 50 } = {}) {
    const pool = getPool();
    await this.ensureColumns();
    const [rows] = await pool.query(
      `SELECT id, site_key, customer_id, payment_gateway_id, amount, currency, payment_method, external_id, status, type, created_at
       FROM payments
       WHERE status = 'pending'
         AND type = 'deposit'
         AND payment_method = 'binance'
         AND external_id IS NOT NULL
       ORDER BY created_at DESC
       LIMIT ?`,
      [Number(limit) || 50]
    );
    return rows;
  }

  // ─── Pending Binance payments (global, for cron) ───
  // Includes purchases and deposits; wallet credit will only apply to deposits.
  static async findPendingBinancePaymentsGlobal({ limit = 50 } = {}) {
    const pool = getPool();
    await this.ensureColumns();
    const [rows] = await pool.query(
      `SELECT id, site_key, customer_id, payment_gateway_id, amount, currency, payment_method, external_id, status, type, created_at
       FROM payments
       WHERE status = 'pending'
         AND payment_method = 'binance'
         AND external_id IS NOT NULL
       ORDER BY created_at DESC
       LIMIT ?`,
      [Number(limit) || 50]
    );
    return rows;
  }
}

module.exports = Payment;
