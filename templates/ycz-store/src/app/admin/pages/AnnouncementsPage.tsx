'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Announcement } from '@/lib/types';

export default function AnnouncementsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await adminApi.getAnnouncements();
      if (Array.isArray(res)) setAnnouncements(res);
      else if (res?.announcements && Array.isArray(res.announcements)) setAnnouncements(res.announcements);
    } catch { /* keep fallback */ }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newTitle || !newContent) return;
    setSaving(true);
    try {
      await adminApi.createAnnouncement({
        title: newTitle,
        content: newContent,
        active: true,
      });
      setShowAdd(false);
      setNewTitle('');
      setNewContent('');
      loadAnnouncements();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>📢 الإعلانات</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.6rem 1.25rem', borderRadius: 10,
          background: '#7c5cff', color: '#fff',
          border: 'none', fontSize: '0.82rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
        }}>
          <Plus size={16} /> إعلان جديد
        </button>
      </div>

      {showAdd && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="عنوان الإعلان" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{
              padding: '0.7rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <textarea rows={3} placeholder="محتوى الإعلان..." value={newContent} onChange={e => setNewContent(e.target.value)} style={{
              padding: '0.7rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical',
            }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreate} disabled={saving} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10,
                background: '#7c5cff', color: '#fff',
                border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: saving ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
                opacity: saving ? 0.7 : 1,
              }}>{saving ? 'جاري النشر...' : 'نشر'}</button>
              <button onClick={() => setShowAdd(false)} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10,
                background: '#f1f5f9', color: '#64748b',
                border: 'none', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {announcements.map(ann => (
          <div key={ann.id} style={{
            background: '#fff', borderRadius: 14, padding: '1.25rem',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{ann.title}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{ann.content}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                  background: ann.active ? '#dcfce7' : '#f1f5f9',
                  color: ann.active ? '#16a34a' : '#94a3b8',
                }}>{ann.active ? 'نشط' : 'متوقف'}</span>
                <button style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={12} color="#3b82f6" /></button>
                <button onClick={() => handleDelete(ann.id)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={12} color="#dc2626" /></button>
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {ann.date}</p>
          </div>
        ))}
      </div>
    </>
  );
}
