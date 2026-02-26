/**
 * ─── Database Connection & Initialization ───
 * Manages MySQL pool connection and delegates table creation to schema modules.
 * 
 * Original monolithic db.js (518 lines) has been split into:
 *   - database/schema/coreTables.js      → Sites, Users, Products, Sources
 *   - database/schema/businessTables.js  → Subscriptions, Customers, Orders, Payments
 *   - database/schema/supportTables.js   → Tickets, Messages, Notifications, Activity Log
 *   - database/schema/storeTables.js     → Customizations, Delivery, Currencies, Banners
 *   - database/schema/columnMigrations.js→ All ALTER TABLE / ensureColumn operations
 *   - database/helpers.js               → columnExists, indexExists, ensureColumn utilities
 */
const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, SITE_KEY } = require('./env');

// Schema modules
const {
  sitesTable,
  usersTable,
  productsTable,
  sourcesTable,
  subscriptionsTable,
  customersTable,
  ordersTable,
  paymentsTable,
  ticketsTable,
  ticketMessagesTable,
  customizationsTable,
  notificationsTable,
  activityLogTable,
  reservationsTable,
  deliveryZonesTable,
  deliveryRegionsTable,
  currenciesTable,
  bannersTable,
  runColumnMigrations,
} = require('../database/schema');

let pool;

async function initializeDatabase() {
  try {
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
    // ─── Core Tables (must be first — other tables reference sites) ───
    await pool.query(sitesTable);
    await pool.query(usersTable);
    await pool.query(productsTable);
    await pool.query(sourcesTable);

    // ─── Business Tables ───
    await pool.query(subscriptionsTable);
    await pool.query(customersTable);
    await pool.query(ordersTable);
    await pool.query(paymentsTable);

    // ─── Support Tables ───
    await pool.query(ticketsTable);
    await pool.query(ticketMessagesTable);
    await pool.query(reservationsTable);

    // ─── Store Feature Tables ───
    await pool.query(customizationsTable);
    await pool.query(notificationsTable);
    await pool.query(activityLogTable);
    await pool.query(deliveryZonesTable);
    await pool.query(deliveryRegionsTable);
    await pool.query(currenciesTable);
    await pool.query(bannersTable);

    // ─── Model-defined Tables ───
    const BlogPost = require('../models/BlogPost');
    await pool.query(BlogPost.getCreateTableSQL());

    const ChatMessage = require('../models/ChatMessage');
    await pool.query(ChatMessage.getCreateConversationsSQL());
    await pool.query(ChatMessage.getCreateMessagesSQL());

    const PurchaseCode = require('../models/PurchaseCode');
    await pool.query(PurchaseCode.getCreateTableSQL());

    // ─── Column Migrations (backward compatibility) ───
    await runColumnMigrations(pool);

    // ─── Ensure platform default site exists ───
    await ensurePlatformSite();

    console.log('✅ Tables created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

/**
 * Ensure the platform's default site record exists
 */
async function ensurePlatformSite() {
  if (!SITE_KEY) return;
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
