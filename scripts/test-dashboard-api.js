// Temporary script to test dashboard API response
const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET || 'bx3eTEJLqbi4JG1L1Ql4P0EgjNPqB1hwYS8TOOO1gu7TCoYeEDjbD';

const token = jwt.sign(
  { id: 1, role: 'admin', site_key: 'nexiroflux' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/dashboard/platform-stats',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'X-Site-Key': 'nexiroflux',
    'Content-Type': 'application/json',
  },
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('=== PLATFORM STATS RESPONSE ===');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('RAW:', data);
    }
  });
});

req.on('error', (err) => console.error('Error:', err.message));
req.end();
