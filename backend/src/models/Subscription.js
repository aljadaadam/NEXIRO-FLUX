const { getPool } = require('../config/db');

class Subscription {
  // إنشاء اشتراك
  static async create({ site_key, plan_id, template_id, billing_cycle, price }) {
    const pool = getPool();

    // حساب تاريخ الانتهاء
    let expires_at = null;
    const now = new Date();
    if (billing_cycle === 'monthly') {
      expires_at = new Date(now.setMonth(now.getMonth() + 1));
    } else if (billing_cycle === 'yearly') {
      expires_at = new Date(now.setFullYear(now.getFullYear() + 1));
    }
    // lifetime = null (لا ينتهي)

    const trial_ends = new Date();
    trial_ends.setDate(trial_ends.getDate() + 14); // 14 يوم تجربة

    const [result] = await pool.query(
      `INSERT INTO subscriptions (site_key, plan_id, template_id, billing_cycle, price, status, trial_ends_at, expires_at)
       VALUES (?, ?, ?, ?, ?, 'trial', ?, ?)`,
      [site_key, plan_id, template_id, billing_cycle || 'monthly', price || 0, trial_ends, expires_at]
    );

    return this.findById(result.insertId);
  }

  // البحث بالـ ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM subscriptions WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // جلب اشتراك الموقع النشط
  static async findActiveBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM subscriptions WHERE site_key = ? AND status IN ('active', 'trial') ORDER BY created_at DESC LIMIT 1",
      [site_key]
    );
    return rows[0] || null;
  }

  // تفعيل الاشتراك
  static async activate(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      "UPDATE subscriptions SET status = 'active', starts_at = NOW() WHERE id = ? AND site_key = ?",
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  // إلغاء الاشتراك
  static async cancel(id, site_key) {
    const pool = getPool();
    const [result] = await pool.query(
      "UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE id = ? AND site_key = ?",
      [id, site_key]
    );
    return result.affectedRows > 0;
  }

  // تجديد الاشتراك
  static async renew(id, site_key, new_expires_at) {
    const pool = getPool();
    const [result] = await pool.query(
      "UPDATE subscriptions SET status = 'active', expires_at = ? WHERE id = ? AND site_key = ?",
      [new_expires_at, id, site_key]
    );
    return result.affectedRows > 0;
  }

  // التحقق من صلاحية الاشتراك
  static async isValid(site_key) {
    const sub = await this.findActiveBySiteKey(site_key);
    if (!sub) return false;

    if (sub.status === 'trial') {
      return sub.trial_ends_at ? new Date(sub.trial_ends_at) > new Date() : false;
    }

    if (sub.status === 'active') {
      if (sub.billing_cycle === 'lifetime') return true;
      return sub.expires_at ? new Date(sub.expires_at) > new Date() : false;
    }

    return false;
  }
}

module.exports = Subscription;
