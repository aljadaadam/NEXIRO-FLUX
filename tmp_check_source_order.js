// Set env vars needed
process.env.JWT_SECRET = 'bx3eTEJLqbi4JG1L1Ql4P0EgjNPqB1hwYS8TOOO1gu7TCoYeEDjbD';
const mysql = require('mysql2/promise');
const { decryptApiKey } = require('./src/utils/apiKeyCrypto');
const { DhruFusionClient } = require('./src/services/dhruFusion');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'nexiro',
    password: 'NexiroFlux@2026!',
    database: 'nexiro_flux_central',
    port: 3306
  });
  const [rows] = await pool.query('SELECT url, username, api_key FROM sources WHERE id = 10');
  const s = rows[0];
  const client = new DhruFusionClient({ baseUrl: s.url, username: s.username, apiAccessKey: decryptApiKey(s.api_key) });
  const result = await client.getOrderStatus('28587');
  delete result.raw;
  console.log(JSON.stringify(result, null, 2));
  await pool.end();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
