'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { adminApi } from '@/lib/api';
import { Customer } from '@/lib/types';
import { Search, Users, Mail, Phone } from 'lucide-react';

export default function CustomersPage() {
  const { currentTheme, darkMode, t, dateLocale } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    adminApi.getCustomers().then((d: { customers?: Customer[] }) => {
      setCustomers(d.customers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }} className="anim-fade-up">
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: mutedColor }} />
          <input placeholder={t('بحث عن عميل...')} value={search} onChange={e => setSearch(e.target.value)}
            className="car-filter-input" style={{ width: '100%', paddingRight: 40, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
        </div>
        <span style={{ color: mutedColor, fontSize: 14 }}>{filtered.length} {t('عميل')}</span>
      </div>

      <div style={{ background: cardBg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} className="anim-fade-up anim-delay-2">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: mutedColor }}>{t('جاري التحميل...')}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: mutedColor }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>{t('لا يوجد عملاء')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ color: mutedColor }}>#</th>
                  <th style={{ color: mutedColor }}>{t('الاسم')}</th>
                  <th style={{ color: mutedColor }}>{t('البريد')}</th>
                  <th style={{ color: mutedColor }}>{t('الهاتف')}</th>
                  <th style={{ color: mutedColor }}>{t('تاريخ التسجيل')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(cust => (
                  <tr key={cust.id} style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <td style={{ color: textColor, fontWeight: 700 }}>{cust.id}</td>
                    <td style={{ color: textColor, fontWeight: 600 }}>{cust.name}</td>
                    <td style={{ color: mutedColor }}>{cust.email}</td>
                    <td style={{ color: mutedColor }} dir="ltr">{cust.phone || '—'}</td>
                    <td style={{ color: mutedColor, fontSize: 13 }}>{cust.created_at ? new Date(cust.created_at).toLocaleDateString(dateLocale) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
