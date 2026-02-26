const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  initCheckout,
  paypalCallback,
  cancelCallback,
  binanceWebhook,
  checkUsdtPayment,
  uploadBankReceipt,
  checkPaymentStatus,
} = require('../controllers/checkoutController');

// Rate limit for checkout to prevent abuse
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  validate: false,
  message: { error: 'طلبات كثيرة، حاول لاحقاً' },
});

// ─── Public Routes (مع حماية) ───

// بدء عملية الدفع (محدود بـ rate limit)
router.post('/init', checkoutLimiter, initCheckout);

// PayPal callback بعد موافقة/إلغاء العميل (PayPal يرسل token للتحقق)
router.get('/callback/:id', paypalCallback);
router.get('/cancel/:id', cancelCallback);

// Binance Pay Webhook (يحتوي على توقيع Binance)
router.post('/webhooks/binance', binanceWebhook);

// التحقق من دفع USDT (محدود)
router.post('/check-usdt/:id', checkoutLimiter, checkUsdtPayment);

// رفع إيصال بنكي (محدود — لا يكشف بيانات حساسة)
router.post('/receipt/:id', checkoutLimiter, uploadBankReceipt);

// حالة الدفع (محدود — بيانات محمية)
router.get('/status/:id', checkoutLimiter, checkPaymentStatus);

module.exports = router;
