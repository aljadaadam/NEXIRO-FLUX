/**
 * ─── Store Feature Tables Schema ───
 * Customizations, Delivery Zones, Currencies, Banners
 */

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

const deliveryZonesTable = `
  CREATE TABLE IF NOT EXISTS delivery_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(255) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
  )
`;

const deliveryRegionsTable = `
  CREATE TABLE IF NOT EXISTS delivery_regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_id INT NOT NULL,
    site_key VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    shipping_cost DECIMAL(12, 3) DEFAULT 0,
    estimated_days INT DEFAULT 3,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES delivery_zones(id) ON DELETE CASCADE,
    FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
  )
`;

const currenciesTable = `
  CREATE TABLE IF NOT EXISTS currencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL DEFAULT '$',
    exchange_rate DECIMAL(12, 4) DEFAULT 1.0000,
    is_default TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
  )
`;

const bannersTable = `
  CREATE TABLE IF NOT EXISTS banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(255) NOT NULL,
    title VARCHAR(255) NULL,
    subtitle VARCHAR(255) NULL,
    icon VARCHAR(50) NULL,
    image_url TEXT NULL,
    link VARCHAR(500) NULL,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE
  )
`;

module.exports = {
  customizationsTable,
  deliveryZonesTable,
  deliveryRegionsTable,
  currenciesTable,
  bannersTable,
};
