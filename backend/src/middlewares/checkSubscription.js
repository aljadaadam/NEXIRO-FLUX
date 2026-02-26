/**
 * ─── Subscription Validation Middleware ───
 * يتحقق من صلاحية اشتراك الموقع قبل السماح بالوصول للـ API
 * 
 * إذا الاشتراك منتهي أو الموقع معلق:
 *   - يسمح بالقراءة فقط (GET) لبعض المسارات الأساسية
 *   - يمنع أي عمليات كتابة (POST/PUT/DELETE)
 *   - يرجع حالة الاشتراك في الـ response header
 * 
 * يُستثنى منه:
 *   - مسارات النظام الأساسية (auth, setup, health)
 *   - مسارات الدفع (لتمكين التجديد)
 *   - Platform admin endpoints
 */

const Subscription = require('../models/Subscription');

// مسارات مستثناة دائماً (تعمل حتى لو الاشتراك منتهي)
const EXEMPT_PATHS = [
  '/api/auth/',           // تسجيل دخول وتسجيل
  '/api/setup/',          // إعداد الموقع
  '/api/health/',         // فحص الصحة
  '/api/payments/',       // الدفع (لتمكين التجديد)
  '/api/payment-gateway/', // بوابات الدفع
  '/api/purchase-codes/', // أكواد الشراء
  '/api/subscriptions/',  // إدارة الاشتراك نفسه
];

// مسارات تعمل كـ GET فقط للمواقع المعلقة
const READONLY_PATHS = [
  '/api/site/',           // بيانات الموقع (للعرض)
  '/api/customization/',  // بيانات التخصيص
  '/api/dashboard/',      // لوحة التحكم (إحصائيات فقط)
];

function isExemptPath(path) {
  return EXEMPT_PATHS.some(p => path.startsWith(p));
}

function isReadonlyAllowed(path, method) {
  if (method !== 'GET') return false;
  return READONLY_PATHS.some(p => path.startsWith(p));
}

/**
 * Middleware: يتحقق من اشتراك الموقع
 * يُضاف بعد resolveTenant وقبل الـ routes
 */
function checkSubscription(req, res, next) {
  // لا نتحقق إذا لم يتم تحديد tenant (platform admin routes)
  if (!req.siteKey || !req.site) return next();

  // المسارات المستثناة
  if (isExemptPath(req.path)) return next();

  // إذا الموقع معلق
  if (req.site.status === 'suspended') {
    // السماح بالقراءة فقط لمسارات محددة
    if (isReadonlyAllowed(req.path, req.method)) {
      res.set('X-Subscription-Status', 'suspended');
      return next();
    }

    return res.status(403).json({
      error: 'اشتراك الموقع منتهي. يرجى تجديد الاشتراك للاستمرار',
      errorEn: 'Site subscription expired. Please renew to continue',
      status: 'suspended',
      action: 'renew_required',
    });
  }

  // الموقع نشط — مرر
  next();
}

/**
 * Middleware: يتحقق من اشتراك الموقع بشكل async (مع فحص DB)
 * يُستخدم في المسارات الحساسة التي تحتاج تحقق دقيق
 */
async function checkSubscriptionStrict(req, res, next) {
  if (!req.siteKey) return next();
  if (isExemptPath(req.path)) return next();

  try {
    const isValid = await Subscription.isValid(req.siteKey);
    if (!isValid) {
      // الاشتراك غير صالح — تحقق من السبب
      const sub = await Subscription.findLatestBySiteKey(req.siteKey);
      const reason = !sub ? 'no_subscription' :
                     sub.status === 'expired' ? 'expired' :
                     sub.status === 'cancelled' ? 'cancelled' : 'invalid';

      return res.status(403).json({
        error: 'اشتراك الموقع غير صالح. يرجى تجديد الاشتراك',
        errorEn: 'Site subscription is not valid. Please renew',
        status: reason,
        action: 'renew_required',
      });
    }

    res.set('X-Subscription-Status', 'active');
    next();
  } catch (error) {
    console.error('[checkSubscription] Error:', error.message);
    // Security: fail closed — don't allow access on DB error
    return res.status(503).json({ error: 'خدمة غير متاحة مؤقتاً' });
  }
}

module.exports = {
  checkSubscription,
  checkSubscriptionStrict,
};
