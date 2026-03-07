const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getPublicCustomization,
  getStoreCustomization,
  verifyAdminSlug
} = require('../controllers/customizationController');
const {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const BannerTemplate = require('../models/BannerTemplate');
const Banner = require('../models/Banner');
const PaymentGateway = require('../models/PaymentGateway');
const Payment = require('../models/Payment');
const USDTProcessor = require('../services/usdt');
const { SITE_KEY } = require('../config/env');
const { getPool } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// Rate limiter for slug verification to prevent brute-force
const slugLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' },
});

// ===== واجهة عامة (للمتجر بدون مصادقة) =====
router.get('/public/:site_key', getPublicCustomization);
router.get('/store', getStoreCustomization);
router.get('/verify-slug/:slug', slugLimiter, verifyAdminSlug);
router.get('/banners/active', getActiveBanners);

// ===== واجهة الأدمن =====
router.use(validateSite);
router.get('/', authenticateToken, requireRole('admin', 'user'), getCustomization);
router.put('/', authenticateToken, requireRole('admin', 'user'), updateCustomization);
router.delete('/', authenticateToken, requireRole('admin'), resetCustomization);

// ===== البانرات (أدمن) =====
router.get('/banners', authenticateToken, requireRole('admin', 'user'), getBanners);
router.post('/banners', authenticateToken, requireRole('admin', 'user'), createBanner);
router.put('/banners/:id', authenticateToken, requireRole('admin', 'user'), updateBanner);
router.delete('/banners/:id', authenticateToken, requireRole('admin', 'user'), deleteBanner);

// ===== متجر البنرات (تصفح + تثبيت) =====
router.get('/banner-store', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const templates = await BannerTemplate.findActive();
    // جلب البنرات المثبتة حالياً للمقارنة
    const { site_key } = req.user;
    const installed = await Banner.findBySiteKey(site_key);
    const installedTemplateIds = installed
      .filter(b => b.template_id)
      .map(b => b.template_id);
    // خريطة template_id → banner_id للحذف من المتجر
    const templateBannerMap = {};
    installed.filter(b => b.template_id).forEach(b => { templateBannerMap[b.template_id] = b.id; });
    // جلب البنرات المشتراة (مكتمل الدفع)
    const pool = getPool();
    const [purchases] = await pool.query(
      'SELECT DISTINCT template_id FROM banner_purchases WHERE site_key = ? AND status = ?',
      [site_key, 'completed']
    );
    const purchasedTemplateIds = purchases.map(p => p.template_id);
    res.json({ templates, installedTemplateIds, templateBannerMap, purchasedTemplateIds });
  } catch (err) {
    console.error('Error fetching banner store:', err);
    res.status(500).json({ error: 'فشل في جلب متجر البنرات' });
  }
});

router.post('/banner-store/install/:templateId', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const { site_key } = req.user;
    const template = await BannerTemplate.findById(req.params.templateId);
    if (!template || !template.is_active) {
      return res.status(404).json({ error: 'القالب غير موجود أو غير متاح' });
    }

    // التحقق من الدفع إذا كان البنر مدفوع
    if (template.price > 0) {
      const pool = getPool();
      const [purchases] = await pool.query(
        'SELECT id FROM banner_purchases WHERE site_key = ? AND template_id = ? AND status = ?',
        [site_key, template.id, 'completed']
      );
      if (purchases.length === 0) {
        return res.status(402).json({ error: 'يجب الدفع أولاً لتثبيت هذا البنر', requires_payment: true, price: template.price });
      }
    }

    const design = typeof template.design_data === 'string' ? JSON.parse(template.design_data) : template.design_data;
    // إنشاء بنر جديد من القالب
    const banner = await Banner.create(site_key, {
      title: design.title || template.name,
      subtitle: design.subtitle || '',
      description: design.description || '',
      icon: design.icon || '🚀',
      image_url: design.image_url || template.preview_image || '',
      link: design.link || '',
      extra_data: JSON.stringify({ badges: design.badges || [], gradient: design.gradient || '', bg_image: design.bg_image || '', imagePosition: design.imagePosition || '' }),
      is_active: true,
      sort_order: 0,
      template_id: template.id,
    });
    res.status(201).json({ message: 'تم تثبيت البنر بنجاح', banner });
  } catch (err) {
    console.error('Error installing banner:', err);
    res.status(500).json({ error: 'فشل في تثبيت البنر' });
  }
});

// ===== بوابات الدفع للمنصة (لشراء البنرات) =====
router.get('/banner-store/gateways', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    // جلب بوابات الدفع المفعلة للمنصة الرئيسية
    const gateways = await PaymentGateway.findEnabled(SITE_KEY);
    // تنظيف البيانات الحساسة وإرسال ما يلزم فقط
    const safe = (gateways || [])
      .filter(g => ['usdt', 'bankak', 'binance'].includes(g.type))
      .map(g => {
        const base = { id: g.id, type: g.type, name: g.name, name_en: g.name_en };
        if (g.type === 'usdt') {
          base.wallet_address = g.config?.wallet_address;
          base.network = g.config?.network;
        } else if (g.type === 'bankak') {
          base.account_number = g.config?.account_number;
          base.full_name = g.config?.full_name;
          base.exchange_rate = g.config?.exchange_rate;
          base.receipt_note = g.config?.receipt_note;
        }
        return base;
      });
    res.json({ gateways: safe });
  } catch (err) {
    console.error('Error fetching platform gateways:', err);
    res.status(500).json({ error: 'فشل في جلب بوابات الدفع' });
  }
});

// ===== بدء عملية شراء بنر =====
router.post('/banner-store/purchase/:templateId', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const { site_key } = req.user;
    const { gateway_id } = req.body;
    const templateId = parseInt(req.params.templateId);

    if (!gateway_id) return res.status(400).json({ error: 'يجب اختيار طريقة الدفع' });

    const template = await BannerTemplate.findById(templateId);
    if (!template || !template.is_active) {
      return res.status(404).json({ error: 'القالب غير موجود' });
    }
    if (template.price <= 0) {
      return res.status(400).json({ error: 'هذا البنر مجاني، لا يحتاج دفع' });
    }

    // التحقق من عدم وجود شراء مكتمل سابق
    const pool = getPool();
    const [existingPurchase] = await pool.query(
      'SELECT id FROM banner_purchases WHERE site_key = ? AND template_id = ? AND status = ?',
      [site_key, templateId, 'completed']
    );
    if (existingPurchase.length > 0) {
      return res.status(400).json({ error: 'تم شراء هذا البنر مسبقاً' });
    }

    // جلب البوابة من المنصة الرئيسية
    const gateway = await PaymentGateway.findById(parseInt(gateway_id), SITE_KEY);
    if (!gateway || !gateway.is_enabled) {
      return res.status(404).json({ error: 'بوابة الدفع غير متاحة' });
    }

    const amount = parseFloat(template.price);
    const initialStatus = gateway.type === 'bankak' ? 'awaiting_receipt' : 'pending';

    // إنشاء سجل دفع في المنصة
    const payment = await Payment.create({
      site_key: SITE_KEY,
      customer_id: null,
      order_id: null,
      type: 'purchase',
      amount,
      currency: 'USD',
      payment_method: gateway.type,
      payment_gateway_id: gateway.id,
      status: initialStatus,
      description: `شراء بنر: ${template.name} | متجر: ${site_key}`,
    });

    await Payment.updateMeta(payment.id, SITE_KEY, {
      purchase_type: 'banner',
      template_id: templateId,
      template_name: template.name,
      buyer_site_key: site_key,
      buyer_user_id: req.user.id,
    });

    // إنشاء سجل الشراء
    await pool.query(
      'INSERT INTO banner_purchases (site_key, user_id, template_id, payment_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [site_key, req.user.id, templateId, payment.id, amount, 'pending']
    );

    const referenceId = `BNR${payment.id}T${Date.now()}`;
    let result;

    switch (gateway.type) {
      case 'usdt': {
        const usdt = new USDTProcessor(gateway.config);
        const paymentInfo = usdt.createPayment({ amount, referenceId });
        await Payment.updateExternalId(payment.id, SITE_KEY, referenceId);
        await Payment.updateMeta(payment.id, SITE_KEY, {
          usdt_unique_amount: paymentInfo.amount,
          usdt_original_amount: paymentInfo.originalAmount,
          usdt_wallet_address: paymentInfo.walletAddress,
          usdt_network: paymentInfo.network,
        });
        result = {
          method: 'manual_crypto',
          walletAddress: paymentInfo.walletAddress,
          network: paymentInfo.network,
          amount: paymentInfo.amount,
          originalAmount: paymentInfo.originalAmount,
          currency: 'USDT',
        };
        break;
      }
      case 'bankak': {
        const bConfig = gateway.config;
        const exchangeRate = parseFloat(bConfig.exchange_rate) || 0;
        const localAmount = exchangeRate > 0 ? Math.round(amount * exchangeRate) : 0;
        await Payment.updateExternalId(payment.id, SITE_KEY, referenceId);
        await Payment.updateMeta(payment.id, SITE_KEY, {
          bankak_exchange_rate: bConfig.exchange_rate,
          bankak_local_currency: 'SDG',
          bankak_local_amount: localAmount,
        });
        result = {
          method: 'manual_bankak',
          bankakDetails: {
            account_number: bConfig.account_number,
            full_name: bConfig.full_name,
            exchange_rate: bConfig.exchange_rate,
            local_currency: 'SDG',
            receipt_note: bConfig.receipt_note || '',
          },
          localAmount,
          referenceId,
        };
        break;
      }
      case 'binance': {
        const BinancePayProcessor = require('../services/binancePay');
        const binance = new BinancePayProcessor(gateway.config);
        const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
        const order = await binance.createOrder({
          amount,
          currency: 'USDT',
          description: `Banner: ${template.name}`,
          referenceId,
          returnUrl: `${backendUrl}/api/checkout/callback/${payment.id}`,
          cancelUrl: `${backendUrl}/api/checkout/cancel/${payment.id}`,
          webhookUrl: `${backendUrl}/api/checkout/webhooks/binance`,
        });
        await Payment.updateExternalId(payment.id, SITE_KEY, order.merchantTradeNo);
        result = {
          method: 'qr_or_redirect',
          checkoutUrl: order.checkoutUrl,
          qrContent: order.qrContent,
        };
        break;
      }
      default:
        return res.status(400).json({ error: 'طريقة دفع غير مدعومة لشراء البنرات' });
    }

    res.json({
      success: true,
      paymentId: payment.id,
      invoiceNumber: payment.invoice_number,
      gatewayType: gateway.type,
      templateId,
      ...result,
    });
  } catch (err) {
    console.error('Error purchasing banner:', err);
    res.status(500).json({ error: 'فشل في بدء عملية الشراء' });
  }
});

// ===== التحقق من حالة شراء بنر =====
router.get('/banner-store/purchase/:paymentId/status', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const payment = await Payment.findById(parseInt(req.params.paymentId));
    if (!payment) return res.status(404).json({ error: 'الدفعة غير موجودة' });
    // التحقق من ملكية الدفعة
    const meta = payment.meta || {};
    if (meta.buyer_site_key !== req.user.site_key || meta.buyer_user_id !== req.user.id) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    // إذا اكتملت الدفعة، تحقق وثبت البنر تلقائياً
    if (payment.status === 'completed') {
      if (meta.purchase_type === 'banner' && meta.template_id && meta.buyer_site_key) {
        const pool = getPool();
        // تحديث سجل الشراء
        await pool.query(
          'UPDATE banner_purchases SET status = ? WHERE payment_id = ? AND status != ?',
          ['completed', payment.id, 'completed']
        );
        // التحقق من عدم التثبيت المسبق
        const [existing] = await pool.query(
          'SELECT id FROM banners WHERE site_key = ? AND template_id = ?',
          [meta.buyer_site_key, meta.template_id]
        );
        if (existing.length === 0) {
          const template = await BannerTemplate.findById(meta.template_id);
          if (template) {
            const design = typeof template.design_data === 'string' ? JSON.parse(template.design_data) : template.design_data;
            await Banner.create(meta.buyer_site_key, {
              title: design.title || template.name,
              subtitle: design.subtitle || '',
              description: design.description || '',
              icon: design.icon || '🚀',
              image_url: design.image_url || template.preview_image || '',
              link: design.link || '',
              extra_data: JSON.stringify({ badges: design.badges || [], gradient: design.gradient || '', bg_image: design.bg_image || '', imagePosition: design.imagePosition || '' }),
              is_active: true,
              sort_order: 0,
              template_id: template.id,
            });
          }
        }
      }
    }

    res.json({ status: payment.status, paymentId: payment.id });
  } catch (err) {
    console.error('Error checking purchase status:', err);
    res.status(500).json({ error: 'فشل في التحقق من حالة الدفع' });
  }
});

// ===== رفع إيصال بنكك لشراء بنر =====
router.post('/banner-store/purchase/:paymentId/receipt', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const payment = await Payment.findById(parseInt(req.params.paymentId));
    if (!payment) return res.status(404).json({ error: 'الدفعة غير موجودة' });
    // التحقق من ملكية الدفعة
    const pmeta = payment.meta || {};
    if (pmeta.buyer_site_key !== req.user.site_key || pmeta.buyer_user_id !== req.user.id) {
      return res.status(403).json({ error: 'غير مصرح' });
    }
    if (payment.status !== 'awaiting_receipt' && payment.status !== 'pending') {
      return res.status(400).json({ error: 'لا يمكن رفع إيصال لهذه الدفعة' });
    }

    const { receipt_reference } = req.body;
    if (!receipt_reference) return res.status(400).json({ error: 'رقم المرجع مطلوب' });

    await Payment.updateMeta(payment.id, SITE_KEY, {
      bankak_receipt_reference: receipt_reference,
      receipt_uploaded_at: new Date().toISOString(),
    });
    await Payment.updateStatus(payment.id, SITE_KEY, 'pending');

    res.json({ success: true, message: 'تم رفع الإيصال، بانتظار تأكيد الإدارة' });
  } catch (err) {
    console.error('Error uploading receipt:', err);
    res.status(500).json({ error: 'فشل في رفع الإيصال' });
  }
});

// ===== التحقق من USDT لشراء بنر =====
router.post('/banner-store/purchase/:paymentId/check-usdt', authenticateToken, requireRole('admin', 'user'), async (req, res) => {
  try {
    const payment = await Payment.findById(parseInt(req.params.paymentId));
    if (!payment || payment.status !== 'pending') {
      return res.status(400).json({ error: 'الدفعة غير صالحة' });
    }
    // التحقق من ملكية الدفعة
    const pmeta2 = payment.meta || {};
    if (pmeta2.buyer_site_key !== req.user.site_key || pmeta2.buyer_user_id !== req.user.id) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    const gateway = await PaymentGateway.findById(payment.payment_gateway_id, SITE_KEY);
    if (!gateway || gateway.type !== 'usdt') {
      return res.status(400).json({ error: 'بوابة غير صالحة' });
    }

    const usdt = new USDTProcessor(gateway.config);
    const meta = payment.meta || {};
    const { tx_hash } = req.body || {};
    const result = await usdt.checkPayment({
      amount: parseFloat(meta.usdt_unique_amount),
      sinceTimestamp: new Date(payment.created_at).getTime(),
      txHash: tx_hash || undefined,
    });

    if (result && result.confirmed) {
      await Payment.updateStatus(payment.id, SITE_KEY, 'completed');
      // تثبيت البنر تلقائياً
      const pool = getPool();
      await pool.query('UPDATE banner_purchases SET status = ? WHERE payment_id = ?', ['completed', payment.id]);

      if (meta.template_id && meta.buyer_site_key) {
        const template = await BannerTemplate.findById(meta.template_id);
        if (template) {
          const design = typeof template.design_data === 'string' ? JSON.parse(template.design_data) : template.design_data;
          await Banner.create(meta.buyer_site_key, {
            title: design.title || template.name,
            subtitle: design.subtitle || '',
            description: design.description || '',
            icon: design.icon || '🚀',
            image_url: design.image_url || template.preview_image || '',
            link: design.link || '',
            extra_data: JSON.stringify({ badges: design.badges || [], gradient: design.gradient || '', bg_image: design.bg_image || '', imagePosition: design.imagePosition || '' }),
            is_active: true,
            sort_order: 0,
            template_id: template.id,
          });
        }
      }

      return res.json({ verified: true, status: 'completed' });
    }

    res.json({ verified: false, status: 'pending' });
  } catch (err) {
    console.error('Error checking USDT:', err);
    res.status(500).json({ error: 'فشل في التحقق' });
  }
});

module.exports = router;
