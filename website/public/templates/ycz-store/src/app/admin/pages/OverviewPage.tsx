'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Package, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { StatsCard, Order } from '@/lib/types';

const EMPTY_STATS: StatsCard[] = [
  { label: 'إجمالي الأرباح', value: '$0', change: '0%', positive: true, icon: '💰', color: '#7c5cff', bg: '#f5f3ff' },
  { label: 'الطلبات', value: '0', change: '0%', positive: true, icon: '📦', color: '#0ea5e9', bg: '#eff6ff' },
  { label: 'المستخدمين', value: '0', change: '0%', positive: true, icon: '👥', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'معدل الإكمال', value: '0%', change: '0%', positive: true, icon: '📊', color: '#f59e0b', bg: '#fffbeb' },
];

const EMPTY_CHART: { month: string; value: number }[] = [];

export default function OverviewPage({ theme }: { theme: ColorTheme }) {
  const [stats, setStats] = useState<StatsCard[]>(EMPTY_STATS);
  const [chartData, setChartData] = useState(EMPTY_CHART);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
              icon: '💰',
              color: '#7c5cff',
              bg: '#f5f3ff',
            },
            {
              label: 'الطلبات',
              value: String(totalOrders),
              change: `${Number(res?.ordersToday || 0) || 0} اليوم`,
              positive: true,
              icon: '📦',
              color: '#0ea5e9',
              bg: '#eff6ff',
            },
            {
              label: 'الزبائن',
              value: String(totalCustomers),
              change: 'إجمالي',
              positive: true,
              icon: '👥',
              color: '#22c55e',
              bg: '#f0fdf4',
            },
            {
              label: 'معدل الإكمال',
              value: `${completionRate.toFixed(1)}%`,
              change: `${completedOrders}/${totalOrders}`,
              positive: completionRate >= 50,
              icon: '📊',
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
        if (Array.isArray(ordersRes)) setOrders(ordersRes.slice(0, 5));
        else if (ordersRes?.orders && Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders.slice(0, 5));
      } catch { /* keep fallback */ }
      setLoading(false);
    }
    load();
  }, []);

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <>
      {/* Banner Card */}
      <div className="dash-banner-card" style={{
        marginBottom: 16,
        borderRadius: 16,
        padding: '1rem 1.25rem',
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 10px 24px rgba(124,92,255,0.18)',
      }}>
        <div>
          <p style={{ fontSize: '0.78rem', opacity: 0.9, marginBottom: 4 }}>لوحة التحكم</p>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.5 }}>إدارة المتجر ومتابعة الأداء من مكان واحد</h3>
        </div>
        <div style={{
          padding: '0.35rem 0.75rem',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.35)',
          fontSize: '0.75rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          المتجر نشط ✅
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20,
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: '1.25rem',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: stat.bg, display: 'grid', placeItems: 'center',
                fontSize: '1.2rem',
              }}>
                {stat.icon}
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: '0.7rem', fontWeight: 700,
                color: stat.positive ? '#22c55e' : '#ef4444',
              }}>
                {stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0b1020', marginBottom: 2 }}>{stat.value}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent Orders */}
      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        {/* Chart */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 20 }}>
            📊 المبيعات الشهرية
          </h3>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8, height: 180,
            padding: '0 0.5rem',
          }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600 }}>
                  ${(d.value / 1000).toFixed(1)}k
                </span>
                <div style={{
                  width: '100%', borderRadius: 6,
                  height: `${(d.value / maxValue) * 140}px`,
                  background: `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`,
                  opacity: 0.85, transition: 'height 0.5s',
                  minHeight: 8,
                }} />
                <span style={{ fontSize: '0.5rem', color: '#94a3b8' }}>
                  {d.month.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.25rem',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>🕐 آخر الطلبات</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orders.slice(0, 5).map(order => {
              const statusMap: Record<string, { label: string; color: string }> = {
                pending: { label: 'معلق', color: '#f59e0b' },
                processing: { label: 'جارٍ', color: '#3b82f6' },
                completed: { label: 'مكتمل', color: '#22c55e' },
                failed: { label: 'مرفوض', color: '#ef4444' },
                cancelled: { label: 'ملغي', color: '#94a3b8' },
                refunded: { label: 'مسترجع', color: '#8b5cf6' },
              };
              const si = statusMap[String(order.status)] || statusMap['pending'];
              return (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.6rem 0.75rem', borderRadius: 10,
                background: '#f8fafc',
              }}>
                <span style={{ fontSize: '1.1rem' }}>📦</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.78rem', fontWeight: 600, color: '#0b1020',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {order.product_name}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{order.order_number}</p>
                </div>
                <div style={{ textAlign: 'left', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0b1020' }}>${Number(order.total_price).toFixed(2)}</p>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    color: si.color,
                  }}>
                    {si.label}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
