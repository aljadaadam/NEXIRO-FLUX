'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { User } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Search, Users as UsersIcon, Eye, X, Ban, CheckCircle, Wallet, RefreshCw } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  formatPrice?: (n: number) => string;
  isRTL?: boolean;
}

export default function SmmCustomersPage({ theme, darkMode, t }: Props) {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getCustomers(1, 200, searchTerm);
      setCustomers(Array.isArray(data) ? data : data?.customers || []);
    } catch {}
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async (id: number, blocked: boolean) => {
    try { await adminApi.toggleBlockCustomer(id, blocked); load(); } catch {}
  };

  const handleWalletUpdate = async () => {
    if (!selected || !walletAmount) return;
    try {
      await adminApi.updateCustomerWallet(selected.id, parseFloat(walletAmount), walletReason || undefined);
      setWalletAmount(''); setWalletReason('');
      load();
      // refresh selected
      try { const d = await adminApi.getCustomerById(selected.id); setSelected(d.customer || d); } catch {}
    } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>👥 {t('إدارة العملاء')} ({customers.length})</h2>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: subtext }} />
          <input
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); }}
            placeholder={t('بحث بالاسم أو البريد...')}
            style={{ width: '100%', height: 40, paddingRight: 36, paddingLeft: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}
          />
        </div>
        <button onClick={() => { setLoading(true); load(); }} style={{
          height: 40, padding: '0 16px', border: `1px solid ${border}`, borderRadius: 10,
          background: inputBg, color: subtext, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <RefreshCw size={14} /> {t('تحديث')}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('جاري التحميل...')}</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: subtext }}>
            <UsersIcon size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>{t('لا يوجد عملاء')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['#', t('الاسم'), t('البريد'), t('المحفظة'), t('الحالة'), t('التاريخ'), ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${border}` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${theme.primary}05`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', color: subtext }}>{c.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: text }}>{c.name}</td>
                    <td style={{ padding: '12px 14px', color: subtext }}>{c.email}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: theme.primary }}>${(c.wallet_balance || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: c.status === 'blocked' ? '#ef444415' : '#10b98115',
                        color: c.status === 'blocked' ? '#ef4444' : '#10b981',
                      }}>
                        {c.status === 'blocked' ? t('محظور') : t('نشط')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: subtext, fontSize: 12 }}>
                      {c.joined ? new Date(c.joined).toLocaleDateString('ar') : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setSelected(c)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: theme.primary }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleBlock(c.id, c.status !== 'blocked')} style={{
                          background: c.status === 'blocked' ? '#10b98112' : '#ef444412', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer',
                          color: c.status === 'blocked' ? '#10b981' : '#ef4444',
                        }}>
                          {c.status === 'blocked' ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer detail modal */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '90%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto',
            background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{t('تفاصيل العميل')}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { l: t('الاسم'), v: selected.name },
                { l: t('البريد'), v: selected.email },
                { l: t('الهاتف'), v: selected.phone || '—' },
                { l: t('الدولة'), v: selected.country || '—' },
                { l: t('المحفظة'), v: `$${(selected.wallet_balance || 0).toFixed(2)}` },
                { l: t('الحالة'), v: selected.status === 'blocked' ? t('محظور') : t('نشط') },
                { l: t('آخر دخول'), v: selected.last_login_at ? new Date(selected.last_login_at).toLocaleString('ar') : '—' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: subtext }}>{item.l}</span>
                  <span style={{ fontSize: 13, color: text }}>{item.v}</span>
                </div>
              ))}
            </div>

            {/* Wallet adjustment */}
            <div style={{ background: inputBg, borderRadius: 12, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wallet size={16} /> {t('تعديل المحفظة')}
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="number" step="0.01" value={walletAmount} onChange={e => setWalletAmount(e.target.value)}
                  placeholder={t('المبلغ (موجب أو سالب)')}
                  style={{ flex: '1 1 120px', height: 38, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 8, background: cardBg, color: text, fontSize: 13, outline: 'none' }}
                />
                <input
                  value={walletReason} onChange={e => setWalletReason(e.target.value)}
                  placeholder={t('السبب (اختياري)')}
                  style={{ flex: '1 1 120px', height: 38, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 8, background: cardBg, color: text, fontSize: 13, outline: 'none' }}
                />
                <button onClick={handleWalletUpdate} style={{
                  height: 38, padding: '0 16px', border: 'none', borderRadius: 8,
                  background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                  {t('تطبيق')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
