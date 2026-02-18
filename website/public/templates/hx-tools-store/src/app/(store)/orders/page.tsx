'use client';

import { useState, useEffect } from 'react';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { hxStoreApi } from '@/lib/hxApi';
import { HxOrder } from '@/lib/hxTypes';
import { Package, Truck, Check, Clock, X, Eye, Search } from 'lucide-react';

export default function HxOrdersPage() {
  const { currentTheme, darkMode, t, isRTL, formatPrice, buttonRadius } = useHxTheme();
  const [orders, setOrders] = useState<HxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<HxOrder | null>(null);
  const [search, setSearch] = useState('');

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await hxStoreApi.getOrders();
        setOrders(data.orders || []);
      } catch { setOrders([]); }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    processing: { color: '#f59e0b', bg: '#f59e0b15', icon: <Clock size={14} />, label: t('قيد المعالجة') },
    shipped: { color: '#3b82f6', bg: '#3b82f615', icon: <Truck size={14} />, label: t('تم الشحن') },
    delivered: { color: '#10b981', bg: '#10b98115', icon: <Check size={14} />, label: t('تم التوصيل') },
    cancelled: { color: '#ef4444', bg: '#ef444415', icon: <X size={14} />, label: t('ملغي') },
  };

  const filteredOrders = orders.filter(o =>
    !search.trim() ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: text, marginBottom: 24 }}>📦 {t('طلباتي السابقة')}</h1>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 14, color: subtext }} />
          <input
            className="hx-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('بحث في الطلبات...')}
            style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 44 }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: text, marginBottom: 8 }}>{t('لا توجد طلبات')}</h2>
            <a href="/products" className="hx-btn-primary" style={{ background: currentTheme.primary, borderRadius: Number(buttonRadius), display: 'inline-flex', marginTop: 16 }}>
              {t('تسوق الآن')}
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredOrders.map(order => {
              const status = statusConfig[order.status] || statusConfig.processing;
              return (
                <div
                  key={order.id}
                  className="hx-product-card"
                  style={{
                    background: cardBg, borderRadius: 16, padding: 20,
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: currentTheme.primary }}>{order.order_number}</span>
                        <span className="hx-status-tag" style={{ background: status.bg, color: status.color }}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: text, marginBottom: 4 }}>{order.product_name}</h3>
                      <div style={{ fontSize: 12, color: subtext }}>
                        {t('الكمية')}: {order.quantity} | {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: text }}>{formatPrice(order.total_with_shipping || order.total_price)}</div>
                      {order.tracking_number && (
                        <div style={{ fontSize: 11, color: subtext, marginTop: 4 }}>
                          🚚 {order.tracking_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="hx-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: text }}>{t('تفاصيل الطلب')}</h2>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer', fontSize: 20 }}>✕</button>
              </div>

              <div style={{ fontSize: 14, color: currentTheme.primary, fontWeight: 700, marginBottom: 16 }}>{selectedOrder.order_number}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: t('المنتج'), value: selectedOrder.product_name },
                  { label: t('الكمية'), value: selectedOrder.quantity },
                  { label: t('سعر الوحدة'), value: formatPrice(selectedOrder.unit_price) },
                  { label: t('المجموع'), value: formatPrice(selectedOrder.total_price) },
                  { label: t('رسوم التوصيل'), value: formatPrice(selectedOrder.shipping_cost || 0) },
                  { label: t('الإجمالي'), value: formatPrice(selectedOrder.total_with_shipping || selectedOrder.total_price), bold: true },
                  { label: t('الحالة'), value: (statusConfig[selectedOrder.status] || statusConfig.processing).label },
                  { label: t('طريقة الدفع'), value: selectedOrder.payment_method || '—' },
                  { label: t('التاريخ'), value: selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('ar-EG') : '—' },
                  ...(selectedOrder.tracking_number ? [{ label: t('رقم التتبع'), value: selectedOrder.tracking_number }] : []),
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` }}>
                    <span style={{ color: subtext, fontSize: 13 }}>{item.label}</span>
                    <span style={{ fontWeight: (item as any).bold ? 800 : 600, color: (item as any).bold ? currentTheme.primary : text, fontSize: 13 }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {selectedOrder.shipping_address && (
                <div style={{ marginTop: 16, padding: 14, background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 6 }}>📍 {t('عنوان التوصيل')}</div>
                  <div style={{ fontSize: 13, color: subtext, lineHeight: 1.8 }}>
                    {selectedOrder.shipping_address.fullName}<br />
                    {selectedOrder.shipping_address.phone}<br />
                    {selectedOrder.shipping_address.country} — {selectedOrder.shipping_address.city}
                    {selectedOrder.shipping_address.area ? ` — ${selectedOrder.shipping_address.area}` : ''}<br />
                    {selectedOrder.shipping_address.street}
                    {selectedOrder.shipping_address.building ? ` — ${selectedOrder.shipping_address.building}` : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
