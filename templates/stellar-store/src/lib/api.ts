import type { Product, ProductField } from './types';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Windows 11 Pro', arabic_name: 'تفعيل ويندوز 11 برو', price: 25000, category: 'تفعيلات', group_name: 'تفعيلات', image: '/images/windows.png', status: 'active', qnt: 50, custom_fields: [] },
  { id: 2, name: 'Office 365', arabic_name: 'تفعيل أوفيس 365', price: 35000, category: 'تفعيلات', group_name: 'تفعيلات', image: '/images/office.png', status: 'active', qnt: 30, custom_fields: [] },
  { id: 3, name: 'PUBG 660 UC', arabic_name: 'شحن PUBG 660 UC', price: 18000, category: 'ألعاب', group_name: 'ألعاب', image: '/images/pubg.jpg', status: 'active', qnt: 100, custom_fields: [{ name: 'player_id', label: 'Player ID', required: true, type: 'text' }] },
  { id: 4, name: 'Free Fire 1080', arabic_name: 'شحن فري فاير 1080 جوهرة', price: 15000, category: 'ألعاب', group_name: 'ألعاب', image: '/images/freefire.jpg', status: 'active', qnt: 80, custom_fields: [{ name: 'player_id', label: 'Player ID', required: true, type: 'text' }] },
  { id: 5, name: 'PlayStation $10', arabic_name: 'بطاقة PlayStation $10', price: 22000, category: 'ألعاب', group_name: 'ألعاب', image: '/images/playstation.jpg', status: 'active', qnt: 40, custom_fields: [{ name: 'psn_email', label: 'البريد الإلكتروني PSN', required: true, type: 'email' }] },
  { id: 6, name: 'beIN Monthly', arabic_name: 'اشتراك beIN شهري', price: 45000, category: 'اشتراكات', group_name: 'اشتراكات', image: '/images/bein.jpg', status: 'active', qnt: 15, custom_fields: [{ name: 'email', label: 'البريد الإلكتروني', required: true, type: 'email' }] },
  { id: 7, name: 'Netflix Month', arabic_name: 'نتفلكس شهر', price: 12000, category: 'اشتراكات', group_name: 'اشتراكات', image: '/images/netflix.jpg', status: 'active', qnt: 25, custom_fields: [{ name: 'email', label: 'البريد الإلكتروني', required: true, type: 'email' }] },
  { id: 8, name: 'Spotify Premium', arabic_name: 'سبوتيفاي بريميوم', price: 8000, category: 'اشتراكات', group_name: 'اشتراكات', image: '/images/spotify.jpg', status: 'active', qnt: 60, custom_fields: [{ name: 'email', label: 'البريد الإلكتروني', required: true, type: 'email' }] },
  { id: 9, name: 'Starlink Kit', arabic_name: 'ستارلينك', price: 380000, category: 'ستارلينك', group_name: 'ستارلينك', image: '/images/starlink-default.png', status: 'active', qnt: 5, custom_fields: [{ name: 'address', label: 'العنوان', required: true, type: 'text' }, { name: 'phone', label: 'رقم الهاتف', required: true, type: 'tel' }] },
];

const DEMO_STATS = { totalProducts: 9, totalOrders: 156, totalRevenue: 2450000, totalCustomers: 89 };

const DEMO_CUSTOMERS = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+249912345678', wallet_balance: 500000, country: 'السودان', status: 'active', joined: '2026-01-15T10:00:00Z', last_login_at: '2026-03-13T08:30:00Z' },
  { id: 2, name: 'سارة علي', email: 'sara@example.com', phone: '+249923456789', wallet_balance: 120000, country: 'السودان', status: 'active', joined: '2026-02-01T14:00:00Z', last_login_at: '2026-03-12T16:45:00Z' },
  { id: 3, name: 'محمد خالد', email: 'moh@example.com', phone: '+249934567890', wallet_balance: 75000, country: 'مصر', status: 'active', joined: '2026-02-10T09:00:00Z', last_login_at: '2026-03-11T12:00:00Z' },
  { id: 4, name: 'فاطمة حسن', email: 'fatima@example.com', phone: '+249945678901', wallet_balance: 250000, country: 'السودان', status: 'active', joined: '2026-01-20T18:00:00Z', last_login_at: '2026-03-13T07:15:00Z' },
  { id: 5, name: 'عمر يوسف', email: 'omar@example.com', phone: '+249956789012', wallet_balance: 0, country: 'السعودية', status: 'blocked', joined: '2026-03-01T11:00:00Z', last_login_at: '2026-03-05T14:30:00Z' },
];

const DEMO_ADMIN_ORDERS = [
  { id: 101, order_number: 'ORD-2026-001', product_name: 'تفعيل ويندوز 11 برو', customer_name: 'أحمد محمد', customer_email: 'ahmed@example.com', quantity: 1, total_price: 25000, status: 'completed', payment_method: 'wallet', notes: '', response: 'XXXX-XXXX-XXXX-XXXX', server_response: 'XXXX-XXXX-XXXX-XXXX', created_at: '2026-03-10T14:30:00Z' },
  { id: 102, order_number: 'ORD-2026-002', product_name: 'شحن PUBG 660 UC', customer_name: 'سارة علي', customer_email: 'sara@example.com', quantity: 1, total_price: 18000, status: 'processing', payment_method: 'wallet', notes: 'Player ID: 51234567', response: '', server_response: '', created_at: '2026-03-12T09:15:00Z' },
  { id: 103, order_number: 'ORD-2026-003', product_name: 'اشتراك beIN شهري', customer_name: 'محمد خالد', customer_email: 'moh@example.com', quantity: 1, total_price: 45000, status: 'completed', payment_method: 'wallet', notes: '', response: 'تم تفعيل الاشتراك بنجاح', server_response: 'تم تفعيل الاشتراك بنجاح', created_at: '2026-03-08T18:00:00Z' },
  { id: 104, order_number: 'ORD-2026-004', product_name: 'تفعيل أوفيس 365', customer_name: 'فاطمة حسن', customer_email: 'fatima@example.com', quantity: 1, total_price: 35000, status: 'pending', payment_method: 'wallet', notes: '', response: '', server_response: '', created_at: '2026-03-13T06:00:00Z' },
  { id: 105, order_number: 'ORD-2026-005', product_name: 'نتفلكس شهر', customer_name: 'أحمد محمد', customer_email: 'ahmed@example.com', quantity: 1, total_price: 12000, status: 'completed', payment_method: 'wallet', notes: '', response: 'email: demo@netflix.com', server_response: 'email: demo@netflix.com', created_at: '2026-03-07T20:00:00Z' },
  { id: 106, order_number: 'ORD-2026-006', product_name: 'سبوتيفاي بريميوم', customer_name: 'سارة علي', customer_email: 'sara@example.com', quantity: 1, total_price: 8000, status: 'cancelled', payment_method: 'wallet', notes: '', response: '', server_response: '', created_at: '2026-03-06T15:30:00Z' },
];

const DEMO_PAYMENTS = [
  { id: 1, customer_name: 'أحمد محمد', customer_email: 'ahmed@example.com', amount: 500000, type: 'deposit', status: 'completed', payment_method: 'بنكك', reference: 'PAY-001', created_at: '2026-01-15T10:30:00Z' },
  { id: 2, customer_name: 'سارة علي', customer_email: 'sara@example.com', amount: 200000, type: 'deposit', status: 'completed', payment_method: 'بنكك', reference: 'PAY-002', created_at: '2026-02-01T14:30:00Z' },
  { id: 3, customer_name: 'محمد خالد', customer_email: 'moh@example.com', amount: 100000, type: 'deposit', status: 'pending', payment_method: 'تحويل بنكي', reference: 'PAY-003', created_at: '2026-03-11T12:30:00Z' },
  { id: 4, customer_name: 'فاطمة حسن', customer_email: 'fatima@example.com', amount: 250000, type: 'deposit', status: 'completed', payment_method: 'بنكك', reference: 'PAY-004', created_at: '2026-01-20T18:30:00Z' },
];

const DEMO_NOTIFICATIONS = [
  { id: 1, title: 'مرحباً بكم في متجر ستيلار', message: 'نرحب بكم في متجرنا الإلكتروني. تصفحوا منتجاتنا واستمتعوا بأفضل الأسعار!', type: 'info', created_at: '2026-03-01T10:00:00Z' },
  { id: 2, title: 'عرض خاص على التفعيلات', message: 'خصم 20% على جميع تفعيلات ويندوز وأوفيس لفترة محدودة.', type: 'success', created_at: '2026-03-10T12:00:00Z' },
  { id: 3, title: 'صيانة مجدولة', message: 'سيتم إجراء صيانة للسيرفر يوم الجمعة من الساعة 2-4 صباحاً.', type: 'warning', created_at: '2026-03-12T15:00:00Z' },
];

const DEMO_GATEWAYS = [
  { id: 1, name: 'بنكك - بنك الخرطوم', type: 'bankak', is_enabled: true, logo: 'https://6990ab01681c79fa0bccfe99.imgix.net/bank.png', config: { account_number: '2490912345678', full_name: 'محمد أحمد عبدالله', receipt_note: 'يرجى كتابة اسمك في خانة الملاحظات عند التحويل' }, created_at: '2026-03-01T10:00:00Z' },
];

function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('demo_mode') === '1';
}

async function adminFetch(endpoint: string, options: RequestInit = {}) {
  if (isDemoMode()) {
    return getDemoResponse(endpoint, options.method || 'GET');
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_key');
    }
    throw new Error('غير مصرح - يرجى تسجيل الدخول');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || `خطأ ${res.status}`);
  }

  return res.json();
}

function getDemoResponse(endpoint: string, method: string) {
  if (endpoint.includes('/dashboard/stats')) return Promise.resolve(DEMO_STATS);
  if (endpoint.includes('/products') && method === 'GET') return Promise.resolve(DEMO_PRODUCTS);
  if (endpoint.includes('/orders') && method === 'GET') return Promise.resolve({ orders: DEMO_ADMIN_ORDERS, stats: { total: 6, completed: 3, processing: 1, pending: 1, cancelled: 1 } });
  if (endpoint.includes('/customers') && method === 'GET') return Promise.resolve({ customers: DEMO_CUSTOMERS, total: DEMO_CUSTOMERS.length });
  if (endpoint.includes('/payments') && method === 'GET') return Promise.resolve({ payments: DEMO_PAYMENTS });
  if (endpoint.includes('/notifications') && method === 'GET') return Promise.resolve({ notifications: DEMO_NOTIFICATIONS, unreadCount: 1 });
  if (endpoint.includes('/payment-gateways') && method === 'GET') return Promise.resolve({ gateways: DEMO_GATEWAYS });
  if (endpoint.includes('/payment-gateways') && (method === 'POST' || method === 'PUT' || method === 'PATCH')) return Promise.resolve({ gateway: { ...DEMO_GATEWAYS[0], id: Date.now() }, success: true, message: 'تم بنجاح (وضع تجريبي)' });
  if (endpoint.includes('/customization') && method === 'GET') return Promise.resolve({ customization: { store_name: 'متجر ستيلار', store_description: 'متجر تفعيلات وألعاب وخدمات رقمية', primary_color: '#f5a623', secondary_color: '#d4911e', font_family: 'Tajawal', store_language: 'ar' } });
  if (method === 'POST') return Promise.resolve({ id: Date.now(), success: true });
  if (method === 'PUT') return Promise.resolve({ success: true });
  if (method === 'PATCH') return Promise.resolve({ success: true });
  if (method === 'DELETE') return Promise.resolve({ success: true });
  return Promise.resolve({});
}

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    adminFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Dashboard
  getStats: () => adminFetch('/dashboard/stats'),

  // Products
  getProducts: () => adminFetch('/products'),
  createProduct: (data: Record<string, unknown>) =>
    adminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) =>
    adminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    adminFetch(`/products/${id}`, { method: 'DELETE' }),

  // Categories (via products groups)
  renameGroup: (oldName: string, newName: string) =>
    adminFetch('/products/groups/rename', { method: 'PUT', body: JSON.stringify({ oldName, newName }) }),
  deleteGroup: (name: string) =>
    adminFetch(`/products/groups/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  // Image upload (base64)
  uploadImage: (base64: string) =>
    adminFetch('/upload/image', { method: 'POST', body: JSON.stringify({ image: base64 }) }),

  // Orders
  getOrders: (page = 1, limit = 50, status?: string) =>
    adminFetch(`/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  updateOrderStatus: (id: number, data: { status: string; server_response?: string }) =>
    adminFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getOrderStats: () => adminFetch('/orders/stats'),

  // Customers
  getCustomers: (page = 1, limit = 50, search?: string) =>
    adminFetch(`/customers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getCustomerById: (id: number) => adminFetch(`/customers/${id}`),
  toggleBlockCustomer: (id: number, blocked: boolean) =>
    adminFetch(`/customers/${id}/block`, { method: 'PATCH', body: JSON.stringify({ blocked }) }),
  updateCustomerWallet: (id: number, amount: number, reason?: string) =>
    adminFetch(`/customers/${id}/wallet`, { method: 'PATCH', body: JSON.stringify({ amount, reason }) }),

  // Payments
  getPayments: (page = 1, limit = 50) =>
    adminFetch(`/payments?page=${page}&limit=${limit}`),
  updatePaymentStatus: (id: number, status: string) =>
    adminFetch(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Notifications / Announcements
  getNotifications: () => adminFetch('/notifications'),
  createNotification: (data: { title: string; message: string; type?: string; link?: string }) =>
    adminFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  deleteNotification: (id: number) =>
    adminFetch(`/notifications/${id}`, { method: 'DELETE' }),

  // Customization
  getCustomization: () => adminFetch('/customization'),
  updateCustomization: (data: Record<string, unknown>) =>
    adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),

  // Payment Gateways
  getPaymentGateways: () => adminFetch('/payment-gateways'),
  createPaymentGateway: (data: Record<string, unknown>) =>
    adminFetch('/payment-gateways', { method: 'POST', body: JSON.stringify(data) }),
  updatePaymentGateway: (id: number, data: Record<string, unknown>) =>
    adminFetch(`/payment-gateways/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePaymentGateway: (id: number) =>
    adminFetch(`/payment-gateways/${id}`, { method: 'DELETE' }),
  togglePaymentGateway: (id: number) =>
    adminFetch(`/payment-gateways/${id}/toggle`, { method: 'PATCH' }),
};

// ─── Demo Customer Data ───
const DEMO_CUSTOMER = {
  id: 1, name: 'أحمد محمد', email: 'demo@stellar.store',
  phone: '+249912345678', wallet_balance: 500000, country: 'السودان', is_verified: true,
};

const DEMO_ORDERS = [
  { id: 101, order_number: 'ORD-2026-001', product_name: 'تفعيل ويندوز 11 برو', quantity: 1, total_price: 25000, status: 'completed', payment_method: 'wallet', notes: '', response: 'XXXX-XXXX-XXXX-XXXX', created_at: '2026-03-10T14:30:00Z' },
  { id: 102, order_number: 'ORD-2026-002', product_name: 'شحن PUBG 660 UC', quantity: 1, total_price: 18000, status: 'processing', payment_method: 'wallet', notes: 'Player ID: 51234567', response: '', created_at: '2026-03-12T09:15:00Z' },
  { id: 103, order_number: 'ORD-2026-003', product_name: 'اشتراك beIN شهري', quantity: 1, total_price: 45000, status: 'completed', payment_method: 'wallet', notes: '', response: 'تم تفعيل الاشتراك بنجاح', created_at: '2026-03-08T18:00:00Z' },
];

function getDemoCustomerResponse(endpoint: string, method: string, body?: string) {
  const ep = endpoint.replace(/^\//, '');

  if (ep === 'customers/login' && method === 'POST')
    return Promise.resolve({ token: 'demo-token-stellar', customer: DEMO_CUSTOMER });
  if (ep === 'customers/register' && method === 'POST')
    return Promise.resolve({ token: 'demo-token-stellar', customer: DEMO_CUSTOMER });
  if (ep === 'customers/me' && method === 'GET')
    return Promise.resolve({ customer: DEMO_CUSTOMER });
  if (ep === 'customers/me' && method === 'PUT')
    return Promise.resolve({ customer: DEMO_CUSTOMER, message: 'تم التحديث بنجاح' });
  if (ep === 'customers/orders' && method === 'GET')
    return Promise.resolve({ orders: DEMO_ORDERS });
  if (ep === 'customers/orders' && method === 'POST') {
    const parsed = body ? JSON.parse(body) : {};
    const newOrder = {
      id: Date.now(), order_number: `ORD-2026-${String(Date.now()).slice(-3)}`,
      product_name: parsed.product_name || 'منتج تجريبي', quantity: 1,
      total_price: 0, status: 'pending', payment_method: 'wallet',
      notes: parsed.notes || '', response: '', created_at: new Date().toISOString(),
    };
    return Promise.resolve({ order: newOrder, message: 'تم تقديم الطلب بنجاح (وضع تجريبي)' });
  }
  if (ep === 'customers/verify-otp') return Promise.resolve({ token: 'demo-token-stellar', customer: DEMO_CUSTOMER });
  if (ep === 'customers/forgot-password') return Promise.resolve({ message: 'تم إرسال رابط إعادة التعيين (وضع تجريبي)' });
  if (ep.includes('checkout/init') && method === 'POST')
    return Promise.resolve({ payment: { id: Date.now(), status: 'awaiting_receipt' }, gateway: DEMO_GATEWAYS[0], message: 'تم إنشاء طلب الدفع (وضع تجريبي)' });
  if (ep.includes('checkout/receipt') && method === 'POST')
    return Promise.resolve({ success: true, message: 'تم إرسال الإيصال بنجاح (وضع تجريبي)' });

  return Promise.resolve({});
}

// ─── Customer-facing API ───

async function customerFetch(endpoint: string, options: RequestInit = {}) {
  if (isDemoMode()) {
    return getDemoCustomerResponse(endpoint, options.method || 'GET', options.body as string);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${endpoint}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('customer');
      if (res.status === 403) localStorage.setItem('account_blocked', '1');
    }
    throw new Error(res.status === 403 ? 'الحساب محظور' : 'انتهت الجلسة - يرجى تسجيل الدخول');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || `خطأ ${res.status}`);
  }
  return res.json();
}

export const storeApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    customerFetch('/customers/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    customerFetch('/customers/login', { method: 'POST', body: JSON.stringify(data) }),

  verifyOtp: (data: { email: string; code: string }) =>
    customerFetch('/customers/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (email: string) =>
    customerFetch('/customers/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  getProfile: () => customerFetch('/customers/me'),

  updateProfile: (data: Record<string, unknown>) =>
    customerFetch('/customers/me', { method: 'PUT', body: JSON.stringify(data) }),

  getOrders: () => customerFetch('/customers/orders'),

  createOrder: (data: { product_id: number; product_name: string; quantity?: number; payment_method: string; notes?: string }) =>
    customerFetch('/customers/orders', { method: 'POST', body: JSON.stringify(data) }),

  getProducts: () => {
    if (isDemoMode()) return Promise.resolve(DEMO_PRODUCTS);
    return fetch('/api/products/public').then(r => r.ok ? r.json() : []);
  },

  getEnabledGateways: () => {
    if (isDemoMode()) return Promise.resolve(DEMO_GATEWAYS.filter(g => g.is_enabled));
    return fetch('/api/payment-gateways/enabled').then(r => r.ok ? r.json() : []);
  },

  initCheckout: (data: { gateway_id: number; amount: number; type?: string }) =>
    customerFetch('/checkout/init', { method: 'POST', body: JSON.stringify(data) }),

  uploadReceipt: (paymentId: number, data: { receipt_url: string; notes?: string }) =>
    customerFetch(`/checkout/receipt/${paymentId}`, { method: 'POST', body: JSON.stringify(data) }),

  checkPaymentStatus: (paymentId: number) =>
    fetch(`/api/checkout/status/${paymentId}`).then(r => r.ok ? r.json() : null),

  getStoreSettings: () => {
    if (isDemoMode()) return Promise.resolve({ customization: { store_name: 'متجر ستيلار', whatsapp_number: '', telegram_link: '', facebook_link: '', instagram_link: '', support_email: '' } });
    return fetch('/api/customization/store').then(r => r.ok ? r.json() : {});
  },
};

export function mapBackendProduct(p: Record<string, unknown>): Product {
  let custom_fields = p.customFields || p.requires_custom_json || p.custom_fields;
  if (typeof custom_fields === 'string') {
    try { custom_fields = JSON.parse(custom_fields); } catch { custom_fields = []; }
  }
  return {
    id: p.id as number,
    name: (p.arabic_name || p.name) as string,
    arabic_name: p.arabic_name as string,
    price: (p.final_price || p.price) as number,
    description: p.description as string,
    category: (p.group_name || p.category || '') as string,
    group_name: (p.group_name || p.category || '') as string,
    image: (p.image || '/images/default-product.svg') as string,
    status: (p.status || 'active') as string,
    qnt: (p.qnt || 0) as number,
    service_type: p.service_type as string,
    custom_fields: (Array.isArray(custom_fields) ? custom_fields : []) as ProductField[],
    created_at: p.created_at as string,
  };
}
