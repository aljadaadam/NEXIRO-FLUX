'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { MOCK_PRODUCTS, STEPS_DATA, FAQ_DATA } from '@/lib/mockData';

// ─── HeroBanner ───
function HeroBanner() {
  const { currentTheme, showBanner, buttonRadius } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: 'خدمات فتح الشبكات', subtitle: 'أسرع خدمة فتح شبكات لجميع الأجهزة', badge: '🔥 عرض خاص', discount: 'خصم 30%' },
    { title: 'شحن ألعاب فوري', subtitle: 'شحن PUBG و FreeFire وغيرها بأفضل الأسعار', badge: '⚡ فوري', discount: 'أسعار منافسة' },
    { title: 'فحص IMEI احترافي', subtitle: 'تقارير دقيقة وموثوقة لجميع الأجهزة', badge: '✅ موثوق', discount: 'من $2 فقط' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!showBanner) return null;

  const slide = slides[currentSlide];
  const radius = buttonRadius === 'sharp' ? '6px' : buttonRadius === 'pill' ? '50px' : '12px';

  return (
    <div style={{
      background: currentTheme.gradient,
      padding: '3.5rem 1.5rem',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08,
        backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0.35rem 1rem', borderRadius: 50,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          color: '#fff', fontSize: '0.78rem', fontWeight: 700, marginBottom: 16,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          {slide.badge} — {slide.discount}
        </span>
        <h1 className="store-hero-title" style={{
          fontSize: '2.2rem', fontWeight: 900, color: '#fff',
          marginBottom: 12, lineHeight: 1.3,
        }}>
          {slide.title}
        </h1>
        <p className="store-hero-subtitle" style={{
          fontSize: '1rem', color: 'rgba(255,255,255,0.85)',
          marginBottom: 24, lineHeight: 1.6,
        }}>
          {slide.subtitle}
        </p>
        <div className="store-hero-buttons" style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Link href="/services" style={{
            padding: '0.75rem 2rem', borderRadius: radius,
            background: '#fff', color: currentTheme.primary,
            fontSize: '0.9rem', fontWeight: 800, display: 'inline-flex',
            alignItems: 'center', gap: 8,
          }}>
            <ShoppingBag size={18} /> تسوّق الآن
          </Link>
          <Link href="/support" style={{
            padding: '0.75rem 2rem', borderRadius: radius,
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            fontSize: '0.9rem', fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            تواصل معنا
          </Link>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{
              width: currentSlide === i ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none',
              background: currentSlide === i ? '#fff' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ProductCard ───
function ProductCard({ product }: { product: typeof MOCK_PRODUCTS[0] }) {
  const { currentTheme, buttonRadius } = useTheme();
  const radius = buttonRadius === 'sharp' ? '6px' : buttonRadius === 'pill' ? '50px' : '10px';

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: '1px solid #f1f5f9', transition: 'all 0.3s',
      cursor: 'pointer', position: 'relative',
    }}>
      {product.badge && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          padding: '0.2rem 0.65rem', borderRadius: 8,
          background: product.badgeColor || currentTheme.primary,
          color: '#fff', fontSize: '0.65rem', fontWeight: 800, zIndex: 2,
        }}>
          {product.badge}
        </span>
      )}
      <div style={{
        height: 100, background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.secondary}15)`,
        display: 'grid', placeItems: 'center',
      }}>
        <span style={{ fontSize: '2.5rem' }}>{product.icon}</span>
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 4, lineHeight: 1.4 }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 8 }}>{product.category}</p>
        {product.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>{product.rating}</span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>({product.sales})</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: currentTheme.primary }}>{product.price}</span>
            {product.originalPrice && (
              <span style={{
                fontSize: '0.72rem', color: '#94a3b8',
                textDecoration: 'line-through', marginRight: 6,
              }}>{product.originalPrice}</span>
            )}
          </div>
          <button style={{
            padding: '0.4rem 0.85rem', borderRadius: radius,
            background: currentTheme.gradient, color: '#fff',
            border: 'none', fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}>
            اطلب الآن
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ───
export default function HomePage() {
  const { currentTheme } = useTheme();

  return (
    <>
      <HeroBanner />

      {/* المنتجات المميزة */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', marginBottom: 4 }}>
              <Sparkles size={20} style={{ verticalAlign: 'middle', marginLeft: 6 }} color={currentTheme.primary} />
              المنتجات المميزة
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>أفضل خدماتنا وأكثرها طلباً</p>
          </div>
          <Link href="/services" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.82rem', fontWeight: 700, color: currentTheme.primary,
          }}>
            عرض الكل <ChevronLeft size={16} />
          </Link>
        </div>

        <div className="store-products-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16,
        }}>
          {MOCK_PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* خطوات الطلب */}
      <section style={{ background: '#fff', padding: '3rem 1.5rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', textAlign: 'center', marginBottom: 8 }}>
            كيف تطلب؟
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', marginBottom: 32 }}>
            خطوات بسيطة للحصول على خدمتك
          </p>
          <div className="store-steps-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }}>
            {STEPS_DATA.map((step, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '1.5rem 1rem',
                borderRadius: 16, background: '#f8fafc',
                border: '1px solid #f1f5f9',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${currentTheme.primary}12`,
                  display: 'grid', placeItems: 'center',
                  margin: '0 auto 12px', fontSize: '1.5rem',
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1020', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* لماذا نحن */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', textAlign: 'center', marginBottom: 32 }}>
          لماذا تختارنا؟
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: Zap, title: 'سرعة التنفيذ', desc: 'معظم الخدمات تُنفّذ خلال دقائق', color: '#7c5cff' },
            { icon: Shield, title: 'أمان مضمون', desc: 'بوابات دفع آمنة ومشفرة', color: '#22c55e' },
            { icon: Clock, title: 'دعم متواصل', desc: 'فريق الدعم متاح 24/7', color: '#0ea5e9' },
            { icon: Star, title: 'جودة عالية', desc: 'تقييم 4.8 من أكثر من 1000 عميل', color: '#f59e0b' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '2rem 1.25rem',
                borderRadius: 16, background: '#fff',
                border: '1px solid #f1f5f9',
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${item.color}12`,
                  display: 'grid', placeItems: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Icon size={22} color={item.color} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1020', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section style={{ background: '#fff', padding: '2.5rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', textAlign: 'center', marginBottom: 24 }}>
            أسئلة شائعة
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_DATA.map((faq, i) => (
              <div key={i} style={{
                padding: '1rem 1.25rem', borderRadius: 12,
                background: '#f8fafc', border: '1px solid #f1f5f9',
              }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 6 }}>{faq.q}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
