const { getPool } = require('../config/db');

class ChatMessage {

  /* ── جداول ── */
  static getCreateConversationsSQL() {
    return `CREATE TABLE IF NOT EXISTS chat_conversations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      site_key VARCHAR(100) NOT NULL,
      conversation_id VARCHAR(100) NOT NULL,
      customer_name VARCHAR(255) DEFAULT 'زائر',
      customer_email VARCHAR(255) DEFAULT NULL,
      status ENUM('active','closed') DEFAULT 'active',
      last_message TEXT,
      last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      unread_admin INT DEFAULT 0,
      unread_customer INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_conv (site_key, conversation_id),
      INDEX idx_conv_site (site_key, status, last_message_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  }

  static getCreateMessagesSQL() {
    return `CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      site_key VARCHAR(100) NOT NULL,
      conversation_id VARCHAR(100) NOT NULL,
      sender_type ENUM('customer','admin') NOT NULL DEFAULT 'customer',
      message TEXT NOT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_msg_conv (site_key, conversation_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  }

  /* ── المحادثات ── */
  static async getOrCreateConversation(site_key, conversation_id, customer_name, customer_email) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM chat_conversations WHERE site_key = ? AND conversation_id = ?',
      [site_key, conversation_id]
    );
    if (rows.length) return rows[0];
    await pool.query(
      `INSERT INTO chat_conversations (site_key, conversation_id, customer_name, customer_email)
       VALUES (?, ?, ?, ?)`,
      [site_key, conversation_id, customer_name || 'زائر', customer_email || null]
    );
    const [created] = await pool.query(
      'SELECT * FROM chat_conversations WHERE site_key = ? AND conversation_id = ?',
      [site_key, conversation_id]
    );
    return created[0];
  }

  static async getConversationsBySiteKey(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM chat_conversations WHERE site_key = ?
       ORDER BY last_message_at DESC`,
      [site_key]
    );
    return rows;
  }

  static async getConversation(site_key, conversation_id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM chat_conversations WHERE site_key = ? AND conversation_id = ?',
      [site_key, conversation_id]
    );
    return rows[0] || null;
  }

  static async updateConversationMeta(site_key, conversation_id, lastMessage, senderType) {
    const pool = getPool();
    const unreadField = senderType === 'customer' ? 'unread_admin' : 'unread_customer';
    await pool.query(
      `UPDATE chat_conversations
       SET last_message = ?, last_message_at = NOW(), ${unreadField} = ${unreadField} + 1, status = 'active'
       WHERE site_key = ? AND conversation_id = ?`,
      [lastMessage, site_key, conversation_id]
    );
  }

  static async markRead(site_key, conversation_id, readerType) {
    const pool = getPool();
    const unreadField = readerType === 'admin' ? 'unread_admin' : 'unread_customer';
    await pool.query(
      `UPDATE chat_conversations SET ${unreadField} = 0
       WHERE site_key = ? AND conversation_id = ?`,
      [site_key, conversation_id]
    );
    const senderType = readerType === 'admin' ? 'customer' : 'admin';
    await pool.query(
      `UPDATE chat_messages SET is_read = 1
       WHERE site_key = ? AND conversation_id = ? AND sender_type = ? AND is_read = 0`,
      [site_key, conversation_id, senderType]
    );
  }

  static async closeConversation(site_key, conversation_id) {
    const pool = getPool();
    await pool.query(
      `UPDATE chat_conversations SET status = 'closed'
       WHERE site_key = ? AND conversation_id = ?`,
      [site_key, conversation_id]
    );
  }

  static async getTotalUnread(site_key) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(unread_admin), 0) as total FROM chat_conversations WHERE site_key = ?',
      [site_key]
    );
    return rows[0]?.total || 0;
  }

  /* ── الرسائل ── */
  static async addMessage(site_key, conversation_id, sender_type, message) {
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO chat_messages (site_key, conversation_id, sender_type, message)
       VALUES (?, ?, ?, ?)`,
      [site_key, conversation_id, sender_type, message]
    );
    await this.updateConversationMeta(site_key, conversation_id, message, sender_type);
    return result.insertId;
  }

  static async getMessages(site_key, conversation_id, afterId = 0) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM chat_messages
       WHERE site_key = ? AND conversation_id = ? AND id > ?
       ORDER BY created_at ASC`,
      [site_key, conversation_id, afterId]
    );
    return rows;
  }

  static async getAllMessages(site_key, conversation_id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM chat_messages
       WHERE site_key = ? AND conversation_id = ?
       ORDER BY created_at ASC`,
      [site_key, conversation_id]
    );
    return rows;
  }
}

module.exports = ChatMessage;
