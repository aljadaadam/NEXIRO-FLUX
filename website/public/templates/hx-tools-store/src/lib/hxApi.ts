// ─── HX Tools Store - API Layer ───

import { getHxDemoResponse } from './hxDemoData';

const HX_API_BASE = '/api';

function hxIsDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('demo') === '1') {
    sessionStorage.setItem('hx_demo_mode', '1');
    return true;
  }
  return sessionStorage.getItem('hx_demo_mode') === '1';
}

function getHxAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hx_admin_key');
}

function getHxAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hx_auth_token');
}

async function hxAdminFetch(endpoint: string, options: RequestInit = {}) {
  if (hxIsDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    const demoResult = getHxDemoResponse(endpoint, method);
    if (demoResult !== null) return demoResult;
  }
  const token = getHxAdminKey();
  const res = await fetch(`${HX_API_BASE}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hx_admin_key');
      const slug = sessionStorage.getItem('hx_admin_slug') || '';
      if (slug) {
        window.location.href = `/admin?key=${slug}`;
      } else {
        window.location.href = '/admin';
      }
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function hxCustomerFetch(endpoint: string, options: RequestInit = {}) {
  if (hxIsDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    const demoResult = getHxDemoResponse(endpoint, method);
    if (demoResult !== null) return demoResult;
  }
  const token = getHxAuthToken();
  const res = await fetch(`${HX_API_BASE}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hx_auth_token');
    }
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error || 'غير مصرح');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error || `خطأ HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Admin API ───
export const hxAdminApi = {
  getStats: () => hxAdminFetch('/dashboard/stats'),
  getProducts: () => hxAdminFetch('/products'),
  createProduct: (data: Record<string, unknown>) => hxAdminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => hxAdminFetch(`/products/${id}`, { method: 'DELETE' }),
  toggleFeatured: (id: number) => hxAdminFetch(`/products/${id}/featured`, { method: 'PATCH', body: JSON.stringify({}) }),
  getOrders: () => hxAdminFetch('/orders'),
  updateOrderStatus: (id: number, data: { status: string; server_response?: string; tracking_number?: string }) =>
    hxAdminFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getCustomers: (page = 1, limit = 50, search = '') =>
    hxAdminFetch(`/customers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getAnnouncements: () => hxAdminFetch('/notifications'),
  createAnnouncement: (data: Record<string, unknown>) => hxAdminFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => hxAdminFetch(`/notifications/${id}`, { method: 'DELETE' }),
  getSettings: () => hxAdminFetch('/customization'),
  updateSettings: (data: Record<string, unknown>) => hxAdminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  getPaymentGateways: () => hxAdminFetch('/payment-gateways'),
  createPaymentGateway: (data: Record<string, unknown>) => hxAdminFetch('/payment-gateways', { method: 'POST', body: JSON.stringify(data) }),
  updatePaymentGateway: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/payment-gateways/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePaymentGateway: (id: number) => hxAdminFetch(`/payment-gateways/${id}`, { method: 'DELETE' }),
  togglePaymentGateway: (id: number) => hxAdminFetch(`/payment-gateways/${id}/toggle`, { method: 'PATCH' }),
  // Delivery Zones & Regions
  getDeliveryZones: () => hxAdminFetch('/delivery-zones'),
  createDeliveryZone: (data: Record<string, unknown>) => hxAdminFetch('/delivery-zones', { method: 'POST', body: JSON.stringify(data) }),
  updateDeliveryZone: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/delivery-zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeliveryZone: (id: number) => hxAdminFetch(`/delivery-zones/${id}`, { method: 'DELETE' }),
  createDeliveryRegion: (data: Record<string, unknown>) => hxAdminFetch('/delivery-zones/regions', { method: 'POST', body: JSON.stringify(data) }),
  updateDeliveryRegion: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/delivery-zones/regions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeliveryRegion: (id: number) => hxAdminFetch(`/delivery-zones/regions/${id}`, { method: 'DELETE' }),
  // Currencies
  getCurrencies: () => hxAdminFetch('/currencies'),
  createCurrency: (data: Record<string, unknown>) => hxAdminFetch('/currencies', { method: 'POST', body: JSON.stringify(data) }),
  updateCurrency: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/currencies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCurrency: (id: number) => hxAdminFetch(`/currencies/${id}`, { method: 'DELETE' }),
  // Customization & Banners
  getCustomization: () => hxAdminFetch('/customization'),
  updateCustomization: (data: Record<string, unknown>) => hxAdminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  getBanners: () => hxAdminFetch('/customization/banners'),
  createBanner: (data: Record<string, unknown>) => hxAdminFetch('/customization/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id: number | string, data: Record<string, unknown>) => hxAdminFetch(`/customization/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id: number | string) => hxAdminFetch(`/customization/banners/${id}`, { method: 'DELETE' }),
  // Order update alias
  updateOrder: (id: number, data: Record<string, unknown>) => hxAdminFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getCustomize: () => hxAdminFetch('/customization'),
  updateCustomize: (data: Record<string, unknown>) => hxAdminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  updateCustomerWallet: (id: number, amount: number) => hxAdminFetch(`/customers/${id}/wallet`, { method: 'PATCH', body: JSON.stringify({ amount }) }),
  getSources: () => hxAdminFetch('/sources'),
  syncSource: (id: number) => hxAdminFetch(`/sources/${id}/sync`, { method: 'POST' }),
  testSource: (id: number) => hxAdminFetch(`/sources/${id}/test`, { method: 'POST' }),
  connectSource: (data: Record<string, unknown>) => hxAdminFetch('/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: number) => hxAdminFetch(`/sources/${id}`, { method: 'DELETE' }),
};

// ─── Store/Customer API ───
export const hxStoreApi = {
  getProducts: () => hxCustomerFetch('/products/public'),
  getProduct: (id: number) => hxCustomerFetch(`/products/public/${id}`),
  getCategories: () => hxCustomerFetch('/products/categories'),

  login: (email: string, password: string) =>
    hxCustomerFetch('/customers/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: Record<string, unknown>) =>
    hxCustomerFetch('/customers/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => hxCustomerFetch('/customers/me'),
  updateProfile: (data: Record<string, unknown>) =>
    hxCustomerFetch('/customers/me', { method: 'PUT', body: JSON.stringify(data) }),

  getOrders: () => hxCustomerFetch('/customers/orders'),
  createOrder: (data: Record<string, unknown>) =>
    hxCustomerFetch('/checkout', { method: 'POST', body: JSON.stringify(data) }),

  getPaymentGateways: () => hxCustomerFetch('/payment-gateways/enabled'),

  getCustomization: () => fetch(`${HX_API_BASE}/customization/store`, { cache: 'no-store' }).then(r => r.json()),
  getAnnouncements: () => hxCustomerFetch('/notifications'),
};

// ─── Product mapper ───
type HxProductCustomField = { key: string; label: string; placeholder: string; required: boolean };

function hxParseMaybeJson(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return v; }
}

function hxNormalizeFieldDef(field: unknown, index: number): HxProductCustomField | null {
  if (!field) return null;
  if (typeof field === 'string') {
    const key = field.trim();
    if (!key) return null;
    return { key, label: key, placeholder: `أدخل ${key}`, required: true };
  }
  if (typeof field === 'object' && field !== null) {
    const f = field as Record<string, unknown>;
    const key = String(f.key || f.name || f.label || `field_${index}`);
    return {
      key,
      label: String(f.label || f.name || key),
      placeholder: String(f.placeholder || `أدخل ${f.label || key}`),
      required: f.required !== false,
    };
  }
  return null;
}

export function hxMapBackendProduct(p: Record<string, unknown>): Record<string, unknown> {
  let customFields: HxProductCustomField[] = [];
  const raw = p.custom_json || p.requires_custom_json;
  if (raw) {
    const parsed = hxParseMaybeJson(raw);
    if (Array.isArray(parsed)) {
      customFields = parsed.map((f, i) => hxNormalizeFieldDef(f, i)).filter(Boolean) as HxProductCustomField[];
    } else if (typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.fields)) {
        customFields = obj.fields.map((f: unknown, i: number) => hxNormalizeFieldDef(f, i)).filter(Boolean) as HxProductCustomField[];
      }
    }
  }
  const namePriority = (p.name_priority as string) || 'ar';
  const displayName = namePriority === 'en'
    ? (p.name || p.arabic_name || 'منتج')
    : (p.arabic_name || p.name || 'منتج');
  return {
    ...p,
    displayName,
    icon: p.icon || p.image || '📦',
    category: p.group_name || p.category || 'عام',
    customFields,
    allowsQuantity: p.allowsQuantity !== false,
    minQuantity: Number(p.minQuantity) || 1,
    maxQuantity: Number(p.maxQuantity) || 999,
  };
}
