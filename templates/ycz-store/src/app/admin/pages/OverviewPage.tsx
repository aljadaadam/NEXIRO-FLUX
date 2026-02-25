'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users,
  BarChart3, Clock, Package, RefreshCw, Inbox, Plus, Eye, Settings,
  MessageCircle, AlertCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { StatsCard, Order } from '@/lib/types';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

// ─── Map stat icon keys to Lucide components ───
const STAT_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  earnings: DollarSign,
  orders: ShoppingCart,
  users: Users,
  rate: BarChart3,
};

const EMPTY_STATS: StatsCard[] = [
  { label: 'إجمالي الأرباح', value: '$0', change: '0%', positive: true, icon: 'earnings', color: '#7c5cff', bg: '#f5f3ff' },
  { label: 'الطلبات', value: '0', change: '0%', positive: true, icon: 'orders', color: '#0ea5e9', bg: '#eff6ff' },
  { label: 'المستخدمين', value: '0', change: '0%', positive: true, icon: 'users', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'معدل الإكمال', value: '0%', change: '0%', positive: true, icon: 'rate', color: '#f59e0b', bg: '#fffbeb' },
];

const EMPTY_CHART: { month: string; value: number }[] = [];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'معلق', color: '#f59e0b', bg: '#fffbeb' },
  processing: { label: 'جارٍ', color: '#3b82f6', bg: '#eff6ff' },
  completed: { label: 'مكتمل', color: '#22c55e', bg: '#f0fdf4' },
  failed: { label: 'مرفوض', color: '#ef4444', bg: '#fef2f2' },
  cancelled: { label: 'ملغي', color: '#94a3b8', bg: '#f8fafc' },
  refunded: { label: 'مسترجع', color: '#8b5cf6', bg: '#f5f3ff' },
};

// ─── Skeleton Pulse Block ───
function Skeleton({ width, height, borderRadius = 8 }: { width: string | number; height: string | number; borderRadius?: number }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

// ─── Stats Skeleton ───
function StatsSkeleton() {
  return (
    <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          background: '#fff', borderRadius: 16, padding: '1.25rem',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <Skeleton width={42} height={42} borderRadius={12} />
            <Skeleton width={48} height={16} />
          </div>
          <Skeleton width="60%" height={28} borderRadius={6} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="40%" height={14} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Chart Skeleton ───
function ChartSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '0 0.5rem' }}>
      {[60, 90, 45, 110, 80, 130, 70, 100, 55, 120, 85, 95].map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Skeleton width="100%" height={h} borderRadius={6} />
          <Skeleton width={20} height={10} borderRadius={3} />
        </div>
      ))}
    </div>
  );
}

// ─── Orders Skeleton ───
function OrdersSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.75rem', borderRadius: 10, background: '#f8fafc' }}>
          <Skeleton width={32} height={32} borderRadius={8} />
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height={14} borderRadius={4} />
            <div style={{ marginTop: 6 }}>
              <Skeleton width="40%" height={10} borderRadius={3} />
            </div>
          </div>
          <div>
            <Skeleton width={50} height={14} borderRadius={4} />
            <div style={{ marginTop: 6 }}>
              <Skeleton width={36} height={10} borderRadius={3} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewPage({ theme }: { theme: ColorTheme }) {
  const [stats, setStats] = useState<StatsCard[]>(EMPTY_STATS);
  const [chartData, setChartData] = useState(EMPTY_CHART);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const { t, isRTL } = useAdminLang();

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await adminApi.getStats();
      if (res?.stats && Array.isArray(res.stats)) {
        setStats(res.stats);
      } else {
        const totalOrders = Number(res?.totalOrders || 0);
        const completedOrders = Number(res?.completedOrders || 0);
        const totalCustomers = Number(res?.totalCustomers || 0);
        const totalProfit = Number(res?.totalProfit || 0);
        const todayProfit = Number(res?.todayProfit || 0);
        const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

        setStats([
          {
            label: 'إجمالي الأرباح',
            value: `$${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            change: `${todayProfit >= 0 ? '+' : ''}$${todayProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            positive: todayProfit >= 0,
            icon: 'earnings',
            color: '#7c5cff',
            bg: '#f5f3ff',
          },
          {
            label: 'الطلبات',
            value: String(totalOrders),
            change: isRTL ? `${Number(res?.ordersToday || 0) || 0} اليوم` : `${Number(res?.ordersToday || 0) || 0} today`,
            positive: true,
            icon: 'orders',
            color: '#0ea5e9',
            bg: '#eff6ff',
          },
          {
            label: 'الزبائن',
            value: String(totalCustomers),
            change: 'إجمالي',
            positive: true,
            icon: 'users',
            color: '#22c55e',
            bg: '#f0fdf4',
          },
          {
            label: 'معدل الإكمال',
            value: `${completionRate.toFixed(1)}%`,
            change: `${completedOrders}/${totalOrders}`,
            positive: completionRate >= 50,
            icon: 'rate',
            color: '#f59e0b',
            bg: '#fffbeb',
          },
        ]);
      }
      if (res?.chartData && Array.isArray(res.chartData)) setChartData(res.chartData);
      if (res?.recentOrders && Array.isArray(res.recentOrders)) setOrders(res.recentOrders);
    } catch { /* keep fallback */ }

    // Also try to load orders separately
    try {
      const ordersRes = await adminApi.getOrders();
      let allOrders: Order[] = [];
      if (Array.isArray(ordersRes)) allOrders = ordersRes;
      else if (ordersRes?.orders && Array.isArray(ordersRes.orders)) allOrders = ordersRes.orders;
      setOrders(allOrders.slice(0, 5));
      setPendingCount(allOrders.filter((o: Order) => o.status === 'pending').length);
    } catch { /* keep fallback */ }

    // Chat unread
    try {
      const chatRes = await adminApi.getChatUnread() as { unread?: number; totalUnread?: number };
      setUnreadChat(chatRes?.unread || chatRes?.totalUnread || 0);
    } catch { /* silent */ }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // ─── Quick action items ───
  const quickActions = [
    { icon: Plus, label: t('منتج جديد'), color: theme.primary, bg: `${theme.primary}12`, page: 'products' },
    { icon: ShoppingCart, label: t('الطلبات المعلقة'), color: '#f59e0b', bg: '#fffbeb', page: 'orders', badge: pendingCount },
    { icon: MessageCircle, label: t('الرسائل'), color: '#3b82f6', bg: '#eff6ff', page: 'chat', badge: unreadChat },
    { icon: Eye, label: t('معاينة المتجر'), color: '#22c55e', bg: '#f0fdf4', page: '_preview' },
    { icon: Settings, label: t('الإعدادات'), color: '#64748b', bg: '#f8fafc', page: 'settings' },
  ];

  return (
    <>
      {/* Banner Card */}
      <div className="dash-banner-card" style={{
        marginBottom: 16,
        borderRadius: 20,
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
        minHeight: 140,
      }}>
        {/* Background Image Layer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 40%, ${theme.primary}88 100%)`,
        }} />

        {/* Decorative SVG Shapes */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} preserveAspectRatio="none">
          <defs>
            <pattern id="dash-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dash-grid)" />
        </svg>

        {/* Floating Decorative Circles */}
        <div style={{
          position: 'absolute', top: -30, right: -20,
          width: 160, height: 160, borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.primary}44 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: '30%',
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.secondary}33 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '15%',
          width: 80, height: 80, borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent || theme.primary}22 0%, transparent 70%)`,
          transform: 'translateY(-50%)',
        }} />

        {/* Decorative Lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}>
          <line x1="0" y1="100%" x2="60%" y2="0" stroke="white" strokeWidth="1" />
          <line x1="40%" y1="100%" x2="100%" y2="0" stroke="white" strokeWidth="0.5" />
          <line x1="70%" y1="100%" x2="100%" y2="30%" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Small Dot Decoration */}
        <svg style={{ position: 'absolute', top: 12, left: 16, opacity: 0.3 }}>
          <circle cx="4" cy="4" r="2" fill="white" />
          <circle cx="14" cy="4" r="2" fill="white" />
          <circle cx="24" cy="4" r="2" fill="white" />
          <circle cx="4" cy="14" r="1.5" fill="white" />
          <circle cx="14" cy="14" r="1.5" fill="white" />
        </svg>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          minHeight: 140,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.2rem 0.65rem',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              marginBottom: 10,
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase' as const,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              {t('لوحة التحكم')}
            </div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              lineHeight: 1.6,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              maxWidth: 420,
            }}>
              {t('إدارة المتجر ومتابعة الأداء من مكان واحد')}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: refreshing ? 'wait' : 'pointer',
                display: 'grid', placeItems: 'center',
                color: '#fff',
                transition: 'all 0.2s',
              }}
              title={t('تحديث البيانات')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
            <div style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 999,
              background: 'rgba(34,197,94,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(34,197,94,0.3)',
              fontSize: '0.76rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#bbf7d0',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e55' }} />
              {t('المتجر نشط')} ✅
            </div>
          </div>
        </div>
      </div>

      {/* Alerts: pending orders / unread chat */}
      {(pendingCount > 0 || unreadChat > 0) && !loading && (
        <div className="dash-alerts-row" style={{
          display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap',
        }}>
          {pendingCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.55rem 1rem', borderRadius: 12,
              background: '#fffbeb', border: '1px solid #fde68a',
              fontSize: '0.78rem', fontWeight: 600, color: '#92400e',
            }}>
              <AlertCircle size={15} />
              {isRTL ? <>لديك {pendingCount} طلب معلق بانتظار المعالجة</> : <>You have {pendingCount} pending order(s) awaiting processing</>}
            </div>
          )}
          {unreadChat > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.55rem 1rem', borderRadius: 12,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              fontSize: '0.78rem', fontWeight: 600, color: '#1e40af',
            }}>
              <MessageCircle size={15} />
              {isRTL ? <>لديك {unreadChat} رسالة جديدة غير مقروءة</> : <>You have {unreadChat} new unread message(s)</>}
            </div>
          )}
        </div>
      )}

      {/* Stats Cards or Skeleton */}
      {loading ? <StatsSkeleton /> : (
        <div className="dash-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20,
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="dash-stat-card" style={{
              background: '#fff', borderRadius: 16, padding: '1.25rem',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: stat.bg, display: 'grid', placeItems: 'center',
                }}>
                  {(() => {
                    const IconComp = STAT_ICONS[stat.icon] || BarChart3;
                    return <IconComp size={20} color={stat.color} />;
                  })()}
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  fontSize: '0.7rem', fontWeight: 700,
                  color: stat.positive ? '#22c55e' : '#ef4444',
                  padding: '2px 6px', borderRadius: 6,
                  background: stat.positive ? '#f0fdf4' : '#fef2f2',
                }}>
                  {stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {t(stat.change)}
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0b1020', marginBottom: 2 }}>{stat.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t(stat.label)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="dash-quick-actions" style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => {
                if (action.page === '_preview') {
                  window.open('/', '_blank');
                } else {
                  // Navigate by dispatching to parent via URL param would be complex,
                  // so we use a custom event that the layout can listen to
                  window.dispatchEvent(new CustomEvent('admin-navigate', { detail: action.page }));
                }
              }}
              className="dash-quick-action-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.55rem 1rem', borderRadius: 12,
                background: action.bg, border: '1px solid transparent',
                color: action.color, fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.2s', position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = action.color + '40'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Icon size={16} />
              {action.label}
              {action.badge && action.badge > 0 ? (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: action.color, color: '#fff',
                  fontSize: '0.6rem', fontWeight: 800,
                  display: 'grid', placeItems: 'center',
                  padding: '0 4px', lineHeight: 1,
                  fontFamily: 'system-ui',
                }}>
                  {action.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Chart + Recent Orders */}
      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        {/* Chart */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color={theme.primary} />
            {t('المبيعات الشهرية')}
          </h3>
          {loading ? <ChartSkeleton /> : chartData.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: 180, color: '#94a3b8', gap: 8,
            }}>
              <BarChart3 size={36} color="#e2e8f0" />
              <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('لا توجد بيانات مبيعات بعد')}</p>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 8, height: 180,
              padding: '0 0.5rem', position: 'relative',
            }}>
              {chartData.map((d, i) => {
                const barHeight = Math.max((d.value / maxValue) * 140, 8);
                const isHovered = hoveredBar === i;
                return (
                  <div
                    key={i}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute', bottom: barHeight + 30, left: '50%', transform: 'translateX(-50%)',
                        background: '#1e293b', color: '#fff', padding: '4px 10px', borderRadius: 8,
                        fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        pointerEvents: 'none',
                      }}>
                        <div>{d.month}</div>
                        <div style={{ color: '#93c5fd' }}>${d.value.toLocaleString()}</div>
                        <div style={{
                          position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                          width: 8, height: 8, background: '#1e293b',
                        }} />
                      </div>
                    )}
                    <span style={{
                      fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600,
                      opacity: isHovered ? 0 : 1, transition: 'opacity 0.15s',
                    }}>
                      ${(d.value / 1000).toFixed(1)}k
                    </span>
                    <div style={{
                      width: '100%', borderRadius: 6,
                      height: barHeight,
                      background: isHovered
                        ? `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`
                        : `linear-gradient(to top, ${theme.primary}cc, ${theme.secondary}aa)`,
                      opacity: isHovered ? 1 : 0.75,
                      transition: 'all 0.25s',
                      minHeight: 8,
                      cursor: 'pointer',
                    }} />
                    <span style={{
                      fontSize: '0.5rem', color: isHovered ? theme.primary : '#94a3b8',
                      fontWeight: isHovered ? 700 : 400,
                      transition: 'all 0.15s',
                    }}>
                      {d.month.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.25rem',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color={theme.primary} />
              {t('آخر الطلبات')}
            </h3>
            {orders.length > 0 && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: 'orders' }))}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: theme.primary, fontSize: '0.72rem', fontWeight: 700,
                  fontFamily: 'Tajawal, sans-serif',
                }}
              >
                {t('عرض الكل')}
              </button>
            )}
          </div>
          {loading ? <OrdersSkeleton /> : orders.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '2rem 1rem',
              color: '#94a3b8', gap: 8,
            }}>
              <Inbox size={32} color="#cbd5e1" />
              <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('لا توجد طلبات بعد')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {orders.slice(0, 5).map(order => {
                const si = STATUS_MAP[String(order.status)] || STATUS_MAP['pending'];
                return (
                  <div key={order.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.6rem 0.75rem', borderRadius: 10,
                    background: '#f8fafc',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#eff6ff', display: 'grid', placeItems: 'center',
                      flexShrink: 0,
                    }}>
                      <Package size={15} color="#0ea5e9" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '0.78rem', fontWeight: 600, color: '#0b1020',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {order.product_name}
                      </p>
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{order.order_number}</p>
                    </div>
                    <div style={{ textAlign: isRTL ? 'left' : 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0b1020' }}>
                        ${Number(order.total_price).toFixed(2)}
                      </p>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 700,
                        color: si.color,
                        background: si.bg,
                        padding: '1px 6px', borderRadius: 4,
                      }}>
                        {t(si.label)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </>
  );
}
