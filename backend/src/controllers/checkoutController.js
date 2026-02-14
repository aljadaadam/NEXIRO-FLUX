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
const { SITE_KEY } = require('../config/env');

// ─── بدء عملية الدفع ───
async function initCheckout(req, res) {
  try {
    const {
      gateway_id,
      amount,
      currency,
      product_id,
      description,
      customer_name,
      customer_email,
      country,
    } = req.body;

    // تحقق
    if (!gateway_id || !amount) {
      return res.status(400).json({ error: 'gateway_id و amount مطلوبان' });
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'المبلغ يجب أن يكون أكبر من 0' });
    }

    // جلب البوابة
    const gateway = await PaymentGateway.findById(parseInt(gateway_id), SITE_KEY);
    if (!gateway || !gateway.is_enabled) {
      return res.status(404).json({ error: 'بوابة الدفع غير موجودة أو معطلة' });
    }

    // إنشاء سجل الدفع بحالة pending
    const payment = await Payment.create({
      site_key: SITE_KEY,
      customer_id: null,
      order_id: null,
      type: 'purchase',
      amount: parseFloat(amount),
      currency: currency || 'USD',
      payment_method: gateway.type,
      payment_gateway_id: gateway.id,
      status: 'pending',
      description: description || `Payment for product #${product_id}`,
    });

    // حفظ metadata
    await Payment.updateMeta(payment.id, SITE_KEY, {
      product_id,
      customer_name,
      customer_email,
      country,
      gateway_type: gateway.type,
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
        await Payment.updateExternalId(payment.id, SITE_KEY, order.orderId);
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
        const binanceWebhookUrl = `${req.protocol}://${req.get('host')}/api/checkout/webhooks/binance`;
        const order = await binance.createOrder({
          amount,
          currency: 'USDT',
          description,
          referenceId,
          returnUrl: binanceReturnUrl,
          cancelUrl: req.body.cancel_url || `${frontendUrl}/checkout/cancelled`,
          webhookUrl: binanceWebhookUrl,
        });
        await Payment.updateExternalId(payment.id, SITE_KEY, order.merchantTradeNo);
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
        await Payment.updateExternalId(payment.id, SITE_KEY, referenceId);
        result = {
          method: 'manual_crypto',
          walletAddress: paymentInfo.walletAddress,
          network: paymentInfo.network,
          amount: paymentInfo.amount,
          currency: 'USDT',
          contractAddress: paymentInfo.contractAddress,
          instructions: paymentInfo.instructions,
        };
        break;
      }

      // ━━━━━ تحويل بنكي ━━━━━
      case 'bank_transfer': {
        const config = gateway.config;
        await Payment.updateExternalId(payment.id, SITE_KEY, referenceId);
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
    if (!payment || payment.site_key !== SITE_KEY) {
      return res.redirect(`/?payment=error&msg=not_found`);
    }

    const gateway = await PaymentGateway.findById(payment.payment_gateway_id, SITE_KEY);
    if (!gateway) {
      return res.redirect(`/?payment=error&msg=gateway_not_found`);
    }

    const paypal = new PayPalProcessor(gateway.config);
    const capture = await paypal.captureOrder(token || payment.external_id);

    if (capture.success) {
      await Payment.updateStatus(payment.id, SITE_KEY, 'completed');
      await Payment.updateMeta(payment.id, SITE_KEY, {
        transaction_id: capture.transactionId,
        payer_email: capture.payerEmail,
        captured_amount: capture.amount,
        captured_at: new Date().toISOString(),
      });

      // ✅ إعادة توجيه لصفحة نجاح
      const frontendReturn = req.query.frontend_return;
      if (frontendReturn) {
        const sep = frontendReturn.includes('?') ? '&' : '?';
        return res.redirect(`${frontendReturn}${sep}payment_id=${payment.id}&payment_status=success`);
      }
      const frontendUrl = process.env.FRONTEND_URL || 'https://nexiroflux.com';
      return res.redirect(`${frontendUrl}/checkout/success?payment_id=${payment.id}`);
    } else {
      await Payment.updateStatus(payment.id, SITE_KEY, 'failed');
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
    await Payment.updateStatus(parseInt(id), SITE_KEY, 'cancelled');
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

    // البحث عن الدفعة بالـ external_id
    const payment = await Payment.findByExternalId(merchantTradeNo, SITE_KEY);
    if (!payment) {
      console.warn('Binance Webhook: payment not found for', merchantTradeNo);
      return res.json({ returnCode: 'SUCCESS', returnMessage: 'Not found' });
    }

    if (webhookData.status === 'PAID') {
      await Payment.updateStatus(payment.id, SITE_KEY, 'completed');
      await Payment.updateMeta(payment.id, SITE_KEY, {
        binance_transaction_id: webhookData.transactionId,
        paid_amount: webhookData.totalFee,
        paid_at: new Date().toISOString(),
      });
      console.log(`✅ Binance payment confirmed: #${payment.id}`);
    }

    return res.json({ returnCode: 'SUCCESS', returnMessage: 'OK' });
  } catch (error) {
    console.error('❌ Binance webhook error:', error);
    return res.json({ returnCode: 'FAIL', returnMessage: error.message });
  }
}

// ─── التحقق من دفع USDT يدوياً ───
async function checkUsdtPayment(req, res) {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== SITE_KEY) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    if (payment.status === 'completed') {
      return res.json({ confirmed: true, message: 'الدفع مؤكد مسبقاً' });
    }

    const gateway = await PaymentGateway.findById(payment.payment_gateway_id, SITE_KEY);
    if (!gateway || gateway.type !== 'usdt') {
      return res.status(400).json({ error: 'هذه الدفعة ليست USDT' });
    }

    const usdt = new USDTProcessor(gateway.config);
    const result = await usdt.checkPayment({
      amount: payment.amount,
      sinceTimestamp: new Date(payment.created_at).getTime(),
    });

    if (result.confirmed) {
      await Payment.updateStatus(payment.id, SITE_KEY, 'completed');
      await Payment.updateMeta(payment.id, SITE_KEY, {
        crypto_tx_id: result.transactionId,
        crypto_from: result.from,
        confirmed_amount: result.amount,
        confirmed_at: new Date().toISOString(),
      });
      return res.json({
        confirmed: true,
        transactionId: result.transactionId,
        amount: result.amount,
        message: '✅ تم تأكيد الدفع بنجاح',
      });
    }

    return res.json({
      confirmed: false,
      message: 'لم يتم العثور على تحويل مطابق بعد. حاول مرة أخرى.',
      checkedTransactions: result.transactions,
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
    if (!payment || payment.site_key !== SITE_KEY) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    await Payment.updateMeta(payment.id, SITE_KEY, {
      receipt_url,
      receipt_notes: notes,
      receipt_uploaded_at: new Date().toISOString(),
    });

    // تغير الحالة إلى "بانتظار المراجعة"
    await Payment.updateStatus(payment.id, SITE_KEY, 'pending');

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
    if (!payment || payment.site_key !== SITE_KEY) {
      return res.status(404).json({ error: 'الدفعة غير موجودة' });
    }

    // إذا كانت binance ولم تأكد بعد، استعلم من API
    if (payment.status === 'pending' && payment.payment_method === 'binance' && payment.external_id) {
      const gateway = await PaymentGateway.findById(payment.payment_gateway_id, SITE_KEY);
      if (gateway) {
        try {
          const binance = new BinancePayProcessor(gateway.config);
          const result = await binance.queryOrder(payment.external_id);
          if (result.success) {
            await Payment.updateStatus(payment.id, SITE_KEY, 'completed');
            return res.json({ status: 'completed', message: '✅ تم تأكيد الدفع' });
          }
        } catch (e) {
          console.warn('Binance query check failed:', e.message);
        }
      }
    }

    const meta = await Payment.getMeta(payment.id, SITE_KEY);

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
