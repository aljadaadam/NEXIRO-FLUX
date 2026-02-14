/**
 * ─── Binance Pay Processor ───
 * يدعم: إنشاء طلب دفع → QR Code / رابط → Webhook تأكيد
 *
 * Flow:
 * 1. createOrder() → يرجع QR code URL ورابط الدفع
 * 2. العميل يدفع عبر تطبيق Binance
 * 3. Webhook يأكد الدفع تلقائياً
 */
const axios = require('axios');
const crypto = require('crypto');

class BinancePayProcessor {
  constructor(config) {
    this.apiKey = config.api_key;
    this.apiSecret = config.api_secret;
    this.merchantId = config.binance_id;
    this.baseUrl = 'https://bpay.binanceapi.com';
  }

  // ─── إنشاء توقيع ───
  _generateSignature(timestamp, nonce, body) {
    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
    return crypto
      .createHmac('sha512', this.apiSecret)
      .update(payload)
      .digest('hex')
      .toUpperCase();
  }

  // ─── إنشاء Nonce عشوائي ───
  _generateNonce(length = 32) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ─── إنشاء طلب دفع ───
  async createOrder({ amount, currency = 'USDT', description, referenceId, returnUrl, cancelUrl }) {
    const timestamp = Date.now();
    const nonce = this._generateNonce();

    const body = {
      env: {
        terminalType: 'WEB',
      },
      merchantTradeNo: referenceId || `NF${timestamp}`,
      orderAmount: parseFloat(amount).toFixed(2),
      currency: currency,
      description: description || 'NEXIRO-FLUX Payment',
      goodsType: '02', // Virtual goods
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
      webhookUrl: null, // سيتم تعيينه من الـ controller
    };

    const signature = this._generateSignature(timestamp, nonce, body);

    const { data } = await axios.post(
      `${this.baseUrl}/binancepay/openapi/v3/order`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'BinancePay-Timestamp': timestamp,
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': this.apiKey,
          'BinancePay-Signature': signature,
        },
      }
    );

    if (data.status !== 'SUCCESS') {
      throw new Error(`Binance Pay Error: ${data.errorMessage || 'Unknown error'}`);
    }

    return {
      orderId: data.data.prepayId,
      checkoutUrl: data.data.universalUrl || data.data.deeplink,
      qrContent: data.data.qrcodeLink,
      merchantTradeNo: body.merchantTradeNo,
      status: 'PENDING',
    };
  }

  // ─── التحقق من حالة الطلب ───
  async queryOrder(merchantTradeNo) {
    const timestamp = Date.now();
    const nonce = this._generateNonce();

    const body = { merchantTradeNo };
    const signature = this._generateSignature(timestamp, nonce, body);

    const { data } = await axios.post(
      `${this.baseUrl}/binancepay/openapi/v2/order/query`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'BinancePay-Timestamp': timestamp,
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': this.apiKey,
          'BinancePay-Signature': signature,
        },
      }
    );

    if (data.status !== 'SUCCESS') {
      throw new Error(`Binance Query Error: ${data.errorMessage}`);
    }

    return {
      orderId: data.data.prepayId,
      merchantTradeNo: data.data.merchantTradeNo,
      status: data.data.status, // INITIAL, PENDING, PAID, CANCELED, ERROR, REFUNDING, REFUNDED, EXPIRED
      amount: data.data.orderAmount,
      currency: data.data.currency,
      transactionId: data.data.transactionId,
      success: data.data.status === 'PAID',
    };
  }

  // ─── التحقق من صحة Webhook ───
  verifyWebhook(timestamp, nonce, body, receivedSignature) {
    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
    const expectedSignature = crypto
      .createHmac('sha512', this.apiSecret)
      .update(payload)
      .digest('hex')
      .toUpperCase();

    return expectedSignature === receivedSignature;
  }
}

module.exports = BinancePayProcessor;
