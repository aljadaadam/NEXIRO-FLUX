// ─── بيانات تجريبية — متجر سيارات ───
import { Car, Branch, Order, DashboardStats } from './types';

const demoCars: Car[] = [
  {
    id: 1, name: 'مرسيدس بنز S-Class 2024', name_en: 'Mercedes-Benz S-Class 2024',
    brand: 'Mercedes-Benz', model: 'S 500', year: 2024, price: 450000, original_price: 495000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أسود ميتاليك',
    engine: 'V8 4.0L Twin Turbo', horsepower: 496, seats: 5,
    description: 'مرسيدس S-Class الفئة الفاخرة مع باقة AMG الرياضية وتقنيات القيادة الذاتية',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'], is_featured: true, category: 'سيدان'
  },
  {
    id: 2, name: 'بي ام دبليو X7 2024', name_en: 'BMW X7 2024',
    brand: 'BMW', model: 'X7 xDrive40i', year: 2024, price: 380000, original_price: 420000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أبيض لؤلؤي',
    engine: 'I6 3.0L Turbo', horsepower: 375, seats: 7,
    description: 'بي ام دبليو X7 الفاخرة مع مقصورة فسيحة وتقنيات متطورة',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'], is_featured: true, category: 'SUV'
  },
  {
    id: 3, name: 'أودي RS7 2023', name_en: 'Audi RS7 2023',
    brand: 'Audi', model: 'RS7 Sportback', year: 2023, price: 520000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'رمادي نيبلا',
    engine: 'V8 4.0L TFSI', horsepower: 600, seats: 4,
    description: 'أودي RS7 الأداء العالي مع نظام Quattro للدفع الرباعي',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'], is_featured: true, category: 'سبورت'
  },
  {
    id: 4, name: 'تويوتا كامري 2023', name_en: 'Toyota Camry 2023',
    brand: 'Toyota', model: 'Camry Grande', year: 2023, price: 135000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'فضي',
    engine: 'V6 3.5L', horsepower: 301, seats: 5,
    description: 'تويوتا كامري الموثوقة مع محرك V6 قوي واقتصادية في استهلاك الوقود',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'], category: 'سيدان'
  },
  {
    id: 5, name: 'رينج روفر سبورت 2022', name_en: 'Range Rover Sport 2022',
    brand: 'Land Rover', model: 'Sport HSE', year: 2022, price: 295000, original_price: 350000,
    condition: 'used', mileage: 25000, fuel_type: 'ديزل', transmission: 'أوتوماتيك', color: 'أخضر بريطاني',
    engine: 'V6 3.0L Diesel', horsepower: 300, seats: 5,
    description: 'رينج روفر سبورت مستعملة بحالة ممتازة مع تاريخ صيانة كامل عند الوكيل',
    images: ['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800'], category: 'SUV'
  },
  {
    id: 6, name: 'بورش 911 كاريرا 2023', name_en: 'Porsche 911 Carrera 2023',
    brand: 'Porsche', model: '911 Carrera S', year: 2023, price: 680000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك PDK', color: 'أحمر جارنيت',
    engine: 'H6 3.0L Twin Turbo', horsepower: 443, seats: 4,
    description: 'بورش 911 كاريرا S الأيقونية مع ناقل PDK ونظام PASM الرياضي',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'], is_featured: true, category: 'سبورت'
  },
  {
    id: 7, name: 'لكزس LX 600 2024', name_en: 'Lexus LX 600 2024',
    brand: 'Lexus', model: 'LX 600 Prestige', year: 2024, price: 410000,
    condition: 'new', fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أبيض سوني كوارتز',
    engine: 'V6 3.5L Twin Turbo', horsepower: 409, seats: 7,
    description: 'لكزس LX 600 الفاخرة مع تصميم جديد كلياً وتقنيات متقدمة',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0637?w=800'], category: 'SUV'
  },
  {
    id: 8, name: 'هيونداي توسان 2022', name_en: 'Hyundai Tucson 2022',
    brand: 'Hyundai', model: 'Tucson Limited', year: 2022, price: 95000, original_price: 115000,
    condition: 'used', mileage: 35000, fuel_type: 'بنزين', transmission: 'أوتوماتيك', color: 'أزرق',
    engine: 'I4 2.5L', horsepower: 187, seats: 5,
    description: 'هيونداي توسان بتصميمها الجريء والعصري بحالة ممتازة',
    images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'], category: 'SUV'
  },
];

const demoBranches: Branch[] = [
  {
    id: 1, name: 'الفرع الرئيسي — الرياض', name_en: 'Main Branch — Riyadh',
    address: 'طريق الملك فهد، حي العليا، الرياض', address_en: 'King Fahd Road, Olaya District, Riyadh',
    city: 'الرياض', phone: '+966 11 234 5678', email: 'riyadh@autozone.sa',
    lat: 24.7136, lng: 46.6753, working_hours: '٩ ص — ١٠ م', is_main: true,
    image: 'https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=800'
  },
  {
    id: 2, name: 'فرع جدة', name_en: 'Jeddah Branch',
    address: 'طريق الأمير سلطان، حي الروضة، جدة', address_en: 'Prince Sultan Road, Al Rawdah, Jeddah',
    city: 'جدة', phone: '+966 12 678 9012', email: 'jeddah@autozone.sa',
    lat: 21.5433, lng: 39.1728, working_hours: '٩ ص — ١١ م', is_main: false,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800'
  },
  {
    id: 3, name: 'فرع الدمام', name_en: 'Dammam Branch',
    address: 'طريق الملك سعود، حي الشاطئ، الدمام', address_en: 'King Saud Road, Al Shati, Dammam',
    city: 'الدمام', phone: '+966 13 456 7890', email: 'dammam@autozone.sa',
    lat: 26.3927, lng: 49.9777, working_hours: '١٠ ص — ١٠ م', is_main: false,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'
  },
];

const demoOrders: Order[] = [
  { id: 1, customer_name: 'خالد العتيبي', customer_phone: '+966 50 123 4567', car_id: 1, car_name: 'مرسيدس بنز S-Class 2024', status: 'pending', total_price: 450000, created_at: '2025-02-15' },
  { id: 2, customer_name: 'محمد الشمري', customer_phone: '+966 55 987 6543', car_id: 3, car_name: 'أودي RS7 2023', status: 'confirmed', total_price: 520000, created_at: '2025-02-14' },
  { id: 3, customer_name: 'سارة القحطاني', customer_phone: '+966 54 111 2222', car_id: 5, car_name: 'رينج روفر سبورت 2022', status: 'completed', total_price: 295000, created_at: '2025-02-10' },
  { id: 4, customer_name: 'فهد الدوسري', customer_phone: '+966 50 333 4444', car_id: 4, car_name: 'تويوتا كامري 2023', status: 'pending', total_price: 135000, created_at: '2025-02-16' },
];

const demoStats: DashboardStats = {
  total_cars: 8, new_cars: 6, used_cars: 2,
  total_orders: 4, pending_orders: 2,
  total_customers: 156, total_revenue: 1400000, featured_cars: 4,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDemoResponse(endpoint: string, method: string): any {
  const e = endpoint.replace(/\?.*$/, '');
  if (method === 'GET') {
    if (e === '/products' || e === '/products/') return { products: demoCars };
    if (e.match(/^\/products\/\d+$/)) {
      const id = parseInt(e.split('/').pop()!);
      return { product: demoCars.find(c => c.id === id) || demoCars[0] };
    }
    if (e === '/branches' || e === '/branches/') return { branches: demoBranches };
    if (e.match(/^\/branches\/\d+$/)) {
      const id = parseInt(e.split('/').pop()!);
      return { branch: demoBranches.find(b => b.id === id) || demoBranches[0] };
    }
    if (e === '/orders' || e === '/orders/') return { orders: demoOrders };
    if (e === '/dashboard/stats') return demoStats;
    if (e === '/customers') return { customers: [
      { id: 1, name: 'خالد العتيبي', email: 'khaled@example.com', phone: '+966501234567', created_at: '2025-01-01' },
      { id: 2, name: 'محمد الشمري', email: 'mohamed@example.com', phone: '+966559876543', created_at: '2025-01-15' },
      { id: 3, name: 'سارة القحطاني', email: 'sarah@example.com', phone: '+966541112222', created_at: '2025-02-01' },
    ]};
    if (e === '/customization/store' || e === '/customization') return { customization: {} };
    if (e === '/settings') return { settings: {} };
  }
  if (method === 'POST') {
    if (e === '/orders') return { order: { id: 99, status: 'pending' }, message: 'تم إرسال الطلب' };
    if (e === '/products') return { product: { id: 99 }, message: 'تم إضافة السيارة' };
    if (e === '/branches') return { branch: { id: 99 }, message: 'تم إضافة الفرع' };
    if (e === '/auth/login') return { token: 'demo-admin-token', user: { id: 1, username: 'admin', role: 'admin' } };
    if (e === '/auth/customer/login') return { token: 'demo-customer-token' };
    if (e === '/auth/customer/register') return { token: 'demo-customer-token' };
  }
  if (method === 'PUT') {
    return { message: 'تم التحديث' };
  }
  if (method === 'DELETE') {
    return { message: 'تم الحذف' };
  }
  return null;
}
