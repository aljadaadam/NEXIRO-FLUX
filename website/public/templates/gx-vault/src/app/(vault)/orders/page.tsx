'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvStoreApi } from '@/engine/gxvApi';

const GXV_STATUS_MAP: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  completed: { color: '#22c55e', icon: CheckCircle, label: 'مكتمل' },
  pending: { color: '#f59e0b', icon: Clock, label: 'قيد الانتظار' },
  processing: { color: '#3b82f6', icon: RefreshCw, label: 'قيد المعالجة' },
  cancelled: { color: '#ef4444', icon: XCircle, label: 'ملغي' },
  failed: { color: '#ef4444', icon: AlertCircle, label: 'فشل' },
};

export default function GxvOrdersPage() {
  const { currentTheme } = useGxvTheme();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gxvStoreApi.getOrders().then(data => {
      const list = Array.isArray(data) ? data : data?.orders || [];
      setOrders(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 24px 80px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
        📦 طلباتي
      </h1>
      <p style={{ color: '#666688', fontSize: '0.9rem', marginBottom: 30 }}>تتبع جميع طلبات الشحن الخاصة بك</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 36, height: 36, margin: '0 auto 16px',
            border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary,
            borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite',
          }} />
          <p style={{ color: '#666688' }}>جاري التحميل...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666688' }}>
          <Package size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>لا توجد طلبات بعد</p>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 16, padding: '10px 24px', borderRadius: 12,
            background: currentTheme.gradient, color: '#fff',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          }}>
            ابدأ الشحن
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((order, i) => {
            const status = String(order.status || 'pending').toLowerCase();
            const statusInfo = GXV_STATUS_MAP[status] || GXV_STATUS_MAP.pending;
            const StatusIcon = statusInfo.icon;
            return (
              <div key={String(order.id || i)} style={{
                padding: '18px 20px', borderRadius: 16,
                background: 'rgba(15,15,35,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 16, flexWrap: 'wrap',
                animation: `gxvSlideUp ${0.2 + i * 0.05}s ease-out both`,
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{String(order.icon || '🎮')}</span>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                      {String(order.product || order.product_name || `طلب #${order.id}`)}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: 16, color: '#555577', fontSize: '0.78rem' }}>
                    <span>#{String(order.id).slice(0, 8)}</span>
                    <span>{order.date || order.created_at ? new Date(String(order.date || order.created_at)).toLocaleDateString('ar') : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                    {order.price ? String(order.price) : order.total_price ? `$${Number(order.total_price).toFixed(2)}` : ''}
                  </span>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 8,
                    background: `${statusInfo.color}15`,
                    color: statusInfo.color,
                    fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    <StatusIcon size={13} />
                    {statusInfo.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
