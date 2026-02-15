// ─── API Service Layer ───
// Connects NEXIRO-FLUX frontend to backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  // ─── Helpers ───
  getToken() {
    return localStorage.getItem('nf_token');
  }

  setToken(token) {
    localStorage.setItem('nf_token', token);
  }

  removeToken() {
    localStorage.removeItem('nf_token');
    localStorage.removeItem('nf_user');
    localStorage.removeItem('nf_site');
  }

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('nf_user'));
    } catch {
      return null;
    }
  }

  setUser(user) {
    localStorage.setItem('nf_user', JSON.stringify(user));
  }

  setSite(site) {
    localStorage.setItem('nf_site', JSON.stringify(site));
  }

  getSite() {
    try {
      return JSON.parse(localStorage.getItem('nf_site'));
    } catch {
      return null;
    }
  }

  headers(extra = {}) {
    const h = {
      'Content-Type': 'application/json',
      ...extra,
    };
    const token = this.getToken();
    if (token) {
      h['Authorization'] = `Bearer ${token}`;
    }
    // Send site_key header for multi-tenant resolution
    const site = this.getSite();
    if (site?.site_key) {
      h['X-Site-Key'] = site.site_key;
    }
    return h;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.headers(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If token expired/invalid, logout
        if (response.status === 401 || response.status === 403) {
          if (this.getToken()) {
            this.removeToken();
            window.dispatchEvent(new Event('auth:logout'));
          }
        }
        throw { status: response.status, ...data };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, error: 'فشل الاتصال بالسيرفر. تأكد من تشغيل الباك إند.' };
    }
  }

  // ─── Auth ───

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
      if (data.site) this.setSite(data.site);
    }
    return data;
  }

  // تسجيل مستخدم عادي على المنصة (ليس أدمن)
  async registerUser(name, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
      if (data.site) this.setSite(data.site);
    }
    return data;
  }

  // تسجيل أدمن (يُستخدم من setup wizard فقط)
  async registerAdmin(name, email, password) {
    const data = await this.request('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
      if (data.site) this.setSite(data.site);
    }
    return data;
  }

  async googleLogin(credential) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(credential),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
      if (data.site) this.setSite(data.site);
    }
    return data;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async getSiteUsers() {
    return this.request('/auth/users');
  }

  async createUser(name, email, password, role = 'user') {
    return this.request('/auth/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  // ─── Customer Auth ───

  async customerRegister(name, email, phone, password) {
    const data = await this.request('/customers/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    return data;
  }

  async customerLogin(email, password) {
    const data = await this.request('/customers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  }

  // ─── Dashboard Stats ───

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardActivities(limit = 10) {
    return this.request(`/dashboard/activities?limit=${limit}`);
  }

  // ─── Products ───

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? '?' + query : ''}`);
  }

  async getPublicProducts() {
    const url = `${this.baseUrl}/products/public`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // ─── Orders ───

  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/orders${query ? '?' + query : ''}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ─── Customers (Admin) ───

  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customers${query ? '?' + query : ''}`);
  }

  async toggleBlockCustomer(id, blocked) {
    return this.request(`/customers/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blocked }),
    });
  }

  async updateCustomerWallet(id, amount, type = 'add') {
    return this.request(`/customers/${id}/wallet`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, type }),
    });
  }

  // ─── Sources ───

  async getSources() {
    return this.request('/sources');
  }

  async createSource(sourceData) {
    return this.request('/sources', {
      method: 'POST',
      body: JSON.stringify(sourceData),
    });
  }

  async updateSource(id, sourceData) {
    return this.request(`/sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sourceData),
    });
  }

  async deleteSource(id) {
    return this.request(`/sources/${id}`, { method: 'DELETE' });
  }

  // ─── Tickets ───

  async getTickets() {
    return this.request('/tickets');
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getTicketMessages(id) {
    return this.request(`/tickets/${id}/messages`);
  }

  async replyToTicket(id, message) {
    return this.request(`/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ─── Customization ───

  async getCustomization() {
    return this.request('/customization');
  }

  async updateCustomization(data) {
    return this.request('/customization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ─── Notifications ───

  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // ─── Payments ───

  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payments${query ? '?' + query : ''}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePaymentStatus(id, status) {
    return this.request(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getPaymentStats() {
    return this.request('/payments/stats');
  }

  // ─── Payment Gateways ───

  async getPaymentGateways() {
    return this.request('/payment-gateways');
  }

  async getEnabledPaymentGateways(country = null) {
    const q = country ? `?country=${country}` : '';
    return this.request(`/payment-gateways/enabled${q}`);
  }

  async createPaymentGateway(data) {
    return this.request('/payment-gateways', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentGateway(id, data) {
    return this.request(`/payment-gateways/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async togglePaymentGateway(id) {
    return this.request(`/payment-gateways/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deletePaymentGateway(id) {
    return this.request(`/payment-gateways/${id}`, {
      method: 'DELETE',
    });
  }

  // ─── Checkout ───

  async initCheckout(data) {
    return this.request('/checkout/init', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkPaymentStatusPublic(paymentId) {
    return this.request(`/checkout/status/${paymentId}`);
  }

  async checkUsdtPayment(paymentId) {
    return this.request(`/checkout/check-usdt/${paymentId}`, {
      method: 'POST',
    });
  }

  async uploadBankReceipt(paymentId, data) {
    return this.request(`/checkout/receipt/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ─── Permissions ───

  async getAllPermissions() {
    return this.request('/auth/permissions');
  }

  async getUserPermissions(userId) {
    return this.request(`/auth/users/${userId}/permissions`);
  }

  async grantPermission(userId, permission) {
    return this.request('/auth/permissions/grant', {
      method: 'POST',
      body: JSON.stringify({ userId, permission }),
    });
  }

  async revokePermission(userId, permission) {
    return this.request('/auth/permissions/revoke', {
      method: 'POST',
      body: JSON.stringify({ userId, permission }),
    });
  }

  // ─── Logout ───
  logout() {
    this.removeToken();
    window.dispatchEvent(new Event('auth:logout'));
  }

  // ─── Setup / Provisioning ───

  async provisionSite(data) {
    return this.request('/setup/provision', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMySite() {
    return this.request('/setup/my-site');
  }

  async updateSiteSettings(data) {
    return this.request('/setup/my-site', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Singleton
const api = new ApiService();
export default api;
