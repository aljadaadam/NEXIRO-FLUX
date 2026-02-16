/**
 * ─── كرون فحص الطلبات التلقائي ───────────────────────────────
 * 
 * يتحقق من حالة الطلبات المعلقة (pending / processing) لجميع المواقع
 * يجلب الطلبات → يصنفها حسب الموقع والمصدر → يتحقق من المصدر الخارجي → يحدّث الحالة
 * 
 * الدورة: كل 3 دقائق (قابلة للتعديل)
 * الحد الأقصى: 100 طلب لكل دورة
 * التأخير بين الطلبات: 500ms لتجنب ضغط على المصدر
 */

const { getPool } = require('../config/db');
const Source = require('../models/Source');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { DhruFusionClient, DhruFusionError } = require('./dhruFusion');
const { decryptApiKey } = require('../utils/apiKeyCrypto');
const emailService = require('./email');

// ─── إعدادات ────────────────────────────────────────────────
const CRON_INTERVAL_MS = 3 * 60 * 1000;   // كل 3 دقائق
const MAX_ORDERS_PER_CYCLE = 100;          // أقصى عدد طلبات لكل دورة
const DELAY_BETWEEN_CHECKS_MS = 500;       // تأخير بين كل فحص (لتجنب ضغط API)
const MAX_ORDER_AGE_DAYS = 7;              // تجاهل الطلبات الأقدم من 7 أيام

let isRunning = false;
let cronTimer = null;
let lastRunAt = null;
let cycleCount = 0;

// ─── تأخير بسيط ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── الدورة الرئيسية ────────────────────────────────────────
async function checkPendingOrders() {
  if (isRunning) {
    console.log('⏳ [OrderCron] دورة سابقة لا تزال تعمل، تم تخطي هذه الدورة');
    return;
  }

  isRunning = true;
  cycleCount++;
  const startTime = Date.now();

  try {
    const pool = getPool();

    // 1) جلب جميع الطلبات المعلقة من جميع المواقع
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_ORDER_AGE_DAYS);

    const [pendingOrders] = await pool.query(
      `SELECT o.id, o.site_key, o.order_number, o.customer_id, o.product_id,
              o.product_name, o.status, o.external_reference_id, o.source_id,
              o.total_price, o.payment_method, o.created_at,
              p.source_id AS product_source_id
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.external_reference_id IS NOT NULL
         AND o.status IN ('pending', 'processing')
         AND o.created_at >= ?
       ORDER BY o.created_at ASC
       LIMIT ?`,
      [cutoffDate.toISOString(), MAX_ORDERS_PER_CYCLE]
    );

    if (pendingOrders.length === 0) {
      isRunning = false;
      lastRunAt = new Date();
      return; // صامت — بدون لوق إذا ما في طلبات
    }

    console.log(`🔄 [OrderCron] دورة #${cycleCount} — فحص ${pendingOrders.length} طلب معلق...`);

    // 2) تصنيف الطلبات: site_key → source_id → orders[]
    const siteSourceMap = {};
    // { "site_abc": { "source_5": { client: DhruFusionClient, orders: [...] } } }

    for (const order of pendingOrders) {
      const srcId = order.source_id || order.product_source_id;
      if (!srcId) continue;

      const sk = order.site_key;
      if (!siteSourceMap[sk]) siteSourceMap[sk] = {};
      if (!siteSourceMap[sk][srcId]) {
        siteSourceMap[sk][srcId] = { client: null, orders: [] };
      }
      siteSourceMap[sk][srcId].orders.push(order);
    }

    // 3) بناء الـ clients لكل مصدر (مرة واحدة لكل مصدر)
    const sourceCache = {};
    for (const siteKey of Object.keys(siteSourceMap)) {
      for (const srcId of Object.keys(siteSourceMap[siteKey])) {
        if (sourceCache[srcId]) {
          siteSourceMap[siteKey][srcId].client = sourceCache[srcId];
          continue;
        }

        try {
          const source = await Source.findById(srcId);
          if (!source) continue;

          const dhruTypes = ['dhru-fusion', 'sd-unlocker', 'unlock-world'];
          if (!dhruTypes.includes(source.type)) continue;

          const apiKey = decryptApiKey(source.api_key);
          if (!apiKey) continue;

          const client = new DhruFusionClient({
            baseUrl: source.url,
            username: source.username || '',
            apiAccessKey: apiKey
          });

          sourceCache[srcId] = client;
          siteSourceMap[siteKey][srcId].client = client;
        } catch (err) {
          console.error(`[OrderCron] ❌ خطأ بناء client للمصدر ${srcId}:`, err.message);
        }
      }
    }

    // 4) فحص كل طلب
    let checked = 0, updated = 0, completed = 0, failed = 0, errors = 0;

    for (const siteKey of Object.keys(siteSourceMap)) {
      for (const srcId of Object.keys(siteSourceMap[siteKey])) {
        const { client, orders } = siteSourceMap[siteKey][srcId];
        if (!client) continue;

        for (const order of orders) {
          try {
            const result = await client.getOrderStatus(order.external_reference_id);
            checked++;

            const statusMapping = {
              'completed': 'completed',
              'waiting': 'processing',
              'pending': 'processing',
              'rejected': 'failed',
              'cancelled': 'cancelled'
            };

            const newStatus = statusMapping[result.status] || order.status;

            // فقط نحدّث إذا تغيرت الحالة
            if (newStatus !== order.status) {
              // حفظ المحتوى الفعلي من المصدر — fullResponse يجمع كل الحقول المفيدة
              const responseText = result.fullResponse || result.comments || result.message || result.statusLabel || '';

              await Order.updateStatus(order.id, siteKey, newStatus, responseText);
              updated++;

              // ─── إشعارات حسب الحالة الجديدة ───
              if (newStatus === 'completed') {
                completed++;
                // إشعار + بريد للزبون
                await Notification.create({
                  site_key: siteKey,
                  recipient_type: 'customer',
                  recipient_id: order.customer_id,
                  title: 'تم إكمال طلبك ✅',
                  message: `طلبك #${order.order_number} تم بنجاح${result.comments ? ': ' + result.comments : ''}`,
                  type: 'order'
                });

                try {
                  const cust = await Customer.findById(order.customer_id);
                  if (cust?.email) {
                    emailService.sendOrderStatusUpdate({
                      to: cust.email,
                      name: cust.name,
                      orderId: order.order_number,
                      status: 'completed'
                    }).catch(() => {});
                  }
                } catch { /* ignore */ }
              }

              if (['failed', 'cancelled'].includes(newStatus)) {
                failed++;

                // استرجاع الرصيد إذا كان الدفع بالمحفظة
                if (order.payment_method === 'wallet' && parseFloat(order.total_price) > 0) {
                  try {
                    await Customer.updateWallet(order.customer_id, siteKey, parseFloat(order.total_price));
                    const Payment = require('../models/Payment');
                    await Payment.create({
                      site_key: siteKey,
                      customer_id: order.customer_id,
                      order_id: order.id,
                      type: 'refund',
                      amount: parseFloat(order.total_price),
                      payment_method: 'wallet',
                      status: 'completed',
                      description: `استرجاع تلقائي: طلب #${order.order_number} (${result.statusLabel})`
                    });
                    await Order.updatePaymentStatus(order.id, siteKey, 'refunded');
                    console.log(`💰 [OrderCron] استرجاع $${order.total_price} للزبون ${order.customer_id} — طلب #${order.order_number}`);
                  } catch (refundErr) {
                    console.error(`[OrderCron] ❌ فشل استرجاع الرصيد لطلب #${order.order_number}:`, refundErr.message);
                  }
                }

                // إشعار للزبون
                await Notification.create({
                  site_key: siteKey,
                  recipient_type: 'customer',
                  recipient_id: order.customer_id,
                  title: 'تحديث الطلب',
                  message: `طلبك #${order.order_number}: ${result.statusLabel}${result.message ? ' - ' + result.message : ''}`,
                  type: 'order'
                });

                // إشعار للأدمن
                await Notification.create({
                  site_key: siteKey,
                  recipient_type: 'admin',
                  title: 'طلب مرفوض/ملغي',
                  message: `طلب #${order.order_number} — ${result.statusLabel}. تم استرجاع الرصيد تلقائياً.`,
                  type: 'order'
                });
              }
            }

            // تأخير بين الطلبات
            await sleep(DELAY_BETWEEN_CHECKS_MS);

          } catch (err) {
            errors++;
            // لا نوقف الدورة بسبب خطأ في طلب واحد
            if (err instanceof DhruFusionError) {
              console.error(`[OrderCron] ⚠️ طلب #${order.order_number} (${siteKey}): ${err.message}`);
            } else {
              console.error(`[OrderCron] ⚠️ طلب #${order.order_number} (${siteKey}): ${err.message}`);
            }
            await sleep(DELAY_BETWEEN_CHECKS_MS);
          }
        }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ [OrderCron] دورة #${cycleCount} اكتملت — فحص: ${checked}, تحديث: ${updated}, مكتمل: ${completed}, فشل: ${failed}, أخطاء: ${errors} (${elapsed}s)`);

  } catch (error) {
    console.error('❌ [OrderCron] خطأ في الدورة:', error.message);
  } finally {
    isRunning = false;
    lastRunAt = new Date();
  }
}

// ─── تشغيل الكرون ───────────────────────────────────────────
function startOrderCron() {
  if (cronTimer) {
    console.log('⚠️ [OrderCron] الكرون يعمل بالفعل');
    return;
  }

  console.log(`🕐 [OrderCron] تم تشغيل كرون فحص الطلبات — كل ${CRON_INTERVAL_MS / 1000} ثانية`);

  // أول فحص بعد 30 ثانية من التشغيل (يعطي وقت للسيرفر يستقر)
  setTimeout(() => {
    checkPendingOrders();
  }, 30 * 1000);

  // الدورة المتكررة
  cronTimer = setInterval(checkPendingOrders, CRON_INTERVAL_MS);
}

// ─── إيقاف الكرون ───────────────────────────────────────────
function stopOrderCron() {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
    console.log('🛑 [OrderCron] تم إيقاف كرون فحص الطلبات');
  }
}

// ─── حالة الكرون ────────────────────────────────────────────
function getCronStatus() {
  return {
    running: !!cronTimer,
    isProcessing: isRunning,
    lastRunAt,
    cycleCount,
    intervalMs: CRON_INTERVAL_MS,
    maxOrdersPerCycle: MAX_ORDERS_PER_CYCLE,
    maxOrderAgeDays: MAX_ORDER_AGE_DAYS
  };
}

module.exports = {
  startOrderCron,
  stopOrderCron,
  getCronStatus,
  checkPendingOrders  // للاستدعاء اليدوي
};
