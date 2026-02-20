'use client';

import { useState, useEffect, useMemo } from 'react';
import { Package, Search, Calendar, X } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { currentTheme, t, dateLocale } = useTheme();
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'range'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
      imei: raw.imei ? String(raw.imei) : undefined,
      notes: raw.notes ? String(raw.notes) : undefined,
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

  const filtered = useMemo(() => {
    let result = orders;

    // فلتر الحالة
    if (filter !== 'all') {
      result = result.filter(o => {
        if (filter === 'completed') return o.status === 'completed';
        if (filter === 'pending') return o.status === 'pending' || o.status === 'processing';
        if (filter === 'failed') return o.status === 'failed';
        if (filter === 'cancelled') return o.status === 'cancelled' || o.status === 'refunded';
        return true;
      });
    }

    // بحث IMEI / رقم الطلب / اسم المنتج
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(o =>
        (o.imei && o.imei.toLowerCase().includes(q)) ||
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.product_name && o.product_name.toLowerCase().includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    // فلتر التاريخ
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      result = result.filter(o => o.created_at && new Date(o.created_at).toDateString() === today);
    } else if (dateFilter === 'range') {
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        result = result.filter(o => o.created_at && new Date(o.created_at) >= from);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        result = result.filter(o => o.created_at && new Date(o.created_at) <= to);
      }
    }

    return result;
  }, [orders, filter, searchQuery, dateFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery.trim() || dateFilter !== 'all';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>{t('📋 سجل الطلبات')}</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
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

      {/* بحث + فلتر تاريخ */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* حقل البحث */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('بحث بـ IMEI، رقم الطلب، اسم المنتج...')}
            dir="auto"
            style={{
              width: '100%', padding: '0.55rem 2.2rem 0.55rem 0.75rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.8rem', fontFamily: 'inherit',
              outline: 'none', background: '#fff', color: '#0b1020',
            }}
          />
        </div>

        {/* أزرار التاريخ */}
        <button onClick={() => setDateFilter(dateFilter === 'today' ? 'all' : 'today')} style={{
          padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer',
          background: dateFilter === 'today' ? currentTheme.primary : '#fff',
          color: dateFilter === 'today' ? '#fff' : '#64748b',
          fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Calendar size={14} /> {t('اليوم')}
        </button>

        <button onClick={() => setDateFilter(dateFilter === 'range' ? 'all' : 'range')} style={{
          padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer',
          background: dateFilter === 'range' ? currentTheme.primary : '#fff',
          color: dateFilter === 'range' ? '#fff' : '#64748b',
          fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Calendar size={14} /> {t('فترة')}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} style={{
            padding: '0.55rem 0.85rem', borderRadius: 10, border: '1px solid #fecaca', cursor: 'pointer',
            background: '#fef2f2', color: '#ef4444',
            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <X size={14} /> {t('مسح')}
          </button>
        )}
      </div>

      {/* نطاق التاريخ */}
      {dateFilter === 'range' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{t('من')}</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{
            padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0',
            fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', color: '#0b1020',
          }} />
          <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{t('إلى')}</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{
            padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0',
            fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', color: '#0b1020',
          }} />
        </div>
      )}

      {/* عدد النتائج */}
      {hasActiveFilters && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 8 }}>
          {t('عدد النتائج:')} {filtered.length}
        </p>
      )}

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
            {/* حقول الطلب المقدمة — مدمجة في البطاقة */}
            {(order.imei || order.notes) && (() => {
              const fields: { label: string; value: string }[] = [];
              if (order.imei) fields.push({ label: 'IMEI', value: order.imei });
              if (order.notes) {
                try {
                  const parsed = JSON.parse(order.notes);
                  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                    Object.entries(parsed).forEach(([k, v]) => {
                      if (v && String(v).trim()) fields.push({ label: k, value: String(v) });
                    });
                  } else {
                    fields.push({ label: t('ملاحظات'), value: order.notes });
                  }
                } catch {
                  fields.push({ label: t('ملاحظات'), value: order.notes });
                }
              }
              return fields.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 8 }}>
                  {fields.map((f, i) => (
                    <span key={i} style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 600 }}>{f.label}: </span>
                      <span style={{ color: '#334155', direction: 'ltr', unicodeBidi: 'embed' }}>{f.value}</span>
                    </span>
                  ))}
                </div>
              ) : null;
            })()}
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
