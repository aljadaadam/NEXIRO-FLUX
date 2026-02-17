const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./env');

let pool;

async function initializeDatabase() {
  try {
    // إنشاء اتصال مع قاعدة البيانات
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // اختبار الاتصال وإنشاء الجداول إذا لزم الأمر
    await createTables();
    console.log('✅ Database connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  try {
    async function columnExists(tableName, columnName) {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [DB_NAME, tableName, columnName]
      );
      return Number(rows?.[0]?.cnt || 0) > 0;
    }

    async function indexExists(tableName, indexName) {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt
         FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [DB_NAME, tableName, indexName]
      );
      return Number(rows?.[0]?.cnt || 0) > 0;
    }

    async function ensureColumn(tableName, columnName, columnDefinitionSql) {
      if (await columnExists(tableName, columnName)) return;
      await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinitionSql}`);
    }

    // جدول المواقع
    const sitesTable = `
      CREATE TABLE IF NOT EXISTS sites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) UNIQUE NOT NULL,
        domain VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // جدول المستخدمين مع site_key
    const usersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        google_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email_site (email, site_key),
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول المنتجات مع site_key
    const productsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(12, 3) NOT NULL,
        service_type VARCHAR(50) DEFAULT 'SERVER',
        source_id INT NULL,
        user_id INT NULL,
        external_service_key VARCHAR(64) NULL,
        external_service_id BIGINT NULL,
        group_name VARCHAR(255) NULL,
        group_type VARCHAR(50) NULL,
        credit DECIMAL(12, 3) NULL,
        credit_raw VARCHAR(32) NULL,
        source_price DECIMAL(12, 3) NULL,
        final_price DECIMAL(12, 3) NULL,
        profit_percentage_applied DECIMAL(7, 3) NULL,
        is_custom_price TINYINT(1) DEFAULT 0,
        service_time VARCHAR(255) NULL,
        service_info TEXT NULL,
        minqnt VARCHAR(32) NULL,
        maxqnt VARCHAR(32) NULL,
        qnt VARCHAR(32) NULL,
        server_flag VARCHAR(32) NULL,
        custom_json JSON NULL,
        requires_custom_json JSON NULL,
        raw_json JSON NULL,
        is_featured TINYINT(1) DEFAULT 0,
        name_priority VARCHAR(5) DEFAULT 'ar' COMMENT 'أولوية عرض الاسم: ar أو en',
        linked_product_id INT NULL COMMENT 'تحويل الاتصال لمنتج آخر',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول المصادر
    const sourcesTable = `
      CREATE TABLE IF NOT EXISTS sources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        username VARCHAR(255) NULL,
        api_key TEXT NULL,
        api_key_last4 VARCHAR(8) NULL,
        profit_percentage DECIMAL(7, 3) NOT NULL DEFAULT 0,
        last_connection_ok TINYINT(1) NULL,
        last_connection_checked_at DATETIME NULL,
        last_connection_error TEXT NULL,
        last_account_balance VARCHAR(100) NULL,
        last_account_currency VARCHAR(10) NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    await pool.query(sitesTable);
    await pool.query(usersTable);
    await pool.query(productsTable);
    await pool.query(sourcesTable);

    // ===== جداول جديدة للنظام الكامل =====

    // جدول الاشتراكات (خطط NEXIRO-FLUX لأصحاب المواقع)
    const subscriptionsTable = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        plan_id VARCHAR(50) NOT NULL COMMENT 'basic, pro, premium, enterprise',
        template_id VARCHAR(100) NOT NULL COMMENT 'ID القالب المختار',
        status ENUM('active', 'expired', 'cancelled', 'trial') DEFAULT 'trial',
        billing_cycle ENUM('monthly', 'yearly', 'lifetime') DEFAULT 'monthly',
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        trial_ends_at DATETIME NULL,
        starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        cancelled_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول زبائن المتاجر (زبائن أصحاب المواقع)
    const customersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NULL,
        password VARCHAR(255) NOT NULL,
        wallet_balance DECIMAL(12, 3) DEFAULT 0,
        is_verified TINYINT(1) DEFAULT 0,
        is_blocked TINYINT(1) DEFAULT 0,
        last_login_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_customer_email_site (email, site_key),
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول الطلبات
    const ordersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        customer_id INT NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        product_id INT NULL,
        product_name VARCHAR(200) NOT NULL,
        quantity INT DEFAULT 1,
        unit_price DECIMAL(12, 3) NOT NULL,
        total_price DECIMAL(12, 3) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
        payment_method VARCHAR(50) NULL COMMENT 'wallet, stripe, paypal, etc',
        payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
        imei VARCHAR(100) NULL COMMENT 'IMEI للخدمات من نوع IMEI',
        server_response TEXT NULL COMMENT 'رد المصدر الخارجي',
        notes TEXT NULL,
        completed_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_order_number_site (order_number, site_key),
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `;

    // جدول المدفوعات
    const paymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        customer_id INT NULL,
        order_id INT NULL,
        type ENUM('deposit', 'purchase', 'refund', 'subscription') DEFAULT 'purchase',
        amount DECIMAL(12, 3) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        payment_method VARCHAR(50) NOT NULL COMMENT 'wallet, stripe, paypal, bank_transfer',
        payment_gateway_id VARCHAR(255) NULL COMMENT 'معرف العملية في بوابة الدفع',
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول تذاكر الدعم الفني
    const ticketsTable = `
      CREATE TABLE IF NOT EXISTS tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        customer_id INT NULL,
        user_id INT NULL COMMENT 'الموظف المسؤول',
        ticket_number VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status ENUM('open', 'in_progress', 'waiting', 'resolved', 'closed') DEFAULT 'open',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        category VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        closed_at DATETIME NULL,
        UNIQUE KEY unique_ticket_number_site (ticket_number, site_key),
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول رسائل التذاكر
    const ticketMessagesTable = `
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_id INT NOT NULL,
        sender_type ENUM('customer', 'admin', 'system') DEFAULT 'customer',
        sender_id INT NULL,
        message TEXT NOT NULL,
        attachment_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `;

    // جدول تخصيص الواجهة (إعدادات القالب لكل موقع)
    const customizationsTable = `
      CREATE TABLE IF NOT EXISTS customizations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) UNIQUE NOT NULL,
        theme_id VARCHAR(50) DEFAULT 'purple',
        primary_color VARCHAR(20) DEFAULT '#7c5cff',
        secondary_color VARCHAR(20) DEFAULT '#a78bfa',
        logo_url TEXT NULL,
        store_name VARCHAR(255) NULL,
        dark_mode TINYINT(1) DEFAULT 1,
        button_radius VARCHAR(20) DEFAULT 'rounded-xl',
        header_style VARCHAR(20) DEFAULT 'default',
        show_banner TINYINT(1) DEFAULT 1,
        font_family VARCHAR(100) DEFAULT 'Tajawal',
        custom_css TEXT NULL,
        footer_text TEXT NULL,
        social_links JSON NULL COMMENT '{"twitter":"...","instagram":"..."}',
        smtp_host VARCHAR(255) NULL,
        smtp_port INT NULL,
        smtp_user VARCHAR(255) NULL,
        smtp_pass VARCHAR(255) NULL,
        smtp_from VARCHAR(255) NULL,
        secondary_currency VARCHAR(10) NULL COMMENT 'عملة العرض الثانوية',
        currency_rate DECIMAL(12, 4) NULL COMMENT 'سعر تحويل الدولار للعملة الثانوية',
        otp_enabled TINYINT(1) DEFAULT 0 COMMENT 'تفعيل كود OTP للزبائن',
        store_language VARCHAR(5) DEFAULT 'ar' COMMENT 'لغة واجهة المتجر',
        support_email VARCHAR(255) NULL COMMENT 'بريد الدعم الفني',
        support_phone VARCHAR(50) NULL COMMENT 'رقم واتساب/اتصال الدعم',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول الإشعارات
    const notificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        recipient_type ENUM('admin', 'customer') DEFAULT 'admin',
        recipient_id INT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info' COMMENT 'info, success, warning, error, order, payment',
        is_read TINYINT(1) DEFAULT 0,
        link VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    // جدول سجل النشاطات
    const activityLogTable = `
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_key VARCHAR(255) NOT NULL,
        user_id INT NULL,
        customer_id INT NULL,
        action VARCHAR(100) NOT NULL COMMENT 'login, order_created, product_updated, etc',
        entity_type VARCHAR(50) NULL COMMENT 'order, product, customer, etc',
        entity_id INT NULL,
        details JSON NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
      )
    `;

    await pool.query(subscriptionsTable);
    await pool.query(customersTable);
    await pool.query(ordersTable);
    await pool.query(paymentsTable);
    await pool.query(ticketsTable);
    await pool.query(ticketMessagesTable);
    await pool.query(customizationsTable);
    await pool.query(notificationsTable);
    await pool.query(activityLogTable);

    // جدول أكواد الشراء
    const PurchaseCode = require('../models/PurchaseCode');
    await pool.query(PurchaseCode.getCreateTableSQL());

    // ===== إضافة أعمدة جديدة لجدول sites =====
    await ensureColumn('sites', 'template_id', "template_id VARCHAR(100) NULL COMMENT 'القالب المختار'");
    await ensureColumn('sites', 'plan', "plan VARCHAR(50) DEFAULT 'trial' COMMENT 'الخطة الحالية'");
    await ensureColumn('sites', 'status', "status ENUM('active', 'suspended', 'pending') DEFAULT 'active'");
    await ensureColumn('sites', 'owner_email', 'owner_email VARCHAR(100) NULL');
    await ensureColumn('sites', 'settings', 'settings JSON NULL');
    await ensureColumn('sites', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await ensureColumn('sites', 'custom_domain', 'custom_domain VARCHAR(255) NULL UNIQUE');
    await ensureColumn('sites', 'dns_verified', 'dns_verified TINYINT(1) DEFAULT 0');

    // ضمان وجود الأعمدة في الجداول (للتوافق مع قواعد بيانات قديمة)
    await ensureColumn('products', 'service_type', "service_type VARCHAR(50) DEFAULT 'SERVER'");
    await ensureColumn('products', 'arabic_name', 'arabic_name VARCHAR(200) NULL');
    await ensureColumn('products', 'category', 'category VARCHAR(100) NULL');
    await ensureColumn('products', 'status', "status VARCHAR(30) DEFAULT 'active'");
    await ensureColumn('products', 'image', 'image TEXT NULL');
    await ensureColumn('products', 'source_id', 'source_id INT NULL');
    await ensureColumn('products', 'user_id', 'user_id INT NULL');
    await ensureColumn('products', 'external_service_key', 'external_service_key VARCHAR(64) NULL');
    await ensureColumn('products', 'external_service_id', 'external_service_id BIGINT NULL');
    await ensureColumn('products', 'group_name', 'group_name VARCHAR(255) NULL');
    await ensureColumn('products', 'group_type', 'group_type VARCHAR(50) NULL');
    await ensureColumn('products', 'credit', 'credit DECIMAL(12, 3) NULL');
    await ensureColumn('products', 'credit_raw', 'credit_raw VARCHAR(32) NULL');
    await ensureColumn('products', 'source_price', 'source_price DECIMAL(12, 3) NULL');
    await ensureColumn('products', 'final_price', 'final_price DECIMAL(12, 3) NULL');
    await ensureColumn('products', 'profit_percentage_applied', 'profit_percentage_applied DECIMAL(7, 3) NULL');
    await ensureColumn('products', 'is_custom_price', 'is_custom_price TINYINT(1) DEFAULT 0');
    await ensureColumn('products', 'service_time', 'service_time VARCHAR(255) NULL');
    await ensureColumn('products', 'service_info', 'service_info TEXT NULL');
    await ensureColumn('products', 'minqnt', 'minqnt VARCHAR(32) NULL');
    await ensureColumn('products', 'maxqnt', 'maxqnt VARCHAR(32) NULL');
    await ensureColumn('products', 'qnt', 'qnt VARCHAR(32) NULL');
    await ensureColumn('products', 'server_flag', 'server_flag VARCHAR(32) NULL');
    await ensureColumn('products', 'custom_json', 'custom_json JSON NULL');
    await ensureColumn('products', 'requires_custom_json', 'requires_custom_json JSON NULL');
    await ensureColumn('products', 'raw_json', 'raw_json JSON NULL');
    await ensureColumn('products', 'is_featured', 'is_featured TINYINT(1) DEFAULT 0');
    await ensureColumn('products', 'name_priority', "name_priority VARCHAR(5) DEFAULT 'ar'");
    await ensureColumn('products', 'linked_product_id', 'linked_product_id INT NULL');

    await ensureColumn('sources', 'username', 'username VARCHAR(255) NULL');
    await ensureColumn('sources', 'api_key_last4', 'api_key_last4 VARCHAR(8) NULL');
    await ensureColumn('sources', 'profit_percentage', 'profit_percentage DECIMAL(7, 3) NOT NULL DEFAULT 0');
    await ensureColumn('sources', 'profit_amount', "profit_amount DECIMAL(12, 3) NULL COMMENT 'ربح ثابت بالدولار يُضاف على سعر المصدر'");
    await ensureColumn('sources', 'last_connection_ok', 'last_connection_ok TINYINT(1) NULL');
    await ensureColumn('sources', 'last_connection_checked_at', 'last_connection_checked_at DATETIME NULL');
    await ensureColumn('sources', 'last_connection_error', 'last_connection_error TEXT NULL');
    await ensureColumn('sources', 'last_account_balance', 'last_account_balance VARCHAR(100) NULL');
    await ensureColumn('sources', 'last_account_currency', 'last_account_currency VARCHAR(10) NULL');

    // Google OAuth support
    await ensureColumn('users', 'google_id', 'google_id VARCHAR(255) NULL');

    // DHRU FUSION external order tracking
    await ensureColumn('orders', 'external_reference_id', "external_reference_id VARCHAR(100) NULL COMMENT 'رقم المرجع من المصدر الخارجي (DHRU FUSION)'");
    await ensureColumn('orders', 'source_id', 'source_id INT NULL COMMENT "معرف المصدر الذي أُرسل له الطلب"');

    if (!(await indexExists('products', 'uniq_products_source_servicekey'))) {
      await pool.query(
        'CREATE UNIQUE INDEX uniq_products_source_servicekey ON products (site_key, source_id, external_service_key)'
      );
    }

    // ─── إنشاء موقع المنصة الافتراضي (مطلوب لبوابات الدفع والـ checkout أثناء الإعداد) ───
    const { SITE_KEY } = require('./env');
    if (SITE_KEY) {
      const [existing] = await pool.query('SELECT id FROM sites WHERE site_key = ?', [SITE_KEY]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO sites (site_key, domain, name, status, owner_email, settings)
           VALUES (?, ?, ?, 'active', ?, '{}')`,
          [SITE_KEY, 'nexiroflux.com', 'NEXIRO-FLUX Platform', 'admin@nexiroflux.com']
        );
        console.log(`✅ Platform site created with key: ${SITE_KEY}`);
      }
    }
    
    console.log('✅ Tables created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return pool;
}

module.exports = {
  initializeDatabase,
  getPool
};