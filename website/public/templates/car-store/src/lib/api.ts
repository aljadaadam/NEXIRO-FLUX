// ─── خدمة API — متجر سيارات ───

import { getDemoResponse } from './demoData';

const API_BASE = '/api';

function isDemoMode(): boolean {
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
  if (isDemoMode()) {
    const method = (options.method || 'GET').toUpperCase();
    const demoResult = getDemoResponse(endpoint, method);
    if (demoResult !== null) return demoResult;
  }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_key');
      const slug = sessionStorage.getItem('admin_slug') || '';
      window.location.href = slug ? `/admin?key=${slug}` : '/admin';
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
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
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

// ─── API المتجر (للعملاء) ───
export const storeApi = {
  getCars: (params?: string) => customerFetch(`/products${params ? `?${params}` : ''}`),
  getCar: (id: number) => customerFetch(`/products/${id}`),
  getBranches: () => customerFetch('/branches'),
  getBranch: (id: number) => customerFetch(`/branches/${id}`),
  createOrder: (data: Record<string, unknown>) => customerFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => customerFetch('/orders'),
  login: (data: Record<string, unknown>) => customerFetch('/auth/customer/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: Record<string, unknown>) => customerFetch('/auth/customer/register', { method: 'POST', body: JSON.stringify(data) }),
  getCustomization: () => fetch(`${API_BASE}/customization/store?_t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()),
};

// ─── API الأدمن ───
export const adminApi = {
  login: (data: Record<string, unknown>) => adminFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => adminFetch('/dashboard/stats'),
  // سيارات
  getCars: (params?: string) => adminFetch(`/products${params ? `?${params}` : ''}`),
  getCar: (id: number) => adminFetch(`/products/${id}`),
  createCar: (data: Record<string, unknown>) => adminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateCar: (id: number, data: Record<string, unknown>) => adminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCar: (id: number) => adminFetch(`/products/${id}`, { method: 'DELETE' }),
  // طلبات
  getOrders: (params?: string) => adminFetch(`/orders${params ? `?${params}` : ''}`),
  updateOrder: (id: number, data: Record<string, unknown>) => adminFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  // عملاء
  getCustomers: () => adminFetch('/customers'),
  // فروع
  getBranches: () => adminFetch('/branches'),
  createBranch: (data: Record<string, unknown>) => adminFetch('/branches', { method: 'POST', body: JSON.stringify(data) }),
  updateBranch: (id: number, data: Record<string, unknown>) => adminFetch(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBranch: (id: number) => adminFetch(`/branches/${id}`, { method: 'DELETE' }),
  // تخصيص
  getCustomization: () => adminFetch('/customization'),
  updateCustomization: (data: Record<string, unknown>) => adminFetch('/customization', { method: 'PUT', body: JSON.stringify(data) }),
  // إعدادات
  getSettings: () => adminFetch('/settings'),
  updateSettings: (data: Record<string, unknown>) => adminFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
