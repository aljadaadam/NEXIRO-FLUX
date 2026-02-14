const express = require('express');
const cors = require('cors');
const { PORT, SITE_KEY } = require('./config/env');
const { initializeDatabase } = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sourceRoutes = require('./routes/sourceRoutes');

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

// Root route - يظهر معلومات الموقع
app.get('/', async (req, res) => {
  try {
    const Site = require('./models/Site');
    const site = await Site.findBySiteKey(SITE_KEY);
    
    res.json({ 
      message: 'مرحبًا بك في Nexiro-Flux Dashboard',
      version: '3.0.0',
      site: site ? {
        name: site.name,
        domain: site.domain,
        site_key: site.site_key
      } : { error: 'الموقع غير مسجل' },
      note: 'هذه نسخة مستقلة تعمل على قاعدة بيانات مركزية',
      endpoints: {
        auth: {
          registerAdmin: 'POST /api/auth/register-admin',
          login: 'POST /api/auth/login',
          createUser: 'POST /api/auth/users (admin only)',
          profile: 'GET /api/auth/profile',
          siteUsers: 'GET /api/auth/users (admin only)'
        },
        products: {
          getAll: 'GET /api/products',
          create: 'POST /api/products (admin only)',
          update: 'PUT /api/products/:id (admin only)',
          delete: 'DELETE /api/products/:id (admin only)'
        },
        dashboard: {
          stats: 'GET /api/dashboard/stats (admin only)'
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