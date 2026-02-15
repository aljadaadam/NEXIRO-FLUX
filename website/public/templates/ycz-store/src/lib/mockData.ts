// ─── بيانات تجريبية ───

import { Product, Order, User, StatsCard, Announcement } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Sigma Plus Activation', price: '$15.00', originalPrice: '$20.00', icon: '🔧', category: 'تفعيلات', badge: 'الأكثر مبيعاً', badgeColor: '#f59e0b', rating: 4.8, sales: 234, desc: 'تفعيل سيغما بلس الجديد لجميع الأجهزة', stock: 100, status: 'نشط' },
  { id: 2, name: 'UnlockTool Credits', price: '$8.50', icon: '🔓', category: 'كريدت', rating: 4.6, sales: 189, desc: 'رصيد أونلوك تول للفتح والتفليش', stock: 50, status: 'نشط' },
  { id: 3, name: 'IMEI Status Check', price: '$2.00', icon: '📱', category: 'IMEI', badge: 'جديد', badgeColor: '#22c55e', rating: 4.9, sales: 512, desc: 'فحص حالة IMEI لجميع الشبكات', stock: 999, status: 'نشط' },
  { id: 4, name: 'PUBG UC 660', price: '$9.99', icon: '🎮', category: 'شحن ألعاب', rating: 4.7, sales: 98, desc: 'شحن 660 يوسي ببجي موبايل', stock: 200, status: 'نشط' },
  { id: 5, name: 'FreeFire Diamonds', price: '$4.99', icon: '💎', category: 'شحن ألعاب', rating: 4.5, sales: 156, desc: 'شحن جواهر فري فاير', stock: 150, status: 'نشط' },
  { id: 6, name: 'Samsung FRP Remove', price: '$12.00', originalPrice: '$18.00', icon: '📲', category: 'خدمات', badge: 'خصم', badgeColor: '#ef4444', rating: 4.4, sales: 67, desc: 'إزالة حساب جوجل سامسونج', stock: 80, status: 'نشط' },
];

export const MOCK_ORDERS: Order[] = [
  { id: '#ORD-1024', product: 'Sigma Plus Activation', status: 'مكتمل', statusColor: '#22c55e', date: '2025-01-15', price: '$15.00', icon: '🔧', customer: 'أحمد محمد', email: 'ahmed@email.com', payment: 'Binance' },
  { id: '#ORD-1023', product: 'UnlockTool Credits', status: 'قيد التنفيذ', statusColor: '#f59e0b', date: '2025-01-14', price: '$8.50', icon: '🔓', customer: 'سارة علي', email: 'sara@email.com', payment: 'PayPal' },
  { id: '#ORD-1022', product: 'IMEI Check', status: 'مكتمل', statusColor: '#22c55e', date: '2025-01-14', price: '$2.00', icon: '📱', customer: 'خالد يوسف', email: 'khaled@email.com', payment: 'USDT' },
  { id: '#ORD-1021', product: 'PUBG UC 660', status: 'ملغي', statusColor: '#ef4444', date: '2025-01-13', price: '$9.99', icon: '🎮', customer: 'فاطمة حسن', email: 'fatma@email.com', payment: 'بنك' },
  { id: '#ORD-1020', product: 'FreeFire Diamonds', status: 'مكتمل', statusColor: '#22c55e', date: '2025-01-13', price: '$4.99', icon: '💎', customer: 'محمد سعيد', email: 'moh@email.com', payment: 'Binance' },
];

export const MOCK_USERS: User[] = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@email.com', role: 'عميل', status: 'نشط', joined: '2024-12-01', orders: 12, spent: '$180' },
  { id: 2, name: 'سارة علي', email: 'sara@email.com', role: 'عميل VIP', status: 'نشط', joined: '2024-11-15', orders: 28, spent: '$420' },
  { id: 3, name: 'خالد يوسف', email: 'khaled@email.com', role: 'عميل', status: 'نشط', joined: '2025-01-01', orders: 3, spent: '$25' },
  { id: 4, name: 'فاطمة حسن', email: 'fatma@email.com', role: 'عميل', status: 'معلّق', joined: '2024-10-20', orders: 7, spent: '$95' },
  { id: 5, name: 'محمد سعيد', email: 'moh@email.com', role: 'عميل', status: 'نشط', joined: '2024-09-05', orders: 15, spent: '$210' },
];

export const MOCK_STATS: StatsCard[] = [
  { label: 'إجمالي المبيعات', value: '$12,450', change: '+18%', positive: true, icon: '💰', color: '#7c5cff', bg: '#f5f3ff' },
  { label: 'الطلبات', value: '1,234', change: '+12%', positive: true, icon: '📦', color: '#0ea5e9', bg: '#eff6ff' },
  { label: 'المستخدمين', value: '856', change: '+8%', positive: true, icon: '👥', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'معدل الإكمال', value: '94.2%', change: '-2%', positive: false, icon: '📊', color: '#f59e0b', bg: '#fffbeb' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: '🎉 إطلاق خدمات جديدة', content: 'تم إضافة خدمات فتح شبكات جديدة لهواتف Samsung و iPhone. استكشف الخدمات الآن!', date: '2025-01-15', active: true },
  { id: 2, title: '🔧 صيانة مجدولة', content: 'سيتم إجراء صيانة للخوادم يوم الجمعة من الساعة 2-4 صباحاً بتوقيت مكة المكرمة.', date: '2025-01-12', active: true },
  { id: 3, title: '💰 عروض نهاية الشهر', content: 'خصم 20% على جميع خدمات IMEI حتى نهاية الشهر. استخدم كوبون IMEI20.', date: '2025-01-10', active: false },
];

export const MOCK_CHART_DATA = [
  { month: 'يناير', value: 1200 }, { month: 'فبراير', value: 1900 },
  { month: 'مارس', value: 1600 }, { month: 'أبريل', value: 2100 },
  { month: 'مايو', value: 1800 }, { month: 'يونيو', value: 2400 },
  { month: 'يوليو', value: 2800 }, { month: 'أغسطس', value: 2200 },
  { month: 'سبتمبر', value: 3100 }, { month: 'أكتوبر', value: 2600 },
  { month: 'نوفمبر', value: 3400 }, { month: 'ديسمبر', value: 3800 },
];

export const STEPS_DATA = [
  { number: '1', title: 'اختر الخدمة', desc: 'تصفح واختر الخدمة المناسبة', icon: '🔍' },
  { number: '2', title: 'أدخل البيانات', desc: 'أدخل المعلومات المطلوبة', icon: '📝' },
  { number: '3', title: 'ادفع بأمان', desc: 'اختر طريقة الدفع المناسبة', icon: '💳' },
  { number: '4', title: 'استلم فوراً', desc: 'احصل على الخدمة خلال دقائق', icon: '✅' },
];

export const FAQ_DATA = [
  { q: 'كم يستغرق تنفيذ الطلب؟', a: 'معظم الخدمات تُنفّذ خلال 1-24 ساعة حسب نوع الخدمة.' },
  { q: 'هل الدفع آمن؟', a: 'نعم، نستخدم بوابات دفع مشفرة ومعتمدة عالمياً.' },
  { q: 'ماذا لو فشل الطلب؟', a: 'يتم استرداد المبلغ كاملاً أو إعادة المحاولة مجاناً.' },
  { q: 'هل يوجد دعم فني؟', a: 'نعم، فريق الدعم متاح 24/7 عبر التذاكر والواتساب.' },
];

export const PAYMENT_METHODS = [
  { id: 'binance', name: 'Binance Pay', icon: '🟡' },
  { id: 'paypal', name: 'PayPal', icon: '🔵' },
  { id: 'bank', name: 'تحويل بنكي', icon: '🏦' },
  { id: 'vodafone', name: 'فودافون كاش', icon: '📱' },
];
