// setupAdmin.js (النسخة النهائية)

const User = require('./src/models/User'); 
const Permission = require('./src/models/Permission'); 
const { initializeDatabase, getPool } = require('./src/config/db'); 
// const { SITE_KEY } = require('./src/config/env'); // قد تحتاج لاستيراد المتغيرات هنا

// بيانات الأدمن الجديدة
const ADMIN_EMAIL = 'aljadadm654@gmail.com';
const ADMIN_PASSWORD = '12345678';
const SITE_KEY = 'local-dev'; // نستخدم القيمة الثابتة

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