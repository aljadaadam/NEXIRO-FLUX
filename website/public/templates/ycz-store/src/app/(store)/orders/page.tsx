'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { currentTheme } = useTheme();
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // تحويل حالات الباك اند إلى عربي مع ألوان
  const statusMap: Record<string, { label: string; color: string }> = {
    pending:    { label: 'قيد الانتظار', color: '#f59e0b' },
    processing: { label: 'قيد المعالجة', color: '#3b82f6' },
    completed:  { label: 'مكتمل', color: '#22c55e' },
    failed:     { label: 'مرفوض', color: '#ef4444' },
    cancelled:  { label: 'ملغي', color: '#94a3b8' },
    refunded:   { label: 'مسترجع', color: '#8b5cf6' },
  };

  function mapOrder(raw: Record<string, unknown>): Order {
    const st = String(raw.status || 'pending');
    const mapped = statusMap[st] || statusMap['pending'];
    return {
      id: String(raw.order_number || raw.id || ''),
      product: String(raw.product_name || ''),
      status: mapped.label,
      statusColor: mapped.color,
      date: raw.created_at ? new Date(String(raw.created_at)).toLocaleDateString('ar-EG') : '--',
      price: `$${Number(raw.total_price || 0).toFixed(2)}`,
      icon: '📦',
    };
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await storeApi.getOrders();
        const rawOrders = Array.isArray(res) ? res : (res?.orders && Array.isArray(res.orders) ? res.orders : []);
        setOrders(rawOrders.map((o: Record<string, unknown>) => mapOrder(o)));
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = ['all', 'completed', 'pending', 'failed', 'cancelled'];
  const filterLabels: Record<string, string> = { all: 'الكل', completed: 'مكتملة', pending: 'معلقة', failed: 'مرفوضة', cancelled: 'ملغية' };
  const filtered = filter === 'all' ? orders : orders.filter(o => {
    if (filter === 'completed') return o.status === 'مكتمل';
    if (filter === 'pending') return o.status === 'قيد الانتظار' || o.status === 'قيد المعالجة';
    if (filter === 'failed') return o.status === 'مرفوض';
    if (filter === 'cancelled') return o.status === 'ملغي' || o.status === 'مسترجع';
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>📋 سجل الطلبات</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === f ? currentTheme.primary : '#f1f5f9',
            color: filter === f ? '#fff' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
          }}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(order => (
          <div key={order.id} style={{ background: '#fff', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{order.id}</span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: `${order.statusColor}18`, color: order.statusColor }}>{order.status}</span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>{order.product}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
              <span>{order.date}</span>
              <span style={{ fontWeight: 700, color: '#0b1020' }}>{order.price}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Package size={48} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 700 }}>لا توجد طلبات</p>
        </div>
      )}
    </div>
  );
}
