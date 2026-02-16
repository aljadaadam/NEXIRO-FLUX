const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');

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
      // الاشتراك
      subscription: subscription ? {
        plan: subscription.plan_id,
      // الأرباح (فرق سعر البيع - سعر المصدر)
      totalProfit: orderStats.totalProfit,
      todayProfit: orderStats.todayProfit,
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

module.exports = {
  getDashboardStats,
  getRecentActivities
};