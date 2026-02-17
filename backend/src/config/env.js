require('dotenv').config();

// ─── تحقق من المتغيرات الحرجة ───
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error('\n❌ خطأ أمني: يجب تعيين JWT_SECRET في ملف .env');
  console.error('   مثال: JWT_SECRET=random-64-char-string-here\n');
  // في بيئة الإنتاج نوقف السيرفر
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'nexiro_flux_central',
  DB_PORT: process.env.DB_PORT || 3306,
  JWT_SECRET: process.env.JWT_SECRET || 'CHANGE-THIS-IN-ENV-FILE-' + require('crypto').randomBytes(16).toString('hex'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SITE_KEY: process.env.SITE_KEY || 'default-site-key',
  API_KEY_ENCRYPTION_SECRET: process.env.API_KEY_ENCRYPTION_SECRET || null,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  // ─── SMTP (يجب تعيينها في .env) ───
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || 465,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};