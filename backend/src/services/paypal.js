/**
 * ─── PayPal Payment Processor ───
 * يدعم: إنشاء طلب → تحويل العميل → التأكيد التلقائي
 * 
 * Flow:
 * 1. createOrder() → يرجع approval URL
 * 2. العميل يوافق على PayPal
 * 3. captureOrder() → يأكد الدفع ويرجع التفاصيل
 */
const axios = require('axios');

class PayPalProcessor {
  constructor(config) {
    this.clientId = config.client_id;
    this.secret = config.secret;
    this.email = config.email;
    this.mode = config.mode || 'sandbox';
    this.baseUrl = this.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  // ─── الحصول على Access Token ───
  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');
    const { data } = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return data.access_token;
  }

  // ─── إنشاء طلب دفع ───
  async createOrder({ amount, currency = 'USD', description, returnUrl, cancelUrl, referenceId }) {
    const token = await this.getAccessToken();

    const { data } = await axios.post(
      `${this.baseUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: referenceId,
          description: description || 'NEXIRO-FLUX Payment',
          amount: {
            currency_code: currency,
            value: parseFloat(amount).toFixed(2),
          },
        }],
        application_context: {
          brand_name: 'NEXIRO-FLUX',
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const approvalLink = data.links.find(l => l.rel === 'approve');

    return {
      orderId: data.id,
      approvalUrl: approvalLink?.href,
      status: data.status,
    };
  }

  // ─── تأكيد (Capture) الدفع بعد موافقة العميل ───
  async captureOrder(orderId) {
    const token = await this.getAccessToken();

    const { data } = await axios.post(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      success: data.status === 'COMPLETED',
      transactionId: capture?.id,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
      status: data.status,
      payerEmail: data.payer?.email_address,
      raw: data,
    };
  }

  // ─── التحقق من حالة الطلب ───
  async getOrderStatus(orderId) {
    const token = await this.getAccessToken();

    const { data } = await axios.get(
      `${this.baseUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      orderId: data.id,
      status: data.status,
      amount: data.purchase_units?.[0]?.amount?.value,
      currency: data.purchase_units?.[0]?.amount?.currency_code,
    };
  }
}

module.exports = PayPalProcessor;
