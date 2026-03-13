'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { Calendar, Clock, Eye, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { storeApi } from '@/lib/api';
import SeoHead from '@/components/seo/SeoHead';
import JsonLd from '@/components/seo/JsonLd';
import type { BlogPost } from '@/lib/types';

// ─── بيانات افتراضية (تظهر فقط إذا لم تكن هناك مقالات من API) ───
const DEFAULT_POSTS: BlogPost[] = [
  {
    id: -1, title: 'ما هو iCloud Lock؟ وكيف يمكن إزالته بأمان',
    title_en: 'What is iCloud Lock? How to Remove It Safely',
    excerpt: 'تعرّف على قفل iCloud Activation Lock في أجهزة Apple، أسباب ظهوره، والطرق الآمنة والمعتمدة لإزالته من iPhone و iPad.',
    excerpt_en: 'Learn about iCloud Activation Lock on Apple devices, why it appears, and safe methods to remove it.',
    category: 'iCloud', category_color: '#3b82f6', published_at: '2026-02-15T00:00:00Z',
    read_time: 5, views: 1240, image: '🍎', is_published: true,
    created_at: '2026-02-15', updated_at: '2026-02-15',
    content: [
      'قفل iCloud Activation Lock هو ميزة أمان من Apple تمنع أي شخص من استخدام جهاز iPhone أو iPad بعد إعادة ضبطه بدون إدخال Apple ID الأصلي.',
      'يظهر هذا القفل عادةً عند شراء جهاز مستعمل لم يقم المالك السابق بتسجيل الخروج من حساب iCloud الخاص به.',
      'هناك عدة طرق معتمدة لإزالة قفل iCloud:',
      '1. التواصل مع المالك الأصلي لتسجيل الخروج عن بُعد عبر iCloud.com',
      '2. تقديم إثبات ملكية الجهاز لدعم Apple الرسمي',
      '3. استخدام خدمات إزالة iCloud المعتمدة مثل خدماتنا التي تعتمد على قاعدة بيانات Apple الرسمية',
      'نقدّم خدمة إزالة iCloud لجميع موديلات iPhone من iPhone 6 حتى iPhone 16 Pro Max، وكذلك iPad بجميع إصداراته.',
      'الخدمة آمنة 100% ولا تتطلب أي بيانات حساسة — فقط رقم IMEI أو السيريال نمبر.',
    ],
  },
  {
    id: -2, title: 'دليل فتح شبكة Samsung: كل ما تحتاج معرفته',
    title_en: 'Samsung Network Unlock Guide: Everything You Need to Know',
    excerpt: 'دليل شامل لفتح شبكة أجهزة Samsung Galaxy من جميع الشبكات العالمية مثل AT&T و T-Mobile و Verizon وغيرها.',
    excerpt_en: 'A comprehensive guide to unlocking Samsung Galaxy devices from all global carriers.',
    category: 'فتح شبكات', category_color: '#8b5cf6', published_at: '2026-02-12T00:00:00Z',
    read_time: 7, views: 980, image: '📱', is_published: true,
    created_at: '2026-02-12', updated_at: '2026-02-12',
    content: [
      'فتح الشبكة (Network Unlock) يعني إزالة القيد الذي تفرضه شركة الاتصالات على الهاتف.',
      'أجهزة Samsung Galaxy هي الأكثر طلباً لفتح الشبكة بسبب انتشارها الواسع عالمياً.',
      'نوفر فتح شبكة لجميع موديلات Samsung بما في ذلك Galaxy S24, S23, S22, A54, A34, Z Fold, Z Flip وغيرها.',
      'الشبكات المدعومة تشمل: AT&T, T-Mobile, Verizon, Sprint, Cricket, Metro, Boost Mobile, Claro, Movistar, Orange, Vodafone.',
      'عملية فتح الشبكة بسيطة: أرسل لنا رقم IMEI الخاص بجهازك، وسنرسل لك كود الفتح خلال 1-72 ساعة.',
      'فتح الشبكة قانوني تماماً ولا يؤثر على ضمان الجهاز أو تحديثاته.',
    ],
  },
  {
    id: -3, title: 'أفضل أدوات السوفتوير لعام 2026: مقارنة شاملة',
    title_en: 'Best Software Tools for 2026: Comprehensive Comparison',
    excerpt: 'مقارنة بين أشهر أدوات السوفتوير مثل Unlocktool و Z3X و Chimera و Octoplus و UMT — أيهم الأنسب لك؟',
    excerpt_en: 'Comparison of popular software tools like Unlocktool, Z3X, Chimera, Octoplus, and UMT.',
    category: 'أدوات سوفتوير', category_color: '#f59e0b', published_at: '2026-02-08T00:00:00Z',
    read_time: 10, views: 2150, image: '🔧', is_published: true,
    created_at: '2026-02-08', updated_at: '2026-02-08',
    content: [
      'أدوات السوفتوير هي برامج متخصصة يستخدمها فنيو الصيانة لفتح الشبكات وإزالة FRP وفلاش الأجهزة.',
      '🔹 Unlocktool — الأداة الأكثر شمولاً، تدعم Samsung, Xiaomi, Oppo, Vivo, Huawei.',
      '🔹 Z3X Samsung Tool Pro — متخصصة بأجهزة Samsung، الأقدم والأكثر استقراراً.',
      '🔹 Chimera Tool — تدعم Samsung, LG, Huawei, HTC. واجهة سهلة الاستخدام.',
      '🔹 Octoplus — متعددة الاستخدامات، تدعم Samsung, LG, Sony, Huawei.',
      '🔹 UMT (Ultimate Multi Tool) — أداة اقتصادية تدعم أجهزة كثيرة خاصة الصينية.',
      '🔹 EFT Pro — ممتازة لأجهزة Samsung و Huawei، سريعة التحديث.',
      'الاختيار يعتمد على نوع الأجهزة التي تعمل عليها أكثر وميزانيتك.',
    ],
  },
  {
    id: -4, title: 'كيف تحمي هاتفك من قفل FRP بعد إعادة الضبط',
    title_en: 'How to Protect Your Phone from FRP Lock After Factory Reset',
    excerpt: 'شرح مفصل لقفل FRP في أجهزة Android، كيف يعمل، وكيف تتجنب الوقوع فيه.',
    excerpt_en: 'Detailed explanation of FRP lock on Android devices and how to avoid it.',
    category: 'FRP', category_color: '#ef4444', published_at: '2026-02-05T00:00:00Z',
    read_time: 4, views: 870, image: '🛡️', is_published: true,
    created_at: '2026-02-05', updated_at: '2026-02-05',
    content: [
      'FRP (Factory Reset Protection) هو نظام حماية من Google يُفعّل تلقائياً على أجهزة Android.',
      'عند إعادة ضبط المصنع، يطلب الجهاز تسجيل الدخول بآخر حساب Google كان مربوطاً به.',
      'لتجنب مشكلة FRP: أزل حساب Google قبل إعادة الضبط.',
      'إذا وقعت في مشكلة FRP، نوفر خدمة إزالة FRP لجميع أجهزة Android.',
    ],
  },
  {
    id: -5, title: 'فحص IMEI: لماذا هو مهم قبل شراء أي هاتف مستعمل',
    title_en: 'IMEI Check: Why It\'s Important Before Buying Any Used Phone',
    excerpt: 'تعرّف على أهمية فحص رقم IMEI قبل شراء هاتف مستعمل — كيف تكشف الأجهزة المسروقة أو المقفلة.',
    excerpt_en: 'Learn the importance of checking IMEI before buying a used phone.',
    category: 'فحص IMEI', category_color: '#10b981', published_at: '2026-01-28T00:00:00Z',
    read_time: 3, views: 1560, image: '🔎', is_published: true,
    created_at: '2026-01-28', updated_at: '2026-01-28',
    content: [
      'رقم IMEI هو رقم فريد مكون من 15 رقماً يُعطى لكل جهاز محمول.',
      '✅ هل الجهاز مسروق أو مُبلّغ عنه (Blacklisted)',
      '✅ هل الجهاز مقفل على شبكة معينة (Carrier Locked)',
      '✅ هل قفل iCloud مُفعّل (لأجهزة Apple)',
      '✅ حالة الضمان ومعلومات الموديل',
      'نوفر خدمة فحص IMEI شاملة تعطيك تقريراً كاملاً خلال دقائق.',
    ],
  },
  {
    id: -6, title: 'شحن ألعاب PUBG و Free Fire: دليل المبتدئين',
    title_en: 'PUBG & Free Fire Top-up: Beginner\'s Guide',
    excerpt: 'كل ما تحتاج معرفته عن شحن UC لعبة PUBG و Diamonds لعبة Free Fire بأسعار مخفضة.',
    excerpt_en: 'Everything you need to know about topping up PUBG UC and Free Fire Diamonds.',
    category: 'شحن ألعاب', category_color: '#6366f1', published_at: '2026-01-20T00:00:00Z',
    read_time: 4, views: 3200, image: '🎮', is_published: true,
    created_at: '2026-01-20', updated_at: '2026-01-20',
    content: [
      'شحن الألعاب أصبح من أكثر الخدمات طلباً في العالم العربي.',
      '💰 PUBG UC: 60 — 325 — 660 — 1800 — 3850 — 8100 UC',
      'وكذلك شحن Diamonds لـ Free Fire بجميع الفئات.',
      'الشحن فوري ويتم خلال 1-5 دقائق بعد تأكيد الدفع.',
      'كما نوفر بطاقات Google Play, PlayStation, Xbox, iTunes, وبطاقات Steam.',
    ],
  },
];

export default function BlogPage() {
  const { currentTheme, storeName, t, isRTL } = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    try {
      const res = await storeApi.getBlogPosts();
      const apiPosts = (res as { posts?: BlogPost[] })?.posts || [];
      setPosts(apiPosts.length > 0 ? apiPosts : DEFAULT_POSTS);
    } catch {
      setPosts(DEFAULT_POSTS);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['الكل', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  const filtered = selectedCategory === 'الكل' ? posts : posts.filter(p => p.category === selectedCategory);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${t('المدونة')} — ${storeName}`,
    description: t('مقالات ونصائح تقنية في عالم الهواتف والبرمجيات'),
    url: typeof window !== 'undefined' ? `${window.location.origin}/blog` : '/blog',
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting', headline: post.title, description: post.excerpt,
      datePublished: post.published_at, author: { '@type': 'Organization', name: storeName },
    })),
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <SeoHead
        title={t('المدونة') + ' — ' + t('مقالات ونصائح تقنية في عالم الهواتف والبرمجيات')}
        description={t('مقالات ونصائح تقنية في عالم الهواتف والبرمجيات')}
        keywords="blog, tech articles, iCloud, Samsung unlock, software tools, FRP, IMEI check, PUBG top-up"
        canonical="/blog"
      />
      <JsonLd data={blogJsonLd} />

      {/* Banner */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent || currentTheme.secondary})`,
        padding: '2.5rem 2rem', marginBottom: '1.5rem', textAlign: 'center', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BookOpen size={36} color="#fff" style={{ marginBottom: 10, opacity: 0.9 }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('المدونة')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto' }}>
            {t('مقالات ونصائح تقنية في عالم الهواتف والبرمجيات')}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => { setSelectedCategory(cat); setExpandedPost(null); }}
            style={{
              padding: '0.45rem 1rem', borderRadius: 20,
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-default)',
              background: selectedCategory === cat ? currentTheme.primary : 'var(--bg-card)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
            }}>{t(cat)}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)', overflow: 'hidden' }}>
              <div style={{ height: 120, background: 'var(--bg-muted)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ height: 16, background: 'var(--bg-muted)', borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 12, background: 'var(--bg-subtle)', borderRadius: 6, width: '70%', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(post => (
            <article key={post.id}
              style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)', overflow: 'hidden', transition: 'box-shadow 0.3s, transform 0.3s', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
            >
              <div style={{ height: 120, background: `linear-gradient(135deg, ${post.category_color}15, ${post.category_color}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', position: 'relative' }}>
                <span>{post.image}</span>
                <span style={{ position: 'absolute', top: 12, [isRTL ? 'left' : 'right']: 12, padding: '0.25rem 0.7rem', borderRadius: 12, background: post.category_color, color: '#fff', fontSize: '0.7rem', fontWeight: 600 }}>{t(post.category)}</span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.6 }}>{t(isRTL ? post.title : (post.title_en || post.title))}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{t(isRTL ? post.excerpt : (post.excerpt_en || post.excerpt))}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {new Date(post.published_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {post.read_time} {t('دقائق قراءة')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} /> {(post.views || 0).toLocaleString()}</span>
                </div>
              </div>
              {expandedPost === post.id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                  {(Array.isArray(post.content) ? post.content : []).map((paragraph, i) => (
                    <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.9, marginBottom: 10 }}>{paragraph}</p>
                  ))}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.5rem', borderRadius: 12, background: currentTheme.primary, color: '#fff', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                      {t('تصفّح خدماتنا')} {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </Link>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('لا توجد مقالات في هذا التصنيف')}</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
          {[
            { label: t('مقالات'), value: posts.length, icon: '📝' },
            { label: t('تصنيفات'), value: categories.length - 1, icon: '📂' },
            { label: t('إجمالي القراءات'), value: posts.reduce((s, p) => s + (p.views || 0), 0).toLocaleString(), icon: '👁️' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <span style={{ fontSize: '1.3rem' }}>{stat.icon}</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px' }}>{stat.value}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
