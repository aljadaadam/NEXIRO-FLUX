const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host:'localhost', user:'nexiro', password:'NexiroFlux@2026!', database:'nexiro_flux_central', charset:'utf8mb4' });
  
  // Ensure new columns exist
  try { await pool.query("ALTER TABLE banners ADD COLUMN description TEXT NULL AFTER subtitle"); } catch(e) { console.log('description column already exists'); }
  try { await pool.query("ALTER TABLE banners ADD COLUMN extra_data JSON NULL AFTER link"); } catch(e) { console.log('extra_data column already exists'); }
  
  // Create banner_templates table
  await pool.query(`CREATE TABLE IF NOT EXISTS banner_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    preview_image TEXT NULL,
    category VARCHAR(100) DEFAULT 'general',
    design_data JSON NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  const IMG = 'https://file.unlocktool.net/uploads/logo/logo_1766854141_69500dfd06f2b.png';

  const templates = [
    {
      name: 'UnlockTool - عروض حصرية',
      preview_image: IMG,
      category: 'برامج',
      design_data: JSON.stringify({
        title: '🔥 عروض حصرية',
        subtitle: 'UnlockTool - أقوى أداة فتح',
        description: 'احصل على أفضل الأسعار لاشتراكات UnlockTool',
        icon: '🔓',
        image_url: IMG,
        link: '/services',
        badges: ['سنة', '6 أشهر', '3 أشهر'],
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }),
      price: 0,
      sort_order: 1
    },
    {
      name: 'UnlockTool - اشتراكات',
      preview_image: IMG,
      category: 'برامج',
      design_data: JSON.stringify({
        title: '⭐ اشتراكات UnlockTool',
        subtitle: 'أفضل أداة فتح الأجهزة',
        description: 'اشتراك سنة كاملة بأفضل سعر - تفعيل فوري',
        icon: '⚡',
        image_url: IMG,
        link: '/services',
        badges: ['تفعيل فوري', 'دعم 24/7', 'ضمان'],
        gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
      }),
      price: 0,
      sort_order: 2
    },
    {
      name: 'UnlockTool - عرض خاص',
      preview_image: IMG,
      category: 'برامج',
      design_data: JSON.stringify({
        title: '🌟 عرض لفترة محدودة',
        subtitle: 'UnlockTool Premium',
        description: 'احصل على خصم حصري على جميع الباقات',
        icon: '🏆',
        image_url: IMG,
        link: '/services',
        badges: ['خصم 30%', 'عرض محدود', 'أسعار منافسة'],
        gradient: 'linear-gradient(135deg, #232526 0%, #414345 50%, #232526 100%)'
      }),
      price: 0,
      sort_order: 3
    }
  ];

  for (const t of templates) {
    await pool.query(
      'INSERT INTO banner_templates (name, preview_image, category, design_data, price, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [t.name, t.preview_image, t.category, t.design_data, t.price, t.sort_order]
    );
    console.log('Created:', t.name);
  }

  await pool.end();
  console.log('Done!');
})().catch(e => { console.error(e); process.exit(1); });
