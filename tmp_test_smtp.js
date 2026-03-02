const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

(async () => {
  const c = await mysql.createConnection({ host: 'localhost', user: 'nexiro', password: 'NexiroFlux@2026!', database: 'nexiro_flux_central' });
  const [rows] = await c.query("SELECT smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from FROM customizations WHERE site_key = 'mt-servers-6c1b59-mm7ybm9y'");
  await c.end();

  const smtp = rows[0];
  console.log('SMTP config:', { host: smtp.smtp_host, port: smtp.smtp_port, user: smtp.smtp_user, from: smtp.smtp_from });

  const transporter = nodemailer.createTransport({
    host: smtp.smtp_host,
    port: smtp.smtp_port,
    secure: smtp.smtp_port === 465,
    auth: { user: smtp.smtp_user, pass: smtp.smtp_pass },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection: OK');
  } catch (e) {
    console.log('SMTP connection FAILED:', e.message);
  }
})();
