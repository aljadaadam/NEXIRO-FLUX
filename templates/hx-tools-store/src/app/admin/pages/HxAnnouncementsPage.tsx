'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxAnnouncement } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { Bell, Plus, Edit3, Trash2, Save, X, Megaphone } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; buttonRadius: string; }

export default function HxAnnouncementsPage({ theme, darkMode, t, buttonRadius }: Props) {
  const [items, setItems] = useState<HxAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<HxAnnouncement | null>(null);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', is_active: true });

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await hxAdminApi.getAnnouncements();
      setItems(data.announcements || []);
    } catch { setItems([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditItem(null);
    setForm({ title: '', message: '', type: 'info', is_active: true });
    setShowForm(true);
  };

  const openEdit = (a: HxAnnouncement) => {
    setEditItem(a);
    setForm({ title: a.title, message: a.message || '', type: a.type || 'info', is_active: a.is_active !== false });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await hxAdminApi.updateAnnouncement(editItem.id, form);
      } else {
        await hxAdminApi.createAnnouncement(form);
      }
      setShowForm(false);
      loadItems();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('حذف هذا الإعلان؟'))) return;
    try { await hxAdminApi.deleteAnnouncement(id); loadItems(); } catch {}
  };

  const typeConfig: Record<string, { color: string; label: string }> = {
    info: { color: '#3b82f6', label: t('معلومات') },
    warning: { color: '#f59e0b', label: t('تنبيه') },
    success: { color: '#10b981', label: t('نجاح') },
    error: { color: '#ef4444', label: t('خطأ') },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>📢 {t('الإعلانات')}</h2>
        <button onClick={openNew} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> {t('إعلان جديد')}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 80, borderRadius: 16 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: subtext }}>
          <Megaphone size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>{t('لا توجد إعلانات')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(a => {
            const tc = typeConfig[a.type || 'info'] || typeConfig.info;
            return (
              <div key={a.id} style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}`, borderRight: `4px solid ${tc.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: text }}>{a.title}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: a.is_active !== false ? '#10b98115' : '#ef444415', color: a.is_active !== false ? '#10b981' : '#ef4444' }}>
                        {a.is_active !== false ? t('مفعل') : t('معطل')}
                      </span>
                    </div>
                    {a.message && <p style={{ fontSize: 13, color: subtext, lineHeight: 1.6 }}>{a.message}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(a)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: theme.primary }}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(a.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="hx-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editItem ? t('تعديل الإعلان') : t('إعلان جديد')}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('العنوان')}</label>
                  <input className="hx-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('الرسالة')}</label>
                  <textarea className="hx-input" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('النوع')}</label>
                  <select className="hx-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
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
