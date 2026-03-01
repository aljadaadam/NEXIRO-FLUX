'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import {
  Package, Clock, CheckCircle2, Truck, AlertCircle, XCircle,
  Search, Eye, ChevronDown, RefreshCw, Copy
} from 'lucide-react';

type OrderItem = Record<string, unknown>;

const STATUS_MAP: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock size={16} />, color: '#f59e0b', label: 'قيد الانتظار' },
  processing: { icon: <RefreshCw size={16} />, color: '#3b82f6', label: 'قيد التنفيذ' },
  completed: { icon: <CheckCircle2 size={16} />, color: '#22c55e', label: 'مكتمل' },
  cancelled: { icon: <XCircle size={16} />, color: '#ef4444', label: 'ملغي' },
  partial: { icon: <AlertCircle size={16} />, color: '#f97316', label: 'جزئي' },
  shipped: { icon: <Truck size={16} />, color: '#22c55e', label: 'تم الشحن' },
};

export default function OrdersPage() {
  const { currentTheme, darkMode, isRTL, t } = useTheme();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    storeApi.getOrders().then(data => {
      setOrders(data as OrderItem[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const getStatus = (status: string) => STATUS_MAP[status] || STATUS_MAP.pending;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 60px' }}>
      <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>
            <span style={{
              background: currentTheme.gradient,
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {t('طلباتي')}
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {orders.length} {t('طلب')}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); storeApi.getOrders().then(data => { setOrders(data as OrderItem[]); setLoading(false); }).catch(() => setLoading(false)); }}
          style={{
            padding: '8px 16px', borderRadius: 12, border: 'none',
            background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <RefreshCw size={14} /> {t('تحديث')}
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
        {['', 'pending', 'processing', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '6px 14px', borderRadius: 10, border: 'none',
              background: filterStatus === s ? currentTheme.gradient : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: filterStatus === s ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {s ? t(getStatus(s).label) : t('الكل')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 20 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontWeight: 600 }}>{t('لا توجد طلبات')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(order => {
            const status = getStatus(String(order.status));
            const expanded = expandedOrder === String(order.id);
            return (
              <div
                key={String(order.id)}
                className="neon-card"
                style={{ padding: 0, overflow: 'hidden', transition: 'all 0.3s ease' }}
              >
                <div
                  style={{
                    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedOrder(expanded ? null : String(order.id))}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${status.color}15`,
                    display: 'grid', placeItems: 'center', color: status.color, flexShrink: 0,
                  }}>
                    {status.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(order.product_name || order.productName || t('طلب'))} #{String(order.id).slice(-6)}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {order.created_at ? new Date(String(order.created_at)).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : ''}
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: `${status.color}15`, color: status.color,
                    fontWeight: 700, fontSize: '0.7rem', flexShrink: 0,
                  }}>
                    {t(status.label)}
                  </span>
                  <ChevronDown size={16} style={{
                    color: 'var(--text-muted)',
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </div>

                {expanded && (
                  <div style={{
                    padding: '0 18px 16px',
                    borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: 10, marginTop: 14,
                    }}>
                      <InfoItem label={t('رقم الطلب')} value={`#${String(order.id).slice(-8)}`} theme={currentTheme} darkMode={darkMode} />
                      <InfoItem label={t('الكمية')} value={String(order.quantity || 1)} theme={currentTheme} darkMode={darkMode} />
                      <InfoItem label={t('المجموع')} value={String(order.total || order.price || '-')} theme={currentTheme} darkMode={darkMode} />
                      <InfoItem label={t('الحالة')} value={t(status.label)} theme={currentTheme} darkMode={darkMode} color={status.color} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, theme, darkMode, color }: { label: string; value: string; theme: { primary: string }; darkMode: boolean; color?: string }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 12,
      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
