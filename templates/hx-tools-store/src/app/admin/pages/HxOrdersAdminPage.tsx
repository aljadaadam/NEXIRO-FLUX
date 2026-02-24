'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxOrder } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { Search, Eye, Truck, Check, X, Clock, Filter, ChevronDown } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; formatPrice: (n: number) => string; isRTL: boolean; buttonRadius: string; }

export default function HxOrdersAdminPage({ theme, darkMode, t, formatPrice, isRTL, buttonRadius }: Props) {
  const [orders, setOrders] = useState<HxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<HxOrder | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const data = await hxAdminApi.getOrders();
      setOrders(data.orders || []);
    } catch { setOrders([]); }
    setLoading(false);
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    processing: { color: '#f59e0b', icon: <Clock size={12} />, label: t('قيد المعالجة') },
    shipped: { color: '#3b82f6', icon: <Truck size={12} />, label: t('تم الشحن') },
    delivered: { color: '#10b981', icon: <Check size={12} />, label: t('تم التوصيل') },
    cancelled: { color: '#ef4444', icon: <X size={12} />, label: t('ملغي') },
  };

  const handleUpdateOrder = async () => {
    if (!selected) return;
    try {
      await hxAdminApi.updateOrder(selected.id, { status: updateStatus || selected.status, tracking_number: trackingNumber || selected.tracking_number });
      setSelected(null);
      loadOrders();
    } catch {}
  };

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return o.order_number.toLowerCase().includes(s) || o.product_name.toLowerCase().includes(s) || (o.customer_name || '').toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>🛒 {t('إدارة الطلبات')}</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 14, color: subtext }} />
          <input className="hx-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('بحث بالرقم أو المنتج أو العميل...')} style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 40 }} />
        </div>
        <select className="hx-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="all">{t('الكل')}</option>
          <option value="processing">{t('قيد المعالجة')}</option>
          <option value="shipped">{t('تم الشحن')}</option>
          <option value="delivered">{t('تم التوصيل')}</option>
          <option value="cancelled">{t('ملغي')}</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 54, borderRadius: 12 }} />)}</div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t('رقم الطلب'), t('المنتج'), t('العميل'), t('الكمية'), t('المبلغ'), t('الحالة'), t('التاريخ'), t('إجراءات')].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const st = statusConfig[o.status] || statusConfig.processing;
                  return (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: theme.primary, whiteSpace: 'nowrap' }}>{o.order_number}</td>
                      <td style={{ padding: '10px 14px', color: text, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product_name}</td>
                      <td style={{ padding: '10px 14px', color: subtext, whiteSpace: 'nowrap' }}>{o.customer_name || '—'}</td>
                      <td style={{ padding: '10px 14px', color: text, textAlign: 'center' }}>{o.quantity}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: text, whiteSpace: 'nowrap' }}>{formatPrice(o.total_with_shipping || o.total_price)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${st.color}15`, color: st.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: subtext, whiteSpace: 'nowrap', fontSize: 12 }}>{o.created_at ? new Date(o.created_at).toLocaleDateString('ar-EG') : '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => { setSelected(o); setUpdateStatus(o.status); setTrackingNumber(o.tracking_number || ''); }} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: theme.primary }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('لا توجد طلبات')}</div>}
        </div>
      )}

      {/* Order detail / update modal */}
      {selected && (
        <div className="hx-modal-overlay" onClick={() => setSelected(null)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{t('تفاصيل الطلب')} — {selected.order_number}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, fontSize: 13 }}>
                {[
                  { l: t('المنتج'), v: selected.product_name },
                  { l: t('العميل'), v: selected.customer_name || '—' },
                  { l: t('الكمية'), v: selected.quantity },
                  { l: t('المبلغ'), v: formatPrice(selected.total_price) },
                  { l: t('رسوم التوصيل'), v: formatPrice(selected.shipping_cost || 0) },
                  { l: t('الإجمالي'), v: formatPrice(selected.total_with_shipping || selected.total_price) },
                  { l: t('طريقة الدفع'), v: selected.payment_method || '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${border}` }}>
                    <span style={{ color: subtext }}>{item.l}</span>
                    <span style={{ fontWeight: 600, color: text }}>{item.v}</span>
                  </div>
                ))}
              </div>

              {selected.shipping_address && (
                <div style={{ padding: 12, background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, color: text, marginBottom: 4 }}>📍 {t('عنوان التوصيل')}</div>
                  <div style={{ color: subtext, lineHeight: 1.7 }}>
                    {selected.shipping_address.fullName} — {selected.shipping_address.phone}<br />
                    {selected.shipping_address.country}, {selected.shipping_address.city}
                    {selected.shipping_address.area ? `, ${selected.shipping_address.area}` : ''}<br />
                    {selected.shipping_address.street}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('تحديث الحالة')}</label>
                  <select className="hx-select" value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}>
                    <option value="processing">{t('قيد المعالجة')}</option>
                    <option value="shipped">{t('تم الشحن')}</option>
                    <option value="delivered">{t('تم التوصيل')}</option>
                    <option value="cancelled">{t('ملغي')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رقم التتبع')}</label>
                  <input className="hx-input" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder={t('أدخل رقم التتبع...')} />
                </div>
                <button onClick={handleUpdateOrder} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), width: '100%' }}>
                  {t('تحديث الطلب')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
