const express = require('express');
const cors = require('cors');
const { PORT, SITE_KEY } = require('./config/env');
const { initializeDatabase } = require('./config/db');

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
const setupRoutes = require('./routes/setupRoutes');

const app = express();

// Middleware - CORS مع السماح لجميع Origins (Development Mode)
app.use(cors({
  origin: true, // السماح لجميع Origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
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
app.use('/api/setup', setupRoutes);

// Root route - يظهر معلومات الموقع
app.get('/', async (req, res) => {
  try {
    const Site = require('./models/Site');
    const site = await Site.findBySiteKey(SITE_KEY);
    
    res.json({ 
      message: 'مرحبًا بك في Nexiro-Flux Dashboard',
      version: '4.0.0',
      architecture: 'Multi-Tenant SaaS (Shared DB with site_key)',
      site: site ? {
        name: site.name,
        domain: site.domain,
        site_key: site.site_key
      } : { error: 'الموقع غير مسجل' },
      endpoints: {
        auth: {
          registerAdmin: 'POST /api/auth/register-admin',
          login: 'POST /api/auth/login',
          createUser: 'POST /api/auth/users',
          profile: 'GET /api/auth/profile',
          siteUsers: 'GET /api/auth/users',
          permissions: 'GET /api/auth/permissions'
        },
        products: {
          getAll: 'GET /api/products',
          create: 'POST /api/products',
          update: 'PUT /api/products/:id',
          delete: 'DELETE /api/products/:id',
          import: 'POST /api/products/import',
          sync: 'POST /api/products/import/sync',
          stats: 'GET /api/products/stats'
        },
        sources: {
          getAll: 'GET /api/sources',
          create: 'POST /api/sources',
          update: 'PUT /api/sources/:id',
          delete: 'DELETE /api/sources/:id',
          test: 'POST /api/sources/:id/test',
          sync: 'POST /api/sources/:id/sync',
          applyProfit: 'POST /api/sources/:id/apply-profit'
        },
        customers: {
          register: 'POST /api/customers/register',
          login: 'POST /api/customers/login',
          getAll: 'GET /api/customers',
          block: 'PATCH /api/customers/:id/block',
          wallet: 'PATCH /api/customers/:id/wallet'
        },
        orders: {
          getAll: 'GET /api/orders',
          create: 'POST /api/orders',
          updateStatus: 'PATCH /api/orders/:id/status',
          stats: 'GET /api/orders/stats'
        },
        tickets: {
          getAll: 'GET /api/tickets',
          create: 'POST /api/tickets',
          messages: 'GET /api/tickets/:id/messages',
          reply: 'POST /api/tickets/:id/reply',
          updateStatus: 'PATCH /api/tickets/:id/status'
        },
        customization: {
          get: 'GET /api/customization',
          update: 'PUT /api/customization',
          reset: 'DELETE /api/customization',
          public: 'GET /api/customization/public/:site_key'
        },
        notifications: {
          getAll: 'GET /api/notifications',
          markRead: 'PUT /api/notifications/:id/read',
          markAllRead: 'PUT /api/notifications/read-all'
        },
        payments: {
          getAll: 'GET /api/payments',
          create: 'POST /api/payments',
          getById: 'GET /api/payments/:id',
          updateStatus: 'PATCH /api/payments/:id/status',
          stats: 'GET /api/payments/stats'
        },
        dashboard: {
          stats: 'GET /api/dashboard/stats'
        }
      }
    });
  } catch (error) {
    res.json({
      message: 'مرحبًا بك في Nexiro-Flux Dashboard',
      error: 'حدث خطأ في تحميل بيانات الموقع',
      site_key: SITE_KEY
    });
  }
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
    
    app.listen(PORT, () => {
      console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
      console.log(`📁 قاعدة البيانات المركزية: ${process.env.DB_NAME || 'nexiro_flux_central'}`);
      console.log(`🔑 Site Key: ${SITE_KEY}`);
      console.log(`🏢 نظام Multi-Site مفعل (كل Dashboard مستقل)`);
    });
  } catch (error) {
    console.error('❌ فشل تشغيل السيرفر:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;