/**
 * Test source connectivity from backend
 * Run from /var/www/nexiro-flux/backend/: node tmp_test_source.js
 */
require('dotenv').config();
const { initializeDatabase, getPool } = require('./src/config/db');
const { decryptApiKey } = require('./src/utils/apiKeyCrypto');

(async () => {
  try {
    await initializeDatabase();
    const pool = getPool();
    console.log('✅ DB connected');

    // Test all DHRU sources
    const [sources] = await pool.query("SELECT * FROM sources WHERE type = 'dhru-fusion'");
    
    for (const src of sources) {
      console.log(`\n━━━ Source #${src.id}: ${src.name} (${src.site_key}) ━━━`);
      console.log(`   URL: ${src.url}`);
      console.log(`   Username: ${src.username}`);
      console.log(`   DB Balance: ${src.last_account_balance} ${src.last_balance_currency}`);
      console.log(`   Last OK: ${src.last_connection_ok}`);

      const apiKey = decryptApiKey(src.api_key);
      if (!apiKey) {
        console.log('   ❌ Cannot decrypt API key');
        continue;
      }
      console.log(`   Key (last4): ...${apiKey.slice(-4)}`);

      // Test accountinfo
      const body = new URLSearchParams({
        username: src.username,
        apiaccesskey: apiKey,
        requestformat: 'JSON',
        action: 'accountinfo'
      });

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 30000);
      const t0 = Date.now();

      try {
        const resp = await fetch(src.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal: controller.signal
        });
        clearTimeout(tid);
        const elapsed = Date.now() - t0;
        console.log(`   HTTP: ${resp.status} (${elapsed}ms)`);
        
        const text = await resp.text();
        console.log(`   Response: ${text.slice(0, 400)}`);

        try {
          const data = JSON.parse(text);
          const root = data?.DHRUFUSION || data;
          if (root.SUCCESS) {
            const info = Array.isArray(root.SUCCESS) ? root.SUCCESS[0] : root.SUCCESS;
            console.log(`   ✅ Balance: ${info.AccountBalance || info.accountbalance || 'N/A'} ${info.Currency || info.currency || ''}`);
          } else if (root.ERROR) {
            const err = Array.isArray(root.ERROR) ? root.ERROR[0] : root.ERROR;
            console.log(`   ⚠️ Error: ${err.MESSAGE || err.message || JSON.stringify(err)}`);
          }
        } catch {}
      } catch (err) {
        clearTimeout(tid);
        const elapsed = Date.now() - t0;
        if (err.name === 'AbortError') {
          console.log(`   ❌ TIMEOUT after ${elapsed}ms`);
        } else {
          console.log(`   ❌ Error: ${err.message} (${elapsed}ms)`);
        }
      }
    }

    // Also test IMEI Check sources
    const [imeiSources] = await pool.query("SELECT * FROM sources WHERE type = 'imei_check'");
    for (const src of imeiSources) {
      console.log(`\n━━━ Source #${src.id}: ${src.name} (${src.site_key}) ━━━`);
      console.log(`   URL: ${src.url}`);
      console.log(`   Username: ${src.username}`);
      
      const apiKey = decryptApiKey(src.api_key);
      if (!apiKey) {
        console.log('   ❌ Cannot decrypt API key');
        continue;
      }

      const body = new URLSearchParams({
        username: src.username,
        key: apiKey,
        format: 'JSON',
        action: 'accountinfo'
      });

      const t0 = Date.now();
      try {
        const resp = await fetch(src.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal: AbortSignal.timeout(30000)
        });
        console.log(`   HTTP: ${resp.status} (${Date.now() - t0}ms)`);
        const text = await resp.text();
        console.log(`   Response: ${text.slice(0, 400)}`);
      } catch (err) {
        console.log(`   ❌ Error: ${err.message} (${Date.now() - t0}ms)`);
      }
    }

  } catch(e) {
    console.error('Fatal:', e.message);
  }
  process.exit(0);
})();
