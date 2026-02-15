const Site = require('../models/Site');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Customization = require('../models/Customization');
const PurchaseCode = require('../models/PurchaseCode');
const { generateToken } = require('../utils/token');
const crypto = require('crypto');
const emailService = require('../services/email');

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
      custom_domain,
      // إعدادات البريد (اختيارية)
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      smtp_from,
      // إعدادات التخصيص (اختيارية)
      primary_color,
      logo_url,
      // كود الشراء (اختياري)
      purchase_code,
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

    // ─── التحقق من كود الشراء (إن وُجد) ───
    let codeData = null;
    if (purchase_code) {
      const codeResult = await PurchaseCode.validate(purchase_code, template_id);
      if (!codeResult.valid) {
        return res.status(400).json({ error: codeResult.error, errorEn: codeResult.errorEn });
      }
      codeData = codeResult;
    }

    // ─── توليد site_key و domain ───
    const site_key = generateSiteKey(store_name);
    // الدومين الأساسي (داخلي) — دائماً subdomain
    const internalDomain = domain_slug
      ? `${domain_slug.toLowerCase().replace(/[^a-z0-9-]/g, '')}.nexiroflux.com`
      : `${site_key}.nexiroflux.com`;
    // الدومين الحقيقي للعميل
    const clientDomain = custom_domain
      ? custom_domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
      : null;
    // الدومين المعروض — الحقيقي إن وُجد، وإلا الداخلي
    const domain = clientDomain || internalDomain;

    // التحقق من عدم تكرار الدومين
    const existingDomain = await Site.findByDomain(domain);
    if (existingDomain) {
      return res.status(400).json({ error: 'هذا النطاق مستخدم بالفعل، اختر اسمًا آخر', errorEn: 'This domain is already in use, choose another name' });
    }
    if (clientDomain) {
      const existingCustom = await Site.findByDomain(clientDomain);
      if (existingCustom) {
        return res.status(400).json({ error: 'هذا الدومين مربوط بموقع آخر بالفعل', errorEn: 'This domain is already linked to another site' });
      }
    }

    // ─── تحديد السعر حسب الخطة ───
    const prices = {
      'digital-services-store': { monthly: 39, yearly: 349, lifetime: 899 },
      'ecommerce-pro': { monthly: 29, yearly: 249, lifetime: 599 },
      'restaurant-starter': { monthly: 19, yearly: 159, lifetime: 399 },
      'portfolio-developer': { monthly: 15, yearly: 129, lifetime: 299 },
    };

    const templatePrices = prices[template_id] || { monthly: 29, yearly: 249, lifetime: 599 };
    const cycle = (codeData?.billing_cycle) || billing_cycle || 'monthly';
    let price = templatePrices[cycle] || templatePrices.monthly;

    // ─── تطبيق خصم الكود ───
    let paymentStatus = 'trial'; // الحالة الافتراضية تجريبية
    if (codeData) {
      if (codeData.discount_type === 'full') {
        price = 0;
        paymentStatus = 'paid_by_code';
      } else if (codeData.discount_type === 'percentage') {
        price = price * (1 - codeData.discount_value / 100);
        paymentStatus = price <= 0 ? 'paid_by_code' : 'partial_code';
      } else if (codeData.discount_type === 'fixed') {
        price = Math.max(0, price - codeData.discount_value);
        paymentStatus = price <= 0 ? 'paid_by_code' : 'partial_code';
      }
    }

    // ─── 1. إنشاء الموقع ───
    const { getPool } = require('../config/db');
    const pool = getPool();

    await pool.query(
      `INSERT INTO sites (site_key, domain, custom_domain, name, template_id, plan, status, owner_email, settings)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        site_key,
        clientDomain || internalDomain,
        clientDomain || null,
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
    // إذا تم الدفع بكود → تفعيل مباشر
    if (codeData && paymentStatus === 'paid_by_code') {
      await Subscription.activate(subscription.id, site_key);
    }

    // ─── 4.5 تسجيل استخدام كود الشراء ───
    if (codeData && purchase_code) {
      await PurchaseCode.markUsed(purchase_code, owner_email, site_key);
    }

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

    // ─── 7. إرسال بريد ترحيبي + بدء تجريبية ───
    emailService.sendSiteCreated({
      to: owner_email, name: owner_name, siteName: store_name,
      siteKey: site_key, domain, plan: cycle
    }).catch(e => console.error('Email error:', e.message));
    emailService.sendTrialStarted({
      to: owner_email, name: owner_name, siteName: store_name, trialDays: 14
    }).catch(e => console.error('Email error:', e.message));

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
        status: (codeData && paymentStatus === 'paid_by_code') ? 'active' : subscription.status,
        trial_ends_at: subscription.trial_ends_at,
        payment_status: paymentStatus,
        purchase_code: purchase_code || null,
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
    const { store_name, domain_slug, custom_domain: newCustomDomain, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = req.body;

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

    // تحديث الدومين المخصص (الحقيقي)
    if (newCustomDomain) {
      const cleanDomain = newCustomDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
      const existingDomain = await Site.findByAnyDomain(cleanDomain);
      if (existingDomain && existingDomain.site_key !== site_key) {
        return res.status(400).json({ error: 'هذا الدومين مستخدم بالفعل', errorEn: 'This domain is already in use' });
      }
      updates.push('domain = ?');
      values.push(cleanDomain);
      updates.push('custom_domain = ?');
      values.push(cleanDomain);
      updates.push('dns_verified = 0');
      // Clear tenant cache
      const { clearDomainCache } = require('../middlewares/resolveTenant');
      if (site.domain) clearDomainCache(site.domain);
      if (site.custom_domain) clearDomainCache(site.custom_domain);
    } else if (domain_slug) {
      // Fallback: subdomain style (legacy)
      const newDomain = `${domain_slug.toLowerCase().replace(/[^a-z0-9-]/g, '')}.nexiroflux.com`;
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

// ─── تحديث الدومين المخصص ───
async function updateCustomDomain(req, res) {
  try {
    const { site_key } = req.user;
    const { custom_domain } = req.body;

    if (!custom_domain) {
      return res.status(400).json({ error: 'الدومين المخصص مطلوب' });
    }

    const domain = custom_domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // التحقق من أن الدومين غير مستخدم
    const existing = await Site.findByCustomDomain(domain);
    if (existing && existing.site_key !== site_key) {
      return res.status(400).json({ error: 'هذا الدومين مستخدم بالفعل من موقع آخر' });
    }

    const site = await Site.updateCustomDomain(site_key, domain);
    
    // Clear tenant cache for this domain
    const { clearDomainCache } = require('../middlewares/resolveTenant');
    clearDomainCache(domain);

    res.json({ 
      message: 'تم تحديث الدومين المخصص بنجاح',
      site,
      dns_instructions: {
        type: 'A',
        name: '@',
        value: '154.56.60.195',
        note: 'أضف سجل A في إعدادات DNS لدومينك يشير إلى IP سيرفر NEXIRO-FLUX',
        noteEn: 'Add an A record in your domain DNS settings pointing to NEXIRO-FLUX server IP',
        alternative: {
          type: 'CNAME',
          name: '@',
          value: 'nexiroflux.com',
          note: 'أو أضف سجل CNAME يشير إلى nexiroflux.com'
        }
      }
    });
  } catch (error) {
    console.error('Error in updateCustomDomain:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الدومين' });
  }
}

// ─── إزالة الدومين المخصص ───
async function removeCustomDomain(req, res) {
  try {
    const { site_key } = req.user;
    const site = await Site.findBySiteKey(site_key);
    
    if (site?.custom_domain) {
      const { clearDomainCache } = require('../middlewares/resolveTenant');
      clearDomainCache(site.custom_domain);
    }

    await Site.updateCustomDomain(site_key, null);
    const updated = await Site.findBySiteKey(site_key);
    res.json({ message: 'تم إزالة الدومين المخصص', site: updated });
  } catch (error) {
    console.error('Error in removeCustomDomain:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// ─── التحقق من DNS للدومين المخصص ───
async function verifyDomainDNS(req, res) {
  try {
    const { site_key } = req.user;
    const site = await Site.findBySiteKey(site_key);
    
    if (!site?.custom_domain) {
      return res.status(400).json({ error: 'لا يوجد دومين مخصص لهذا الموقع' });
    }

    const dns = require('dns').promises;
    const SERVER_IP = '154.56.60.195'; // VPS IP where backend runs
    let verified = false;
    let dnsResult = {};

    try {
      // Check CNAME
      const cnames = await dns.resolveCname(site.custom_domain);
      if (cnames.some(c => c.includes('nexiroflux') || c.includes('nexiro-flux'))) {
        verified = true;
        dnsResult.cname = cnames;
      }
    } catch (e) {
      // CNAME not found, try A record
      try {
        const addresses = await dns.resolve4(site.custom_domain);
        dnsResult.a_records = addresses;
        // Verify A record points to our VPS
        if (addresses.includes(SERVER_IP)) {
          verified = true;
        } else {
          dnsResult.expected_ip = SERVER_IP;
          dnsResult.note = `A record يشير إلى ${addresses.join(', ')} بدلاً من ${SERVER_IP}`;
        }
      } catch (e2) {
        dnsResult.error = 'لم يتم العثور على سجلات DNS للدومين';
        dnsResult.errorEn = 'No DNS records found for this domain';
      }
    }

    // Update verification status
    if (verified) {
      const pool = require('../config/db').getPool();
      await pool.query('UPDATE sites SET dns_verified = 1 WHERE site_key = ?', [site_key]);
    }

    res.json({
      domain: site.custom_domain,
      verified,
      dns: dnsResult,
      server_ip: SERVER_IP,
      message: verified 
        ? '✅ تم التحقق من DNS بنجاح! الدومين جاهز للاستخدام' 
        : `❌ لم يتم التحقق من DNS. تأكد من إعداد سجل A يشير إلى ${SERVER_IP} أو CNAME يشير إلى nexiroflux.com`,
      messageEn: verified
        ? '✅ DNS verified successfully! Domain is ready to use'
        : `❌ DNS not verified. Make sure A record points to ${SERVER_IP} or CNAME points to nexiroflux.com`
    });
  } catch (error) {
    console.error('Error in verifyDomainDNS:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من DNS' });
  }
}

// ─── جلب بيانات الموقع من الدومين (عام — بدون مصادقة) ───
async function getSiteByDomain(req, res) {
  try {
    const { domain } = req.params;
    const site = await Site.findByAnyDomain(domain.toLowerCase());
    
    if (!site) {
      return res.status(404).json({ error: 'الموقع غير موجود' });
    }

    if (site.status === 'suspended') {
      return res.status(403).json({ error: 'الموقع معلق', status: 'suspended' });
    }

    // Check subscription validity
    const subscription = await Subscription.findActiveBySiteKey(site.site_key);
    const Customization = require('../models/Customization');
    const customization = await Customization.findBySiteKey(site.site_key);

    res.json({
      site_key: site.site_key,
      name: site.name,
      domain: site.domain,
      custom_domain: site.custom_domain,
      template_id: site.template_id,
      plan: site.plan,
      status: site.status,
      subscription: subscription ? {
        status: subscription.status,
        plan: subscription.plan_id,
        expires_at: subscription.expires_at,
        trial_ends_at: subscription.trial_ends_at
      } : null,
      customization: customization || null
    });
  } catch (error) {
    console.error('Error in getSiteByDomain:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// ─── التحقق من DNS لدومين (عام — بدون مصادقة، يُستخدم في معالج الإعداد) ───
async function checkDomainDNS(req, res) {
  try {
    const { domain } = req.params;
    if (!domain) {
      return res.status(400).json({ error: 'الدومين مطلوب', errorEn: 'Domain is required' });
    }

    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    const dns = require('dns').promises;
    const SERVER_IP = '154.56.60.195';
    let verified = false;
    let dnsResult = {};

    try {
      // Check CNAME first
      const cnames = await dns.resolveCname(cleanDomain);
      if (cnames.some(c => c.includes('nexiroflux') || c.includes('nexiro-flux'))) {
        verified = true;
        dnsResult.type = 'CNAME';
        dnsResult.cname = cnames;
      }
    } catch (e) {
      // CNAME not found, try A record
      try {
        const addresses = await dns.resolve4(cleanDomain);
        dnsResult.type = 'A';
        dnsResult.a_records = addresses;
        if (addresses.includes(SERVER_IP)) {
          verified = true;
        } else {
          dnsResult.expected_ip = SERVER_IP;
          dnsResult.current_ip = addresses.join(', ');
        }
      } catch (e2) {
        dnsResult.type = 'NONE';
        dnsResult.error = 'لم يتم العثور على سجلات DNS';
        dnsResult.errorEn = 'No DNS records found for this domain';
      }
    }

    res.json({
      domain: cleanDomain,
      verified,
      server_ip: SERVER_IP,
      dns: dnsResult,
      message: verified
        ? '✅ DNS يشير بشكل صحيح إلى سيرفرنا!'
        : `❌ DNS لا يشير إلى سيرفرنا. تأكد من إضافة سجل A يشير إلى ${SERVER_IP}`,
      messageEn: verified
        ? '✅ DNS is correctly pointing to our server!'
        : `❌ DNS is not pointing to our server. Make sure to add an A record pointing to ${SERVER_IP}`,
    });
  } catch (error) {
    console.error('Error in checkDomainDNS:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من DNS' });
  }
}

module.exports = {
  provisionSite,
  getMySite,
  updateSiteSettings,
  updateCustomDomain,
  removeCustomDomain,
  verifyDomainDNS,
  checkDomainDNS,
  getSiteByDomain
};
