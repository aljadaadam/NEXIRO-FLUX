const http = require('http');
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products/public',
  headers: { 'X-Site-Key': 'trade-zone-0c57d8-mlnjubxr' }
};
http.get(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const j = JSON.parse(data);
    const prods = j.products || [];
    console.log('Total products:', prods.length);
    const games = prods.filter(p => p.is_game == 1);
    console.log('Game products:', games.length);
    games.forEach(g => console.log('  -', g.id, g.name, 'is_game=' + g.is_game));
    // Also show first 3 products' is_game field
    console.log('\nFirst 3 products is_game values:');
    prods.slice(0, 3).forEach(p => console.log('  -', p.id, p.name, 'is_game=' + p.is_game));
  });
});
