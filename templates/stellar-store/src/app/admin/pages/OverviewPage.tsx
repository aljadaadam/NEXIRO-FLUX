'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Loader2, ArrowUpRight, Clock, CheckCircle, AlertCircle, Zap, BarChart3, Activity } from 'lucide-react';
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

// ─── Mini Bar Chart ───
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className={`w-[6px] rounded-full ${color} animate-barGrow`}
          style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
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

// ─── Demo Data ───
const DEMO_RECENT_ORDERS = [
  { id: 'ORD-001', product: 'تفعيل ويندوز 11 برو', customer: 'أحمد محمد', amount: 25000, status: 'completed', time: 'منذ 5 دقائق' },
  { id: 'ORD-002', product: 'شحن PUBG 660 UC', customer: 'سارة علي', amount: 18000, status: 'processing', time: 'منذ 12 دقيقة' },
  { id: 'ORD-003', product: 'اشتراك beIN شهري', customer: 'محمد خالد', amount: 45000, status: 'completed', time: 'منذ 25 دقيقة' },
  { id: 'ORD-004', product: 'تفعيل أوفيس 365', customer: 'فاطمة حسن', amount: 35000, status: 'pending', time: 'منذ 40 دقيقة' },
  { id: 'ORD-005', product: 'نتفلكس شهر', customer: 'عمر يوسف', amount: 12000, status: 'completed', time: 'منذ ساعة' },
];

const WEEKLY_REVENUE = [320000, 180000, 450000, 280000, 520000, 380000, 610000];
const WEEKLY_ORDERS = [8, 5, 12, 7, 15, 10, 18];
const DAYS = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

const TOP_PRODUCTS = [
  { name: 'تفعيل ويندوز 11 برو', sales: 42, percent: 85 },
  { name: 'شحن PUBG 660 UC', sales: 38, percent: 76 },
  { name: 'اشتراك beIN شهري', sales: 28, percent: 56 },
  { name: 'نتفلكس شهر', sales: 22, percent: 44 },
];

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats(data))
      .catch(() => setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 }))
      .finally(() => setLoading(false));
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
    { label: 'المنتجات', value: stats?.totalProducts || 0, icon: Package, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20', glow: 'shadow-gold-500/10', gradient: 'from-gold-500/20 to-transparent', spark: WEEKLY_ORDERS, sparkColor: 'bg-gold-500/60', change: '+12%' },
    { label: 'الطلبات', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', glow: 'shadow-blue-400/10', gradient: 'from-blue-400/20 to-transparent', spark: [12, 8, 15, 10, 18, 14, 20], sparkColor: 'bg-blue-400/60', change: '+24%' },
    { label: 'الإيرادات', value: stats?.totalRevenue || 0, isCurrency: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', glow: 'shadow-emerald-400/10', gradient: 'from-emerald-400/20 to-transparent', spark: WEEKLY_REVENUE.map(v => v / 10000), sparkColor: 'bg-emerald-400/60', change: '+18%' },
    { label: 'العملاء', value: stats?.totalCustomers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', glow: 'shadow-purple-400/10', gradient: 'from-purple-400/20 to-transparent', spark: [4, 6, 3, 8, 5, 7, 9], sparkColor: 'bg-purple-400/60', change: '+8%' },
  ];

  const statusIcons: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'مكتمل' },
    processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'قيد التنفيذ' },
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'معلّق' },
  };

  const orderCompletion = stats ? Math.round(((stats.totalOrders * 0.7) / Math.max(stats.totalOrders, 1)) * 100) : 70;
  const customerGrowth = 78;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px]">
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
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 text-xs font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    {card.change}
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white animate-countUp" style={{ animationDelay: `${i * 0.15 + 0.3}s` }}>
                  {card.isCurrency ? (
                    <AnimatedCounter end={card.value as number} suffix=" SDG" duration={2000} />
                  ) : (
                    <AnimatedCounter end={card.value as number} duration={1600} />
                  )}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-navy-400 text-sm font-medium">{card.label}</p>
                  <MiniBarChart data={card.spark} color={card.sparkColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Revenue Chart + Stats Ring ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold-500" />
              <h3 className="text-white font-bold text-lg">إيرادات الأسبوع</h3>
            </div>
            <div className="text-emerald-400 text-sm font-bold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +18%
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {WEEKLY_REVENUE.map((val, i) => {
              const max = Math.max(...WEEKLY_REVENUE);
              const h = (val / max) * 100;
              const isToday = i === WEEKLY_REVENUE.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className={`text-[10px] font-bold ${isToday ? 'text-gold-500' : 'text-navy-500'}`}>
                    {(val / 1000).toFixed(0)}K
                  </span>
                  <div className="w-full max-w-[32px] relative group/bar">
                    <div
                      className={`w-full rounded-lg animate-barGrow ${isToday
                        ? 'bg-gradient-to-t from-gold-500 to-gold-400 shadow-lg shadow-gold-500/20'
                        : 'bg-gradient-to-t from-navy-700/80 to-navy-600/60 group-hover/bar:from-gold-500/40 group-hover/bar:to-gold-400/30'
                      } transition-all duration-300`}
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1 + 0.6}s` }}
                    />
                  </div>
                  <span className={`text-[10px] ${isToday ? 'text-gold-500 font-bold' : 'text-navy-500'}`}>
                    {DAYS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Rings */}
        <div className="bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-navy-300 text-xs">نمو العملاء</span>
                  <span className="text-emerald-400 text-xs font-bold">{customerGrowth}%</span>
                </div>
                <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-500 rounded-full animate-progressFill" style={{ width: `${customerGrowth}%`, animationDelay: '0.8s' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-navy-300 text-xs">رضا العملاء</span>
                  <span className="text-purple-400 text-xs font-bold">92%</span>
                </div>
                <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-purple-400 to-purple-500 rounded-full animate-progressFill" style={{ width: '92%', animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Orders + Top Products ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gold-500" />
              <h3 className="text-white font-bold text-lg">آخر الطلبات</h3>
            </div>
            <span className="text-navy-500 text-xs">آخر تحديث: الآن</span>
          </div>
          <div className="space-y-3">
            {DEMO_RECENT_ORDERS.map((order, i) => {
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
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-bold text-lg">الأكثر مبيعاً</h3>
          </div>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product, i) => (
              <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.12 + 0.9}s` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-medium truncate">{product.name}</span>
                  <span className="text-navy-400 text-xs font-bold whitespace-nowrap">{product.sales} مبيعة</span>
                </div>
                <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-400 animate-progressFill"
                    style={{ width: `${product.percent}%`, animationDelay: `${i * 0.15 + 1}s` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/15 animate-pulseGlow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">أداء ممتاز!</p>
                <p className="text-navy-400 text-xs">الطلبات زادت بنسبة 24% هذا الأسبوع</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Activity Timeline ─── */}
      <div className="bg-navy-900/70 border border-navy-700/40 rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: '1s' }}>
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-gold-500" />
          <h3 className="text-white font-bold text-lg">النشاط الأخير</h3>
        </div>
        <div className="relative">
          <div className="absolute right-[15px] top-2 bottom-2 w-px bg-navy-700/50" />
          {[
            { text: 'تم إتمام طلب ORD-001 بنجاح', time: 'منذ 5 دقائق', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', ringColor: 'ring-emerald-400/20' },
            { text: 'عميل جديد سجّل في المتجر', time: 'منذ 15 دقيقة', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', ringColor: 'ring-purple-400/20' },
            { text: 'تم استلام دفعة بقيمة 200,000 SDG', time: 'منذ 30 دقيقة', icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-500/10', ringColor: 'ring-gold-500/20' },
            { text: 'تنبيه: مخزون PUBG 660 UC منخفض', time: 'منذ ساعة', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', ringColor: 'ring-amber-400/20' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="relative flex items-start gap-4 pb-5 last:pb-0 animate-fadeInUp" style={{ animationDelay: `${i * 0.12 + 1.1}s` }}>
                <div className={`relative z-10 w-8 h-8 rounded-full ${item.bg} ring-2 ${item.ringColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-white text-sm">{item.text}</p>
                  <p className="text-navy-500 text-xs mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
