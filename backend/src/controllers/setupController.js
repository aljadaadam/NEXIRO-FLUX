const Site = require('../models/Site');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Customization = require('../models/Customization');
const PurchaseCode = require('../models/PurchaseCode');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
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
      // بيانات الدفع (من الفرونت)
      payment_method,
      payment_reference,
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

    // ─── التحقق من حالة الدفع (إن كان عبر بوابة دفع) ───
    let verifiedPayment = null;
    if (!codeData && payment_reference && payment_reference !== 'manual') {
      // استخراج payment_id من المرجع
      const paymentId = parseInt(payment_reference) || parseInt(payment_reference.replace(/\D/g, ''));
      if (paymentId) {
        const paymentRecord = await Payment.findById(paymentId);
        if (!paymentRecord) {
          return res.status(400).json({
            error: 'مرجع الدفع غير صالح. لم يتم العثور على عملية دفع مطابقة',
            errorEn: 'Invalid payment reference. No matching payment found',
          });
        }
        if (paymentRecord.status === 'completed') {
          verifiedPayment = paymentRecord;
        } else if (paymentRecord.status === 'pending' && paymentRecord.payment_method === 'bank_transfer') {
          // التحويل البنكي: نسمح بالمتابعة بحالة "بانتظار المراجعة"
          verifiedPayment = paymentRecord;
        } else if (paymentRecord.status === 'pending') {
          return res.status(402).json({
            error: 'لم يتم تأكيد الدفع بعد. أكمل عملية الدفع أولاً ثم أعد المحاولة',
            errorEn: 'Payment not confirmed yet. Complete the payment first, then try again',
            payment_status: paymentRecord.status,
            payment_id: paymentRecord.id,
          });
        } else {
          return res.status(402).json({
            error: `عملية الدفع ${paymentRecord.status === 'failed' ? 'فشلت' : paymentRecord.status === 'cancelled' ? 'ملغاة' : 'غير مكتملة'}. يرجى إعادة الدفع`,
            errorEn: `Payment ${paymentRecord.status}. Please try payment again`,
            payment_status: paymentRecord.status,
          });
        }
      }
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
    if (verifiedPayment && verifiedPayment.status === 'completed') {
      paymentStatus = 'paid_by_gateway';
    } else if (verifiedPayment && verifiedPayment.payment_method === 'bank_transfer') {
      paymentStatus = 'pending_bank_review';
    } else if (codeData) {
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
          payment_method: payment_method || (purchase_code ? 'purchase_code' : 'manual'),
          payment_reference: payment_reference || null,
          payment_status: paymentStatus,
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
    // إذا تم الدفع بكود أو بوابة دفع → تفعيل مباشر
    if (paymentStatus === 'paid_by_code' || paymentStatus === 'paid_by_gateway') {
      await Subscription.activate(subscription.id, site_key);
    }

    // ─── 4.5 تسجيل استخدام كود الشراء ───
    if (codeData && purchase_code) {
      await PurchaseCode.markUsed(purchase_code, owner_email, site_key);
    }

    // ─── 4.6 تسجيل عملية الدفع في جدول المدفوعات ───
    const finalPaymentMethod = verifiedPayment?.payment_method || payment_method || (codeData ? 'purchase_code' : 'manual');
    const finalPaymentRef = payment_reference || (codeData ? `CODE-${purchase_code}` : `SETUP-${Date.now()}`);
    try {
      if (verifiedPayment) {
        // ربط الدفعة المؤكدة بالموقع الجديد
        await Payment.updateMeta(verifiedPayment.id, verifiedPayment.site_key, {
          provisioned_site_key: site_key,
          provisioned_store: store_name,
          provisioned_at: new Date().toISOString(),
        });
      } else {
        await Payment.create({
          site_key,
          customer_id: null,
          order_id: null,
          type: 'subscription',
          amount: price,
          currency: 'USD',
          payment_method: finalPaymentMethod,
          payment_gateway_id: null,
          status: (paymentStatus === 'paid_by_code') ? 'completed' : 'pending',
          description: `Site provisioning: ${store_name} (${cycle})`,
        });
      }
    } catch (payErr) {
      console.error('Payment record creation failed (non-blocking):', payErr.message);
    }

    // ─── 4.7 تسجيل النشاط في سجل الأنشطة ───
    try {
      await ActivityLog.log({
        site_key,
        user_id: admin.id,
        action: 'site_created',
        entity_type: 'site',
        entity_id: site_key,
        details: {
          store_name,
          domain,
          template_id,
          billing_cycle: cycle,
          payment_method: finalPaymentMethod,
          payment_status: paymentStatus,
          price,
        },
        ip_address: req.ip || req.connection?.remoteAddress,
      });
    } catch (logErr) {
      console.error('Activity log failed (non-blocking):', logErr.message);
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
      to: owner_email, name: owner_name, siteName: store_name, trialDays: 14, siteKey: site_key
    }).catch(e => console.error('Email error:', e.message));

    // ─── 7.5 إشعار الأدمن الرئيسي بإنشاء موقع جديد ───
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nexiroflux.com';
    emailService.send({
      to: ADMIN_EMAIL,
      subject: `🆕 موقع جديد: ${store_name} (${domain})`,
      html: `<div style="font-family:Tajawal,sans-serif;direction:rtl;padding:20px">
        <h2>تم إنشاء موقع جديد على المنصة</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">اسم المتجر</td><td style="padding:8px;border:1px solid #ddd">${store_name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">الدومين</td><td style="padding:8px;border:1px solid #ddd">${domain}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">المالك</td><td style="padding:8px;border:1px solid #ddd">${owner_name} (${owner_email})</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">القالب</td><td style="padding:8px;border:1px solid #ddd">${template_id}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">الخطة</td><td style="padding:8px;border:1px solid #ddd">${cycle}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">السعر</td><td style="padding:8px;border:1px solid #ddd">$${price}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">طريقة الدفع</td><td style="padding:8px;border:1px solid #ddd">${finalPaymentMethod}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">حالة الدفع</td><td style="padding:8px;border:1px solid #ddd">${paymentStatus}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Site Key</td><td style="padding:8px;border:1px solid #ddd">${site_key}</td></tr>
        </table>
      </div>`,
    }).catch(e => console.error('Admin notification email error:', e.message));

    // ─── 8. إعداد Nginx + SSL تلقائياً (دومين مخصص) ───
    let infrastructureResult = null;
    if (domain && !domain.endsWith('.nexiroflux.com')) {
      try {
        const { execSync } = require('child_process');
        const scriptPath = require('path').resolve(__dirname, '../../scripts/provision-site.py');
        const output = execSync(`python3 ${scriptPath} ${domain}`, {
          timeout: 150000, // 2.5 min (certbot may take time)
          encoding: 'utf-8'
        });
        infrastructureResult = JSON.parse(output.trim());
        console.log(`✅ Infrastructure provisioned for ${domain}:`, infrastructureResult);
      } catch (infraErr) {
        console.error(`⚠️ Infrastructure provisioning failed for ${domain} (non-blocking):`, infraErr.message);
        infrastructureResult = { success: false, error: infraErr.message };
      }
    }

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
        status: (paymentStatus === 'paid_by_code' || paymentStatus === 'paid_by_gateway') ? 'active' : subscription.status,
        trial_ends_at: subscription.trial_ends_at,
        payment_status: paymentStatus,
        payment_method: finalPaymentMethod,
        payment_reference: finalPaymentRef,
        purchase_code: purchase_code || null,
      },
      dashboard_url: `https://${domain}`,
      infrastructure: infrastructureResult
    });

  } catch (error) {
    console.error('Error in provisionSite:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الموقع' });
  }
}

// ─── جلب بيانات الموقع الخاص بالمستخدم ───
async function getMySite(req, res) {
  try {
    const { id: userId, role, site_key } = req.user;

    // جلب بيانات المستخدم (نحتاج البريد الإلكتروني)
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    let site = null;

    if (role === 'admin') {
      // الأدمن → يرى الموقع المرتبط بـ site_key الخاص به (تم إنشاؤه أثناء التزويد)
      site = await Site.findBySiteKey(site_key);
    } else {
      // مستخدم عادي → البحث عن موقع يملكه (عبر owner_email)
      // لا يجب أن يرى الموقع الرئيسي للمنصة
      const pool = require('../config/db').getPool();
      const [rows] = await pool.query(
        'SELECT * FROM sites WHERE owner_email = ? AND site_key != ? ORDER BY created_at DESC LIMIT 1',
        [currentUser.email, site_key]
      );
      site = rows[0] || null;
    }

    if (!site) {
      // لم يشترِ قالب بعد — لكن ربما دفع ولم يكمل الإعداد
      let pendingSetup = null;
      try {
        const pool = require('../config/db').getPool();
        // البحث بالإيميل في meta (الأساسي)، أو بالإيميل في description كـ fallback
        const [pendingPayments] = await pool.query(
          `SELECT id, amount, currency, meta, description, created_at 
           FROM payments 
           WHERE status = 'completed' 
             AND type = 'purchase'
             AND (
               (meta IS NOT NULL AND JSON_EXTRACT(meta, '$.customer_email') = ? AND JSON_EXTRACT(meta, '$.provisioned_site_key') IS NULL)
               OR
               (meta IS NOT NULL AND JSON_EXTRACT(meta, '$.customer_email') IS NULL AND JSON_EXTRACT(meta, '$.provisioned_site_key') IS NULL)
             )
           ORDER BY created_at DESC LIMIT 5`,
          [currentUser.email]
        );
        
        // أولوية: الدفعات التي تطابق الإيميل
        let matchedPayment = pendingPayments.find(p => {
          const m = typeof p.meta === 'string' ? JSON.parse(p.meta) : (p.meta || {});
          return m.customer_email === currentUser.email;
        });
        
        // fallback: أي دفعة مكتملة بدون إيميل وبدون موقع مُجهز
        if (!matchedPayment && pendingPayments.length > 0) {
          matchedPayment = pendingPayments[0];
        }

        if (matchedPayment) {
          const meta = typeof matchedPayment.meta === 'string' ? JSON.parse(matchedPayment.meta) : (matchedPayment.meta || {});
          pendingSetup = {
            payment_id: matchedPayment.id,
            template_id: meta.template_id || meta.product_id || null,
            plan: meta.plan || null,
            amount: matchedPayment.amount,
            currency: matchedPayment.currency,
            paid_at: matchedPayment.created_at,
          };
        }
      } catch (e) {
        console.error('Error checking pending setup:', e);
      }

      return res.json({ site: null, subscription: null, customization: null, pendingSetup });
    }

    const subscription = await Subscription.findActiveBySiteKey(site.site_key);
    const customization = await Customization.findBySiteKey(site.site_key);

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

// ─── Helper: إيجاد الموقع الذي يملكه المستخدم ───
async function resolveUserOwnedSite(req) {
  const { id: userId, role, site_key } = req.user;
  if (role === 'admin') {
    return await Site.findBySiteKey(site_key);
  }
  // مستخدم عادي → البحث عن موقع يملكه عبر owner_email
  const currentUser = await User.findById(userId);
  if (!currentUser) return null;
  const pool = require('../config/db').getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sites WHERE owner_email = ? AND site_key != ? ORDER BY created_at DESC LIMIT 1',
    [currentUser.email, site_key]
  );
  return rows[0] || null;
}

// ─── تحديث إعدادات الموقع ───
async function updateSiteSettings(req, res) {
  try {
    const site = await resolveUserOwnedSite(req);
    const { store_name, domain_slug, custom_domain: newCustomDomain, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = req.body;

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
      if (existingDomain && existingDomain.site_key !== site.site_key) {
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
      if (existingDomain && existingDomain.site_key !== site.site_key) {
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
      values.push(site.site_key);
      await pool.query(
        `UPDATE sites SET ${updates.join(', ')} WHERE site_key = ?`,
        values
      );
    }

    const updatedSite = await Site.findBySiteKey(site.site_key);
    res.json({ message: 'تم تحديث الإعدادات بنجاح', site: updatedSite });
  } catch (error) {
    console.error('Error in updateSiteSettings:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الإعدادات' });
  }
}

// ─── تحديث الدومين المخصص ───
async function updateCustomDomain(req, res) {
  try {
    const site = await resolveUserOwnedSite(req);
    const { custom_domain } = req.body;

    if (!site) {
      return res.status(404).json({ error: 'الموقع غير موجود' });
    }

    if (!custom_domain) {
      return res.status(400).json({ error: 'الدومين المخصص مطلوب' });
    }

    const domain = custom_domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // التحقق من أن الدومين غير مستخدم
    const existing = await Site.findByCustomDomain(domain);
    if (existing && existing.site_key !== site.site_key) {
      return res.status(400).json({ error: 'هذا الدومين مستخدم بالفعل من موقع آخر' });
    }

    const updated = await Site.updateCustomDomain(site.site_key, domain);
    
    // Clear tenant cache for this domain
    const { clearDomainCache } = require('../middlewares/resolveTenant');
    clearDomainCache(domain);

    res.json({ 
      message: 'تم تحديث الدومين المخصص بنجاح',
      site: updated,
      dns_instructions: {
        type: 'A',
        name: '@',
        value: '181.215.69.49',
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
    const site = await resolveUserOwnedSite(req);
    if (!site) {
      return res.status(404).json({ error: 'الموقع غير موجود' });
    }
    
    if (site.custom_domain) {
      const { clearDomainCache } = require('../middlewares/resolveTenant');
      clearDomainCache(site.custom_domain);
    }

    await Site.updateCustomDomain(site.site_key, null);
    const updated = await Site.findBySiteKey(site.site_key);
    res.json({ message: 'تم إزالة الدومين المخصص', site: updated });
  } catch (error) {
    console.error('Error in removeCustomDomain:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// ─── التحقق من DNS للدومين المخصص ───
async function verifyDomainDNS(req, res) {
  try {
    const site = await resolveUserOwnedSite(req);
    
    if (!site?.custom_domain) {
      return res.status(400).json({ error: 'لا يوجد دومين مخصص لهذا الموقع' });
    }

    const dns = require('dns').promises;
    const SERVER_IP = '181.215.69.49';
    let dnsOk = false;
    let dnsResult = {};

    try {
      const cnames = await dns.resolveCname(site.custom_domain);
      if (cnames.some(c => c.includes('nexiroflux') || c.includes('nexiro-flux'))) {
        dnsOk = true;
        dnsResult.cname = cnames;
      }
    } catch (e) {
      try {
        const addresses = await dns.resolve4(site.custom_domain);
        dnsResult.a_records = addresses;
        if (addresses.includes(SERVER_IP)) {
          dnsOk = true;
        } else {
          dnsResult.expected_ip = SERVER_IP;
          dnsResult.note = `A record يشير إلى ${addresses.join(', ')} بدلاً من ${SERVER_IP}`;
        }
      } catch (e2) {
        dnsResult.error = 'لم يتم العثور على سجلات DNS للدومين';
        dnsResult.errorEn = 'No DNS records found for this domain';
      }
    }

    const verified = dnsOk;

    // Update verification status
    if (verified) {
      const pool = require('../config/db').getPool();
      await pool.query('UPDATE sites SET dns_verified = 1 WHERE site_key = ?', [site.site_key]);
    }

    let message, messageEn;
    if (verified) {
      message = 'تم التحقق بنجاح! الدومين يشير إلى سيرفرنا. تأكد أن الدومين غير مربوط باستضافة أخرى أو قوالب أخرى كي يعمل بشكل صحيح';
      messageEn = 'Verified! Domain points to our server. Make sure the domain is not linked to another hosting or other templates for it to work correctly';
    } else {
      message = `لم يتم التحقق. تأكد من إضافة سجل A يشير إلى ${SERVER_IP}`;
      messageEn = `Not verified. Make sure to add an A record pointing to ${SERVER_IP}`;
    }

    res.json({
      domain: site.custom_domain,
      verified,
      dnsOk,
      dns: dnsResult,
      server_ip: SERVER_IP,
      message,
      messageEn,
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
    const SERVER_IP = '181.215.69.49';
    let dnsOk = false;
    let dnsResult = {};

    try {
      const cnames = await dns.resolveCname(cleanDomain);
      if (cnames.some(c => c.includes('nexiroflux') || c.includes('nexiro-flux'))) {
        dnsOk = true;
        dnsResult.type = 'CNAME';
        dnsResult.cname = cnames;
      }
    } catch (e) {
      try {
        const addresses = await dns.resolve4(cleanDomain);
        dnsResult.type = 'A';
        dnsResult.a_records = addresses;
        if (addresses.includes(SERVER_IP)) {
          dnsOk = true;
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

    const verified = dnsOk;

    let message, messageEn;
    if (verified) {
      message = 'تم التحقق بنجاح! الدومين يشير إلى سيرفرنا. تأكد أن الدومين غير مربوط باستضافة أخرى أو قوالب أخرى كي يعمل بشكل صحيح';
      messageEn = 'Verified! Domain points to our server. Make sure the domain is not linked to another hosting or other templates for it to work correctly';
    } else {
      message = `DNS لا يشير إلى سيرفرنا. أضف سجل A يشير إلى ${SERVER_IP}`;
      messageEn = `DNS is not pointing to our server. Add an A record pointing to ${SERVER_IP}`;
    }

    res.json({
      domain: cleanDomain,
      verified,
      dnsOk,
      server_ip: SERVER_IP,
      dns: dnsResult,
      message,
      messageEn,
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
