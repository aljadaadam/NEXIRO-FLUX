'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, FileText } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

export default function SmmBlogAdminPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: '', title_en: '', excerpt: '', excerpt_en: '', content: '', category: '', image: '' });

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getBlogPosts();
      setPosts(Array.isArray(data) ? data : data?.posts || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditPost(null);
    setForm({ title: '', title_en: '', excerpt: '', excerpt_en: '', content: '', category: '', image: '' });
    setShowModal(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditPost(p);
    setForm({
      title: p.title, title_en: p.title_en || '', excerpt: p.excerpt || '', excerpt_en: p.excerpt_en || '',
      content: Array.isArray(p.content) ? p.content.join('\n\n') : String(p.content || ''),
      category: p.category || '', image: p.image || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...form,
        content: form.content.split('\n\n').filter(Boolean),
      };
      if (editPost) {
        await adminApi.updateBlogPost(editPost.id, data);
      } else {
        await adminApi.createBlogPost(data);
      }
      setShowModal(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد؟'))) return;
    try { await adminApi.deleteBlogPost(id); load(); } catch {}
  };

  const handleTogglePublish = async (id: number) => {
    try { await adminApi.toggleBlogPublish(id); load(); } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>📝 {t('إدارة المدونة')} ({posts.length})</h2>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          borderRadius: Number(buttonRadius), border: 'none',
          background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          <Plus size={16} /> {t('إضافة مقال')}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 200, borderRadius: 16, background: `linear-gradient(90deg, ${cardBg}, ${darkMode ? '#1e2642' : '#f1f5f9'}, ${cardBg})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: 60, textAlign: 'center' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', color: subtext, opacity: 0.3 }} />
          <p style={{ color: subtext }}>{t('لا توجد مقالات')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: cardBg, borderRadius: 16, border: `1px solid ${border}`,
              overflow: 'hidden', transition: 'all 0.3s',
            }}>
              {post.image && (
                <div style={{
                  height: 140, background: `url(${post.image}) center/cover`,
                  position: 'relative', opacity: post.is_published ? 1 : 0.5,
                }}>
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: post.is_published ? '#10b98120' : '#ef444420',
                    color: post.is_published ? '#10b981' : '#ef4444',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {post.is_published ? t('منشور') : t('مسودة')}
                  </span>
                </div>
              )}
              <div style={{ padding: 16 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 6 }}>{post.title}</h4>
                <p style={{ fontSize: 12, color: subtext, marginBottom: 12, lineHeight: 1.5 }}>{post.excerpt || '—'}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(post)} style={{ flex: 1, padding: '7px', border: `1px solid ${border}`, borderRadius: 8, background: 'transparent', color: theme.primary, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Edit2 size={12} /> {t('تعديل')}
                  </button>
                  <button onClick={() => handleTogglePublish(post.id)} style={{ padding: '7px 10px', border: `1px solid ${border}`, borderRadius: 8, background: 'transparent', color: post.is_published ? '#f59e0b' : '#10b981', cursor: 'pointer' }}>
                    {post.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(post.id)} style={{ padding: '7px 10px', border: 'none', borderRadius: 8, background: '#ef444412', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog edit modal */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '90%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
            background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editPost ? t('تعديل مقال') : t('إضافة مقال')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'title', label: 'العنوان (عربي)', type: 'text' },
                { key: 'title_en', label: 'العنوان (إنجليزي)', type: 'text' },
                { key: 'category', label: 'التصنيف', type: 'text' },
                { key: 'image', label: 'رابط الصورة', type: 'text' },
                { key: 'excerpt', label: 'المقتطف (عربي)', type: 'text' },
                { key: 'excerpt_en', label: 'المقتطف (إنجليزي)', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t(field.label)}</label>
                  <input value={form[field.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('المحتوى')} (فصل الفقرات بسطرين)</label>
                <textarea rows={6} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} style={{ width: '100%', padding: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
              <button onClick={handleSave} style={{ padding: '12px', border: 'none', borderRadius: Number(buttonRadius), background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {editPost ? t('تحديث') : t('نشر')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
