/**
 * IMEI CHECK API Service
 * ========================
 * بوابة الاتصال بنظام alpha.imeicheck.com
 * 
 * البروتوكول: GET/POST
 * صيغة الاستجابة: JSON
 * 
 * العمليات المدعومة:
 * - balance: معلومات الرصيد
 * - services: قائمة الخدمات المتاحة
 * - create: إرسال طلب جديد (IMEI/SN check)
 * - history: متابعة حالة طلب
 * 
 * ملاحظات:
 * - حماية من الإرسال المكرر: 2 ثانية بين الطلبات المتشابهة
 * - يدعم GET و POST
 * - لا يحتاج username — فقط API Key
 */

class ImeiCheckClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - مفتاح API
   * @param {string} [config.baseUrl] - الرابط الأساسي (افتراضي: https://alpha.imeicheck.com/api/php-api)
   */
  constructor({ apiKey, baseUrl }) {
    if (!apiKey) throw new Error('apiKey مطلوب');
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || 'https://alpha.imeicheck.com/api/php-api').replace(/\/+$/, '');
    this.timeout = 30000; // 30 ثانية
  }

  /**
   * إرسال طلب GET إلى IMEI Check API
   */
  async _get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ImeiCheckError(`HTTP ${response.status} ${response.statusText}`, null, null);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new ImeiCheckError(`استجابة غير JSON: ${text.slice(0, 200)}`, null, text);
      }

      // التحقق من أخطاء API
      if (data?.error || data?.Error || data?.ERROR) {
        const errMsg = data.error || data.Error || data.ERROR;
        throw new ImeiCheckError(
          typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
          null,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ImeiCheckError('انتهت مهلة الاتصال بالمصدر', null, null);
      }
      if (error instanceof ImeiCheckError) throw error;
      throw new ImeiCheckError(error.message, null, null);
    }
  }

  // ─── معلومات الرصيد ───────────────────────────────────────
  async getBalance() {
    const data = await this._get('balance');

    // Normalize — API may return { balance: "123.45" } or { balance: 123.45, currency: "USD" }
    const balance = parseFloat(data?.balance ?? data?.Balance ?? data?.credit ?? 0);
    const currency = data?.currency || data?.Currency || 'USD';

    return {
      balance,
      currency,
      raw: data,
    };
  }

  // ─── قائمة الخدمات المتاحة ────────────────────────────────
  async getServices() {
    const data = await this._get('services');

    // Normalize: API might return an array or object
    let services = [];

    if (Array.isArray(data)) {
      services = data;
    } else if (data?.services && Array.isArray(data.services)) {
      services = data.services;
    } else if (data?.Services && Array.isArray(data.Services)) {
      services = data.Services;
    } else if (typeof data === 'object' && data !== null) {
      // Could be an object keyed by service ID
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          services.push({ ...val, _key: key });
        }
      }
    }

    // Normalize each service to a consistent structure
    const normalized = services.map((svc, idx) => ({
      id: svc.id || svc.ID || svc.service_id || svc.serviceId || svc._key || String(idx + 1),
      name: svc.name || svc.Name || svc.title || svc.Title || svc.service || svc.Service || `Service ${svc.id || idx + 1}`,
      group: svc.group || svc.Group || svc.category || svc.Category || 'General',
      price: parseFloat(svc.price || svc.Price || svc.credit || svc.Credit || 0),
      time: svc.time || svc.Time || svc.delivery || svc.Delivery || svc.duration || null,
      info: svc.info || svc.Info || svc.description || svc.Description || null,
      type: (svc.type || svc.Type || 'IMEI').toUpperCase(),
      raw: svc,
    }));

    return {
      services: normalized,
      totalServices: normalized.length,
      raw: data,
    };
  }

  // ─── إرسال طلب IMEI Check ─────────────────────────────────
  /**
   * @param {Object} params
   * @param {string|number} params.serviceId - رقم الخدمة
   * @param {string} params.imei - رقم IMEI أو Serial Number
   */
  async createOrder({ serviceId, imei }) {
    if (!serviceId) throw new ImeiCheckError('serviceId مطلوب', null, null);
    if (!imei) throw new ImeiCheckError('IMEI/SN مطلوب', null, null);

    const data = await this._get('create', {
      service: serviceId,
      imei: imei,
    });

    // Response: { orderId, duration, status, imei, price, result, object }
    const status = (data?.status || '').toLowerCase();
    const statusMap = {
      success: 'completed',
      failed: 'rejected',
      error: 'error',
      pending: 'pending',
      processing: 'pending',
    };

    return {
      orderId: data?.orderId || data?.order_id || data?.orderid || null,
      status: statusMap[status] || status || 'unknown',
      statusLabel: status === 'success' ? 'تم بنجاح' : status === 'failed' ? 'فشل' : status === 'error' ? 'خطأ' : status === 'pending' ? 'قيد المعالجة' : 'غير معروف',
      imei: data?.imei || imei,
      price: data?.price ? parseFloat(data.price) : null,
      duration: data?.duration || null,
      result: data?.result || null,
      object: data?.object || null,
      raw: data,
    };
  }

  // ─── متابعة حالة طلب ──────────────────────────────────────
  /**
   * @param {string|number} orderId - رقم الطلب
   */
  async getOrderHistory(orderId) {
    if (!orderId) throw new ImeiCheckError('orderId مطلوب', null, null);

    const data = await this._get('history', { orderId });

    const status = (data?.status || '').toLowerCase();
    const statusMap = {
      success: 'completed',
      failed: 'rejected',
      error: 'error',
      pending: 'pending',
      processing: 'pending',
    };

    return {
      orderId: data?.orderId || data?.order_id || orderId,
      status: statusMap[status] || status || 'unknown',
      statusLabel: status === 'success' ? 'تم بنجاح' : status === 'failed' ? 'فشل' : status === 'error' ? 'خطأ' : status === 'pending' ? 'قيد المعالجة' : 'غير معروف',
      imei: data?.imei || null,
      price: data?.price ? parseFloat(data.price) : null,
      result: data?.result || null,
      object: data?.object || null,
      raw: data,
    };
  }
}

// ─── خطأ IMEI Check خاص ────────────────────────────────────
class ImeiCheckError extends Error {
  constructor(message, code, rawResponse) {
    super(message);
    this.name = 'ImeiCheckError';
    this.code = code || null;
    this.rawResponse = rawResponse || null;
  }
}

module.exports = { ImeiCheckClient, ImeiCheckError };
