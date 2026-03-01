'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import {
  Zap, TrendingUp, Shield, Clock, Star, ChevronLeft, ChevronRight,
  Users, Eye, Heart, MessageSquare, ArrowRight, ArrowLeft,
  Sparkles, Award, Rocket, Globe, CheckCircle, Play,
  Wallet, Layers
} from 'lucide-react';

type ProductItem = Record<string, unknown>;

// ─── Platform data for the floating icons ───
const PLATFORMS = [
  { name: 'Instagram', icon: '📸', gradient: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)', color: '#E1306C' },
  { name: 'TikTok', icon: '🎵', gradient: 'linear-gradient(135deg, #010101, #69C9D0)', color: '#69C9D0' },
  { name: 'YouTube', icon: '▶️', gradient: 'linear-gradient(135deg, #FF0000, #cc0000)', color: '#FF0000' },
  { name: 'Twitter', icon: '🐦', gradient: 'linear-gradient(135deg, #1DA1F2, #0d8ecf)', color: '#1DA1F2' },
  { name: 'Facebook', icon: '👤', gradient: 'linear-gradient(135deg, #1877F2, #0d5bbf)', color: '#1877F2' },
  { name: 'Telegram', icon: '✈️', gradient: 'linear-gradient(135deg, #0088cc, #006699)', color: '#0088cc' },
  { name: 'Snapchat', icon: '👻', gradient: 'linear-gradient(135deg, #FFFC00, #e6e300)', color: '#FFFC00' },
  { name: 'LinkedIn', icon: '💼', gradient: 'linear-gradient(135deg, #0A66C2, #084d94)', color: '#0A66C2' },
];

export default function HomePage() {
  const { currentTheme, darkMode, isRTL, t, showBanner, language } = useTheme();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    storeApi.getProducts().then(data => {
      setProducts(data as ProductItem[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [loading]);

  const featuredProducts = products.filter(p => p.is_featured);
  const categories = [...new Set(products.map(p => String(p.category || '')))].filter(Boolean);
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO SECTION — Epic Neon Cyber
          ═══════════════════════════════════════════ */}
      <section className="store-hero-section" style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '40px 20px',
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: darkMode
            ? `radial-gradient(ellipse 80% 70% at 50% 20%, ${currentTheme.primary}15, transparent 70%),
               radial-gradient(ellipse 60% 50% at 80% 80%, ${currentTheme.accent}10, transparent 60%),
               radial-gradient(ellipse 40% 30% at 20% 60%, ${currentTheme.secondary}08, transparent 40%)`
            : `radial-gradient(ellipse 80% 70% at 50% 20%, ${currentTheme.primary}08, transparent 70%)`,
        }} />

        {/* Animated orbs */}
        {darkMode && (
          <>
            <div className="morph-blob" style={{
              position: 'absolute', width: 400, height: 400,
              top: '-10%', right: '-5%',
              background: `radial-gradient(circle, ${currentTheme.primary}12, transparent 70%)`,
              filter: 'blur(40px)',
            }} />
            <div className="morph-blob" style={{
              position: 'absolute', width: 300, height: 300,
              bottom: '10%', left: '-5%',
              background: `radial-gradient(circle, ${currentTheme.accent}10, transparent 70%)`,
              filter: 'blur(40px)',
              animationDelay: '-3s',
            }} />
          </>
        )}

        <div className="store-hero-grid" style={{
          maxWidth: 1280, margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
          position: 'relative', zIndex: 2,
        }}>
          {/* Text Content */}
          <div className="store-hero-text" style={{ order: isRTL ? 2 : 1 }}>
            {/* Badge */}
            <div className="animate-in" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 50,
              background: darkMode ? `${currentTheme.primary}15` : `${currentTheme.primary}10`,
              border: `1px solid ${currentTheme.primary}30`,
              marginBottom: 24,
            }}>
              <Sparkles size={16} style={{ color: currentTheme.primary }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: currentTheme.primary }}>
                {t('خدمات سوشال ميديا')} #1
              </span>
            </div>

            <h1 className="store-hero-title animate-in animate-delay-1" style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}>
              {t('عزز حضورك على السوشال ميديا')}
              <span style={{
                display: 'block',
                background: currentTheme.gradient,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginTop: 4,
              }}>
                🚀
              </span>
            </h1>

            <p className="store-hero-subtitle animate-in animate-delay-2" style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              maxWidth: 500,
              marginBottom: 32,
            }}>
              {t('احصل على متابعين، لايكات، مشاهدات وتعليقات حقيقية لجميع منصات التواصل الاجتماعي بأسعار تنافسية وتسليم فوري')}
            </p>

            {/* CTA Buttons */}
            <div className="store-hero-buttons animate-in animate-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="/services" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 32px', borderRadius: 16,
                background: currentTheme.gradient,
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: `0 8px 30px ${currentTheme.primary}40`,
                transition: 'all 0.3s ease',
              }}>
                <Rocket size={20} />
                {t('ابدأ الآن')}
              </a>
              <a href="/services" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 32px', borderRadius: 16,
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}>
                <Play size={18} />
                {t('تصفح الخدمات')}
              </a>
            </div>

            {/* Quick Stats */}
            <div className="animate-in animate-delay-4 store-hero-stats" style={{
              display: 'flex', gap: 30, marginTop: 40,
              flexWrap: 'wrap',
            }}>
              {[
                { value: '50K+', label: t('طلب مكتمل') },
                { value: '10K+', label: t('عميل راضٍ') },
                { value: '10+', label: t('منصة مدعومة') },
              ].map((stat, i) => (
                <div key={i}>
                  <p style={{
                    fontSize: '1.6rem', fontWeight: 900,
                    background: currentTheme.gradient,
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Platform Icons Grid */}
          <div className="store-hero-platforms" style={{ order: isRTL ? 1 : 2, position: 'relative', minHeight: 400 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
              maxWidth: 320, margin: '0 auto',
            }}>
              {PLATFORMS.map((platform, i) => (
                <div
                  key={platform.name}
                  className="float-animation"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${3 + i * 0.5}s`,
                  }}
                >
                  <div style={{
                    width: 85, height: 85, borderRadius: 22,
                    background: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#fff',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 6,
                    backdropFilter: 'blur(10px)',
                    boxShadow: darkMode ? `0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${platform.color}15` : '0 4px 20px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: '2rem' }}>{platform.icon}</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)' }}>{platform.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Center glow effect */}
            {darkMode && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 200, height: 200,
                background: `radial-gradient(circle, ${currentTheme.primary}15, transparent 70%)`,
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{
          position: 'absolute', bottom: -2, left: 0, right: 0,
          height: 80,
          background: darkMode
            ? 'linear-gradient(transparent, #050a18)'
            : 'linear-gradient(transparent, #f0f4f8)',
        }} />
      </section>

      {/* ═══════════════════════════════════════════
          PLATFORMS BAR — Scrolling
          ═══════════════════════════════════════════ */}
      <section id="platforms-bar" data-reveal style={{
        padding: '30px 20px',
        opacity: visibleSections.has('platforms-bar') ? 1 : 0,
        transform: visibleSections.has('platforms-bar') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="store-platforms-bar" style={{
            display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            {PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={`/services?platform=${platform.name.toLowerCase()}`}
                className="neon-card card-shine"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 14,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{platform.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{platform.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED SERVICES
          ═══════════════════════════════════════════ */}
      <section id="featured" data-reveal style={{
        padding: '60px 20px',
        opacity: visibleSections.has('featured') ? 1 : 0,
        transform: visibleSections.has('featured') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="store-section-title" style={{
              fontSize: '2rem', fontWeight: 900,
              marginBottom: 12,
            }}>
              <span style={{
                background: currentTheme.gradient,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                ⭐ {t('الأكثر مبيعاً')}
              </span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {t('أفضل خدماتنا وأكثرها طلباً')}
            </p>
          </div>

          {loading ? (
            <div className="store-products-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 20 }} />
              ))}
            </div>
          ) : (
            <div className="store-products-grid">
              {(featuredProducts.length > 0 ? featuredProducts : products).slice(0, 6).map((product, index) => (
                <ServiceCard key={String(product.id)} product={product} index={index} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <a href="/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 14,
              background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              color: currentTheme.primary, fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', transition: 'all 0.3s ease',
            }}>
              {t('عرض الكل')}
              <ArrowIcon size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW TO ORDER — Steps
          ═══════════════════════════════════════════ */}
      <section id="steps" data-reveal style={{
        padding: '80px 20px',
        opacity: visibleSections.has('steps') ? 1 : 0,
        transform: visibleSections.has('steps') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 className="store-section-title" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
              <span style={{
                background: currentTheme.gradient,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {t('كيف تطلب؟')}
              </span>
            </h2>
          </div>

          <div className="store-steps-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }}>
            {[
              { icon: <Layers size={28} />, title: t('اختر الخدمة'), desc: t('اختر المنصة والخدمة المناسبة'), num: '01' },
              { icon: <Globe size={28} />, title: t('أدخل البيانات'), desc: t('أدخل رابط حسابك والكمية المطلوبة'), num: '02' },
              { icon: <Wallet size={28} />, title: t('ادفع وانتظر'), desc: t('أتم الدفع وسيبدأ التسليم فوراً'), num: '03' },
              { icon: <CheckCircle size={28} />, title: t('استلم النتائج'), desc: t('شاهد النتائج تظهر على حسابك'), num: '04' },
            ].map((step, i) => (
              <div key={i} className="neon-card card-shine" style={{
                padding: 24, textAlign: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 12, [isRTL ? 'left' : 'right']: 12,
                  fontSize: '2.5rem', fontWeight: 900,
                  color: currentTheme.primary, opacity: 0.1,
                  lineHeight: 1,
                }}>
                  {step.num}
                </div>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${currentTheme.primary}15`,
                  display: 'grid', placeItems: 'center',
                  color: currentTheme.primary,
                  margin: '0 auto 16px',
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE US
          ═══════════════════════════════════════════ */}
      <section id="why-us" data-reveal style={{
        padding: '80px 20px',
        opacity: visibleSections.has('why-us') ? 1 : 0,
        transform: visibleSections.has('why-us') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 className="store-section-title" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
              <span style={{
                background: currentTheme.gradient,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {t('لماذا تختارنا؟')}
              </span>
            </h2>
          </div>

          <div className="store-about-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }}>
            {[
              { icon: <Zap size={24} />, title: t('تسليم سريع وفوري'), desc: t('يبدأ التسليم فور تأكيد الطلب'), color: '#f59e0b' },
              { icon: <Shield size={24} />, title: t('ضمان الجودة'), desc: t('نضمن جودة جميع خدماتنا'), color: '#22c55e' },
              { icon: <TrendingUp size={24} />, title: t('أسعار لا تُقاوم'), desc: t('نقدم أفضل الأسعار في السوق مع جودة عالية'), color: '#3b82f6' },
              { icon: <Users size={24} />, title: t('حسابات حقيقية'), desc: t('جميع المتابعين والتفاعلات من حسابات حقيقية'), color: '#ec4899' },
              { icon: <Clock size={24} />, title: t('دعم فني متواصل'), desc: t('فريق الدعم متاح على مدار الساعة'), color: '#8b5cf6' },
              { icon: <Award size={24} />, title: t('طرق دفع متعددة'), desc: t('ندعم العديد من طرق الدفع لراحتك'), color: '#06b6d4' },
            ].map((item, i) => (
              <div key={i} className="neon-card card-shine" style={{ padding: 28 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${item.color}15`,
                  display: 'grid', placeItems: 'center',
                  color: item.color,
                  marginBottom: 16,
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════ */}
      <section id="cta" data-reveal style={{
        padding: '0 20px 80px',
        opacity: visibleSections.has('cta') ? 1 : 0,
        transform: visibleSections.has('cta') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
      }}>
        <div className="store-cta-banner" style={{
          maxWidth: 900, margin: '0 auto',
          padding: '50px 40px',
          borderRadius: 24,
          background: currentTheme.gradient,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1), transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1), transparent 40%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              {t('عزز حضورك على السوشال ميديا')} 🚀
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
              {t('احصل على متابعين، لايكات، مشاهدات وتعليقات حقيقية لجميع منصات التواصل الاجتماعي بأسعار تنافسية وتسليم فوري')}
            </p>
            <a href="/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 36px', borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
            }}>
              {t('ابدأ الآن')}
              <ArrowIcon size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Service Card Component ───
function ServiceCard({ product, index }: { product: ProductItem; index: number }) {
  const { currentTheme, darkMode, isRTL, t } = useTheme();

  const platformColorMap: Record<string, string> = {
    'انستغرام': '#E1306C', 'instagram': '#E1306C',
    'تيك توك': '#69C9D0', 'tiktok': '#69C9D0',
    'يوتيوب': '#FF0000', 'youtube': '#FF0000',
    'تويتر': '#1DA1F2', 'twitter': '#1DA1F2',
    'فيسبوك': '#1877F2', 'facebook': '#1877F2',
    'تلغرام': '#0088cc', 'telegram': '#0088cc',
    'سناب شات': '#FFFC00', 'snapchat': '#FFFC00',
    'لينكد إن': '#0A66C2', 'linkedin': '#0A66C2',
  };

  const category = String(product.category || '');
  const platformColor = platformColorMap[category.toLowerCase()] || platformColorMap[category] || currentTheme.primary;

  return (
    <div
      className="neon-card card-shine"
      style={{
        padding: 0,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Platform color strip */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${platformColor}, ${platformColor}80)`,
      }} />

      <div style={{ padding: '20px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${platformColor}15`,
            display: 'grid', placeItems: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
          }}>
            {String(product.icon || '🌐')}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: '0.9rem', fontWeight: 700,
              color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {String(product.name || '')}
            </h3>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: platformColor, opacity: 0.8,
            }}>
              {category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.78rem', color: 'var(--text-muted)',
          lineHeight: 1.5, marginBottom: 16,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
        }}>
          {String(product.desc || '')}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              fontSize: '1.2rem', fontWeight: 900,
              background: currentTheme.gradient,
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {String(product.price || '')}
            </span>
            {product.originalPrice ? (
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textDecoration: 'line-through',
                marginInlineStart: 8,
              }}>
                {String(product.originalPrice)}
              </span>
            ) : null}
          </div>

          <a href="/services" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '8px 14px', borderRadius: 10,
            background: `${currentTheme.primary}15`,
            color: currentTheme.primary,
            fontWeight: 700, fontSize: '0.75rem',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}>
            {t('اطلب الآن')}
          </a>
        </div>

        {/* Sales badge */}
        {Number(product.sales) > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 12, paddingTop: 12,
            borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
          }}>
            <Star size={12} style={{ color: '#f59e0b' }} fill="#f59e0b" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {Number(product.sales).toLocaleString()} {t('طلب مكتمل')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


