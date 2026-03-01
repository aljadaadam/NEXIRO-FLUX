'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Search, RefreshCw, Eye, X, ChevronDown, ShoppingCart } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  formatPrice?: (n: number) => string;
  isRTL?: boolean;
  buttonRadius?: string;
}

export default function SmmOrdersPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const statusColors: Record<string, string> = {
    completed: '#10b981', مكتمل: '#10b981',
    pending: '#f59e0b', معلق: '#f59e0b', 'قيد الانتظار': '#f59e0b',
    processing: '#3b82f6', 'قيد المعالجة': '#3b82f6', 'جاري التنفيذ': '#3b82f6',
    cancelled: '#ef4444', ملغي: '#ef4444',
    failed: '#ef4444', فشل: '#ef4444',
    partial: '#f97316', جزئي: '#f97316',
  };

  const statusOptions = ['pending', 'processing', 'completed', 'cancelled', 'failed', 'partial'];

  const loadOrders = useCallback(async () => {
    try {
      const data = await adminApi.getOrders();
      setOrders(Array.isArray(data) ? data : data?.orders || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter(o => {
    const matchSearch = !searchTerm ||
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus });
      loadOrders();
    } catch {}
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: 60, borderRadius: 12, background: `linear-gradient(90deg, ${cardBg}, ${darkMode ? '#1e2642' : '#f1f5f9'}, ${cardBg})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>🛒 {t('إدارة الطلبات')} ({filtered.length})</h2>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: subtext }} />
          <input
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('بحث بالرقم أو المنتج أو العميل...')}
            style={{ width: '100%', height: 40, paddingRight: 36, paddingLeft: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', minWidth: 140 }}
        >
          <option value="">{t('كل الحالات')}</option>
          {statusOptions.map(s => <option key={s} value={s}>{t(s)}</option>)}
        </select>
        <button onClick={() => { setLoading(true); loadOrders(); }} style={{
          height: 40, padding: '0 16px', border: `1px solid ${border}`, borderRadius: 10,
          background: inputBg, color: subtext, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <RefreshCw size={14} /> {t('تحديث')}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: subtext }}>
            <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>{t('لا توجد طلبات')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t('الطلب'), t('المنتج'), t('العميل'), t('الكمية'), t('المبلغ'), t('الحالة'), t('التاريخ'), ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${border}` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${theme.primary}05`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: theme.primary, whiteSpace: 'nowrap' }}>{order.order_number}</td>
                    <td style={{ padding: '12px 14px', color: text, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_name}</td>
                    <td style={{ padding: '12px 14px', color: subtext, whiteSpace: 'nowrap' }}>{order.customer_name || '—'}</td>
                    <td style={{ padding: '12px 14px', color: text }}>{order.quantity}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: text }}>${order.total_price}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          style={{
                            padding: '4px 24px 4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: `${statusColors[order.status] || '#64748b'}15`,
                            color: statusColors[order.status] || '#64748b',
                            border: 'none', outline: 'none', cursor: 'pointer', appearance: 'none',
                          }}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{t(s)}</option>)}
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 6, pointerEvents: 'none', color: statusColors[order.status] || '#64748b' }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar') : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => setSelectedOrder(order)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: theme.primary }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <>
          <div onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '90%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto',
            background: cardBg, borderRadius: 20, padding: 28, zIndex: 101,
            border: `1px solid ${border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{t('تفاصيل الطلب')}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: t('رقم الطلب'), value: selectedOrder.order_number },
                { label: t('المنتج'), value: selectedOrder.product_name },
                { label: t('العميل'), value: selectedOrder.customer_name || '—' },
                { label: t('البريد'), value: selectedOrder.customer_email || '—' },
                { label: t('الكمية'), value: String(selectedOrder.quantity) },
                { label: t('المبلغ'), value: `$${selectedOrder.total_price}` },
                { label: t('طريقة الدفع'), value: selectedOrder.payment_method || '—' },
                { label: t('الحالة'), value: t(selectedOrder.status) },
                { label: t('الرابط/المعرف'), value: selectedOrder.imei || '—' },
                { label: t('رد السيرفر'), value: selectedOrder.server_response || '—' },
                { label: t('التاريخ'), value: selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('ar') : '—' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: subtext }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: text, maxWidth: '60%', textAlign: 'left', wordBreak: 'break-all' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedOrder(null)} style={{
              width: '100%', marginTop: 20, padding: '12px', border: 'none',
              borderRadius: Number(buttonRadius), background: theme.gradient,
              color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}>
              {t('إغلاق')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
