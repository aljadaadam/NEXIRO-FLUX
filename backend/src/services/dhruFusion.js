/**
 * DHRU FUSION API Service
 * ========================
 * بوابة الاتصال بأنظمة DHRU FUSION (مثل SD-UNLOCKER وغيرها)
 * 
 * البروتوكول: POST (x-www-form-urlencoded)
 * صيغة الاستجابة: JSON
 * 
 * العمليات المدعومة:
 * - accountinfo: معلومات الحساب والرصيد
 * - imeiservicelist: قائمة الخدمات المتاحة
 * - placeimeiorder: إرسال طلب جديد
 * - getimeiorder: متابعة حالة طلب
 */

class DhruFusionClient {
  /**
   * @param {Object} config
   * @param {string} config.baseUrl - رابط API (مثل https://sd-unlocker.com/api/index.php)
   * @param {string} config.username - اسم المستخدم
   * @param {string} config.apiAccessKey - مفتاح API
   */
  constructor({ baseUrl, username, apiAccessKey }) {
    if (!baseUrl) throw new Error('baseUrl مطلوب');
    if (!apiAccessKey) throw new Error('apiAccessKey مطلوب');
    
    this.baseUrl = baseUrl;
    this.username = username || '';
    this.apiAccessKey = apiAccessKey;
    this.timeout = 30000; // 30 ثانية
  }

  /**
   * تنظيف النص من أحرف XML الخطرة (حماية من XML injection)
   */
  static escapeXml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * إرسال طلب POST إلى DHRU FUSION API
   */
  async _post(action, extraParams = {}) {
    const body = new URLSearchParams({
      username: this.username,
      apiaccesskey: this.apiAccessKey,
      requestformat: 'JSON',
      action,
      ...extraParams
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`استجابة غير JSON: ${text.slice(0, 200)}`);
      }

      // ─── تطبيع البنية: بعض المصادر تلف الرد في DHRUFUSION ───
      // data.DHRUFUSION.SUCCESS / data.DHRUFUSION.ERROR  →  أو مباشرة  →  data.SUCCESS / data.ERROR
      const root = data?.DHRUFUSION || data;

      // التحقق من وجود خطأ
      const errorBlock = root.ERROR || data.ERROR;
      if (errorBlock) {
        const err = Array.isArray(errorBlock) ? errorBlock[0] : errorBlock;
        const msg = err?.MESSAGE || err?.message || JSON.stringify(err);
        const fullDesc = err?.FULL_DESCRIPTION || err?.full_description || '';
        throw new DhruFusionError(msg, fullDesc, data);
      }

      // نرجع root المطبّع (يحتوي SUCCESS دائماً في المستوى الأول)
      // نضيف _raw للرد الخام الأصلي
      root._raw = data;
      return root;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('انتهت مهلة الاتصال بالمصدر');
      }
      throw error;
    }
  }

  // ─── معلومات الحساب ───────────────────────────────────────
  async getAccountInfo() {
    const data = await this._post('accountinfo');
    const success = data?.SUCCESS?.RESULT || (Array.isArray(data?.SUCCESS) ? data.SUCCESS[0] : data?.SUCCESS);
    const info = success?.AccountInfo || success?.accountinfo || success || {};

    return {
      email: info.mail || info.email || info.EMAIL || null,
      credits: parseFloat(info.creditraw || info.credit || info.CREDITS || 0),
      creditFormatted: info.credit || null,
      currency: info.currency || info.CURRENCY || 'USD',
      apiVersion: data.apiversion || data.APIVERSION || null,
      raw: data._raw || data
    };
  }

  // ─── قائمة الخدمات ────────────────────────────────────────
  async getServiceList() {
    const data = await this._post('imeiservicelist');
    const success = data?.SUCCESS?.RESULT || (Array.isArray(data?.SUCCESS) ? data.SUCCESS[0] : data?.SUCCESS);
    const list = success?.LIST;

    if (!list || typeof list !== 'object') {
      throw new Error('تنسيق قائمة الخدمات غير متوقع');
    }

    // تحويل إلى صيغة موحدة
    const groups = [];
    for (const [groupKey, group] of Object.entries(list)) {
      const services = [];
      const rawServices = group?.SERVICES || {};

      for (const [serviceKey, service] of Object.entries(rawServices)) {
        services.push({
          id: serviceKey,
          serviceId: service.SERVICEID || parseInt(serviceKey),
          name: service.SERVICENAME || service.name || `Service ${serviceKey}`,
          credit: parseFloat(service.CREDIT || 0),
          time: service.TIME || null,
          serviceType: (service.SERVICETYPE || group?.GROUPTYPE || 'IMEI').toUpperCase(),
          quantity: service.QNT,
          minQuantity: service.MINQNT,
          maxQuantity: service.MAXQNT,
          info: service.INFO || null,
          requiresCustom: service['Requires.Custom'] || null,
          raw: service
        });
      }

      groups.push({
        key: groupKey,
        name: group?.GROUPNAME || groupKey,
        type: (group?.GROUPTYPE || 'IMEI').toUpperCase(),
        services,
        serviceCount: services.length
      });
    }

    return {
      groups,
      totalServices: groups.reduce((sum, g) => sum + g.serviceCount, 0),
      raw: data
    };
  }

  // ─── إرسال طلب IMEI ──────────────────────────────────────
  /**
   * @param {Object} params
   * @param {string|number} params.serviceId - رقم الخدمة
   * @param {string} params.imei - رقم IMEI
   * @param {number} [params.quantity] - الكمية (اختياري)
   * @param {Object} [params.customFields] - حقول مخصصة (اختياري)
   */
  async placeOrder({ serviceId, imei, quantity, customFields }) {
    if (!serviceId) throw new Error('serviceId مطلوب');
    
    // ─── DHRU FUSION: حقول serviceimei تُرسل عبر <IMEI> ───
    // إذا IMEI فارغ وهناك حقول مخصصة، استخدم أول قيمة كـ IMEI
    // لأن DHRU يتوقع حقول serviceimei في <IMEI> tag
    let effectiveImei = imei || '';
    let remainingFields: Record<string, string> = {};

    if (customFields && typeof customFields === 'object') {
      const entries = Object.entries(customFields);
      if (!effectiveImei && entries.length > 0) {
        // استخدم أول حقل مخصص كـ IMEI (عادة يكون حقل serviceimei)
        effectiveImei = String(entries[0][1]);
        // باقي الحقول تُرسل كعناصر XML
        remainingFields = Object.fromEntries(entries.slice(1));
      } else {
        remainingFields = { ...customFields };
      }
    }

    // بناء XML Parameters
    const esc = DhruFusionClient.escapeXml;
    let xml = `<PARAMETERS><ID>${esc(serviceId)}</ID><IMEI>${esc(effectiveImei)}</IMEI>`;
    
    if (quantity && quantity > 1) {
      xml += `<QNT>${quantity}</QNT>`;
    }

    if (Object.keys(remainingFields).length > 0) {
      for (const [key, value] of Object.entries(remainingFields)) {
        const xmlTag = String(key).replace(/\s+/g, '_');
        xml += `<${xmlTag}>${esc(String(value))}</${xmlTag}>`;
      }
    }

    xml += '</PARAMETERS>';

    console.log(`📝 DHRU placeOrder XML:`, xml);

    const data = await this._post('placeimeiorder', { parameters: xml });
    const success = data?.SUCCESS?.RESULT || (Array.isArray(data?.SUCCESS) ? data.SUCCESS[0] : data?.SUCCESS);

    return {
      referenceId: success?.REFERENCEID || success?.referenceid || null,
      raw: data._raw || data
    };
  }

  // ─── متابعة حالة طلب ──────────────────────────────────────
  /**
   * @param {string} referenceId - رقم المرجع من placeOrder
   */
  async getOrderStatus(referenceId) {
    if (!referenceId) throw new Error('referenceId مطلوب');

    const xml = `<PARAMETERS><ID>${DhruFusionClient.escapeXml(referenceId)}</ID></PARAMETERS>`;
    const data = await this._post('getimeiorder', { parameters: xml });
    const success = data?.SUCCESS?.RESULT || (Array.isArray(data?.SUCCESS) ? data.SUCCESS[0] : data?.SUCCESS);

    const statusCode = String(success?.STATUS || '0');
    const statusMap = {
      '0': 'waiting',     // في الطابور
      '1': 'pending',     // قيد المعالجة
      '4': 'completed',   // تم بنجاح ✅
      '2': 'rejected',    // مرفوض ❌
      '3': 'rejected',    // فشل ❌
      '5': 'rejected'     // ملغي → مرفوض ❌
    };

    const statusLabels = {
      '0': 'في الطابور',
      '1': 'قيد المعالجة',
      '4': 'تم بنجاح',
      '2': 'مرفوض',
      '3': 'فشل',
      '5': 'ملغي'
    };

    // استخراج كل الحقول المفيدة من الرد — المصادر تختلف في أسماء الحقول
    const comments = success?.COMMENTS || success?.comments || '';
    const message = success?.MESSAGE || success?.message || '';
    const code = success?.CODE || success?.code || success?.UNLOCK_CODE || success?.unlock_code || '';
    const result = success?.RESULT || success?.result || '';
    const info = success?.INFO || success?.info || '';

    // تجميع كل المحتوى الفعلي بترتيب الأولوية
    const allContent = [comments, code, result, message, info].filter(v => typeof v === 'string' && v.trim().length > 0);
    const fullResponse = allContent.length > 0 ? allContent.join('\n') : null;

    // لوق الرد الكامل لتشخيص
    if (statusCode === '4' || statusCode === '2' || statusCode === '3') {
      console.log(`[DhruFusion] getOrderStatus ref=${referenceId} status=${statusCode} SUCCESS keys:`, Object.keys(success || {}));
      console.log(`[DhruFusion] COMMENTS=${JSON.stringify(comments)}, MESSAGE=${JSON.stringify(message)}, CODE=${JSON.stringify(code)}`);
    }

    return {
      referenceId,
      statusCode,
      status: statusMap[statusCode] || 'unknown',
      statusLabel: statusLabels[statusCode] || 'غير معروف',
      comments,
      message,
      fullResponse,
      raw: data._raw || data
    };
  }
}

// ─── خطأ DHRU FUSION خاص ────────────────────────────────────
class DhruFusionError extends Error {
  constructor(message, fullDescription, rawResponse) {
    super(message);
    this.name = 'DhruFusionError';
    this.fullDescription = fullDescription || '';
    this.rawResponse = rawResponse || null;
  }
}

module.exports = { DhruFusionClient, DhruFusionError };
