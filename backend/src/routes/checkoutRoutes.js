const express = require('express');
const router = express.Router();
const {
  initCheckout,
  paypalCallback,
  cancelCallback,
  binanceWebhook,
  checkUsdtPayment,
  uploadBankReceipt,
  checkPaymentStatus,
} = require('../controllers/checkoutController');

// ─── Public Routes (بدون مصادقة) ───

// بدء عملية الدفع
router.post('/init', initCheckout);

// PayPal callback بعد موافقة/إلغاء العميل
router.get('/callback/:id', paypalCallback);
router.get('/cancel/:id', cancelCallback);

// Binance Pay Webhook
router.post('/webhooks/binance', binanceWebhook);

// التحقق من دفع USDT
router.post('/check-usdt/:id', checkUsdtPayment);

// رفع إيصال بنكي
router.post('/receipt/:id', uploadBankReceipt);

// حالة الدفع
router.get('/status/:id', checkPaymentStatus);

module.exports = router;
