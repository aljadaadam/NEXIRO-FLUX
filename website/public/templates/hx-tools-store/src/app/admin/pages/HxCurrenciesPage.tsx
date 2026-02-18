'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxCurrency } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { DollarSign, Plus, Edit3, Trash2, Save, X, Star } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; buttonRadius: string; }

export default function HxCurrenciesPage({ theme, darkMode, t, buttonRadius }: Props) {
  const [currencies, setCurrencies] = useState<HxCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCur, setEditCur] = useState<HxCurrency | null>(null);
  const [form, setForm] = useState({ code: '', name: '', symbol: '', rate: '', is_default: false });

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => { loadCurrencies(); }, []);

  const loadCurrencies = async () => {
    try {
      const data = await hxAdminApi.getCurrencies();
      setCurrencies(data.currencies || []);
    } catch { setCurrencies([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditCur(null);
    setForm({ code: '', name: '', symbol: '', rate: '', is_default: false });
    setShowForm(true);
  };

  const openEdit = (c: HxCurrency) => {
    setEditCur(c);
    setForm({ code: c.code, name: c.name, symbol: c.symbol, rate: String(c.rate), is_default: !!c.is_default });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, rate: Number(form.rate) || 1 };
      if (editCur) {
        await hxAdminApi.updateCurrency(editCur.id, payload);
      } else {
        await hxAdminApi.createCurrency(payload);
      }
      setShowForm(false);
      loadCurrencies();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من الحذف؟'))) return;
    try { await hxAdminApi.deleteCurrency(id); loadCurrencies(); } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>💱 {t('إدارة العملات')}</h2>
        <button onClick={openNew} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> {t('إضافة عملة')}
        </button>
      </div>

      <p style={{ fontSize: 13, color: subtext, lineHeight: 1.7 }}>
        {t('قم بتحديد أسعار الصرف مقارنة بالدولار الأمريكي (USD). العملة الافتراضية ستظهر كعملة أساسية في المتجر.')}
      </p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      ) : currencies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: subtext }}>
          <DollarSign size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>{t('لا توجد عملات')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {currencies.map(c => (
            <div key={c.id} style={{
              background: cardBg, borderRadius: 16, padding: 20,
              border: `1px solid ${c.is_default ? theme.primary + '50' : border}`,
              position: 'relative',
            }}>
              {c.is_default && (
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: `${theme.primary}15`, color: theme.primary,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <Star size={10} fill={theme.primary} /> {t('افتراضي')}
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: c.is_default ? 20 : 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px', fontSize: 22, fontWeight: 900, color: theme.primary,
                }}>
                  {c.symbol}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: text }}>{c.code}</h3>
                <p style={{ fontSize: 13, color: subtext }}>{c.name}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${border}`, fontSize: 13, marginBottom: 12 }}>
                <span style={{ color: subtext }}>{t('سعر الصرف')}</span>
                <span style={{ fontWeight: 700, color: text }}>1 USD = {c.rate} {c.code}</span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(c)} style={{ flex: 1, background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: theme.primary, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Edit3 size={12} /> {t('تعديل')}
                </button>
                <button onClick={() => handleDelete(c.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="hx-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editCur ? t('تعديل العملة') : t('إضافة عملة جديدة')}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رمز العملة')}</label>
                    <input className="hx-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="USD" maxLength={5} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('الرمز')}</label>
                    <input className="hx-input" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="$" maxLength={5} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('اسم العملة')}</label>
                  <input className="hx-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('الدولار الأمريكي')} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('سعر الصرف مقابل الدولار')}</label>
                  <input className="hx-input" type="number" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="1" />
                  <span style={{ fontSize: 11, color: subtext, marginTop: 4, display: 'block' }}>{t('مثال: 3.75 يعني 1 دولار = 3.75 من هذه العملة')}</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
                  {t('عملة افتراضية')}
                </label>
              </div>

              <button onClick={handleSave} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={16} /> {t('حفظ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
