// Temporary script to test dashboard API response
// Run from backend/ directory: node ../scripts/test-dashboard-api.js
const path = require('path');
// Load JWT from backend's node_modules
const jwt = require(path.join(__dirname, '..', 'backend', 'node_modules', 'jsonwebtoken'));
const http = require('http');

const JWT_SECRET = 'bx3eTEJLqbi4JG1L1Ql4P0EgjNPqB1hwYS8TOOO1gu7TCoYeEDjbD';

const token = jwt.sign(
  { id: 1, role: 'admin', site_key: 'nexiroflux' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('TOKEN:', token.substring(0, 30) + '...');

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
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('RESPONSE:', data);
  });
});

req.on('error', (err) => console.error('REQUEST ERROR:', err.message));
req.end();
