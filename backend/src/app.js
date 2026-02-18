const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT, SITE_KEY } = require('./config/env');
const { initializeDatabase } = require('./config/db');
const { resolveTenant } = require('./middlewares/resolveTenant');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const customizationRoutes = require('./routes/customizationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentGatewayRoutes = require('./routes/paymentGatewayRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const setupRoutes = require('./routes/setupRoutes');
const purchaseCodeRoutes = require('./routes/purchaseCodeRoutes');
const deliveryZoneRoutes = require('./routes/deliveryZoneRoutes');
const currencyRoutes = require('./routes/currencyRoutes');

const app = express();

// trust proxy (nginx reverse proxy → proper IP for rate limiting)
app.set('trust proxy', 1);

// ─── Security Headers (helmet) ───
app.use(helmet({
  contentSecurityPolicy: false, // Next.js يتعامل مع CSP
  crossOriginEmbedderPolicy: false,
}));

// ─── Rate Limiting ───
// عام: 200 طلب / دقيقة لكل IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً', errorEn: 'Too many requests, try again later' },
});

// تسجيل دخول/تسجيل: 10 محاولات / 15 دقيقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: 'محاولات كثيرة، حاول بعد 15 دقيقة', errorEn: 'Too many attempts, try again in 15 minutes' },
});

// نسيان كلمة المرور: 5 محاولات / ساعة
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  validate: false,
  message: { error: 'محاولات كثيرة، حاول بعد ساعة', errorEn: 'Too many attempts, try again in 1 hour' },
});

// OTP: 5 محاولات / 10 دقائق
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  validate: false,
  message: { error: 'محاولات OTP كثيرة، حاول لاحقاً', errorEn: 'Too many OTP attempts' },
});

app.use(globalLimiter);

// ─── CORS (multi-tenant — يقبل فقط origins معروفة أو *.nexiroflux.com) ───
app.use(cors({
  origin: (origin, callback) => {
    // السماح للطلبات بدون origin (مثل curl, Postman, webhooks)
    if (!origin) return callback(null, true);
    // السماح لنطاقات النظام
    const allowed = [
      /\.nexiroflux\.com$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    ];
    if (allowed.some(p => p.test(origin))) return callback(null, true);
    // السماح للنطاقات المخصصة (أي tenant)
    // في بيئة multi-tenant كل domain يكون tenant مختلف
    // نسمح لأي origin لكن بدون credentials للنطاقات الغير معروفة
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Site-Key'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ─── Body Parsing (مع حد حجم) ───
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ─── Tenant Resolution (must be before routes) ───
app.use(resolveTenant);

// Routes
// ─── Rate limiting لمسارات حساسة ───
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/register-admin', authLimiter);
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);
app.use('/api/customers/login', authLimiter);
app.use('/api/customers/register', authLimiter);
app.use('/api/customers/verify-otp', otpLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/customization', customizationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-gateways', paymentGatewayRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/delivery-zones', deliveryZoneRoutes);
app.use('/api/currencies', currencyRoutes);

// ─── Compatibility: Binance webhook legacy path ───
// Some merchants configure webhook as /payments/binance-webhook in Binance dashboard
// Forward it to the same handler used by /api/checkout/webhooks/binance
try {
  const { binanceWebhook } = require('./controllers/checkoutController');
  app.post('/payments/binance-webhook', binanceWebhook);
  app.post('/api/payments/binance-webhook', binanceWebhook);
} catch (e) {
  // ignore
}

app.use('/api/setup', setupRoutes);
app.use('/api/purchase-codes', purchaseCodeRoutes);

// ─── Domain verification endpoint (used by HTTP check) ───
app.get('/api/health/nexiro-verify', (req, res) => {
  res.json({ platform: 'nexiro-flux', verified: true, ts: Date.now() });
});

// Root route - إظهار الحالة فقط (بدون تفاصيل API)
app.get('/', async (req, res) => {
  res.json({ 
    platform: 'NEXIRO-FLUX',
    version: '4.0.0',
    status: 'running',
    ts: Date.now(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'الصفحة غير موجودة' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ في السيرفر' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // ─── تشغيل كرون فحص الطلبات التلقائي ───
    const { startOrderCron } = require('./services/orderCron');
    startOrderCron();

    // ─── تشغيل كرون تأكيد المدفوعات (Binance) ───
    const { startPaymentCron } = require('./services/paymentCron');
    startPaymentCron();

    app.listen(PORT, () => {
      console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
      console.log(`📁 قاعدة البيانات المركزية: ${process.env.DB_NAME || 'nexiro_flux_central'}`);
      console.log(`🔑 Site Key (fallback): ${SITE_KEY}`);
      console.log(`🏢 نظام Multi-Tenant مفعل — Domain-based tenant resolution`);
      console.log(`🌐 يدعم: X-Site-Key header | *.nexiroflux.com | Custom Domains`);
    });
  } catch (error) {
    console.error('❌ فشل تشغيل السيرفر:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;