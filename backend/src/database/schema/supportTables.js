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

module.exports = {
  ticketsTable,
  ticketMessagesTable,
  notificationsTable,
  activityLogTable,
  reservationsTable,
  emailBroadcastsTable,
};
