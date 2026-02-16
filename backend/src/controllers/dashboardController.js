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
    // استثناء موقع المنصة نفسه — فقط مواقع العملاء (نستخدم site_key من JWT)
    const PK = req.user.site_key;

    // جلب مواقع العملاء فقط (استثناء المنصة)
    const [clientSites] = await pool.query(
      'SELECT * FROM sites WHERE site_key != ? ORDER BY created_at DESC',
      [PK]
    );
    const totalSites = clientSites.length;

    // المواقع الجديدة اليوم (استثناء المنصة)
    const [[{ newSitesToday }]] = await pool.query(
      'SELECT COUNT(*) as newSitesToday FROM sites WHERE site_key != ? AND DATE(created_at) = CURDATE()',
      [PK]
    );

    // إحصائيات الاشتراكات (مواقع العملاء فقط)
    const [[subStats]] = await pool.query(`
      SELECT
        COUNT(*) as totalSubscriptions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeSubscriptions,
        SUM(CASE WHEN status = 'trial' THEN 1 ELSE 0 END) as trialSubscriptions,
        SUM(CASE WHEN status = 'cancelled' OR status = 'expired' THEN 1 ELSE 0 END) as inactiveSubscriptions
      FROM subscriptions
      WHERE site_key != ?
    `, [PK]);

    // إحصائيات أكواد الشراء
    const purchaseCodeStats = await PurchaseCode.getStats();

    // إجمالي الإيرادات (مواقع العملاء فقط)
    const [[globalRevenue]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND site_key != ?",
      [PK]
    );
    const [[todayRevenue]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND DATE(created_at) = CURDATE() AND site_key != ?",
      [PK]
    );

    // إجمالي المستخدمين (مواقع العملاء فقط — استثناء مستخدمي المنصة)
    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) as totalUsers FROM users WHERE site_key != ?',
      [PK]
    );
    const [[{ newUsersToday }]] = await pool.query(
      'SELECT COUNT(*) as newUsersToday FROM users WHERE site_key != ? AND DATE(created_at) = CURDATE()',
      [PK]
    );

    // إجمالي التذاكر (مواقع العملاء فقط)
    const [[ticketStats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) as resolved
      FROM tickets
      WHERE site_key != ?
    `, [PK]);

    // آخر 10 مواقع عملاء أُنشئت (استثناء المنصة)
    const recentSites = clientSites.slice(0, 10).map(s => ({
      id: s.id,
      site_key: s.site_key,
      domain: s.custom_domain || s.domain,
      name: s.name || s.domain,
      created_at: s.created_at,
    }));

    // آخر 10 مدفوعات (مواقع العملاء فقط)
    const [recentPayments] = await pool.query(
      `SELECT p.*, s.domain as site_domain, s.name as site_name
       FROM payments p
       LEFT JOIN sites s ON p.site_key = s.site_key
       WHERE p.site_key != ?
       ORDER BY p.created_at DESC LIMIT 10`,
      [PK]
    );

    res.json({
      // المواقع
      totalSites,
      newSitesToday: newSitesToday || 0,
      // الاشتراكات
      totalSubscriptions: subStats.totalSubscriptions || 0,
      activeSubscriptions: subStats.activeSubscriptions || 0,
      trialSubscriptions: subStats.trialSubscriptions || 0,
      inactiveSubscriptions: subStats.inactiveSubscriptions || 0,
      // أكواد الشراء
      purchaseCodes: {
        total: purchaseCodeStats.total || 0,
        active: purchaseCodeStats.active || 0,
        fullyUsed: purchaseCodeStats.fully_used || 0,
        totalUses: purchaseCodeStats.total_uses || 0,
      },
      // الإيرادات
      totalRevenue: parseFloat(globalRevenue.total),
      todayRevenue: parseFloat(todayRevenue.total),
      // المستخدمين
      totalUsers,
      newUsersToday: newUsersToday || 0,
      // التذاكر
      totalTickets: ticketStats.total || 0,
      openTickets: ticketStats.open || 0,
      resolvedTickets: ticketStats.resolved || 0,
      // أحدث البيانات
      recentSites,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        type: p.type,
        site_domain: p.site_domain || p.site_key,
        site_name: p.site_name,
        created_at: p.created_at,
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

    let where = 'WHERE p.site_key != ?';
    const params = [req.user.site_key];
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
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalRevenue,
        COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(created_at) = CURDATE() THEN amount ELSE 0 END), 0) as todayRevenue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM payments
      WHERE site_key != ?
    `, [req.user.site_key]);

    res.json({
      payments: payments.map(p => ({
        ...p,
        site_domain: p.custom_domain || p.site_domain || p.site_key,
        site_name: p.site_name,
      })),
      total,
      stats: {
        total: stats.total || 0,
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        todayRevenue: parseFloat(stats.todayRevenue) || 0,
        pending: stats.pending || 0,
        completed: stats.completed || 0,
        failed: stats.failed || 0,
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

    let where = 'WHERE t.site_key != ?';
    const params = [req.user.site_key];
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
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) as resolved
      FROM tickets
      WHERE site_key != ?
    `, [req.user.site_key]);

    res.json({
      tickets: tickets.map(t => ({
        ...t,
        site_domain: t.custom_domain || t.site_domain || t.site_key,
        site_name: t.site_name,
      })),
      total,
      stats: {
        total: stats.total || 0,
        open: stats.open || 0,
        replied: stats.replied || 0,
        resolved: stats.resolved || 0,
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
    const { page = 1, limit = 50, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // مستخدمو المنصة فقط (المسجلون في موقع المنصة نفسه)
    let where = 'WHERE u.site_key = ?';
    const params = [req.user.site_key];
    if (search) {
      where += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${where}`, params
    );

    // إحصائيات مستخدمي المنصة
    const [[statsRow]] = await pool.query(`
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regularUsers,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newToday
      FROM users
      WHERE site_key = ?
    `, [req.user.site_key]);

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.site_key, u.created_at
       FROM users u
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
        created_at: u.created_at,
      })),
      total,
      stats: {
        totalUsers: statsRow.totalUsers || 0,
        admins: statsRow.admins || 0,
        regularUsers: statsRow.regularUsers || 0,
        newToday: statsRow.newToday || 0,
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
      WHERE s.site_key != ?
      ORDER BY s.created_at DESC
    `, [req.user.site_key]);

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