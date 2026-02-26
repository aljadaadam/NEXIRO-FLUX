const PaymentGateway = require('../models/PaymentGateway');
const { SITE_KEY } = require('../config/env');

// ─── جلب جميع بوابات الدفع ───
async function getAllGateways(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key || SITE_KEY;
    const gateways = await PaymentGateway.findBySiteKey(siteKey);
    res.json({ gateways });
  } catch (error) {
    console.error('Error fetching gateways:', error);
    res.status(500).json({ error: 'فشل في جلب بوابات الدفع' });
  }
}

// ─── جلب البوابات المفعّلة (عام - حسب الدولة) ───
async function getEnabledGateways(req, res) {
  try {
    const { country } = req.query;
    const siteKey = req.siteKey || req.user?.site_key || SITE_KEY;
    const gateways = await PaymentGateway.findEnabled(siteKey, country || null);

    // إخفاء البيانات الحساسة للعرض العام
    const safe = gateways.map(gw => ({
      id: gw.id,
      type: gw.type,
      name: gw.name,
      name_en: gw.name_en,
      is_default: gw.is_default,
      // عرض فقط الحقول الآمنة من config
      config: gw.config ? {
        // image_url مشتركة لجميع البوابات
        ...(gw.config.image_url ? { image_url: gw.config.image_url } : {}),
        // PayPal - عرض الإيميل فقط
        ...(gw.type === 'paypal' && gw.config.email ? { email: gw.config.email } : {}),
        // Bank - عرض اسم البنك و IBAN فقط
        ...(gw.type === 'bank_transfer' ? {
          bank_name: gw.config.bank_name,
          account_holder: gw.config.account_holder,
          iban: gw.config.iban,
          currency: gw.config.currency,
        } : {}),
        // USDT - عرض الشبكة والعنوان
        ...(gw.type === 'usdt' ? {
          network: gw.config.network,
          wallet_address: gw.config.wallet_address,
        } : {}),
        // Binance - عرض Binance ID فقط
        ...(gw.type === 'binance' ? {
          binance_id: gw.config.binance_id,
          binance_email: gw.config.binance_email,
        } : {}),
        // Wallet - عرض تعليمات وأرقام تواصل وصورة
        ...(gw.type === 'wallet' ? {
          instructions: gw.config.instructions,
          contact_numbers: gw.config.contact_numbers,
        } : {}),
        // Bankak - عرض رقم الحساب والاسم وسعر الصرف
        ...(gw.type === 'bankak' ? {
          account_number: gw.config.account_number,
          full_name: gw.config.full_name,
          exchange_rate: gw.config.exchange_rate,
          local_currency: gw.config.local_currency,
        } : {}),
      } : null,
    }));

    res.json({ gateways: safe });
  } catch (error) {
    console.error('Error fetching enabled gateways:', error);
    res.status(500).json({ error: 'فشل في جلب بوابات الدفع' });
  }
}

// ─── إنشاء بوابة دفع ───
async function createGateway(req, res) {
  try {
    const { type, name, name_en, is_enabled, is_default, config, countries, display_order } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'النوع والاسم مطلوبان' });
    }

    const validTypes = ['paypal', 'bank_transfer', 'usdt', 'binance', 'wallet', 'bankak'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `نوع غير صالح. الأنواع المتاحة: ${validTypes.join(', ')}` });
    }

    const siteKey = req.siteKey || req.user?.site_key;
    const gateway = await PaymentGateway.create({
      site_key: siteKey,
      type,
      name,
      name_en,
      is_enabled,
      is_default,
      config,
      countries,
      display_order,
    });

    res.status(201).json({ gateway, message: 'تم إنشاء بوابة الدفع بنجاح' });
  } catch (error) {
    console.error('Error creating gateway:', error);
    res.status(500).json({ error: 'فشل في إنشاء بوابة الدفع' });
  }
}

// ─── تحديث بوابة دفع ───
async function updateGateway(req, res) {
  try {
    const { id } = req.params;
    const siteKey = req.siteKey || req.user?.site_key;

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['name', 'type', 'is_enabled', 'is_default', 'config', 'countries', 'display_order', 'instructions'];
    const safeBody = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }

    const gateway = await PaymentGateway.update(parseInt(id), siteKey, safeBody);

    if (!gateway) {
      return res.status(404).json({ error: 'بوابة الدفع غير موجودة' });
    }

    res.json({ gateway, message: 'تم تحديث بوابة الدفع بنجاح' });
  } catch (error) {
    console.error('Error updating gateway:', error);
    res.status(500).json({ error: 'فشل في تحديث بوابة الدفع' });
  }
}

// ─── حذف بوابة دفع ───
async function deleteGateway(req, res) {
  try {
    const { id } = req.params;
    const siteKey = req.siteKey || req.user?.site_key;
    const deleted = await PaymentGateway.delete(parseInt(id), siteKey);

    if (!deleted) {
      return res.status(404).json({ error: 'بوابة الدفع غير موجودة' });
    }

    res.json({ message: 'تم حذف بوابة الدفع بنجاح' });
  } catch (error) {
    console.error('Error deleting gateway:', error);
    res.status(500).json({ error: 'فشل في حذف بوابة الدفع' });
  }
}

// الحقول المطلوبة لكل نوع بوابة
const REQUIRED_CONFIG = {
  paypal: ['client_id', 'secret', 'email', 'mode'],
  binance: ['api_key', 'api_secret', 'binance_id'],
  usdt: ['wallet_address', 'network'],
  bank_transfer: ['bank_name', 'account_holder', 'iban', 'currency'],
  wallet: ['instructions'],
};

function getMissingFields(type, config) {
  const required = REQUIRED_CONFIG[type] || [];
  return required.filter(f => !config || !config[f] || !String(config[f]).trim());
}

// ─── تبديل حالة بوابة (تفعيل/تعطيل) ───
async function toggleGateway(req, res) {
  try {
    const { id } = req.params;
    const siteKey = req.siteKey || req.user?.site_key;

    // جلب البوابة الحالية أولاً للتحقق
    const current = await PaymentGateway.findById(parseInt(id), siteKey);
    if (!current) {
      return res.status(404).json({ error: 'بوابة الدفع غير موجودة' });
    }

    // إذا كنا نحاول التفعيل (حالياً معطلة → سيتم تفعيلها)
    if (!current.is_enabled) {
      const missing = getMissingFields(current.type, current.config);
      if (missing.length > 0) {
        return res.status(400).json({
          error: 'لا يمكن تفعيل البوابة. يرجى إكمال الحقول المطلوبة أولاً',
          errorEn: 'Cannot enable gateway. Please fill in all required fields first',
          missing_fields: missing,
        });
      }
    }

    const gateway = await PaymentGateway.toggle(parseInt(id), siteKey);

    res.json({ gateway, message: gateway.is_enabled ? 'تم تفعيل البوابة' : 'تم تعطيل البوابة' });
  } catch (error) {
    console.error('Error toggling gateway:', error);
    res.status(500).json({ error: 'فشل في تغيير حالة البوابة' });
  }
}

module.exports = {
  getAllGateways,
  getEnabledGateways,
  createGateway,
  updateGateway,
  deleteGateway,
  toggleGateway,
};
