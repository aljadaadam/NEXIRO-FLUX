'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxCustomer } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { Search, Users, Eye, ShoppingCart, MapPin, Phone, Mail } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; formatPrice: (n: number) => string; isRTL: boolean; }

export default function HxCustomersPage({ theme, darkMode, t, formatPrice, isRTL }: Props) {
  const [customers, setCustomers] = useState<HxCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HxCustomer | null>(null);

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await hxAdminApi.getCustomers();
        setCustomers(data.customers || data.users || []);
      } catch { setCustomers([]); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = customers.filter(c =>
    !search.trim() || (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>👥 {t('إدارة العملاء')}</h2>

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 14, color: subtext }} />
        <input className="hx-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('بحث بالاسم أو البريد...')} style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 40 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 54, borderRadius: 12 }} />)}</div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t('العميل'), t('البريد'), t('الهاتف'), t('الدولة'), t('الطلبات'), t('إجراءات')].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${theme.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                          {(c.name || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: text }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: subtext, fontSize: 12 }}>{c.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: subtext, fontSize: 12 }}>{c.phone || '—'}</td>
                    <td style={{ padding: '10px 14px', color: subtext, fontSize: 12 }}>{c.country || '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: text }}>{c.total_orders ?? 0}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setSelected(c)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: theme.primary }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('لا يوجد عملاء')}</div>}
        </div>
      )}

      {/* Customer modal */}
      {selected && (
        <div className="hx-modal-overlay" onClick={() => setSelected(null)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{t('بيانات العميل')}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24, margin: '0 auto 10px' }}>
                  {(selected.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: text }}>{selected.name}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                {[
                  { icon: <Mail size={14} />, l: t('البريد'), v: selected.email || '—' },
                  { icon: <Phone size={14} />, l: t('الهاتف'), v: selected.phone || '—' },
                  { icon: <MapPin size={14} />, l: t('الدولة'), v: selected.country || '—' },
                  { icon: <MapPin size={14} />, l: t('المدينة'), v: selected.city || '—' },
                  { icon: <ShoppingCart size={14} />, l: t('عدد الطلبات'), v: selected.total_orders ?? 0 },
                  { icon: <ShoppingCart size={14} />, l: t('إجمالي المشتريات'), v: formatPrice(selected.total_spent ?? 0) },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: subtext }}>{item.icon} {item.l}</span>
                    <span style={{ fontWeight: 600, color: text }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
