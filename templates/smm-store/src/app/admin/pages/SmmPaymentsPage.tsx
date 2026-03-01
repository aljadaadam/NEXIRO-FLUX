'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { PaymentGateway } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Search, CreditCard, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, RefreshCw } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

interface Payment {
  id: number;
  customer_name?: string;
  customer_email?: string;
  amount: number;
  type: string;
  status: string;
  payment_method?: string;
  created_at?: string;
  reference?: string;
}

export default function SmmPaymentsPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [tab, setTab] = useState<'payments' | 'gateways'>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGateway, setEditGateway] = useState<PaymentGateway | null>(null);
  const [gwForm, setGwForm] = useState({ name: '', type: 'paypal' as string, config: '{}' });

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const statusColors: Record<string, string> = {
    approved: '#10b981', completed: '#10b981',
    pending: '#f59e0b', processing: '#3b82f6',
    rejected: '#ef4444', failed: '#ef4444',
  };

  const load = useCallback(async () => {
    try {
      const [pData, gData] = await Promise.all([
        adminApi.getPayments(1, 100),
        adminApi.getPaymentGateways(),
      ]);
      setPayments(Array.isArray(pData) ? pData : pData?.payments || []);
      setGateways(Array.isArray(gData) ? gData : gData?.gateways || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleGateway = async (id: number) => {
    try { await adminApi.togglePaymentGateway(id); load(); } catch {}
  };

  const handleDeleteGateway = async (id: number) => {
    if (!confirm(t('هل أنت متأكد؟'))) return;
    try { await adminApi.deletePaymentGateway(id); load(); } catch {}
  };

  const handleSaveGateway = async () => {
    try {
      const data = { name: gwForm.name, type: gwForm.type, config: JSON.parse(gwForm.config) };
      if (editGateway) {
        await adminApi.updatePaymentGateway(editGateway.id, data);
      } else {
        await adminApi.createPaymentGateway(data);
      }
      setShowModal(false); load();
    } catch {}
  };

  const handlePaymentStatus = async (id: number, status: string) => {
    try { await adminApi.updatePaymentStatus(id, status); load(); } catch {}
  };

  const filteredPayments = payments.filter(p =>
    !searchTerm || p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.customer_email?.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>💳 {t('إدارة المدفوعات')}</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'payments' as const, label: t('المدفوعات') },
          { id: 'gateways' as const, label: t('بوابات الدفع') },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: tab === tb.id ? theme.gradient : `${theme.primary}08`,
            color: tab === tb.id ? '#fff' : text,
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'payments' && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 250px' }}>
              <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: subtext }} />
              <input
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('بحث...')}
                style={{ width: '100%', height: 40, paddingRight: 36, paddingLeft: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('جاري التحميل...')}</div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: subtext }}>
                <CreditCard size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>{t('لا توجد مدفوعات')}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      {['#', t('العميل'), t('المبلغ'), t('النوع'), t('الحالة'), t('التاريخ')].map((h, i) => (
                        <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: '12px 14px', color: subtext }}>{p.id}</td>
                        <td style={{ padding: '12px 14px', color: text }}>{p.customer_name || p.customer_email || '—'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: text }}>${p.amount}</td>
                        <td style={{ padding: '12px 14px', color: subtext }}>{p.type}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <select value={p.status} onChange={e => handlePaymentStatus(p.id, e.target.value)} style={{
                            padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                            background: `${statusColors[p.status] || '#64748b'}15`,
                            color: statusColors[p.status] || '#64748b',
                            border: 'none', cursor: 'pointer',
                          }}>
                            {['pending', 'approved', 'rejected'].map(s => <option key={s} value={s}>{t(s)}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '12px 14px', color: subtext, fontSize: 12 }}>
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('ar') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'gateways' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { setEditGateway(null); setGwForm({ name: '', type: 'paypal', config: '{}' }); setShowModal(true); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
              borderRadius: Number(buttonRadius), border: 'none',
              background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              <Plus size={16} /> {t('إضافة بوابة')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {gateways.map(gw => (
              <div key={gw.id} style={{
                background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}`,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: text }}>{gw.name}</h4>
                    <span style={{ fontSize: 12, color: subtext }}>{gw.type}</span>
                  </div>
                  <button onClick={() => handleToggleGateway(gw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: gw.is_enabled ? '#10b981' : subtext }}>
                    {gw.is_enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditGateway(gw); setGwForm({ name: gw.name, type: gw.type, config: JSON.stringify(gw.config || {}, null, 2) }); setShowModal(true); }} style={{
                    flex: 1, padding: '8px', border: `1px solid ${border}`, borderRadius: 8,
                    background: 'transparent', color: theme.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    <Edit2 size={12} /> {t('تعديل')}
                  </button>
                  <button onClick={() => handleDeleteGateway(gw.id)} style={{
                    padding: '8px 12px', border: 'none', borderRadius: 8,
                    background: '#ef444412', color: '#ef4444', cursor: 'pointer',
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Gateway modal */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '90%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto',
            background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editGateway ? t('تعديل بوابة') : t('إضافة بوابة')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('الاسم')}</label>
                <input value={gwForm.name} onChange={e => setGwForm({ ...gwForm, name: e.target.value })} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('النوع')}</label>
                <select value={gwForm.type} onChange={e => setGwForm({ ...gwForm, type: e.target.value })} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}>
                  {['paypal', 'bank_transfer', 'usdt', 'binance', 'bankak'].map(t2 => <option key={t2} value={t2}>{t2}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>Config (JSON)</label>
                <textarea rows={5} value={gwForm.config} onChange={e => setGwForm({ ...gwForm, config: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 12, outline: 'none', fontFamily: 'monospace', resize: 'vertical' }} />
              </div>
              <button onClick={handleSaveGateway} style={{
                padding: '12px', border: 'none', borderRadius: Number(buttonRadius),
                background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>
                {editGateway ? t('تحديث') : t('إضافة')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
