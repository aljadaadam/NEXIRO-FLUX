const Site = require('../models/Site');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Customization = require('../models/Customization');
const PurchaseCode = require('../models/PurchaseCode');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const { generateToken } = require('../utils/token');
const bcrypt = require('bcryptjs');
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

    // ─── التحقق من حالة الدفع (إن كان عبر بوابة دفع) — تحقق أولي سريع ───
    let verifiedPayment = null;
    let paymentId = null;
    if (!codeData && payment_reference && payment_reference !== 'manual') {
      // استخراج payment_id من المرجع
      paymentId = parseInt(payment_reference) || parseInt(payment_reference.replace(/\D/g, ''));
      if (paymentId) {
        const paymentRecord = await Payment.findById(paymentId);
        if (!paymentRecord) {
          return res.status(400).json({
            error: 'مرجع الدفع غير صالح. لم يتم العثور على عملية دفع مطابقة',
            errorEn: 'Invalid payment reference. No matching payment found',
          });
        }

        // ─── ⛔ منع إعادة استخدام مرجع الدفع لإنشاء مواقع متعددة (تحقق أولي سريع) ───
        if (paymentRecord.meta) {
          const meta = typeof paymentRecord.meta === 'string' ? JSON.parse(paymentRecord.meta) : paymentRecord.meta;
          if (meta.provisioned_site_key) {
            return res.status(409).json({
              error: 'تم استخدام هذه الدفعة لإنشاء موقع بالفعل. لا يمكن إنشاء موقع آخر بنفس الدفعة',
              errorEn: 'This payment has already been used to provision a site. Cannot create another site with the same payment',
              already_provisioned: true,
              existing_site_key: meta.provisioned_site_key,
            });
          }
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

    // ─── تحديد السعر حسب الخطة (من قاعدة البيانات أولاً، ثم الافتراضي) ───
    // ربط template_id بالتصنيف في جدول products
    const templateCategoryMap = {
      'digital-services-store': 'digital-services',
      'game-topup-store': 'game-topup',
      'hardware-tools-store': 'hardware-tools',
      'car-dealership-store': 'car-dealership',
      'ecommerce-pro': 'e-commerce',
      'restaurant-starter': 'restaurant',
      'portfolio-creative': 'portfolio',
      'saas-dashboard': 'dashboard',
      'landing-starter': 'landing',
      'medical-clinic': 'medical',
      'smm-store': 'smm',
    };

    // الأسعار الافتراضية (fallback إذا لم يوجد سعر في قاعدة البيانات)
    const fallbackPrices = {
      'digital-services-store': { monthly: 14.9, yearly: 149, lifetime: 499.9 },
      'game-topup-store': { monthly: 14.9, yearly: 149, lifetime: 499.9 },
      'hardware-tools-store': { monthly: 14.9, yearly: 149, lifetime: 499.9 },
      'car-dealership-store': { monthly: 14.9, yearly: 149, lifetime: 499.9 },
      'ecommerce-pro': { monthly: 29.9, yearly: 299, lifetime: 747.5 },
      'restaurant-starter': { monthly: 19.9, yearly: 199, lifetime: 497.5 },
      'portfolio-creative': { monthly: 14.9, yearly: 149, lifetime: 372.5 },
      'saas-dashboard': { monthly: 39.9, yearly: 399, lifetime: 997.5 },
      'landing-starter': { monthly: 14.9, yearly: 149, lifetime: 372.5 },
      'medical-clinic': { monthly: 34.9, yearly: 349, lifetime: 872.5 },
      'smm-store': { monthly: 14.9, yearly: 149, lifetime: 499.9 },
    };

    // محاولة قراءة السعر من قاعدة البيانات (أسعار الأدمن)
    let templatePrices = fallbackPrices[template_id] || { monthly: 29, yearly: 249, lifetime: 599 };
    try {
      const { getPool } = require('../config/db');
      const dbPool = getPool();
      const category = templateCategoryMap[template_id];
      if (category) {
        const [dbRows] = await dbPool.query(
          `SELECT price, price_yearly, price_lifetime FROM products
           WHERE site_key = 'nexiroflux' AND service_type = 'TEMPLATE' AND category = ?
           LIMIT 1`,
          [category]
        );
        if (dbRows.length > 0 && dbRows[0].price > 0) {
          const row = dbRows[0];
          templatePrices = {
            monthly: parseFloat(row.price) || templatePrices.monthly,
            yearly: parseFloat(row.price_yearly) || templatePrices.yearly,
            lifetime: parseFloat(row.price_lifetime) || templatePrices.lifetime,
          };
        }
      }
    } catch (dbErr) {
      console.warn('⚠️ Failed to read template prices from DB, using fallback:', dbErr.message);
    }
    const cycle = (codeData?.billing_cycle) || billing_cycle || 'monthly';
    let price = templatePrices[cycle] || templatePrices.monthly;
    const originalPrice = price; // ← السعر الأصلي قبل أي خصم

    // ─── ⛔ يجب توفير كود شراء صالح أو دفعة مؤكدة لإنشاء موقع ───
    if (!codeData && !verifiedPayment) {
      return res.status(402).json({
        error: 'يجب توفير كود شراء صالح أو إتمام عملية دفع قبل إنشاء الموقع',
        errorEn: 'A valid purchase code or completed payment is required to provision a site',
      });
    }

    // ─── ⛔ تحقق أن المبلغ المدفوع يطابق سعر القالب (منع التلاعب بالسعر) ───
    if (verifiedPayment && verifiedPayment.status === 'completed' && verifiedPayment.payment_method !== 'bank_transfer') {
      const paidAmount = parseFloat(verifiedPayment.amount);
      if (paidAmount < price * 0.95) { // 5% tolerance for rounding/fees
        console.warn(`⚠️ Price mismatch: paid=${paidAmount}, expected=${price}, template=${template_id}, cycle=${cycle}`);
        return res.status(402).json({
          error: 'المبلغ المدفوع لا يتطابق مع سعر القالب المحدد',
          errorEn: 'The paid amount does not match the selected template price',
        });
      }
    }

    // ─── تطبيق خصم الكود (حساب المبلغ المدفوع فعلياً) ───
    let paymentStatus = 'pending';
    let discountedPrice = price; // المبلغ بعد الخصم (للتتبع فقط)
    if (verifiedPayment && verifiedPayment.status === 'completed') {
      paymentStatus = 'paid_by_gateway';
    } else if (verifiedPayment && verifiedPayment.payment_method === 'bank_transfer') {
      paymentStatus = 'pending_bank_review';
    } else if (codeData) {
      if (codeData.discount_type === 'full') {
        discountedPrice = 0;
        paymentStatus = 'paid_by_code';
      } else if (codeData.discount_type === 'percentage') {
        discountedPrice = price * (1 - codeData.discount_value / 100);
        paymentStatus = discountedPrice <= 0 ? 'paid_by_code' : 'partial_code';
      } else if (codeData.discount_type === 'fixed') {
        discountedPrice = Math.max(0, price - codeData.discount_value);
        paymentStatus = discountedPrice <= 0 ? 'paid_by_code' : 'partial_code';
      }
    }

    // ─── بدء المعاملة (Transaction) لضمان تكامل البيانات ───
    const { getPool } = require('../config/db');
    const pool = getPool();
    const connection = await pool.getConnection();
    
    let admin, subscription, token, admin_slug, finalPaymentMethod, finalPaymentRef;
    
    try {
      await connection.beginTransaction();

      // ─── ⛔ قفل ذري: منع إعادة استخدام الدفعة (SELECT FOR UPDATE يمنع أي طلب متزامن) ───
      if (verifiedPayment && paymentId) {
        const [lockedRows] = await connection.query(
          'SELECT id, meta FROM payments WHERE id = ? FOR UPDATE',
          [paymentId]
        );
        if (lockedRows[0]?.meta) {
          const lockedMeta = typeof lockedRows[0].meta === 'string' ? JSON.parse(lockedRows[0].meta) : lockedRows[0].meta;
          if (lockedMeta.provisioned_site_key) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({
              error: 'تم استخدام هذه الدفعة لإنشاء موقع بالفعل. لا يمكن إنشاء موقع آخر بنفس الدفعة',
              errorEn: 'This payment has already been used to provision a site. Cannot create another site with the same payment',
              already_provisioned: true,
              existing_site_key: lockedMeta.provisioned_site_key,
            });
          }
        }
        // ─── تعليم الدفعة فوراً بعد القفل لمنع أي طلب متزامن ───
        const [payMetaRows] = await connection.query('SELECT meta FROM payments WHERE id = ?', [paymentId]);
        let existingPayMeta = {};
        if (payMetaRows[0]?.meta) {
          existingPayMeta = typeof payMetaRows[0].meta === 'string' ? JSON.parse(payMetaRows[0].meta) : payMetaRows[0].meta;
        }
        await connection.query(
          'UPDATE payments SET meta = ? WHERE id = ?',
          [JSON.stringify({ ...existingPayMeta, provisioned_site_key: site_key, provisioning_started_at: new Date().toISOString() }), paymentId]
        );
      }

      // ─── 1. إنشاء الموقع ───
      await connection.query(
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
            original_price: originalPrice,
            discounted_price: discountedPrice,
            discount_type: codeData?.discount_type || null,
            discount_value: codeData?.discount_value || null,
          })
        ]
      );

      // ─── 2. إنشاء حساب الأدمن (مباشرة عبر connection لتجنب Lock Wait) ───
      const hashedPassword = await bcrypt.hash(owner_password, 12);
      const [userResult] = await connection.query(
        'INSERT INTO users (site_key, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [site_key, owner_name, owner_email, hashedPassword, 'admin']
      );
      const [adminRows] = await connection.query(
        'SELECT id, site_key, name, email, role, created_at FROM users WHERE id = ?',
        [userResult.insertId]
      );
      admin = adminRows[0];

      // ─── 3. إنشاء الاشتراك (يُحفظ السعر الأصلي للقالب) ───
      const planId = cycle === 'lifetime' ? 'premium' : (cycle === 'yearly' ? 'pro' : 'basic');
      const trial_ends = new Date();
      trial_ends.setDate(trial_ends.getDate() + 14);
      const [subResult] = await connection.query(
        `INSERT INTO subscriptions (site_key, plan_id, template_id, billing_cycle, price, status, trial_ends_at, expires_at)
         VALUES (?, ?, ?, ?, ?, 'trial', ?, NULL)`,
        [site_key, planId, template_id, cycle, originalPrice, trial_ends]
      );
      const [subRows] = await connection.query('SELECT * FROM subscriptions WHERE id = ?', [subResult.insertId]);
      subscription = subRows[0];

      // ─── 4. تفعيل الاشتراك إذا تم الدفع ───
      if (paymentStatus === 'paid_by_code' || paymentStatus === 'paid_by_gateway') {
        let subExpiresAt = null;
        const now = new Date();
        if (cycle === 'monthly') {
          subExpiresAt = new Date(now);
          subExpiresAt.setMonth(subExpiresAt.getMonth() + 1);
        } else if (cycle === 'yearly') {
          subExpiresAt = new Date(now);
          subExpiresAt.setFullYear(subExpiresAt.getFullYear() + 1);
        }
        // lifetime = null (لا ينتهي)
        await connection.query(
          "UPDATE subscriptions SET status = 'active', starts_at = NOW(), expires_at = ? WHERE id = ? AND site_key = ?",
          [subExpiresAt, subscription.id, site_key]
        );
      }

      // ─── 4.5 تسجيل استخدام كود الشراء (ذري — يفشل إذا استُخدم الكود بالتزامن) ───
      if (codeData && purchase_code) {
        const [pcRows] = await connection.query('SELECT * FROM purchase_codes WHERE code = ?', [purchase_code]);
        if (pcRows[0]) {
          const pc = pcRows[0];
          const usedBy = pc.used_by ? (typeof pc.used_by === 'string' ? JSON.parse(pc.used_by) : pc.used_by) : [];
          usedBy.push({ email: owner_email, site_key, used_at: new Date().toISOString() });
          const [markResult] = await connection.query(
            'UPDATE purchase_codes SET used_count = used_count + 1, used_by = ? WHERE id = ? AND (max_uses = 0 OR used_count < max_uses)',
            [JSON.stringify(usedBy), pc.id]
          );
          if (markResult.affectedRows === 0) {
            throw new Error('PURCHASE_CODE_RACE');
          }
        }
      }

      // ─── 4.6 تسجيل عملية الدفع ───
      finalPaymentMethod = verifiedPayment?.payment_method || payment_method || (codeData ? 'purchase_code' : 'manual');
      finalPaymentRef = payment_reference || (codeData ? `CODE-${purchase_code}` : `SETUP-${Date.now()}`);
      try {
        if (verifiedPayment) {
          // تحديث meta الدفعة (provisioned_site_key كُتب سابقاً عند القفل — نضيف البيانات المتبقية)
          const [payRows] = await connection.query('SELECT meta FROM payments WHERE id = ? AND site_key = ?', [verifiedPayment.id, verifiedPayment.site_key]);
          let existingMeta = {};
          if (payRows[0]?.meta) {
            existingMeta = typeof payRows[0].meta === 'string' ? JSON.parse(payRows[0].meta) : payRows[0].meta;
          }
          const mergedMeta = { ...existingMeta, provisioned_site_key: site_key, provisioned_store: store_name, provisioned_at: new Date().toISOString() };
          await connection.query('UPDATE payments SET meta = ? WHERE id = ? AND site_key = ?', [JSON.stringify(mergedMeta), verifiedPayment.id, verifiedPayment.site_key]);
        } else {
          const payDesc = codeData
            ? `Site provisioning: ${store_name} (${cycle}) — Code: ${purchase_code}, Discount: ${codeData.discount_type}${codeData.discount_type !== 'full' ? ' ' + codeData.discount_value : ''}, Original: $${originalPrice}, Paid: $${discountedPrice}`
            : `Site provisioning: ${store_name} (${cycle})`;
          await connection.query(
            `INSERT INTO payments (site_key, customer_id, order_id, type, amount, currency, payment_method, payment_gateway_id, status, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [site_key, null, null, 'subscription', originalPrice, 'USD', finalPaymentMethod, null, (paymentStatus === 'paid_by_code') ? 'completed' : 'pending', payDesc]
          );
        }
      } catch (payErr) {
        console.error('Payment record creation failed (non-blocking):', payErr.message);
      }

      // ─── 4.7 تسجيل النشاط ───
      try {
        await connection.query(
          'INSERT INTO activity_log (site_key, user_id, customer_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [site_key, admin.id, null, 'site_created', 'site', site_key, JSON.stringify({
            store_name, domain, template_id,
            billing_cycle: cycle, payment_method: finalPaymentMethod,
            payment_status: paymentStatus, price: originalPrice, discounted_price: discountedPrice,
          }), req.ip || req.connection?.remoteAddress]
        );
      } catch (logErr) {
        console.error('Activity log failed (non-blocking):', logErr.message);
      }

      // ─── 5. إنشاء التخصيصات الافتراضية + مفتاح الأدمن ───
      admin_slug = crypto.randomBytes(6).toString('hex');
      await connection.query(
        `INSERT INTO customizations (site_key, store_name, primary_color, secondary_color, logo_url, dark_mode, button_radius, header_style, show_banner, font_family, admin_slug)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE store_name=VALUES(store_name), primary_color=VALUES(primary_color), secondary_color=VALUES(secondary_color), logo_url=VALUES(logo_url), dark_mode=VALUES(dark_mode), button_radius=VALUES(button_radius), header_style=VALUES(header_style), show_banner=VALUES(show_banner), font_family=VALUES(font_family), admin_slug=VALUES(admin_slug)`,
        [site_key, store_name, primary_color || '#7c5cff', '#a78bfa', logo_url || null, 1, 'rounded-xl', 'default', 1, 'Tajawal', admin_slug]
      );

      // ─── COMMIT ───
      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      
      if (txError.message === 'PURCHASE_CODE_RACE') {
        return res.status(409).json({
          error: 'تم استخدام كود الشراء بالكامل. يرجى استخدام كود آخر',
          errorEn: 'Purchase code has been fully used. Please use another code',
        });
      }
      
      // التحقق من تكرار البريد الإلكتروني
      if (txError.code === 'ER_DUP_ENTRY' && txError.message?.includes('email')) {
        return res.status(409).json({
          error: 'البريد الإلكتروني مستخدم بالفعل. جرّب بريد آخر',
          errorEn: 'This email is already in use. Try a different email',
        });
      }
      
      throw txError; // re-throw للـ catch الخارجي
    } finally {
      connection.release();
    }

    // ─── 6. إنشاء توكن ───
    token = generateToken(admin.id, admin.role, site_key);

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
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">السعر</td><td style="padding:8px;border:1px solid #ddd">$${originalPrice}${discountedPrice < originalPrice ? ` (بعد الخصم: $${discountedPrice})` : ''}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">طريقة الدفع</td><td style="padding:8px;border:1px solid #ddd">${finalPaymentMethod}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">حالة الدفع</td><td style="padding:8px;border:1px solid #ddd">${paymentStatus}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Site Key</td><td style="padding:8px;border:1px solid #ddd">${site_key}</td></tr>
        </table>
      </div>`,
    }).catch(e => console.error('Admin notification email error:', e.message));

    // ─── 8. إعداد Nginx + SSL تلقائياً (دومين مخصص) ───
    let infrastructureResult = null;
    if (domain && !domain.endsWith('.nexiroflux.com')) {
      // التحقق من أن الدومين آمن (حروف وأرقام ونقاط وشرطات فقط)
      const safeDomainRegex = /^[a-z0-9][a-z0-9.-]{1,253}[a-z0-9]$/;
      if (safeDomainRegex.test(domain)) {
        try {
          const { execFileSync } = require('child_process');
          const scriptPath = require('path').resolve(__dirname, '../../scripts/provision-site.py');
          const output = execFileSync('python3', [scriptPath, domain], {
            timeout: 150000,
            encoding: 'utf-8'
          });
          infrastructureResult = JSON.parse(output.trim());
          console.log(`✅ Infrastructure provisioned for ${domain}:`, infrastructureResult);
        } catch (infraErr) {
          console.error(`⚠️ Infrastructure provisioning failed for ${domain} (non-blocking):`, infraErr.message);
          infrastructureResult = { success: false, error: infraErr.message };
        }
      } else {
        console.error(`⚠️ Domain rejected by safety check: ${domain}`);
        infrastructureResult = { success: false, error: 'Domain contains invalid characters' };
      }
    }

    // ─── الاستجابة ───
    res.status(201).json({
      message: 'تم إنشاء الموقع وتفعيله بنجاح!',
      token,
      site_key,
      admin_slug,
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
        price: originalPrice,
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

        if (matchedPayment) {
          const meta = typeof matchedPayment.meta === 'string' ? JSON.parse(matchedPayment.meta) : (matchedPayment.meta || {});
          pendingSetup = {
            payment_id: matchedPayment.id,
            template_id: String(meta.template_id || meta.product_id || ''),
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

    const domain = custom_domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

    // ─── حماية من Command Injection — التحقق من صيغة الدومين ───
    const safeDomainRegex = /^[a-z0-9][a-z0-9.-]{1,253}[a-z0-9]$/;
    if (!safeDomainRegex.test(domain)) {
      return res.status(400).json({ error: 'صيغة الدومين غير صالحة. استخدم أحرف وأرقام ونقاط فقط', errorEn: 'Invalid domain format. Use only letters, numbers, dots and hyphens' });
    }

    // التحقق من أن الدومين غير مستخدم
    const existing = await Site.findByCustomDomain(domain);
    if (existing && existing.site_key !== site.site_key) {
      return res.status(400).json({ error: 'هذا الدومين مستخدم بالفعل من موقع آخر' });
    }

    const updated = await Site.updateCustomDomain(site.site_key, domain);
    
    // Clear tenant cache for this domain
    const { clearDomainCache } = require('../middlewares/resolveTenant');
    clearDomainCache(domain);

    // ─── إعداد Nginx + SSL تلقائياً للدومين الجديد ───
    let infrastructureResult = null;
    if (domain && !domain.endsWith('.nexiroflux.com')) {
      try {
        const { execFileSync } = require('child_process');
        const scriptPath = require('path').resolve(__dirname, '../../scripts/provision-site.py');
        const output = execFileSync('python3', [scriptPath, domain], {
          timeout: 150000,
          encoding: 'utf-8'
        });
        infrastructureResult = JSON.parse(output.trim());
        console.log(`✅ Infrastructure provisioned for custom domain ${domain}:`, infrastructureResult);
      } catch (infraErr) {
        console.error(`⚠️ Infrastructure provisioning failed for custom domain ${domain} (non-blocking):`, infraErr.message);
        infrastructureResult = { success: false, error: infraErr.message };
      }
    }

    res.json({ 
      message: 'تم تحديث الدومين المخصص بنجاح',
      site: updated,
      infrastructure: infrastructureResult,
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
