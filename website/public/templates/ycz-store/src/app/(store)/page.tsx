'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Shield, DollarSign, Headphones, ChevronDown } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { MOCK_PRODUCTS, STEPS_DATA, FAQ_DATA } from '@/lib/mockData';
import { storeApi } from '@/lib/api';
import type { Product } from '@/lib/types';

// ─── HeroBanner (Demo-style: contained, left-aligned, auto-rotate) ───
function HeroBanner() {
  const { currentTheme, showBanner, buttonRadius } = useTheme();
  const [active, setActive] = useState(0);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const banners = [
    { title: 'عروض حصرية 🔥', subtitle: 'خصم 30% على جميع الخدمات', desc: 'لفترة محدودة — لا تفوّت الفرصة!', gradient: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.accent} 100%)` },
    { title: 'أدوات احترافية ⚡', subtitle: 'Sigma Plus متوفر الآن', desc: 'أسرع أداة لفتح قفل الهواتف', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
    { title: 'شحن فوري 🎮', subtitle: 'PUBG Mobile UC', desc: 'شحن فوري لجميع الألعاب بأسعار منافسة', gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
  ];

  useEffect(() => {
    const i = setInterval(() => setActive(p => (p + 1) % banners.length), 4500);
    return () => clearInterval(i);
  }, [banners.length]);

  if (!showBanner) return null;
  const b = banners[active];

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: b.gradient, padding: '2rem 1.5rem', marginBottom: '1.5rem', transition: 'all 0.5s', minHeight: 150 }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: 4, color: '#fff' }}>{b.title}</p>
        <h2 className="store-hero-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{b.subtitle}</h2>
        <p style={{ fontSize: '0.82rem', opacity: 0.75, color: '#fff', marginBottom: 14 }}>{b.desc}</p>
        <button style={{ padding: '0.5rem 1.25rem', borderRadius: btnR, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          تسوق الآن
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
        {banners.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 24 : 8, height: 8, borderRadius: 4, background: i === active ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  );
}

// ─── ProductCard (Demo-style: simpler, emoji on gray bg, availability badge) ───
function ProductCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  const { currentTheme, buttonRadius } = useTheme();
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  return (
    <div onClick={onClick} className="store-product-card" style={{
      background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '1rem',
      cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: 8, height: 48, display: 'grid', placeItems: 'center', background: '#f8fafc', borderRadius: 10 }}>
        {product.icon}
      </div>
      <p style={{ fontSize: '0.7rem', color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{product.category}</p>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 8, lineHeight: 1.4 }}>{product.name}</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: currentTheme.primary }}>{product.price}</span>
          {product.originalPrice && <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', marginRight: 6 }}>{product.originalPrice}</span>}
        </div>
        <div style={{ padding: '0.35rem 0.75rem', borderRadius: btnR, background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700 }}>
          متاح
        </div>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ───
export default function HomePage() {
  const { currentTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await storeApi.getProducts();
        if (Array.isArray(res)) setProducts(res);
        else if (res?.products && Array.isArray(res.products)) setProducts(res.products);
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <HeroBanner />

      {/* المنتجات المميزة */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🔥 المنتجات المميزة</h3>
          <Link href="/services" style={{ background: 'none', border: 'none', color: currentTheme.primary, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>عرض الكل ←</Link>
        </div>
        <div className="store-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>جاري التحميل...</div>
          ) : (
            products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </section>

      {/* كيف تطلب */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', textAlign: 'center', marginBottom: '1.5rem' }}>كيف تطلب؟</h3>
        <div className="store-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {STEPS_DATA.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{step.icon}</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: currentTheme.primary, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 8px', fontSize: '0.8rem', fontWeight: 800 }}>{i + 1}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{step.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* لماذا نحن */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', textAlign: 'center', marginBottom: '1.5rem' }}>لماذا نحن؟</h3>
        <div className="store-about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: <Zap size={24} />, title: 'تنفيذ سريع', desc: 'طلباتك تُنفَّذ خلال دقائق', color: '#f59e0b' },
            { icon: <Shield size={24} />, title: 'حماية بياناتك', desc: 'تشفير SSL وحماية متقدمة', color: '#3b82f6' },
            { icon: <DollarSign size={24} />, title: 'أسعار منافسة', desc: 'أفضل أسعار في السوق', color: '#22c55e' },
            { icon: <Headphones size={24} />, title: 'دعم مستمر', desc: 'فريق دعم متاح على مدار الساعة', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                {item.icon}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{item.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
