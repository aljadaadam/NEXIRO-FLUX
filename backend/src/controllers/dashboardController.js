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

    // جلب جميع المواقع
    const sites = await Site.findAll();
    const totalSites = sites.length;

    // المواقع الجديدة اليوم
    const [[{ newSitesToday }]] = await pool.query(
      "SELECT COUNT(*) as newSitesToday FROM sites WHERE DATE(created_at) = CURDATE()"
    );

    // إحصائيات الاشتراكات
    const [[subStats]] = await pool.query(`
      SELECT
        COUNT(*) as totalSubscriptions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeSubscriptions,
        SUM(CASE WHEN status = 'trial' THEN 1 ELSE 0 END) as trialSubscriptions,
        SUM(CASE WHEN status = 'cancelled' OR status = 'expired' THEN 1 ELSE 0 END) as inactiveSubscriptions
      FROM subscriptions
    `);

    // إحصائيات أكواد الشراء
    const purchaseCodeStats = await PurchaseCode.getStats();

    // إجمالي الإيرادات عبر كل المواقع
    const [[globalRevenue]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"
    );
    const [[todayRevenue]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND DATE(created_at) = CURDATE()"
    );

    // إجمالي المستخدمين عبر كل المواقع
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users");
    const [[{ newUsersToday }]] = await pool.query(
      "SELECT COUNT(*) as newUsersToday FROM users WHERE DATE(created_at) = CURDATE()"
    );

    // إجمالي التذاكر
    const [[ticketStats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) as resolved
      FROM tickets
    `);

    // آخر 10 مواقع أُنشئت
    const recentSites = sites.slice(0, 10).map(s => ({
      id: s.id,
      site_key: s.site_key,
      domain: s.custom_domain || s.domain,
      name: s.name || s.domain,
      created_at: s.created_at,
    }));

    // آخر 10 مدفوعات عبر كل المواقع
    const [recentPayments] = await pool.query(
      `SELECT p.*, s.domain as site_domain, s.name as site_name
       FROM payments p
       LEFT JOIN sites s ON p.site_key = s.site_key
       ORDER BY p.created_at DESC LIMIT 10`
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

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getPlatformStats
};