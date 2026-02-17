const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const emailService = require('./email');

async function creditWalletOnce({ paymentId, siteKey }) {
  const payment = await Payment.findById(parseInt(paymentId));
  if (!payment || payment.site_key !== siteKey) return { credited: false, reason: 'not_found' };
  if (payment.status !== 'completed') return { credited: false, reason: 'not_completed' };
  if (payment.type !== 'deposit') return { credited: false, reason: 'not_deposit' };
  if (!payment.customer_id) return { credited: false, reason: 'no_customer' };

  const meta = (await Payment.getMeta(payment.id, siteKey)) || {};
  if (meta.wallet_credited_at) return { credited: false, reason: 'already_credited' };

  const before = await Customer.findById(payment.customer_id);
  await Customer.updateWallet(payment.customer_id, siteKey, parseFloat(payment.amount));
  const after = await Customer.findById(payment.customer_id);

  await Payment.updateMeta(payment.id, siteKey, {
    wallet_credited_at: new Date().toISOString(),
    wallet_old_balance: before?.wallet_balance,
    wallet_new_balance: after?.wallet_balance,
  });

  try {
    if (meta?.customer_email) {
      await emailService.sendWalletUpdated({
        to: meta.customer_email,
        name: meta.customer_name || 'عميل',
        oldBalance: Number(before?.wallet_balance || 0),
        newBalance: Number(after?.wallet_balance || 0),
        currency: meta.currency || payment.currency || 'USD',
        siteKey,
      });
    }
  } catch {
    // ignore
  }

  return { credited: true };
}

module.exports = {
  creditWalletOnce,
};
