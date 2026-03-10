require('dotenv').config();
const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});
(async () => {
  try {
    // Check subscriptions (template purchases)
    const [cols] = await db.query('DESCRIBE subscriptions');
    console.log('=== SUBSCRIPTIONS COLUMNS ===');
    cols.forEach(c => console.log('  ', c.Field, c.Type));

    const [siteCols] = await db.query('DESCRIBE sites');
    console.log('\n=== SITES COLUMNS ===');
    siteCols.forEach(c => console.log('  ', c.Field, c.Type));

    const [subs] = await db.query('SELECT s.* FROM subscriptions s ORDER BY s.created_at DESC');
    console.log('\n=== SUBSCRIPTIONS (اشتراكات القوالب) ===');
    console.log('Total:', subs.length);
    const active = subs.filter(s => s.status === 'active');
    const trial = subs.filter(s => s.status === 'trial');
    const expired = subs.filter(s => s.status === 'expired');
    console.log('Active:', active.length, '| Trial:', trial.length, '| Expired:', expired.length);
    subs.forEach(s => console.log('  #' + s.id, '|', s.site_key, '| plan:', s.plan_id, '| template:', s.template_id, '| $' + s.price, '|', s.status, '|', s.billing_cycle));

    // Check plans
    const [plans] = await db.query('SELECT * FROM subscription_plans ORDER BY id');
    console.log('\n=== SUBSCRIPTION PLANS ===');
    plans.forEach(p => console.log('  #' + p.id, '|', p.name, '| $' + p.price, '|', p.billing_cycle, '| active:', p.is_active));

    // Check payments related to subscriptions
    const [payments] = await db.query("SELECT id, site_key, amount, status, payment_method, type, description, created_at FROM payments WHERE type LIKE '%subscription%' OR description LIKE '%اشتراك%' OR description LIKE '%template%' ORDER BY created_at DESC LIMIT 20");
    console.log('\n=== SUBSCRIPTION PAYMENTS ===');
    console.log('Total shown:', payments.length);
    payments.forEach(p => console.log('  #' + p.id, '|', p.site_key, '| $' + p.amount, '|', p.status, '|', p.type, '|', p.description));

    // Total unique paying users
    const [buyers] = await db.query("SELECT COUNT(DISTINCT s.site_key) as c FROM subscriptions s WHERE s.status = 'active'");
    console.log('\n=== SUMMARY ===');
    console.log('Unique template buyers (active/completed):', buyers[0].c);

    const [allUsers] = await db.query("SELECT COUNT(*) as c FROM users WHERE email IS NOT NULL AND email != ''");
    console.log('Total platform users:', allUsers[0].c);

    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
