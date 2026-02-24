require(require('path').join(__dirname, 'backend/node_modules/dotenv')).config({ path: './backend/.env' });
const db = require('./backend/src/config/db');
(async () => {
  await db.initializeDatabase();
  const pool = db.getPool();
  
  // 1. Check if is_game column exists
  const [cols] = await pool.query(
    "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_game'"
  );
  console.log('=== is_game column ===', JSON.stringify(cols));
  
  // 2. Show ONLY game products
  const [games] = await pool.query('SELECT id, name, arabic_name, is_game, service_type, group_name, site_key FROM products WHERE is_game = 1');
  console.log('=== Game products ===', games.length);
  games.forEach(p => console.log(JSON.stringify(p)));

  // 3. Test the public API endpoint for the site
  const [sites] = await pool.query('SELECT site_key, domain, name FROM sites LIMIT 5');
  console.log('=== Sites ===');
  sites.forEach(s => console.log(JSON.stringify(s)));

  // 4. Check what the updateProduct handler receives
  const [allProds] = await pool.query('SELECT id, name, is_game, site_key FROM products WHERE is_game = 1 OR is_game IS NULL LIMIT 10');
  console.log('=== Products with is_game=1 or NULL ===');
  allProds.forEach(p => console.log(JSON.stringify(p)));

  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
