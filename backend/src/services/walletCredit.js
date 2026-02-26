const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const emailService = require('./email');
const { getPool } = require('../config/db');

async function creditWalletOnce({ paymentId, siteKey }) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the payment row to prevent concurrent double-credit (TOCTOU race)
    const [paymentRows] = await conn.query(
      'SELECT * FROM payments WHERE id = ? AND site_key = ? FOR UPDATE',
      [parseInt(paymentId), siteKey]
    );
    const payment = paymentRows[0];
    if (!payment) { await conn.rollback(); conn.release(); return { credited: false, reason: 'not_found' }; }
    if (payment.status !== 'completed') { await conn.rollback(); conn.release(); return { credited: false, reason: 'not_completed' }; }
    if (payment.type !== 'deposit') { await conn.rollback(); conn.release(); return { credited: false, reason: 'not_deposit' }; }
    if (!payment.customer_id) { await conn.rollback(); conn.release(); return { credited: false, reason: 'no_customer' }; }

    // Check if already credited (inside the lock)
    const existingMeta = payment.meta ? (typeof payment.meta === 'string' ? JSON.parse(payment.meta) : payment.meta) : {};
    if (existingMeta.wallet_credited_at) { await conn.rollback(); conn.release(); return { credited: false, reason: 'already_credited' }; }

    // Get customer balance before credit
    const [custRows] = await conn.query(
      'SELECT wallet_balance FROM customers WHERE id = ? AND site_key = ?',
      [payment.customer_id, siteKey]
    );
    const beforeBalance = custRows[0] ? parseFloat(custRows[0].wallet_balance || 0) : 0;

    // Credit wallet atomically
    await conn.query(
      'UPDATE customers SET wallet_balance = wallet_balance + ? WHERE id = ? AND site_key = ?',
      [parseFloat(payment.amount), payment.customer_id, siteKey]
    );

    const afterBalance = beforeBalance + parseFloat(payment.amount);

    // Mark as credited atomically within same transaction
    existingMeta.wallet_credited_at = new Date().toISOString();
    existingMeta.wallet_old_balance = beforeBalance;
    existingMeta.wallet_new_balance = afterBalance;
    await conn.query(
      'UPDATE payments SET meta = ? WHERE id = ? AND site_key = ?',
      [JSON.stringify(existingMeta), payment.id, siteKey]
    );

    await conn.commit();
    conn.release();

    // Use customer record directly (meta may not have email for wallet deposits)
    const customerEmail = existingMeta?.customer_email || custRows[0]?.email;
    const customerName = existingMeta?.customer_name || custRows[0]?.name || 'عميل';

    // ─── In-app Notification ───
    try {
      await Notification.create({
        site_key: siteKey,
        recipient_type: 'customer',
        recipient_id: payment.customer_id,
        title: 'تم شحن المحفظة ✅',
        message: `تم إضافة $${parseFloat(payment.amount).toFixed(2)} إلى محفظتك. رصيدك الحالي: $${afterBalance.toFixed(2)}`,
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
          oldBalance: beforeBalance,
          newBalance: afterBalance,
          currency: existingMeta.currency || payment.currency || 'USD',
          siteKey,
        });
      }
    } catch {
      // ignore
    }

    return { credited: true };
  } catch (e) {
    await conn.rollback().catch(() => {});
    conn.release();
    throw e;
  }
}

module.exports = {
  creditWalletOnce,
};
