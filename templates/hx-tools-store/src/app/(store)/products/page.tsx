'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { hxStoreApi, hxMapBackendProduct } from '@/lib/hxApi';
import { HxProduct } from '@/lib/hxTypes';
import { Search, SlidersHorizontal, Star, ShoppingCart, X, ChevronDown, Grid3X3, List, ArrowUpDown } from 'lucide-react';

export default function HxProductsPage() {
  const { currentTheme, darkMode, t, isRTL, formatPrice, addToCart, buttonRadius } = useHxTheme();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || '';

  const [products, setProducts] = useState<HxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<HxProduct | null>(null);
  const [qty, setQty] = useState(1);
  const [addedId, setAddedId] = useState<number | null>(null);

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await hxStoreApi.getProducts();
        const mapped = (data.products || []).map((p: Record<string, unknown>) => hxMapBackendProduct(p)) as HxProduct[];
        setProducts(mapped);
      } catch { setProducts([]); }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))].filter(Boolean);
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.arabic_name || '').toLowerCase().includes(q) ||
        (p.desc || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price range
    result = result.filter(p => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'best-selling':
        result.sort((a, b) => (Number(b.sales) || 0) - (Number(a.sales) || 0));
        break;
      case 'rating':
        result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      default: // newest
        break;
    }

    return result;
  }, [products, search, selectedCategory, sortBy, priceRange]);

  const handleAddToCart = (product: HxProduct) => {
    addToCart({ product: product as any, quantity: 1 });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const sortOptions = [
    { value: 'newest', label: t('الأحدث') },
    { value: 'price-low', label: t('الأقل سعراً') },
    { value: 'price-high', label: t('الأعلى سعراً') },
    { value: 'best-selling', label: t('الأكثر مبيعاً') },
    { value: 'rating', label: '⭐ ' + t('التقييم') },
  ];

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: currentTheme.gradient, padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>🛍️ {t('المنتجات')}</h1>
        <p style={{ fontSize: 15, opacity: 0.9 }}>{t('أدوات الصيانة والسوفتوير')} — {t('دونجلات، بوكسات، JTAG، أدوات لحام')}</p>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
        {/* ─── Search & Filter Bar ─── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24,
          background: cardBg, padding: 16, borderRadius: 16,
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: 14, color: subtext }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('بحث عن منتج...')}
              className="hx-input"
              style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 44 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                [isRTL ? 'left' : 'right']: 12,
                background: 'none', border: 'none', color: subtext, cursor: 'pointer',
              }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', minWidth: 160 }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="hx-select"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setViewMode('grid')} style={{
              width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: viewMode === 'grid' ? currentTheme.primary : (darkMode ? '#334155' : '#f1f5f9'),
              color: viewMode === 'grid' ? '#fff' : subtext,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Grid3X3 size={18} />
            </button>
            <button onClick={() => setViewMode('list')} style={{
              width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? currentTheme.primary : (darkMode ? '#334155' : '#f1f5f9'),
              color: viewMode === 'list' ? '#fff' : subtext,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <List size={18} />
            </button>
          </div>

          {/* Filter Toggle (mobile) */}
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: Number(buttonRadius), border: `2px solid ${currentTheme.primary}`,
            background: showFilters ? currentTheme.primary : 'transparent',
            color: showFilters ? '#fff' : currentTheme.primary,
            cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
          }}>
            <SlidersHorizontal size={16} />
            {t('الفلتر')}
          </button>
        </div>

        {/* ─── Category Pills ─── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
          <button
            onClick={() => setSelectedCategory('')}
            className={`hx-category-pill ${!selectedCategory ? 'active' : ''}`}
            style={{
              background: !selectedCategory ? currentTheme.primary : (darkMode ? '#1e293b' : '#fff'),
              color: !selectedCategory ? '#fff' : text,
              borderColor: !selectedCategory ? currentTheme.primary : (darkMode ? '#334155' : '#e2e8f0'),
            }}
          >
            {t('جميع الفئات')}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`hx-category-pill ${cat === selectedCategory ? 'active' : ''}`}
              style={{
                background: cat === selectedCategory ? currentTheme.primary : (darkMode ? '#1e293b' : '#fff'),
                color: cat === selectedCategory ? '#fff' : text,
                borderColor: cat === selectedCategory ? currentTheme.primary : (darkMode ? '#334155' : '#e2e8f0'),
              }}
            >
              {t(cat)}
            </button>
          ))}
        </div>

        {/* ─── Filter Panel (collapsible) ─── */}
        {showFilters && (
          <div className="hx-animate-fade" style={{
            background: cardBg, borderRadius: 16, padding: 20, marginBottom: 20,
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            display: 'flex', flexWrap: 'wrap', gap: 20,
          }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('نطاق السعر')} (USD)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} className="hx-input" style={{ width: 90 }} placeholder="0" />
                <span style={{ color: subtext }}>—</span>
                <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="hx-input" style={{ width: 90 }} placeholder="9999" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setPriceRange([0, 9999]); setSearch(''); setSelectedCategory(''); setSortBy('newest'); }} style={{
                padding: '10px 20px', borderRadius: Number(buttonRadius), border: 'none',
                background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
              }}>
                {t('إعادة تعيين')}
              </button>
            </div>
          </div>
        )}

        {/* Result count */}
        <div style={{ fontSize: 13, color: subtext, marginBottom: 16 }}>
          {filteredProducts.length} {t('منتج')} {selectedCategory && `— ${t(selectedCategory)}`} {search && `— "${search}"`}
        </div>

        {/* ─── Products Grid/List ─── */}
        {loading ? (
          <div className="hx-grid-products">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: viewMode === 'grid' ? 320 : 120, borderRadius: 16 }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: text, marginBottom: 8 }}>{t('لا توجد منتجات')}</h3>
            <p style={{ color: subtext }}>{t('جرب تغيير معايير البحث أو الفلتر')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="hx-grid-products">
            {filteredProducts.map((product, i) => (
              <div
                key={product.id as number}
                className="hx-product-card hx-animate-fade"
                style={{
                  background: cardBg, borderRadius: 16, overflow: 'hidden',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  animationDelay: `${i * 0.03}s`,
                }}
                onClick={() => { setSelectedProduct(product); setQty(1); }}
              >
                <div style={{
                  height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: darkMode ? '#111827' : '#f1f5f9', fontSize: 56, position: 'relative',
                }}>
                  {typeof product.icon === 'string' && (product.icon as string).startsWith('http') ? (
                    <img src={product.icon as string} alt="" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                  ) : (
                    <span>{product.icon as string}</span>
                  )}
                  {product.badge && (
                    <span className="hx-badge" style={{ position: 'absolute', top: 12, [isRTL ? 'right' : 'left']: 12, background: (product.badgeColor as string) || currentTheme.primary, color: '#fff' }}>
                      {product.badge as string}
                    </span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{product.category as string}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 6, lineHeight: 1.4 }}>
                    {(product.displayName || product.arabic_name || product.name) as string}
                  </h3>
                  {(product.rating as number) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: subtext }}>{product.rating as number}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: currentTheme.primary }}>{formatPrice(Number(product.price))}</span>
                      {product.originalPrice && (
                        <span style={{ fontSize: 13, color: subtext, textDecoration: 'line-through', margin: '0 8px' }}>{formatPrice(Number(product.originalPrice))}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: addedId === (product.id as number) ? '#10b981' : currentTheme.primary,
                        border: 'none', color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                      }}
                    >
                      {addedId === (product.id as number) ? '✓' : <ShoppingCart size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredProducts.map((product, i) => (
              <div
                key={product.id as number}
                className="hx-product-card hx-animate-fade"
                style={{
                  background: cardBg, borderRadius: 16,
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  display: 'flex', gap: 16, padding: 16, cursor: 'pointer',
                  animationDelay: `${i * 0.03}s`,
                }}
                onClick={() => { setSelectedProduct(product); setQty(1); }}
              >
                <div style={{
                  width: 100, height: 100, borderRadius: 12, flexShrink: 0,
                  background: darkMode ? '#111827' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
                }}>
                  {typeof product.icon === 'string' && (product.icon as string).startsWith('http') ? (
                    <img src={product.icon as string} alt="" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                  ) : (
                    <span>{product.icon as string}</span>
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 11, color: currentTheme.primary, fontWeight: 600, marginBottom: 2 }}>{product.category as string}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 4 }}>
                    {(product.displayName || product.arabic_name || product.name) as string}
                  </h3>
                  {product.desc && <p style={{ fontSize: 12, color: subtext, lineHeight: 1.5, marginBottom: 4 }}>{(product.desc as string).slice(0, 80)}...</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: currentTheme.primary }}>{formatPrice(Number(product.price))}</span>
                    {product.originalPrice && <span style={{ fontSize: 13, color: subtext, textDecoration: 'line-through' }}>{formatPrice(Number(product.originalPrice))}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    className="hx-btn-primary"
                    style={{ background: addedId === (product.id as number) ? '#10b981' : currentTheme.primary, borderRadius: Number(buttonRadius), padding: '10px 18px', fontSize: 13 }}
                  >
                    {addedId === (product.id as number) ? '✓ ' + t('تمت الإضافة') : <><ShoppingCart size={14} /> {t('إضافة للسلة')}</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
                width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.3)',
                border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(10px)',
              }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{selectedProduct.category as string}</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: text, marginBottom: 8 }}>
                {(selectedProduct.displayName || selectedProduct.arabic_name || selectedProduct.name) as string}
              </h2>
              {selectedProduct.desc && <p style={{ fontSize: 14, color: subtext, lineHeight: 1.8, marginBottom: 16 }}>{selectedProduct.desc as string}</p>}

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
                  <span style={{ color: subtext }}>{t('المخزون')}: </span>
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: currentTheme.primary }}>{formatPrice(Number(selectedProduct.price))}</span>
                  {selectedProduct.originalPrice && (
                    <span style={{ fontSize: 16, color: subtext, textDecoration: 'line-through', margin: '0 10px' }}>{formatPrice(Number(selectedProduct.originalPrice))}</span>
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
