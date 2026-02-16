'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, X, Send } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvAnnouncementsPanel() {
  const { currentTheme } = useGxvTheme();
  const [announcements, setAnnouncements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const load = () => {
    setLoading(true);
    gxvAdminApi.getAnnouncements().then(data => {
      setAnnouncements(Array.isArray(data) ? data : data?.notifications || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    await gxvAdminApi.createAnnouncement(form);
    setCreateModal(false);
    setForm({ title: '', content: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا الإعلان؟')) return;
    await gxvAdminApi.deleteAnnouncement(id);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: '#666688', fontSize: '0.85rem', margin: 0 }}>إدارة الإعلانات والتنبيهات للمستخدمين</p>
        <button onClick={() => setCreateModal(true)} style={{
          padding: '10px 20px', borderRadius: 12, background: currentTheme.gradient,
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6, boxShadow: currentTheme.glow,
        }}>
          <Plus size={15} /> إعلان جديد
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {announcements.map((ann, i) => (
            <div key={ann.id as number} style={{
              padding: '18px', borderRadius: 14,
              background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
              animation: `gxvSlideUp ${0.15 + i * 0.05}s ease-out both`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Megaphone size={15} style={{ color: currentTheme.primary }} />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                      {String(ann.title || '')}
                    </h4>
                  </div>
                  <p style={{ color: '#666688', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
                    {String(ann.content || ann.message || '')}
                  </p>
                  <span style={{ color: '#444466', fontSize: '0.7rem', marginTop: 6, display: 'block' }}>
                    {ann.created_at ? new Date(String(ann.created_at)).toLocaleDateString('ar') : ''}
                  </span>
                </div>
                <button onClick={() => handleDelete(ann.id as number)} style={{
                  width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555577' }}>
              <Megaphone size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p>لا توجد إعلانات</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16 }}
          onClick={() => setCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 440, borderRadius: 20, background: '#0f0f23',
            border: '1px solid rgba(255,255,255,0.08)', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>📢 إعلان جديد</h3>
              <button onClick={() => setCreateModal(false)} style={{
                width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
              }}><X size={15} /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>العنوان</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="عنوان الإعلان"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>المحتوى</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="نص الإعلان..."
                rows={4}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                  resize: 'vertical',
                }} />
            </div>

            <button onClick={handleCreate} style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: currentTheme.gradient, color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Send size={14} /> نشر الإعلان
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
