const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');
const Site = require('../models/Site');
const PurchaseCode = require('../models/PurchaseCode');
const { getPool } = require('../config/db');

// ─── دومينات المنصة المعروفة (لاكتشاف موقع المنصة من قاعدة البيانات) ───
const PLATFORM_DOMAINS = [
  'nexiroflux.com', 'www.nexiroflux.com',
  'nexiro-flux.com', 'www.nexiro-flux.com',
  'localhost', '127.0.0.1',
];

// كاش لمفتاح موقع المنصة — يُحَل مرة واحدة ويُحفظ
let _platformSiteKeys = null;

/**
 * جلب جميع site_key التي تخص المنصة نفسها (وليس مواقع العملاء)
 * يُعرّف موقع المنصة بأنه الموقع الذي دومينه أحد PLATFORM_DOMAINS
 */
async function resolvePlatformSiteKeys(pool) {
  if (_platformSiteKeys) return _platformSiteKeys;

  const placeholders = PLATFORM_DOMAINS.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT DISTINCT site_key FROM sites WHERE domain IN (${placeholders}) OR custom_domain IN (${placeholders})`,
    [...PLATFORM_DOMAINS, ...PLATFORM_DOMAINS]
  );

  _platformSiteKeys = rows.map(r => r.site_key);
  // إعادة تحميل كل 10 دقائق
  setTimeout(() => { _platformSiteKeys = null; }, 10 * 60 * 1000);
  return _platformSiteKeys;
}

/**
 * بناء شرط SQL لاستثناء مواقع المنصة
 * يرجع { clause, params } — مثال: { clause: "site_key NOT IN (?,?)", params: ['key1','key2'] }
 */
function buildExcludePlatformClause(platformKeys, column = 'site_key') {
  if (!platformKeys || platformKeys.length === 0) {
    return { clause: '1=1', params: [] };
  }
  const placeholders = platformKeys.map(() => '?').join(',');
  return { clause: `${column} NOT IN (${placeholders})`, params: [...platformKeys] };
}

/**
 * بناء شرط SQL لتضمين مواقع المنصة فقط
 */
function buildIncludePlatformClause(platformKeys, column = 'site_key') {
  if (!platformKeys || platformKeys.length === 0) {
    return { clause: '1=0', params: [] };
  }
  const placeholders = platformKeys.map(() => '?').join(',');
  return { clause: `${column} IN (${placeholders})`, params: [...platformKeys] };
}

// ─── مساعد: التحقق من أن المستخدم أدمن منصة ───
function requirePlatformAdmin(req, res) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'صلاحيات أدمن مطلوبة' });
    return false;
  }
  return true;
}

async function getDashboardStats(req, res) {
  try {
    const { site_key, role } = req.user;
    
    // التحقق من أن المستخدم أدمن
    if (role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }
    
    // إحصائيات شاملة
    const [
      totalUsers,
      newUsersToday,
      totalProducts,
      totalCustomers,
      orderStats,
      paymentStats,
      ticketStats,
      unreadNotifications,
      subscription
    ] = await Promise.all([
      User.countBySite(site_key),
      User.countNewTodayBySite(site_key),
      Product.countBySite(site_key),
      Customer.countBySite(site_key),
      Order.getStats(site_key),
      Payment.getStats(site_key),
      Ticket.getStats(site_key),
      Notification.countUnread(site_key, 'admin'),
      Subscription.findActiveBySiteKey(site_key)
    ]);
    
    res.json({
      // المستخدمون (أعضاء الفريق)
      totalUsers,
      newUsersToday,
      // المنتجات
      totalProducts,
      // الزبائن
      totalCustomers,
      // الطلبات
      totalOrders: orderStats.total,
      pendingOrders: orderStats.pending,
      completedOrders: orderStats.completed,
      ordersToday: orderStats.todayOrders,
      // الإيرادات
      totalRevenue: paymentStats.totalRevenue,
      todayRevenue: paymentStats.todayRevenue,
      totalDeposits: paymentStats.totalDeposits,
      revenueToday: orderStats.todayRevenue,
      // الدعم الفني
      totalTickets: ticketStats.total,
      openTickets: ticketStats.open,
      resolvedTickets: ticketStats.resolved,
      // الإشعارات
      unreadNotifications,
      // الأرباح (فرق سعر البيع - سعر المصدر)
      totalProfit: orderStats.totalProfit,
      todayProfit: orderStats.todayProfit,
      // الاشتراك
      subscription: subscription ? {
        plan: subscription.plan_id,
        status: subscription.status,
        expires_at: subscription.expires_at,
        billing_cycle: subscription.billing_cycle
      } : null
    });
    
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب إحصائيات لوحة التحكم' 
    });
  }
}

async function getRecentActivities(req, res) {
  try {
    const { site_key } = req.user;
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await ActivityLog.findBySiteKey(site_key, { limit, page: 1 });
    
    res.json({ activities });
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب سجل النشاطات' 
    });
  }
}

// ─── إحصائيات المنصة الرئيسية (Super Admin) ───
async function getPlatformStats(req, res) {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'صلاحيات أدمن مطلوبة' });
    }

    const pool = getPool();
    // اكتشاف موقع المنصة من الدومين (موثوق) — استثناءه من كل الاستعلامات
    const platformKeys = await resolvePlatformSiteKeys(pool);
    const ex = buildExcludePlatformClause(platformKeys);

    // عدد مواقع العملاء (استثناء المنصة) — بدون تحميل كل الصفوف
    const [[{ totalSites }]] = await pool.query(
      `SELECT COUNT(*) as totalSites FROM sites WHERE ${ex.clause}`,
      ex.params
    );

    // المواقع الجديدة اليوم (استثناء المنصة)
    const [[{ newSitesToday }]] = await pool.query(
      `SELECT COUNT(*) as newSitesToday FROM sites WHERE ${ex.clause} AND DATE(created_at) = CURDATE()`,
      ex.params
    );

    // إحصائيات الاشتراكات (مواقع العملاء فقط)
    const [[subStats]] = await pool.query(`
      SELECT
        COUNT(*) as totalSubscriptions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeSubscriptions,
        SUM(CASE WHEN status = 'trial' THEN 1 ELSE 0 END) as trialSubscriptions,
        SUM(CASE WHEN status = 'cancelled' OR status = 'expired' THEN 1 ELSE 0 END) as inactiveSubscriptions
      FROM subscriptions
      WHERE ${ex.clause}
    `, ex.params);

    // إحصائيات أكواد الشراء
    const purchaseCodeStats = await PurchaseCode.getStats();

    // إيرادات المنصة الفعلية — من الاشتراكات المفعّلة (وليس مدفوعات المتاجر)
    const [[globalRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(price), 0) as total FROM subscriptions WHERE status IN ('active') AND ${ex.clause}`,
      ex.params
    );
    const [[todayRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(price), 0) as total FROM subscriptions WHERE status IN ('active') AND DATE(created_at) = CURDATE() AND ${ex.clause}`,
      ex.params
    );

    // إجمالي المستخدمين (مواقع العملاء فقط — استثناء مستخدمي المنصة)
    const [[{ totalUsers }]] = await pool.query(
      `SELECT COUNT(*) as totalUsers FROM users WHERE ${ex.clause}`,
      ex.params
    );
    const [[{ newUsersToday }]] = await pool.query(
      `SELECT COUNT(*) as newUsersToday FROM users WHERE ${ex.clause} AND DATE(created_at) = CURDATE()`,
      ex.params
    );

    // إجمالي التذاكر (مواقع العملاء فقط)
    const [[ticketStats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) as resolved
      FROM tickets
      WHERE ${ex.clause}
    `, ex.params);

    // آخر 10 مواقع عملاء أُنشئت (استثناء المنصة) — استعلام محدود
    const [recentSitesRaw] = await pool.query(
      `SELECT id, site_key, domain, custom_domain, name, created_at FROM sites WHERE ${ex.clause} ORDER BY created_at DESC LIMIT 10`,
      ex.params
    );
    const recentSites = recentSitesRaw.map(s => ({
      id: s.id,
      site_key: s.site_key,
      domain: s.custom_domain || s.domain,
      name: s.name || s.domain,
      created_at: s.created_at,
    }));

    // آخر 10 اشتراكات (بيانات المنصة الحقيقية)
    const exSubs = buildExcludePlatformClause(platformKeys, 'sub.site_key');
    const [recentSubscriptions] = await pool.query(
      `SELECT sub.id, sub.site_key, sub.plan_id, sub.template_id, sub.billing_cycle,
              sub.price, sub.status, sub.trial_ends_at, sub.expires_at, sub.created_at,
              s.domain as site_domain, s.name as site_name, s.custom_domain
       FROM subscriptions sub
       LEFT JOIN sites s ON sub.site_key = s.site_key
       WHERE ${exSubs.clause}
       ORDER BY sub.created_at DESC LIMIT 10`,
      exSubs.params
    );

    // ─── Helper: MySQL SUM/COUNT may return strings — normalize to int ───
    const int = (v) => parseInt(v, 10) || 0;

    res.json({
      // المواقع
      totalSites: int(totalSites),
      newSitesToday: int(newSitesToday),
      // الاشتراكات
      totalSubscriptions: int(subStats.totalSubscriptions),
      activeSubscriptions: int(subStats.activeSubscriptions),
      trialSubscriptions: int(subStats.trialSubscriptions),
      inactiveSubscriptions: int(subStats.inactiveSubscriptions),
      // أكواد الشراء
      purchaseCodes: {
        total: int(purchaseCodeStats.total),
        active: int(purchaseCodeStats.active),
        fullyUsed: int(purchaseCodeStats.fully_used),
        totalUses: int(purchaseCodeStats.total_uses),
      },
      // الإيرادات
      totalRevenue: parseFloat(globalRevenue.total) || 0,
      todayRevenue: parseFloat(todayRevenue.total) || 0,
      // المستخدمين
      totalUsers: int(totalUsers),
      newUsersToday: int(newUsersToday),
      // التذاكر
      totalTickets: int(ticketStats.total),
      openTickets: int(ticketStats.open),
      resolvedTickets: int(ticketStats.resolved),
      // أحدث البيانات
      recentSites,
      recentSubscriptions: recentSubscriptions.map(sub => ({
        id: sub.id,
        plan_id: sub.plan_id,
        template_id: sub.template_id,
        billing_cycle: sub.billing_cycle,
        price: sub.price,
        status: sub.status,
        trial_ends_at: sub.trial_ends_at,
        expires_at: sub.expires_at,
        site_domain: sub.custom_domain || sub.site_domain || sub.site_key,
        site_name: sub.site_name,
        created_at: sub.created_at,
      })),
    });
  } catch (error) {
    console.error('Error in getPlatformStats:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب إحصائيات المنصة' });
  }
}

// ─── جميع المدفوعات عبر كل المواقع (Super Admin) ───
async function getPlatformPayments(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { page = 1, limit = 50, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const platformKeys = await resolvePlatformSiteKeys(pool);
    const ex = buildExcludePlatformClause(platformKeys, 'p.site_key');

    let where = `WHERE ${ex.clause}`;
    const params = [...ex.params];
    if (status && status !== 'all') {
      where += ' AND p.status = ?';
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM payments p ${where}`, params
    );

    const [payments] = await pool.query(
      `SELECT p.*, s.domain as site_domain, s.name as site_name, s.custom_domain
       FROM payments p
       LEFT JOIN sites s ON p.site_key = s.site_key
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // إحصائيات عامة (استثناء المنصة)
    const exStats = buildExcludePlatformClause(platformKeys);
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalRevenue,
        COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(created_at) = CURDATE() THEN amount ELSE 0 END), 0) as todayRevenue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM payments
      WHERE ${exStats.clause}
    `, exStats.params);

    res.json({
      payments: payments.map(p => ({
        ...p,
        site_domain: p.custom_domain || p.site_domain || p.site_key,
        site_name: p.site_name,
      })),
      total,
      stats: {
        total: parseInt(stats.total, 10) || 0,
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        todayRevenue: parseFloat(stats.todayRevenue) || 0,
        pending: parseInt(stats.pending, 10) || 0,
        completed: parseInt(stats.completed, 10) || 0,
        failed: parseInt(stats.failed, 10) || 0,
      },
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error in getPlatformPayments:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المدفوعات' });
  }
}

// ─── تحديث حالة دفعة (Super Admin — بدون تحقق من site_key) ───
async function updatePlatformPaymentStatus(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `حالة غير صالحة. الحالات المتاحة: ${validStatuses.join(', ')}` });
    }

    const [[payment]] = await pool.query('SELECT * FROM payments WHERE id = ?', [parseInt(id)]);
    if (!payment) {
      return res.status(404).json({ error: 'عملية الدفع غير موجودة' });
    }

    await pool.query('UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?', [status, parseInt(id)]);

    const [[updated]] = await pool.query('SELECT * FROM payments WHERE id = ?', [parseInt(id)]);
    res.json({ message: 'تم تحديث حالة الدفع', payment: updated });
  } catch (error) {
    console.error('Error in updatePlatformPaymentStatus:', error);
    res.status(500).json({ error: 'فشل في تحديث حالة الدفع' });
  }
}

// ─── جميع التذاكر عبر كل المواقع (Super Admin) ───
async function getPlatformTickets(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { page = 1, limit = 50, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const platformKeys = await resolvePlatformSiteKeys(pool);
    const ex = buildExcludePlatformClause(platformKeys, 't.site_key');

    let where = `WHERE ${ex.clause}`;
    const params = [...ex.params];
    if (status && status !== 'all') {
      where += ' AND t.status = ?';
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM tickets t ${where}`, params
    );

    const [tickets] = await pool.query(
      `SELECT t.*, s.domain as site_domain, s.name as site_name, s.custom_domain
       FROM tickets t
       LEFT JOIN sites s ON t.site_key = s.site_key
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // إحصائيات عامة (استثناء المنصة)
    const exStats = buildExcludePlatformClause(platformKeys);
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) as resolved
      FROM tickets
      WHERE ${exStats.clause}
    `, exStats.params);

    res.json({
      tickets: tickets.map(t => ({
        ...t,
        site_domain: t.custom_domain || t.site_domain || t.site_key,
        site_name: t.site_name,
      })),
      total,
      stats: {
        total: parseInt(stats.total, 10) || 0,
        open: parseInt(stats.open, 10) || 0,
        replied: parseInt(stats.replied, 10) || 0,
        resolved: parseInt(stats.resolved, 10) || 0,
      },
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error in getPlatformTickets:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التذاكر' });
  }
}

// ─── رسائل تذكرة (Super Admin — بدون site_key) ───
async function getPlatformTicketMessages(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { id } = req.params;

    const [[ticket]] = await pool.query('SELECT * FROM tickets WHERE id = ?', [parseInt(id)]);
    if (!ticket) {
      return res.status(404).json({ error: 'التذكرة غير موجودة' });
    }

    const [messages] = await pool.query(
      'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [parseInt(id)]
    );

    res.json({ ticket, messages });
  } catch (error) {
    console.error('Error in getPlatformTicketMessages:', error);
    res.status(500).json({ error: 'فشل في جلب رسائل التذكرة' });
  }
}

// ─── رد على تذكرة (Super Admin) ───
async function replyPlatformTicket(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    const [[ticket]] = await pool.query('SELECT * FROM tickets WHERE id = ?', [parseInt(id)]);
    if (!ticket) {
      return res.status(404).json({ error: 'التذكرة غير موجودة' });
    }

    await pool.query(
      'INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
      [parseInt(id), 'admin', req.user.id, message]
    );

    await pool.query(
      "UPDATE tickets SET status = 'replied', updated_at = NOW() WHERE id = ?",
      [parseInt(id)]
    );

    res.json({ message: 'تم إرسال الرد بنجاح' });
  } catch (error) {
    console.error('Error in replyPlatformTicket:', error);
    res.status(500).json({ error: 'فشل في إرسال الرد' });
  }
}

// ─── تحديث حالة تذكرة (Super Admin) ───
async function updatePlatformTicketStatus(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'replied', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `حالة غير صالحة` });
    }

    await pool.query('UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?', [status, parseInt(id)]);
    const [[updated]] = await pool.query('SELECT * FROM tickets WHERE id = ?', [parseInt(id)]);

    res.json({ message: 'تم تحديث حالة التذكرة', ticket: updated });
  } catch (error) {
    console.error('Error in updatePlatformTicketStatus:', error);
    res.status(500).json({ error: 'فشل في تحديث حالة التذكرة' });
  }
}

// ─── جميع المستخدمين عبر كل المواقع (Super Admin) ───
async function getPlatformUsers(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();
    const { page = 1, limit = 50, search, role, site_key: filterSiteKey } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // جلب جميع المستخدمين عبر كل المواقع (مع بيانات الموقع)
    let where = 'WHERE 1=1';
    const params = [];

    if (filterSiteKey) {
      where += ' AND u.site_key = ?';
      params.push(filterSiteKey);
    }
    if (role) {
      where += ' AND u.role = ?';
      params.push(role);
    }
    if (search) {
      where += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${where}`, params
    );

    // إحصائيات شاملة لكل المستخدمين
    const [[statsRow]] = await pool.query(`
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' OR role = 'customer' THEN 1 ELSE 0 END) as regularUsers,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newToday
      FROM users
    `);

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.site_key, u.created_at,
              s.name as site_name, s.domain as site_domain, s.custom_domain
       FROM users u
       LEFT JOIN sites s ON u.site_key = s.site_key
       ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        site_key: u.site_key,
        site_name: u.site_name || u.site_key,
        site_domain: u.custom_domain || u.site_domain || u.site_key,
        created_at: u.created_at,
      })),
      total,
      stats: {
        totalUsers: parseInt(statsRow.totalUsers, 10) || 0,
        admins: parseInt(statsRow.admins, 10) || 0,
        regularUsers: parseInt(statsRow.regularUsers, 10) || 0,
        newToday: parseInt(statsRow.newToday, 10) || 0,
      },
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error in getPlatformUsers:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المستخدمين' });
  }
}

// ─── جميع المواقع (Super Admin) ───
async function getPlatformSites(req, res) {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const pool = getPool();

    const platformKeys = await resolvePlatformSiteKeys(pool);
    const ex = buildExcludePlatformClause(platformKeys, 's.site_key');

    const [sites] = await pool.query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM users u WHERE u.site_key = s.site_key) as users_count,
        (SELECT COUNT(*) FROM products p WHERE p.site_key = s.site_key) as products_count,
        (SELECT COUNT(*) FROM orders o WHERE o.site_key = s.site_key) as orders_count,
        sub.status as subscription_status,
        sub.plan_id as subscription_plan,
        sub.expires_at as subscription_expires
      FROM sites s
      LEFT JOIN subscriptions sub ON s.site_key = sub.site_key
      WHERE ${ex.clause}
      ORDER BY s.created_at DESC
    `, ex.params);

    res.json({ sites });
  } catch (error) {
    console.error('Error in getPlatformSites:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المواقع' });
  }
}

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getPlatformStats,
  getPlatformPayments,
  updatePlatformPaymentStatus,
  getPlatformTickets,
  getPlatformTicketMessages,
  replyPlatformTicket,
  updatePlatformTicketStatus,
  getPlatformUsers,
  getPlatformSites,
};