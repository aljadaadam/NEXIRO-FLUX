'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, BookOpen, Calendar, Clock, Save } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

const CATEGORY_COLORS = [
  { label: 'أزرق', value: '#3b82f6' },
  { label: 'بنفسجي', value: '#8b5cf6' },
  { label: 'أحمر', value: '#ef4444' },
  { label: 'أخضر', value: '#10b981' },
  { label: 'برتقالي', value: '#f59e0b' },
  { label: 'نيلي', value: '#6366f1' },
  { label: 'وردي', value: '#ec4899' },
];

const POST_EMOJIS = ['📝', '🍎', '📱', '🔧', '🛡️', '🔎', '🎮', '💻', '🔐', '📡', '⚡', '🌐', '📊', '🎯'];

export default function BlogAdminPage({ isActive }: { isActive?: boolean } = {}) {
  const { t, isRTL } = useAdminLang();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [contentText, setContentText] = useState('');
  const [category, setCategory] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3b82f6');
  const [image, setImage] = useState('📝');
  const [readTime, setReadTime] = useState(5);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => { if (isActive) loadPosts(); }, [isActive]);

  async function loadPosts() {
    try {
      const res = await adminApi.getBlogPosts();
      const p = (res as { posts?: BlogPost[] })?.posts || [];
      setPosts(Array.isArray(p) ? p : []);
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }

  function resetForm() {
    setTitle(''); setTitleEn(''); setExcerpt(''); setExcerptEn('');
    setContentText(''); setCategory(''); setCategoryColor('#3b82f6');
    setImage('📝'); setReadTime(5); setIsPublished(true);
    setEditingPost(null);
  }

  function openEditForm(post: BlogPost) {
    setEditingPost(post);
    setTitle(post.title);
    setTitleEn(post.title_en || '');
    setExcerpt(post.excerpt);
    setExcerptEn(post.excerpt_en || '');
    setContentText(Array.isArray(post.content) ? post.content.join('\n') : '');
    setCategory(post.category);
    setCategoryColor(post.category_color || '#3b82f6');
    setImage(post.image || '📝');
    setReadTime(post.read_time || 5);
    setIsPublished(!!post.is_published);
    setShowForm(true);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const contentArr = contentText.split('\n').filter(l => l.trim());
      const data = {
        title, title_en: titleEn, excerpt, excerpt_en: excerptEn,
        content: contentArr, category, category_color: categoryColor,
        image, read_time: readTime, is_published: isPublished,
      };
      if (editingPost) {
        await adminApi.updateBlogPost(editingPost.id, data);
      } else {
        await adminApi.createBlogPost(data);
      }
      setShowForm(false);
      resetForm();
      loadPosts();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('هل تريد حذف هذا المقال؟'))) return;
    try {
      await adminApi.deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  }

  async function handleTogglePublish(id: number) {
    try {
      await adminApi.toggleBlogPublish(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, is_published: !p.is_published } : p));
    } catch { /* ignore */ }
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.7rem 1rem', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: '0.85rem',
    fontFamily: 'Tajawal, sans-serif', outline: 'none', width: '100%',
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>{t('📝 المدونة')}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{posts.length} {t('مقال')}</span>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 1.25rem', borderRadius: 10,
              background: '#7c5cff', color: '#fff',
              border: 'none', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
            <Plus size={16} /> {t('مقال جديد')}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>
              {editingPost ? t('✏️ تعديل المقال') : t('➕ مقال جديد')}
            </h3>
            <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('العنوان (عربي)')} *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('عنوان المقال بالعربي')} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('العنوان (إنجليزي)')}</label>
              <input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Article title in English" style={{ ...inputStyle, direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('الملخص (عربي)')}</label>
              <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder={t('ملخص قصير للمقال')} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('الملخص (إنجليزي)')}</label>
              <input value={excerptEn} onChange={e => setExcerptEn(e.target.value)} placeholder="Short excerpt in English" style={{ ...inputStyle, direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('التصنيف')}</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder={t('مثل: iCloud, فتح شبكات, أدوات سوفتوير')} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('وقت القراءة (دقائق)')}</label>
              <input type="number" value={readTime} onChange={e => setReadTime(Number(e.target.value))} min={1} max={60} style={inputStyle} />
            </div>
          </div>

          {/* Color & Emoji */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>{t('لون التصنيف')}</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORY_COLORS.map(c => (
                  <button key={c.value} onClick={() => setCategoryColor(c.value)}
                    title={t(c.label)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, background: c.value, border: categoryColor === c.value ? '3px solid #0b1020' : '2px solid #e2e8f0',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>{t('أيقونة المقال')}</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {POST_EMOJIS.map(e => (
                  <button key={e} onClick={() => setImage(e)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, fontSize: '1.1rem',
                      background: image === e ? '#f1f5f9' : 'transparent',
                      border: image === e ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                      cursor: 'pointer', display: 'grid', placeItems: 'center',
                    }}>{e}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>{t('المحتوى (كل سطر = فقرة)')}</label>
            <textarea rows={8} value={contentText} onChange={e => setContentText(e.target.value)}
              placeholder={t('اكتب محتوى المقال هنا...\nكل سطر يُعتبر فقرة منفصلة.\nيمكنك استخدام إيموجي مثل 🔹 أو ✅ في بداية السطر.')}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }} />
          </div>

          {/* Publish + Save */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                style={{ accentColor: '#7c5cff', width: 18, height: 18 }} />
              {t('نشر المقال فوراً')}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowForm(false); resetForm(); }}
                style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                {t('إلغاء')}
              </button>
              <button onClick={handleSave} disabled={saving || !title.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.6rem 1.5rem', borderRadius: 10,
                  background: '#7c5cff', color: '#fff',
                  border: 'none', fontSize: '0.82rem', fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
                  opacity: (saving || !title.trim()) ? 0.6 : 1,
                }}>
                <Save size={14} /> {saving ? t('جاري الحفظ...') : editingPost ? t('حفظ التعديلات') : t('نشر المقال')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, width: '60%', marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ height: 10, background: '#f8fafc', borderRadius: 4, width: '40%', animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts List */}
      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{t('لا توجد مقالات بعد')}</p>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{t('اضغط "مقال جديد" لإضافة أول مقال في المدونة')}</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
              border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12,
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${post.category_color || '#3b82f6'}12`,
                display: 'grid', placeItems: 'center', fontSize: '1.4rem', flexShrink: 0,
              }}>{post.image || '📝'}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</h4>
                  {!post.is_published && (
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0 }}>{t('مسودة')}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: `${post.category_color || '#3b82f6'}12`, color: post.category_color || '#3b82f6', fontWeight: 600 }}>{post.category || t('بدون تصنيف')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11} /> {new Date(post.published_at || post.created_at).toLocaleDateString('ar-SA')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} /> {(post.views || 0).toLocaleString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {post.read_time} {t('د')}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => handleTogglePublish(post.id)} title={post.is_published ? t('إلغاء النشر') : t('نشر')}
                  style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: post.is_published ? '#f0fdf4' : '#fef3c7', color: post.is_published ? '#16a34a' : '#92400e', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  {post.is_published ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => openEditForm(post)} title={t('تعديل')}
                  style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <Edit size={15} />
                </button>
                <button onClick={() => handleDelete(post.id)} title={t('حذف')}
                  style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </>
  );
}
