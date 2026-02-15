'use client';

import { useState } from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MOCK_ORDERS } from '@/lib/mockData';
import type { ColorTheme } from '@/lib/themes';

export default function OrdersAdminPage({ theme }: { theme: ColorTheme }) {
  const [filter, setFilter] = useState('الكل');

  const filters = ['الكل', 'مكتمل', 'قيد التنفيذ', 'ملغي'];
  const filtered = filter === 'الكل' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🛒 الطلبات</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.45rem 0.85rem', borderRadius: 8,
              background: filter === f ? theme.primary : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              border: filter === f ? 'none' : '1px solid #e2e8f0',
              fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>{f}</button>
          ))}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '0.45rem 0.85rem', borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#fff',
            fontSize: '0.75rem', fontWeight: 600, color: '#64748b',
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}>
            <Download size={13} /> تصدير
          </button>
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #f1f5f9', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['رقم الطلب', 'المنتج', 'العميل', 'المبلغ', 'الدفع', 'الحالة', 'التاريخ', 'إجراءات'].map(h => (
                  <th key={h} style={{
                    padding: '0.85rem 1rem', textAlign: 'right',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: theme.primary }}>{order.id}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{order.icon || '📦'}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{order.product}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{order.customer}</p>
                    <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{order.email}</p>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{order.price}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 6,
                      background: '#f1f5f9', fontSize: '0.7rem', fontWeight: 600, color: '#64748b',
                    }}>{order.payment}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                      fontSize: '0.72rem', fontWeight: 700,
                      background: `${order.statusColor}18`, color: order.statusColor,
                    }}>{order.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#94a3b8' }}>{order.date}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Eye size={13} color="#3b82f6" /></button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#dcfce7', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><CheckCircle size={13} color="#16a34a" /></button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><XCircle size={13} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
