// ─── خدمة API ───
// استدعاءات الـ API تتصل بالخادم الخلفي المحلي

import { getDemoResponse } from './demoData';

const API_BASE = '/api';

// ─── كشف وضع العرض التجريبي ───
// يتحقق من ?demo=1 في URL أو من sessionStorage (يُحفظ عند أول زيارة ليبقى عبر التنقل)
export function isDemoMode(): boolean {
  // Auto-detect demo subdomain
  if (typeof window !== 'undefined' && window.location.hostname.startsWith('demo-')) return true;
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('demo') === '1') {
    sessionStorage.setItem('demo_mode', '1');
    return true;
  }
  return sessionStorage.getItem('demo_mode') === '1';
}

function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_key');
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function adminFetch(endpoint: string, options: RequestInit = {}) {
  // ─── وضع العرض التجريبي: إرجاع بيانات وهمية ───
  if (isDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    const demoResult = getDemoResponse(endpoint, method);
    if (demoResult !== null) return demoResult;
  }
  // Admin dashboard stores JWT as 'admin_key' — NEVER fall back to customer token
  const token = getAdminKey();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    // In demo mode (?demo=1), don't redirect — just throw so the page can handle gracefully
    const isDemoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
    if (!isDemoMode && typeof window !== 'undefined') {
      localStorage.removeItem('admin_key');
      // Redirect to admin login — use stored slug to show the admin login form
      const slug = sessionStorage.getItem('admin_slug') || '';
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

async function customerFetch(endpoint: string, options: RequestInit = {}) {
  // ─── وضع العرض التجريبي: إرجاع بيانات وهمية ───
  if (isDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    const demoResult = getDemoResponse(endpoint, method);
    if (demoResult !== null) return demoResult;
  }
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  // إذا كان الرد خطأ مصادقة أو حظر — نحذف التوكن
  if (res.status === 401 || res.status === 403) {
    const errBody = await res.json().catch(() => ({}));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // إذا كان الحساب محظور — حفظ سبب الطرد
      if (errBody?.blocked) {
        sessionStorage.setItem('account_blocked', '1');
      }
    }
    throw new Error(errBody?.error || 'غير مصرح');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error || `خطأ HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Admin API ───
// المسارات تطابق الباك اند: /api/sources, /api/products, /api/orders, إلخ
export const adminApi = {
  getStats: () => adminFetch('/dashboard/stats'),
  getOnlineStats: () => adminFetch('/dashboard/online-stats'),
  getProducts: () => adminFetch('/products'),
  createProduct: (data: Record<string, unknown>) => adminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Record<string, unknown>) => adminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => adminFetch(`/products/${id}`, { method: 'DELETE' }),
  bulkDeleteProducts: (ids: number[]) => adminFetch('/products/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
  toggleFeatured: (id: number) => adminFetch(`/products/${id}/featured`, { method: 'PATCH', body: JSON.stringify({}) }),
  renameGroup: (oldName: string, newName: string) => adminFetch('/products/groups/rename', { method: 'PUT', body: JSON.stringify({ oldName, newName }) }),
  deleteGroup: (name: string) => adminFetch(`/products/groups/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  getOrders: () => adminFetch('/orders'),
  updateOrderStatus: (id: number, data: { status: string; server_response?: string }) => adminFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getUsers: () => adminFetch('/auth/users'),
  getCustomers: (page = 1, limit = 50, search = '') => adminFetch(`/customers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getCustomerById: (id: number) => adminFetch(`/customers/${id}`),
  getAnnouncements: () => adminFetch('/notifications'),
  createAnnouncement: (data: Record<string, unknown>) => adminFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => adminFetch(`/notifications/${id}`, { method: 'DELETE' }),
  sendEmailBroadcast: (data: { subject: string; message: string; recipient_type: string }) => adminFetch('/notifications/broadcast/send', { method: 'POST', body: JSON.stringify(data) }),
  getBroadcastRecipientCount: () => adminFetch('/notifications/broadcast/recipients-count'),
  getSettings: () => adminFetch('/customization'),
  updateSettings: (data: Record<string, unknown>) => adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  getSources: () => adminFetch('/sources'),
  getSourceStats: (id: number) => adminFetch(`/sources/${id}/stats`),
  updateSource: (id: number, data: Record<string, unknown>) => adminFetch(`/sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  applySourceProfit: (id: number, data: { profitPercentage: number; profitAmount?: number | null }) => adminFetch(`/sources/${id}/apply-profit`, { method: 'POST', body: JSON.stringify(data) }),
  syncSource: (id: number, options?: { setupIMEI?: boolean; setupServer?: boolean; setupRemote?: boolean; deleteAllBrandModel?: boolean; syncMode?: string }) => adminFetch(`/sources/${id}/sync`, { method: 'POST', body: options ? JSON.stringify(options) : undefined }),
  testSource: (id: number) => adminFetch(`/sources/${id}/test`, { method: 'POST' }),
  connectSource: (data: Record<string, unknown>) => adminFetch('/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: number) => adminFetch(`/sources/${id}`, { method: 'DELETE' }),
  toggleSyncOnly: (id: number, syncOnly: boolean) => adminFetch(`/sources/${id}/sync-only`, { method: 'PATCH', body: JSON.stringify({ syncOnly }) }),
  // عمليات الدفع
  getPayments: (page = 1, limit = 50, type?: string, search?: string) => adminFetch(`/payments?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getPaymentStats: () => adminFetch('/payments/stats'),
  updatePaymentStatus: (id: number, status: string) => adminFetch(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getPaymentGateways: () => adminFetch('/payment-gateways'),
  createPaymentGateway: (data: Record<string, unknown>) => adminFetch('/payment-gateways', { method: 'POST', body: JSON.stringify(data) }),
  updatePaymentGateway: (id: number, data: Record<string, unknown>) => adminFetch(`/payment-gateways/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePaymentGateway: (id: number) => adminFetch(`/payment-gateways/${id}`, { method: 'DELETE' }),
  togglePaymentGateway: (id: number) => adminFetch(`/payment-gateways/${id}/toggle`, { method: 'PATCH' }),
  getCustomize: () => adminFetch('/customization'),
  updateCustomize: (data: Record<string, unknown>) => adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  resetCustomize: () => adminFetch('/customization', { method: 'DELETE' }),
  updateCustomerWallet: (id: number, amount: number, reason?: string) => adminFetch(`/customers/${id}/wallet`, { method: 'PATCH', body: JSON.stringify({ amount, reason }) }),
  toggleBlockCustomer: (id: number, blocked: boolean) => adminFetch(`/customers/${id}/block`, { method: 'PATCH', body: JSON.stringify({ blocked }) }),
  updateCustomerVerification: (id: number, status: string, note?: string) => adminFetch(`/customers/${id}/verification`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  getCustomerOrders: (customerId: number) => adminFetch(`/orders?customer_id=${customerId}&limit=200`),
  getCustomerPayments: (customerId: number) => adminFetch(`/payments?customer_id=${customerId}&limit=200`),
  // مدونة
  getBlogPosts: () => adminFetch('/blogs'),
  getBlogPost: (id: number) => adminFetch(`/blogs/${id}`),
  createBlogPost: (data: Record<string, unknown>) => adminFetch('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateBlogPost: (id: number, data: Record<string, unknown>) => adminFetch(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogPost: (id: number) => adminFetch(`/blogs/${id}`, { method: 'DELETE' }),
  toggleBlogPublish: (id: number) => adminFetch(`/blogs/${id}/toggle-publish`, { method: 'PATCH' }),
  // دردشة
  getChatConversations: () => adminFetch('/chat'),
  getChatUnread: () => adminFetch('/chat/unread'),
  getChatMessages: (convId: string, after?: number) => adminFetch(`/chat/${convId}/messages${after ? `?after=${after}` : ''}`),
  sendChatReply: (convId: string, message: string) => adminFetch(`/chat/${convId}/send`, { method: 'POST', body: JSON.stringify({ message }) }),
  closeChatConversation: (convId: string) => adminFetch(`/chat/${convId}/close`, { method: 'PATCH' }),
  // فلاش
  getFlashSettings: () => adminFetch('/customization'),
  updateFlashSettings: (data: Record<string, unknown>) => adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  // متجر البنرات
  getBannerStore: () => adminFetch('/customization/banner-store'),
  installBanner: (templateId: number) => adminFetch(`/customization/banner-store/install/${templateId}`, { method: 'POST' }),
  getMyBanners: () => adminFetch('/customization/banners'),
  deleteBanner: (id: number) => adminFetch(`/customization/banners/${id}`, { method: 'DELETE' }),
  toggleBanner: (id: number, is_active: boolean) => adminFetch(`/customization/banners/${id}`, { method: 'PUT', body: JSON.stringify({ is_active }) }),
  // دفع البنرات
  getBannerGateways: () => adminFetch('/customization/banner-store/gateways'),
  purchaseBanner: (templateId: number, gateway_id: number) => adminFetch(`/customization/banner-store/purchase/${templateId}`, { method: 'POST', body: JSON.stringify({ gateway_id }) }),
  checkBannerPurchase: (paymentId: number) => adminFetch(`/customization/banner-store/purchase/${paymentId}/status`),
  uploadBannerReceipt: (paymentId: number, receipt_reference: string) => adminFetch(`/customization/banner-store/purchase/${paymentId}/receipt`, { method: 'POST', body: JSON.stringify({ receipt_reference }) }),
  checkBannerUsdt: (paymentId: number, txHash?: string) => adminFetch(`/customization/banner-store/purchase/${paymentId}/check-usdt`, { method: 'POST', body: JSON.stringify({ tx_hash: txHash || undefined }) }),
};

// ─── تحويل منتج الباكند لشكل الفرونت ───
export function mapBackendProduct(p: Record<string, unknown>): Record<string, unknown> {
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
  const extraFields = rawFieldList
    .map(normalizeFieldDef)
    .filter((f): f is ProductCustomField => Boolean(f));

  // ─── دمج حقل IMEI من custom_json إذا كان موجوداً ─────
  // custom_json يحمل بيانات الحقل الرئيسي (IMEI) من المصدر
  // نضيفه كأول حقل فقط إذا كان CUSTOM.allow === "1" ولم يكن موجوداً بالفعل
  const customFields: ProductCustomField[] = [];
  const hasCustomImei = customJson && typeof customJson === 'object' && !Array.isArray(customJson)
    && String((customJson as Record<string, unknown>).allow || '') === '1';

  if (hasCustomImei) {
    const cj = customJson as Record<string, unknown>;
    const imeiLabel = String(cj.customname || 'IMEI').trim() || 'IMEI';
    // لا نكرر إذا كان حقل بنفس المفتاح موجود في Requires.Custom
    const alreadyExists = extraFields.some(f => f.key.toLowerCase() === 'imei' || f.key.toLowerCase() === imeiLabel.toLowerCase().replace(/\s+/g, '_'));
    if (!alreadyExists) {
      customFields.push({
        key: 'imei',
        label: imeiLabel,
        placeholder: cj.custominfo ? String(cj.custominfo) : `أدخل ${imeiLabel}`,
        required: true,
      });
    }
  } else if (sType === 'IMEI') {
    // إذا نوع الخدمة IMEI ولا يوجد CUSTOM → نضيف حقل IMEI افتراضي
    // (بعض الخدمات مثل Refund تحتاج IMEI حتى بدون حقل CUSTOM)
    const alreadyExists = extraFields.some(f => f.key.toLowerCase() === 'imei');
    if (!alreadyExists) {
      customFields.push({
        key: 'imei',
        label: 'رقم IMEI',
        placeholder: 'مثال: 356938035643809',
        required: true,
      });
    }
  }
  // إضافة باقي الحقول من Requires.Custom
  customFields.push(...extraFields);
  const isGame = ['1', 'true', 'on', 'yes'].includes(String((p as { is_game?: unknown }).is_game ?? '').toLowerCase());
  const mappedCategory = isGame
    ? 'ألعاب'
    : (sType === 'IMEI' || sType === 'SERVER'
      ? serviceTypeCategories[sType]
      : String(p.group_name || serviceTypeCategories[sType] || 'خدمات'));
  return {
    id: p.id,
    name: String(p.arabic_name || p.name || ''),
    arabic_name: p.arabic_name,
    price: typeof p.price === 'number' || (typeof p.price === 'string' && !p.price.startsWith('$')) ? `$${Number(p.final_price || p.price || 0).toFixed(2)}` : p.price,
    originalPrice: p.source_price && Number(p.source_price) > Number(p.final_price || p.price) ? `$${Number(p.source_price).toFixed(2)}` : undefined,
    icon: serviceTypeIcons[sType] || '🔧',
    category: mappedCategory,
    desc: String(p.description || p.service_info || p.name || ''),
    stock: Number(p.stock || 999),
    status: 'نشط',
    allowsQuantity: String(p.qnt || '0') === '1',
    minQuantity: Math.max(1, Number(p.minqnt) || 1),
    maxQuantity: Number(p.maxqnt) || 100,
    rating: Number(p.rating) || 0,
    sales: Number(p.sales) || 0,
    // حقول الباكند الأصلية
    service_type: sType,
    service_time: p.service_time || p.TIME || null,
    group_name: p.group_name,
    external_service_key: p.external_service_key,
    source_id: p.source_id,
    source_name: p.source_name || (p.source && typeof p.source === 'object' ? (p.source as Record<string, unknown>).name as string : undefined),
    linked_product_id: p.linked_product_id ?? null,
    requires_custom_json: requiresCustom,
    custom_json: customJson,
    customFields,
    is_featured: p.is_featured ? 1 : 0,
    is_game: isGame ? 1 : 0,
  };
}

// ─── Customer API ───
export const storeApi = {
  getActiveBanners: async () => {
    try {
      if (isDemoMode()) {
        const demo = getDemoResponse('/customization/banners/active', 'GET');
        if (demo) return demo;
      }
      const res = await fetch(`${API_BASE}/customization/banners/active`, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
      return res.json();
    } catch { return { banners: [] }; }
  },
  getProducts: async () => {
    // وضع العرض التجريبي
    if (isDemoMode()) {
      const demo = getDemoResponse('/products/public', 'GET');
      if (demo) {
        const raw = Array.isArray(demo) ? demo : (demo as Record<string, unknown>)?.products || [];
        return (raw as Record<string, unknown>[]).map(mapBackendProduct);
      }
    }
    try {
      const res = await fetch(`${API_BASE}/products/public`, {
        cache: 'no-store',
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
  // ─── مدونة (عرض عام) ───
  getBlogPosts: async () => {
    if (isDemoMode()) {
      const demo = getDemoResponse('/blogs/public', 'GET');
      if (demo) return demo;
    }
    try {
      const res = await fetch(`${API_BASE}/blogs/public`, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
      return res.json();
    } catch { return { posts: [] }; }
  },
  getBlogPost: async (id: number) => {
    if (isDemoMode()) {
      const demo = getDemoResponse('/blogs/public', 'GET');
      if (demo) {
        const post = (demo as { posts: Array<{ id: number }> }).posts?.find((p: { id: number }) => p.id === id);
        return post ? { post } : { post: null };
      }
    }
    try {
      const res = await fetch(`${API_BASE}/blogs/public/${id}`, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
      return res.json();
    } catch { return { post: null }; }
  },
  // ─── مسارات فريدة للزبائن (تحت /api/customers/*) ───
  getOrders: () => customerFetch('/customers/orders'),
  getPayments: () => customerFetch('/customers/payments'),
  createOrder: (data: Record<string, unknown>) => customerFetch('/customers/orders', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => customerFetch('/customers/me'),
  updateProfile: (data: Record<string, unknown>) => customerFetch('/customers/me', { method: 'PUT', body: JSON.stringify(data) }),
  uploadIdentity: (data: { document_url: string }) => customerFetch('/customers/me/identity', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: () => customerFetch('/customers/notifications'),
  markNotificationRead: (id: number | string) => customerFetch(`/customers/notifications/${id}/read`, { method: 'PATCH' }),
  login: (data: { email: string; password: string }) => customerFetch('/customers/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string; phone?: string }) => customerFetch('/customers/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { email: string; code: string }) => customerFetch('/customers/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data: { email: string }) => customerFetch('/customers/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { token: string; password: string }) => customerFetch('/customers/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  chargeWallet: (data: { amount: number; payment_method: string; description?: string }) => customerFetch('/customers/payments', { method: 'POST', body: JSON.stringify({ type: 'deposit', ...data }) }),
  getEnabledGateways: () => {
    if (isDemoMode()) {
      const demo = getDemoResponse('/payment-gateways/enabled', 'GET');
      if (demo) return Promise.resolve(demo);
    }
    return fetch(`${API_BASE}/payment-gateways/enabled`).then(r => r.json());
  },
  getStoreInfo: () => {
    if (isDemoMode()) {
      const demo = getDemoResponse('/store/info', 'GET');
      if (demo) return Promise.resolve(demo);
    }
    return fetch(`${API_BASE}/store/info`).then(r => r.json());
  },
  getFlashPopup: async () => {
    try {
      const res = await fetch(`${API_BASE}/customization/store`, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      const c = data?.customization;
      if (c && c.flash_enabled) return c;
      return null;
    } catch { return null; }
  },

  // ─── Checkout API (بوابات الدفع الحقيقية) ───
  initCheckout: async (data: {
    gateway_id: number;
    amount: number;
    currency?: string;
    description?: string;
    customer_name?: string;
    customer_email?: string;
    type?: 'deposit' | 'purchase';
    return_url?: string;
    cancel_url?: string;
  }) => {
    if (isDemoMode()) {
      const demo = getDemoResponse('/checkout/init', 'POST', data);
      if (demo) return demo;
    }
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/checkout/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  checkPaymentStatus: async (id: number) => {
    if (isDemoMode()) {
      const demo = getDemoResponse(`/checkout/status/${id}`, 'GET');
      if (demo) return demo;
    }
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/checkout/status/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  checkUsdtPayment: async (id: number, txHash?: string) => {
    if (isDemoMode()) {
      const demo = getDemoResponse(`/checkout/check-usdt/${id}`, 'POST');
      if (demo) return demo;
    }
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/checkout/check-usdt/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ txHash: txHash || undefined }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  uploadReceipt: async (id: number, data: { receipt_url: string; notes?: string }) => {
    if (isDemoMode()) {
      return { success: true, message: 'تم رفع الإيصال بنجاح (عرض تجريبي)' };
    }
    const res = await fetch(`${API_BASE}/checkout/receipt/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // ─── دردشة العملاء ───
  chatStart: async (conversation_id: string, customer_name?: string, customer_email?: string) => {
    if (isDemoMode()) return { conversation: { id: 1, conversation_id, customer_name: customer_name || 'زائر', status: 'active', unread_customer: 0 } };
    const res = await fetch(`${API_BASE}/chat/public/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id, customer_name, customer_email }),
    });
    return res.json();
  },
  chatSend: async (conversation_id: string, message: string, customer_name?: string) => {
    if (isDemoMode()) return { success: true, messageId: Date.now() };
    const res = await fetch(`${API_BASE}/chat/public/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id, message, customer_name }),
    });
    return res.json();
  },
  chatMessages: async (conversation_id: string, after?: number) => {
    if (isDemoMode()) return { messages: [] };
    const res = await fetch(`${API_BASE}/chat/public/messages?conversation_id=${conversation_id}${after ? `&after=${after}` : ''}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
};
