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

    // ضمان وجود الأعمدة في الجداول (للتوافق مع قواعد بيانات قديمة)
    await ensureColumn('products', 'service_type', "service_type VARCHAR(50) DEFAULT 'SERVER'");
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

    await ensureColumn('sources', 'username', 'username VARCHAR(255) NULL');
    await ensureColumn('sources', 'api_key_last4', 'api_key_last4 VARCHAR(8) NULL');
    await ensureColumn('sources', 'profit_percentage', 'profit_percentage DECIMAL(7, 3) NOT NULL DEFAULT 0');
    await ensureColumn('sources', 'last_connection_ok', 'last_connection_ok TINYINT(1) NULL');
    await ensureColumn('sources', 'last_connection_checked_at', 'last_connection_checked_at DATETIME NULL');
    await ensureColumn('sources', 'last_connection_error', 'last_connection_error TEXT NULL');
    await ensureColumn('sources', 'last_account_balance', 'last_account_balance VARCHAR(100) NULL');
    await ensureColumn('sources', 'last_account_currency', 'last_account_currency VARCHAR(10) NULL');

    if (!(await indexExists('products', 'uniq_products_source_servicekey'))) {
      await pool.query(
        'CREATE UNIQUE INDEX uniq_products_source_servicekey ON products (site_key, source_id, external_service_key)'
      );
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