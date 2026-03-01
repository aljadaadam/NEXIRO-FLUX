/**
 * ─── Business Tables Schema ───
 * Subscriptions, Customers, Orders, Payments
 */

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
    status ENUM('pending', 'processing', 'completed', 'rejected') DEFAULT 'pending',
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

const paymentsTable = `
  CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(255) NOT NULL,
    customer_id INT NULL,
    order_id INT NULL,
    type ENUM('deposit', 'purchase', 'refund', 'subscription') DEFAULT 'purchase',
    amount DECIMAL(12, 3) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL COMMENT 'wallet, stripe, paypal, bank_transfer, usdt, binance, bankak',
    payment_gateway_id INT NULL COMMENT 'FK to payment_gateways.id',
    status ENUM('pending', 'awaiting_receipt', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    description TEXT NULL,
    external_id VARCHAR(255) DEFAULT NULL,
    invoice_number VARCHAR(50) DEFAULT NULL,
    meta JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_key) REFERENCES sites(site_key) ON DELETE CASCADE,
    INDEX idx_payments_invoice (invoice_number)
  )
`;

module.exports = {
  subscriptionsTable,
  customersTable,
  ordersTable,
  paymentsTable,
};
