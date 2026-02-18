'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { adminApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { Search, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

export default function OrdersAdminPage() {
  const { currentTheme, darkMode, t, dateLocale } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  const fetchOrders = () => {
    setLoading(true);
    adminApi.getOrders().then((d: { orders?: Order[] }) => {
      setOrders(d.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateOrder(id, { status });
      fetchOrders();
    } catch { /* ignore */ }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('ar-SA').format(p) + ' ر.س';

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fbbf2415', text: '#fbbf24' },
    confirmed: { bg: '#3b82f615', text: '#3b82f6' },
    completed: { bg: '#10b98115', text: '#10b981' },
    cancelled: { bg: '#ef444415', text: '#ef4444' },
  };

  const statusLabels: Record<string, string> = {
    pending: t('معلق'), confirmed: t('مؤكد'), completed: t('مكتمل'), cancelled: t('ملغي'),
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }} className="anim-fade-up">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} className={`car-filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? accent : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: filter === f ? '#fff' : textColor,
              borderColor: filter === f ? accent : 'transparent',
            }}>
            {f === 'all' ? t('الكل') : statusLabels[f] || f}
            {f !== 'all' && <span style={{ marginInlineStart: 6, opacity: 0.7 }}>({orders.filter(o => o.status === f).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ background: cardBg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} className="anim-fade-up anim-delay-2">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: mutedColor }}>{t('جاري التحميل...')}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: mutedColor }}>
            <Package size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>{t('لا توجد طلبات')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ color: mutedColor }}>#</th>
                  <th style={{ color: mutedColor }}>{t('العميل')}</th>
                  <th style={{ color: mutedColor }}>{t('الهاتف')}</th>
                  <th style={{ color: mutedColor }}>{t('السيارة')}</th>
                  <th style={{ color: mutedColor }}>{t('المبلغ')}</th>
                  <th style={{ color: mutedColor }}>{t('الحالة')}</th>
                  <th style={{ color: mutedColor }}>{t('التاريخ')}</th>
                  <th style={{ color: mutedColor }}>{t('إجراءات')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <td style={{ color: textColor, fontWeight: 700 }}>{order.id}</td>
                    <td style={{ color: textColor }}>{order.customer_name}</td>
                    <td style={{ color: mutedColor }} dir="ltr">{order.customer_phone}</td>
                    <td style={{ color: mutedColor }}>{order.car_name || `#${order.car_id}`}</td>
                    <td style={{ color: accent, fontWeight: 700 }}>{order.total_price ? formatPrice(order.total_price) : '—'}</td>
                    <td>
                      <span style={{
                        padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: statusColors[order.status]?.bg || '#66666615',
                        color: statusColors[order.status]?.text || '#666',
                      }}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ color: mutedColor, fontSize: 13 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString(dateLocale) : '—'}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{
                          padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                          background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          color: textColor, border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        }}>
                        <option value="pending">{t('معلق')}</option>
                        <option value="confirmed">{t('مؤكد')}</option>
                        <option value="completed">{t('مكتمل')}</option>
                        <option value="cancelled">{t('ملغي')}</option>
                      </select>
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
