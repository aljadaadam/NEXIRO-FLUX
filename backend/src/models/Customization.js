const { getPool } = require('../config/db');

class Customization {
  // جلب تخصيصات الموقع
  static async findBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM customizations WHERE site_key = ?', [site_key]);
    return rows[0] || null;
  }

  // إنشاء أو تحديث التخصيصات
  static async upsert(site_key, data) {
    const pool = getPool();

    const fields = {
      theme_id: data.theme_id,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      logo_url: data.logo_url,
      store_name: data.store_name,
      dark_mode: data.dark_mode != null ? (data.dark_mode ? 1 : 0) : undefined,
      button_radius: data.button_radius,
      header_style: data.header_style,
      show_banner: data.show_banner != null ? (data.show_banner ? 1 : 0) : undefined,
      font_family: data.font_family,
      custom_css: data.custom_css,
      footer_text: data.footer_text,
      social_links: data.social_links ? JSON.stringify(data.social_links) : undefined,
      smtp_host: data.smtp_host,
      smtp_port: data.smtp_port != null ? parseInt(data.smtp_port) : undefined,
      smtp_user: data.smtp_user,
      smtp_pass: data.smtp_pass,
      smtp_from: data.smtp_from,
      secondary_currency: data.secondary_currency,
      currency_rate: data.currency_rate != null ? parseFloat(data.currency_rate) : undefined,
      otp_enabled: data.otp_enabled != null ? (data.otp_enabled ? 1 : 0) : undefined,
      store_language: data.store_language,
      support_email: data.support_email,
      support_phone: data.support_phone,
      admin_slug: data.admin_slug,
      flash_enabled: data.flash_enabled != null ? (data.flash_enabled ? 1 : 0) : undefined,
      flash_title: data.flash_title,
      flash_body: data.flash_body,
      flash_image: data.flash_image,
      flash_bg_color: data.flash_bg_color,
      flash_text_color: data.flash_text_color,
      flash_btn_text: data.flash_btn_text,
      flash_btn_url: data.flash_btn_url,
    };

    // تصفية الحقول غير المعرّفة
    const defined = Object.entries(fields).filter(([, v]) => v !== undefined);

    if (defined.length === 0) return this.findBySiteKey(site_key);

    const columns = defined.map(([k]) => k);
    const values = defined.map(([, v]) => v);

    const insertCols = ['site_key', ...columns].join(', ');
    const insertPlaceholders = ['?', ...columns.map(() => '?')].join(', ');
    const updateClause = columns.map(c => `${c} = VALUES(${c})`).join(', ');

    await pool.query(
      `INSERT INTO customizations (${insertCols}) VALUES (${insertPlaceholders})
       ON DUPLICATE KEY UPDATE ${updateClause}`,
      [site_key, ...values]
    );

    return this.findBySiteKey(site_key);
  }

  // حذف تخصيصات (إعادة الافتراضي)
  static async reset(site_key) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM customizations WHERE site_key = ?', [site_key]);
    return result.affectedRows > 0;
  }
}

module.exports = Customization;
