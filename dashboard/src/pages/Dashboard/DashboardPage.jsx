// src/pages/Dashboard/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import { getDashboardStats, getOrders, getProducts, getRecentActivities } from '../../services/api';

const DashboardPage = () => {
  const { t, dir, theme } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, ordersRes, productsRes, activitiesRes] = await Promise.all([
        getDashboardStats(),
        getOrders({ limit: 5 }),
        getProducts({ limit: 5 }),
        getRecentActivities(5),
      ]);

      setStats(statsRes.data);

      const ordersData = ordersRes.data?.orders || ordersRes.data || [];
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);

      const productsData = productsRes.data?.products || productsRes.data || [];
      setTopProducts(Array.isArray(productsData) ? productsData.slice(0, 5) : []);

      const activitiesData = activitiesRes.data?.activities || activitiesRes.data || [];
      setActivities(Array.isArray(activitiesData) ? activitiesData.slice(0, 5) : []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (dir === 'rtl') {
      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      return `منذ ${diffDays} يوم`;
    } else {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    }
  };

  const translateAction = (action) => {
    const map = {
      'order_created': dir === 'rtl' ? 'أنشأ طلب جديد' : 'Created a new order',
      'order_status_updated': dir === 'rtl' ? 'حدّث حالة طلب' : 'Updated order status',
      'product_created': dir === 'rtl' ? 'أضاف منتج جديد' : 'Added a new product',
      'product_updated': dir === 'rtl' ? 'حدّث منتج' : 'Updated a product',
      'customer_registered': dir === 'rtl' ? 'تسجيل عميل جديد' : 'New customer registered',
      'wallet_updated': dir === 'rtl' ? 'تحديث المحفظة' : 'Wallet updated',
      'payment_created': dir === 'rtl' ? 'دفعة جديدة' : 'New payment',
      'ticket_created': dir === 'rtl' ? 'تذكرة دعم جديدة' : 'New support ticket',
    };
    return map[action] || action;
  };

  const getTimeRangeLabels = () => {
    return dir === 'rtl'
      ? ['اليوم', 'أسبوع', 'شهر', 'سنة']
      : ['Today', 'Week', 'Month', 'Year'];
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: dir === 'rtl' ? 'قيد الانتظار' : 'Pending' },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: dir === 'rtl' ? 'مكتمل' : 'Completed' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: dir === 'rtl' ? 'ملغي' : 'Cancelled' },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: dir === 'rtl' ? 'قيد المعالجة' : 'Processing' },
    };
    const s = styles[status] || styles.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getStatCards = () => {
    if (!stats) return [];
    return [
      {
        title: t('totalRevenue'),
        value: formatCurrency(stats.totalRevenue || 0),
        subtitle: `${dir === 'rtl' ? 'اليوم:' : 'Today:'} ${formatCurrency(stats.todayRevenue || stats.revenueToday || 0)}`,
        icon: 'fas fa-dollar-sign',
        color: 'from-green-500 to-emerald-600',
      },
      {
        title: t('totalOrders'),
        value: formatNumber(stats.totalOrders || 0),
        subtitle: `${dir === 'rtl' ? 'اليوم:' : 'Today:'} ${formatNumber(stats.ordersToday || 0)}`,
        icon: 'fas fa-shopping-cart',
        color: 'from-blue-500 to-cyan-600',
      },
      {
        title: dir === 'rtl' ? 'العملاء' : 'Customers',
        value: formatNumber(stats.totalCustomers || 0),
        subtitle: `${dir === 'rtl' ? 'المنتجات:' : 'Products:'} ${formatNumber(stats.totalProducts || 0)}`,
        icon: 'fas fa-users',
        color: 'from-purple-500 to-violet-600',
      },
      {
        title: dir === 'rtl' ? 'تذاكر الدعم' : 'Support Tickets',
        value: formatNumber(stats.totalTickets || 0),
        subtitle: `${dir === 'rtl' ? 'مفتوح:' : 'Open:'} ${formatNumber(stats.openTickets || 0)}`,
        icon: 'fas fa-headset',
        color: 'from-amber-500 to-orange-600',
      },
    ];
  };

  const getChartBars = () => {
    if (!stats) return [];
    const total = Number(stats.totalOrders) || 1;
    const completed = Number(stats.completedOrders) || 0;
    const pending = Number(stats.pendingOrders) || 0;
    const today = Number(stats.ordersToday) || 0;

    return [
      { label: dir === 'rtl' ? 'مكتمل' : 'Completed', height: Math.max(10, (completed / total) * 100), color: 'from-green-500 to-emerald-500' },
      { label: dir === 'rtl' ? 'قيد الانتظار' : 'Pending', height: Math.max(10, (pending / total) * 100), color: 'from-yellow-500 to-amber-500' },
      { label: dir === 'rtl' ? 'اليوم' : 'Today', height: Math.max(10, (today / total) * 100), color: 'from-blue-500 to-cyan-500' },
    ];
  };

  return (
    <AppLayout>
      <div className={`p-4 md:p-6 animate-fade-in ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        {isLoading ? (
          <SkeletonDashboard />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {dir === 'rtl' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
            </h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {dir === 'rtl' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : (
          <>
            {/* العنوان */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {t('dashboard')}
                </h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {t('welcomeBack')}! {t('storeOverview')}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <button
                  onClick={fetchDashboardData}
                  className={`p-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700 text-gray-400'
                      : 'border-gray-300 hover:bg-gray-100 text-gray-600'
                  }`}
                  title={dir === 'rtl' ? 'تحديث' : 'Refresh'}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
                <div className={`inline-flex rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {getTimeRangeLabels().map((range) => (
                    <button
                      key={range}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        timeRange === range
                          ? theme === 'dark'
                            ? 'bg-gray-700 text-white shadow'
                            : 'bg-white text-blue-600 shadow'
                          : theme === 'dark'
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-800'
                      }`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getStatCards().map((stat, index) => (
                <div key={index} className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-100'
                }`}>
                  <div className={`flex justify-between items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {stat.title}
                      </p>
                      <h3 className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-md`}>
                      <i className={`${stat.icon} text-white text-xl`}></i>
                    </div>
                  </div>
                  <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* مخطط الطلبات والمنتجات */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* مخطط الطلبات */}
              <div
                className="rounded-2xl shadow-lg p-6 border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {dir === 'rtl' ? 'نظرة عامة على الطلبات' : 'Orders Overview'}
                  </h2>
                </div>
                <div className="flex items-end justify-around h-48 px-4">
                  {getChartBars().map((bar, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Math.round(bar.height)}%
                      </div>
                      <div
                        className={`w-16 rounded-t-lg transition-all bg-gradient-to-t ${bar.color}`}
                        style={{ height: `${bar.height}%`, minHeight: '8px' }}
                      ></div>
                      <div className={`mt-2 text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {bar.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 grid grid-cols-3 gap-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {formatNumber(stats?.totalOrders || 0)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dir === 'rtl' ? 'إجمالي' : 'Total'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {formatNumber(stats?.completedOrders || 0)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dir === 'rtl' ? 'مكتمل' : 'Completed'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {formatNumber(stats?.pendingOrders || 0)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dir === 'rtl' ? 'قيد الانتظار' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* أفضل المنتجات */}
              <div
                className="rounded-2xl shadow-lg p-6 border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {t('bestSellingProducts')}
                  </h2>
                </div>
                <div className="space-y-4">
                  {topProducts.length > 0 ? topProducts.map((product) => (
                    <div key={product.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          dir === 'rtl' ? 'ml-3' : 'mr-3'
                        } ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30'
                            : 'bg-gradient-to-r from-blue-100 to-cyan-100'
                        }`}>
                          <i className="fas fa-box text-blue-600"></i>
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                            {product.name || product.title || (dir === 'rtl' ? 'منتج' : 'Product')}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {product.category || product.type || ''}
                          </p>
                        </div>
                      </div>
                      <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
                        <div className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {product.price ? formatCurrency(product.price) : '-'}
                        </div>
                        <div className={`text-sm ${
                          product.status === 'active'
                            ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                            : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                        }`}>
                          {product.status === 'active' ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'غير نشط' : 'Inactive')}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className={`fas fa-box-open text-3xl mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}></i>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                        {dir === 'rtl' ? 'لا توجد منتجات بعد' : 'No products yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* الطلبات الأخيرة والنشاطات */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* الطلبات الأخيرة */}
              <div
                className="rounded-2xl shadow-lg p-6 border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {t('recentOrders')}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {recentOrders.length > 0 ? (
                    <table className="min-w-full divide-y">
                      <thead>
                        <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                          <th className={`px-4 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {dir === 'rtl' ? 'رقم الطلب' : 'Order ID'}
                          </th>
                          <th className={`px-4 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {dir === 'rtl' ? 'العميل' : 'Customer'}
                          </th>
                          <th className={`px-4 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {dir === 'rtl' ? 'القيمة' : 'Amount'}
                          </th>
                          <th className={`px-4 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {dir === 'rtl' ? 'الحالة' : 'Status'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3 whitespace-nowrap font-medium">#{order.id}</td>
                            <td className={`px-4 py-3 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                              {order.customer_name || order.customer_email || '-'}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                              {formatCurrency(order.total_price || order.amount || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {getStatusBadge(order.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8">
                      <i className={`fas fa-shopping-bag text-3xl mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}></i>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                        {dir === 'rtl' ? 'لا توجد طلبات بعد' : 'No orders yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* آخر النشاطات */}
              <div
                className="rounded-2xl shadow-lg p-6 border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {t('latestActivities')}
                  </h2>
                </div>
                <div className="space-y-4">
                  {activities.length > 0 ? activities.map((activity) => (
                    <div key={activity.id} className={`flex items-start p-3 rounded-xl transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        dir === 'rtl' ? 'ml-3' : 'mr-3'
                      } ${
                        theme === 'dark'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                          {translateAction(activity.action)}
                        </p>
                        {activity.details && (
                          <p className={`text-xs mt-0.5 truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className={`fas fa-history text-3xl mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}></i>
                      <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                        {dir === 'rtl' ? 'لا توجد نشاطات بعد' : 'No activities yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* معلومات الاشتراك والنظام */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* حالة النظام */}
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-800/30'
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100'
              }`}>
                <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dir === 'rtl' ? 'ml-4' : 'mr-4'
                  } bg-gradient-to-r from-blue-500 to-cyan-500`}>
                    <i className="fas fa-bolt text-white text-xl"></i>
                  </div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {t('systemPerformance')}
                  </h3>
                </div>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dir === 'rtl' ? 'أعضاء الفريق:' : 'Team Members:'} <span className="font-bold">{formatNumber(stats?.totalUsers || 0)}</span>
                </p>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}></i>
                  {dir === 'rtl' ? 'إشعارات غير مقروءة:' : 'Unread notifications:'} {formatNumber(stats?.unreadNotifications || 0)}
                </div>
              </div>

              {/* الاشتراك */}
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-800/30'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
              }`}>
                <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dir === 'rtl' ? 'ml-4' : 'mr-4'
                  } bg-gradient-to-r from-amber-500 to-orange-500`}>
                    <i className="fas fa-crown text-white text-xl"></i>
                  </div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {dir === 'rtl' ? 'الاشتراك' : 'Subscription'}
                  </h3>
                </div>
                {stats?.subscription ? (
                  <>
                    <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {dir === 'rtl' ? 'الخطة:' : 'Plan:'} <span className="font-bold capitalize">{stats.subscription.plan}</span>
                    </p>
                    <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {dir === 'rtl' ? 'الحالة:' : 'Status:'} <span className={`font-bold ${
                        stats.subscription.status === 'active' || stats.subscription.status === 'trial'
                          ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                          : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                      }`}>{stats.subscription.status}</span>
                    </p>
                    {stats.subscription.expires_at && (
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                        <i className={`fas fa-calendar ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}></i>
                        {dir === 'rtl' ? 'ينتهي:' : 'Expires:'} {new Date(stats.subscription.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </>
                ) : (
                  <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                    {dir === 'rtl' ? 'لا يوجد اشتراك نشط' : 'No active subscription'}
                  </p>
                )}
              </div>

              {/* المدفوعات */}
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800/30'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
              }`}>
                <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dir === 'rtl' ? 'ml-4' : 'mr-4'
                  } bg-gradient-to-r from-purple-500 to-pink-500`}>
                    <i className="fas fa-wallet text-white text-xl"></i>
                  </div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {dir === 'rtl' ? 'المدفوعات' : 'Payments'}
                  </h3>
                </div>
                <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dir === 'rtl' ? 'إجمالي الإيرادات:' : 'Total Revenue:'} <span className="font-bold">{formatCurrency(stats?.totalRevenue || 0)}</span>
                </p>
                <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dir === 'rtl' ? 'إجمالي الإيداعات:' : 'Total Deposits:'} <span className="font-bold">{formatCurrency(stats?.totalDeposits || 0)}</span>
                </p>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  <i className={`fas fa-chart-line ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}></i>
                  {dir === 'rtl' ? 'إيرادات اليوم:' : "Today's Revenue:"} {formatCurrency(stats?.todayRevenue || stats?.revenueToday || 0)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
