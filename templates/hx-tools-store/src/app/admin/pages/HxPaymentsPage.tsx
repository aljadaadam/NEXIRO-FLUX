'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxPaymentGateway } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { CreditCard, Plus, Edit3, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; buttonRadius: string; }

export default function HxPaymentsPage({ theme, darkMode, t, buttonRadius }: Props) {
  const [gateways, setGateways] = useState<HxPaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGw, setEditGw] = useState<HxPaymentGateway | null>(null);
  const [form, setForm] = useState({ name: '', type: 'bank_transfer', details: '', is_active: true });

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => { loadGateways(); }, []);

  const loadGateways = async () => {
    try {
      const data = await hxAdminApi.getPaymentGateways();
      setGateways(data.gateways || data.payment_gateways || []);
    } catch { setGateways([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditGw(null);
    setForm({ name: '', type: 'bank_transfer', details: '', is_active: true });
    setShowForm(true);
  };

  const openEdit = (gw: HxPaymentGateway) => {
    setEditGw(gw);
    setForm({ name: gw.name, type: gw.type || 'bank_transfer', details: gw.details || '', is_active: gw.is_active !== false });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editGw) {
        await hxAdminApi.updatePaymentGateway(editGw.id, form);
      } else {
        await hxAdminApi.createPaymentGateway(form);
      }
      setShowForm(false);
      loadGateways();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من الحذف؟'))) return;
    try { await hxAdminApi.deletePaymentGateway(id); loadGateways(); } catch {}
  };

  const typeLabels: Record<string, string> = {
    bank_transfer: t('تحويل بنكي'),
    paypal: 'PayPal',
    usdt: 'USDT',
    cod: t('الدفع عند الاستلام'),
    stripe: 'Stripe',
    wallet: t('محفظة إلكترونية'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>💳 {t('بوابات الدفع')}</h2>
        <button onClick={openNew} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> {t('إضافة بوابة')}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 140, borderRadius: 16 }} />)}
        </div>
      ) : gateways.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: subtext }}>
          <CreditCard size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>{t('لا توجد بوابات دفع')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {gateways.map(gw => (
            <div key={gw.id} style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${theme.primary}12`, color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: text }}>{gw.name}</h3>
                    <span style={{ fontSize: 12, color: subtext }}>{typeLabels[gw.type] || gw.type}</span>
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: gw.is_active !== false ? '#10b98115' : '#ef444415',
                  color: gw.is_active !== false ? '#10b981' : '#ef4444',
                }}>
                  {gw.is_active !== false ? t('مفعل') : t('معطل')}
                </span>
              </div>
              {gw.details && <p style={{ fontSize: 12, color: subtext, marginBottom: 12, lineHeight: 1.6 }}>{gw.details}</p>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(gw)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: theme.primary, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Edit3 size={12} /> {t('تعديل')}
                </button>
                <button onClick={() => handleDelete(gw.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={12} /> {t('حذف')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="hx-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editGw ? t('تعديل بوابة الدفع') : t('إضافة بوابة دفع')}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('اسم البوابة')}</label>
                  <input className="hx-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('النوع')}</label>
                  <select className="hx-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('تفاصيل / تعليمات')}</label>
                  <textarea className="hx-input" rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  {t('مفعل')}
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
