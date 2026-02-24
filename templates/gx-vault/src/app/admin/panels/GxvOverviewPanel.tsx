'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign,
  Package, Gamepad2, Activity, ArrowUpRight, BarChart3, Zap,
} from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvOverviewPanel() {
  const { currentTheme } = useGxvTheme();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gxvAdminApi.getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: currentTheme.primary,
          borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const statCards = [
    {
      label: 'إجمالي الطلبات',
      value: String(stats?.totalOrders ?? stats?.total_orders ?? 0),
      icon: ShoppingBag, color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      label: 'إجمالي الإيرادات',
      value: `$${Number(stats?.totalRevenue ?? stats?.total_revenue ?? 0).toFixed(2)}`,
      icon: DollarSign, color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
    },
    {
      label: 'المستخدمين',
      value: String(stats?.totalUsers ?? stats?.total_users ?? 0),
      icon: Users, color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'المنتجات النشطة',
      value: String(stats?.totalProducts ?? stats?.total_products ?? 0),
      icon: Package, color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'الأرباح',
      value: `$${Number(stats?.totalProfit ?? stats?.total_profit ?? 0).toFixed(2)}`,
      icon: TrendingUp, color: '#06b6d4',
      bg: 'rgba(6,182,212,0.08)',
    },
    {
      label: 'طلبات اليوم',
      value: String(stats?.todayOrders ?? stats?.today_orders ?? 0),
      icon: Zap, color: '#ec4899',
      bg: 'rgba(236,72,153,0.08)',
    },
  ];

  const recentOrders = Array.isArray(stats?.recentOrders)
    ? (stats.recentOrders as Record<string, unknown>[])
    : Array.isArray(stats?.recent_orders) ? (stats.recent_orders as Record<string, unknown>[]) : [];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="gxv-card-hover" style={{
              padding: '20px 18px', borderRadius: 16,
              background: 'rgba(15,15,35,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: `gxvSlideUp ${0.2 + i * 0.05}s ease-out both`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Subtle glow */}
              <div style={{
                position: 'absolute', top: -20, left: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle, ${card.color}10 0%, transparent 70%)`,
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div>
                  <span style={{ color: '#666688', fontSize: '0.78rem', fontWeight: 500 }}>{card.label}</span>
                  <p style={{
                    fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                    margin: '6px 0 0',
                  }}>
                    {card.value}
                  </p>
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: card.bg, display: 'grid', placeItems: 'center',
                  color: card.color,
                }}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div style={{
        borderRadius: 16, background: 'rgba(15,15,35,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
            📦 آخر الطلبات
          </h3>
          <Activity size={16} style={{ color: '#555577' }} />
        </div>

        {recentOrders.length > 0 ? (
          <div>
            {recentOrders.slice(0, 8).map((order, i) => (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e8ff' }}>
                    {String(order.product_name || order.product || `#${String(order.id).slice(0, 8)}`)}
                  </span>
                  <div style={{ display: 'flex', gap: 12, marginTop: 3, color: '#555577', fontSize: '0.75rem' }}>
                    <span>{String(order.customer_name || order.customer || '')}</span>
                    <span>{order.created_at ? new Date(String(order.created_at)).toLocaleDateString('ar') : ''}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                    {order.total_price ? `$${Number(order.total_price).toFixed(2)}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#555577', fontSize: '0.85rem' }}>
            لا توجد طلبات حديثة
          </div>
        )}
      </div>
    </div>
  );
}
