'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { currentTheme, t, dateLocale } = useTheme();
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // تحويل حالات الباك اند إلى عربي مع ألوان
  const statusMap: Record<string, { label: string; color: string }> = {
    pending:    { label: t('قيد الانتظار'), color: '#f59e0b' },
    processing: { label: t('قيد المعالجة'), color: '#3b82f6' },
    completed:  { label: t('مكتمل'), color: '#22c55e' },
    failed:     { label: t('مرفوض'), color: '#ef4444' },
    cancelled:  { label: t('ملغي'), color: '#94a3b8' },
    refunded:   { label: t('مسترجع'), color: '#8b5cf6' },
  };

  function mapOrder(raw: Record<string, unknown>): Order {
    const st = String(raw.status || 'pending');
    return {
      id: Number(raw.id || 0),
      order_number: String(raw.order_number || raw.id || ''),
      product_name: String(raw.product_name || ''),
      quantity: Number(raw.quantity || 1),
      unit_price: Number(raw.unit_price || 0),
      total_price: Number(raw.total_price || 0),
      status: st,
      payment_method: String(raw.payment_method || ''),
      payment_status: String(raw.payment_status || ''),
      created_at: raw.created_at ? String(raw.created_at) : undefined,
      server_response: raw.server_response ? parseServerResponse(String(raw.server_response)) : undefined,
    };
  }

  /** استخراج المحتوى الفعلي من الرد — يدعم JSON القديم والنص العادي الجديد */
  function parseServerResponse(raw: string): string {
    try {
      const obj = JSON.parse(raw);
      // JSON قديم من الكرون: { comments, message, dhruStatusLabel, ... }
      return obj.comments || obj.message || obj.translated || obj.error || obj.dhruStatusLabel || raw;
    } catch {
      return raw; // نص عادي
    }
  }

  const getStatusInfo = (status: string) => {
    return statusMap[status] || statusMap['pending'];
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await storeApi.getOrders();
        const rawOrders = Array.isArray(res) ? res : (res?.orders && Array.isArray(res.orders) ? res.orders : []);
        setOrders(rawOrders.map((o: Record<string, unknown>) => mapOrder(o)));
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filters = ['all', 'completed', 'pending', 'failed'];
  const filterLabels: Record<string, string> = { all: t('الكل'), completed: t('مكتملة'), pending: t('معلقة'), failed: t('مرفوضة') };
  const filtered = filter === 'all' ? orders : orders.filter(o => {
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'pending') return o.status === 'pending' || o.status === 'processing';
    if (filter === 'failed') return o.status === 'failed';
    if (filter === 'cancelled') return o.status === 'cancelled' || o.status === 'refunded';
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>{t('📋 سجل الطلبات')}</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === f ? currentTheme.primary : '#f1f5f9',
            color: filter === f ? '#fff' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
          }}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(order => {
          const si = getStatusInfo(order.status);
          return (
          <div key={order.id} style={{ background: '#fff', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{order.order_number}</span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: `${si.color}18`, color: si.color }}>{si.label}</span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_name}</p>
            {order.server_response && order.status === 'completed' && (
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 8 }}>
                <p style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginBottom: 2 }}>{t('نتيجة الخدمة:')}</p>
                <p style={{ fontSize: '0.78rem', color: '#166534', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{order.server_response}</p>
              </div>
            )}
            {order.server_response && order.status === 'failed' && (
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 8 }}>
                <p style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600, marginBottom: 2 }}>{t('سبب الرفض:')}</p>
                <p style={{ fontSize: '0.78rem', color: '#991b1b', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{order.server_response}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
              <span>{order.created_at ? new Date(order.created_at).toLocaleDateString(dateLocale) : '--'}</span>
              <span style={{ fontWeight: 700, color: '#0b1020' }}>${order.total_price.toFixed(2)}</span>
            </div>
          </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Package size={48} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 700 }}>{t('لا توجد طلبات')}</p>
        </div>
      )}
    </div>
  );
}
