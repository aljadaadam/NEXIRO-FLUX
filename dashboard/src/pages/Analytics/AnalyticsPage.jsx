// src/pages/Analytics/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonAnalytics } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { getDashboardStats, getOrderStats } from '../../services/api';

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [error, setError] = useState(null);
  const { theme, dir } = useLanguage();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getDashboardStats(),
        getOrderStats(),
      ]);
      setStats(statsRes.data);
      setOrderStats(ordersRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (n) => n != null ? Number(n).toLocaleString() : '0';
  const formatCurrency = (n) => n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '$0';

  const analyticsCards = stats ? [
    { label: dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: 'fas fa-dollar-sign', color: 'from-green-500 to-emerald-600' },
    { label: dir === 'rtl' ? 'إيرادات اليوم' : "Today's Revenue", value: formatCurrency(stats.todayRevenue || stats.revenueToday), icon: 'fas fa-chart-line', color: 'from-blue-500 to-cyan-600' },
    { label: dir === 'rtl' ? 'إجمالي الطلبات' : 'Total Orders', value: formatNumber(stats.totalOrders), icon: 'fas fa-shopping-cart', color: 'from-purple-500 to-violet-600' },
    { label: dir === 'rtl' ? 'طلبات اليوم' : "Today's Orders", value: formatNumber(stats.ordersToday), icon: 'fas fa-clock', color: 'from-amber-500 to-orange-600' },
    { label: dir === 'rtl' ? 'إجمالي العملاء' : 'Total Customers', value: formatNumber(stats.totalCustomers), icon: 'fas fa-users', color: 'from-pink-500 to-rose-600' },
    { label: dir === 'rtl' ? 'إجمالي المنتجات' : 'Total Products', value: formatNumber(stats.totalProducts), icon: 'fas fa-box', color: 'from-indigo-500 to-blue-600' },
    { label: dir === 'rtl' ? 'إجمالي الإيداعات' : 'Total Deposits', value: formatCurrency(stats.totalDeposits), icon: 'fas fa-wallet', color: 'from-teal-500 to-cyan-600' },
    { label: dir === 'rtl' ? 'أعضاء الفريق' : 'Team Members', value: formatNumber(stats.totalUsers), icon: 'fas fa-user-friends', color: 'from-sky-500 to-blue-600' },
  ] : [];

  const orderBreakdown = stats ? [
    { label: dir === 'rtl' ? 'مكتمل' : 'Completed', value: stats.completedOrders || 0, color: 'bg-green-500' },
    { label: dir === 'rtl' ? 'قيد الانتظار' : 'Pending', value: stats.pendingOrders || 0, color: 'bg-yellow-500' },
    { label: dir === 'rtl' ? 'اليوم' : 'Today', value: stats.ordersToday || 0, color: 'bg-blue-500' },
  ] : [];

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        {isLoading ? (
          <SkeletonAnalytics />
        ) : (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {dir === 'rtl' ? 'التقارير والتحليلات' : 'Reports & Analytics'}
                </h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {dir === 'rtl' ? 'تحليل أداء متجرك' : 'Analyze your store performance'}
                </p>
              </div>
              <button
                onClick={fetchData}
                className={`mt-4 md:mt-0 p-2 rounded-lg border transition ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700 text-gray-400'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>

            {error ? (
              <div className={`rounded-2xl shadow-lg p-6 border text-center ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <i className={`fas fa-exclamation-triangle text-3xl mb-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}></i>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
                <button onClick={fetchData} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {dir === 'rtl' ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : (
              <>
                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {analyticsCards.map((card, i) => (
                    <div key={i} className={`rounded-2xl p-5 border transition-all hover:shadow-lg ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}>
                      <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`}>
                          <i className={`${card.icon} text-white text-sm`}></i>
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {card.label}
                        </span>
                      </div>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* تفاصيل الطلبات والدعم */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* توزيع الطلبات */}
                  <div className={`rounded-2xl shadow-lg p-6 border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}>
                    <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {dir === 'rtl' ? 'توزيع الطلبات' : 'Orders Breakdown'}
                    </h2>
                    <div className="space-y-4">
                      {orderBreakdown.map((item, i) => {
                        const total = Number(stats?.totalOrders) || 1;
                        const pct = Math.round((Number(item.value) / total) * 100);
                        return (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                              <span className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                {formatNumber(item.value)} ({pct}%)
                              </span>
                            </div>
                            <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className={`h-3 rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* الدعم الفني */}
                  <div className={`rounded-2xl shadow-lg p-6 border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}>
                    <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {dir === 'rtl' ? 'الدعم الفني' : 'Support Overview'}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'إجمالي التذاكر' : 'Total Tickets'}
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {formatNumber(stats?.totalTickets || 0)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'تذاكر مفتوحة' : 'Open Tickets'}
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          {formatNumber(stats?.openTickets || 0)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'تذاكر محلولة' : 'Resolved'}
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          {formatNumber(stats?.resolvedTickets || 0)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'مستخدمون جدد اليوم' : 'New Users Today'}
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {formatNumber(stats?.newUsersToday || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات الاشتراك */}
                {stats?.subscription && (
                  <div className={`mt-6 rounded-2xl shadow-lg p-6 border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {dir === 'rtl' ? 'معلومات الاشتراك' : 'Subscription Info'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'الخطة' : 'Plan'}
                        </span>
                        <p className={`text-lg font-bold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {stats.subscription.plan}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'الحالة' : 'Status'}
                        </span>
                        <p className={`text-lg font-bold capitalize ${
                          stats.subscription.status === 'active' || stats.subscription.status === 'trial'
                            ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                            : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                        }`}>
                          {stats.subscription.status}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'تاريخ الانتهاء' : 'Expires'}
                        </span>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {stats.subscription.expires_at ? new Date(stats.subscription.expires_at).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
