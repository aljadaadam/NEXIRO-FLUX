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
  // Admin dashboard stores JWT as 'admin_key', customer profile stores as 'auth_token'
  const token = getAdminKey() || getAuthToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
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
// المسارات تطابق الباك اند: /api/sources, /api/products, /api/orders, إلخ
export const adminApi = {
  getStats: () => adminFetch('/dashboard/stats'),
  getProducts: () => adminFetch('/products'),
  createProduct: (data: Record<string, unknown>) => adminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) => adminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => adminFetch(`/products/${id}`, { method: 'DELETE' }),
  getOrders: () => adminFetch('/orders'),
  updateOrder: (id: string, data: Record<string, unknown>) => adminFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getUsers: () => adminFetch('/customers'),
  getAnnouncements: () => adminFetch('/notifications'),
  createAnnouncement: (data: Record<string, unknown>) => adminFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => adminFetch(`/notifications/${id}`, { method: 'DELETE' }),
  getSettings: () => adminFetch('/customization'),
  updateSettings: (data: Record<string, unknown>) => adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  getSources: () => adminFetch('/sources'),
  syncSource: (id: number) => adminFetch(`/sources/${id}/sync`, { method: 'POST' }),
  testSource: (id: number) => adminFetch(`/sources/${id}/test`, { method: 'POST' }),
  connectSource: (data: Record<string, unknown>) => adminFetch('/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: number) => adminFetch(`/sources/${id}`, { method: 'DELETE' }),
  getPaymentGateways: () => adminFetch('/payment-gateways'),
  getCustomize: () => adminFetch('/customization'),
  updateCustomize: (data: Record<string, unknown>) => adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── تحويل منتج الباكند لشكل الفرونت ───
function mapBackendProduct(p: Record<string, unknown>): Record<string, unknown> {
  type ProductCustomField = { key: string; label: string; placeholder: string; required: boolean };
  const parseMaybeJson = (v: unknown): unknown => {
    if (typeof v !== 'string') return v;
    try { return JSON.parse(v); } catch { return v; }
  };

  const normalizeFieldDef = (field: unknown, index: number): ProductCustomField | null => {
    if (!field) return null;
    if (typeof field === 'string') {
      const key = field.trim();
      if (!key) return null;
      return { key, label: key, placeholder: `أدخل ${key}`, required: true };
    }
    if (typeof field === 'object') {
      const f = field as Record<string, unknown>;
      const label = String(
        f.label ||
        f.fieldname ||
        f.title ||
        f.name ||
        f.key ||
        f.field ||
        f.description ||
        `حقل ${index + 1}`
      ).trim();
      const rawKey = String(f.key || f.fieldname || f.name || f.field || f.id || `field_${index + 1}`).trim();
      const key = rawKey.replace(/\s+/g, '_');
      const requiredValue = f.required;
      const required =
        requiredValue === undefined
          ? true
          : ['1', 'true', 'on', 'yes'].includes(String(requiredValue).toLowerCase());

      return {
        key,
        label,
        placeholder: String(f.placeholder || f.description || `أدخل ${label}`),
        required,
      };
    }
    return null;
  };

  const serviceTypeIcons: Record<string, string> = { IMEI: '📱', SERVER: '🔧', REMOTE: '🖥️', FILE: '📁', CODE: '🔑' };
  const serviceTypeCategories: Record<string, string> = {
    IMEI: 'خدمات IMEI',
    SERVER: 'أدوات سوفتوير',
    REMOTE: 'ريموت',
    FILE: 'ملفات',
    CODE: 'أكواد',
  };
  const sType = String(p.service_type || p.SERVICETYPE || 'SERVER').toUpperCase();
  const requiresCustom = parseMaybeJson(p.requires_custom_json);
  const customJson = parseMaybeJson(p.custom_json);

  const rawFieldList = Array.isArray(requiresCustom)
    ? requiresCustom
    : (requiresCustom && typeof requiresCustom === 'object' && Array.isArray((requiresCustom as Record<string, unknown>).fields))
      ? ((requiresCustom as Record<string, unknown>).fields as unknown[])
      : (requiresCustom && typeof requiresCustom === 'object')
        ? Object.values(requiresCustom as Record<string, unknown>)
        : [];
  const customFields = rawFieldList
    .map(normalizeFieldDef)
    .filter((f): f is ProductCustomField => Boolean(f));
  const mappedCategory = sType === 'IMEI' || sType === 'SERVER'
    ? serviceTypeCategories[sType]
    : String(p.group_name || serviceTypeCategories[sType] || 'خدمات');
  return {
    id: p.id,
    name: String(p.arabic_name || p.name || ''),
    arabic_name: p.arabic_name,
    price: typeof p.price === 'number' || (typeof p.price === 'string' && !p.price.startsWith('$')) ? `$${Number(p.final_price || p.price || 0).toFixed(2)}` : p.price,
    originalPrice: p.source_price && Number(p.source_price) > Number(p.final_price || p.price) ? `$${Number(p.source_price).toFixed(2)}` : undefined,
    icon: serviceTypeIcons[sType] || '🔧',
    category: mappedCategory,
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
    requires_custom_json: requiresCustom,
    custom_json: customJson,
    customFields,
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
