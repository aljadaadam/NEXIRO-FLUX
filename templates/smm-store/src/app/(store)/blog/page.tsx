'use client';

import { useState, useEffect } from 'react';
import { storeApi } from '@/lib/api';
import { useTheme } from '@/providers/ThemeProvider';
import type { BlogPost } from '@/lib/types';
import { Clock, Eye, ArrowRight, Tag, BookOpen } from 'lucide-react';

export default function BlogPage() {
  const { currentTheme, darkMode, t, isRTL } = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await storeApi.getBlogPosts();
        setPosts(Array.isArray(data) ? data : data?.posts || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (selectedPost) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <button
          onClick={() => setSelectedPost(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: currentTheme.primary,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 24,
          }}
        >
          <ArrowRight size={16} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
          {t('العودة للمدونة')}
        </button>

        {selectedPost.image && (
          <div style={{
            height: 300, borderRadius: 20, overflow: 'hidden', marginBottom: 24,
            background: `url(${selectedPost.image}) center/cover`,
          }} />
        )}

        <div style={{ marginBottom: 16 }}>
          {selectedPost.category && (
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: `${currentTheme.primary}15`, color: currentTheme.primary,
            }}>
              <Tag size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              {selectedPost.category}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: text, marginBottom: 16, lineHeight: 1.4 }}>
          {isRTL ? selectedPost.title : (selectedPost.title_en || selectedPost.title)}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, color: subtext, fontSize: 13 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} /> {selectedPost.read_time || 5} {t('دقائق قراءة')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={14} /> {selectedPost.views || 0} {t('مشاهدة')}
          </span>
          <span>{selectedPost.published_at ? new Date(selectedPost.published_at).toLocaleDateString(isRTL ? 'ar' : 'en') : ''}</span>
        </div>

        <div style={{ lineHeight: 1.9, fontSize: 16, color: text }}>
          {(Array.isArray(selectedPost.content) ? selectedPost.content : [String(selectedPost.content)]).map((para, i) => (
            <p key={i} style={{ marginBottom: 16 }}>{para}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 20, marginBottom: 16,
          background: `${currentTheme.primary}12`, color: currentTheme.primary,
          fontSize: 13, fontWeight: 700,
        }}>
          <BookOpen size={16} /> {t('المدونة')}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: text, marginBottom: 12 }}>
          {t('آخر المقالات والأخبار')}
        </h1>
        <p style={{ fontSize: 16, color: subtext, maxWidth: 500, margin: '0 auto' }}>
          {t('تابع أحدث الأخبار والنصائح حول خدمات السوشل ميديا')}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 320, borderRadius: 20,
              background: `linear-gradient(90deg, ${cardBg}, ${darkMode ? '#1e2642' : '#f1f5f9'}, ${cardBg})`,
              backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          background: cardBg, borderRadius: 20, border: `1px solid ${border}`,
          padding: 80, textAlign: 'center',
        }}>
          <BookOpen size={40} style={{ margin: '0 auto 16px', color: subtext, opacity: 0.3 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: text, marginBottom: 8 }}>{t('لا توجد مقالات بعد')}</h3>
          <p style={{ color: subtext }}>{t('ترقبوا المقالات القادمة')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
          {posts.filter(p => p.is_published).map(post => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              style={{
                background: cardBg, borderRadius: 20,
                border: `1px solid ${border}`,
                overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${currentTheme.primary}15`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {post.image && (
                <div style={{
                  height: 180, background: `url(${post.image}) center/cover`,
                  position: 'relative',
                }}>
                  {post.category && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)',
                    }}>
                      {post.category}
                    </span>
                  )}
                </div>
              )}
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: text, marginBottom: 8, lineHeight: 1.4 }}>
                  {isRTL ? post.title : (post.title_en || post.title)}
                </h3>
                <p style={{ fontSize: 13, color: subtext, lineHeight: 1.6, marginBottom: 14 }}>
                  {isRTL ? post.excerpt : (post.excerpt_en || post.excerpt)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: subtext }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={12} /> {post.read_time || 5} {t('د')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Eye size={12} /> {post.views || 0}
                    </span>
                  </div>
                  <span style={{ color: currentTheme.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t('اقرأ المزيد')} <ArrowRight size={12} style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
