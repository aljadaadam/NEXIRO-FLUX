const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');
const Customization = require('../models/Customization');
const { generateToken } = require('../utils/token');
const emailService = require('../services/email');

// ─── OTP store (in-memory, short-lived) ───
const otpStore = new Map(); // key: `${siteKey}:${email}` → { code, expires, customerId }

// تسجيل زبون جديد
async function registerCustomer(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    const siteKey = req.siteKey;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
    }

    const existing = await Customer.findByEmailAndSite(email, siteKey);
    if (existing) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم' });
    }

    const customer = await Customer.create({ site_key: siteKey, name, email, phone, password });

    await ActivityLog.log({
      site_key: siteKey, customer_id: customer.id,
      action: 'customer_register', entity_type: 'customer', entity_id: customer.id,
      ip_address: req.ip
    });

    const token = generateToken(customer.id, 'customer', siteKey);

    // بريد ترحيبي
    emailService.sendWelcomeCustomer({ to: customer.email, name: customer.name, storeName: 'متجرنا', siteKey }).catch(e => console.error('Email error:', e.message));

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, wallet_balance: customer.wallet_balance }
    });
  } catch (error) {
    console.error('Error in registerCustomer:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
  }
}

// تسجيل دخول زبون
async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;
    const siteKey = req.siteKey;

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });
    }

    const customer = await Customer.findByEmailAndSite(email, siteKey);
    if (!customer) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    if (customer.is_blocked) {
      return res.status(403).json({ error: 'الحساب محظور' });
    }

    const valid = await Customer.comparePassword(password, customer.password);
    if (!valid) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    // ─── التحقق من OTP ───
    const customization = await Customization.findBySiteKey(siteKey);
    if (customization?.otp_enabled) {
      // إنشاء كود OTP وإرساله بالبريد
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const key = `${siteKey}:${email.toLowerCase().trim()}`;
      otpStore.set(key, { code, expires: Date.now() + 10 * 60 * 1000, customerId: customer.id });

      // إرسال الكود بالبريد
      emailService.sendEmailVerification({
        to: customer.email,
        name: customer.name,
        code,
        siteKey,
      }).catch(e => console.error('OTP email error:', e.message));

      return res.json({
        otpRequired: true,
        message: 'تم إرسال كود التحقق إلى بريدك الإلكتروني',
      });
    }

    // ─── بدون OTP: إصدار التوكن مباشرة ───
    await Customer.updateLastLogin(customer.id);
    const token = generateToken(customer.id, 'customer', siteKey);

    await ActivityLog.log({
      site_key: siteKey, customer_id: customer.id,
      action: 'customer_login', entity_type: 'customer', entity_id: customer.id,
      ip_address: req.ip
    });

    res.json({
      message: 'تم تسجيل الدخول',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, wallet_balance: customer.wallet_balance }
    });
  } catch (error) {
    console.error('Error in loginCustomer:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
}

// جلب جميع الزبائن (أدمن)
async function getAllCustomers(req, res) {
  try {
    const { site_key } = req.user;
    const { page, limit, search } = req.query;

    const customers = await Customer.findBySiteKey(site_key, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      search
    });
    const total = await Customer.countBySite(site_key);

    res.json({ customers, total });
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الزبائن' });
  }
}

// حظر / إلغاء حظر زبون
async function toggleBlockCustomer(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { blocked } = req.body;

    const success = await Customer.toggleBlock(id, site_key, blocked);
    if (!success) {
      return res.status(404).json({ error: 'الزبون غير موجود' });
    }

    // إشعار بريدي بالحظر/إلغاء الحظر
    try {
      const cust = await Customer.findById(id);
      if (cust?.email) {
        if (blocked) {
          emailService.sendAccountBlocked({ to: cust.email, name: cust.name, siteKey: site_key }).catch(() => {});
        } else {
          emailService.sendAccountUnblocked({ to: cust.email, name: cust.name, siteKey: site_key }).catch(() => {});
        }
      }
    } catch (e) { /* ignore */ }

    res.json({ message: blocked ? 'تم حظر الزبون' : 'تم إلغاء حظر الزبون' });
  } catch (error) {
    console.error('Error in toggleBlockCustomer:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// شحن محفظة زبون
async function updateCustomerWallet(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'المبلغ مطلوب' });
    }

    const success = await Customer.updateWallet(id, site_key, parseFloat(amount));
    if (!success) {
      return res.status(404).json({ error: 'الزبون غير موجود' });
    }

    const customer = await Customer.findById(id);

    // بريد تحديث المحفظة
    if (customer?.email) {
      const oldBalance = parseFloat(customer.wallet_balance) - parseFloat(amount);
      emailService.sendWalletUpdated({
        to: customer.email, name: customer.name,
        oldBalance, newBalance: parseFloat(customer.wallet_balance), currency: '$',
        siteKey: site_key
      }).catch(e => console.error('Email error:', e.message));
    }

    res.json({ message: 'تم تحديث المحفظة', wallet_balance: customer.wallet_balance });
  } catch (error) {
    console.error('Error in updateCustomerWallet:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// ===== ملف الزبون (للزبون نفسه) =====
async function getMyCustomerProfile(req, res) {
  try {
    if (req.user?.role !== 'customer') {
      return res.status(403).json({ error: 'هذا المسار مخصص للزبائن فقط' });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer || customer.site_key !== req.user.site_key) {
      return res.status(404).json({ error: 'الزبون غير موجود' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Error in getMyCustomerProfile:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الملف الشخصي' });
  }
}

async function updateMyCustomerProfile(req, res) {
  try {
    if (req.user?.role !== 'customer') {
      return res.status(403).json({ error: 'هذا المسار مخصص للزبائن فقط' });
    }

    const { name, email, phone, country, password } = req.body || {};

    if (email !== undefined && String(email).trim() === '') {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });
    }
    if (name !== undefined && String(name).trim() === '') {
      return res.status(400).json({ error: 'الاسم غير صالح' });
    }

    const ok = await Customer.updateProfile(req.user.id, req.user.site_key, {
      name: name !== undefined ? String(name).trim() : undefined,
      email: email !== undefined ? String(email).trim() : undefined,
      phone: phone !== undefined ? String(phone).trim() : undefined,
      country: country !== undefined ? String(country).trim() : undefined,
      password: password !== undefined ? String(password) : undefined,
    });

    if (!ok) {
      return res.status(400).json({ error: 'لا توجد تغييرات للحفظ' });
    }

    const customer = await Customer.findById(req.user.id);
    res.json({ message: 'تم تحديث الملف الشخصي', customer });
  } catch (error) {
    console.error('Error in updateMyCustomerProfile:', error);
    // غالباً تعارض unique email
    const msg = String(error?.message || '');
    if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الملف الشخصي' });
  }
}

// التحقق من كود OTP
async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body;
    const siteKey = req.siteKey;

    if (!email || !code) {
      return res.status(400).json({ error: 'البريد وكود التحقق مطلوبان' });
    }

    const key = `${siteKey}:${email.toLowerCase().trim()}`;
    const stored = otpStore.get(key);

    if (!stored) {
      return res.status(400).json({ error: 'لم يتم طلب كود تحقق. أعد تسجيل الدخول.' });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'انتهت صلاحية كود التحقق. أعد تسجيل الدخول.' });
    }

    if (stored.code !== String(code).trim()) {
      return res.status(400).json({ error: 'كود التحقق غير صحيح' });
    }

    // الكود صحيح — حذفه وإصدار التوكن
    otpStore.delete(key);
    const customer = await Customer.findById(stored.customerId);
    if (!customer) {
      return res.status(404).json({ error: 'الزبون غير موجود' });
    }

    await Customer.updateLastLogin(customer.id);
    const token = generateToken(customer.id, 'customer', siteKey);

    await ActivityLog.log({
      site_key: siteKey, customer_id: customer.id,
      action: 'customer_login', entity_type: 'customer', entity_id: customer.id,
      ip_address: req.ip
    });

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, wallet_balance: customer.wallet_balance }
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق' });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  verifyOtp,
  getAllCustomers,
  toggleBlockCustomer,
  updateCustomerWallet,
  getMyCustomerProfile,
  updateMyCustomerProfile
};
