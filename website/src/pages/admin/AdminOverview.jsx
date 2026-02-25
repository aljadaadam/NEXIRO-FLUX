import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Users, Key, TrendingUp,
  Loader2, RefreshCw, AlertTriangle, Clock, DollarSign,
  Ticket, CheckCircle, XCircle, Sparkles, ExternalLink,
  ShieldCheck, Zap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function AdminOverview() {
  const { isRTL } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlatformStats();
      setStats(data);
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

  const mainCards = [
    {
      labelAr: 'إجمالي المواقع', labelEn: 'Total Sites',
      value: stats?.totalSites || 0,
      sub: `+${stats?.newSitesToday || 0} ${isRTL ? 'اليوم' : 'today'}`,
      icon: Globe,
      bg: 'bg-violet-500/10',
      iconColor: '#8b5cf6',
    },
    {
      labelAr: 'الاشتراكات النشطة', labelEn: 'Active Subscriptions',
      value: (stats?.activeSubscriptions || 0) + (stats?.trialSubscriptions || 0),
      sub: `${stats?.trialSubscriptions || 0} ${isRTL ? 'تجريبي' : 'trial'}`,
      icon: ShieldCheck,
      bg: 'bg-emerald-500/10',
      iconColor: '#10b981',
    },
    {
      labelAr: 'إيرادات المنصة', labelEn: 'Platform Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      sub: `+$${(stats?.todayRevenue || 0).toLocaleString()} ${isRTL ? 'اليوم' : 'today'}`,
      icon: DollarSign,
      bg: 'bg-cyan-500/10',
      iconColor: '#06b6d4',
    },
    {
      labelAr: 'أكواد الشراء', labelEn: 'Purchase Codes',
      value: stats?.purchaseCodes?.active || 0,
      sub: `${stats?.purchaseCodes?.totalUses || 0} ${isRTL ? 'استخدام' : 'uses'}`,
      icon: Key,
      bg: 'bg-amber-500/10',
      iconColor: '#f59e0b',
    },
  ];

  const secondaryCards = [
    {
      labelAr: 'مستخدمو المتاجر', labelEn: 'Store Users',
      value: stats?.totalUsers || 0,
      sub: `+${stats?.newUsersToday || 0} ${isRTL ? 'اليوم' : 'today'}`,
      icon: Users, color: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      labelAr: 'تذاكر الدعم', labelEn: 'Support Tickets',
      value: stats?.openTickets || 0,
      sub: `${stats?.resolvedTickets || 0} ${isRTL ? 'محلول' : 'resolved'}`,
      icon: Ticket, color: 'text-rose-400 bg-rose-500/10',
    },
    {
      labelAr: 'الاشتراكات الملغاة', labelEn: 'Inactive Subs',
      value: stats?.inactiveSubscriptions || 0,
      sub: isRTL ? 'ملغى / منتهي' : 'cancelled / expired',
      icon: XCircle, color: 'text-red-400 bg-red-500/10',
    },
    {
      labelAr: 'أكواد مستنفدة', labelEn: 'Used Up Codes',
      value: stats?.purchaseCodes?.fullyUsed || 0,
      sub: `${stats?.purchaseCodes?.total || 0} ${isRTL ? 'إجمالي' : 'total'}`,
      icon: CheckCircle, color: 'text-teal-400 bg-teal-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary-400" />
            {isRTL ? 'لوحة تحكم المنصة' : 'Platform Dashboard'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'نظرة شاملة على جميع المواقع والاشتراكات' : 'Overview of all sites and subscriptions'}
          </p>
        </div>
        <button onClick={loadData} className="p-2.5 rounded-xl bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-all" title={isRTL ? 'تحديث' : 'Refresh'}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                </div>
                <span className="text-dark-600 text-[11px] font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  {card.sub}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">{card.value}</p>
              <p className="text-dark-400 text-sm mt-1">{isRTL ? card.labelAr : card.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {secondaryCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all">
              <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-dark-500 text-xs">{isRTL ? s.labelAr : s.labelEn}</p>
              <p className="text-dark-600 text-[11px] mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Two-column: Recent Sites + Recent Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sites */}
        <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              {isRTL ? 'أحدث المواقع' : 'Recent Sites'}
            </h3>
            <Link to="/admin/sites" className="text-primary-400 hover:text-primary-300 text-[11px] transition-colors">
              {isRTL ? `عرض الكل (${stats?.totalSites || 0})` : `View All (${stats?.totalSites || 0})`}
            </Link>
          </div>
          {stats?.recentSites?.length > 0 ? (
            <div className="divide-y divide-white/5">
              {stats.recentSites.map((site, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                    <Globe className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{site.name || site.domain}</p>
                    <p className="text-dark-500 text-[11px] truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {site.domain}
                    </p>
                  </div>
                  <div className="text-dark-600 text-[11px] flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {site.created_at ? new Date(site.created_at).toLocaleDateString() : '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-dark-500 text-xs">{isRTL ? 'لا توجد مواقع بعد' : 'No sites yet'}</p>
            </div>
          )}
        </div>

        {/* Recent Subscriptions */}
        <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isRTL ? 'آخر الاشتراكات' : 'Recent Subscriptions'}
            </h3>
            <span className="text-dark-600 text-[11px]">
              {isRTL ? `${stats?.totalSubscriptions || 0} اشتراك` : `${stats?.totalSubscriptions || 0} subs`}
            </span>
          </div>
          {stats?.recentSubscriptions?.length > 0 ? (
            <div className="divide-y divide-white/5">
              {stats.recentSubscriptions.map((sub, i) => {
                const statusColors = {
                  active: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: isRTL ? 'نشط' : 'active' },
                  trial: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: isRTL ? 'تجريبي' : 'trial' },
                  cancelled: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', label: isRTL ? 'ملغى' : 'cancelled' },
                  expired: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', label: isRTL ? 'منتهي' : 'expired' },
                };
                const s = statusColors[sub.status] || statusColors.expired;
                const cycleLabels = {
                  monthly: isRTL ? 'شهري' : 'Monthly',
                  yearly: isRTL ? 'سنوي' : 'Yearly',
                  lifetime: isRTL ? 'مدى الحياة' : 'Lifetime',
                };
                return (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${s.bg}`}>
                      <ShieldCheck className={`w-4 h-4 ${s.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{sub.site_name || sub.site_domain}</p>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${s.bg.replace('border-', 'text-').split(' ')[0]} ${s.text}`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-dark-500 text-[11px] flex items-center gap-2">
                        <span>${sub.price || 0}/{cycleLabels[sub.billing_cycle] || sub.billing_cycle}</span>
                        <span className="text-dark-600">•</span>
                        <span>{sub.plan_id || sub.template_id}</span>
                      </p>
                    </div>
                    <div className="text-dark-600 text-[11px] flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheck className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-dark-500 text-xs">{isRTL ? 'لا توجد اشتراكات بعد' : 'No subscriptions yet'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { labelAr: 'إدارة المستخدمين', labelEn: 'Manage Users', icon: Users, to: '/admin/users', color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/10 hover:border-indigo-500/30', iconColor: 'text-indigo-400' },
            { labelAr: 'أكواد الشراء', labelEn: 'Purchase Codes', icon: Key, to: '/admin/purchase-codes', color: 'from-amber-500/10 to-amber-500/5 border-amber-500/10 hover:border-amber-500/30', iconColor: 'text-amber-400' },
            { labelAr: 'تذاكر الدعم', labelEn: 'Support Tickets', icon: Ticket, to: '/admin/tickets', color: 'from-rose-500/10 to-rose-500/5 border-rose-500/10 hover:border-rose-500/30', iconColor: 'text-rose-400' },
            { labelAr: 'إدارة المواقع', labelEn: 'Manage Sites', icon: Globe, to: '/admin/sites', color: 'from-violet-500/10 to-violet-500/5 border-violet-500/10 hover:border-violet-500/30', iconColor: 'text-violet-400' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} to={action.to}
                className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${action.color} border transition-all`}>
                <Icon className={`w-5 h-5 ${action.iconColor}`} />
                <span className="text-white text-sm font-medium">{isRTL ? action.labelAr : action.labelEn}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
