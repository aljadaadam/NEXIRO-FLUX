'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { hxStoreApi, hxMapBackendProduct } from '@/lib/hxApi';
import { HxProduct } from '@/lib/hxTypes';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, ArrowLeft, ArrowRight, Truck, Shield, Headphones, DollarSign, Package, Zap, Wrench, Cpu } from 'lucide-react';

export default function HxHomePage() {
  const { currentTheme, darkMode, t, isRTL, formatPrice, addToCart, showBanner, buttonRadius } = useHxTheme();
  const [products, setProducts] = useState<HxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<HxProduct | null>(null);
  const [qty, setQty] = useState(1);
  const [addedId, setAddedId] = useState<number | null>(null);

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';

  const banners = [
    { id: '1', title: t('أحدث أدوات الصيانة'), subtitle: t('اكتشف مجموعتنا الجديدة من البوكسات والدونجلات الاحترافية'), icon: '🔧', gradient: currentTheme.gradient },
    { id: '2', title: t('عروض خاصة على JTAG'), subtitle: t('خصم يصل إلى 20% على أدوات JTAG'), icon: '⚡', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
    { id: '3', title: t('توصيل لجميع الدول'), subtitle: t('نوصل لأكثر من 15 دولة عربية مع خدمة التتبع'), icon: '🚚', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await hxStoreApi.getProducts();
        const mapped = (data.products || []).map((p: any) => hxMapBackendProduct(p)) as HxProduct[];
        setProducts(mapped);
      } catch { setProducts([]); }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (!showBanner) return;
    const timer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [showBanner, banners.length]);

  const featuredProducts = products.filter(p => p.is_featured);
  const categories = [
    { name: 'دونجل', icon: '🔑', count: products.filter(p => p.category === 'دونجل').length },
    { name: 'بوكس', icon: '📦', count: products.filter(p => p.category === 'بوكس').length },
    { name: 'جيتاج', icon: '⚡', count: products.filter(p => p.category === 'جيتاج').length },
    { name: 'أدوات اللحام', icon: '🔥', count: products.filter(p => p.category === 'أدوات اللحام').length },
    { name: 'رقائق', icon: '🎯', count: products.filter(p => p.category === 'رقائق').length },
    { name: 'أجهزة قياس', icon: '📊', count: products.filter(p => p.category === 'أجهزة قياس').length },
    { name: 'كابلات', icon: '🔌', count: products.filter(p => p.category === 'كابلات').length },
  ];

  const handleAddToCart = (product: HxProduct) => {
    addToCart({ product: product as any, quantity: 1 });
    setAddedId(product.id as number);
    setTimeout(() => setAddedId(null), 1500);
  };

  const whyUsItems = [
    { icon: <Truck size={28} />, title: t('خدمة توصيل سريعة'), desc: 'توصيل لجميع الدول العربية خلال 3-14 يوم عمل' },
    { icon: <Shield size={28} />, title: t('ضمان الجودة'), desc: 'جميع المنتجات أصلية 100% مع ضمان رسمي' },
    { icon: <Headphones size={28} />, title: t('دعم فني متواصل'), desc: 'فريق دعم متخصص على مدار الساعة' },
    { icon: <DollarSign size={28} />, title: t('أسعار تنافسية'), desc: 'أفضل الأسعار مع عروض وخصومات مستمرة' },
  ];

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {/* ─── Banner Carousel ─── */}
      {showBanner && (
        <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ display: 'flex', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translateX(${isRTL ? bannerIndex * 100 : -bannerIndex * 100}%)` }}>
            {banners.map((banner) => (
              <div key={banner.id} style={{
                minWidth: '100%',
                background: banner.gradient,
                padding: '60px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ maxWidth: 900, textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: 60, marginBottom: 16, animation: 'hxFloat 3s ease-in-out infinite' }}>{banner.icon}</div>
                  <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>{banner.title}</h1>
                  <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>{banner.subtitle}</p>
                  <a href="/products" className="hx-btn-primary" style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: Number(buttonRadius),
                    padding: '14px 36px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    {t('تسوق الآن')}
                    {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </a>
                </div>
              </div>
            ))}
          </div>
          {/* Banner dots */}
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIndex(i)}
                className={`hx-banner-dot ${i === bannerIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          {/* Nav arrows */}
          <button onClick={() => setBannerIndex(prev => (prev - 1 + banners.length) % banners.length)} style={{
            position: 'absolute', top: '50%', [isRTL ? 'right' : 'left']: 16, transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button onClick={() => setBannerIndex(prev => (prev + 1) % banners.length)} style={{
            position: 'absolute', top: '50%', [isRTL ? 'left' : 'right']: 16, transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        {/* ─── Categories ─── */}
        <section style={{ marginBottom: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: text }}>{t('تصفح الفئات')}</h2>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {categories.map(cat => (
              <a
                key={cat.name}
                href={`/products?cat=${encodeURIComponent(cat.name)}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '20px 24px', borderRadius: 16,
                  background: cardBg, border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  textDecoration: 'none', minWidth: 120,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = currentTheme.primary; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = darkMode ? '#334155' : '#e2e8f0'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: text, whiteSpace: 'nowrap' }}>{t(cat.name)}</span>
                <span style={{ fontSize: 11, color: subtext }}>{cat.count} {t('منتج')}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ─── Featured Products ─── */}
        <section style={{ marginBottom: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: text }}>⭐ {t('منتجات مميزة')}</h2>
            <a href="/products" style={{ color: currentTheme.primary, textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t('عرض الكل')} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </a>
          </div>

          {loading ? (
            <div className="hx-grid-products">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 320, borderRadius: 16 }} />
              ))}
            </div>
          ) : (
            <div className="hx-grid-products">
              {(featuredProducts.length > 0 ? featuredProducts : products).slice(0, 8).map((product, i) => (
                <div
                  key={product.id as number}
                  className="hx-product-card hx-animate-fade"
                  style={{
                    background: cardBg,
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    animationDelay: `${i * 0.05}s`,
                  }}
                  onClick={() => { setSelectedProduct(product); setQty(1); }}
                >
                  {/* Product Image/Icon */}
                  <div style={{
                    height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: darkMode ? '#111827' : '#f1f5f9',
                    position: 'relative',
                    fontSize: 56,
                  }}>
                    {typeof product.icon === 'string' && (product.icon as string).startsWith('http') ? (
                      <img src={product.icon as string} alt="" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                    ) : (
                      <span>{product.icon as string}</span>
                    )}
                    {product.badge && (
                      <span className="hx-badge" style={{
                        position: 'absolute', top: 12, [isRTL ? 'right' : 'left']: 12,
                        background: (product.badgeColor as string) || currentTheme.primary,
                        color: '#fff',
                      }}>
                        {product.badge as string}
                      </span>
                    )}
                    {product.stock !== undefined && (product.stock as number) <= 5 && (product.stock as number) > 0 && (
                      <span className="hx-badge" style={{
                        position: 'absolute', bottom: 12, [isRTL ? 'right' : 'left']: 12,
                        background: '#f59e0b20', color: '#f59e0b',
                      }}>
                        {t('متبقي')} {product.stock as number}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>
                      {product.category as string}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 6, lineHeight: 1.4 }}>
                      {(product.displayName || product.arabic_name || product.name) as string}
                    </h3>

                    {(product.rating as number) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: subtext }}>{product.rating as number}</span>
                        {product.sales && <span style={{ fontSize: 11, color: subtext }}>({product.sales as number} {t('مبيعة')})</span>}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: currentTheme.primary }}>
                          {formatPrice(Number(product.price))}
                        </span>
                        {product.originalPrice && (
                          <span style={{ fontSize: 13, color: subtext, textDecoration: 'line-through', marginRight: 8, marginLeft: 8 }}>
                            {formatPrice(Number(product.originalPrice))}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: addedId === (product.id as number) ? '#10b981' : currentTheme.primary,
                          border: 'none', color: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        {addedId === (product.id as number) ? '✓' : <ShoppingCart size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Why Us ─── */}
        <section style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: text, textAlign: 'center', marginBottom: 32 }}>{t('لماذا نحن؟')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {whyUsItems.map((item, i) => (
              <div
                key={i}
                className="hx-animate-fade"
                style={{
                  background: cardBg, borderRadius: 16, padding: 28,
                  textAlign: 'center',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  transition: 'all 0.3s',
                  animationDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${currentTheme.primary}15`, color: currentTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: subtext, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── All Products Grid ─── */}
        <section style={{ marginBottom: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: text }}>🛒 {t('جميع المنتجات')}</h2>
            <a href="/products" style={{ color: currentTheme.primary, textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t('عرض الكل')} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </a>
          </div>

          <div className="hx-grid-products">
            {products.slice(0, 12).map((product, i) => (
              <div
                key={product.id as number}
                className="hx-product-card hx-animate-fade"
                style={{
                  background: cardBg,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  animationDelay: `${i * 0.03}s`,
                }}
                onClick={() => { setSelectedProduct(product); setQty(1); }}
              >
                <div style={{
                  height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: darkMode ? '#111827' : '#f1f5f9',
                  fontSize: 48,
                  position: 'relative',
                }}>
                  {typeof product.icon === 'string' && (product.icon as string).startsWith('http') ? (
                    <img src={product.icon as string} alt="" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                  ) : (
                    <span>{product.icon as string}</span>
                  )}
                  {product.badge && (
                    <span className="hx-badge" style={{ position: 'absolute', top: 10, [isRTL ? 'right' : 'left']: 10, background: (product.badgeColor as string) || currentTheme.primary, color: '#fff' }}>
                      {product.badge as string}
                    </span>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{product.category as string}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 8, lineHeight: 1.4 }}>
                    {(product.displayName || product.arabic_name || product.name) as string}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: currentTheme.primary }}>
                      {formatPrice(Number(product.price))}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: addedId === (product.id as number) ? '#10b981' : `${currentTheme.primary}15`,
                        border: 'none', color: addedId === (product.id as number) ? '#fff' : currentTheme.primary,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {addedId === (product.id as number) ? '✓' : <ShoppingCart size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Product Detail Modal ─── */}
      {selectedProduct && (
        <div className="hx-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#111827' : '#f1f5f9', borderRadius: '20px 20px 0 0', fontSize: 72, position: 'relative' }}>
              {typeof selectedProduct.icon === 'string' && (selectedProduct.icon as string).startsWith('http') ? (
                <img src={selectedProduct.icon as string} alt="" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
              ) : (
                <span>{selectedProduct.icon as string}</span>
              )}
              <button onClick={() => setSelectedProduct(null)} style={{
                position: 'absolute', top: 12, [isRTL ? 'left' : 'right']: 12,
                width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
                border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18,
              }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{selectedProduct.category as string}</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: text, marginBottom: 8 }}>{(selectedProduct.displayName || selectedProduct.arabic_name || selectedProduct.name) as string}</h2>

              {selectedProduct.desc && <p style={{ fontSize: 14, color: subtext, lineHeight: 1.8, marginBottom: 16 }}>{selectedProduct.desc as string}</p>}

              {/* Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {selectedProduct.brand && (
                  <div style={{ padding: '8px 12px', background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
                    <span style={{ color: subtext }}>{t('العلامة التجارية')}: </span>
                    <span style={{ fontWeight: 600, color: text }}>{selectedProduct.brand as string}</span>
                  </div>
                )}
                {selectedProduct.warranty && (
                  <div style={{ padding: '8px 12px', background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
                    <span style={{ color: subtext }}>{t('الضمان')}: </span>
                    <span style={{ fontWeight: 600, color: text }}>{selectedProduct.warranty as string}</span>
                  </div>
                )}
                <div style={{ padding: '8px 12px', background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: subtext }}>{t('الحالة')}: </span>
                  <span style={{ fontWeight: 600, color: (selectedProduct.stock as number) > 0 ? '#10b981' : '#ef4444' }}>
                    {(selectedProduct.stock as number) > 0 ? `${t('متوفر')} (${selectedProduct.stock})` : t('غير متوفر')}
                  </span>
                </div>
                {selectedProduct.rating && (
                  <div style={{ padding: '8px 12px', background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: 600, color: text }}>{selectedProduct.rating as number}</span>
                  </div>
                )}
              </div>

              {/* Price & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: currentTheme.primary }}>{formatPrice(Number(selectedProduct.price))}</span>
                  {selectedProduct.originalPrice && (
                    <span style={{ fontSize: 16, color: subtext, textDecoration: 'line-through', marginRight: 10, marginLeft: 10 }}>
                      {formatPrice(Number(selectedProduct.originalPrice))}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="hx-qty-btn" style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text }}>-</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: text, minWidth: 30, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="hx-qty-btn" style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text }}>+</button>
                </div>
              </div>
              <button
                onClick={() => { addToCart({ product: selectedProduct as any, quantity: qty }); setSelectedProduct(null); }}
                className="hx-btn-primary"
                style={{ width: '100%', background: currentTheme.primary, borderRadius: Number(buttonRadius), padding: '14px', fontSize: 16 }}
              >
                <ShoppingCart size={18} />
                {t('إضافة للسلة')} — {formatPrice(Number(selectedProduct.price) * qty)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
