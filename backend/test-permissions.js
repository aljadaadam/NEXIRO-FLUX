// test-permissions.js - اختبار نظام الصلاحيات

const { initializeDatabase } = require('./src/config/db');
const Permission = require('./src/models/Permission');

async function testPermissions() {
    let pool;
    
    try {
        pool = await initializeDatabase();
        console.log('✅ متصل بقاعدة البيانات\n');

        // 1. جلب جميع الصلاحيات
        console.log('📋 جميع الصلاحيات المتاحة:');
        const allPermissions = await Permission.findAll();
        allPermissions.forEach(p => {
            console.log(`   - ${p.name}: ${p.description}`);
        });

        // 2. جلب صلاحيات الأدمن (ID = 3)
        console.log('\n👤 صلاحيات الأدمن (User ID: 3):');
        const adminPermissions = await Permission.findByUserId(3);
        adminPermissions.forEach(p => {
            console.log(`   ✅ ${p.name}`);
        });

        // 3. التحقق من صلاحية معينة
        console.log('\n🔍 التحقق من صلاحية products:create:');
        const hasPermission = await Permission.userHasPermission(3, 'products:create');
        console.log(`   النتيجة: ${hasPermission ? '✅ موجودة' : '❌ غير موجودة'}`);

        // 4. جلب صلاحيات حسب التصنيف
        console.log('\n📦 صلاحيات تصنيف products:');
        const productPerms = await Permission.findByCategory('products');
        productPerms.forEach(p => {
            console.log(`   - ${p.name}`);
        });

        console.log('\n✅ اختبار النظام ناجح!');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (pool) {
            await pool.end();
            console.log('\n🔗 تم إغلاق الاتصال');
        }
    }
}

testPermissions();
