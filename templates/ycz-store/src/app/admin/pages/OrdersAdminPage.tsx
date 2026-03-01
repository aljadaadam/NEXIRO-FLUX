'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Download, CheckCircle, XCircle, RotateCw, X, AlertCircle, Copy, ArrowUpDown, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { Order } from '@/lib/types';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

// Notification sound - generate programmatically
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const duration = 0.15;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 20) * 0.3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
  } catch {}
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'الانتظار', color: '#f59e0b' },
  processing: { label: 'جارٍ التنفيذ', color: '#3b82f6' },
  completed:  { label: 'مكتمل', color: '#22c55e' },
  rejected:   { label: 'مرفوض', color: '#ef4444' },
};

export default function OrdersAdminPage({ theme, isActive }: { theme: ColorTheme; isActive?: boolean }) {
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [copiedField, setCopiedField] = useState('');

  // Modals
  const [detailModal, setDetailModal] = useState<Order | null>(null);
  const [completeModal, setCompleteModal] = useState<Order | null>(null);
  const [rejectModal, setRejectModal] = useState<Order | null>(null);
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-refresh & notification
  const prevPendingRef = useRef<number | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { t, isRTL } = useAdminLang();

  const PAGE_SIZE = 20;

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(id);
    setTimeout(() => setCopiedField(''), 1500);
  }

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'date' ? 'desc' : 'asc'); }
    setPage(1);
  }

  function exportCSV() {
    const headers = [t('رقم الطلب'), t('المنتج'), 'IMEI', t('الحقول'), t('العميل'), t('الإيميل'), t('المبلغ'), t('الحالة'), t('التاريخ')];
    const rows = filtered.map(o => {
      const fields: string[] = [];
      if (o.imei) fields.push(`IMEI: ${o.imei}`);
      if (o.notes) { try { const p = JSON.parse(o.notes); if (p && typeof p === 'object') Object.entries(p).forEach(([k, v]) => { if (v) fields.push(`${k}: ${v}`); }); } catch {} }
      return [
        o.order_number, o.product_name, o.imei || '', fields.join(' | '),
        o.customer_name || '', o.customer_email || '',
        Number(o.total_price).toFixed(2), o.status,
        o.created_at ? new Date(o.created_at).toLocaleDateString('en-US') : ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }

  useEffect(() => {
    if (isActive) loadOrders();
  }, [isActive]);

  // Auto-refresh every 30s when active
  useEffect(() => {
    if (!isActive) {
      if (refreshRef.current) { clearInterval(refreshRef.current); refreshRef.current = null; }
      return;
    }
    refreshRef.current = setInterval(() => { loadOrders(true); }, 30000);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [isActive]);

  async function loadOrders(silent = false) {
    try {
      const res = await adminApi.getOrders();
      let list: Order[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.orders && Array.isArray(res.orders)) list = res.orders;
      // Check for new pending orders → play sound
      const pendingNow = list.filter(o => o.status === 'pending').length;
      if (silent && prevPendingRef.current !== null && pendingNow > prevPendingRef.current) {
        playNotifSound();
      }
      prevPendingRef.current = pendingNow;
      // Dispatch pending count for sidebar badge
      window.dispatchEvent(new CustomEvent('orders-pending-count', { detail: pendingNow }));
      setOrders(list);
      setFetchError(false);
    } catch { if (!silent) setFetchError(true); }
    finally { if (!silent) setLoading(false); }
  }

  // Print order details
  function printOrder(order: Order) {
    const fields: Array<{k: string; v: string}> = [];
    if (order.imei) fields.push({ k: 'IMEI', v: order.imei });
    if (order.notes) {
      try {
        const parsed = JSON.parse(order.notes);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.entries(parsed).forEach(([k, v]) => {
            if (v && String(v).trim()) fields.push({ k, v: String(v) });
          });
        }
      } catch {}
    }
    const si = getStatus(order.status);
    const w = window.open('', '_blank', 'width=420,height=600');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="${isRTL ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>Order #${order.order_number}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Tajawal,Arial,sans-serif;padding:24px;color:#1e293b;font-size:13px}
h1{font-size:16px;margin-bottom:4px}h2{font-size:13px;color:#64748b;margin-bottom:16px;font-weight:400}
.badge{display:inline-block;padding:3px 12px;border-radius:6px;font-weight:700;font-size:12px;background:${si.color}20;color:${si.color}}
table{width:100%;border-collapse:collapse;margin:12px 0}td{padding:6px 8px;border-bottom:1px solid #f1f5f9}
td:first-child{color:#64748b;font-weight:600;width:35%}td:last-child{font-weight:700}
.section{margin-top:14px;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #f1f5f9}
.section h3{font-size:12px;color:#64748b;margin-bottom:6px}.field{padding:3px 0;font-size:12px}
.field span{color:#64748b}.field strong{color:#1e293b}hr{border:none;border-top:1px solid #e2e8f0;margin:14px 0}
@media print{body{padding:12px}}</style></head><body>
<h1>📋 ${isRTL ? 'تفاصيل الطلب' : 'Order Details'} #${order.order_number}</h1>
<h2>${order.created_at ? new Date(order.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : ''}</h2>
<span class="badge">${t(si.label)}</span>
<table>
<tr><td>${isRTL ? 'المنتج' : 'Product'}</td><td>${order.product_name}${order.quantity > 1 ? ` ×${order.quantity}` : ''}</td></tr>
<tr><td>${isRTL ? 'العميل' : 'Customer'}</td><td>${order.customer_name || '—'}</td></tr>
<tr><td>${isRTL ? 'الإيميل' : 'Email'}</td><td>${order.customer_email || '—'}</td></tr>
<tr><td>${isRTL ? 'المبلغ' : 'Amount'}</td><td>$${Number(order.total_price).toFixed(2)}</td></tr>
<tr><td>${isRTL ? 'طريقة الدفع' : 'Payment'}</td><td>${order.payment_method || '—'}</td></tr>
</table>
${fields.length > 0 ? `<div class="section"><h3>${isRTL ? 'الحقول' : 'Fields'}</h3>${fields.map(f => `<div class="field"><span>${f.k}: </span><strong>${f.v}</strong></div>`).join('')}</div>` : ''}
${order.server_response ? `<div class="section" style="background:#fffbeb;border-color:#fde68a"><h3 style="color:#b45309">${isRTL ? 'رد الخدمة' : 'Service Response'}</h3><p style="font-size:12px;color:#92400e;word-break:break-all;white-space:pre-wrap">${order.server_response}</p></div>` : ''}
${order.external_reference_id ? `<hr><p style="font-size:12px;color:#15803d"><strong>${isRTL ? 'رقم المرجع' : 'Reference'}:</strong> ${order.external_reference_id}</p>` : ''}
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}</script>
</body></html>`);
    w.document.close();
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
    await handleStatusChange(rejectModal.id, 'rejected', responseText || t('مرفوض من الإدارة'));
    setRejectModal(null);
    setResponseText('');
  }

  async function handleProcessing(order: Order) {
    await handleStatusChange(order.id, 'processing');
  }

  const filters = [
    { key: 'all', label: t('الكل') },
    { key: 'pending', label: t('الانتظار') },
    { key: 'processing', label: t('جارٍ') },
    { key: 'completed', label: t('مكتمل') },
    { key: 'rejected', label: t('مرفوض') },
  ];
  const filtered = orders.filter(o => {
    // Status filter
    if (filter !== 'all' && o.status !== filter) return false;
    // Search filter (order number, email, product name)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchOrder = o.order_number?.toLowerCase().includes(q);
      const matchEmail = o.customer_email?.toLowerCase().includes(q);
      if (!matchOrder && !matchEmail) return false;
    }
    // Date filter
    if (dateFilter !== 'all' && o.created_at) {
      const now = new Date();
      const orderDate = new Date(o.created_at);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (dateFilter === 'today' && orderDate < startOfToday) return false;
      if (dateFilter === '7days') {
        const d7 = new Date(startOfToday); d7.setDate(d7.getDate() - 7);
        if (orderDate < d7) return false;
      }
      if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (orderDate < startOfMonth) return false;
      }
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'date') return dir * (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    if (sortKey === 'amount') return dir * (Number(a.total_price) - Number(b.total_price));
    if (sortKey === 'order') return dir * ((a.order_number || '').localeCompare(b.order_number || '', undefined, { numeric: true }));
    if (sortKey === 'status') return dir * ((a.status || '').localeCompare(b.status || ''));
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatus = (s: string) => STATUS_MAP[s] || STATUS_MAP['pending'];

  return (
    <>
      {fetchError && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', background: '#fff', borderRadius: 16, fontFamily: 'Tajawal, sans-serif' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>{t('يجري تحديث النظام، يرجى الانتظار قليلاً ثم حاول مرة أخرى')}</p>
        </div>
      )}
      {!fetchError && <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🛒 {t('الطلبات')}</h2>
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
          { label: t('إجمالي'), value: orders.length, bg: '#f8fafc', color: '#0b1020' },
          { label: t('الانتظار'), value: orders.filter(o => o.status === 'pending').length, bg: '#fffbeb', color: '#f59e0b' },
          { label: t('جارٍ'), value: orders.filter(o => o.status === 'processing').length, bg: '#eff6ff', color: '#3b82f6' },
          { label: t('مكتمل'), value: orders.filter(o => o.status === 'completed').length, bg: '#f0fdf4', color: '#22c55e' },
          { label: t('مرفوض'), value: orders.filter(o => o.status === 'rejected').length, bg: '#fef2f2', color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '0.7rem 0.85rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, background: s.bg, display: 'inline-block', padding: '0.1rem 0.5rem', borderRadius: 8 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Date Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder={t('ابحث برقم الطلب أو الإيميل...')}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 1rem', [isRTL ? 'paddingRight' : 'paddingLeft']: 38, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', color: '#0b1020' }}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setPage(1); }} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'left' : 'right']: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={14} color="#94a3b8" />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: t('الكل') },
            { key: 'today', label: t('اليوم') },
            { key: '7days', label: t('7 أيام') },
            { key: 'month', label: t('الشهر') },
          ].map(d => (
            <button key={d.key} onClick={() => { setDateFilter(d.key); setPage(1); }} style={{
              padding: '0.45rem 0.75rem', borderRadius: 8,
              background: dateFilter === d.key ? '#0b1020' : '#fff',
              color: dateFilter === d.key ? '#fff' : '#64748b',
              border: dateFilter === d.key ? 'none' : '1px solid #e2e8f0',
              fontSize: '0.72rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>{d.label}</button>
          ))}
        </div>
        {/* Export CSV */}
        <button onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.75rem', borderRadius: 8, background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          <Download size={14} />
          <span>CSV</span>
        </button>
      </div>

      {/* Results counter */}
      {!loading && (
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 8 }}>
          {isRTL ? `عرض ${paginated.length} من ${filtered.length} طلب` : `Showing ${paginated.length} of ${filtered.length} orders`}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {[
                  { label: t('رقم الطلب'), key: 'order' },
                  { label: t('المنتج'), key: '' },
                  { label: t('الحقول'), key: '' },
                  { label: t('العميل'), key: '' },
                  { label: t('المبلغ'), key: 'amount' },
                  { label: t('الحالة'), key: 'status' },
                  { label: t('التاريخ'), key: 'date' },
                  { label: t('إجراءات'), key: '' },
                ].map((h, i) => (
                  <th key={i} onClick={() => h.key && toggleSort(h.key)} style={{
                    padding: '0.85rem 1rem', textAlign: isRTL ? 'right' : 'left',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                    cursor: h.key ? 'pointer' : 'default', userSelect: 'none',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {h.label}
                      {h.key && <ArrowUpDown size={11} color={sortKey === h.key ? theme.primary : '#cbd5e1'} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>{t('جاري التحميل...')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>{t('لا توجد طلبات')}</td></tr>
              ) : paginated.map(order => {
                const si = getStatus(order.status);
                return (
                <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: theme.primary }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span onClick={() => setDetailModal(order)} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>{order.order_number}</span>
                      {order.status === 'pending' && order.server_response && (
                        <span title={order.server_response} style={{ cursor: 'help', fontSize: '1rem', lineHeight: 1 }}>⚠️</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span>📦</span>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_name}</span>
                        {order.quantity > 1 && <span style={{ fontSize: '0.68rem', color: '#94a3b8', [isRTL ? 'marginRight' : 'marginLeft']: 4 }}> ×{order.quantity}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: 220, minWidth: 120 }}>
                    {(() => {
                      const fields: Array<{k: string; v: string}> = [];
                      if (order.imei) fields.push({ k: 'IMEI', v: order.imei });
                      if (order.notes) {
                        try {
                          const parsed = JSON.parse(order.notes);
                          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                            Object.entries(parsed).forEach(([k, v]) => {
                              if (v && String(v).trim()) fields.push({ k, v: String(v) });
                            });
                          }
                        } catch {}
                      }
                      if (fields.length === 0) return <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {fields.map((f, i) => (
                            <div key={i} style={{ fontSize: '0.72rem', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span style={{ color: '#94a3b8', fontWeight: 600 }}>{f.k}: </span>
                              <span style={{ color: '#0b1020', fontWeight: 700, wordBreak: 'break-all' }}>{f.v}</span>
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(f.v, `tbl-${order.id}-${i}`); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', opacity: 0.5, flexShrink: 0 }} title={t('نسخ')}>
                                {copiedField === `tbl-${order.id}-${i}` ? <CheckCircle size={11} color="#22c55e" /> : <Copy size={11} color="#94a3b8" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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
                    }}>{t(si.label)}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : '--'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {/* إكمال الطلب — يظهر لكل الحالات ماعدا المكتمل */}
                      {order.status !== 'completed' && (
                        <button onClick={() => { setCompleteModal(order); setResponseText(order.server_response || ''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.65rem', borderRadius: 6, border: 'none', background: '#dcfce7', color: '#16a34a', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap' }}>
                          <CheckCircle size={13} />
                          <span>{t('إكمال')}</span>
                        </button>
                      )}
                      {/* تحويل لجارٍ */}
                      {(order.status === 'pending' || order.status === 'rejected') && (
                        <button onClick={() => handleProcessing(order)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.65rem', borderRadius: 6, border: 'none', background: '#dbeafe', color: '#2563eb', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap' }}>
                          <RotateCw size={13} />
                          <span>{t('جارٍ')}</span>
                        </button>
                      )}
                      {/* رفض — يظهر لكل الحالات ماعدا المرفوض */}
                      {order.status !== 'rejected' && (
                        <button onClick={() => { setRejectModal(order); setResponseText(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.65rem', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap' }}>
                          <XCircle size={13} />
                          <span>{t('رفض')}</span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: page === 1 ? 0.4 : 1 }}>
            <ChevronRight size={14} color="#64748b" />
          </button>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', cursor: page === totalPages ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
            <ChevronLeft size={14} color="#64748b" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (() => {
        const si = getStatus(detailModal.status);
        const fields: Array<{k: string; v: string}> = [];
        if (detailModal.imei) fields.push({ k: 'IMEI', v: detailModal.imei });
        if (detailModal.notes) {
          try {
            const parsed = JSON.parse(detailModal.notes);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              Object.entries(parsed).forEach(([k, v]) => {
                if (v && String(v).trim()) fields.push({ k, v: String(v) });
              });
            }
          } catch {}
        }
        return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => setDetailModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '92%', maxWidth: 520, padding: '1.5rem', border: '1px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1020' }}>{t('تفاصيل الطلب')} #{detailModal.order_number}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => printOrder(detailModal)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }} title={isRTL ? 'طباعة' : 'Print'}>
                  <Printer size={14} color="#3b82f6" />
                </button>
                <button onClick={() => setDetailModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <X size={14} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Status badge */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ padding: '0.3rem 0.8rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, background: `${si.color}18`, color: si.color }}>{t(si.label)}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{detailModal.created_at ? new Date(detailModal.created_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : '--'}</span>
            </div>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { label: t('المنتج'), value: detailModal.product_name + (detailModal.quantity > 1 ? ` ×${detailModal.quantity}` : '') },
                { label: t('العميل'), value: detailModal.customer_name || '—' },
                { label: t('الإيميل'), value: detailModal.customer_email || '—' },
                { label: t('المبلغ'), value: `$${Number(detailModal.total_price).toFixed(2)}` },
                { label: t('طريقة الدفع'), value: detailModal.payment_method || '—' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: i % 2 === 0 ? '#f8fafc' : '#fff', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: '0.8rem', color: '#0b1020', fontWeight: 700, textAlign: isRTL ? 'left' : 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Custom Fields */}
            {fields.length > 0 && (
              <div style={{ marginBottom: 16, padding: '0.75rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>{t('الحقول')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {fields.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{f.k}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: '0.78rem', color: '#0b1020', fontWeight: 700, textAlign: isRTL ? 'left' : 'right', wordBreak: 'break-all' }}>{f.v}</span>
                        <button onClick={() => copyToClipboard(f.v, `dtl-${i}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                          {copiedField === `dtl-${i}` ? <CheckCircle size={13} color="#22c55e" /> : <Copy size={13} color="#94a3b8" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server Response */}
            {detailModal.server_response && (
              <div style={{ marginBottom: 16, padding: '0.75rem', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b45309' }}>{t('رد الخدمة')}</p>
                  <button onClick={() => copyToClipboard(detailModal.server_response!, 'srv-resp')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {copiedField === 'srv-resp' ? <CheckCircle size={13} color="#22c55e" /> : <Copy size={13} color="#b45309" />}
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#92400e', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{detailModal.server_response}</p>
              </div>
            )}

            {/* External Reference */}
            {detailModal.external_reference_id && (
              <div style={{ marginBottom: 16, padding: '0.55rem 0.75rem', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>{t('رقم المرجع')}: </span>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>{detailModal.external_reference_id}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              {detailModal.status !== 'completed' && (
                <button onClick={() => { setDetailModal(null); setCompleteModal(detailModal); setResponseText(detailModal.server_response || ''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#16a34a', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>
                  <CheckCircle size={15} />
                  <span>{t('إكمال')}</span>
                </button>
              )}
              {(detailModal.status === 'pending' || detailModal.status === 'rejected') && (
                <button onClick={() => { setDetailModal(null); handleProcessing(detailModal); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#dbeafe', color: '#2563eb', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>
                  <RotateCw size={15} />
                  <span>{t('جارٍ')}</span>
                </button>
              )}
              {detailModal.status !== 'rejected' && (
                <button onClick={() => { setDetailModal(null); setRejectModal(detailModal); setResponseText(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>
                  <XCircle size={15} />
                  <span>{t('رفض')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Complete Modal */}
      {completeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => setCompleteModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '92%', maxWidth: 500, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1020' }}>✅ {t('إكمال الطلب')} #{completeModal.order_number}</h3>
              <button onClick={() => setCompleteModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={14} color="#64748b" />
              </button>
            </div>
            <div style={{ marginBottom: 14, padding: '0.75rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('المنتج')}: <strong style={{ color: '#0b1020' }}>{completeModal.product_name}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('العميل')}: <strong style={{ color: '#0b1020' }}>{completeModal.customer_name || '—'}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('المبلغ')}: <strong style={{ color: '#0b1020' }}>${Number(completeModal.total_price).toFixed(2)}</strong></p>
            </div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>{t('رسالة الإكمال / نتيجة الخدمة')}</label>
            <textarea
              rows={4}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder={t('أدخل رد الخدمة أو رسالة الإكمال للعميل...')}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.84rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleComplete} disabled={actionLoading} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#16a34a', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? t('جاري...') : t('إكمال الطلب')}
              </button>
              <button onClick={() => setCompleteModal(null)} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>{t('إلغاء')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => setRejectModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '92%', maxWidth: 500, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>❌ {t('رفض الطلب')} #{rejectModal.order_number}</h3>
              <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={14} color="#64748b" />
              </button>
            </div>
            <div style={{ marginBottom: 14, padding: '0.75rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('المنتج')}: <strong style={{ color: '#0b1020' }}>{rejectModal.product_name}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('العميل')}: <strong style={{ color: '#0b1020' }}>{rejectModal.customer_name || '—'}</strong></p>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('المبلغ')}: <strong style={{ color: '#0b1020' }}>${Number(rejectModal.total_price).toFixed(2)}</strong></p>
            </div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>{t('سبب الرفض')}</label>
            <textarea
              rows={3}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder={t('أدخل سبب الرفض...')}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.84rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleReject} disabled={actionLoading} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#dc2626', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? t('جاري...') : t('رفض الطلب')}
              </button>
              <button onClick={() => setRejectModal(null)} style={{ padding: '0.62rem 1.45rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>{t('إلغاء')}</button>
            </div>
          </div>
        </div>
      )}
    </>}
    </>
  );
}
