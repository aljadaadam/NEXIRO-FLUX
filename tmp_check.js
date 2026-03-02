const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({ host: 'localhost', user: 'nexiro', password: 'NexiroFlux@2026!', database: 'nexiro_flux_central' });
  
  // Check SMTP columns
  const [cols] = await c.query("SHOW COLUMNS FROM customizations WHERE Field LIKE '%smtp%' OR Field LIKE '%otp%'");
  console.log('Relevant columns:', cols.map(c => c.Field).join(', '));

  // Get mt-servers full row
  const [rows] = await c.query("SELECT * FROM customizations WHERE site_key LIKE 'mt-servers%'");
  if (rows.length > 0) {
    const r = rows[0];
    console.log('\n=== MT-SERVERS CUSTOMIZATION ===');
    console.log('site_key:', r.site_key);
    console.log('otp_enabled:', r.otp_enabled);
    console.log('smtp_host:', r.smtp_host);
    console.log('smtp_port:', r.smtp_port);
    console.log('smtp_user:', r.smtp_user);
    console.log('smtp_pass:', r.smtp_pass ? '***SET***' : 'NULL');
    // Print all keys that have smtp or email in them
    Object.keys(r).filter(k => k.includes('smtp') || k.includes('email') || k.includes('from') || k.includes('otp')).forEach(k => {
      console.log(`${k}:`, r[k]);
    });
  } else {
    console.log('No mt-servers customization found');
  }

  await c.end();
})();
