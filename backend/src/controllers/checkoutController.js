/**
 * ─── Checkout Controller ───
 * يدير عملية الدفع الكاملة لجميع البوابات:
 * PayPal / Binance Pay / USDT / تحويل بنكي
 */
const Payment = require('../models/Payment');
const PaymentGateway = require('../models/PaymentGateway');
const PayPalProcessor = require('../services/paypal');
const BinancePayProcessor = require('../services/binancePay');
const USDTProcessor = require('../services/usdt');
const emailService = require('../services/email');
const { SITE_KEY } = require('../config/env');
const { verifyToken } = require('../utils/token');
const { creditWalletOnce } = require('../services/walletCredit');

// Helper: get siteKey from request (fallback to platform SITE_KEY for setup checkout)
function getSiteKey(req) {
  return req.siteKey || req.user?.site_key || SITE_KEY;
}

function tryAttachUserFromAuthHeader(req) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return;
    const decoded = verifyToken(token);
    if (!decoded) return;
    req.user = { id: decoded.id, role: decoded.role, site_key: decoded.site_key };
    if (!req.siteKey) req.siteKey = decoded.site_key;
  } catch {
    // ignore
  }
}

// wallet credit helper lives in ../services/walletCredit

// ─── بدء عملية الدفع ───
async function initCheckout(req, res) {
  try {
    // Allow passing customer JWT optionally (wallet top-up needs it)
    tryAttachUserFromAuthHeader(req);

    const {
      gateway_id,
      amount,
      currency,
      product_id,
      description,
      customer_name,
      customer_email,
      country,
      template_id,
      plan,
      type,
    } = req.body;

    // تحقق
    if (!gateway_id || !amount) {
      return res.status(400).json({ error: 'gateway_id و amount مطلوبان' });
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'المبلغ يجب أن يكون أكبر من 0' });
    }

    // جلب البوابة
    const gateway = await PaymentGateway.findById(parseInt(gateway_id), getSiteKey(req));
    if (!gateway || !gateway.is_enabled) {
      return res.status(404).json({ error: 'بوابة الدفع غير موجودة أو معطلة' });
    }

    const checkoutType = type === 'deposit' ? 'deposit' : 'purchase';
    const customerId = checkoutType === 'deposit'
      ? (req.user?.role === 'customer' ? req.user.id : null)
      : null;
    if (checkoutType === 'deposit' && !customerId) {
      return res.status(401).json({ error: 'يلزم تسجيل دخول الزبون لشحن المحفظة' });
    }

    // إنشاء سجل الدفع بحالة pending
    const payment = await Payment.create({
      site_key: getSiteKey(req),
      customer_id: customerId,
      order_id: null,
      type: checkoutType,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      payment_method: gateway.type,
      payment_gateway_id: gateway.id,
      status: 'pending',
      description: description || `Payment for product #${product_id}`,
    });

    // حفظ metadata
    await Payment.updateMeta(payment.id, getSiteKey(req), {
      product_id,
      customer_name,
      customer_email,
      country,
      gateway_type: gateway.type,
      template_id: template_id || product_id || null,
      plan: plan || null,
      checkout_type: checkoutType,
      customer_id: customerId,
      currency: currency || 'USD',
    });

    const referenceId = `NF${payment.id}T${Date.now()}`;
    const baseUrl = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    // Support custom frontend return URLs (e.g. Setup Wizard wants to come back to /setup)
    const frontendReturnUrl = req.body.return_url || '';
    const frontendCancelUrl = req.body.cancel_url || '';
    const returnUrl = `${baseUrl}/api/checkout/callback/${payment.id}${frontendReturnUrl ? `?frontend_return=${encodeURIComponent(frontendReturnUrl)}` : ''}`;
    const cancelUrl = `${baseUrl}/api/checkout/cancel/${payment.id}${frontendCancelUrl ? `?frontend_return=${encodeURIComponent(frontendCancelUrl)}` : ''}`;

    let result;

    switch (gateway.type) {
      // ━━━━━ PayPal ━━━━━
      case 'paypal': {
        const paypal = new PayPalProcessor(gateway.config);
        const order = await paypal.createOrder({
          amount,
          currency: currency || 'USD',
          description,
          returnUrl,
          cancelUrl,
          referenceId,
        });
        await Payment.updateExternalId(payment.id, getSiteKey(req), order.orderId);
        result = {
          method: 'redirect',
          redirectUrl: order.approvalUrl,
          orderId: order.orderId,
        };
        break;
      }

      // ━━━━━ Binance Pay ━━━━━
      case 'binance': {
        const binance = new BinancePayProcessor(gateway.config);
        // Binance returnUrl goes to frontend directly, webhookUrl is for server notifications
        const frontendUrl = process.env.FRONTEND_URL || 'https://nexiroflux.com';
        let binanceReturnUrl = req.body.return_url || `${frontendUrl}/checkout/success`;
        // Replace placeholder with actual payment ID
        binanceReturnUrl = binanceReturnUrl.replace('__PAYMENT_ID__', payment.id);
        const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
        const binanceWebhookUrl = `${backendUrl}/api/checkout/webhooks/binance`;
        const order = await binance.createOrder({
          amount,
          currency: 'USDT',
          description,
          referenceId,
          returnUrl: binanceReturnUrl,
          cancelUrl: req.body.cancel_url || `${frontendUrl}/checkout/cancelled`,
          webhookUrl: binanceWebhookUrl,
        });
        await Payment.updateExternalId(payment.id, getSiteKey(req), order.merchantTradeNo);
        result = {
          method: 'qr_or_redirect',
          checkoutUrl: order.checkoutUrl,
          qrContent: order.qrContent,
          orderId: order.merchantTradeNo,
        };
        break;
      }

      // ━━━━━ USDT ━━━━━
      case 'usdt': {
        const usdt = new USDTProcessor(gateway.config);
        const paymentInfo = usdt.createPayment({
          amount,
          referenceId,
        });
        await Payment.updateExternalId(payment.id, getSiteKey(req), referenceId);
        const USDT_EXPIRY_MS = 30 * 60 * 1000;
        result = {
          method: 'manual_crypto',
          walletAddress: paymentInfo.walletAddress,
          network: paymentInfo.network,
          amount: paymentInfo.amount,
          currency: 'USDT',
          contractAddress: paymentInfo.contractAddress,
          instructions: paymentInfo.instructions,
          expires_in: USDT_EXPIRY_MS / 1000, // 1800 seconds
          expires_at: new Date(Date.now() + USDT_EXPIRY_MS).toISOString(),
        };
        break;
      }

      // ━━━━━ تحويل بنكي ━━━━━
      case 'bank_transfer': {
        const config = gateway.config;
        await Payment.updateExternalId(payment.id, getSiteKey(req), referenceId);
        result = {
          method: 'manual_bank',
          bankDetails: {
            bank_name: config.bank_name,
            account_holder: config.account_holder,
            iban: config.iban,
            swift: config.swift,
            account_number: config.account_number,
            currency: config.currency || currency || 'USD',
          },
          referenceId,
          instructions: {
            ar: `حوّل المبلغ ${amount} ${currency || 'USD'} إلى الحساب أعلاه واكتب رقم المرجع "${referenceId}" في وصف التحويل. بعد التحويل ارفع إيصال الدفع.`,
            en: `Transfer ${amount} ${currency || 'USD'} to the account above and include reference "${referenceId}" in the transfer description. After transfer, upload your receipt.`,
          },
        };
        break;
      }

      default:
        return res.status(400).json({ error: `نوع بوابة غير مدعوم: ${gateway.type}` });
    }

    res.json({
      success: true,
      paymentId: payment.id,
      gatewayType: gateway.type,
      ...result,
    });

  } catch (error) {
    console.error('❌ Checkout error:', error.message, error.response?.data || '');
    res.status(500).json({ error: 'فشل في بدء عملية الدفع', details: error.message });
  }
}

// ─── PayPal Callback (بعد موافقة العميل) ───
async function paypalCallback(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query; // PayPal order ID from query

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== getSiteKey(req)) {
      return res.redirect(`/?payment=error&msg=not_found`);
    }

    const gateway = await PaymentGateway.findById(payment.payment_gateway_id, getSiteKey(req));
    if (!gateway) {
      return res.redirect(`/?payment=error&msg=gateway_not_found`);
    }

    const paypal = new PayPalProcessor(gateway.config);
    const capture = await paypal.captureOrder(token || payment.external_id);

    if (capture.success) {
      await Payment.updateStatus(payment.id, getSiteKey(req), 'completed');
      await Payment.updateMeta(payment.id, getSiteKey(req), {
        transaction_id: capture.transactionId,
        payer_email: capture.payerEmail,
        captured_amount: capture.amount,
        captured_at: new Date().toISOString(),
      });

      // Credit wallet if this was a deposit
      await creditWalletOnce({ paymentId: payment.id, siteKey: getSiteKey(req) });

      // بريد إيصال الدفع
      try {
        const meta = await Payment.getMeta(payment.id, getSiteKey(req));
        if (meta?.customer_email) {
          emailService.sendPaymentReceipt({
            to: meta.customer_email, name: meta.customer_name,
            amount: capture.amount || payment.amount, currency: 'USD',
            method: 'PayPal', transactionId: capture.transactionId,
            siteKey: getSiteKey(req)
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }

      // ✅ إعادة توجيه لصفحة نجاح
      const frontendReturn = req.query.frontend_return;
      if (frontendReturn) {
        const sep = frontendReturn.includes('?') ? '&' : '?';
        return res.redirect(`${frontendReturn}${sep}payment_id=${payment.id}&payment_status=success`);
      }
      const frontendUrl = process.env.FRONTEND_URL || 'https://nexiroflux.com';
      return res.redirect(`${frontendUrl}/checkout/success?payment_id=${payment.id}`);
    } else {
      await Payment.updateStatus(payment.id, getSiteKey(req), 'failed');

      // بريد فشل الدفع
      try {
        const meta = await Payment.getMeta(payment.id, getSiteKey(req));
        if (meta?.customer_email) {
          emailService.sendPaymentFailed({
            to: meta.customer_email, name: meta.customer_name,
            amount: payment.amount, currency: payment.currency,
            reason: 'PayPal capture failed',
            siteKey: getSiteKey(req)
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }

      const frontendReturn = req.query.frontend_return;
      if (frontendReturn) {
        const sep = frontendReturn.includes('?') ? '&' : '?';
        return res.redirect(`${frontendReturn}${sep}payment_id=${payment.id}&payment_status=failed`);
      }
      const frontendUrl = process.env.FRONTEND_URL || 'https://nexiroflux.com';
      return res.redirect(`${frontendUrl}/checkout/failed?payment_id=${payment.id}`);
    }
  } catch (error) {
    console.error('❌ PayPal callback error:', error);
    const frontendReturn = req.query.frontend_return;
    if (frontendReturn) {
      const sep = frontendReturn.includes('?') ? '&' : '?';
      return res.redirect(`${frontendReturn}${sep}payment_status=failed&error=${encodeURIComponent(error.message)}`);
    }
    const frontendUrl = process.env.FRONTEND_URL || 'https://nexiroflux.com';
    return res.redirect(`${frontendUrl}/checkout/failed?error=${encodeURIComponent(error.message)}`);
  }
}

// ─── Cancel Callback ───
async function cancelCallback(req, res) {
  try {
    const { id } = req.params;
    await Payment.updateStatus(parseInt(id), getSiteKey(req), 'cancelled');
    const frontendReturn = req.query.frontend_return;
    if (frontendReturn) {
      const sep = frontendReturn.includes('?') ? '&' : '?';
      return res.redirect(`${frontendReturn}${sep}payment_id=${id}&payment_status=cancelled`);
    }
    const frontendUrl = process.env.FRONTEND_URL || 'https://nexiroflux.com';
    return res.redirect(`${frontendUrl}/checkout/cancelled?payment_id=${id}`);
  } catch (error) {
    console.error('❌ Cancel callback error:', error);
    res.redirect('/?payment=cancelled');
  }
}

// ─── Binance Pay Webhook ───
async function binanceWebhook(req, res) {
  try {
    const { bizType, data: webhookData } = req.body;

    if (bizType !== 'PAY') {
      return res.json({ returnCode: 'SUCCESS', returnMessage: 'OK' });
    }

    const merchantTradeNo = webhookData?.merchantTradeNo;
    if (!merchantTradeNo) {
      return res.json({ returnCode: 'SUCCESS', returnMessage: 'No trade number' });
    }

    // البحث عن الدفعة بالـ external_id (بدون site_key لأن الطلب من Binance)
    const payment = await Payment.findByExternalIdGlobal(merchantTradeNo);
    if (!payment) {
      console.warn('Binance Webhook: payment not found for', merchantTradeNo);
      return res.json({ returnCode: 'SUCCESS', returnMessage: 'Not found' });
    }

    const siteKey = payment.site_key;

    // ─── التحقق من توقيع Binance Webhook ───
    const signature = req.headers['binancepay-signature'];
    const timestamp = req.headers['binancepay-timestamp'];
    const nonce = req.headers['binancepay-nonce'];

    if (!signature || !timestamp || !nonce) {
      console.warn('Binance Webhook: missing signature headers');
      return res.status(401).json({ returnCode: 'FAIL', returnMessage: 'Missing signature' });
    }

    const binanceGateway = await PaymentGateway.findByType('binance', siteKey);
    if (binanceGateway?.config) {
      const binance = new BinancePayProcessor(binanceGateway.config);
      const isValid = binance.verifyWebhook(timestamp, nonce, req.body, signature);
      if (!isValid) {
        console.warn('Binance Webhook: invalid signature for payment', payment.id);
        return res.status(401).json({ returnCode: 'FAIL', returnMessage: 'Invalid signature' });
      }
    } else {
      console.warn('Binance Webhook: no gateway config found for site', siteKey);
    }

    if (webhookData.status === 'PAID') {
      await Payment.updateStatus(payment.id, siteKey, 'completed');
      await Payment.updateMeta(payment.id, siteKey, {
        binance_transaction_id: webhookData.transactionId,
        paid_amount: webhookData.totalFee,
        paid_at: new Date().toISOString(),
      });

      // Credit wallet if this was a deposit
      await creditWalletOnce({ paymentId: payment.id, siteKey });

      // بريد إيصال الدفع
      try {
        const meta = await Payment.getMeta(payment.id, siteKey);
        if (meta?.customer_email) {
          emailService.sendPaymentReceipt({
            to: meta.customer_email, name: meta.customer_name,
            amount: webhookData.totalFee || payment.amount, currency: 'USDT',
            method: 'Binance Pay', transactionId: webhookData.transactionId,
            siteKey
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }

      console.log(`Binance payment confirmed: #${payment.id}`);
    }

    return res.json({ returnCode: 'SUCCESS', returnMessage: 'OK' });
  } catch (error) {
    console.error('Binance webhook error:', error);
    return res.json({ returnCode: 'FAIL', returnMessage: error.message });
  }
}

// ─── التحقق من دفع USDT يدوياً ───
async function checkUsdtPayment(req, res) {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== getSiteKey(req)) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    if (payment.status === 'completed') {
      return res.json({ confirmed: true, message: 'الدفع مؤكد مسبقاً' });
    }

    // ─── التحقق من انتهاء المهلة (30 دقيقة) ───
    const USDT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
    const createdAt = new Date(payment.created_at).getTime();
    const now = Date.now();
    const elapsed = now - createdAt;
    const remaining = Math.max(0, USDT_EXPIRY_MS - elapsed);

    if (elapsed > USDT_EXPIRY_MS) {
      // انتهت المهلة — أغلق الدفعة
      if (payment.status === 'pending') {
        await Payment.updateStatus(payment.id, getSiteKey(req), 'failed');
        await Payment.updateMeta(payment.id, getSiteKey(req), {
          expired_at: new Date().toISOString(),
          expiry_reason: 'USDT payment timeout (30 minutes)',
        });
      }
      return res.status(410).json({
        expired: true,
        confirmed: false,
        message: 'انتهت مهلة الدفع (30 دقيقة). يرجى إنشاء عملية دفع جديدة',
        messageEn: 'Payment expired (30 minutes). Please create a new payment',
        remaining: 0,
      });
    }

    const gateway = await PaymentGateway.findById(payment.payment_gateway_id, getSiteKey(req));
    if (!gateway || gateway.type !== 'usdt') {
      return res.status(400).json({ error: 'هذه الدفعة ليست USDT' });
    }

    const usdt = new USDTProcessor(gateway.config);
    const result = await usdt.checkPayment({
      amount: payment.amount,
      sinceTimestamp: createdAt,
    });

    if (result.confirmed) {
      await Payment.updateStatus(payment.id, getSiteKey(req), 'completed');
      await Payment.updateMeta(payment.id, getSiteKey(req), {
        crypto_tx_id: result.transactionId,
        crypto_from: result.from,
        confirmed_amount: result.amount,
        confirmed_at: new Date().toISOString(),
      });

      // Credit wallet if this was a deposit
      await creditWalletOnce({ paymentId: payment.id, siteKey: getSiteKey(req) });

      // بريد إيصال USDT
      try {
        const meta = await Payment.getMeta(payment.id, getSiteKey(req));
        if (meta?.customer_email) {
          emailService.sendPaymentReceipt({
            to: meta.customer_email, name: meta.customer_name,
            amount: result.amount || payment.amount, currency: 'USDT',
            method: 'USDT', transactionId: result.transactionId,
            siteKey: getSiteKey(req)
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }

      return res.json({
        confirmed: true,
        transactionId: result.transactionId,
        amount: result.amount,
        message: 'تم تأكيد الدفع بنجاح',
        messageEn: 'Payment confirmed successfully',
        remaining: 0,
      });
    }

    // خطأ من API (مفتاح غير صالح، rate limit، عنوان خاطئ)
    if (result.error && result.error !== 'check_failed') {
      return res.json({
        confirmed: false,
        error: result.error,
        message: result.message || 'فشل في التحقق',
        messageEn: result.messageEn || 'Verification failed',
        remaining: Math.floor(remaining / 1000),
        expires_at: new Date(createdAt + USDT_EXPIRY_MS).toISOString(),
      });
    }

    return res.json({
      confirmed: false,
      message: result.message || 'لم يتم العثور على تحويل مطابق بعد. حاول مرة أخرى.',
      messageEn: result.messageEn || 'No matching transfer found yet. Try again.',
      checkedTransactions: result.transactions,
      remaining: Math.floor(remaining / 1000),
      expires_at: new Date(createdAt + USDT_EXPIRY_MS).toISOString(),
    });

  } catch (error) {
    console.error('❌ USDT check error:', error);
    res.status(500).json({ error: 'فشل في التحقق من الدفع', details: error.message });
  }
}

// ─── رفع إيصال بنكي ───
async function uploadBankReceipt(req, res) {
  try {
    const { id } = req.params;
    const { receipt_url, notes } = req.body;

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== getSiteKey(req)) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    await Payment.updateMeta(payment.id, getSiteKey(req), {
      receipt_url,
      receipt_notes: notes,
      receipt_uploaded_at: new Date().toISOString(),
    });

    // تغير الحالة إلى "بانتظار المراجعة"
    await Payment.updateStatus(payment.id, getSiteKey(req), 'pending');

    // تنبيه بريدي بالإيصال البنكي
    try {
      const meta = await Payment.getMeta(payment.id, getSiteKey(req));
      emailService.sendBankReceiptReview({
        orderId: payment.id,
        customerName: meta?.customer_name || 'عميل',
        amount: payment.amount,
        siteKey: getSiteKey(req)
      }).catch(() => {});
    } catch (e) { /* ignore */ }

    res.json({
      success: true,
      message: 'تم رفع الإيصال بنجاح. سيتم مراجعته وتأكيد الدفع.',
    });
  } catch (error) {
    console.error('❌ Receipt upload error:', error);
    res.status(500).json({ error: 'فشل في رفع الإيصال' });
  }
}

// ─── التحقق من حالة الدفع (للعميل) ───
async function checkPaymentStatus(req, res) {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== getSiteKey(req)) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    // إذا كانت binance ولم تأكد بعد، استعلم من API
    if (payment.status === 'pending' && payment.payment_method === 'binance' && payment.external_id) {
      const gateway = await PaymentGateway.findById(payment.payment_gateway_id, getSiteKey(req));
      if (gateway) {
        try {
          const binance = new BinancePayProcessor(gateway.config);
          const result = await binance.queryOrder(payment.external_id);
          if (result.success) {
            await Payment.updateStatus(payment.id, getSiteKey(req), 'completed');
            await creditWalletOnce({ paymentId: payment.id, siteKey: getSiteKey(req) });
            return res.json({ status: 'completed', message: '✅ تم تأكيد الدفع' });
          }
        } catch (e) {
          console.warn('Binance query check failed:', e.message);
        }
      }
    }

    const meta = await Payment.getMeta(payment.id, getSiteKey(req));

    res.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.payment_method,
      created_at: payment.created_at,
      meta: meta || {},
    });
  } catch (error) {
    console.error('❌ Payment status error:', error);
    res.status(500).json({ error: 'فشل في جلب حالة الدفع' });
  }
}

module.exports = {
  initCheckout,
  paypalCallback,
  cancelCallback,
  binanceWebhook,
  checkUsdtPayment,
  uploadBankReceipt,
  checkPaymentStatus,
};
