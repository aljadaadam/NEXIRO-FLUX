/**
 * ─── Core Tables Schema ───
 * Sites, Users, Products, Sources
 */

const sitesTable = `
  CREATE TABLE IF NOT EXISTS sites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

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
    is_game TINYINT(1) DEFAULT 0,
    name_priority VARCHAR(5) DEFAULT 'ar' COMMENT 'أولوية عرض الاسم: ar أو en',
    linked_product_id INT NULL COMMENT 'تحويل الاتصال لمنتج آخر',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
  )
`;

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

module.exports = {
  sitesTable,
  usersTable,
  productsTable,
  sourcesTable,
};
