const { initializeDatabase, getPool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    await initializeDatabase();
    const pool = getPool();

    console.log('🌱 بدء إنشاء بيانات تجريبية...');

    // ===== إنشاء مواقع تجريبية =====
    await pool.query(
      'INSERT IGNORE INTO sites (site_key, domain, name, template_id, plan, status, owner_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['ahmed-store-2024', 'ahmed-store.nexiro.com', 'متجر أحمد للخدمات الرقمية', 'digital-services-store', 'premium', 'active', 'admin@ahmed-store.com']
    );

    await pool.query(
      'INSERT IGNORE INTO sites (site_key, domain, name, template_id, plan, status, owner_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['mohamed-tech-2024', 'mohamed-tech.nexiro.com', 'محمد تك للتقنية', 'digital-services-store', 'basic', 'active', 'admin@mohamed-tech.com']
    );

    console.log('✅ تم إنشاء المواقع');

    // ===== إنشاء أدمن لكل موقع =====
    const admin1Pass = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT IGNORE INTO users (site_key, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['ahmed-store-2024', 'أحمد المالكي', 'admin@ahmed-store.com', admin1Pass, 'admin']
    );

    const admin2Pass = await bcrypt.hash('admin456', 10);
    await pool.query(
      'INSERT IGNORE INTO users (site_key, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['mohamed-tech-2024', 'محمد العتيبي', 'admin@mohamed-tech.com', admin2Pass, 'admin']
    );

    // مستخدم عادي (موظف)
    const user1Pass = await bcrypt.hash('user123', 10);
    await pool.query(
      'INSERT IGNORE INTO users (site_key, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['ahmed-store-2024', 'سالم الموظف', 'staff@ahmed-store.com', user1Pass, 'user']
    );

    console.log('✅ تم إنشاء المستخدمين');

    // ===== إنشاء منتجات =====
    const products = [
      ['ahmed-store-2024', 'فك قفل iPhone', 'خدمة فك قفل آيفون بجميع الموديلات', 25.000, 'IMEI'],
      ['ahmed-store-2024', 'فك قفل Samsung', 'فك قفل سامسونج جميع الموديلات', 15.000, 'IMEI'],
      ['ahmed-store-2024', 'تفعيل Windows Server', 'تفعيل ويندوز سيرفر جميع الإصدارات', 10.000, 'SERVER'],
      ['ahmed-store-2024', 'إزالة iCloud', 'إزالة حساب iCloud من أجهزة أبل', 35.000, 'REMOTE'],
      ['mohamed-tech-2024', 'استضافة ووردبريس', 'استضافة ووردبريس سنوية', 50.000, 'SERVER'],
      ['mohamed-tech-2024', 'تصميم لوجو', 'تصميم شعار احترافي', 20.000, 'SERVER'],
    ];

    for (const [sk, name, desc, price, st] of products) {
      await pool.query(
        'INSERT IGNORE INTO products (site_key, name, description, price, service_type) VALUES (?, ?, ?, ?, ?)',
        [sk, name, desc, price, st]
      );
    }

    console.log('✅ تم إنشاء المنتجات');

    // ===== إنشاء زبائن =====
    const custPass = await bcrypt.hash('customer123', 10);

    const customerData = [
      ['ahmed-store-2024', 'خالد الزبون', 'khaled@email.com', '0555123456', 150.500],
      ['ahmed-store-2024', 'نورة العميلة', 'noura@email.com', '0544987654', 75.000],
      ['ahmed-store-2024', 'فهد المشتري', 'fahad@email.com', '0533456789', 0],
      ['mohamed-tech-2024', 'عبدالله الزبون', 'abdullah@email.com', '0522111222', 200.000],
    ];

    for (const [sk, name, email, phone, wallet] of customerData) {
      await pool.query(
        'INSERT IGNORE INTO customers (site_key, name, email, phone, password, wallet_balance, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [sk, name, email, phone, custPass, wallet]
      );
    }

    console.log('✅ تم إنشاء الزبائن');

    // ===== تخصيصات المتجر =====
    await pool.query(
      `INSERT IGNORE INTO customizations (site_key, theme_id, primary_color, secondary_color, store_name, dark_mode, button_radius, show_banner, font_family)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ahmed-store-2024', 'purple', '#7c5cff', '#a78bfa', 'متجر أحمد', 1, 'rounded-xl', 1, 'Tajawal']
    );

    console.log('✅ تم إنشاء التخصيصات');

    // ===== اشتراك =====
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    await pool.query(
      `INSERT IGNORE INTO subscriptions (site_key, plan_id, template_id, status, billing_cycle, price, trial_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['ahmed-store-2024', 'premium', 'digital-services-store', 'active', 'monthly', 39.00, trialEnd]
    );

    console.log('✅ تم إنشاء الاشتراك');

    // ===== إشعارات =====
    await pool.query(
      'INSERT INTO notifications (site_key, recipient_type, title, message, type) VALUES (?, ?, ?, ?, ?)',
      ['ahmed-store-2024', 'admin', 'مرحباً بك!', 'مرحباً بك في لوحة تحكم NEXIRO-FLUX', 'success']
    );

    console.log('✅ تم إنشاء الإشعارات');

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ تم إنشاء جميع البيانات التجريبية!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📋 بيانات الدخول:');
    console.log('─────────────────');
    console.log('');
    console.log('🏪 الموقع 1: ahmed-store.nexiro.com');
    console.log('   SITE_KEY: ahmed-store-2024');
    console.log('   الأدمن: admin@ahmed-store.com / admin123');
    console.log('   الموظف: staff@ahmed-store.com / user123');
    console.log('   زبون: khaled@email.com / customer123');
    console.log('');
    console.log('🏪 الموقع 2: mohamed-tech.nexiro.com');
    console.log('   SITE_KEY: mohamed-tech-2024');
    console.log('   الأدمن: admin@mohamed-tech.com / admin456');
    console.log('   زبون: abdullah@email.com / customer123');
    console.log('');
    console.log('🚀 شغّل السيرفر: npm start');
    console.log('   مع: SITE_KEY=ahmed-store-2024 في ملف .env');

    process.exit(0);
  } catch (error) {
    console.error('❌ فشل إنشاء البيانات التجريبية:', error);
    process.exit(1);
  }
}

seedDatabase();