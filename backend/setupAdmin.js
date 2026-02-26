// setupAdmin.js (النسخة النهائية)

const User = require('./src/models/User'); 
const Permission = require('./src/models/Permission'); 
const { initializeDatabase, getPool } = require('./src/config/db'); 
// const { SITE_KEY } = require('./src/config/env'); // قد تحتاج لاستيراد المتغيرات هنا

// بيانات الأدمن الجديدة (تؤخذ من متغيرات البيئة أو arguments)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[2];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.argv[3];
const SITE_KEY = process.env.SITE_KEY || process.argv[4] || 'local-dev';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('يجب تحديد بيانات الأدمن:');
  console.error('  node setupAdmin.js <email> <password> [site_key]');
  console.error('  أو عبر متغيرات البيئة: ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

async function setupAdmin() {
    let pool; // تعريف البول هنا لغرض الإغلاق

    try {
        // 1. تهيئة الاتصال (الاسم الصحيح: initializeDatabase)
        pool = await initializeDatabase(); 
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح.');

        // 2. حذف الأدمن القديم 
        // (تأكد من إضافة دالة deleteAdminBySiteKey في User.js)
        const deletedRows = await User.deleteAdminBySiteKey(SITE_KEY);
        console.log(`🗑️ تم حذف ${deletedRows} سجل أدمن قديم للموقع: ${SITE_KEY}.`);

        // 3. إنشاء الأدمن الجديد
        const newAdmin = await User.create({
            site_key: SITE_KEY,
            name: 'Aljad Admin',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin'
        });

        console.log('✅ تم إنشاء حساب الأدمن بنجاح');

        // 4. منح جميع صلاحيات المنتجات للأدمن
        const productPermissions = [
            'products:read',
            'products:create',
            'products:update',
            'products:delete',
            'products:sync'
        ];

        console.log('🔑 جاري منح الصلاحيات للأدمن...');
        const results = await Permission.grantMultipleToUser(
            newAdmin.id, 
            productPermissions, 
            SITE_KEY
        );

        // عرض نتائج منح الصلاحيات
        results.forEach(result => {
            if (result.success) {
                console.log(`   ✅ ${result.permission}`);
            } else {
                console.log(`   ⚠️ ${result.permission}: ${result.error}`);
            }
        });

        console.log('\n--- ✅ نجاح عملية الإعداد ---');
        console.log(`👤 حساب الأدمن للموقع ${SITE_KEY}:`);
        console.log(`   - البريد: ${newAdmin.email}`);
        console.log(`   - الاسم: ${newAdmin.name}`);
        console.log(`   - الصلاحيات: ${productPermissions.length} صلاحية`);

    } catch (error) {
        console.error('❌ فشل سكريبت الإعداد:', error.message);
    } finally {
        // 🚨 الإغلاق الآمن للاتصال
        if (pool) {
            await pool.end(); // استخدام pool.end() لإغلاق مجمع الاتصالات
            console.log('🔗 تم إغلاق اتصال قاعدة البيانات.');
        }
    }
}

setupAdmin();