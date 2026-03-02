/**
 * ─── كرون فحص الطلبات التلقائي ───────────────────────────────
 * 
 * يتحقق من حالة الطلبات المعلقة (pending / processing) لجميع المواقع
 * يجلب الطلبات → يصنفها حسب الموقع والمصدر → يتحقق من المصدر الخارجي → يحدّث الحالة
 * 
 * التحسينات:
 * ✓ عدالة بين المواقع — round-robin: كل موقع يأخذ حصة متساوية
 * ✓ تجميع حسب المصدر — client واحد لكل مصدر (بدل تكرار)
 * ✓ backoff تصاعدي — الطلبات الفاشلة تُفحص بشكل أقل تكراراً
 * ✓ حد أقصى لكل مصدر — لا يضغط على مصدر واحد أكثر من اللازم
 * ✓ timeout لكل استدعاء — لا ينتظر مصدر بطيء للأبد
 */

const { getPool } = require('../config/db');
const Source = require('../models/Source');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { DhruFusionClient, DhruFusionError } = require('./dhruFusion');
const { ImeiCheckClient, ImeiCheckError } = require('./imeiCheck');
const { decryptApiKey } = require('../utils/apiKeyCrypto');
const emailService = require('./email');

// ─── إعدادات ────────────────────────────────────────────────
const CRON_INTERVAL_MS = 3 * 60 * 1000;        // كل 3 دقائق
const MAX_ORDERS_PER_CYCLE = 150;               // أقصى عدد طلبات لكل دورة (مرفوع)
const MAX_PER_SOURCE = 30;                      // أقصى عدد طلبات لكل مصدر واحد في الدورة
const DELAY_BETWEEN_CHECKS_MS = 300;            // تأخير بين كل فحص (مخفّض — آمن مع الحد)
const DELAY_BETWEEN_SOURCES_MS = 1000;          // فاصل بين كل مصدر
const MAX_ORDER_AGE_DAYS = 7;                   // تجاهل الطلبات الأقدم من 7 أيام
const API_TIMEOUT_MS = 15000;                   // timeout لكل استدعاء API
const BACKOFF_FAIL_COUNT = 3;                   // بعد كم فشل نبدأ backoff
const BACKOFF_SKIP_CYCLES = 3;                  // كم دورة نتخطى بعد فشل متكرر

let isRunning = false;
let cronTimer = null;
let lastRunAt = null;
let cycleCount = 0;

// خريطة فشل الطلبات: orderId → { fails, lastChecked }
const failTracker = new Map();

// ─── تأخير بسيط ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── فحص مع timeout ─────────────────────────────────────────
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالمصدر')), ms))
  ]);
}

// ─── هل يجب تخطي هذا الطلب بسبب فشل متكرر؟ ────────────────
function shouldSkipOrder(orderId) {
  const info = failTracker.get(orderId);
  if (!info || info.fails < BACKOFF_FAIL_COUNT) return false;
  // تخطي لعدد من الدورات يتناسب مع عدد الفشل
  const skipCycles = Math.min(BACKOFF_SKIP_CYCLES * Math.floor(info.fails / BACKOFF_FAIL_COUNT), 30);
  return (cycleCount - info.lastCycle) < skipCycles;
}

function recordFail(orderId) {
  const info = failTracker.get(orderId) || { fails: 0, lastCycle: 0 };
  info.fails++;
  info.lastCycle = cycleCount;
  failTracker.set(orderId, info);
}

function recordSuccess(orderId) {
  failTracker.delete(orderId);
}

// ─── تنظيف failTracker من الطلبات القديمة ───────────────────
function cleanupFailTracker() {
  if (cycleCount % 100 !== 0) return;
  const threshold = cycleCount - 200;
  for (const [id, info] of failTracker) {
    if (info.lastCycle < threshold) failTracker.delete(id);
  }
}

// ─── توزيع عادل: round-robin بين المواقع ────────────────────
function fairDistribute(siteSourceMap) {
  // جمع كل الطلبات مع معلومات الموقع والمصدر
  const siteOrders = {}; // siteKey → [{ order, srcId }]
  
  for (const siteKey of Object.keys(siteSourceMap)) {
    siteOrders[siteKey] = [];
    for (const srcId of Object.keys(siteSourceMap[siteKey])) {
      for (const order of siteSourceMap[siteKey][srcId].orders) {
        siteOrders[siteKey].push({ order, srcId });
      }
    }
  }

  // round-robin: نأخذ طلب واحد من كل موقع بالتناوب
  const result = [];
  const sites = Object.keys(siteOrders);
  const sourceCounters = {}; // srcId → عدد الطلبات المجدولة
  let hasMore = true;
  let round = 0;

  while (hasMore && result.length < MAX_ORDERS_PER_CYCLE) {
    hasMore = false;
    for (const siteKey of sites) {
      if (round < siteOrders[siteKey].length) {
        const item = siteOrders[siteKey][round];
        // فحص حد المصدر
        const srcCount = sourceCounters[item.srcId] || 0;
        if (srcCount >= MAX_PER_SOURCE) continue;
        // فحص backoff
        if (shouldSkipOrder(item.order.id)) continue;
        
        result.push({ ...item, siteKey });
        sourceCounters[item.srcId] = srcCount + 1;
      }
      if (round + 1 < siteOrders[siteKey].length) hasMore = true;
    }
    round++;
  }

  return result;
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
  cleanupFailTracker();

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
      [cutoffDate.toISOString(), MAX_ORDERS_PER_CYCLE * 2]
    );

    if (pendingOrders.length === 0) {
      isRunning = false;
      lastRunAt = new Date();
      return;
    }

    // 2) تصنيف الطلبات: site_key → source_id → orders[]
    const siteSourceMap = {};

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
          const apiKey = decryptApiKey(source.api_key);
          if (!apiKey) continue;

          // ─── IMEI Check: استخدام ImeiCheckClient ───
          if (source.type === 'imeicheck') {
            const phpBaseUrl = 'https://alpha.imeicheck.com/api/php-api';
            const client = new ImeiCheckClient({ apiKey, baseUrl: phpBaseUrl });
            sourceCache[srcId] = { client, type: 'imeicheck' };
            siteSourceMap[siteKey][srcId].client = sourceCache[srcId];
            continue;
          }

          // ─── DHRU Fusion وأشباهه ───
          if (!dhruTypes.includes(source.type)) continue;

          const client = new DhruFusionClient({
            baseUrl: source.url,
            username: source.username || '',
            apiAccessKey: apiKey
          });

          sourceCache[srcId] = { client, type: 'dhru' };
          siteSourceMap[siteKey][srcId].client = sourceCache[srcId];
        } catch (err) {
          console.error(`[OrderCron] ❌ خطأ بناء client للمصدر ${srcId}:`, err.message);
        }
      }
    }

    // 4) توزيع عادل بين المواقع مع حد لكل مصدر
    const orderedQueue = fairDistribute(siteSourceMap);

    if (orderedQueue.length === 0) {
      isRunning = false;
      lastRunAt = new Date();
      return;
    }

    const siteCount = new Set(orderedQueue.map(q => q.siteKey)).size;
    const sourceCount = new Set(orderedQueue.map(q => q.srcId)).size;
    console.log(`🔄 [OrderCron] دورة #${cycleCount} — ${orderedQueue.length} طلب من ${siteCount} موقع و ${sourceCount} مصدر`);

    // 5) فحص كل طلب مع حماية timeout
    let checked = 0, updated = 0, completed = 0, failed = 0, errors = 0, skipped = 0;
    let lastSrcId = null;

    for (const { order, srcId, siteKey } of orderedQueue) {
      const clientInfo = siteSourceMap[siteKey]?.[srcId]?.client || sourceCache[srcId];
      if (!clientInfo) { skipped++; continue; }

      // فاصل أطول عند التبديل بين مصادر مختلفة
      if (lastSrcId && lastSrcId !== srcId) {
        await sleep(DELAY_BETWEEN_SOURCES_MS);
      }
      lastSrcId = srcId;

      const actualClient = clientInfo.client || clientInfo;
      const hasGetOrderStatus = typeof actualClient.getOrderStatus === 'function';
      const hasGetOrderHistory = typeof actualClient.getOrderHistory === 'function';
      if (!hasGetOrderStatus && !hasGetOrderHistory) { skipped++; continue; }

      try {
        let result;

        // ─── IMEI Check: فحص الحالة عبر PHP API ───
        if (clientInfo.type === 'imeicheck') {
          const historyResult = await withTimeout(
            clientInfo.client.getOrderHistory(order.external_reference_id),
            API_TIMEOUT_MS
          );
          result = {
            status: historyResult.status,
            statusLabel: historyResult.statusLabel,
            comments: historyResult.result || null,
            message: historyResult.result || null,
            fullResponse: historyResult.result || historyResult.statusLabel || '',
          };
        }
        // ─── DHRU Fusion ───
        else {
          result = await withTimeout(
            actualClient.getOrderStatus(order.external_reference_id),
            API_TIMEOUT_MS
          );
        }

        checked++;
        recordSuccess(order.id);

        const statusMapping = {
          'completed': 'completed',
          'waiting': 'processing',
          'pending': 'processing',
          'rejected': 'rejected',
          'cancelled': 'rejected'
        };

        const newStatus = statusMapping[result.status] || order.status;

        // فقط نحدّث إذا تغيرت الحالة
        if (newStatus !== order.status) {
          const responseText = result.fullResponse || result.comments || result.message || result.statusLabel || '';

          await Order.updateStatus(order.id, siteKey, newStatus, responseText);
          updated++;

          // ─── إشعارات حسب الحالة الجديدة ───
          if (newStatus === 'completed') {
            completed++;
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

          if (newStatus === 'rejected') {
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

            await Notification.create({
              site_key: siteKey,
              recipient_type: 'customer',
              recipient_id: order.customer_id,
              title: 'تحديث الطلب',
              message: `طلبك #${order.order_number}: ${result.statusLabel}${result.message ? ' - ' + result.message : ''}`,
              type: 'order'
            });

            await Notification.create({
              site_key: siteKey,
              recipient_type: 'admin',
              title: 'طلب مرفوض ❌',
              message: `طلب #${order.order_number} — ${result.statusLabel}. تم استرجاع الرصيد تلقائياً.`,
              type: 'order'
            });
          }
        }

        // تأخير بين الطلبات
        await sleep(DELAY_BETWEEN_CHECKS_MS);

      } catch (err) {
        errors++;
        recordFail(order.id);
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[OrderCron] ⚠️ طلب #${order.order_number} (${siteKey}): ${errMsg}`);
        await sleep(DELAY_BETWEEN_CHECKS_MS);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ [OrderCron] دورة #${cycleCount} اكتملت — فحص: ${checked}, تحديث: ${updated}, مكتمل: ${completed}, فشل: ${failed}, أخطاء: ${errors}, تخطي: ${skipped} (${elapsed}s)`);

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

  console.log(`🕐 [OrderCron] تم تشغيل كرون فحص الطلبات — كل ${CRON_INTERVAL_MS / 1000} ثانية | حد: ${MAX_ORDERS_PER_CYCLE} طلب/دورة | حد/مصدر: ${MAX_PER_SOURCE}`);

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
    maxPerSource: MAX_PER_SOURCE,
    maxOrderAgeDays: MAX_ORDER_AGE_DAYS,
    failTrackerSize: failTracker.size,
  };
}

module.exports = {
  startOrderCron,
  stopOrderCron,
  getCronStatus,
  checkPendingOrders  // للاستدعاء اليدوي
};
