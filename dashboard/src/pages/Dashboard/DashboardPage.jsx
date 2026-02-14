// src/pages/Dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonDashboard } from '../../components/common/Skeleton';

const DashboardPage = () => {
  const { t, dir, theme } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: { value: '152,340', change: '+12.5%', trend: 'up' },
    totalOrders: { value: '1,245', change: '+8.2%', trend: 'up' },
    activeUsers: { value: '8,450', change: '+5.7%', trend: 'up' },
    conversionRate: { value: '3.5%', change: '-0.2%', trend: 'down' },
  });

  const [timeRange, setTimeRange] = useState('week');

  // محاكاة تحميل البيانات
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 ثانية
    
    return () => clearTimeout(timer);
  }, []);

  // تحديد تسميات بناءً على اللغة
  const getTimeRangeLabels = () => {
    return dir === 'rtl' 
      ? ['اليوم', 'أسبوع', 'شهر', 'سنة']
      : ['Today', 'Week', 'Month', 'Year'];
  };

  const getDaysLabels = () => {
    return dir === 'rtl' 
      ? ['أحد', 'اثن', 'ثلاث', 'أرب', 'خم', 'جمعة', 'سبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const getPeriodOptions = () => {
    return dir === 'rtl'
      ? ['آخر 7 أيام', 'آخر 30 يوماً', 'هذا الشهر', 'هذه السنة']
      : ['Last 7 days', 'Last 30 days', 'This month', 'This year'];
  };

  // محاكاة جلب البيانات
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalRevenue: { value: '154,210', change: '+12.8%', trend: 'up' },
        totalOrders: { value: '1,268', change: '+8.5%', trend: 'up' },
        activeUsers: { value: '8,520', change: '+6.1%', trend: 'up' },
        conversionRate: { value: '3.6%', change: '+0.1%', trend: 'up' },
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  return (
    <AppLayout>
      <div className={`p-4 md:p-6 animate-fade-in ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        {isLoading ? (
          <SkeletonDashboard />
        ) : (
          <>
        {/* العنوان ومحدد التاريخ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {t('dashboard')}
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {t('welcomeBack')}! {t('storeOverview')}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className={`inline-flex rounded-lg p-1 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {getTimeRangeLabels().map((range, index) => (
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
          {[
            { title: t('totalRevenue'), value: `$${stats.totalRevenue.value}`, change: stats.totalRevenue.change, trend: stats.totalRevenue.trend, icon: 'fas fa-dollar-sign', color: 'from-green-500 to-emerald-600' },
            { title: t('totalOrders'), value: stats.totalOrders.value, change: stats.totalOrders.change, trend: stats.totalOrders.trend, icon: 'fas fa-shopping-cart', color: 'from-blue-500 to-cyan-600' },
            { title: t('activeUsers'), value: stats.activeUsers.value, change: stats.activeUsers.change, trend: stats.activeUsers.trend, icon: 'fas fa-users', color: 'from-purple-500 to-violet-600' },
            { title: t('conversionRate'), value: stats.conversionRate.value, change: stats.conversionRate.change, trend: stats.conversionRate.trend, icon: 'fas fa-chart-line', color: 'from-amber-500 to-orange-600' },
          ].map((stat, index) => {
            const isPositive = stat.trend === 'up';
            
            return (
              <div key={index} className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`flex justify-between items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {stat.title}
                    </p>
                    <h3 className={`text-3xl font-bold mt-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-md`}>
                    <i className={`${stat.icon} text-white text-xl`}></i>
                  </div>
                </div>
                
                <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${
                    isPositive 
                      ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    <i className={`fas fa-chevron-${isPositive ? 'up' : 'down'} ${
                      dir === 'rtl' ? 'ml-1' : 'mr-1'
                    }`}></i>
                    <span className="font-medium">{stat.change}</span>
                  </div>
                  <span className={`text-sm ${
                    dir === 'rtl' ? 'mr-2' : 'ml-2'
                  } ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {t('comparedToPreviousPeriod')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* مخطط المبيعات والأداء */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div 
            className="rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('salesPerformance')}
              </h2>
              <select className={`rounded-lg px-3 py-2 text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-800'
              }`}>
                {getPeriodOptions().map((option, index) => (
                  <option key={index} className={theme === 'dark' ? 'bg-gray-800' : ''}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative h-64">
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-48 px-4">
                {[40, 65, 80, 60, 75, 90, 70].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-8 rounded-t-lg transition-all hover:opacity-80 ${
                        theme === 'dark'
                          ? 'bg-gradient-to-t from-blue-600 to-cyan-500'
                          : 'bg-gradient-to-t from-blue-500 to-cyan-400'
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className={`mt-2 text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {getDaysLabels()[index]}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`absolute top-0 ${
                dir === 'rtl' ? 'right-0' : 'left-0'
              } flex flex-col justify-between py-4 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <span>$10K</span>
                <span>$7.5K</span>
                <span>$5K</span>
                <span>$2.5K</span>
                <span>$0</span>
              </div>
            </div>
          </div>
          
          <div 
            className="rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('bestSellingProducts')}
              </h2>
              <button className={`text-sm font-medium hover:opacity-80 ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}>
                {t('viewAll')}
              </button>
            </div>
            <div className="space-y-4">
              {[
                { id: 1, name: dir === 'rtl' ? 'دورة React المتقدمة 2026' : 'Advanced React Course 2026', sales: 142, revenue: '$12,780', growth: '+24%' },
                { id: 2, name: dir === 'rtl' ? 'قالب Dashboard احترافي' : 'Professional Dashboard Template', sales: 98, revenue: '$8,820', growth: '+18%' },
                { id: 3, name: dir === 'rtl' ? 'حزمة أيقونات فريدة' : 'Unique Icons Pack', sales: 76, revenue: '$3,800', growth: '+32%' },
                { id: 4, name: dir === 'rtl' ? 'دورة تصميم واجهات UI/UX' : 'UI/UX Design Course', sales: 65, revenue: '$5,850', growth: '+12%' },
                { id: 5, name: dir === 'rtl' ? 'إضافة متجر إلكتروني' : 'E-commerce Plugin', sales: 54, revenue: '$4,266', growth: '+8%' },
              ].map((product) => (
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
                      <h4 className={`font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {product.name}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {product.sales} {t('sales')}
                      </p>
                    </div>
                  </div>
                  <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
                    <div className={`font-bold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {product.revenue}
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {product.growth}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الطلبات الأخيرة والنشاطات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('recentOrders')}
              </h2>
              <button className={`text-sm font-medium hover:opacity-80 ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}>
                {t('viewAll')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <th className={`px-4 py-3 text-xs font-medium uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {dir === 'rtl' ? 'رقم الطلب' : 'Order ID'}
                    </th>
                    <th className={`px-4 py-3 text-xs font-medium uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {dir === 'rtl' ? 'العميل' : 'Customer'}
                    </th>
                    <th className={`px-4 py-3 text-xs font-medium uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {dir === 'rtl' ? 'المنتج' : 'Product'}
                    </th>
                    <th className={`px-4 py-3 text-xs font-medium uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {dir === 'rtl' ? 'القيمة' : 'Amount'}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'
                }`}>
                  {[
                    { id: '2026-001', customer: dir === 'rtl' ? 'أحمد السيد' : 'Ahmed Al-Sayed', product: dir === 'rtl' ? 'قالب ويب متكامل' : 'Complete Web Template', amount: '$149' },
                    { id: '2026-002', customer: dir === 'rtl' ? 'شركة التقنية' : 'Technology Co.', product: dir === 'rtl' ? 'حزمة تطوير' : 'Development Package', amount: '$499' },
                    { id: '2026-003', customer: dir === 'rtl' ? 'مريم عبدالرحمن' : 'Mariam Abdulrahman', product: dir === 'rtl' ? 'دورة تصميم UI/UX' : 'UI/UX Design Course', amount: '$89' },
                  ].map((order) => (
                    <tr key={order.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{order.id}</td>
                      <td className={`px-4 py-3 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        {order.customer}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                      }`}>
                        {order.product}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap font-bold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {order.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div 
            className="rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: 'rgba(43, 44, 52, 0.4)',
              borderColor: 'rgba(58, 58, 62, 0.5)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className={`flex justify-between items-center mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('latestActivities')}
              </h2>
              <button className={`text-sm font-medium hover:opacity-80 ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}>
                {t('viewAll')}
              </button>
            </div>
            <div className="space-y-4">
              {[
                { id: 1, user: dir === 'rtl' ? 'أحمد محمد' : 'Ahmed Mohammed', action: t('createdProduct'), time: t('5MinutesAgo') },
                { id: 2, user: dir === 'rtl' ? 'سارة عبدالله' : 'Sara Abdullah', action: t('updatedOrder'), time: t('15MinutesAgo') },
                { id: 3, user: dir === 'rtl' ? 'نظام الدفع' : 'Payment System', action: t('receivedPayment'), time: t('1HourAgo') },
                { id: 4, user: dir === 'rtl' ? 'محمد خالد' : 'Mohammed Khaled', action: t('addedReview'), time: t('3HoursAgo') },
              ].map((activity) => (
                <div key={activity.id} className={`flex items-start p-3 rounded-xl transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    dir === 'rtl' ? 'ml-3' : 'mr-3'
                  } ${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="flex-1">
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* معلومات سريعة */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl p-6 border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-800/30'
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100'
          }`}>
            <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                dir === 'rtl' ? 'ml-4' : 'mr-4'
              } ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}>
                <i className="fas fa-bolt text-white text-xl"></i>
              </div>
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('systemPerformance')}
              </h3>
            </div>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('allSystemsWorking')}. {t('noTechnicalIssues')}.
            </p>
            <div className={`text-sm font-medium ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}></i> {t('status')}: {t('excellent')}
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-800/30'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
          }`}>
            <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                dir === 'rtl' ? 'ml-4' : 'mr-4'
              } ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}>
                <i className="fas fa-star text-white text-xl"></i>
              </div>
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('reviews')}
              </h3>
            </div>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('customerRating')}: <span className="font-bold">4.8/5</span>
            </p>
            <div className={`text-sm font-medium ${
              theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
            }`}>
              <i className={`fas fa-chart-line ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}></i> {t('increaseFromLastMonth')}
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800/30'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
          }`}>
            <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                dir === 'rtl' ? 'ml-4' : 'mr-4'
              } ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                <i className="fas fa-bullhorn text-white text-xl"></i>
              </div>
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {t('marketingCampaigns')}
              </h3>
            </div>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('activeCampaigns')}. {t('lastCampaignVisitors')}.
            </p>
            <div className={`text-sm font-medium ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <i className={`fas fa-rocket ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}></i> {t('conversionRateTitle')}: 4.2%
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