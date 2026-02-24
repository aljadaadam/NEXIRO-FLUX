'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxStatsCard, HxOrder } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Eye } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; reload?: number; }

export default function HxOverviewPage({ theme, darkMode, t, reload }: Props) {
  const [stats, setStats] = useState<HxStatsCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<HxOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => {
    const load = async () => {
      try {
        const [s, o] = await Promise.all([
          hxAdminApi.getStats(),
          hxAdminApi.getOrders(),
        ]);
        setStats(s.stats || []);
        setRecentOrders((o.orders || []).slice(0, 5));
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
  };

  const statusColors: Record<string, string> = {
    processing: '#f59e0b',
    shipped: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>📊 {t('لوحة التحكم')}</h2>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${theme.primary}12`, color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {statIcons[stat.key || ''] || <Eye size={22} />}
              </div>
              {stat.change !== undefined && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 700, color: stat.change >= 0 ? '#10b981' : '#ef4444' }}>
                  {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: text, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: subtext }}>{t(stat.label)}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>🛒 {t('آخر الطلبات')}</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('لا توجد طلبات')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t('رقم الطلب'), t('المنتج'), t('العميل'), t('المبلغ'), t('الحالة')].map((h, i) => (
                    <th key={i} style={{ padding: '10px 16px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: theme.primary, whiteSpace: 'nowrap' }}>{order.order_number}</td>
                    <td style={{ padding: '12px 16px', color: text, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_name}</td>
                    <td style={{ padding: '12px 16px', color: subtext, whiteSpace: 'nowrap' }}>{order.customer_name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: text, whiteSpace: 'nowrap' }}>${order.total_price}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: `${statusColors[order.status] || '#64748b'}15`,
                        color: statusColors[order.status] || '#64748b',
                      }}>
                        {order.status}
                      </span>
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
