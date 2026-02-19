// ─── بيانات وهمية لوضع العرض (Demo Mode) ───
// يُستخدم عند تشغيل المتجر بوضع ?demo=1
// يعرض بيانات واقعية للزوار دون الحاجة لحساب حقيقي

// ─── إحصائيات لوحة التحكم ───
export const demoStats = {
  totalOrders: 1247,
  completedOrders: 1089,
  totalCustomers: 384,
  totalProfit: 18750.50,
  todayProfit: 425.00,
  ordersToday: 23,
  chartData: [
    { month: 'يناير', value: 1200 },
    { month: 'فبراير', value: 1850 },
    { month: 'مارس', value: 2400 },
    { month: 'أبريل', value: 1950 },
    { month: 'مايو', value: 2800 },
    { month: 'يونيو', value: 3200 },
    { month: 'يوليو', value: 2650 },
    { month: 'أغسطس', value: 3500 },
    { month: 'سبتمبر', value: 2900 },
    { month: 'أكتوبر', value: 3800 },
    { month: 'نوفمبر', value: 4100 },
    { month: 'ديسمبر', value: 3650 },
  ],
};

// ─── المنتجات / الخدمات ───
export const demoProducts = [
  {
    id: 1, name: 'Samsung Galaxy S24 FRP Remove', arabic_name: 'إزالة FRP سامسونج S24',
    price: 15.00, description: 'إزالة حماية FRP لأجهزة سامسونج S24 بجميع الموديلات',
    service_type: 'IMEI', group_name: 'خدمات سامسونج', status: 'active', is_featured: 1,
    name_priority: 'ar', source_id: 1, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-24 ساعة',
  },
  {
    id: 2, name: 'iPhone iCloud Unlock Clean', arabic_name: 'فتح iCloud آيفون (نظيف)',
    price: 45.00, description: 'فتح قفل iCloud للأجهزة النظيفة - جميع الموديلات',
    service_type: 'IMEI', group_name: 'خدمات آبل', status: 'active', is_featured: 1,
    name_priority: 'ar', source_id: 1, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-3 أيام',
  },
  {
    id: 3, name: 'Samsung MDM Remove', arabic_name: 'إزالة MDM سامسونج',
    price: 25.00, description: 'إزالة إدارة الأجهزة MDM لجميع أجهزة سامسونج',
    service_type: 'IMEI', group_name: 'خدمات سامسونج', status: 'active', is_featured: 0,
    name_priority: 'ar', source_id: 1, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-6 ساعات',
  },
  {
    id: 4, name: 'Xiaomi Mi Account Unlock', arabic_name: 'فتح حساب Mi شاومي',
    price: 20.00, description: 'فتح حساب Mi المقفل لأجهزة شاومي',
    service_type: 'IMEI', group_name: 'خدمات شاومي', status: 'active', is_featured: 0,
    name_priority: 'ar', source_id: 2, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-12 ساعة',
  },
  {
    id: 5, name: 'Samsung Firmware Flash', arabic_name: 'تفليش سامسونج عن بعد',
    price: 18.00, description: 'تفليش وتحديث سوفتوير أجهزة سامسونج عن بعد',
    service_type: 'REMOTE', group_name: 'خدمات سامسونج', status: 'active', is_featured: 1,
    name_priority: 'ar', source_id: null, linked_product_id: null, icon: '🖥️', stock: 999,
    service_time: '30-60 دقيقة',
  },
  {
    id: 6, name: 'Huawei FRP Bypass', arabic_name: 'تخطي FRP هواوي',
    price: 12.00, description: 'تخطي حماية FRP لأجهزة هواوي وهونر',
    service_type: 'SERVER', group_name: 'خدمات هواوي', status: 'active', is_featured: 0,
    name_priority: 'ar', source_id: 2, linked_product_id: null, icon: '🔧', stock: 999,
    service_time: '10-30 دقيقة',
  },
  {
    id: 7, name: 'Samsung Network Unlock', arabic_name: 'فك شبكة سامسونج',
    price: 8.00, description: 'فك قفل الشبكة لأجهزة سامسونج - كود NCK',
    service_type: 'IMEI', group_name: 'خدمات سامسونج', status: 'active', is_featured: 1,
    name_priority: 'ar', source_id: 1, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-48 ساعة',
  },
  {
    id: 8, name: 'LG Network Unlock', arabic_name: 'فك شبكة LG',
    price: 6.00, description: 'فك قفل الشبكة لأجهزة LG بالكود',
    service_type: 'IMEI', group_name: 'خدمات LG', status: 'active', is_featured: 0,
    name_priority: 'ar', source_id: 1, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-24 ساعة',
  },
  {
    id: 9, name: 'iPhone Carrier Check', arabic_name: 'فحص شبكة آيفون',
    price: 1.50, description: 'فحص معلومات شبكة وقفل آيفون بالتفصيل',
    service_type: 'IMEI', group_name: 'خدمات آبل', status: 'active', is_featured: 0,
    name_priority: 'ar', source_id: 1, linked_product_id: null, icon: '📱', stock: 999,
    service_time: '1-5 دقائق',
  },
  {
    id: 10, name: 'Remote TeamViewer Support', arabic_name: 'دعم عن بعد TeamViewer',
    price: 30.00, description: 'جلسة دعم فني عن بعد عبر TeamViewer',
    service_type: 'REMOTE', group_name: 'خدمات الدعم', status: 'active', is_featured: 0,
    name_priority: 'ar', source_id: null, linked_product_id: null, icon: '🖥️', stock: 999,
    service_time: '30 دقيقة',
  },
  {
    id: 11, name: 'Samsung Unlock File', arabic_name: 'ملف فتح سامسونج',
    price: 10.00, description: 'ملف فتح قفل لأجهزة سامسونج القديمة',
    service_type: 'FILE', group_name: 'خدمات سامسونج', status: 'active', is_featured: 0,
    name_priority: 'en', source_id: null, linked_product_id: null, icon: '📁', stock: 999,
    service_time: '1-12 ساعة',
  },
  {
    id: 12, name: 'Motorola FRP Reset', arabic_name: 'إعادة تعيين FRP موتورولا',
    price: 14.00, description: 'إعادة تعيين حماية FRP لأجهزة موتورولا',
    service_type: 'SERVER', group_name: 'خدمات موتورولا', status: 'inactive', is_featured: 0,
    name_priority: 'ar', source_id: 2, linked_product_id: null, icon: '🔧', stock: 0,
    service_time: '10-30 دقيقة',
  },
];

// ─── الطلبات ───
const now = new Date();
function daysAgo(d: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

export const demoOrders = [
  {
    id: 1, order_number: 'ORD-1247', product_name: 'إزالة FRP سامسونج S24', product_id: 1,
    customer_id: 1, customer_name: 'أحمد الخالدي', customer_email: 'ahmed@example.com',
    quantity: 1, unit_price: 15.00, total_price: 15.00,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '356938035643809', server_response: 'تم إزالة FRP بنجاح ✅',
    created_at: daysAgo(0), completed_at: daysAgo(0),
  },
  {
    id: 2, order_number: 'ORD-1246', product_name: 'فتح iCloud آيفون (نظيف)', product_id: 2,
    customer_id: 2, customer_name: 'سارة محمد', customer_email: 'sara@example.com',
    quantity: 1, unit_price: 45.00, total_price: 45.00,
    status: 'processing', payment_method: 'paypal', payment_status: 'paid',
    imei: '353456789012345', server_response: null,
    created_at: daysAgo(0), completed_at: null,
  },
  {
    id: 3, order_number: 'ORD-1245', product_name: 'فك شبكة سامسونج', product_id: 7,
    customer_id: 3, customer_name: 'محمد العلي', customer_email: 'mohammed@example.com',
    quantity: 1, unit_price: 8.00, total_price: 8.00,
    status: 'pending', payment_method: 'wallet', payment_status: 'paid',
    imei: '864297030543218', server_response: null,
    created_at: daysAgo(0), completed_at: null,
  },
  {
    id: 4, order_number: 'ORD-1244', product_name: 'إزالة MDM سامسونج', product_id: 3,
    customer_id: 4, customer_name: 'فاطمة حسن', customer_email: 'fatma@example.com',
    quantity: 1, unit_price: 25.00, total_price: 25.00,
    status: 'completed', payment_method: 'usdt', payment_status: 'paid',
    imei: '359876543210987', server_response: 'تم إزالة MDM بنجاح - الجهاز جاهز ✅',
    created_at: daysAgo(1), completed_at: daysAgo(1),
  },
  {
    id: 5, order_number: 'ORD-1243', product_name: 'فحص شبكة آيفون', product_id: 9,
    customer_id: 5, customer_name: 'علي الحسيني', customer_email: 'ali@example.com',
    quantity: 1, unit_price: 1.50, total_price: 1.50,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '353123456789012', server_response: 'Carrier: AT&T | Lock: Unlocked | iCloud: Clean | Blacklist: Clean',
    created_at: daysAgo(1), completed_at: daysAgo(1),
  },
  {
    id: 6, order_number: 'ORD-1242', product_name: 'فتح حساب Mi شاومي', product_id: 4,
    customer_id: 6, customer_name: 'نور الدين', customer_email: 'nour@example.com',
    quantity: 1, unit_price: 20.00, total_price: 20.00,
    status: 'completed', payment_method: 'bank_transfer', payment_status: 'paid',
    imei: '869012345678901', server_response: 'تم فتح حساب Mi بنجاح ✅',
    created_at: daysAgo(2), completed_at: daysAgo(1),
  },
  {
    id: 7, order_number: 'ORD-1241', product_name: 'تفليش سامسونج عن بعد', product_id: 5,
    customer_id: 1, customer_name: 'أحمد الخالدي', customer_email: 'ahmed@example.com',
    quantity: 1, unit_price: 18.00, total_price: 18.00,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '', server_response: 'تم تفليش الجهاز بنجاح - Android 14 ✅',
    created_at: daysAgo(2), completed_at: daysAgo(2),
  },
  {
    id: 8, order_number: 'ORD-1240', product_name: 'تخطي FRP هواوي', product_id: 6,
    customer_id: 7, customer_name: 'ريم العتيبي', customer_email: 'reem@example.com',
    quantity: 1, unit_price: 12.00, total_price: 12.00,
    status: 'rejected', payment_method: 'wallet', payment_status: 'refunded',
    imei: '867543210987654', server_response: 'رقم IMEI غير صالح — تم استرجاع المبلغ',
    created_at: daysAgo(3), completed_at: daysAgo(3),
  },
  {
    id: 9, order_number: 'ORD-1239', product_name: 'فك شبكة LG', product_id: 8,
    customer_id: 8, customer_name: 'عمر سالم', customer_email: 'omar@example.com',
    quantity: 1, unit_price: 6.00, total_price: 6.00,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '355678901234567', server_response: 'NCK Code: 12345678',
    created_at: daysAgo(3), completed_at: daysAgo(3),
  },
  {
    id: 10, order_number: 'ORD-1238', product_name: 'إزالة FRP سامسونج S24', product_id: 1,
    customer_id: 9, customer_name: 'ليلى أحمد', customer_email: 'layla@example.com',
    quantity: 1, unit_price: 15.00, total_price: 15.00,
    status: 'completed', payment_method: 'paypal', payment_status: 'paid',
    imei: '352789012345678', server_response: 'تم إزالة FRP بنجاح ✅',
    created_at: daysAgo(4), completed_at: daysAgo(4),
  },
  {
    id: 11, order_number: 'ORD-1237', product_name: 'فتح iCloud آيفون (نظيف)', product_id: 2,
    customer_id: 10, customer_name: 'خالد الشمري', customer_email: 'khaled@example.com',
    quantity: 1, unit_price: 45.00, total_price: 45.00,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '353901234567890', server_response: 'iCloud Removed Successfully ✅',
    created_at: daysAgo(5), completed_at: daysAgo(4),
  },
  {
    id: 12, order_number: 'ORD-1236', product_name: 'دعم عن بعد TeamViewer', product_id: 10,
    customer_id: 3, customer_name: 'محمد العلي', customer_email: 'mohammed@example.com',
    quantity: 1, unit_price: 30.00, total_price: 30.00,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '', server_response: 'تمت الجلسة بنجاح - مدة 45 دقيقة ✅',
    created_at: daysAgo(6), completed_at: daysAgo(6),
  },
  {
    id: 13, order_number: 'ORD-1235', product_name: 'ملف فتح سامسونج', product_id: 11,
    customer_id: 4, customer_name: 'فاطمة حسن', customer_email: 'fatma@example.com',
    quantity: 1, unit_price: 10.00, total_price: 10.00,
    status: 'completed', payment_method: 'bank_transfer', payment_status: 'paid',
    imei: '356012345678901', server_response: 'https://files.example.com/unlock_SM-G960U.zip',
    created_at: daysAgo(7), completed_at: daysAgo(6),
  },
  {
    id: 14, order_number: 'ORD-1234', product_name: 'فتح حساب Mi شاومي', product_id: 4,
    customer_id: 11, customer_name: 'زينب كريم', customer_email: 'zainab@example.com',
    quantity: 1, unit_price: 20.00, total_price: 20.00,
    status: 'refunded', payment_method: 'wallet', payment_status: 'refunded',
    imei: '869234567890123', server_response: 'تعذر فتح الحساب — تم استرجاع المبلغ للمحفظة',
    created_at: daysAgo(8), completed_at: daysAgo(7),
  },
  {
    id: 15, order_number: 'ORD-1233', product_name: 'إزالة FRP سامسونج S24', product_id: 1,
    customer_id: 2, customer_name: 'سارة محمد', customer_email: 'sara@example.com',
    quantity: 1, unit_price: 15.00, total_price: 15.00,
    status: 'completed', payment_method: 'wallet', payment_status: 'paid',
    imei: '356456789012345', server_response: 'تم إزالة FRP بنجاح ✅',
    created_at: daysAgo(9), completed_at: daysAgo(9),
  },
];

// ─── المستخدمون والزبائن ───
export const demoCustomers = [
  { id: 1, name: 'أحمد الخالدي', email: 'ahmed@example.com', is_blocked: false, created_at: daysAgo(90), orders: 18, spent: '$285.00', wallet_balance: 42.50 },
  { id: 2, name: 'سارة محمد', email: 'sara@example.com', is_blocked: false, created_at: daysAgo(75), orders: 12, spent: '$195.50', wallet_balance: 15.00 },
  { id: 3, name: 'محمد العلي', email: 'mohammed@example.com', is_blocked: false, created_at: daysAgo(60), orders: 8, spent: '$124.00', wallet_balance: 30.00 },
  { id: 4, name: 'فاطمة حسن', email: 'fatma@example.com', is_blocked: false, created_at: daysAgo(55), orders: 15, spent: '$320.00', wallet_balance: 5.50 },
  { id: 5, name: 'علي الحسيني', email: 'ali@example.com', is_blocked: false, created_at: daysAgo(50), orders: 6, spent: '$52.00', wallet_balance: 22.00 },
  { id: 6, name: 'نور الدين', email: 'nour@example.com', is_blocked: false, created_at: daysAgo(45), orders: 4, spent: '$68.00', wallet_balance: 0.00 },
  { id: 7, name: 'ريم العتيبي', email: 'reem@example.com', is_blocked: false, created_at: daysAgo(40), orders: 3, spent: '$36.00', wallet_balance: 12.00 },
  { id: 8, name: 'عمر سالم', email: 'omar@example.com', is_blocked: false, created_at: daysAgo(35), orders: 9, spent: '$145.00', wallet_balance: 8.75 },
  { id: 9, name: 'ليلى أحمد', email: 'layla@example.com', is_blocked: false, created_at: daysAgo(30), orders: 5, spent: '$75.50', wallet_balance: 18.00 },
  { id: 10, name: 'خالد الشمري', email: 'khaled@example.com', is_blocked: false, created_at: daysAgo(25), orders: 7, spent: '$210.00', wallet_balance: 35.00 },
  { id: 11, name: 'زينب كريم', email: 'zainab@example.com', is_blocked: true, created_at: daysAgo(20), orders: 2, spent: '$40.00', wallet_balance: 20.00 },
  { id: 12, name: 'يوسف المنصور', email: 'yousf@example.com', is_blocked: false, created_at: daysAgo(15), orders: 10, spent: '$165.00', wallet_balance: 50.00 },
  { id: 13, name: 'هدى الناصر', email: 'huda@example.com', is_blocked: false, created_at: daysAgo(10), orders: 1, spent: '$15.00', wallet_balance: 0.00 },
  { id: 14, name: 'عبدالله العمري', email: 'abdullah@example.com', is_blocked: false, created_at: daysAgo(5), orders: 3, spent: '$48.00', wallet_balance: 7.00 },
];

export const demoAdminUsers = [
  { id: 1, name: 'المدير العام', email: 'admin@store.com', role: 'admin', created_at: daysAgo(365) },
  { id: 2, name: 'سعود المشرف', email: 'saud@store.com', role: 'moderator', created_at: daysAgo(180) },
];

// ─── بوابات الدفع ───
export const demoGateways = [
  {
    id: 1, type: 'paypal', name: 'باي بال', name_en: 'PayPal',
    is_enabled: true, is_default: true,
    config: { client_id: 'AXq8m...demo', secret: '••••••••', email: 'pay@store.com', mode: 'live' },
    display_order: 1,
  },
  {
    id: 2, type: 'usdt', name: 'USDT (تيثر)', name_en: 'USDT Tether',
    is_enabled: true, is_default: false,
    config: { wallet_address: 'TXqL9...demo', network: 'TRC20' },
    display_order: 2,
  },
  {
    id: 3, type: 'bank_transfer', name: 'تحويل بنكي', name_en: 'Bank Transfer',
    is_enabled: true, is_default: false,
    config: { bank_name: 'البنك الأهلي', account_name: 'متجر YCZ', iban: 'SA02 8000 ••••' },
    display_order: 3,
  },
  {
    id: 4, type: 'binance', name: 'بينانس باي', name_en: 'Binance Pay',
    is_enabled: false, is_default: false,
    config: { merchant_id: 'BN-demo...', api_key: '••••••••' },
    display_order: 4,
  },
];

// ─── الإعلانات ───
export const demoAnnouncements = [
  { id: 1, title: '🎉 عرض خاص — خصم 20% على خدمات سامسونج', content: 'احصل على خصم 20% على جميع خدمات سامسونج حتى نهاية الشهر! استخدم كود: SAMSUNG20', date: daysAgo(1), active: true },
  { id: 2, title: '🔧 صيانة مجدولة', content: 'سيتم إجراء صيانة للخادم يوم الجمعة من الساعة 2 إلى 4 فجراً. قد تتأثر بعض الخدمات مؤقتاً.', date: daysAgo(5), active: true },
  { id: 3, title: '🆕 خدمات جديدة متاحة', content: 'تمت إضافة خدمات فتح قفل آيفون 15 وسامسونج S24 Ultra. جربها الآن!', date: daysAgo(14), active: false },
];

// ─── المصادر الخارجية ───
export const demoSources = [
  {
    id: 1, name: 'SD-Unlocker', type: 'dhru-fusion',
    url: 'https://sd-unlocker.com', connectionStatus: 'connected',
    lastConnectionCheckedAt: daysAgo(0),
    productsCount: 342, lastAccountBalance: '125.50',
    lastAccountCurrency: 'USD', profitPercentage: 15,
    lastConnectionError: null,
  },
  {
    id: 2, name: 'UnlockBase', type: 'dhru-fusion',
    url: 'https://unlockbase.com', connectionStatus: 'connected',
    lastConnectionCheckedAt: daysAgo(0),
    productsCount: 189, lastAccountBalance: '78.25',
    lastAccountCurrency: 'USD', profitPercentage: 20,
    lastConnectionError: null,
  },
];

// ─── الإعدادات / التخصيص ───

// ─── مقالات المدونة (تجريبي) ───
export const demoBlogPosts = [
  {
    id: 1, title: 'ما هو iCloud Lock؟ وكيف يمكن إزالته بأمان', title_en: 'What is iCloud Lock? How to Remove It Safely',
    excerpt: 'تعرّف على قفل iCloud Activation Lock في أجهزة Apple، أسباب ظهوره، والطرق الآمنة لإزالته.',
    excerpt_en: 'Learn about iCloud Activation Lock on Apple devices and safe methods to remove it.',
    content: ['قفل iCloud Activation Lock هو ميزة أمان من Apple.', 'يظهر عند شراء جهاز مستعمل لم يقم المالك بتسجيل الخروج.', 'نقدّم خدمة إزالة iCloud لجميع موديلات iPhone.'],
    category: 'iCloud', category_color: '#3b82f6', image: '🍎', read_time: 5, views: 1240,
    is_published: true, published_at: daysAgo(4), created_at: daysAgo(4), updated_at: daysAgo(4),
  },
  {
    id: 2, title: 'دليل فتح شبكة Samsung: كل ما تحتاج معرفته', title_en: 'Samsung Network Unlock Guide',
    excerpt: 'دليل شامل لفتح شبكة أجهزة Samsung Galaxy من جميع الشبكات العالمية.',
    excerpt_en: 'A comprehensive guide to unlocking Samsung Galaxy devices.',
    content: ['فتح الشبكة يعني إزالة القيد الذي تفرضه شركة الاتصالات.', 'نوفر فتح شبكة لجميع موديلات Samsung.', 'فتح الشبكة قانوني تماماً.'],
    category: 'فتح شبكات', category_color: '#8b5cf6', image: '📱', read_time: 7, views: 980,
    is_published: true, published_at: daysAgo(7), created_at: daysAgo(7), updated_at: daysAgo(7),
  },
  {
    id: 3, title: 'أفضل أدوات السوفتوير لعام 2026', title_en: 'Best Software Tools for 2026',
    excerpt: 'مقارنة بين أشهر أدوات السوفتوير مثل Unlocktool و Z3X و Chimera.',
    excerpt_en: 'Comparison of popular software tools like Unlocktool, Z3X, Chimera.',
    content: ['أدوات السوفتوير هي برامج متخصصة يستخدمها فنيو الصيانة.', 'Unlocktool — الأداة الأكثر شمولاً.', 'Z3X — متخصصة بأجهزة Samsung.'],
    category: 'أدوات سوفتوير', category_color: '#f59e0b', image: '🔧', read_time: 10, views: 2150,
    is_published: true, published_at: daysAgo(11), created_at: daysAgo(11), updated_at: daysAgo(11),
  },
];

export const demoSettings = {
  theme_id: 'purple',
  logo_url: '',
  font_family: 'Tajawal',
  dark_mode: false,
  button_radius: '14',
  header_style: 'default',
  show_banner: true,
  store_name: 'متجر YCZ',
  smtp_host: 'mail.example.com',
  smtp_port: 587,
  smtp_user: 'noreply@store.com',
  smtp_pass: '••••••••',
  smtp_from: 'noreply@store.com',
  secondary_currency: 'SAR',
  currency_rate: 3.75,
  otp_enabled: false,
};

// ─── بيانات الزبون للعرض (الواجهة الأمامية) ───
export const demoCustomerProfile = {
  customer: {
    id: 1,
    name: 'أحمد الخالدي',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    wallet_balance: 42.50,
    country: 'السعودية',
  },
};

export const demoCustomerOrders = {
  orders: [
    {
      id: 1, order_number: 'ORD-1247', product_name: 'إزالة FRP سامسونج S24',
      quantity: 1, unit_price: 15, total_price: 15,
      status: 'completed', payment_method: 'wallet', payment_status: 'paid',
      server_response: 'تم إزالة FRP بنجاح ✅', created_at: daysAgo(0),
    },
    {
      id: 7, order_number: 'ORD-1241', product_name: 'تفليش سامسونج عن بعد',
      quantity: 1, unit_price: 18, total_price: 18,
      status: 'completed', payment_method: 'wallet', payment_status: 'paid',
      server_response: 'تم تفليش الجهاز بنجاح - Android 14 ✅', created_at: daysAgo(2),
    },
    {
      id: 16, order_number: 'ORD-1232', product_name: 'فحص شبكة آيفون',
      quantity: 1, unit_price: 1.50, total_price: 1.50,
      status: 'completed', payment_method: 'wallet', payment_status: 'paid',
      server_response: 'Carrier: STC | Lock: Locked | iCloud: Clean', created_at: daysAgo(12),
    },
    {
      id: 17, order_number: 'ORD-1228', product_name: 'فك شبكة سامسونج',
      quantity: 1, unit_price: 8, total_price: 8,
      status: 'pending', payment_method: 'wallet', payment_status: 'paid',
      server_response: null, created_at: daysAgo(0),
    },
  ],
};

export const demoCustomerPayments = {
  payments: [
    { id: 1, type: 'deposit', amount: 50.00, payment_method: 'paypal', status: 'completed', created_at: daysAgo(2) },
    { id: 2, type: 'deposit', amount: 25.00, payment_method: 'usdt', status: 'completed', created_at: daysAgo(15) },
    { id: 3, type: 'deposit', amount: 30.00, payment_method: 'bank_transfer', status: 'completed', created_at: daysAgo(30) },
    { id: 4, type: 'deposit', amount: 20.00, payment_method: 'paypal', status: 'pending', created_at: daysAgo(0) },
  ],
};

// ─── خريطة الردود الوهمية لمسارات API ───
// تُستخدم في اعتراض الطلبات عند وضع العرض

type DemoRouteHandler = (endpoint: string, method: string, data?: Record<string, unknown>) => unknown | null;

export const getDemoResponse: DemoRouteHandler = (endpoint: string, method: string, data?: Record<string, unknown>) => {
  const ep = endpoint.replace(/^\//, '');

  // ─── Admin API ───
  if (ep === 'dashboard/stats' && method === 'GET') {
    return demoStats;
  }

  if (ep === 'products' && method === 'GET') {
    return { products: demoProducts };
  }
  if (ep === 'products/public' && method === 'GET') {
    return demoProducts;
  }
  if (ep.startsWith('products/') && method === 'GET') {
    const id = parseInt(ep.split('/')[1]);
    return demoProducts.find(p => p.id === id) || null;
  }

  if (ep === 'orders' && method === 'GET') {
    return { orders: demoOrders };
  }

  if (ep.match(/^orders\/\d+\/status$/) && method === 'PATCH') {
    return { success: true, message: 'تم تحديث حالة الطلب (عرض تجريبي)' };
  }

  if (ep === 'auth/users' && method === 'GET') {
    return { users: demoAdminUsers };
  }

  if (ep.startsWith('customers') && ep.includes('?') && method === 'GET') {
    // GET /customers?page=1&limit=50
    return { customers: demoCustomers, total: demoCustomers.length };
  }
  if (ep === 'customers' && method === 'GET') {
    return { customers: demoCustomers, total: demoCustomers.length };
  }

  if (ep === 'notifications' && method === 'GET') {
    return demoAnnouncements;
  }
  if (ep === 'notifications' && method === 'POST') {
    return { id: 99, success: true };
  }
  if (ep.startsWith('notifications/') && method === 'DELETE') {
    return { success: true };
  }

  if (ep === 'customization' && method === 'GET') {
    return demoSettings;
  }
  if (ep === 'customization' && method === 'PUT') {
    return { success: true, message: 'تم حفظ الإعدادات (عرض تجريبي)' };
  }

  if (ep === 'sources' && method === 'GET') {
    return demoSources;
  }
  if (ep.match(/^sources\/\d+\/(sync|test)$/) && method === 'POST') {
    return { success: true, message: 'نجح (عرض تجريبي)' };
  }
  if (ep.match(/^sources\/\d+\/apply-profit$/) && method === 'POST') {
    return { success: true };
  }

  if (ep === 'payment-gateways' && method === 'GET') {
    return { gateways: demoGateways };
  }
  if (ep === 'payment-gateways/enabled' && method === 'GET') {
    return { gateways: demoGateways.filter(g => g.is_enabled) };
  }
  if (ep.match(/^payment-gateways\/\d+\/toggle$/) && method === 'PATCH') {
    return { success: true };
  }
  if (ep === 'payment-gateways' && method === 'POST') {
    return { id: 99, success: true };
  }

  // Wallet update
  if (ep.match(/^customers\/\d+\/wallet$/) && method === 'PATCH') {
    return { success: true, message: 'تم تعديل المحفظة (عرض تجريبي)' };
  }

  // ─── Customer / Store API ───
  if (ep === 'customers/me' && method === 'GET') {
    return demoCustomerProfile;
  }
  if (ep === 'customers/me' && method === 'PUT') {
    return { success: true, message: 'تم تحديث البيانات (عرض تجريبي)' };
  }
  if (ep === 'customers/orders' && method === 'GET') {
    return demoCustomerOrders;
  }
  if (ep === 'customers/orders' && method === 'POST') {
    return { success: true, order: { id: 999, order_number: 'ORD-DEMO', status: 'pending' } };
  }
  if (ep === 'customers/payments' && method === 'GET') {
    return demoCustomerPayments;
  }
  if (ep === 'customers/payments' && method === 'POST') {
    return { success: true, message: 'تم شحن المحفظة (عرض تجريبي)' };
  }
  if (ep === 'customers/login' && method === 'POST') {
    return { token: 'demo-token-12345', customer: demoCustomerProfile.customer };
  }
  if (ep === 'customers/register' && method === 'POST') {
    return { token: 'demo-token-12345', customer: demoCustomerProfile.customer };
  }

  if (ep === 'store/info' && method === 'GET') {
    return { store_name: 'متجر YCZ', theme_id: 'purple', logo_url: '' };
  }

  // ─── Checkout API (demo) ───
  if (ep === 'checkout/init' && method === 'POST') {
    const gwType = (() => {
      const gwId = data?.gateway_id;
      const gw = demoGateways.find(g => g.id === gwId);
      return gw?.type || 'bank_transfer';
    })();
    const amt = Number(data?.amount || 10);
    const demoPaymentId = 9000 + Math.floor(Math.random() * 999);
    switch (gwType) {
      case 'paypal':
        return { success: true, paymentId: demoPaymentId, gatewayType: 'paypal', method: 'redirect', redirectUrl: '#demo-paypal-redirect', orderId: 'DEMO-PP-ORDER' };
      case 'binance':
        return { success: true, paymentId: demoPaymentId, gatewayType: 'binance', method: 'qr_or_redirect', checkoutUrl: '#demo-binance-checkout', qrContent: `binance://pay?amount=${amt}&currency=USDT&merchant=DEMO`, orderId: 'DEMO-BN-ORDER' };
      case 'usdt':
        return { success: true, paymentId: demoPaymentId, gatewayType: 'usdt', method: 'manual_crypto', walletAddress: 'TXqL98dKjQr7pMxVJyBdRaCne5i7L4Vucd', network: 'TRC20', amount: amt, currency: 'USDT', contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', instructions: `أرسل ${amt} USDT بالضبط إلى العنوان أعلاه عبر شبكة TRC20`, expires_in: 1800, expires_at: new Date(Date.now() + 1800000).toISOString() };
      case 'bank_transfer':
      default:
        return { success: true, paymentId: demoPaymentId, gatewayType: 'bank_transfer', method: 'manual_bank', bankDetails: { bank_name: 'البنك الأهلي', account_holder: 'متجر YCZ للخدمات', iban: 'SA02 8000 0000 6080 1016 7519', swift: 'NCBKSAJE', currency: 'USD' }, referenceId: `NF${demoPaymentId}T${Date.now()}`, instructions: { ar: `حوّل المبلغ ${amt} USD إلى الحساب أعلاه. بعد التحويل ارفع إيصال الدفع.`, en: `Transfer ${amt} USD to the account above, then upload your receipt.` } };
    }
  }
  if (ep.match(/^checkout\/status\/\d+$/) && method === 'GET') {
    return { paymentId: 9000, status: 'pending', amount: 10, currency: 'USD', method: 'bank_transfer', meta: {} };
  }
  if (ep.match(/^checkout\/check-usdt\/\d+$/) && method === 'POST') {
    return { confirmed: false, message: 'عرض تجريبي — لم يتم العثور على تحويل مطابق', remaining: 1500 };
  }

  // Mutations that shouldn't actually do anything
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return { success: true, message: 'عرض تجريبي — لا يمكن تعديل البيانات' };
  }

  // Blog demo
  if (ep === 'blogs' && method === 'GET') {
    return { posts: demoBlogPosts };
  }
  if (ep.match(/^blogs\/public$/) && method === 'GET') {
    return { posts: demoBlogPosts.filter(p => p.is_published) };
  }

  return null;
};
