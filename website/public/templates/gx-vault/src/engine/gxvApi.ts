// ─── GX-VAULT API Layer ───
// طبقة اتصال الـ API لقالب شحن الألعاب

import { getGxvDemoResponse } from './gxvDemoData';

const GXV_API_BASE = '/api';

// ─── كشف وضع العرض التجريبي ───
export function gxvIsDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.hostname.startsWith('demo-')) return true;
  if (new URLSearchParams(window.location.search).get('demo') === '1') {
    sessionStorage.setItem('gxv_demo_mode', '1');
    return true;
  }
  return sessionStorage.getItem('gxv_demo_mode') === '1';
}

function gxvGetAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_key');
}

function gxvGetAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function gxvAdminFetch(endpoint: string, options: RequestInit = {}) {
  // في وضع الديمو نرجع بيانات وهمية بدلاً من استدعاء API حقيقي
  if (gxvIsDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    return getGxvDemoResponse(endpoint, method);
  }

  const token = gxvGetAdminKey() || gxvGetAuthToken();
  const res = await fetch(`${GXV_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      const isDemoMode = new URLSearchParams(window.location.search).get('demo') === '1';
      if (!isDemoMode) {
        localStorage.removeItem('admin_key');
        window.location.href = '/login';
      }
    }
    throw new Error('Unauthorized');
  }
  return res.json();
}

async function gxvCustomerFetch(endpoint: string, options: RequestInit = {}) {
  // في وضع الديمو نرجع بيانات وهمية للمتجر أيضاً
  if (gxvIsDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    return getGxvDemoResponse(endpoint, method);
  }

  const token = gxvGetAuthToken();
  const res = await fetch(`${GXV_API_BASE}${endpoint}`, {
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
export const gxvAdminApi = {
  getStats: () => gxvAdminFetch('/dashboard/stats'),
  getProducts: () => gxvAdminFetch('/products'),
  createProduct: (data: Record<string, unknown>) => gxvAdminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) => gxvAdminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => gxvAdminFetch(`/products/${id}`, { method: 'DELETE' }),
  getOrders: () => gxvAdminFetch('/orders'),
  updateOrder: (id: string, data: Record<string, unknown>) => gxvAdminFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getUsers: () => gxvAdminFetch('/auth/users'),
  getAnnouncements: () => gxvAdminFetch('/notifications'),
  createAnnouncement: (data: Record<string, unknown>) => gxvAdminFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => gxvAdminFetch(`/notifications/${id}`, { method: 'DELETE' }),
  getSettings: () => gxvAdminFetch('/customization'),
  updateSettings: (data: Record<string, unknown>) => gxvAdminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  getSources: () => gxvAdminFetch('/sources'),
  applySourceProfit: (id: number, data: { profitPercentage: number; profitAmount?: number | null }) => gxvAdminFetch(`/sources/${id}/apply-profit`, { method: 'POST', body: JSON.stringify(data) }),
  syncSource: (id: number) => gxvAdminFetch(`/sources/${id}/sync`, { method: 'POST' }),
  testSource: (id: number) => gxvAdminFetch(`/sources/${id}/test`, { method: 'POST' }),
  connectSource: (data: Record<string, unknown>) => gxvAdminFetch('/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: number) => gxvAdminFetch(`/sources/${id}`, { method: 'DELETE' }),
  getPaymentGateways: () => gxvAdminFetch('/payment-gateways'),
  getCustomize: () => gxvAdminFetch('/customization'),
  updateCustomize: (data: Record<string, unknown>) => gxvAdminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── تحويل منتج الباكند لشكل عرض الألعاب ───
function gxvMapProduct(p: Record<string, unknown>): Record<string, unknown> {
  type GxvField = { key: string; label: string; placeholder: string; required: boolean };
  const parseMaybe = (v: unknown): unknown => {
    if (typeof v !== 'string') return v;
    try { return JSON.parse(v); } catch { return v; }
  };

  const normalizeField = (field: unknown, idx: number): GxvField | null => {
    if (!field) return null;
    if (typeof field === 'string') {
      const key = field.trim();
      if (!key) return null;
      return { key, label: key, placeholder: `أدخل ${key}`, required: true };
    }
    if (typeof field === 'object') {
      const f = field as Record<string, unknown>;
      const label = String(f.label || f.fieldname || f.title || f.name || f.key || f.field || f.description || `حقل ${idx + 1}`).trim();
      const rawKey = String(f.key || f.fieldname || f.name || f.field || f.id || `field_${idx + 1}`).trim();
      const key = rawKey.replace(/\s+/g, '_');
      const req = f.required;
      const required = req === undefined ? true : ['1', 'true', 'on', 'yes'].includes(String(req).toLowerCase());
      return { key, label, placeholder: String(f.placeholder || f.description || `أدخل ${label}`), required };
    }
    return null;
  };

  const gameIcons: Record<string, string> = { IMEI: '📱', SERVER: '🎮', REMOTE: '🖥️', FILE: '📁', CODE: '🔑' };
  const sType = String(p.service_type || p.SERVICETYPE || 'SERVER').toUpperCase();
  const requiresCustom = parseMaybe(p.requires_custom_json);
  const customJson = parseMaybe(p.custom_json);

  const rawFields = Array.isArray(requiresCustom)
    ? requiresCustom
    : (requiresCustom && typeof requiresCustom === 'object' && Array.isArray((requiresCustom as Record<string, unknown>).fields))
      ? ((requiresCustom as Record<string, unknown>).fields as unknown[])
      : (requiresCustom && typeof requiresCustom === 'object')
        ? Object.values(requiresCustom as Record<string, unknown>)
        : [];
  const customFields = rawFields.map(normalizeField).filter((f): f is GxvField => Boolean(f));

  const name = String(p.arabic_name || p.name || '');
  const lowerName = name.toLowerCase();
  let gameSlug = 'other';
  if (lowerName.includes('pubg') || lowerName.includes('ببجي')) gameSlug = 'pubg';
  else if (lowerName.includes('fortnite') || lowerName.includes('فورتنايت')) gameSlug = 'fortnite';
  else if (lowerName.includes('free fire') || lowerName.includes('فري فاير')) gameSlug = 'freefire';
  else if (lowerName.includes('call of duty') || lowerName.includes('cod') || lowerName.includes('كول')) gameSlug = 'cod';
  else if (lowerName.includes('roblox') || lowerName.includes('روبلوكس')) gameSlug = 'roblox';
  else if (lowerName.includes('valorant') || lowerName.includes('فالورانت')) gameSlug = 'valorant';

  const category = String(p.group_name || 'شحن ألعاب');

  return {
    id: p.id,
    name,
    arabic_name: p.arabic_name,
    price: typeof p.price === 'number' || (typeof p.price === 'string' && !p.price.startsWith('$'))
      ? `$${Number(p.final_price || p.price || 0).toFixed(2)}`
      : p.price,
    originalPrice: p.source_price && Number(p.source_price) > Number(p.final_price || p.price)
      ? `$${Number(p.source_price).toFixed(2)}`
      : undefined,
    icon: gameIcons[sType] || '🎮',
    category,
    gameSlug,
    desc: String(p.description || p.service_info || p.name || ''),
    stock: Number(p.qnt || p.stock || 999),
    status: 'نشط',
    rating: 4.5 + Math.random() * 0.5,
    sales: Math.floor(Math.random() * 200 + 20),
    service_type: sType,
    group_name: p.group_name,
    external_service_key: p.external_service_key,
    source_id: p.source_id,
    requires_custom_json: requiresCustom,
    custom_json: customJson,
    customFields,
  };
}

// ─── Store API ───
export const gxvStoreApi = {
  getProducts: async () => {
    try {
      // في وضع الديمو نرجع المنتجات الوهمية مباشرة
      if (gxvIsDemoMode()) {
        const { gxvDemoProducts } = await import('./gxvDemoData');
        return gxvDemoProducts.map(gxvMapProduct);
      }

      const res = await fetch(`${GXV_API_BASE}/products/public`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const raw = (Array.isArray(data) ? data : data?.products || [])
        .filter((p: Record<string, unknown>) => p.service_type !== 'TEMPLATE' && p.group_name);
      return raw.map(gxvMapProduct);
    } catch {
      return [];
    }
  },
  getProduct: (id: number) => gxvCustomerFetch(`/products/${id}`),
  getOrders: () => gxvCustomerFetch('/customers/orders'),
  createOrder: (data: Record<string, unknown>) => gxvCustomerFetch('/customers/orders', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => gxvCustomerFetch('/customers/me'),
  updateProfile: (data: Record<string, unknown>) => gxvCustomerFetch('/customers/me', { method: 'PUT', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => gxvCustomerFetch('/customers/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string }) => gxvCustomerFetch('/customers/register', { method: 'POST', body: JSON.stringify(data) }),
  chargeWallet: (data: Record<string, unknown>) => gxvCustomerFetch('/checkout/init', { method: 'POST', body: JSON.stringify(data) }),
  getEnabledGateways: async () => {
    if (gxvIsDemoMode()) return [{ id: 1, name: 'PayPal', type: 'paypal', is_enabled: true }, { id: 2, name: 'Binance Pay', type: 'binance', is_enabled: true }, { id: 3, name: 'USDT (TRC20)', type: 'usdt', is_enabled: true }];
    const res = await fetch(`${GXV_API_BASE}/payment-gateways/enabled`, { headers: { 'Content-Type': 'application/json' } });
    return res.json();
  },
  getStoreInfo: () => fetch(`${GXV_API_BASE}/customization/store`).then(r => r.json()),
};
