'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { Announcement } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Bell, Plus, Trash2, X, Send, Users, Mail } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

export default function SmmAnnouncementsPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [bcForm, setBcForm] = useState({ subject: '', message: '', recipient_type: 'all' });
  const [saving, setSaving] = useState(false);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : data?.notifications || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setSaving(true);
    try { await adminApi.createAnnouncement(form); setShowAdd(false); setForm({ title: '', content: '' }); load(); } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد؟'))) return;
    try { await adminApi.deleteAnnouncement(id); load(); } catch {}
  };

  const handleBroadcast = async () => {
    setSaving(true);
    try { await adminApi.sendEmailBroadcast(bcForm); setShowBroadcast(false); setBcForm({ subject: '', message: '', recipient_type: 'all' }); } catch {}
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>📢 {t('الإعلانات')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowBroadcast(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            borderRadius: Number(buttonRadius), border: `1px solid ${border}`,
            background: 'transparent', color: text, fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            <Mail size={14} /> {t('بث بريدي')}
          </button>
          <button onClick={() => setShowAdd(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
            borderRadius: Number(buttonRadius), border: 'none',
            background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            <Plus size={16} /> {t('إعلان جديد')}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('جاري التحميل...')}</div>
      ) : announcements.length === 0 ? (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: 60, textAlign: 'center' }}>
          <Bell size={40} style={{ margin: '0 auto 12px', color: subtext, opacity: 0.3 }} />
          <p style={{ color: subtext }}>{t('لا توجد إعلانات')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map(ann => (
            <div key={ann.id} style={{
              background: cardBg, borderRadius: 14, padding: 18,
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'start', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${theme.primary}12`, color: theme.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bell size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 4 }}>{ann.title}</h4>
                <p style={{ fontSize: 13, color: subtext, lineHeight: 1.5 }}>{ann.content}</p>
                <span style={{ fontSize: 11, color: subtext, marginTop: 6, display: 'block' }}>
                  {ann.date ? new Date(ann.date).toLocaleDateString('ar') : '—'}
                </span>
              </div>
              <button onClick={() => handleDelete(ann.id)} style={{
                padding: 8, border: 'none', borderRadius: 8,
                background: '#ef444412', color: '#ef4444', cursor: 'pointer', flexShrink: 0,
              }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add announcement modal */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 460, background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{t('إعلان جديد')}</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('العنوان')}</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('المحتوى')}</label>
                <textarea rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} style={{ width: '100%', padding: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
              <button onClick={handleAdd} disabled={saving} style={{ padding: '12px', border: 'none', borderRadius: Number(buttonRadius), background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {saving ? '...' : t('نشر الإعلان')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Broadcast modal */}
      {showBroadcast && (
        <>
          <div onClick={() => setShowBroadcast(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 460, background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={18} /> {t('بث بريدي')}</h3>
              <button onClick={() => setShowBroadcast(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('الموضوع')}</label>
                <input value={bcForm.subject} onChange={e => setBcForm(p => ({ ...p, subject: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('المستلمون')}</label>
                <select value={bcForm.recipient_type} onChange={e => setBcForm(p => ({ ...p, recipient_type: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}>
                  <option value="all">{t('جميع العملاء')}</option>
                  <option value="active">{t('العملاء النشطين')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('الرسالة')}</label>
                <textarea rows={4} value={bcForm.message} onChange={e => setBcForm(p => ({ ...p, message: e.target.value }))} style={{ width: '100%', padding: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
              <button onClick={handleBroadcast} disabled={saving} style={{ padding: '12px', border: 'none', borderRadius: Number(buttonRadius), background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Send size={14} /> {saving ? '...' : t('إرسال')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
