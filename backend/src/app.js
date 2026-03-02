const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT, SITE_KEY } = require('./config/env');
const { initializeDatabase } = require('./config/db');
const { resolveTenant } = require('./middlewares/resolveTenant');
const { checkSubscription } = require('./middlewares/checkSubscription');
const { botProtection } = require('./middlewares/botProtection');
const { mountRoutes } = require('./routes');

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

// إنشاء موقع: 3 محاولات / ساعة لكل IP
const provisionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  validate: false,
  message: { error: 'تم تجاوز الحد المسموح لإنشاء المواقع. حاول بعد ساعة', errorEn: 'Too many site creation attempts. Try again in 1 hour' },
});

// التحقق من أكواد الشراء: 10 محاولات / 15 دقيقة
const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  validate: false,
  message: { error: 'محاولات كثيرة للتحقق من الأكواد', errorEn: 'Too many code validation attempts' },
});

app.use(globalLimiter);

// ─── Bot & Abuse Protection ───
app.use(botProtection);

// ─── CORS (multi-tenant — يقبل نطاقات النظام + نطاقات Tenant المخصصة) ───
app.use(cors({
  origin: (origin, callback) => {
    // السماح للطلبات بدون origin (مثل curl, Postman, webhooks, SSR)
    if (!origin) return callback(null, true);
    // السماح لنطاقات النظام
    const allowed = [
      /\.nexiroflux\.com$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    ];
    if (allowed.some(p => p.test(origin))) return callback(null, true);
    // نطاقات Tenant المخصصة — يتم التحقق منها لاحقاً في resolveTenant
    // نسمح بال origin لكن التوثيق يتم عبر JWT + site_key
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Site-Key'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ─── Body Parsing (مع حد حجم — 10mb للسماح بالشعار ووثيقة الهوية كـ Base64) ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Tenant Resolution (must be before routes) ───
app.use(resolveTenant);

// ─── Subscription Check (blocks suspended sites) ───
app.use(checkSubscription);

// ─── Mount all API routes ───
mountRoutes(app, { authLimiter, resetLimiter, otpLimiter, provisionLimiter, codeLimiter });

// ─── Domain verification endpoint (used by HTTP check) ───
app.get('/api/health/nexiro-verify', (req, res) => {
  res.json({ platform: 'nexiro-flux', verified: true, ts: Date.now() });
});

// Root route - إظهار الحالة فقط (بدون تفاصيل)
app.get('/', async (req, res) => {
  res.json({ 
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

    // ─── تشغيل كرون فحص الاشتراكات (انتهاء + تحذيرات) ───
    const { startSubscriptionCron } = require('./services/subscriptionCron');
    startSubscriptionCron();

    app.listen(PORT, () => {
      console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
      console.log(`📁 قاعدة البيانات المركزية: ${process.env.DB_NAME || 'nexiro_flux_central'}`);
      console.log(`🏢 نظام Multi-Tenant مفعل — Domain-based tenant resolution`);
    });
  } catch (error) {
    console.error('❌ فشل تشغيل السيرفر:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;