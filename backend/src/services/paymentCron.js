const Payment = require('../models/Payment');
const PaymentGateway = require('../models/PaymentGateway');
const BinancePayProcessor = require('./binancePay');
const { creditWalletOnce } = require('./walletCredit');

let timer = null;

async function tick() {
  try {
    const pending = await Payment.findPendingBinancePaymentsGlobal({ limit: 60 });
    if (!Array.isArray(pending) || pending.length === 0) return;

    // Cache gateway per site
    const gatewayCache = new Map();

    for (const p of pending) {
      if (!p?.external_id || !p?.site_key) continue;
      const siteKey = p.site_key;

      let gateway = gatewayCache.get(siteKey);
      if (!gateway) {
        gateway = await PaymentGateway.findByType('binance', siteKey);
        gatewayCache.set(siteKey, gateway);
      }
      if (!gateway?.config) continue;

      try {
        const binance = new BinancePayProcessor(gateway.config);
        const result = await binance.queryOrder(p.external_id);
        if (result?.success) {
          await Payment.updateStatus(p.id, siteKey, 'completed');
          await Payment.updateMeta(p.id, siteKey, {
            binance_transaction_id: result.transactionId,
            paid_amount: result.amount,
            paid_currency: result.currency,
            paid_at: new Date().toISOString(),
            confirmed_via: 'cron_query',
          });
          await creditWalletOnce({ paymentId: p.id, siteKey });
        }
      } catch (e) {
        // keep silent to avoid log spam; next tick will retry
      }
    }
  } catch (e) {
    console.warn('[paymentCron] tick failed:', e?.message || e);
  }
}

function startPaymentCron() {
  if (timer) return;
  // run every 60s
  timer = setInterval(tick, 60 * 1000);
  // small initial delay
  setTimeout(tick, 5000);
  console.log('⏱️ paymentCron started (binance pending confirmation)');
}

module.exports = {
  startPaymentCron,
};
