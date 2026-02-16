'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Clock, XCircle, RefreshCw, Eye, Search } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

const GXV_ORDER_STATUS: Record<string, { color: string; label: string }> = {
  completed: { color: '#22c55e', label: 'مكتمل' },
  pending: { color: '#f59e0b', label: 'قيد الانتظار' },
  processing: { color: '#3b82f6', label: 'قيد المعالجة' },
  cancelled: { color: '#ef4444', label: 'ملغي' },
  failed: { color: '#ef4444', label: 'فشل' },
};

export default function GxvOrdersPanel() {
  const { currentTheme } = useGxvTheme();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    gxvAdminApi.getOrders().then(data => {
      setOrders(Array.isArray(data) ? data : data?.orders || []);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search || String(o.product_name || o.customer_name || o.id).toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || String(o.status).toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    await gxvAdminApi.updateOrder(id, { status });
    setOrders(prev => prev.map(o => String(o.id) === id ? { ...o, status } : o));
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
          <input type="text" placeholder="بحث في الطلبات..." value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', maxWidth: 300, padding: '10px 36px 10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
            }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 8,
              background: filter === f ? currentTheme.surface : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === f ? `${currentTheme.primary}30` : 'rgba(255,255,255,0.06)'}`,
              color: filter === f ? currentTheme.primary : '#777', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 600,
            }}>
              {f === 'all' ? 'الكل' : GXV_ORDER_STATUS[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((order, i) => {
            const status = String(order.status || 'pending').toLowerCase();
            const statusInfo = GXV_ORDER_STATUS[status] || GXV_ORDER_STATUS.pending;
            return (
              <div key={String(order.id)} style={{
                padding: '14px 18px', borderRadius: 14,
                background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 12, flexWrap: 'wrap',
                animation: `gxvSlideUp ${0.1 + i * 0.03}s ease-out both`,
              }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e8e8ff', margin: '0 0 4px' }}>
                    {String(order.product_name || `طلب #${String(order.id).slice(0, 8)}`)}
                  </h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.73rem', color: '#555577' }}>
                    <span>{String(order.customer_name || order.customer_email || '')}</span>
                    <span>{order.created_at ? new Date(String(order.created_at)).toLocaleDateString('ar') : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                    ${Number(order.total_price || 0).toFixed(2)}
                  </span>
                  <select
                    value={status}
                    onChange={e => handleStatusUpdate(String(order.id), e.target.value)}
                    style={{
                      padding: '5px 10px', borderRadius: 8,
                      background: `${statusInfo.color}12`, border: `1px solid ${statusInfo.color}25`,
                      color: statusInfo.color, fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                    }}
                  >
                    {Object.entries(GXV_ORDER_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555577' }}>لا توجد طلبات</div>
          )}
        </div>
      )}
    </div>
  );
}
