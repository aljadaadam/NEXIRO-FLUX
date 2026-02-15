'use client';

import { TrendingUp, TrendingDown, Eye, Package, Clock } from 'lucide-react';
import { MOCK_STATS, MOCK_ORDERS, MOCK_CHART_DATA } from '@/lib/mockData';
import type { ColorTheme } from '@/lib/themes';

export default function OverviewPage({ theme }: { theme: ColorTheme }) {
  const maxValue = Math.max(...MOCK_CHART_DATA.map(d => d.value));

  return (
    <>
      {/* Stats Cards */}
      <div className="dash-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20,
      }}>
        {MOCK_STATS.map((stat, i) => (
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
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
            {MOCK_CHART_DATA.map((d, i) => (
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
            {MOCK_ORDERS.slice(0, 5).map(order => (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.6rem 0.75rem', borderRadius: 10,
                background: '#f8fafc',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{order.icon || '📦'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.78rem', fontWeight: 600, color: '#0b1020',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {order.product}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{order.id}</p>
                </div>
                <div style={{ textAlign: 'left', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0b1020' }}>{order.price}</p>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    color: order.statusColor,
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
