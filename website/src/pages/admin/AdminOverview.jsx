import { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, Layers, DollarSign, TrendingUp,
  Eye, Clock, CreditCard, Activity, Loader2, RefreshCw, AlertTriangle,
  Package, Ticket
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function AdminOverview() {
  const { isRTL } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, paymentsRes, activitiesRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getPayments({ limit: 5 }),
        api.getDashboardActivities(5),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      else throw statsRes.reason;
      if (paymentsRes.status === 'fulfilled') setRecentPayments(paymentsRes.value?.payments || []);
      if (activitiesRes.status === 'fulfilled') setActivities(activitiesRes.value?.activities || []);
    } catch (err) {
      setError(err?.error || 'فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-dark-400 text-sm">{error}</p>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm transition-all">
          <RefreshCw className="w-4 h-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  const statCards = [
    { labelAr: 'إجمالي المستخدمين', labelEn: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-primary-500 to-primary-600', bgColor: 'bg-primary-500/10' },
    { labelAr: 'العملاء', labelEn: 'Customers', value: stats?.totalCustomers || 0, icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10' },
    { labelAr: 'الإيرادات', labelEn: 'Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500/10' },
    { labelAr: 'المنتجات', labelEn: 'Products', value: stats?.totalProducts || 0, icon: Layers, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-500/10' },
  ];

  const extraStats = [
    { labelAr: 'الطلبات', labelEn: 'Orders', value: stats?.totalOrders || 0, sub: `${stats?.pendingOrders || 0} ${isRTL ? 'معلق' : 'pending'}`, icon: Package, color: 'text-blue-400 bg-blue-500/10' },
    { labelAr: 'طلبات اليوم', labelEn: "Today's Orders", value: stats?.ordersToday || 0, sub: `$${(stats?.todayRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
    { labelAr: 'التذاكر', labelEn: 'Tickets', value: stats?.totalTickets || 0, sub: `${stats?.openTickets || 0} ${isRTL ? 'مفتوح' : 'open'}`, icon: Ticket, color: 'text-purple-400 bg-purple-500/10' },
    { labelAr: 'الإشعارات', labelEn: 'Notifications', value: stats?.unreadNotifications || 0, sub: isRTL ? 'غير مقروء' : 'unread', icon: Activity, color: 'text-pink-400 bg-pink-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'بيانات حية من السيرفر' : 'Live data from server'}
          </p>
        </div>
        <button onClick={loadData} className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white transition-all" title={isRTL ? 'تحديث' : 'Refresh'}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" style={{color: 'var(--tw-gradient-from, #7c3aed)'}} />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-dark-400 text-sm mt-1">{isRTL ? stat.labelAr : stat.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* Extra Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {extraStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-xl border border-white/5 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-dark-500 text-xs">{isRTL ? s.labelAr : s.labelEn}</p>
              <p className="text-dark-600 text-[11px] mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-400" />
              {isRTL ? 'آخر المدفوعات' : 'Recent Payments'}
            </h3>
          </div>
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'العميل' : 'Customer'}</th>
                    <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'النوع' : 'Type'}</th>
                    <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المبلغ' : 'Amount'}</th>
                    <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.slice(0, 5).map(p => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-primary-400 border border-primary-500/20">
                            {(p.customer_name || p.customer_email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-xs">{p.customer_name || '-'}</p>
                            <p className="text-dark-500 text-[11px]">{p.customer_email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-dark-300 text-xs capitalize">{p.type || '-'}</td>
                      <td className="px-6 py-3 text-white font-medium text-xs">${p.amount || 0}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-3 text-dark-500 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-dark-500 text-xs">{isRTL ? 'لا توجد مدفوعات بعد' : 'No payments yet'}</p>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="bg-[#111827] rounded-2xl border border-white/5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
            </h3>
          </div>
          <div className="p-4 space-y-1">
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-primary-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-300 text-xs leading-relaxed">{act.message || act.description || act.text}</p>
                  <p className="text-dark-600 text-[11px] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.created_at ? new Date(act.created_at).toLocaleString() : act.time || ''}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                <p className="text-dark-500 text-xs">{isRTL ? 'لا يوجد نشاط' : 'No activity'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {stats?.subscription && (
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            {isRTL ? 'الاشتراك' : 'Subscription'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الخطة' : 'Plan'}</p>
              <p className="text-white text-sm font-bold capitalize">{stats.subscription.plan || 'free'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الحالة' : 'Status'}</p>
              <p className={`text-sm font-bold capitalize ${stats.subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>{stats.subscription.status || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'ينتهي' : 'Expires'}</p>
              <p className="text-white text-sm font-bold">{stats.subscription.expires_at ? new Date(stats.subscription.expires_at).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
