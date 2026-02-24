/**
 * ─── Column Migrations ───
 * Ensures all columns exist for backward compatibility with older databases.
 * Each function group handles migrations for a specific table.
 */
const { ensureColumn, indexExists } = require('../helpers');

/**
 * Run all column migrations
 */
async function runColumnMigrations(pool) {
  await migrateSites(pool);
  await migrateProducts(pool);
  await migrateSources(pool);
  await migrateCustomizations(pool);
  await migrateUsers(pool);
  await migrateOrders(pool);
  await migrateProductIndexes(pool);
}

// ─── Sites Columns ───
async function migrateSites(pool) {
  await ensureColumn(pool, 'sites', 'template_id', "template_id VARCHAR(100) NULL COMMENT 'القالب المختار'");
  await ensureColumn(pool, 'sites', 'plan', "plan VARCHAR(50) DEFAULT 'trial' COMMENT 'الخطة الحالية'");
  await ensureColumn(pool, 'sites', 'status', "status ENUM('active', 'suspended', 'pending') DEFAULT 'active'");
  await ensureColumn(pool, 'sites', 'owner_email', 'owner_email VARCHAR(100) NULL');
  await ensureColumn(pool, 'sites', 'settings', 'settings JSON NULL');
  await ensureColumn(pool, 'sites', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await ensureColumn(pool, 'sites', 'custom_domain', 'custom_domain VARCHAR(255) NULL UNIQUE');
  await ensureColumn(pool, 'sites', 'dns_verified', 'dns_verified TINYINT(1) DEFAULT 0');
}

// ─── Products Columns ───
async function migrateProducts(pool) {
  await ensureColumn(pool, 'products', 'service_type', "service_type VARCHAR(50) DEFAULT 'SERVER'");
  await ensureColumn(pool, 'products', 'arabic_name', 'arabic_name VARCHAR(200) NULL');
  await ensureColumn(pool, 'products', 'category', 'category VARCHAR(100) NULL');
  await ensureColumn(pool, 'products', 'status', "status VARCHAR(30) DEFAULT 'active'");
  await ensureColumn(pool, 'products', 'image', 'image TEXT NULL');
  await ensureColumn(pool, 'products', 'source_id', 'source_id INT NULL');
  await ensureColumn(pool, 'products', 'user_id', 'user_id INT NULL');
  await ensureColumn(pool, 'products', 'external_service_key', 'external_service_key VARCHAR(64) NULL');
  await ensureColumn(pool, 'products', 'external_service_id', 'external_service_id BIGINT NULL');
  await ensureColumn(pool, 'products', 'group_name', 'group_name VARCHAR(255) NULL');
  await ensureColumn(pool, 'products', 'group_type', 'group_type VARCHAR(50) NULL');
  await ensureColumn(pool, 'products', 'credit', 'credit DECIMAL(12, 3) NULL');
  await ensureColumn(pool, 'products', 'credit_raw', 'credit_raw VARCHAR(32) NULL');
  await ensureColumn(pool, 'products', 'source_price', 'source_price DECIMAL(12, 3) NULL');
  await ensureColumn(pool, 'products', 'final_price', 'final_price DECIMAL(12, 3) NULL');
  await ensureColumn(pool, 'products', 'profit_percentage_applied', 'profit_percentage_applied DECIMAL(7, 3) NULL');
  await ensureColumn(pool, 'products', 'is_custom_price', 'is_custom_price TINYINT(1) DEFAULT 0');
  await ensureColumn(pool, 'products', 'service_time', 'service_time VARCHAR(255) NULL');
  await ensureColumn(pool, 'products', 'service_info', 'service_info TEXT NULL');
  await ensureColumn(pool, 'products', 'minqnt', 'minqnt VARCHAR(32) NULL');
  await ensureColumn(pool, 'products', 'maxqnt', 'maxqnt VARCHAR(32) NULL');
  await ensureColumn(pool, 'products', 'qnt', 'qnt VARCHAR(32) NULL');
  await ensureColumn(pool, 'products', 'server_flag', 'server_flag VARCHAR(32) NULL');
  await ensureColumn(pool, 'products', 'custom_json', 'custom_json JSON NULL');
  await ensureColumn(pool, 'products', 'requires_custom_json', 'requires_custom_json JSON NULL');
  await ensureColumn(pool, 'products', 'raw_json', 'raw_json JSON NULL');
  await ensureColumn(pool, 'products', 'is_featured', 'is_featured TINYINT(1) DEFAULT 0');
  await ensureColumn(pool, 'products', 'is_game', 'is_game TINYINT(1) DEFAULT 0');
  await ensureColumn(pool, 'products', 'name_priority', "name_priority VARCHAR(5) DEFAULT 'ar'");
  await ensureColumn(pool, 'products', 'linked_product_id', 'linked_product_id INT NULL');
}

// ─── Sources Columns ───
async function migrateSources(pool) {
  await ensureColumn(pool, 'sources', 'username', 'username VARCHAR(255) NULL');
  await ensureColumn(pool, 'sources', 'api_key_last4', 'api_key_last4 VARCHAR(8) NULL');
  await ensureColumn(pool, 'sources', 'profit_percentage', 'profit_percentage DECIMAL(7, 3) NOT NULL DEFAULT 0');
  await ensureColumn(pool, 'sources', 'profit_amount', "profit_amount DECIMAL(12, 3) NULL COMMENT 'ربح ثابت بالدولار يُضاف على سعر المصدر'");
  await ensureColumn(pool, 'sources', 'last_connection_ok', 'last_connection_ok TINYINT(1) NULL');
  await ensureColumn(pool, 'sources', 'last_connection_checked_at', 'last_connection_checked_at DATETIME NULL');
  await ensureColumn(pool, 'sources', 'last_connection_error', 'last_connection_error TEXT NULL');
  await ensureColumn(pool, 'sources', 'last_account_balance', 'last_account_balance VARCHAR(100) NULL');
  await ensureColumn(pool, 'sources', 'last_account_currency', 'last_account_currency VARCHAR(10) NULL');
}

// ─── Customizations Columns ───
async function migrateCustomizations(pool) {
  // Admin panel security slug
  await ensureColumn(pool, 'customizations', 'admin_slug', "admin_slug VARCHAR(32) NULL COMMENT 'مسار فريد للوحة الأدمن'");

  // Auto-generate admin_slug for existing rows that don't have one
  try {
    const [emptySlugRows] = await pool.query(
      'SELECT id FROM customizations WHERE admin_slug IS NULL OR admin_slug = ""'
    );
    for (const row of emptySlugRows) {
      const slug = require('crypto').randomBytes(6).toString('hex');
      await pool.query('UPDATE customizations SET admin_slug = ? WHERE id = ?', [slug, row.id]);
    }
    if (emptySlugRows.length > 0) {
      console.log(`✅ Generated admin_slug for ${emptySlugRows.length} customization(s)`);
    }
  } catch (e) { /* ignore */ }

  // Flash popup
  await ensureColumn(pool, 'customizations', 'flash_enabled', "flash_enabled TINYINT(1) DEFAULT 0 COMMENT 'تفعيل فلاش الإعلان'");
  await ensureColumn(pool, 'customizations', 'flash_title', "flash_title VARCHAR(255) NULL COMMENT 'عنوان الفلاش'");
  await ensureColumn(pool, 'customizations', 'flash_body', "flash_body TEXT NULL COMMENT 'محتوى الفلاش'");
  await ensureColumn(pool, 'customizations', 'flash_image', "flash_image TEXT NULL COMMENT 'صورة أو GIF للفلاش'");
  await ensureColumn(pool, 'customizations', 'flash_bg_color', "flash_bg_color VARCHAR(20) DEFAULT '#7c5cff' COMMENT 'لون خلفية الفلاش'");
  await ensureColumn(pool, 'customizations', 'flash_text_color', "flash_text_color VARCHAR(20) DEFAULT '#ffffff' COMMENT 'لون نص الفلاش'");
  await ensureColumn(pool, 'customizations', 'flash_btn_text', "flash_btn_text VARCHAR(100) DEFAULT 'حسناً' COMMENT 'نص زر الإغلاق'");
  await ensureColumn(pool, 'customizations', 'flash_btn_url', "flash_btn_url TEXT NULL COMMENT 'رابط زر الفلاش (اختياري)'");
  await ensureColumn(pool, 'customizations', 'flash_font_style', "flash_font_style VARCHAR(20) DEFAULT 'normal' COMMENT 'نمط الخط: normal, block, outlined, shadow, neon, italic'");
}

// ─── Users Columns ───
async function migrateUsers(pool) {
  // Google OAuth support
  await ensureColumn(pool, 'users', 'google_id', 'google_id VARCHAR(255) NULL');
}

// ─── Orders Columns ───
async function migrateOrders(pool) {
  // DHRU FUSION external order tracking
  await ensureColumn(pool, 'orders', 'external_reference_id', "external_reference_id VARCHAR(100) NULL COMMENT 'رقم المرجع من المصدر الخارجي (DHRU FUSION)'");
  await ensureColumn(pool, 'orders', 'source_id', 'source_id INT NULL COMMENT "معرف المصدر الذي أُرسل له الطلب"');
}

// ─── Product Indexes ───
async function migrateProductIndexes(pool) {
  if (!(await indexExists(pool, 'products', 'uniq_products_source_servicekey'))) {
    await pool.query(
      'CREATE UNIQUE INDEX uniq_products_source_servicekey ON products (site_key, source_id, external_service_key)'
    );
  }
}

module.exports = { runColumnMigrations };
