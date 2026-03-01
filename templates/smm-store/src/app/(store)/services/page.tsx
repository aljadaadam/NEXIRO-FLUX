'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import {
  Search, Filter, Star, ShoppingCart, X, ChevronDown,
  CheckCircle, AlertCircle, Minus, Plus, ExternalLink, Zap,
  Grid, List, ArrowLeft, ArrowRight
} from 'lucide-react';

type ProductItem = Record<string, unknown>;

const PLATFORM_ICONS: Record<string, string> = {
  'انستغرام': '📸', 'تيك توك': '🎵', 'يوتيوب': '▶️', 'تويتر': '🐦',
  'فيسبوك': '👤', 'تلغرام': '✈️', 'سناب شات': '👻', 'لينكد إن': '💼',
  'ثريدز': '🧵', 'بنترست': '📌',
};

const PLATFORM_COLORS: Record<string, string> = {
  'انستغرام': '#E1306C', 'تيك توك': '#69C9D0', 'يوتيوب': '#FF0000', 'تويتر': '#1DA1F2',
  'فيسبوك': '#1877F2', 'تلغرام': '#0088cc', 'سناب شات': '#FFFC00', 'لينكد إن': '#0A66C2',
};

export default function ServicesPage() {
  const { currentTheme, darkMode, isRTL, t, productLayout } = useTheme();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(productLayout === 'list' ? 'list' : 'grid');
  const [orderModal, setOrderModal] = useState<ProductItem | null>(null);
  const [orderStep, setOrderStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    storeApi.getProducts().then(data => {
      setProducts(data as ProductItem[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map(p => String(p.category || '')))].filter(Boolean);
  const filtered = products.filter(p => {
    const matchSearch = !search ||
      String(p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p.arabic_name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p.desc || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const openOrderModal = (product: ProductItem) => {
    setOrderModal(product);
    setOrderStep(0);
    setQuantity(Number(product.minQuantity) || 1);
    setCustomFields({});
    setOrderResult(null);
  };

  const handleOrder = async () => {
    if (!orderModal) return;
    setOrderLoading(true);
    try {
      const fields: Record<string, string> = { ...customFields };
      const data: Record<string, unknown> = {
        product_id: orderModal.id,
        quantity: orderModal.allowsQuantity ? quantity : 1,
        custom_data: fields,
      };
      await storeApi.createOrder(data);
      setOrderResult({ success: true, message: t('تم إرسال طلبك بنجاح!') });
      setOrderStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('حدث خطأ، حاول مرة أخرى');
      setOrderResult({ success: false, message: msg });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontSize: '1.8rem', fontWeight: 900, marginBottom: 8,
        }}>
          <span style={{
            background: currentTheme.gradient,
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {t('الخدمات')}
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {t('تصفح الخدمات')} — {filtered.length} {t('خدمة متاحة')}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [isRTL ? 'right' : 'left']: 14,
            color: 'var(--text-muted)',
          }} />
          <input
            className="glass-input"
            placeholder={t('بحث عن خدمة...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              [isRTL ? 'paddingRight' : 'paddingLeft']: 42,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none',
              background: viewMode === 'grid' ? `${currentTheme.primary}20` : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: viewMode === 'grid' ? currentTheme.primary : 'var(--text-muted)',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none',
              background: viewMode === 'list' ? `${currentTheme.primary}20` : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: viewMode === 'list' ? currentTheme.primary : 'var(--text-muted)',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 24,
        overflowX: 'auto', paddingBottom: 8,
        scrollbarWidth: 'none',
      }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '8px 18px', borderRadius: 12, border: 'none',
            background: !selectedCategory ? currentTheme.gradient : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
            color: !selectedCategory ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: !selectedCategory ? `0 4px 15px ${currentTheme.primary}30` : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {t('الكل')} ({products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 18px', borderRadius: 12, border: 'none',
              background: selectedCategory === cat ? currentTheme.gradient : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: selectedCategory === cat ? `0 4px 15px ${currentTheme.primary}30` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{PLATFORM_ICONS[cat] || '🌐'}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'store-products-grid' : 'store-products-list'}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? 200 : 80, borderRadius: 20 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Search size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('لا توجد نتائج')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="store-products-grid">
          {filtered.map(product => (
            <div
              key={String(product.id)}
              className="neon-card card-shine"
              style={{ padding: 0, cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => openOrderModal(product)}
            >
              <div style={{
                height: 4,
                background: `linear-gradient(90deg, ${PLATFORM_COLORS[String(product.category)] || currentTheme.primary}, ${PLATFORM_COLORS[String(product.category)] || currentTheme.primary}80)`,
              }} />
              <div style={{ padding: '18px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${PLATFORM_COLORS[String(product.category)] || currentTheme.primary}15`,
                    display: 'grid', placeItems: 'center', fontSize: '1.3rem', flexShrink: 0,
                  }}>
                    {String(product.icon || '🌐')}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(product.name)}
                    </h3>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: PLATFORM_COLORS[String(product.category)] || 'var(--text-muted)' }}>
                      {String(product.category)}
                    </span>
                  </div>
                </div>
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                }}>
                  {String(product.desc || '')}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '1.1rem', fontWeight: 900,
                    background: currentTheme.gradient,
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {String(product.price)}
                  </span>
                  <button style={{
                    padding: '7px 14px', borderRadius: 10, border: 'none',
                    background: currentTheme.gradient, color: '#fff',
                    fontWeight: 700, fontSize: '0.73rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    boxShadow: `0 4px 15px ${currentTheme.primary}30`,
                  }}>
                    <Zap size={12} />
                    {t('اطلب الآن')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="store-products-list">
          {filtered.map(product => (
            <div
              key={String(product.id)}
              className="neon-card card-shine"
              style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
              onClick={() => openOrderModal(product)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${PLATFORM_COLORS[String(product.category)] || currentTheme.primary}15`,
                display: 'grid', placeItems: 'center', fontSize: '1.2rem', flexShrink: 0,
              }}>
                {String(product.icon || '🌐')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(product.name)}
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {String(product.category)}
                </span>
              </div>
              <span style={{
                fontSize: '1rem', fontWeight: 900,
                background: currentTheme.gradient,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                flexShrink: 0,
              }}>
                {String(product.price)}
              </span>
              <button style={{
                padding: '7px 14px', borderRadius: 10, border: 'none',
                background: currentTheme.gradient, color: '#fff',
                fontWeight: 700, fontSize: '0.73rem', cursor: 'pointer',
                boxShadow: `0 4px 15px ${currentTheme.primary}30`,
                flexShrink: 0,
              }}>
                <Zap size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ORDER MODAL ═══ */}
      {orderModal && (
        <div className="modal-overlay" onClick={() => !orderLoading && setOrderModal(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              width: 440, maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 40px)',
              borderRadius: 24,
              background: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#fff',
              border: `1px solid ${darkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(0,0,0,0.1)'}`,
              overflow: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${PLATFORM_COLORS[String(orderModal.category)] || currentTheme.primary}15`,
                  display: 'grid', placeItems: 'center', fontSize: '1.4rem',
                }}>
                  {String(orderModal.icon || '🌐')}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {String(orderModal.name)}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {String(orderModal.category)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOrderModal(null)}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Step 0: Details + Custom Fields */}
              {orderStep === 0 && (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                    {String(orderModal.desc || '')}
                  </p>

                  {/* Price */}
                  <div style={{
                    padding: '14px 18px', borderRadius: 14,
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('السعر')}</span>
                    <span style={{
                      fontSize: '1.4rem', fontWeight: 900,
                      background: currentTheme.gradient,
                      backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      {String(orderModal.price)}
                    </span>
                  </div>

                  {/* Quantity */}
                  {Boolean(orderModal.allowsQuantity) && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                        {t('الكمية')} ({Number(orderModal.minQuantity)} - {Number(orderModal.maxQuantity)})
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          onClick={() => setQuantity(Math.max(Number(orderModal.minQuantity) || 1, quantity - 100))}
                          style={{
                            width: 40, height: 40, borderRadius: 10, border: 'none',
                            background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            cursor: 'pointer', display: 'grid', placeItems: 'center',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          className="glass-input"
                          value={quantity}
                          onChange={e => setQuantity(Math.max(Number(orderModal.minQuantity) || 1, Math.min(Number(orderModal.maxQuantity) || 100000, Number(e.target.value) || 1)))}
                          style={{ textAlign: 'center', flex: 1 }}
                        />
                        <button
                          onClick={() => setQuantity(Math.min(Number(orderModal.maxQuantity) || 100000, quantity + 100))}
                          style={{
                            width: 40, height: 40, borderRadius: 10, border: 'none',
                            background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            cursor: 'pointer', display: 'grid', placeItems: 'center',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {Array.isArray(orderModal.customFields) && (orderModal.customFields as Array<{ key: string; label: string; placeholder?: string; required?: boolean }>).map((field) => (
                    <div key={field.key} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      <input
                        className="glass-input"
                        placeholder={field.placeholder || ''}
                        value={customFields[field.key] || ''}
                        onChange={e => setCustomFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => setOrderStep(1)}
                    className="neon-btn"
                    style={{
                      width: '100%', padding: '14px 24px',
                      background: currentTheme.gradient, color: '#fff',
                      marginTop: 8,
                    }}
                  >
                    {t('التالي')} →
                  </button>
                </div>
              )}

              {/* Step 1: Confirm */}
              {orderStep === 1 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                    {t('تأكيد')} {t('الطلب')}
                  </h3>
                  <div style={{
                    padding: 18, borderRadius: 14,
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('الخدمة')}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{String(orderModal.name)}</span>
                    </div>
                    {Boolean(orderModal.allowsQuantity) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('الكمية')}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{quantity.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, paddingTop: 8 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('المجموع')}</span>
                      <span style={{
                        fontWeight: 900, fontSize: '1.1rem',
                        background: currentTheme.gradient,
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>
                        {String(orderModal.price)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setOrderStep(0)}
                      style={{
                        flex: 1, padding: '12px 20px', borderRadius: 14, border: 'none',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                      }}
                    >
                      {t('رجوع')}
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={orderLoading}
                      className="neon-btn"
                      style={{
                        flex: 2, padding: '12px 20px',
                        background: currentTheme.gradient, color: '#fff',
                        opacity: orderLoading ? 0.7 : 1,
                      }}
                    >
                      {orderLoading ? t('تحميل...') : t('تأكيد')}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Result */}
              {orderStep === 2 && orderResult && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {orderResult.success ? (
                    <CheckCircle size={56} style={{ color: '#22c55e', marginBottom: 16 }} />
                  ) : (
                    <AlertCircle size={56} style={{ color: '#ef4444', marginBottom: 16 }} />
                  )}
                  <h3 style={{
                    fontSize: '1.2rem', fontWeight: 700, marginBottom: 8,
                    color: orderResult.success ? '#22c55e' : '#ef4444',
                  }}>
                    {orderResult.success ? t('نجاح') : t('خطأ')}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                    {orderResult.message}
                  </p>
                  <button
                    onClick={() => setOrderModal(null)}
                    className="neon-btn"
                    style={{
                      padding: '12px 32px',
                      background: currentTheme.gradient, color: '#fff',
                    }}
                  >
                    {t('تم')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
