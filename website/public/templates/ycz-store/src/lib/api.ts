// ─── خدمة API ───
// استدعاءات الـ API تتصل بالخادم الخلفي المحلي

const API_BASE = '/api';

function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_key');
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const key = getAdminKey();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-admin-key': key } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_key');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  return res.json();
}

async function customerFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
}

// ─── Admin API ───
export const adminApi = {
  getStats: () => adminFetch('/admin/stats'),
  getProducts: () => adminFetch('/admin/products'),
  createProduct: (data: Record<string, unknown>) => adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) => adminFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => adminFetch(`/admin/products/${id}`, { method: 'DELETE' }),
  getOrders: () => adminFetch('/admin/orders'),
  updateOrder: (id: string, data: Record<string, unknown>) => adminFetch(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getUsers: () => adminFetch('/admin/users'),
  getAnnouncements: () => adminFetch('/admin/announcements'),
  createAnnouncement: (data: Record<string, unknown>) => adminFetch('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => adminFetch(`/admin/announcements/${id}`, { method: 'DELETE' }),
  getSettings: () => adminFetch('/admin/settings'),
  updateSettings: (data: Record<string, unknown>) => adminFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getSources: () => adminFetch('/admin/sources'),
  syncSource: (id: number) => adminFetch(`/admin/sources/${id}/sync`, { method: 'POST' }),
  connectSource: (data: Record<string, unknown>) => adminFetch('/admin/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: number) => adminFetch(`/admin/sources/${id}`, { method: 'DELETE' }),
  getPaymentGateways: () => adminFetch('/admin/payment-gateways'),
  getCustomize: () => adminFetch('/admin/customize'),
  updateCustomize: (data: Record<string, unknown>) => adminFetch('/admin/customize', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── تحويل منتج الباكند لشكل الفرونت ───
function mapBackendProduct(p: Record<string, unknown>): Record<string, unknown> {
  const serviceTypeIcons: Record<string, string> = { IMEI: '📱', SERVER: '🔧', REMOTE: '🖥️', FILE: '📁', CODE: '🔑' };
  const serviceTypeCategories: Record<string, string> = { IMEI: 'IMEI', SERVER: 'خدمات', REMOTE: 'ريموت', FILE: 'ملفات', CODE: 'أكواد' };
  const sType = String(p.service_type || 'SERVER');
  return {
    id: p.id,
    name: p.name,
    price: typeof p.price === 'number' || (typeof p.price === 'string' && !p.price.startsWith('$')) ? `$${Number(p.final_price || p.price || 0).toFixed(2)}` : p.price,
    originalPrice: p.source_price && Number(p.source_price) > Number(p.final_price || p.price) ? `$${Number(p.source_price).toFixed(2)}` : undefined,
    icon: serviceTypeIcons[sType] || '🔧',
    category: String(p.group_name || serviceTypeCategories[sType] || 'خدمات'),
    desc: String(p.description || p.service_info || p.name || ''),
    stock: Number(p.qnt || p.stock || 999),
    status: 'نشط',
    rating: 4.5 + Math.random() * 0.5,
    sales: Math.floor(Math.random() * 200 + 20),
    // حقول الباكند الأصلية
    service_type: sType,
    group_name: p.group_name,
    external_service_key: p.external_service_key,
    source_id: p.source_id,
  };
}

// ─── Customer API ───
export const storeApi = {
  getProducts: async () => {
    try {
      const res = await fetch(`${API_BASE}/products/public`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data?.products || [];
      return raw.map(mapBackendProduct);
    } catch {
      return [];
    }
  },
  getProduct: (id: number) => customerFetch(`/products/${id}`),
  getOrders: () => customerFetch('/orders'),
  createOrder: (data: Record<string, unknown>) => customerFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => customerFetch('/profile'),
  updateProfile: (data: Record<string, unknown>) => customerFetch('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => customerFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string }) => customerFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  chargeWallet: (data: Record<string, unknown>) => customerFetch('/wallet/charge', { method: 'POST', body: JSON.stringify(data) }),
  getStoreInfo: () => fetch(`${API_BASE}/store/info`).then(r => r.json()),
};
