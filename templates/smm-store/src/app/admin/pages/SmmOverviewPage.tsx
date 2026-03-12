'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Eye, RefreshCw, Activity } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  reload?: number;
}

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  key?: string;
  icon?: string;
  color?: string;
  bg?: string;
}

export default function SmmOverviewPage({ theme, darkMode, t, reload }: Props) {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineStats, setOnlineStats] = useState<{ online: number; today_visitors: number } | null>(null);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';

  useEffect(() => {
    const load = async () => {
      try {
        const [s, o] = await Promise.all([
          adminApi.getStats(),
          adminApi.getOrders(),
        ]);
        if (s?.stats && Array.isArray(s.stats)) {
          setStats(s.stats);
        } else {
          const totalOrders = Number(s?.totalOrders || 0);
          const totalCustomers = Number(s?.totalCustomers || 0);
          const totalRevenue = Number(s?.totalRevenue || 0);
          const totalProfit = Number(s?.totalProfit || 0);
          const todayProfit = Number(s?.todayProfit || 0);
          const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
          setStats([
            { label: 'إجمالي الأرباح', value: `$${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, change: todayProfit, key: 'revenue', icon: 'earnings', color: '#7c5cff', bg: '#f5f3ff' },
            { label: 'الطلبات', value: String(totalOrders), change: Number(s?.ordersToday || 0), key: 'orders', icon: 'orders', color: '#0ea5e9', bg: '#eff6ff' },
            { label: 'الزبائن', value: String(totalCustomers), key: 'customers', icon: 'users', color: '#22c55e', bg: '#f0fdf4' },
            { label: 'المنتجات', value: String(s?.totalProducts || 0), key: 'products', icon: 'products', color: '#f59e0b', bg: '#fffbeb' },
            { label: 'نسبة الأرباح', value: `${profitMargin.toFixed(1)}%`, key: 'profit_margin', icon: 'rate', color: '#ec4899', bg: '#fdf2f8' },
          ]);
        }
        const orders = (o.orders || o || []);
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 8) : []);
        try { const on = await adminApi.getOnlineStats(); setOnlineStats(on); } catch {}
      } catch {}
      setLoading(false);
    };
    load();
  }, [reload]);

  const statIcons: Record<string, React.ReactNode> = {
    products: <Package size={22} />,
    orders: <ShoppingCart size={22} />,
    customers: <Users size={22} />,
    revenue: <DollarSign size={22} />,
    today_orders: <Activity size={22} />,
  };

  const statusColors: Record<string, string> = {
    completed: '#10b981', مكتمل: '#10b981',
    pending: '#f59e0b', معلق: '#f59e0b', 'قيد الانتظار': '#f59e0b',
    processing: '#3b82f6', 'قيد المعالجة': '#3b82f6', 'جاري التنفيذ': '#3b82f6',
    cancelled: '#ef4444', ملغي: '#ef4444',
    failed: '#ef4444', فشل: '#ef4444',
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: 130, borderRadius: 16,
            background: `linear-gradient(90deg, ${cardBg}, ${darkMode ? '#1e2642' : '#f1f5f9'}, ${cardBg})`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>📊</span> {t('لوحة التحكم')}
        </h2>
        {onlineStats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: '#10b98115', color: '#10b981', fontSize: 12, fontWeight: 700,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              {onlineStats.online} {t('متصل الآن')}
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 20,
              background: `${theme.primary}12`, color: theme.primary, fontSize: 12, fontWeight: 700,
            }}>
              <Eye size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              {onlineStats.today_visitors} {t('زائر اليوم')}
            </div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: 16, padding: 20,
            border: `1px solid ${border}`,
            transition: 'all 0.3s',
            cursor: 'default',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = theme.primary;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${theme.primary}15`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = border;
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${theme.primary}12`, color: theme.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {statIcons[stat.key || ''] || <Eye size={22} />}
              </div>
              {stat.change !== undefined && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  fontSize: 12, fontWeight: 700,
                  color: stat.change >= 0 ? '#10b981' : '#ef4444',
                }}>
                  {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: text, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: subtext }}>{t(stat.label)}</div>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div style={{
        background: cardBg, borderRadius: 16,
        border: `1px solid ${border}`, overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>🛒 {t('آخر الطلبات')}</h3>
          <button
            onClick={() => { setLoading(true); adminApi.getOrders().then(o => { setRecentOrders((o.orders || o || []).slice(0, 8)); setLoading(false); }); }}
            style={{
              background: 'none', border: 'none', color: subtext,
              cursor: 'pointer', padding: 4,
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: subtext }}>
            {t('لا توجد طلبات')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t('رقم الطلب'), t('المنتج'), t('العميل'), t('المبلغ'), t('الحالة'), t('التاريخ')].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 16px', textAlign: 'start',
                      fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{
                    borderBottom: `1px solid ${border}`,
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${theme.primary}05`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: theme.primary, whiteSpace: 'nowrap' }}>
                      {order.order_number}
                    </td>
                    <td style={{
                      padding: '12px 16px', color: text,
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {order.product_name}
                    </td>
                    <td style={{ padding: '12px 16px', color: subtext, whiteSpace: 'nowrap' }}>
                      {order.customer_name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: text, whiteSpace: 'nowrap' }}>
                      ${order.total_price}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: `${statusColors[order.status] || '#64748b'}15`,
                        color: statusColors[order.status] || '#64748b',
                      }}>
                        {t(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
