const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({ host: 'localhost', user: 'nexiro', password: 'NexiroFlux@2026!', database: 'nexiro_flux_central' });
  
  // Fix: set smtp_from to match smtp_user
  const [result] = await c.query(
    "UPDATE customizations SET smtp_from = smtp_user WHERE site_key = 'mt-servers-6c1b59-mm7ybm9y' AND smtp_user IS NOT NULL"
  );
  console.log('Updated rows:', result.affectedRows);
  
  // Verify
  const [rows] = await c.query("SELECT smtp_user, smtp_from, otp_enabled FROM customizations WHERE site_key = 'mt-servers-6c1b59-mm7ybm9y'");
  console.log('After fix:', rows[0]);
  
  await c.end();
})();
