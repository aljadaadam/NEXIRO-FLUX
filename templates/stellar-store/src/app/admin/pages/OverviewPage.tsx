'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Loader2, ArrowUpRight, Clock, CheckCircle, AlertCircle, Zap, BarChart3, Activity, Inbox } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

// ─── Animated Counter ───
function AnimatedCounter({ end, duration = 1800, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Circular Progress ───
function CircularProgress({ percent, size = 64, strokeWidth = 5, color }: { percent: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percent / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [percent, circumference]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-[1500ms] ease-out" />
    </svg>
  );
}

// ─── Empty State ───
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Inbox className="w-10 h-10 text-navy-600 mb-2" />
      <p className="text-navy-500 text-sm">{message}</p>
    </div>
  );
}

type RecentOrder = {
  id: string;
  product: string;
  customer: string;
  amount: number;
  status: string;
  time: string;
};

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats(data))
      .catch(() => setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 }))
      .finally(() => setLoading(false));

    // Fetch real recent orders
    adminApi.getOrders(1, 5)
      .then(data => {
        const orders = data?.orders || (Array.isArray(data) ? data : []);
        if (orders.length > 0) {
          const statusMap: Record<string, string> = { completed: 'completed', processing: 'processing', pending: 'pending', cancelled: 'pending' };
          const mapped = orders.slice(0, 5).map((o: Record<string, unknown>) => ({
            id: o.order_number as string || `ORD-${o.id}`,
            product: (o.product_name || 'منتج') as string,
            customer: (o.customer_name || 'عميل') as string,
            amount: (o.total_price || 0) as number,
            status: statusMap[(o.status as string) || 'pending'] || 'pending',
            time: o.created_at ? new Date(o.created_at as string).toLocaleDateString('ar') : '',
          }));
          setRecentOrders(mapped);
        }
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
          <p className="text-navy-400 text-sm mt-4">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'المنتجات', value: stats?.totalProducts || 0, icon: Package, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20', glow: 'shadow-gold-500/10', gradient: 'from-gold-500/20 to-transparent' },
    { label: 'الطلبات', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', glow: 'shadow-blue-400/10', gradient: 'from-blue-400/20 to-transparent' },
    { label: 'الإيرادات', value: stats?.totalRevenue || 0, isCurrency: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', glow: 'shadow-emerald-400/10', gradient: 'from-emerald-400/20 to-transparent' },
    { label: 'العملاء', value: stats?.totalCustomers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', glow: 'shadow-purple-400/10', gradient: 'from-purple-400/20 to-transparent' },
  ];

  const statusIcons: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'مكتمل' },
    processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'قيد التنفيذ' },
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'معلّق' },
  };

  const orderCompletion = stats && stats.totalOrders > 0
    ? Math.round((stats.completedOrders || 0) / stats.totalOrders * 100)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full">
      {/* ─── Header ─── */}
      <div className="animate-fadeInUp">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center animate-float">
            <Zap className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">مرحباً بك 👋</h1>
            <p className="text-navy-400 text-sm">إليك نظرة عامة على أداء متجرك اليوم</p>
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden p-5 rounded-2xl bg-navy-900/70 border ${card.border} hover:shadow-lg ${card.glow} transition-all duration-300 hover:-translate-y-1 group animate-fadeInUp`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center ring-1 ring-white/5`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white animate-countUp" style={{ animationDelay: `${i * 0.15 + 0.3}s` }}>
                  {card.isCurrency ? (
                    <AnimatedCounter end={card.value as number} suffix=" SDG" duration={2000} />
                  ) : (
                    <AnimatedCounter end={card.value as number} duration={1600} />
                  )}
                </p>
                <p className="text-navy-400 text-sm font-medium mt-2">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Stats Ring ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Rings */}
        <div className="bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-bold text-lg">الأداء</h3>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <CircularProgress percent={orderCompletion} size={100} strokeWidth={7} color="#f5a623" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white"><AnimatedCounter end={orderCompletion} duration={1500} />%</span>
                <span className="text-[10px] text-navy-400">إكمال الطلبات</span>
              </div>
            </div>
            <div className="w-full space-y-4">
              <div className="text-center">
                <p className="text-navy-300 text-xs">الطلبات المكتملة</p>
                <p className="text-white font-bold text-lg">{stats?.completedOrders || 0} / {stats?.totalOrders || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-navy-300 text-xs">طلبات معلّقة</p>
                <p className="text-amber-400 font-bold text-lg">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-bold text-lg">ملخص سريع</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-navy-800/40 border border-navy-700/20">
              <p className="text-navy-400 text-xs mb-1">إيرادات اليوم</p>
              <p className="text-white font-black text-xl">{(stats?.todayRevenue || stats?.revenueToday || 0).toLocaleString()} SDG</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-800/40 border border-navy-700/20">
              <p className="text-navy-400 text-xs mb-1">طلبات اليوم</p>
              <p className="text-white font-black text-xl">{stats?.ordersToday || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-800/40 border border-navy-700/20">
              <p className="text-navy-400 text-xs mb-1">إجمالي الأرباح</p>
              <p className="text-emerald-400 font-black text-xl">{(stats?.totalProfit || 0).toLocaleString()} SDG</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-800/40 border border-navy-700/20">
              <p className="text-navy-400 text-xs mb-1">أرباح اليوم</p>
              <p className="text-emerald-400 font-black text-xl">{(stats?.todayProfit || 0).toLocaleString()} SDG</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Orders ─── */}
      <div className="bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-bold text-lg">آخر الطلبات</h3>
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState message="لا توجد طلبات بعد" />
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order, i) => {
              const st = statusIcons[order.status] || statusIcons.pending;
              const StIcon = st.icon;
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/40 border border-navy-700/20 hover:border-gold-500/20 transition-all duration-300 animate-fadeInUp group"
                  style={{ animationDelay: `${i * 0.1 + 0.8}s` }}
                >
                  <div className={`w-9 h-9 rounded-lg ${st.bg} flex items-center justify-center shrink-0`}>
                    <StIcon className={`w-4 h-4 ${st.color} ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-bold truncate">{order.product}</p>
                      <span className="text-gold-500 text-sm font-black whitespace-nowrap mr-2">{order.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-navy-400 text-xs truncate">{order.customer}</p>
                      <span className="text-navy-500 text-[10px] whitespace-nowrap">{order.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
