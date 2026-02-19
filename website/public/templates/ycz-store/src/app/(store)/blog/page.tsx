'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Eye, Tag, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import SeoHead from '@/components/seo/SeoHead';
import JsonLd from '@/components/seo/JsonLd';

// ─── بيانات المدونة الافتراضية ───
const BLOG_POSTS = [
  {
    id: 1,
    title: 'ما هو iCloud Lock؟ وكيف يمكن إزالته بأمان',
    titleEn: 'What is iCloud Lock? How to Remove It Safely',
    excerpt: 'تعرّف على قفل iCloud Activation Lock في أجهزة Apple، أسباب ظهوره، والطرق الآمنة والمعتمدة لإزالته من iPhone و iPad.',
    excerptEn: 'Learn about iCloud Activation Lock on Apple devices, why it appears, and safe, authorized methods to remove it from iPhone and iPad.',
    category: 'iCloud',
    categoryColor: '#3b82f6',
    date: '2026-02-15',
    readTime: 5,
    views: 1240,
    image: '🍎',
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
    id: 2,
    title: 'دليل فتح شبكة Samsung: كل ما تحتاج معرفته',
    titleEn: 'Samsung Network Unlock Guide: Everything You Need to Know',
    excerpt: 'دليل شامل لفتح شبكة أجهزة Samsung Galaxy من جميع الشبكات العالمية مثل AT&T و T-Mobile و Verizon وغيرها.',
    excerptEn: 'A comprehensive guide to unlocking Samsung Galaxy devices from all global carriers including AT&T, T-Mobile, Verizon and more.',
    category: 'فتح شبكات',
    categoryColor: '#8b5cf6',
    date: '2026-02-12',
    readTime: 7,
    views: 980,
    image: '📱',
    content: [
      'فتح الشبكة (Network Unlock) يعني إزالة القيد الذي تفرضه شركة الاتصالات على الهاتف، مما يتيح لك استخدام أي شريحة SIM من أي شركة.',
      'أجهزة Samsung Galaxy هي الأكثر طلباً لفتح الشبكة بسبب انتشارها الواسع عالمياً.',
      'نوفر فتح شبكة لجميع موديلات Samsung بما في ذلك Galaxy S24, S23, S22, A54, A34, Z Fold, Z Flip وغيرها.',
      'الشبكات المدعومة تشمل: AT&T, T-Mobile, Verizon, Sprint, Cricket, Metro, Boost Mobile, Claro, Movistar, Orange, Vodafone وعشرات غيرها.',
      'عملية فتح الشبكة بسيطة: أرسل لنا رقم IMEI الخاص بجهازك، وسنرسل لك كود الفتح خلال 1-72 ساعة حسب الشبكة.',
      'فتح الشبكة قانوني تماماً ولا يؤثر على ضمان الجهاز أو تحديثاته.',
    ],
  },
  {
    id: 3,
    title: 'أفضل أدوات السوفتوير لعام 2026: مقارنة شاملة',
    titleEn: 'Best Software Tools for 2026: Comprehensive Comparison',
    excerpt: 'مقارنة بين أشهر أدوات السوفتوير مثل Unlocktool و Z3X و Chimera و Octoplus و UMT — أيهم الأنسب لك؟',
    excerptEn: 'Comparison of popular software tools like Unlocktool, Z3X, Chimera, Octoplus, and UMT — which one is right for you?',
    category: 'أدوات سوفتوير',
    categoryColor: '#f59e0b',
    date: '2026-02-08',
    readTime: 10,
    views: 2150,
    image: '🔧',
    content: [
      'أدوات السوفتوير (Software Tools) هي برامج متخصصة يستخدمها فنيو الصيانة لفتح الشبكات، إزالة FRP، فلاش الأجهزة، وإصلاح مشاكل البرمجيات.',
      'فيما يلي مقارنة سريعة بين أشهر الأدوات:',
      '🔹 Unlocktool — الأداة الأكثر شمولاً، تدعم Samsung, Xiaomi, Oppo, Vivo, Huawei. سعر الاشتراك السنوي مناسب ودعم فني ممتاز.',
      '🔹 Z3X Samsung Tool Pro — متخصصة بأجهزة Samsung، الأقدم والأكثر استقراراً. تدعم فلاش وفتح شبكة وإزالة FRP.',
      '🔹 Chimera Tool — تدعم Samsung, LG, Huawei, HTC. واجهة سهلة الاستخدام.',
      '🔹 Octoplus — متعددة الاستخدامات، تدعم Samsung, LG, Sony, Huawei. تحتاج بوكس خاص.',
      '🔹 UMT (Ultimate Multi Tool) — أداة اقتصادية تدعم أجهزة كثيرة خاصة الصينية.',
      '🔹 EFT Pro — ممتازة لأجهزة Samsung و Huawei، سريعة التحديث.',
      'الاختيار يعتمد على نوع الأجهزة التي تعمل عليها أكثر وميزانيتك.',
    ],
  },
  {
    id: 4,
    title: 'كيف تحمي هاتفك من قفل FRP بعد إعادة الضبط',
    titleEn: 'How to Protect Your Phone from FRP Lock After Factory Reset',
    excerpt: 'شرح مفصل لقفل FRP (Factory Reset Protection) في أجهزة Android، كيف يعمل، وكيف تتجنب الوقوع فيه.',
    excerptEn: 'Detailed explanation of FRP (Factory Reset Protection) lock on Android devices, how it works, and how to avoid it.',
    category: 'FRP',
    categoryColor: '#ef4444',
    date: '2026-02-05',
    readTime: 4,
    views: 870,
    image: '🛡️',
    content: [
      'FRP (Factory Reset Protection) هو نظام حماية من Google يُفعّل تلقائياً على أجهزة Android عند ربط حساب Google بالجهاز.',
      'عند إعادة ضبط المصنع، يطلب الجهاز تسجيل الدخول بآخر حساب Google كان مربوطاً به.',
      'لتجنب الوقوع في مشكلة FRP:',
      '1. قبل بيع الجهاز: اذهب إلى الإعدادات > الحسابات > إزالة حساب Google',
      '2. ثم قم بإعادة ضبط المصنع من الإعدادات (وليس من Recovery Mode)',
      '3. احتفظ دائماً ببيانات حساب Google الخاص بك في مكان آمن',
      'إذا وقعت في مشكلة FRP، نوفر خدمة إزالة FRP لأجهزة Samsung, Xiaomi, Huawei, Oppo, Vivo وجميع الأجهزة الأخرى.',
    ],
  },
  {
    id: 5,
    title: 'فحص IMEI: لماذا هو مهم قبل شراء أي هاتف مستعمل',
    titleEn: 'IMEI Check: Why It\'s Important Before Buying Any Used Phone',
    excerpt: 'تعرّف على أهمية فحص رقم IMEI قبل شراء هاتف مستعمل — كيف تكشف الأجهزة المسروقة، المحظورة، أو المقفلة.',
    excerptEn: 'Learn the importance of checking IMEI before buying a used phone — how to detect stolen, blacklisted, or locked devices.',
    category: 'فحص IMEI',
    categoryColor: '#10b981',
    date: '2026-01-28',
    readTime: 3,
    views: 1560,
    image: '🔎',
    content: [
      'رقم IMEI (International Mobile Equipment Identity) هو رقم فريد مكون من 15 رقماً يُعطى لكل جهاز محمول في العالم.',
      'فحص IMEI قبل الشراء يكشف لك:',
      '✅ هل الجهاز مسروق أو مُبلّغ عنه (Blacklisted)',
      '✅ هل الجهاز مقفل على شبكة معينة (Carrier Locked)',
      '✅ هل قفل iCloud مُفعّل (لأجهزة Apple)',
      '✅ حالة الضمان ومعلومات الموديل',
      '✅ هل الجهاز أصلي أم مقلّد',
      'نوفر خدمة فحص IMEI شاملة تعطيك تقريراً كاملاً عن الجهاز خلال دقائق.',
      'للحصول على رقم IMEI: اطلب *#06# من لوحة الاتصال أو من الإعدادات > حول الهاتف.',
    ],
  },
  {
    id: 6,
    title: 'شحن ألعاب PUBG و Free Fire: دليل المبتدئين',
    titleEn: 'PUBG & Free Fire Top-up: Beginner\'s Guide',
    excerpt: 'كل ما تحتاج معرفته عن شحن UC لعبة PUBG و Diamonds لعبة Free Fire بأسعار مخفضة وطرق دفع متعددة.',
    excerptEn: 'Everything you need to know about topping up PUBG UC and Free Fire Diamonds at discounted prices with multiple payment methods.',
    category: 'شحن ألعاب',
    categoryColor: '#6366f1',
    date: '2026-01-20',
    readTime: 4,
    views: 3200,
    image: '🎮',
    content: [
      'شحن الألعاب أصبح من أكثر الخدمات طلباً في العالم العربي، خاصة للعبتي PUBG Mobile و Free Fire.',
      'نوفر شحن UC لـ PUBG Mobile بجميع الفئات:',
      '💰 60 UC — 325 UC — 660 UC — 1800 UC — 3850 UC — 8100 UC',
      'وكذلك شحن Diamonds لـ Free Fire بجميع الفئات المتاحة.',
      'طرق الدفع المتاحة: USDT, Binance Pay, PayPal, تحويل بنكي، وأكثر.',
      'الشحن فوري ويتم خلال 1-5 دقائق بعد تأكيد الدفع.',
      'كما نوفر بطاقات Google Play, PlayStation, Xbox, iTunes, وبطاقات Steam بأسعار تنافسية.',
    ],
  },
];

const CATEGORIES = ['الكل', 'iCloud', 'فتح شبكات', 'أدوات سوفتوير', 'FRP', 'فحص IMEI', 'شحن ألعاب'];

export default function BlogPage() {
  const { currentTheme, storeName, t, isRTL } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const filtered = selectedCategory === 'الكل'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === selectedCategory);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `مدونة ${storeName}`,
    description: 'مقالات ونصائح حول فتح الشبكات وإزالة iCloud وأدوات السوفتوير وشحن الألعاب',
    url: typeof window !== 'undefined' ? `${window.location.origin}/blog` : '/blog',
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { '@type': 'Organization', name: storeName },
    })),
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <SeoHead
        title="المدونة — مقالات ونصائح تقنية"
        description="مدونة متخصصة في شروحات فتح الشبكات، إزالة iCloud، أدوات السوفتوير مثل Unlocktool و Z3X و Chimera، إزالة FRP، فحص IMEI، وشحن ألعاب PUBG و Free Fire. نصائح تقنية ودلائل خطوة بخطوة."
        keywords="مدونة, مقالات تقنية, شرح iCloud, فتح شبكة Samsung, أدوات سوفتوير, FRP remove, فحص IMEI, شحن PUBG, شحن Free Fire, blog, tech articles, unlock guide"
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

      {/* Categories Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setExpandedPost(null); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 20,
              border: selectedCategory === cat ? 'none' : '1px solid #e2e8f0',
              background: selectedCategory === cat ? currentTheme.primary : '#fff',
              color: selectedCategory === cat ? '#fff' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {t(cat)}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(post => (
          <article
            key={post.id}
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #f1f5f9',
              overflow: 'hidden',
              transition: 'box-shadow 0.3s, transform 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'none';
            }}
            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
          >
            {/* Post Header */}
            <div style={{
              height: 120,
              background: `linear-gradient(135deg, ${post.categoryColor}15, ${post.categoryColor}08)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              position: 'relative',
            }}>
              <span>{post.image}</span>
              <span style={{
                position: 'absolute',
                top: 12,
                [isRTL ? 'left' : 'right']: 12,
                padding: '0.25rem 0.7rem',
                borderRadius: 12,
                background: post.categoryColor,
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}>
                {t(post.category)}
              </span>
            </div>

            {/* Post Body */}
            <div style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8, lineHeight: 1.6 }}>
                {t(isRTL ? post.title : post.titleEn)}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7, marginBottom: 12 }}>
                {t(isRTL ? post.excerpt : post.excerptEn)}
              </p>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.73rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} /> {new Date(post.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {post.readTime} {t('دقائق قراءة')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={13} /> {post.views.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedPost === post.id && (
              <div style={{
                padding: '0 1.25rem 1.25rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1.25rem',
                animation: 'fadeIn 0.3s ease',
              }}>
                {post.content.map((paragraph, i) => (
                  <p key={i} style={{
                    fontSize: '0.85rem',
                    color: '#334155',
                    lineHeight: 1.9,
                    marginBottom: 10,
                    ...(paragraph.startsWith('🔹') || paragraph.startsWith('✅') || paragraph.startsWith('💰')
                      ? { paddingRight: isRTL ? 8 : 0, paddingLeft: isRTL ? 0 : 8 }
                      : {}),
                  }}>
                    {paragraph}
                  </p>
                ))}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <Link
                    href="/services"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0.6rem 1.5rem',
                      borderRadius: 12,
                      background: currentTheme.primary,
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    {t('تصفّح خدماتنا')} {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </Link>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <BookOpen size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('لا توجد مقالات في هذا التصنيف')}</p>
        </div>
      )}

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginTop: '2rem',
        padding: '1.25rem',
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #f1f5f9',
        flexWrap: 'wrap',
      }}>
        {[
          { label: t('مقالات'), value: BLOG_POSTS.length, icon: '📝' },
          { label: t('تصنيفات'), value: CATEGORIES.length - 1, icon: '📂' },
          { label: t('إجمالي القراءات'), value: BLOG_POSTS.reduce((s, p) => s + p.views, 0).toLocaleString(), icon: '👁️' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
            <span style={{ fontSize: '1.3rem' }}>{stat.icon}</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', margin: '4px 0 2px' }}>{stat.value}</p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
