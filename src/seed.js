const { initializeDatabase, getPool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    await initializeDatabase();
    const pool = getPool();

    console.log('🌱 بدء إنشاء بيانات تجريبية...');

    // إنشاء مواقع تجريبية
    const [site1] = await pool.query(
      'INSERT INTO sites (name, domain) VALUES (?, ?)',
      ['متجر أحمد', 'ahmed-store.nexiro.com']
    );

    const [site2] = await pool.query(
      'INSERT INTO sites (name, domain) VALUES (?, ?)',
      ['شركة محمد', 'mohamed-company.nexiro.com']
    );

    const site1Id = site1.insertId;
    const site2Id = site2.insertId;

    // إنشاء أدمن لكل موقع
    const admin1Password = await bcrypt.hash('admin123', 10);
    const [admin1] = await pool.query(
      'INSERT INTO users (site_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [site1Id, 'أحمد الادمن', 'admin1@ahmed-store.com', admin1Password, 'admin']
    );

    const admin2Password = await bcrypt.hash('admin456', 10);
    const [admin2] = await pool.query(
      'INSERT INTO users (site_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [site2Id, 'محمد الادمن', 'admin2@mohamed-company.com', admin2Password, 'admin']
    );

    // إنشاء مستخدمين عاديين لكل موقع
    const user1Password = await bcrypt.hash('user123', 10);
    await pool.query(
      'INSERT INTO users (site_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [site1Id, 'سالم المستخدم', 'user1@ahmed-store.com', user1Password, 'user']
    );

    const user2Password = await bcrypt.hash('user456', 10);
    await pool.query(
      'INSERT INTO users (site_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [site2Id, 'خالد المستخدم', 'user2@mohamed-company.com', user2Password, 'user']
    );

    // إنشاء منتجات لكل موقع
    await pool.query(
      'INSERT INTO products (site_id, name, description, price) VALUES (?, ?, ?, ?)',
      [site1Id, 'لابتوب ديل', 'لابتوب ديل بمواصفات عالية', 2500.00]
    );

    await pool.query(
      'INSERT INTO products (site_id, name, description, price) VALUES (?, ?, ?, ?)',
      [site1Id, 'موبايل سامسونج', 'جوال سامسونج S23', 3200.00]
    );

    await pool.query(
      'INSERT INTO products (site_id, name, description, price) VALUES (?, ?, ?, ?)',
      [site2Id, 'طابعة ليزر', 'طابعة HP ليزر ملونة', 800.00]
    );

    await pool.query(
      'INSERT INTO products (site_id, name, description, price) VALUES (?, ?, ?, ?)',
      [site2Id, 'شاشة كمبيوتر', 'شاشة LG 24 بوصة', 650.00]
    );

    console.log('✅ تم إنشاء البيانات التجريبية بنجاح!');
    console.log('');
    console.log('📋 بيانات الدخول:');
    console.log('------------------');
    console.log(`الموقع 1: ahmed-store.nexiro.com`);
    console.log(`  - الأدمن: admin1@ahmed-store.com / admin123`);
    console.log('');
    console.log(`الموقع 2: mohamed-company.nexiro.com`);
    console.log(`  - الأدمن: admin2@mohamed-company.com / admin456`);
    console.log('');
    console.log('🚀 ابدأ بتشغيل السيرفر: npm start');

  } catch (error) {
    console.error('❌ فشل إنشاء البيانات التجريبية:', error);
    process.exit(1);
  }
}

seedDatabase();