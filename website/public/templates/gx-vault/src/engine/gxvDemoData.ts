// ─── بيانات وهمية لوضع العرض التجريبي (Demo Mode) ───
// يُستخدم عند تشغيل المتجر بوضع ?demo=1
// يعرض بيانات واقعية لزوار الديمو دون الحاجة لحساب حقيقي

// ─── إحصائيات لوحة التحكم ───
export const gxvDemoStats = {
  totalOrders: 2847,
  total_orders: 2847,
  totalRevenue: 42580.75,
  total_revenue: 42580.75,
  totalUsers: 612,
  total_users: 612,
  totalProducts: 48,
  total_products: 48,
  totalProfit: 28350.50,
  total_profit: 28350.50,
  todayOrders: 37,
  today_orders: 37,
  recentOrders: [
    { id: 'ORD-8A7F3C', product_name: 'شحن 660 UC ببجي موبايل', customer_name: 'أحمد محمد', created_at: '2026-02-18T14:30:00Z', total_price: 9.99 },
    { id: 'ORD-5B2D1E', product_name: '1000 V-Bucks فورتنايت', customer_name: 'سارة علي', created_at: '2026-02-18T13:15:00Z', total_price: 7.99 },
    { id: 'ORD-9C4E6A', product_name: 'بطاقة Google Play $50', customer_name: 'محمد خالد', created_at: '2026-02-18T12:45:00Z', total_price: 52.50 },
    { id: 'ORD-3D8F2B', product_name: 'شحن 800 Robux روبلوكس', customer_name: 'فاطمة أحمد', created_at: '2026-02-18T11:20:00Z', total_price: 9.99 },
    { id: 'ORD-7E1A4C', product_name: 'بطاقة PlayStation $25', customer_name: 'عمر حسن', created_at: '2026-02-18T10:00:00Z', total_price: 26.99 },
    { id: 'ORD-2F5B8D', product_name: 'شحن 1080 CP كول أوف ديوتي', customer_name: 'ليلى سعيد', created_at: '2026-02-17T22:30:00Z', total_price: 12.99 },
    { id: 'ORD-6G3C9E', product_name: '520 جوهرة فري فاير', customer_name: 'يوسف عبدالله', created_at: '2026-02-17T20:15:00Z', total_price: 5.99 },
    { id: 'ORD-1H7D2F', product_name: 'بطاقة iTunes $100', customer_name: 'نور الدين', created_at: '2026-02-17T18:45:00Z', total_price: 105.00 },
  ],
  recent_orders: [
    { id: 'ORD-8A7F3C', product_name: 'شحن 660 UC ببجي موبايل', customer_name: 'أحمد محمد', created_at: '2026-02-18T14:30:00Z', total_price: 9.99 },
    { id: 'ORD-5B2D1E', product_name: '1000 V-Bucks فورتنايت', customer_name: 'سارة علي', created_at: '2026-02-18T13:15:00Z', total_price: 7.99 },
    { id: 'ORD-9C4E6A', product_name: 'بطاقة Google Play $50', customer_name: 'محمد خالد', created_at: '2026-02-18T12:45:00Z', total_price: 52.50 },
    { id: 'ORD-3D8F2B', product_name: 'شحن 800 Robux روبلوكس', customer_name: 'فاطمة أحمد', created_at: '2026-02-18T11:20:00Z', total_price: 9.99 },
    { id: 'ORD-7E1A4C', product_name: 'بطاقة PlayStation $25', customer_name: 'عمر حسن', created_at: '2026-02-18T10:00:00Z', total_price: 26.99 },
    { id: 'ORD-2F5B8D', product_name: 'شحن 1080 CP كول أوف ديوتي', customer_name: 'ليلى سعيد', created_at: '2026-02-17T22:30:00Z', total_price: 12.99 },
    { id: 'ORD-6G3C9E', product_name: '520 جوهرة فري فاير', customer_name: 'يوسف عبدالله', created_at: '2026-02-17T20:15:00Z', total_price: 5.99 },
    { id: 'ORD-1H7D2F', product_name: 'بطاقة iTunes $100', customer_name: 'نور الدين', created_at: '2026-02-17T18:45:00Z', total_price: 105.00 },
  ],
};

// ─── المنتجات (مع حقول مخصصة لتجربة الطلب) ───
export const gxvDemoProducts = [
  { id: 1, name: 'PUBG Mobile 660 UC', arabic_name: 'شحن 660 UC ببجي موبايل', price: 9.99, group_name: 'ببجي موبايل', description: 'شحن 660 UC مباشرة لحسابك في ببجي موبايل', status: 'active', service_type: 'SERVER', requires_custom_json: [{ key: 'player_id', label: 'معرّف اللاعب (ID)', placeholder: 'أدخل Player ID', required: true }] },
  { id: 2, name: 'Fortnite 1000 V-Bucks', arabic_name: '1000 V-Bucks فورتنايت', price: 7.99, group_name: 'فورتنايت', description: 'شحن 1000 V-Bucks لحسابك في فورتنايت', status: 'active', service_type: 'CODE', requires_custom_json: [{ key: 'epic_username', label: 'اسم حساب Epic Games', placeholder: 'أدخل اسم المستخدم', required: true }] },
  { id: 3, name: 'Free Fire 520 Diamonds', arabic_name: '520 جوهرة فري فاير', price: 5.99, group_name: 'فري فاير', description: 'شحن 520 جوهرة فري فاير مباشرة', status: 'active', service_type: 'SERVER', requires_custom_json: [{ key: 'player_id', label: 'معرّف اللاعب (ID)', placeholder: 'أدخل Player ID', required: true }] },
  { id: 4, name: 'Roblox 800 Robux', arabic_name: 'شحن 800 Robux روبلوكس', price: 9.99, group_name: 'روبلوكس', description: 'شحن 800 Robux لحسابك في روبلوكس', status: 'active', service_type: 'CODE', requires_custom_json: [{ key: 'roblox_username', label: 'اسم مستخدم Roblox', placeholder: 'أدخل اسم المستخدم', required: true }] },
  { id: 5, name: 'COD Mobile 1080 CP', arabic_name: 'شحن 1080 CP كول أوف ديوتي', price: 12.99, group_name: 'كول أوف ديوتي', description: 'شحن 1080 CP لكول أوف ديوتي موبايل', status: 'active', service_type: 'SERVER', requires_custom_json: [{ key: 'player_id', label: 'معرّف اللاعب (UID)', placeholder: 'أدخل UID', required: true }] },
  { id: 6, name: 'Valorant 1000 VP', arabic_name: '1000 VP فالورانت', price: 10.99, group_name: 'فالورانت', description: 'شحن 1000 VP لحسابك في فالورانت', status: 'active', service_type: 'CODE', requires_custom_json: [{ key: 'riot_id', label: 'Riot ID', placeholder: 'مثال: Player#1234', required: true }] },
  { id: 7, name: 'Google Play $50', arabic_name: 'بطاقة Google Play $50', price: 52.50, group_name: 'بطاقات رقمية', description: 'بطاقة Google Play بقيمة 50 دولار أمريكي', status: 'active', service_type: 'CODE' },
  { id: 8, name: 'PlayStation $25', arabic_name: 'بطاقة PlayStation $25', price: 26.99, group_name: 'بطاقات رقمية', description: 'بطاقة PlayStation Store بقيمة 25 دولار', status: 'active', service_type: 'CODE' },
  { id: 9, name: 'iTunes $100', arabic_name: 'بطاقة iTunes $100', price: 105.00, group_name: 'بطاقات رقمية', description: 'بطاقة iTunes بقيمة 100 دولار أمريكي', status: 'active', service_type: 'CODE' },
  { id: 10, name: 'PUBG Mobile 1800 UC', arabic_name: 'شحن 1800 UC ببجي موبايل', price: 24.99, group_name: 'ببجي موبايل', description: 'شحن 1800 UC مباشرة لحسابك في ببجي موبايل', status: 'active', service_type: 'SERVER', requires_custom_json: [{ key: 'player_id', label: 'معرّف اللاعب (ID)', placeholder: 'أدخل Player ID', required: true }] },
  { id: 11, name: 'Steam Wallet $20', arabic_name: 'محفظة Steam $20', price: 21.50, group_name: 'بطاقات رقمية', description: 'بطاقة Steam Wallet بقيمة 20 دولار', status: 'active', service_type: 'CODE' },
  { id: 12, name: 'Fortnite 2800 V-Bucks', arabic_name: '2800 V-Bucks فورتنايت', price: 19.99, group_name: 'فورتنايت', description: 'شحن 2800 V-Bucks لحسابك في فورتنايت', status: 'active', service_type: 'CODE', requires_custom_json: [{ key: 'epic_username', label: 'اسم حساب Epic Games', placeholder: 'أدخل اسم المستخدم', required: true }] },
];

// ─── الملف الشخصي للعميل في الديمو (مع رصيد) ───
export const gxvDemoProfile = {
  id: 99,
  name: 'زائر الديمو',
  email: 'demo@gxvault.com',
  balance: 250.00,
  created_at: '2026-01-01T00:00:00Z',
};

// ─── طلبات العميل في الديمو (الطلبات المعروضة في صفحة "طلباتي") ───
export const gxvDemoCustomerOrders = [
  { id: 'ORD-D1A23B', product_name: 'شحن 660 UC ببجي موبايل', icon: '🎮', created_at: '2026-02-18T14:30:00Z', total_price: 9.99, status: 'completed' },
  { id: 'ORD-D2B34C', product_name: '1000 V-Bucks فورتنايت', icon: '🔑', created_at: '2026-02-17T10:20:00Z', total_price: 7.99, status: 'completed' },
  { id: 'ORD-D3C45D', product_name: 'بطاقة Google Play $50', icon: '🔑', created_at: '2026-02-16T18:15:00Z', total_price: 52.50, status: 'processing' },
  { id: 'ORD-D4D56E', product_name: 'شحن 1080 CP كول أوف ديوتي', icon: '🎮', created_at: '2026-02-15T22:00:00Z', total_price: 12.99, status: 'completed' },
  { id: 'ORD-D5E67F', product_name: '520 جوهرة فري فاير', icon: '🎮', created_at: '2026-02-14T11:45:00Z', total_price: 5.99, status: 'completed' },
];

// ─── الطلبات (لوحة التحكم) ───
export const gxvDemoOrders = [
  { id: 'ORD-8A7F3C', product_name: 'شحن 660 UC ببجي موبايل', customer_name: 'أحمد محمد', customer_email: 'ahmed@example.com', created_at: '2026-02-18T14:30:00Z', total_price: 9.99, status: 'completed' },
  { id: 'ORD-5B2D1E', product_name: '1000 V-Bucks فورتنايت', customer_name: 'سارة علي', customer_email: 'sara@example.com', created_at: '2026-02-18T13:15:00Z', total_price: 7.99, status: 'completed' },
  { id: 'ORD-9C4E6A', product_name: 'بطاقة Google Play $50', customer_name: 'محمد خالد', customer_email: 'mohammed@example.com', created_at: '2026-02-18T12:45:00Z', total_price: 52.50, status: 'processing' },
  { id: 'ORD-3D8F2B', product_name: 'شحن 800 Robux روبلوكس', customer_name: 'فاطمة أحمد', customer_email: 'fatma@example.com', created_at: '2026-02-18T11:20:00Z', total_price: 9.99, status: 'completed' },
  { id: 'ORD-7E1A4C', product_name: 'بطاقة PlayStation $25', customer_name: 'عمر حسن', customer_email: 'omar@example.com', created_at: '2026-02-18T10:00:00Z', total_price: 26.99, status: 'pending' },
  { id: 'ORD-2F5B8D', product_name: 'شحن 1080 CP كول أوف ديوتي', customer_name: 'ليلى سعيد', customer_email: 'layla@example.com', created_at: '2026-02-17T22:30:00Z', total_price: 12.99, status: 'completed' },
  { id: 'ORD-6G3C9E', product_name: '520 جوهرة فري فاير', customer_name: 'يوسف عبدالله', customer_email: 'youssef@example.com', created_at: '2026-02-17T20:15:00Z', total_price: 5.99, status: 'completed' },
  { id: 'ORD-1H7D2F', product_name: 'بطاقة iTunes $100', customer_name: 'نور الدين', customer_email: 'nour@example.com', created_at: '2026-02-17T18:45:00Z', total_price: 105.00, status: 'completed' },
  { id: 'ORD-4I9E3G', product_name: '1000 VP فالورانت', customer_name: 'خالد عمر', customer_email: 'khaled@example.com', created_at: '2026-02-17T16:00:00Z', total_price: 10.99, status: 'cancelled' },
  { id: 'ORD-8J2F6H', product_name: 'شحن 1800 UC ببجي موبايل', customer_name: 'رنا سمير', customer_email: 'rana@example.com', created_at: '2026-02-17T14:30:00Z', total_price: 24.99, status: 'completed' },
];

// ─── المستخدمون ───
export const gxvDemoUsers = [
  { id: 1, name: 'مدير النظام', email: 'admin@gxvault.com', role: 'admin' },
  { id: 2, name: 'أحمد محمد', email: 'ahmed@example.com', role: 'user' },
  { id: 3, name: 'سارة علي', email: 'sara@example.com', role: 'user' },
  { id: 4, name: 'محمد خالد', email: 'mohammed@example.com', role: 'user' },
  { id: 5, name: 'فاطمة أحمد', email: 'fatma@example.com', role: 'user' },
  { id: 6, name: 'عمر حسن', email: 'omar@example.com', role: 'user' },
  { id: 7, name: 'ليلى سعيد', email: 'layla@example.com', role: 'user' },
  { id: 8, name: 'يوسف عبدالله', email: 'youssef@example.com', role: 'user' },
];

// ─── بوابات الدفع ───
export const gxvDemoGateways = [
  { name: 'PayPal', is_active: true, fees: 2.9 },
  { name: 'Binance Pay', is_active: true, fees: 0 },
  { name: 'USDT (TRC20)', is_active: true, fees: 1 },
  { name: 'تحويل يدوي', is_active: true, fees: 0 },
];

// ─── المصادر الخارجية ───
export const gxvDemoSources = [
  { id: 1, name: 'DhruFusion API', type: 'dhrufusion', products_count: 35 },
  { id: 2, name: 'SRSIMKey API', type: 'srsimkey', products_count: 18 },
];

// ─── الإعلانات ───
export const gxvDemoAnnouncements = [
  { id: 1, title: 'عروض الشتاء 🎮', content: 'خصم 20% على جميع شحنات ببجي موبايل حتى نهاية الشهر!', created_at: '2026-02-15T10:00:00Z' },
  { id: 2, title: 'طريقة دفع جديدة', content: 'تم إضافة Binance Pay كطريقة دفع جديدة في المتجر.', created_at: '2026-02-10T08:00:00Z' },
  { id: 3, title: 'صيانة مجدولة', content: 'سيتم إجراء صيانة على السيرفر يوم الجمعة من 2-4 صباحاً.', created_at: '2026-02-05T12:00:00Z' },
];

// ─── إعدادات المتجر ───
export const gxvDemoSettings = {
  store_name: 'GX-Vault Gaming',
  store_description: 'متجر شحن الألعاب والبطاقات الرقمية - أسرع وأسهل طريقة لشحن ألعابك المفضلة',
  contact_email: 'support@gxvault.com',
};

// ─── دالة موحدة لإرجاع بيانات الديمو حسب الـ endpoint ───
export function getGxvDemoResponse(endpoint: string, method: string = 'GET'): unknown {
  // إذا كان طلب كتابة (POST/PUT/DELETE) نرجع نجاح وهمي
  if (method !== 'GET') {
    // طلب إنشاء طلب جديد — نرجع طلب وهمي ناجح
    if (endpoint.includes('/orders') && method === 'POST') {
      const newOrder = {
        id: `ORD-DEMO-${Date.now().toString(36).toUpperCase()}`,
        status: 'processing',
        message: 'تم إنشاء الطلب بنجاح! (وضع العرض)',
        success: true,
      };
      return newOrder;
    }
    return { success: true, message: 'تم بنجاح (وضع العرض)' };
  }

  if (endpoint.includes('/dashboard/stats')) return gxvDemoStats;
  if (endpoint.includes('/products/public') || endpoint.includes('/products')) return gxvDemoProducts;
  if (endpoint.includes('/customers/orders') || endpoint.includes('/orders')) return gxvDemoCustomerOrders;
  if (endpoint.includes('/auth/users')) return gxvDemoUsers;
  if (endpoint.includes('/customers/login') || endpoint.includes('/customers/register') || endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) return { token: 'demo_token_gxv', ...gxvDemoProfile };
  if (endpoint.includes('/customers/me') || endpoint.includes('/profile')) return gxvDemoProfile;
  if (endpoint.includes('/payment-gateways')) return gxvDemoGateways;
  if (endpoint.includes('/sources')) return gxvDemoSources;
  if (endpoint.includes('/notifications')) return gxvDemoAnnouncements;
  if (endpoint.includes('/customization')) return { customization: gxvDemoSettings, ...gxvDemoSettings };
  if (endpoint.includes('/store/info')) return { name: gxvDemoSettings.store_name, description: gxvDemoSettings.store_description };

  return {};
}
