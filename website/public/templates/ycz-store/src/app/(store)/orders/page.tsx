'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { MOCK_ORDERS } from '@/lib/mockData';
import { storeApi } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { currentTheme } = useTheme();
  const [filter, setFilter] = useState('الكل');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await storeApi.getOrders();
        if (Array.isArray(res)) setOrders(res);
        else if (res?.orders && Array.isArray(res.orders)) setOrders(res.orders);
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filters = ['الكل', 'مكتمل', 'قيد التنفيذ', 'ملغي'];
  const filtered = filter === 'الكل' ? orders : orders.filter(o => o.status === filter);

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', marginBottom: 20 }}>
        📦 طلباتي
      </h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.45rem 1rem', borderRadius: 10,
            background: filter === f ? currentTheme.primary : '#fff',
            color: filter === f ? '#fff' : '#64748b',
            border: filter === f ? 'none' : '1px solid #e2e8f0',
            fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(order => (
          <div key={order.id} style={{
            background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
            border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
            gap: 14, cursor: 'pointer',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${currentTheme.primary}12`,
              display: 'grid', placeItems: 'center', fontSize: '1.25rem',
              flexShrink: 0,
            }}>
              {order.icon || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020' }}>{order.product}</h4>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem',
                  fontWeight: 700, background: `${order.statusColor}18`, color: order.statusColor,
                }}>
                  {order.status}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {order.id} • {order.date}
              </p>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1020', flexShrink: 0 }}>
              {order.price}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Package size={48} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 700 }}>لا توجد طلبات</p>
        </div>
      )}
    </section>
  );
}
