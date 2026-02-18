'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ShoppingCart, Filter, Search, Zap } from 'lucide-react';
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
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    gxvStoreApi.getOrders().then(data => {
      const list = Array.isArray(data) ? data : data?.orders || [];
      setOrders(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchFilter = !filter || o.status === filter;
    const matchSearch = !search || String(o.product || o.product_name || '').toLowerCase().includes(search.toLowerCase()) || String(o.id || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_price || o.price || 0), 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          📦 طلباتي
        </h1>
        <p style={{ color: '#666688', fontSize: '0.88rem' }}>تتبع جميع طلبات الشحن الخاصة بك</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <div style={{
          padding: '16px', borderRadius: 16,
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.12)',
          textAlign: 'center',
        }}>
          <Package size={20} style={{ color: '#3b82f6', marginBottom: 6 }} />
          <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 2px' }}>{orders.length}</p>
          <p style={{ color: '#666688', fontSize: '0.72rem', margin: 0 }}>إجمالي الطلبات</p>
        </div>
        <div style={{
          padding: '16px', borderRadius: 16,
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.12)',
          textAlign: 'center',
        }}>
          <CheckCircle size={20} style={{ color: '#22c55e', marginBottom: 6 }} />
          <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 2px' }}>{completedCount}</p>
          <p style={{ color: '#666688', fontSize: '0.72rem', margin: 0 }}>مكتمل</p>
        </div>
        <div style={{
          padding: '16px', borderRadius: 16,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.12)',
          textAlign: 'center',
        }}>
          <Clock size={20} style={{ color: '#f59e0b', marginBottom: 6 }} />
          <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 2px' }}>{pendingCount}</p>
          <p style={{ color: '#666688', fontSize: '0.72rem', margin: 0 }}>قيد المعالجة</p>
        </div>
        <div style={{
          padding: '16px', borderRadius: 16,
          background: `rgba(168,85,247,0.06)`,
          border: '1px solid rgba(168,85,247,0.12)',
          textAlign: 'center',
        }}>
          <ShoppingCart size={20} style={{ color: '#a855f7', marginBottom: 6 }} />
          <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 2px' }}>${totalSpent.toFixed(2)}</p>
          <p style={{ color: '#666688', fontSize: '0.72rem', margin: 0 }}>إجمالي المصروف</p>
        </div>
      </div>

      {/* Search + Filter */}
      {orders.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
            <input
              type="text" placeholder="ابحث عن طلب..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '11px 40px 11px 14px', borderRadius: 12,
                background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[
              { key: null, label: 'الكل' },
              { key: 'completed', label: 'مكتمل' },
              { key: 'processing', label: 'معالجة' },
              { key: 'pending', label: 'انتظار' },
            ].map(f => (
              <button key={f.key || 'all'} onClick={() => setFilter(f.key)} style={{
                padding: '8px 16px', borderRadius: 10, whiteSpace: 'nowrap',
                background: filter === f.key ? `${currentTheme.primary}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === f.key ? `${currentTheme.primary}30` : 'rgba(255,255,255,0.06)'}`,
                color: filter === f.key ? currentTheme.primary : '#888',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}>{f.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Orders List */}
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
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          borderRadius: 20, background: 'rgba(15,15,35,0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Package size={52} style={{ marginBottom: 16, opacity: 0.2, color: '#666688' }} />
          <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8ff', marginBottom: 6 }}>لا توجد طلبات بعد</p>
          <p style={{ color: '#555577', fontSize: '0.85rem', marginBottom: 20 }}>ابدأ بشحن ألعابك من متجرنا الآن!</p>
          <a href="/services" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 28px', borderRadius: 14,
            background: currentTheme.gradient, color: '#fff',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700,
            boxShadow: currentTheme.glow,
          }}>
            <Zap size={16} /> ابدأ الشحن
          </a>
        </div>
      ) : (
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          background: 'rgba(15,15,35,0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#555577' }}>
              <Search size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            filteredOrders.map((order, i) => {
              const status = String(order.status || 'pending').toLowerCase();
              const statusInfo = GXV_STATUS_MAP[status] || GXV_STATUS_MAP.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <div key={String(order.id || i)} style={{
                  padding: '18px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 16, flexWrap: 'wrap',
                  borderBottom: i < filteredOrders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  animation: `gxvSlideUp ${0.15 + i * 0.04}s ease-out both`,
                }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: `${statusInfo.color}10`,
                        display: 'grid', placeItems: 'center',
                        fontSize: '1.1rem', flexShrink: 0,
                      }}>
                        {String(order.icon || '🎮')}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                          {String(order.product || order.product_name || `طلب #${order.id}`)}
                        </h4>
                        <div style={{ display: 'flex', gap: 12, color: '#555577', fontSize: '0.75rem', marginTop: 3 }}>
                          <span>#{String(order.id).slice(0, 10)}</span>
                          <span>{order.date || order.created_at ? new Date(String(order.date || order.created_at)).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                      {order.price ? String(order.price) : order.total_price ? `$${Number(order.total_price).toFixed(2)}` : ''}
                    </span>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 8,
                      background: `${statusInfo.color}12`,
                      color: statusInfo.color,
                      fontSize: '0.76rem', fontWeight: 700,
                    }}>
                      <StatusIcon size={13} />
                      {statusInfo.label}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
