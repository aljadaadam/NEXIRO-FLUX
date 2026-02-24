'use client';

import { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, XCircle, RotateCw, Undo2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { Order } from '@/lib/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'معلق', color: '#f59e0b' },
  processing: { label: 'جارٍ التنفيذ', color: '#3b82f6' },
  completed:  { label: 'مكتمل', color: '#22c55e' },
  failed:     { label: 'مرفوض', color: '#ef4444' },
  cancelled:  { label: 'ملغي', color: '#94a3b8' },
  refunded:   { label: 'مسترجع', color: '#8b5cf6' },
};

export default function OrdersAdminPage({ theme }: { theme: ColorTheme }) {
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [completeModal, setCompleteModal] = useState<Order | null>(null);
  const [rejectModal, setRejectModal] = useState<Order | null>(null);
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await adminApi.getOrders();
      if (Array.isArray(res)) setOrders(res);
      else if (res?.orders && Array.isArray(res.orders)) setOrders(res.orders);
    } catch { /* keep fallback */ }
    finally { setLoading(false); }
  }

  async function handleStatusChange(id: number, status: string, server_response?: string) {
    setActionLoading(true);
    try {
      await adminApi.updateOrderStatus(id, { status, ...(server_response ? { server_response } : {}) });
      await loadOrders();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  }

  async function handleComplete() {
    if (!completeModal) return;
    await handleStatusChange(completeModal.id, 'completed', responseText || undefined);
    setCompleteModal(null);
    setResponseText('');
  }

  async function handleReject() {
    if (!rejectModal) return;
    await handleStatusChange(rejectModal.id, 'failed', responseText || 'مرفوض من الإدارة');
    setRejectModal(null);
    setResponseText('');
  }

  async function handleRefund(order: Order) {
    if (!confirm(`هل أنت متأكد من استرجاع $${Number(order.total_price).toFixed(2)} للعميل ${order.customer_name || ''}؟`)) return;
    await handleStatusChange(order.id, 'refunded');
  }

  async function handleProcessing(order: Order) {
    await handleStatusChange(order.id, 'processing');
  }

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'معلق' },
    { key: 'processing', label: 'جارٍ' },
    { key: 'completed', label: 'مكتمل' },
    { key: 'failed', label: 'مرفوض' },
    { key: 'refunded', label: 'مسترجع' },
  ];
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getStatus = (s: string) => STATUS_MAP[s] || STATUS_MAP['pending'];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🛒 الطلبات</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.45rem 0.85rem', borderRadius: 8,
              background: filter === f.key ? theme.primary : '#fff',
              color: filter === f.key ? '#fff' : '#64748b',
              border: filter === f.key ? 'none' : '1px solid #e2e8f0',
              fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'إجمالي', value: orders.length, bg: '#f8fafc', color: '#0b1020' },
          { label: 'معلق', value: orders.filter(o => o.status === 'pending').length, bg: '#fffbeb', color: '#f59e0b' },
          { label: 'جارٍ', value: orders.filter(o => o.status === 'processing').length, bg: '#eff6ff', color: '#3b82f6' },
          { label: 'مكتمل', value: orders.filter(o => o.status === 'completed').length, bg: '#f0fdf4', color: '#22c55e' },
          { label: 'مرفوض', value: orders.filter(o => o.status === 'failed').length, bg: '#fef2f2', color: '#ef4444' },
          { label: 'مسترجع', value: orders.filter(o => o.status === 'refunded').length, bg: '#f5f3ff', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '0.7rem 0.85rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, background: s.bg, display: 'inline-block', padding: '0.1rem 0.5rem', borderRadius: 8 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['رقم الطلب', 'المنتج', 'العميل', 'المبلغ', 'الحالة', 'التاريخ', 'إجراءات'].map(h => (
                  <th key={h} style={{
                    padding: '0.85rem 1rem', textAlign: 'right',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>لا توجد طلبات</td></tr>
              ) : filtered.map(order => {
                const si = getStatus(order.status);
                return (
                <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: theme.primary }}>{order.order_number}</td>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span>📦</span>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_name}</span>
                        {order.quantity > 1 && <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginRight: 4 }}> ×{order.quantity}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{order.customer_name || '—'}</p>
                    <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{order.customer_email || ''}</p>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>${Number(order.total_price).toFixed(2)}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                      fontSize: '0.72rem', fontWeight: 700,
                      background: `${si.color}18`, color: si.color,
                    }}>{si.label}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : '--'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {/* إكمال الطلب */}
                      {order.status !== 'completed' && order.status !== 'refunded' && (
                        <button onClick={() => { setCompleteModal(order); setResponseText(order.server_response || ''); }} title="إكمال الطلب" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#dcfce7', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <CheckCircle size={13} color="#16a34a" />
                        </button>
                      )}
                      {/* تحويل لجارٍ */}
                      {(order.status === 'pending' || order.status === 'failed') && (
                        <button onClick={() => handleProcessing(order)} title="تحويل لجارٍ التنفيذ" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#dbeafe', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <RotateCw size={13} color="#2563eb" />
                        </button>
                      )}
                      {/* رفض */}
                      {order.status !== 'failed' && order.status !== 'completed' && order.status !== 'refunded' && (
                        <button onClick={() => { setRejectModal(order); setResponseText(''); }} title="رفض الطلب" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <XCircle size={13} color="#dc2626" />
                        </button>
                      )}
                      {/* استرجاع */}
                      {(order.status !== 'refunded' && order.status !== 'cancelled' && order.payment_status === 'paid') && (
                        <button onClick={() => handleRefund(order)} title="استرجاع الرصيد" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#ede9fe', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Undo2 size={13} color="#7c3aed" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Modal */}
      {completeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => setCompleteModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '92%', maxWidth: 500, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1020' }}>✅ إكمال الطلب #{completeModal.order_number}</h3>
              <button onClick={() => setCompleteModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={14} color="#64748b" />
              </button>
            </div>
            <div style={{ marginBottom: 14, padding: '0.75rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>المنتج: <strong style={{ color: '#0b1020' }}>{completeModal.product_name}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>العميل: <strong style={{ color: '#0b1020' }}>{completeModal.customer_name || '—'}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>المبلغ: <strong style={{ color: '#0b1020' }}>${Number(completeModal.total_price).toFixed(2)}</strong></p>
            </div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>رسالة الإكمال / نتيجة الخدمة</label>
            <textarea
              rows={4}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="أدخل رد الخدمة أو رسالة الإكمال للعميل..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.84rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleComplete} disabled={actionLoading} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#16a34a', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? 'جاري...' : 'إكمال الطلب'}
              </button>
              <button onClick={() => setCompleteModal(null)} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => setRejectModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '92%', maxWidth: 500, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>❌ رفض الطلب #{rejectModal.order_number}</h3>
              <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={14} color="#64748b" />
              </button>
            </div>
            <div style={{ marginBottom: 14, padding: '0.75rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>المنتج: <strong style={{ color: '#0b1020' }}>{rejectModal.product_name}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>العميل: <strong style={{ color: '#0b1020' }}>{rejectModal.customer_name || '—'}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>المبلغ: <strong style={{ color: '#0b1020' }}>${Number(rejectModal.total_price).toFixed(2)}</strong></p>
            </div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>سبب الرفض</label>
            <textarea
              rows={3}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="أدخل سبب الرفض..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.84rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleReject} disabled={actionLoading} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#dc2626', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? 'جاري...' : 'رفض الطلب'}
              </button>
              <button onClick={() => setRejectModal(null)} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
