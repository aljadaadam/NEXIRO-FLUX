/**
 * ─── Support Tables Schema ───
 * Tickets, Ticket Messages, Notifications, Activity Log
 */

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

const reservationsTable = `
  CREATE TABLE IF NOT EXISTS reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    template_id VARCHAR(100) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NULL DEFAULT 'monthly',
    message TEXT NULL,
    status ENUM('pending', 'contacted', 'completed', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

const emailBroadcastsTable = `
  CREATE TABLE IF NOT EXISTS email_broadcasts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    recipient_type ENUM('all_reservations', 'individual', 'custom_list') NOT NULL,
    recipient_count INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    sent_by INT NULL,
    status ENUM('sending', 'completed', 'failed') DEFAULT 'sending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const errorLogTable = `
  CREATE TABLE IF NOT EXISTS error_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(255) NULL,
    level ENUM('error', 'warn', 'info') DEFAULT 'error',
    source VARCHAR(100) NULL COMMENT 'controller or module name',
    message TEXT NOT NULL,
    stack TEXT NULL,
    request_method VARCHAR(10) NULL,
    request_url VARCHAR(500) NULL,
    user_id INT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_error_log_site (site_key),
    INDEX idx_error_log_level (level),
    INDEX idx_error_log_created (created_at)
  )
`;

const bannerTemplatesTable = `
  CREATE TABLE IF NOT EXISTS banner_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    preview_image TEXT NULL,
    category VARCHAR(100) DEFAULT 'عام',
    design_data JSON NOT NULL COMMENT 'title, subtitle, icon, gradient, colors, style',
    price DECIMAL(10,2) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

const bannerPurchasesTable = `
  CREATE TABLE IF NOT EXISTS banner_purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_key VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    template_id INT NOT NULL,
    payment_id INT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pending','completed','failed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bp_site (site_key),
    INDEX idx_bp_template (template_id),
    INDEX idx_bp_payment (payment_id),
    INDEX idx_bp_status (status)
  )
`;

module.exports = {
  ticketsTable,
  ticketMessagesTable,
  notificationsTable,
  activityLogTable,
  reservationsTable,
  emailBroadcastsTable,
  errorLogTable,
  bannerTemplatesTable,
  bannerPurchasesTable,
};
