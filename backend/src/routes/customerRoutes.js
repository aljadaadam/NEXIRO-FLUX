const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  verifyOtp,
  getMyCustomerProfile,
  updateMyCustomerProfile,
  getAllCustomers,
  getCustomerById,
  toggleBlockCustomer,
  updateCustomerWallet,
  uploadIdentityDocument,
  getCustomerNotifications,
  markCustomerNotificationRead,
  updateCustomerVerification,
} = require('../controllers/customerController');
const { getAllOrders, createOrder } = require('../controllers/orderController');
const { getAllPayments, createPayment } = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// ===== واجهة الزبائن (بدون مصادقة) =====
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/verify-otp', verifyOtp);

// ===== Middleware: تتبع آخر نشاط للزبون + كشف الدولة تلقائياً =====
const Customer = require('../models/Customer');
const http = require('http');

// كاش بسيط لتجنب استدعاء API مع كل طلب
const countryCache = new Map(); // ip → { country, ts }
const CACHE_TTL = 30 * 60 * 1000; // 30 دقيقة

function getClientIP(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  const realIp = req.headers['x-real-ip'];
  if (realIp) return realIp;
  return req.ip || req.connection?.remoteAddress || '';
}

function detectCountryFromIP(ip) {
  return new Promise((resolve) => {
    // Skip private/local IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return resolve(null);
    }
    // Check cache
    const cached = countryCache.get(ip);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return resolve(cached.country);
    }
    const req = http.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success' && json.country) {
            countryCache.set(ip, { country: json.country, ts: Date.now() });
            resolve(json.country);
          } else resolve(null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// ===== Middleware: فحص حظر الزبون في كل طلب =====
const blockedCache = new Map(); // userId → { blocked, ts }
const BLOCKED_CACHE_TTL = 60 * 1000; // 60 ثانية

async function checkBlocked(req, res, next) {
  if (req.user && req.user.role === 'customer' && req.user.id) {
    const userId = req.user.id;
    const siteKey = req.user.site_key;
    // فحص الكاش أولاً
    const cached = blockedCache.get(userId);
    if (cached && Date.now() - cached.ts < BLOCKED_CACHE_TTL) {
      if (cached.blocked) {
        return res.status(403).json({ error: 'الحساب محظور', blocked: true });
      }
      return next();
    }
    // فحص من قاعدة البيانات
    try {
      const cust = await Customer.findById(userId, siteKey);
      const isBlocked = !!(cust && cust.is_blocked);
      blockedCache.set(userId, { blocked: isBlocked, ts: Date.now() });
      if (isBlocked) {
        return res.status(403).json({ error: 'الحساب محظور', blocked: true });
      }
    } catch (e) {
      // في حالة خطأ DB — نسمح بالمرور لتجنب حظر كل المستخدمين
    }
  }
  next();
}

function trackActivity(req, res, next) {
  if (req.user && req.user.role === 'customer' && req.user.id) {
    const userId = req.user.id;
    const siteKey = req.user.site_key;
    // تخطي التتبع للمحظورين
    const cachedBlock = blockedCache.get(userId);
    if (cachedBlock && cachedBlock.blocked) return next();
    // Update last active
    Customer.updateLastActive(userId).catch(() => {});
    // Auto-detect country if not already checked (cache check per session)
    const cacheKey = `checked:${userId}`;
    if (!countryCache.has(cacheKey)) {
      countryCache.set(cacheKey, { country: null, ts: Date.now() });
      Customer.findById(userId, siteKey).then(cust => {
        if (cust && !cust.country) {
          const ip = getClientIP(req);
          detectCountryFromIP(ip).then(country => {
            if (country) {
              Customer.updateProfile(userId, siteKey, { country }).catch(() => {});
            }
          });
        }
      }).catch(() => {});
    }
  }
  next();
}

// ===== ملف الزبون (يتطلب توكن زبون + فحص حظر) =====
router.get('/me', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, getMyCustomerProfile);
router.put('/me', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, updateMyCustomerProfile);
router.post('/me/identity', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, uploadIdentityDocument);

// ===== إشعارات الزبون =====
router.get('/notifications', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, getCustomerNotifications);
router.patch('/notifications/:id/read', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, markCustomerNotificationRead);

// ===== طلبات الزبون (/api/customers/orders) — مسارات فريدة للزبائن =====
router.get('/orders', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, getAllOrders);
router.post('/orders', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, createOrder);

// ===== مدفوعات الزبون (/api/customers/payments) — مسارات فريدة للزبائن =====
router.get('/payments', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, getAllPayments);
router.post('/payments', authenticateToken, requireRole('customer'), checkBlocked, trackActivity, createPayment);

// ===== واجهة الأدمن لإدارة الزبائن =====
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllCustomers);
router.get('/:id', authenticateToken, requireRole('admin', 'user'), getCustomerById);
router.patch('/:id/block', authenticateToken, requireRole('admin'), toggleBlockCustomer);
router.patch('/:id/wallet', authenticateToken, requireRole('admin'), updateCustomerWallet);
router.patch('/:id/verification', authenticateToken, requireRole('admin'), updateCustomerVerification);

module.exports = router;
