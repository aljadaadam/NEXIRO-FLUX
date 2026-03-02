const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({ host: 'localhost', user: 'nexiro', password: 'NexiroFlux@2026!', database: 'nexiro_flux_central' });
  const [rows] = await c.query("SELECT site_key, smtp_user, smtp_from FROM customizations WHERE smtp_user IS NOT NULL AND smtp_from IS NOT NULL AND smtp_user != smtp_from");
  if (rows.length === 0) {
    console.log('No more smtp_from mismatches found.');
  } else {
    rows.forEach(r => console.log('MISMATCH:', r.site_key, '| user:', r.smtp_user, '| from:', r.smtp_from));
  }
  await c.end();
})();
