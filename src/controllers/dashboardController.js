const User = require('../models/User');
const Product = require('../models/Product');

async function getDashboardStats(req, res) {
  try {
    const { site_key, role } = req.user;
    
    // التحقق من أن المستخدم أدمن
    if (role !== 'admin') {
      return res.status(403).json({ 
        error: 'هذا الإجراء يحتاج صلاحيات أدمن' 
      });
    }
    
    // إحصائيات المستخدمين في الموقع
    const totalUsers = await User.countBySite(site_key);
    const newUsersToday = await User.countNewTodayBySite(site_key);
    
    // إحصائيات المنتجات في الموقع
    const totalProducts = await Product.countBySite(site_key);
    
    // الإيرادات اليوم (قيمة ثابتة حتى يتم تفعيل نظام الطلبات)
    const revenueToday = 0;
    
    // عدد الطلبات اليوم (قيمة ثابتة حتى يتم تفعيل نظام الطلبات)
    const ordersToday = 0;
    
    res.json({
      totalUsers,
      newUsersToday,
      totalProducts,
      revenueToday,
      ordersToday
    });
    
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب إحصائيات لوحة التحكم' 
    });
  }
}

module.exports = {
  getDashboardStats
};