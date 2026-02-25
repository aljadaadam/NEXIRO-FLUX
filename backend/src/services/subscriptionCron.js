/**
 * ─── كرون فحص الاشتراكات ────────────────────────────────────
 * 
 * يتحقق من حالة الاشتراكات (trial / active) لجميع المواقع
 * 
 * المهام:
 *   1. كشف الاشتراكات المنتهية (trial_ends_at / expires_at) → تحديث الحالة → تعليق الموقع
 *   2. إرسال تحذير قبل الانتهاء (3 أيام قبل)
 *   3. إرسال إيميل بعد الانتهاء الفعلي
 * 
 * الدورة: كل ساعة
 */

const { getPool } = require('../config/db');
const emailService = require('./email');

// ─── إعدادات ────────────────────────────────────────────────
const CRON_INTERVAL_MS = 60 * 60 * 1000; // كل ساعة
const WARNING_DAYS = 3; // تحذير قبل 3 أيام من الانتهاء

let isRunning = false;
let cronTimer = null;
let lastRunAt = null;
let cycleCount = 0;

// ─── 1. كشف وتحديث الاشتراكات المنتهية ────────────────────
async function expireSubscriptions() {
  const pool = getPool();

  // Trial subscriptions التي انتهت فترتها التجريبية
  const [expiredTrials] = await pool.query(`
    UPDATE subscriptions 
    SET status = 'expired'
    WHERE status = 'trial' 
      AND trial_ends_at IS NOT NULL 
      AND trial_ends_at < NOW()
  `);

  // Active subscriptions التي انتهت صلاحيتها (non-lifetime)
  const [expiredActive] = await pool.query(`
    UPDATE subscriptions 
    SET status = 'expired'
    WHERE status = 'active' 
      AND billing_cycle != 'lifetime'
      AND expires_at IS NOT NULL 
      AND expires_at < NOW()
  `);

  const totalExpired = (expiredTrials.affectedRows || 0) + (expiredActive.affectedRows || 0);
  return totalExpired;
}

// ─── 2. تعليق المواقع التي انتهت اشتراكاتها ────────────────
async function suspendExpiredSites() {
  const pool = getPool();

  // جلب المواقع النشطة التي ليس لها أي اشتراك نشط/تجريبي
  const [sitesToSuspend] = await pool.query(`
    SELECT s.site_key, s.name, s.domain
    FROM sites s
    WHERE s.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM subscriptions sub
        WHERE sub.site_key = s.site_key
          AND sub.status IN ('active', 'trial')
      )
      AND EXISTS (
        SELECT 1 FROM subscriptions sub2
        WHERE sub2.site_key = s.site_key
          AND sub2.status = 'expired'
      )
  `);

  if (sitesToSuspend.length === 0) return 0;

  // تعليق المواقع
  const siteKeys = sitesToSuspend.map(s => s.site_key);
  await pool.query(
    `UPDATE sites SET status = 'suspended' WHERE site_key IN (?)`,
    [siteKeys]
  );

  // إرسال إيميل انتهاء لكل موقع
  for (const site of sitesToSuspend) {
    try {
      // جلب بيانات الأدمن
      const [admins] = await pool.query(
        `SELECT email, name FROM users WHERE site_key = ? AND role = 'admin' LIMIT 1`,
        [site.site_key]
      );
      if (admins.length > 0) {
        await emailService.sendTrialExpired({
          to: admins[0].email,
          name: admins[0].name,
          siteName: site.name || site.domain,
          siteKey: site.site_key,
        });
      }
    } catch (emailErr) {
      console.error(`📧 [SubCron] فشل إرسال إيميل انتهاء لـ ${site.site_key}:`, emailErr.message);
    }
  }

  return sitesToSuspend.length;
}

// ─── 3. إرسال تحذيرات قبل الانتهاء ─────────────────────────
async function sendExpiryWarnings() {
  const pool = getPool();
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + WARNING_DAYS);

  // اشتراكات Trial ستنتهي خلال 3 أيام (ولم يتم تحذيرها بعد)
  const [expiringTrials] = await pool.query(`
    SELECT sub.*, s.name as site_name, s.domain,
           u.email as admin_email, u.name as admin_name
    FROM subscriptions sub
    JOIN sites s ON s.site_key = sub.site_key
    LEFT JOIN users u ON u.site_key = sub.site_key AND u.role = 'admin'
    WHERE sub.status = 'trial'
      AND sub.trial_ends_at IS NOT NULL
      AND sub.trial_ends_at <= ?
      AND sub.trial_ends_at > NOW()
      AND (sub.warning_sent_at IS NULL OR sub.warning_sent_at < DATE_SUB(NOW(), INTERVAL 2 DAY))
    LIMIT 50
  `, [warningDate]);

  // اشتراكات Active ستنتهي خلال 3 أيام
  const [expiringActive] = await pool.query(`
    SELECT sub.*, s.name as site_name, s.domain,
           u.email as admin_email, u.name as admin_name
    FROM subscriptions sub
    JOIN sites s ON s.site_key = sub.site_key
    LEFT JOIN users u ON u.site_key = sub.site_key AND u.role = 'admin'
    WHERE sub.status = 'active'
      AND sub.billing_cycle != 'lifetime'
      AND sub.expires_at IS NOT NULL
      AND sub.expires_at <= ?
      AND sub.expires_at > NOW()
      AND (sub.warning_sent_at IS NULL OR sub.warning_sent_at < DATE_SUB(NOW(), INTERVAL 2 DAY))
    LIMIT 50
  `, [warningDate]);

  const allExpiring = [...expiringTrials, ...expiringActive];
  let sentCount = 0;

  for (const sub of allExpiring) {
    if (!sub.admin_email) continue;
    try {
      const expiryDate = sub.status === 'trial' ? sub.trial_ends_at : sub.expires_at;
      const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

      await emailService.sendTrialExpiring({
        to: sub.admin_email,
        name: sub.admin_name,
        siteName: sub.site_name || sub.domain,
        daysLeft: Math.max(1, daysLeft),
        siteKey: sub.site_key,
      });

      // تحديث warning_sent_at لتجنب الإرسال المتكرر
      await pool.query(
        `UPDATE subscriptions SET warning_sent_at = NOW() WHERE id = ?`,
        [sub.id]
      );
      sentCount++;
    } catch (emailErr) {
      console.error(`📧 [SubCron] فشل إرسال تحذير لـ ${sub.site_key}:`, emailErr.message);
    }
  }

  return sentCount;
}

// ─── الدورة الرئيسية ────────────────────────────────────────
async function checkSubscriptions() {
  if (isRunning) {
    console.log('⏳ [SubCron] دورة سابقة لا تزال تعمل، تم تخطي هذه الدورة');
    return;
  }

  isRunning = true;
  cycleCount++;
  const startTime = Date.now();

  try {
    console.log(`\n🔄 [SubCron] ═══ بدء الدورة #${cycleCount} ═══`);

    // 1. تحديث حالة الاشتراكات المنتهية
    const expired = await expireSubscriptions();
    if (expired > 0) {
      console.log(`⏰ [SubCron] تم تحديث ${expired} اشتراك منتهي → status='expired'`);
    }

    // 2. تعليق المواقع المنتهية
    const suspended = await suspendExpiredSites();
    if (suspended > 0) {
      console.log(`🔒 [SubCron] تم تعليق ${suspended} موقع (اشتراك منتهي)`);
    }

    // 3. إرسال تحذيرات
    const warnings = await sendExpiryWarnings();
    if (warnings > 0) {
      console.log(`📧 [SubCron] تم إرسال ${warnings} تحذير انتهاء`);
    }

    const duration = Date.now() - startTime;
    lastRunAt = new Date().toISOString();

    if (expired > 0 || suspended > 0 || warnings > 0) {
      console.log(`✅ [SubCron] اكتملت الدورة #${cycleCount} في ${duration}ms — expired:${expired} suspended:${suspended} warnings:${warnings}`);
    }
  } catch (error) {
    console.error(`❌ [SubCron] خطأ في الدورة #${cycleCount}:`, error.message);
  } finally {
    isRunning = false;
  }
}

// ─── تشغيل الكرون ───────────────────────────────────────────
function startSubscriptionCron() {
  if (cronTimer) {
    console.log('⚠️ [SubCron] الكرون يعمل بالفعل');
    return;
  }

  console.log(`🕐 [SubCron] تم تشغيل كرون فحص الاشتراكات — كل ${CRON_INTERVAL_MS / 1000 / 60} دقيقة`);

  // أول فحص بعد 60 ثانية من التشغيل
  setTimeout(() => {
    checkSubscriptions();
  }, 60 * 1000);

  // الدورة المتكررة
  cronTimer = setInterval(checkSubscriptions, CRON_INTERVAL_MS);
}

// ─── إيقاف الكرون ───────────────────────────────────────────
function stopSubscriptionCron() {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
    console.log('🛑 [SubCron] تم إيقاف كرون فحص الاشتراكات');
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
    warningDays: WARNING_DAYS,
  };
}

module.exports = {
  startSubscriptionCron,
  stopSubscriptionCron,
  getCronStatus,
  checkSubscriptions, // للاستدعاء اليدوي
};
