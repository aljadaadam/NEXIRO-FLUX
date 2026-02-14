/**
 * ─── Binance Pay Processor ───
 * يدعم: إنشاء طلب دفع → رابط دفع / QR → Webhook تأكيد
 *
 * Flow:
 * 1. createOrder() → يرجع رابط الدفع
 * 2. العميل يدفع عبر تطبيق Binance
 * 3. Webhook يأكد الدفع تلقائياً
 */
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const BINANCE_PAY_URL = 'https://bpay.binanceapi.com/binancepay/openapi/v3/order';

class BinancePayProcessor {
  constructor(config) {
    this.apiKey = config.api_key;
    this.apiSecret = config.api_secret;
    this.merchantId = config.binance_id;
  }

  // ─── إنشاء توقيع HMAC-SHA512 ───
  _createSignature(payload, timestamp, nonce) {
    const payloadString = JSON.stringify(payload);
    const dataToSign = `${timestamp}\n${nonce}\n${payloadString}\n`;
    return crypto
      .createHmac('sha512', this.apiSecret)
      .update(dataToSign, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  // ─── إنشاء طلب دفع ───
  async createOrder({ amount, currency = 'USDT', description, referenceId, returnUrl, cancelUrl, webhookUrl }) {
    const timestamp = Date.now().toString();
    const nonce = uuidv4().replace(/-/g, '');
    const tradeNo = referenceId || `NF${Date.now()}`;

    const payload = {
      env: {
        terminalType: 'APP',
      },
      merchantTradeNo: tradeNo,
      orderAmount: parseFloat(amount).toFixed(2),
      currency: currency,
      description: description || 'NEXIRO-FLUX Payment',
      goodsDetails: [{
        goodsType: '01',
        goodsCategory: '6000',
        referenceGoodsId: tradeNo,
        goodsName: description || 'NEXIRO-FLUX Service',
      }],
    };

    // Only include optional URLs if provided
    if (returnUrl) payload.returnUrl = returnUrl;
    if (webhookUrl) payload.webhookUrl = webhookUrl;

    const signature = this._createSignature(payload, timestamp, nonce);

    let data;
    try {
      const response = await axios.post(BINANCE_PAY_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'BinancePay-Timestamp': timestamp,
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': this.apiKey,
          'BinancePay-Signature': signature,
          'User-Agent': 'BinancePay/1.0',
        },
      });
      data = response.data;
    } catch (axiosErr) {
      const respData = axiosErr.response?.data;
      if (respData?.errorMessage) {
        throw new Error(`Binance Pay API [${respData.code}]: ${respData.errorMessage}`);
      }
      throw new Error(`Binance Pay request failed: ${axiosErr.message}`);
    }

    if (data.status !== 'SUCCESS') {
      throw new Error(`Binance Pay Error [${data.code || 'UNKNOWN'}]: ${data.errorMessage || JSON.stringify(data)}`);
    }

    return {
      orderId: data.data.prepayId,
      checkoutUrl: data.data.checkoutUrl || data.data.universalUrl || data.data.deeplink,
      qrContent: data.data.qrcodeLink,
      merchantTradeNo: tradeNo,
      status: 'PENDING',
    };
  }

  // ─── التحقق من حالة الطلب ───
  async queryOrder(merchantTradeNo) {
    const timestamp = Date.now().toString();
    const nonce = uuidv4().replace(/-/g, '');

    const body = { merchantTradeNo };
    const signature = this._createSignature(body, timestamp, nonce);

    const { data } = await axios.post(
      'https://bpay.binanceapi.com/binancepay/openapi/v2/order/query',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'BinancePay-Timestamp': timestamp,
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': this.apiKey,
          'BinancePay-Signature': signature,
          'User-Agent': 'BinancePay/1.0',
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
    const payloadString = JSON.stringify(body);
    const dataToSign = `${timestamp}\n${nonce}\n${payloadString}\n`;
    const expectedSignature = crypto
      .createHmac('sha512', this.apiSecret)
      .update(dataToSign, 'utf8')
      .digest('hex')
      .toUpperCase();

    return expectedSignature === receivedSignature;
  }
}

module.exports = BinancePayProcessor;
