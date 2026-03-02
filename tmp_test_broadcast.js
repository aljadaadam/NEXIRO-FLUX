// Test script for email broadcast integration
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

async function test() {
  const pool = await mysql.createPool({
    host: 'localhost',
    user: 'nexiro',
    password: 'NexiroFlux@2026!',
    database: 'nexiro_flux_central',
  });

  // 1. Get a test store's admin user
  const [users] = await pool.query(
    "SELECT id, email, site_key, role FROM users WHERE site_key = 'azh-gsm-96bb7c-mm7j78aw' LIMIT 1"
  );
  if (!users.length) { console.log('❌ No admin users found'); process.exit(1); }
  const user = users[0];
  console.log(`✅ Test user: ${user.email} (${user.site_key})`);

  // 2. Generate a test JWT
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  const token = jwt.sign({ id: user.id, email: user.email, site_key: user.site_key, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  console.log(`✅ Token generated`);

  // 3. Test GET /recipients-count
  const http = require('http');
  
  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api' + path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Host': 'azh-gsm.com',
        },
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // Test 1: Recipients count
  console.log('\n--- Test 1: GET /notifications/broadcast/recipients-count ---');
  const countRes = await request('GET', '/notifications/broadcast/recipients-count');
  console.log(`Status: ${countRes.status}`);
  console.log(`Response:`, countRes.body);

  // Test 2: Send broadcast (dry test — with bad recipient_type to test validation)
  console.log('\n--- Test 2: POST /notifications/broadcast/send (bad recipient_type) ---');
  const badRes = await request('POST', '/notifications/broadcast/send', {
    subject: 'Test',
    message: 'Test message',
    recipient_type: 'invalid'
  });
  console.log(`Status: ${badRes.status}`);
  console.log(`Response:`, badRes.body);

  // Test 3: Send broadcast (missing fields)
  console.log('\n--- Test 3: POST /notifications/broadcast/send (missing fields) ---');
  const missingRes = await request('POST', '/notifications/broadcast/send', {
    subject: '',
    message: '',
    recipient_type: 'all_customers'
  });
  console.log(`Status: ${missingRes.status}`);
  console.log(`Response:`, missingRes.body);

  // Test 4: Actual send (all_customers) — only if there are customers  
  if (countRes.body?.count > 0) {
    console.log('\n--- Test 4: POST /notifications/broadcast/send (REAL — all_customers) ---');
    console.log(`⚠️  Will send to ${countRes.body.count} customers`);
    const sendRes = await request('POST', '/notifications/broadcast/send', {
      subject: '🧪 اختبار الإرسال — Test Broadcast',
      message: 'هذه رسالة اختبار من نظام الإعلانات البريدية.\n\nThis is a test broadcast message.\n\nيرجى تجاهل هذه الرسالة.',
      recipient_type: 'all_customers'
    });
    console.log(`Status: ${sendRes.status}`);
    console.log(`Response:`, sendRes.body);
  } else {
    console.log('\n--- Test 4: SKIPPED (no customers) ---');
  }

  await pool.end();
  console.log('\n✅ All tests completed');
}

test().catch(err => { console.error('❌ Test failed:', err); process.exit(1); });
