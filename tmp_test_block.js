const http = require('http');
const data = JSON.stringify({ email: 'muttalib0102@gmail.com', password: 'test123' });
const req = http.request({
  hostname: 'localhost', port: 3000,
  path: '/api/customers/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Host': 'nyala-gsm.com', 'Content-Length': Buffer.byteLength(data) }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});
req.write(data);
req.end();
