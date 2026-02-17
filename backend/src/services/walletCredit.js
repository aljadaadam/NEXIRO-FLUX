const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
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

  // Use customer record directly (meta may not have email for wallet deposits)
  const customerEmail = meta?.customer_email || before?.email;
  const customerName = meta?.customer_name || before?.name || 'عميل';

  // ─── In-app Notification ───
  try {
    await Notification.create({
      site_key: siteKey,
      recipient_type: 'customer',
      recipient_id: payment.customer_id,
      title: 'تم شحن المحفظة ✅',
      message: `تم إضافة $${parseFloat(payment.amount).toFixed(2)} إلى محفظتك. رصيدك الحالي: $${parseFloat(after?.wallet_balance || 0).toFixed(2)}`,
      type: 'payment',
    });
  } catch {
    // ignore
  }

  // ─── Email Notification ───
  try {
    if (customerEmail) {
      await emailService.sendWalletUpdated({
        to: customerEmail,
        name: customerName,
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
