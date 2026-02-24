'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { adminApi } from '@/lib/api';
import { DashboardStats, Order } from '@/lib/types';
import {
  Car, ShoppingCart, Users, TrendingUp, DollarSign,
  Star, Clock, CheckCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export default function OverviewPage() {
  const { currentTheme, darkMode, t, dateLocale } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getOrders('limit=5'),
    ]).then(([s, o]) => {
      setStats(s);
      setRecentOrders(o.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat('ar-SA').format(p) + ' ر.س';

  const statCards = stats ? [
    { icon: Car, label: t('إجمالي السيارات'), value: stats.total_cars, color: '#3b82f6', bg: '#3b82f615' },
    { icon: Star, label: t('سيارات جديدة'), value: stats.new_cars, color: '#10b981', bg: '#10b98115' },
    { icon: Clock, label: t('سيارات مستعملة'), value: stats.used_cars, color: '#f59e0b', bg: '#f59e0b15' },
    { icon: ShoppingCart, label: t('إجمالي الطلبات'), value: stats.total_orders, color: '#8b5cf6', bg: '#8b5cf615' },
    { icon: CheckCircle, label: t('طلبات معلقة'), value: stats.pending_orders, color: '#ef4444', bg: '#ef444415' },
    { icon: Users, label: t('إجمالي العملاء'), value: stats.total_customers, color: '#06b6d4', bg: '#06b6d415' },
    { icon: DollarSign, label: t('الإيرادات'), value: formatPrice(stats.total_revenue), color: '#10b981', bg: '#10b98115' },
    { icon: TrendingUp, label: t('سيارات مميزة'), value: stats.featured_cars, color: '#f59e0b', bg: '#f59e0b15' },
  ] : [];

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
    confirmed: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    completed: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  };

  const statusLabels: Record<string, string> = {
    pending: t('معلق'), confirmed: t('مؤكد'), completed: t('مكتمل'), cancelled: t('ملغي'),
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20 }} />)}
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map((card, i) => (
          <div key={i} className={`dash-stat-card anim-delay-${i + 1}`} style={{
            background: cardBg,
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={22} color={card.color} />
              </div>
              <ArrowUpRight size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: textColor, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: mutedColor, fontWeight: 600 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{
        background: cardBg, borderRadius: 20, padding: 24,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }} className="anim-fade-up">
        <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor, marginBottom: 20 }}>{t('أحدث الطلبات')}</h3>
        {recentOrders.length === 0 ? (
          <p style={{ color: mutedColor, textAlign: 'center', padding: 40 }}>{t('لا توجد طلبات')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ color: mutedColor }}>#</th>
                  <th style={{ color: mutedColor }}>{t('العميل')}</th>
                  <th style={{ color: mutedColor }}>{t('السيارة')}</th>
                  <th style={{ color: mutedColor }}>{t('الحالة')}</th>
                  <th style={{ color: mutedColor }}>{t('المبلغ')}</th>
                  <th style={{ color: mutedColor }}>{t('التاريخ')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <td style={{ color: textColor, fontWeight: 700 }}>{order.id}</td>
                    <td style={{ color: textColor }}>{order.customer_name}</td>
                    <td style={{ color: mutedColor }}>{order.car_name || `#${order.car_id}`}</td>
                    <td>
                      <span style={{
                        padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        ...statusColors[order.status] || statusColors.pending,
                      }}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ color: accent, fontWeight: 700 }}>{order.total_price ? formatPrice(order.total_price) : '—'}</td>
                    <td style={{ color: mutedColor, fontSize: 13 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString(dateLocale) : '—'}</td>
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
