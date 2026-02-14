const Site = require('../models/Site');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Customization = require('../models/Customization');
const { generateToken } = require('../utils/token');
const crypto = require('crypto');

// ─── توليد site_key فريد ───
function generateSiteKey(storeName) {
  const slug = storeName
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);
  const rand = crypto.randomBytes(3).toString('hex');
  return `${slug || 'site'}-${rand}-${Date.now().toString(36)}`;
}

// ─── إعداد موقع جديد بعد الشراء ───
async function provisionSite(req, res) {
  try {
    const {
      // بيانات صاحب الموقع
      owner_name,
      owner_email,
      owner_password,
      // بيانات القالب والخطة
      template_id,
      billing_cycle,
      // بيانات الموقع
      store_name,
      domain_slug,
      // إعدادات البريد (اختيارية)
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      smtp_from,
      // إعدادات التخصيص (اختيارية)
      primary_color,
      logo_url,
    } = req.body;

    // ─── التحقق من المدخلات الأساسية ───
    if (!owner_name || !owner_email || !owner_password) {
      return res.status(400).json({ error: 'بيانات صاحب الموقع مطلوبة (الاسم، البريد، كلمة المرور)' });
    }
    if (!template_id) {
      return res.status(400).json({ error: 'يجب اختيار قالب' });
    }
    if (!store_name) {
      return res.status(400).json({ error: 'اسم المتجر مطلوب' });
    }

    // ─── توليد site_key و domain ───
    const site_key = generateSiteKey(store_name);
    const domain = domain_slug
      ? `${domain_slug.toLowerCase().replace(/[^a-z0-9-]/g, '')}.nexiro.com`
      : `${site_key}.nexiro.com`;

    // التحقق من عدم تكرار الدومين
    const existingDomain = await Site.findByDomain(domain);
    if (existingDomain) {
      return res.status(400).json({ error: 'هذا النطاق مستخدم بالفعل، اختر اسمًا آخر' });
    }

    // ─── تحديد السعر حسب الخطة ───
    const prices = {
      'digital-services-store': { monthly: 39, yearly: 349, lifetime: 899 },
      'ecommerce-pro': { monthly: 29, yearly: 249, lifetime: 599 },
      'restaurant-starter': { monthly: 19, yearly: 159, lifetime: 399 },
      'portfolio-developer': { monthly: 15, yearly: 129, lifetime: 299 },
    };

    const templatePrices = prices[template_id] || { monthly: 29, yearly: 249, lifetime: 599 };
    const cycle = billing_cycle || 'monthly';
    const price = templatePrices[cycle] || templatePrices.monthly;

    // ─── 1. إنشاء الموقع ───
    const { getPool } = require('../config/db');
    const pool = getPool();

    await pool.query(
      `INSERT INTO sites (site_key, domain, name, template_id, plan, status, owner_email, settings)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        site_key,
        domain,
        store_name,
        template_id,
        cycle === 'lifetime' ? 'premium' : (cycle === 'yearly' ? 'pro' : 'basic'),
        owner_email,
        JSON.stringify({
          smtp: smtp_host ? { host: smtp_host, port: smtp_port || 587, user: smtp_user, pass: smtp_pass, from: smtp_from || owner_email } : null,
          setup_completed: true,
          setup_date: new Date().toISOString(),
        })
      ]
    );

    // ─── 2. إنشاء حساب الأدمن ───
    const admin = await User.create({
      site_key,
      name: owner_name,
      email: owner_email,
      password: owner_password,
      role: 'admin'
    });

    // ─── 3. إنشاء الاشتراك ───
    const subscription = await Subscription.create({
      site_key,
      plan_id: cycle === 'lifetime' ? 'premium' : (cycle === 'yearly' ? 'pro' : 'basic'),
      template_id,
      billing_cycle: cycle,
      price
    });

    // ─── 4. تفعيل الاشتراك (مع فترة تجريبية 14 يوم) ───
    // الاشتراك يبدأ بحالة trial تلقائياً

    // ─── 5. إنشاء التخصيصات الافتراضية ───
    await Customization.upsert(site_key, {
      store_name,
      primary_color: primary_color || '#7c5cff',
      secondary_color: '#a78bfa',
      logo_url: logo_url || null,
      dark_mode: true,
      button_radius: 'rounded-xl',
      header_style: 'default',
      show_banner: true,
      font_family: 'Tajawal',
    });

    // ─── 6. إنشاء توكن ───
    const token = generateToken(admin.id, admin.role, site_key);

    // ─── الاستجابة ───
    res.status(201).json({
      message: 'تم إنشاء الموقع وتفعيله بنجاح!',
      token,
      site_key,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        site_key
      },
      site: {
        site_key,
        domain,
        name: store_name,
        template_id,
        plan: cycle === 'lifetime' ? 'premium' : (cycle === 'yearly' ? 'pro' : 'basic'),
        status: 'active'
      },
      subscription: {
        id: subscription.id,
        billing_cycle: cycle,
        price,
        status: subscription.status,
        trial_ends_at: subscription.trial_ends_at
      },
      dashboard_url: `/my-dashboard`
    });

  } catch (error) {
    console.error('Error in provisionSite:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الموقع' });
  }
}

// ─── جلب بيانات الموقع الخاص بالمستخدم ───
async function getMySite(req, res) {
  try {
    const { site_key } = req.user;
    const site = await Site.findBySiteKey(site_key);
    if (!site) {
      return res.status(404).json({ error: 'الموقع غير موجود' });
    }

    const subscription = await Subscription.findActiveBySiteKey(site_key);
    const customization = await Customization.findBySiteKey(site_key);

    // parse settings JSON
    let settings = {};
    try {
      settings = site.settings ? (typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings) : {};
    } catch(e) { settings = {}; }

    res.json({
      site: {
        ...site,
        settings
      },
      subscription,
      customization
    });
  } catch (error) {
    console.error('Error in getMySite:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// ─── تحديث إعدادات الموقع ───
async function updateSiteSettings(req, res) {
  try {
    const { site_key } = req.user;
    const { store_name, domain_slug, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = req.body;

    const site = await Site.findBySiteKey(site_key);
    if (!site) {
      return res.status(404).json({ error: 'الموقع غير موجود' });
    }

    const pool = require('../config/db').getPool();
    const updates = [];
    const values = [];

    if (store_name) {
      updates.push('name = ?');
      values.push(store_name);
    }

    if (domain_slug) {
      const newDomain = `${domain_slug.toLowerCase().replace(/[^a-z0-9-]/g, '')}.nexiro.com`;
      const existingDomain = await Site.findByDomain(newDomain);
      if (existingDomain && existingDomain.site_key !== site_key) {
        return res.status(400).json({ error: 'هذا النطاق مستخدم بالفعل' });
      }
      updates.push('domain = ?');
      values.push(newDomain);
    }

    // تحديث SMTP settings
    let currentSettings = {};
    try {
      currentSettings = site.settings ? (typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings) : {};
    } catch(e) { currentSettings = {}; }

    if (smtp_host !== undefined) {
      currentSettings.smtp = {
        host: smtp_host,
        port: smtp_port || 587,
        user: smtp_user || '',
        pass: smtp_pass || '',
        from: smtp_from || ''
      };
      updates.push('settings = ?');
      values.push(JSON.stringify(currentSettings));
    }

    if (updates.length > 0) {
      values.push(site_key);
      await pool.query(
        `UPDATE sites SET ${updates.join(', ')} WHERE site_key = ?`,
        values
      );
    }

    const updatedSite = await Site.findBySiteKey(site_key);
    res.json({ message: 'تم تحديث الإعدادات بنجاح', site: updatedSite });
  } catch (error) {
    console.error('Error in updateSiteSettings:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الإعدادات' });
  }
}

module.exports = {
  provisionSite,
  getMySite,
  updateSiteSettings
};
