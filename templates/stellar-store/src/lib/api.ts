const DEMO_PRODUCTS = [
  { id: 1, name: 'Windows 11 Pro', arabic_name: 'تفعيل ويندوز 11 برو', price: 25000, category: 'تفعيلات', group_name: 'تفعيلات', image: '/images/default-product.svg', status: 'active', qnt: 50 },
  { id: 2, name: 'Office 365', arabic_name: 'تفعيل أوفيس 365', price: 35000, category: 'تفعيلات', group_name: 'تفعيلات', image: '/images/default-product.svg', status: 'active', qnt: 30 },
  { id: 3, name: 'Kaspersky', arabic_name: 'تفعيل كاسبرسكي', price: 20000, category: 'تفعيلات', group_name: 'تفعيلات', image: '/images/default-product.svg', status: 'active', qnt: 20 },
  { id: 4, name: 'PUBG 660 UC', arabic_name: 'شحن PUBG 660 UC', price: 18000, category: 'ألعاب', group_name: 'ألعاب', image: '/images/default-product.svg', status: 'active', qnt: 100 },
  { id: 5, name: 'Free Fire 1080', arabic_name: 'شحن فري فاير 1080 جوهرة', price: 15000, category: 'ألعاب', group_name: 'ألعاب', image: '/images/default-product.svg', status: 'active', qnt: 80 },
  { id: 6, name: 'beIN Monthly', arabic_name: 'اشتراك beIN شهري', price: 45000, category: 'beIN Sports', group_name: 'beIN Sports', image: '/images/default-product.svg', status: 'active', qnt: 15 },
];

const DEMO_STATS = { totalProducts: 12, totalOrders: 156, totalRevenue: 2450000, totalCustomers: 89 };

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
  if (endpoint.includes('/orders') && method === 'GET') return Promise.resolve({ orders: [], stats: {} });
  if (endpoint.includes('/customers') && method === 'GET') return Promise.resolve({ customers: [], total: 0 });
  if (endpoint.includes('/payments') && method === 'GET') return Promise.resolve({ payments: [] });
  if (endpoint.includes('/notifications') && method === 'GET') return Promise.resolve({ notifications: [], unreadCount: 0 });
  if (endpoint.includes('/customization') && method === 'GET') return Promise.resolve({ customization: {} });
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

  getProducts: () =>
    fetch('/api/products/public').then(r => r.ok ? r.json() : []),
};

export function mapBackendProduct(p: Record<string, unknown>) {
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
    created_at: p.created_at as string,
  };
}
