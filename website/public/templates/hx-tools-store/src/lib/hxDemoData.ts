// ─── HX Tools Store - Demo Data ───

import { HxProduct, HxOrder, HxCustomer, HxDeliveryZone, HxCurrency, HxPaymentGateway, HxBanner } from './hxTypes';

const HX_DEMO_PRODUCTS: HxProduct[] = [
  { id: 1, name: 'UMT Dongle', arabic_name: 'دونجل UMT', price: 85, originalPrice: '95', icon: '🔑', category: 'دونجل', badge: 'الأكثر مبيعاً', badgeColor: '#ef4444', rating: 4.8, sales: 1250, desc: 'دونجل UMT الأصلي لفك شفرات الأجهزة - يدعم أكثر من 1000 موديل', stock: 45, status: 'active', is_featured: 1, brand: 'UMT', warranty: '6 أشهر', group_name: 'دونجل' },
  { id: 2, name: 'Octopus Box', arabic_name: 'بوكس أوكتوبوس', price: 220, originalPrice: '250', icon: '📦', category: 'بوكس', badge: 'جديد', badgeColor: '#3b82f6', rating: 4.9, sales: 890, desc: 'بوكس أوكتوبوس سامسونج + LG - الحل الشامل لأجهزة سامسونج', stock: 20, status: 'active', is_featured: 1, brand: 'Octopus', warranty: '12 شهر', group_name: 'بوكس' },
  { id: 3, name: 'Z3X Box', arabic_name: 'بوكس Z3X', price: 180, icon: '📦', category: 'بوكس', rating: 4.7, sales: 760, desc: 'Z3X Samsung Tool Pro - لفلاش وإصلاح أجهزة سامسونج', stock: 15, status: 'active', is_featured: 1, brand: 'Z3X', warranty: '12 شهر', group_name: 'بوكس' },
  { id: 4, name: 'JTAG Adapter Kit', arabic_name: 'طقم محول JTAG', price: 65, icon: '🔧', category: 'جيتاج', rating: 4.5, sales: 430, desc: 'طقم محولات JTAG كامل مع كابلات - لإصلاح البوت والبرمجة', stock: 30, status: 'active', brand: 'Medusa', warranty: '3 أشهر', group_name: 'جيتاج' },
  { id: 5, name: 'Easy JTAG Plus', arabic_name: 'ايزي جيتاج بلس', price: 350, originalPrice: '400', icon: '⚡', category: 'جيتاج', badge: 'احترافي', badgeColor: '#8b5cf6', rating: 4.9, sales: 540, desc: 'Easy JTAG Plus بوكس - الحل الأقوى لإصلاح eMMC و ISP', stock: 12, status: 'active', is_featured: 1, brand: 'Easy JTAG', warranty: '12 شهر', group_name: 'جيتاج' },
  { id: 6, name: 'Soldering Station 936', arabic_name: 'محطة لحام 936', price: 45, icon: '🔥', category: 'أدوات اللحام', rating: 4.3, sales: 890, desc: 'محطة لحام رقمية 936 مع تحكم بالحرارة - مثالية لأعمال الصيانة', stock: 50, status: 'active', brand: 'Hakko', warranty: '6 أشهر', group_name: 'أدوات اللحام' },
  { id: 7, name: 'Hot Air Rework Station', arabic_name: 'محطة هواء ساخن', price: 120, icon: '🌡️', category: 'أدوات اللحام', badge: 'عرض خاص', badgeColor: '#f59e0b', rating: 4.6, sales: 670, desc: 'محطة هواء ساخن مزدوجة للحام وفك الرقائق - مع شاشة رقمية', stock: 25, status: 'active', is_featured: 1, brand: 'Quick', warranty: '12 شهر', group_name: 'أدوات اللحام' },
  { id: 8, name: 'BGA Reballing Kit', arabic_name: 'طقم ترقيع BGA', price: 35, icon: '🎯', category: 'رقائق', rating: 4.4, sales: 320, desc: 'طقم ترقيع BGA كامل مع شبكات وكور لحام', stock: 60, status: 'active', brand: 'Generic', warranty: '3 أشهر', group_name: 'رقائق' },
  { id: 9, name: 'Multimeter Digital Pro', arabic_name: 'ملتيميتر رقمي احترافي', price: 55, icon: '📊', category: 'أجهزة قياس', rating: 4.7, sales: 445, desc: 'جهاز قياس رقمي احترافي - يقيس الفولت والأمبير والمقاومة والسعة', stock: 35, status: 'active', brand: 'UNI-T', warranty: '12 شهر', group_name: 'أجهزة قياس' },
  { id: 10, name: 'USB Cable Set', arabic_name: 'طقم كابلات USB', price: 15, icon: '🔌', category: 'كابلات', rating: 4.2, sales: 1100, desc: 'طقم كابلات USB متعدد الأنواع - Type-C, Micro, Lightning', stock: 100, status: 'active', brand: 'Generic', group_name: 'كابلات' },
  { id: 11, name: 'NCK Dongle', arabic_name: 'دونجل NCK', price: 75, icon: '🔑', category: 'دونجل', rating: 4.6, sales: 560, desc: 'دونجل NCK Pro لفك شفرات أجهزة هواوي وZTE وألكاتيل', stock: 28, status: 'active', brand: 'NCK', warranty: '6 أشهر', group_name: 'دونجل' },
  { id: 12, name: 'Microscope USB 1000x', arabic_name: 'مجهر USB 1000x', price: 40, icon: '🔬', category: 'أجهزة قياس', rating: 4.5, sales: 280, desc: 'مجهر USB رقمي بتكبير 1000x - لفحص اللوحات والرقائق', stock: 22, status: 'active', brand: 'Digital', warranty: '6 أشهر', group_name: 'أجهزة قياس' },
];

const HX_DEMO_ORDERS: HxOrder[] = [
  { id: 1, order_number: 'HX-10001', product_name: 'دونجل UMT', product_id: 1, customer_id: 1, customer_name: 'أحمد محمد', customer_email: 'ahmed@test.com', customer_phone: '+966501234567', quantity: 1, unit_price: 85, total_price: 85, shipping_cost: 15, total_with_shipping: 100, status: 'delivered', payment_method: 'bank_transfer', payment_status: 'paid', tracking_number: 'SA123456789', currency: 'USD', created_at: '2026-02-15T10:00:00Z', completed_at: '2026-02-17T14:00:00Z', shipping_address: { fullName: 'أحمد محمد', phone: '+966501234567', country: 'السعودية', city: 'الرياض', area: 'العليا', street: 'شارع الأمير محمد', building: 'مبنى 5', postalCode: '12345' } },
  { id: 2, order_number: 'HX-10002', product_name: 'بوكس أوكتوبوس', product_id: 2, customer_id: 2, customer_name: 'عمر خالد', customer_email: 'omar@test.com', customer_phone: '+971501234567', quantity: 1, unit_price: 220, total_price: 220, shipping_cost: 25, total_with_shipping: 245, status: 'shipped', payment_method: 'paypal', payment_status: 'paid', tracking_number: 'AE987654321', currency: 'USD', created_at: '2026-02-16T12:00:00Z', shipping_address: { fullName: 'عمر خالد', phone: '+971501234567', country: 'الإمارات', city: 'دبي', area: 'ديرة', street: 'شارع المكتوم' } },
  { id: 3, order_number: 'HX-10003', product_name: 'ايزي جيتاج بلس', product_id: 5, customer_id: 3, customer_name: 'يوسف سعيد', customer_email: 'yousef@test.com', quantity: 1, unit_price: 350, total_price: 350, shipping_cost: 20, total_with_shipping: 370, status: 'processing', payment_method: 'usdt', payment_status: 'pending', currency: 'USD', created_at: '2026-02-17T08:00:00Z', shipping_address: { fullName: 'يوسف سعيد', phone: '+20101234567', country: 'مصر', city: 'القاهرة', area: 'مدينة نصر', street: 'شارع مصطفى النحاس' } },
  { id: 4, order_number: 'HX-10004', product_name: 'محطة هواء ساخن', product_id: 7, customer_id: 1, customer_name: 'أحمد محمد', quantity: 2, unit_price: 120, total_price: 240, shipping_cost: 30, total_with_shipping: 270, status: 'processing', payment_method: 'bank_transfer', payment_status: 'paid', currency: 'USD', created_at: '2026-02-18T09:00:00Z', shipping_address: { fullName: 'أحمد محمد', phone: '+966501234567', country: 'السعودية', city: 'جدة', area: 'البلد', street: 'شارع فلسطين' } },
];

const HX_DEMO_CUSTOMERS: HxCustomer[] = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@test.com', phone: '+966501234567', country: 'السعودية', city: 'الرياض', orders_count: 5, total_spent: 650, wallet_balance: 50, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'عمر خالد', email: 'omar@test.com', phone: '+971501234567', country: 'الإمارات', city: 'دبي', orders_count: 3, total_spent: 420, wallet_balance: 0, created_at: '2026-01-10T00:00:00Z' },
  { id: 3, name: 'يوسف سعيد', email: 'yousef@test.com', phone: '+20101234567', country: 'مصر', city: 'القاهرة', orders_count: 2, total_spent: 380, wallet_balance: 20, created_at: '2026-01-15T00:00:00Z' },
  { id: 4, name: 'محمد علي', email: 'ali@test.com', phone: '+962791234567', country: 'الأردن', city: 'عمان', orders_count: 1, total_spent: 85, wallet_balance: 0, created_at: '2026-02-01T00:00:00Z' },
];

const HX_DEMO_DELIVERY_ZONES: HxDeliveryZone[] = [
  { id: 1, country: 'السعودية', country_code: 'SA', is_enabled: true, base_shipping_cost: 15, currency: 'USD', estimated_days: '3-5', regions: [
    { id: 1, name: 'الرياض', extra_cost: 0, is_enabled: true },
    { id: 2, name: 'جدة', extra_cost: 5, is_enabled: true },
    { id: 3, name: 'الدمام', extra_cost: 5, is_enabled: true },
    { id: 4, name: 'المدينة المنورة', extra_cost: 8, is_enabled: true },
  ]},
  { id: 2, country: 'الإمارات', country_code: 'AE', is_enabled: true, base_shipping_cost: 25, currency: 'USD', estimated_days: '5-7', regions: [
    { id: 5, name: 'دبي', extra_cost: 0, is_enabled: true },
    { id: 6, name: 'أبوظبي', extra_cost: 5, is_enabled: true },
    { id: 7, name: 'الشارقة', extra_cost: 3, is_enabled: true },
  ]},
  { id: 3, country: 'مصر', country_code: 'EG', is_enabled: true, base_shipping_cost: 20, currency: 'USD', estimated_days: '5-10', regions: [
    { id: 8, name: 'القاهرة', extra_cost: 0, is_enabled: true },
    { id: 9, name: 'الإسكندرية', extra_cost: 5, is_enabled: true },
    { id: 10, name: 'الجيزة', extra_cost: 3, is_enabled: true },
  ]},
  { id: 4, country: 'الأردن', country_code: 'JO', is_enabled: true, base_shipping_cost: 22, currency: 'USD', estimated_days: '5-8', regions: [
    { id: 11, name: 'عمان', extra_cost: 0, is_enabled: true },
    { id: 12, name: 'إربد', extra_cost: 5, is_enabled: true },
  ]},
  { id: 5, country: 'العراق', country_code: 'IQ', is_enabled: true, base_shipping_cost: 30, currency: 'USD', estimated_days: '7-14', regions: [
    { id: 13, name: 'بغداد', extra_cost: 0, is_enabled: true },
    { id: 14, name: 'أربيل', extra_cost: 5, is_enabled: true },
    { id: 15, name: 'البصرة', extra_cost: 8, is_enabled: true },
  ]},
];

const HX_DEMO_CURRENCIES: HxCurrency[] = [
  { id: 1, code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 1, is_default: true },
  { id: 2, code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 3.75, is_default: false },
  { id: 3, code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 3.67, is_default: false },
  { id: 4, code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 50.5, is_default: false },
  { id: 5, code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع', rate: 1310, is_default: false },
  { id: 6, code: 'JOD', name: 'دينار أردني', symbol: 'د.أ', rate: 0.71, is_default: false },
];

const HX_DEMO_GATEWAYS: HxPaymentGateway[] = [
  { id: 1, site_key: 'demo', type: 'bank_transfer', name: 'تحويل بنكي', name_en: 'Bank Transfer', is_enabled: true, is_default: true, config: { bank_name: 'بنك الراجحي', account_number: '1234567890', iban: 'SA1234567890' }, display_order: 1 },
  { id: 2, site_key: 'demo', type: 'paypal', name: 'باي بال', name_en: 'PayPal', is_enabled: true, is_default: false, config: { email: 'pay@store.com' }, display_order: 2 },
  { id: 3, site_key: 'demo', type: 'usdt', name: 'USDT (TRC20)', name_en: 'USDT Crypto', is_enabled: true, is_default: false, config: { wallet: 'TRC20_WALLET_ADDRESS' }, display_order: 3 },
  { id: 4, site_key: 'demo', type: 'cod', name: 'الدفع عند الاستلام', name_en: 'Cash on Delivery', is_enabled: true, is_default: false, config: {}, display_order: 4 },
];

const HX_DEMO_BANNERS: HxBanner[] = [
  { id: '1', title: 'أحدث أدوات الصيانة', subtitle: 'اكتشف مجموعتنا الجديدة من البوكسات والدونجلات الاحترافية', image: '', link: '/products', gradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' },
  { id: '2', title: 'عروض خاصة على JTAG', subtitle: 'خصم يصل إلى 20% على أدوات JTAG - لفترة محدودة', image: '', link: '/products?cat=جيتاج', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' },
  { id: '3', title: 'توصيل سريع لجميع الدول', subtitle: 'نوصل لأكثر من 15 دولة عربية مع خدمة التتبع', image: '', link: '/products', gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' },
];

const HX_DEMO_STATS = {
  stats: [
    { key: 'sales', label: 'إجمالي المبيعات', value: '$12,450', change: 18, positive: true, icon: 'dollar-sign', color: '#10b981', bg: '#ecfdf5' },
    { key: 'orders', label: 'الطلبات', value: '156', change: 12, positive: true, icon: 'shopping-bag', color: '#3b82f6', bg: '#eff6ff' },
    { key: 'customers', label: 'العملاء', value: '89', change: 8, positive: true, icon: 'users', color: '#8b5cf6', bg: '#f5f3ff' },
    { key: 'products', label: 'المنتجات', value: '42', change: 3, positive: true, icon: 'package', color: '#f59e0b', bg: '#fffbeb' },
  ],
  recentOrders: HX_DEMO_ORDERS.slice(0, 5),
  topProducts: HX_DEMO_PRODUCTS.slice(0, 5).map(p => ({ name: p.arabic_name || p.name, sales: p.sales || 0, revenue: `$${(p.sales || 0) * Number(p.price)}` })),
};

// ─── Demo response router ───
export function getHxDemoResponse(endpoint: string, method: string): unknown | null {
  const ep = endpoint.replace(/^\/api/, '');

  // Dashboard
  if (ep === '/dashboard/stats') return HX_DEMO_STATS;

  // Products
  if ((ep === '/products' || ep === '/products/public') && method === 'GET') return { products: HX_DEMO_PRODUCTS };
  if (ep === '/products/store' && method === 'GET') return { products: HX_DEMO_PRODUCTS.filter(p => p.status === 'active') };
  if (ep.match(/^\/products\/(public\/)?\d+$/) && method === 'GET') {
    const id = Number(ep.split('/')[2]);
    return { product: HX_DEMO_PRODUCTS.find(p => p.id === id) || HX_DEMO_PRODUCTS[0] };
  }
  if (ep === '/products/categories') return { categories: ['دونجل', 'بوكس', 'جيتاج', 'أدوات اللحام', 'رقائق', 'كابلات', 'أجهزة قياس'] };

  // Orders
  if (ep === '/orders' && method === 'GET') return { orders: HX_DEMO_ORDERS };
  if (ep === '/orders/my-orders') return { orders: HX_DEMO_ORDERS.slice(0, 2) };

  // Customers
  if (ep.startsWith('/customers') && method === 'GET') return { customers: HX_DEMO_CUSTOMERS, total: HX_DEMO_CUSTOMERS.length };
  if (ep === '/customers/login' && method === 'POST') return { token: 'demo_token_123', customer: HX_DEMO_CUSTOMERS[0] };
  if (ep === '/customers/register' && method === 'POST') return { token: 'demo_token_new', customer: { ...HX_DEMO_CUSTOMERS[0], id: 99 } };
  if (ep === '/customers/profile') return { customer: HX_DEMO_CUSTOMERS[0] };

  // Payment gateways
  if (ep === '/payment-gateways' || ep === '/payment-gateways/active') return { gateways: HX_DEMO_GATEWAYS };

  // Customization
  if (ep === '/customization' || ep === '/customization/store') return {
    customization: {
      theme_id: 'tech-blue',
      store_name: 'HX Tools',
      store_name_en: 'HX Tools Store',
      logo_url: null,
      dark_mode: false,
      button_radius: '12',
      header_style: 'default',
      show_banner: true,
      font_family: 'Tajawal',
      language: 'ar',
      support_whatsapp: '+966500000000',
      support_email: 'support@hxtools.com',
      support_telegram: '@hxtools',
    }
  };

  // Notifications/Announcements
  if (ep === '/notifications' || ep === '/notifications/active') return {
    notifications: [
      { id: 1, title: 'وصول شحنة جديدة', content: 'وصلت شحنة جديدة من بوكسات ودونجلات - تسوق الآن!', date: '2026-02-18', active: true },
      { id: 2, title: 'عرض خاص', content: 'خصم 15% على جميع أدوات JTAG لفترة محدودة', date: '2026-02-17', active: true },
    ]
  };

  // Checkout
  if (ep === '/checkout' && method === 'POST') return {
    order: { id: 999, order_number: 'HX-99999', status: 'processing', total_with_shipping: 100 },
    message: 'تم إنشاء الطلب بنجاح'
  };

  // Delivery zones (custom endpoint for this template)
  if (ep === '/delivery-zones') return { zones: HX_DEMO_DELIVERY_ZONES };
  if (ep === '/currencies') return { currencies: HX_DEMO_CURRENCIES };

  // Banners
  if (ep === '/banners') return { banners: HX_DEMO_BANNERS };

  // Sources
  if (ep === '/sources') return { sources: [] };

  // Slug verify
  if (ep.startsWith('/customization/verify-slug/')) return { valid: true };

  return null;
}
