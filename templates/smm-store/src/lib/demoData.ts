// ─── بيانات العرض التجريبي - SMM Store ───

export const demoSettings = {
  store_name: 'SMM Boost',
  logo_url: null,
  theme_id: 'neon-blue',
  dark_mode: true,
  button_radius: '16',
  header_style: 'glass',
  show_banner: true,
  font_family: 'Tajawal',
  social_links: { whatsapp: '#', telegram: '#', instagram: '#', twitter: '#' },
  custom_css: '',
  footer_text: '',
  product_layout: 'grid',
  flash_enabled: false,
};

const demoProducts = [
  { id: 1, name: 'Instagram Followers', arabic_name: 'متابعين انستغرام', price: 2.99, final_price: 2.99, description: 'متابعين حقيقيين لحسابك على انستغرام', service_type: 'SERVER', group_name: 'انستغرام', qnt: '1', minqnt: 100, maxqnt: 50000, is_featured: 1, sales: 4850, rating: 5 },
  { id: 2, name: 'Instagram Likes', arabic_name: 'لايكات انستغرام', price: 1.99, final_price: 1.99, description: 'لايكات حقيقية لمنشوراتك', service_type: 'SERVER', group_name: 'انستغرام', qnt: '1', minqnt: 50, maxqnt: 20000, is_featured: 1, sales: 3200, rating: 5 },
  { id: 3, name: 'TikTok Followers', arabic_name: 'متابعين تيك توك', price: 3.49, final_price: 3.49, description: 'متابعين حقيقيين لحسابك على تيك توك', service_type: 'SERVER', group_name: 'تيك توك', qnt: '1', minqnt: 100, maxqnt: 100000, is_featured: 1, sales: 5600, rating: 5 },
  { id: 4, name: 'TikTok Views', arabic_name: 'مشاهدات تيك توك', price: 0.99, final_price: 0.99, description: 'مشاهدات حقيقية لفيديوهاتك', service_type: 'SERVER', group_name: 'تيك توك', qnt: '1', minqnt: 500, maxqnt: 1000000, sales: 8200, rating: 4 },
  { id: 5, name: 'YouTube Subscribers', arabic_name: 'اشتراكات يوتيوب', price: 4.99, final_price: 4.99, description: 'مشتركين حقيقيين لقناتك', service_type: 'SERVER', group_name: 'يوتيوب', qnt: '1', minqnt: 50, maxqnt: 10000, is_featured: 1, sales: 2100, rating: 5 },
  { id: 6, name: 'YouTube Views', arabic_name: 'مشاهدات يوتيوب', price: 1.49, final_price: 1.49, description: 'مشاهدات حقيقية لفيديوهاتك', service_type: 'SERVER', group_name: 'يوتيوب', qnt: '1', minqnt: 500, maxqnt: 500000, sales: 6300, rating: 4 },
  { id: 7, name: 'Twitter Followers', arabic_name: 'متابعين تويتر', price: 3.99, final_price: 3.99, description: 'متابعين حقيقيين لحسابك على تويتر', service_type: 'SERVER', group_name: 'تويتر', qnt: '1', minqnt: 100, maxqnt: 20000, sales: 1800, rating: 4 },
  { id: 8, name: 'Facebook Page Likes', arabic_name: 'إعجابات صفحة فيسبوك', price: 2.49, final_price: 2.49, description: 'إعجابات حقيقية لصفحتك', service_type: 'SERVER', group_name: 'فيسبوك', qnt: '1', minqnt: 100, maxqnt: 30000, sales: 3900, rating: 5 },
  { id: 9, name: 'Telegram Members', arabic_name: 'أعضاء تلغرام', price: 1.99, final_price: 1.99, description: 'أعضاء حقيقيين لمجموعتك أو قناتك', service_type: 'SERVER', group_name: 'تلغرام', qnt: '1', minqnt: 100, maxqnt: 50000, sales: 2700, rating: 4 },
  { id: 10, name: 'Snapchat Followers', arabic_name: 'متابعين سناب شات', price: 4.49, final_price: 4.49, description: 'متابعين حقيقيين لحسابك على سناب شات', service_type: 'SERVER', group_name: 'سناب شات', qnt: '1', minqnt: 100, maxqnt: 10000, sales: 1500, rating: 4 },
  { id: 11, name: 'Instagram Reel Views', arabic_name: 'مشاهدات ريلز انستغرام', price: 0.79, final_price: 0.79, description: 'مشاهدات حقيقية لريلز انستغرام', service_type: 'SERVER', group_name: 'انستغرام', qnt: '1', minqnt: 500, maxqnt: 500000, sales: 7100, rating: 5 },
  { id: 12, name: 'Instagram Story Views', arabic_name: 'مشاهدات ستوري انستغرام', price: 0.59, final_price: 0.59, description: 'مشاهدات حقيقية لستوري انستغرام', service_type: 'SERVER', group_name: 'انستغرام', qnt: '1', minqnt: 100, maxqnt: 100000, sales: 4300, rating: 4 },
];

const demoBlogPosts = {
  posts: [
    { id: 1, title: 'كيف تزيد متابعينك على انستغرام', title_en: 'How to Increase Instagram Followers', excerpt: 'نصائح فعّالة لزيادة متابعينك', excerpt_en: 'Effective tips to grow your followers', content: ['محتوى المقال...'], category: 'سوشال ميديا', category_color: '#ec4899', image: '', read_time: 5, views: 1200, is_published: true, published_at: '2026-02-15', created_at: '2026-02-15', updated_at: '2026-02-15' },
    { id: 2, title: 'أفضل أوقات النشر على تيك توك', title_en: 'Best Times to Post on TikTok', excerpt: 'اكتشف أفضل الأوقات للنشر', excerpt_en: 'Discover the best posting times', content: ['محتوى المقال...'], category: 'نصائح', category_color: '#3b82f6', image: '', read_time: 3, views: 800, is_published: true, published_at: '2026-02-20', created_at: '2026-02-20', updated_at: '2026-02-20' },
  ],
};

const demoStats = {
  totalOrders: 12580,
  totalCustomers: 3847,
  totalRevenue: 45890,
  todayOrders: 156,
  pendingOrders: 23,
  completedOrders: 12400,
  todayRevenue: 1250,
};

const demoOrders = {
  orders: [
    { id: 1, order_number: 'SMM-001', product_name: 'متابعين انستغرام', quantity: 1000, unit_price: 2.99, total_price: 2.99, status: 'completed', created_at: '2026-02-28' },
    { id: 2, order_number: 'SMM-002', product_name: 'مشاهدات تيك توك', quantity: 5000, unit_price: 0.99, total_price: 0.99, status: 'processing', created_at: '2026-03-01' },
  ],
};

const demoPayments = {
  payments: [],
  total: 0,
  page: 1,
  pages: 1,
};

export function getDemoResponse(endpoint: string, method: string, _body?: unknown): unknown {
  if (endpoint === '/products/public' && method === 'GET') return { products: demoProducts };
  if (endpoint === '/products' && method === 'GET') return { products: demoProducts };
  if (endpoint === '/dashboard/stats' && method === 'GET') return demoStats;
  if (endpoint === '/dashboard/online-stats' && method === 'GET') return { online: 12, visitors_today: 234 };
  if (endpoint === '/blogs/public' && method === 'GET') return demoBlogPosts;
  if (endpoint.startsWith('/orders') && method === 'GET') return demoOrders;
  if (endpoint.startsWith('/customers') && method === 'GET') return { customers: [], total: 0 };
  if (endpoint.startsWith('/payments') && method === 'GET') return demoPayments;
  if (endpoint === '/customization' && method === 'GET') return { customization: demoSettings };
  if (endpoint === '/customization/store' && method === 'GET') return { customization: demoSettings };
  if (endpoint === '/notifications' && method === 'GET') return { notifications: [] };
  if (endpoint === '/sources' && method === 'GET') return { sources: [] };
  if (endpoint === '/chat' && method === 'GET') return { conversations: [] };
  if (endpoint === '/chat/unread' && method === 'GET') return { count: 0 };
  if (endpoint === '/payment-gateways' && method === 'GET') return { gateways: [] };
  if (endpoint === '/payment-gateways/enabled' && method === 'GET') return { gateways: [] };
  if (endpoint === '/blogs' && method === 'GET') return demoBlogPosts;
  if (endpoint === '/store/info' && method === 'GET') return { store: { name: 'SMM Boost', currency: 'USD' } };
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') return { success: true, message: 'تم بنجاح (عرض تجريبي)' };
  return null;
}
