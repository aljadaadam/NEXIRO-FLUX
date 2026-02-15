'use client';

import { useState, useEffect } from 'react';
import { Search, Star, ShoppingBag, X, CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { storeApi } from '@/lib/api';
import type { Product } from '@/lib/types';

// ─── OrderModal ───
function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currentTheme, buttonRadius } = useTheme();
  const [step, setStep] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const radius = buttonRadius === 'sharp' ? '8px' : buttonRadius === 'pill' ? '50px' : '14px';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, padding: '2rem',
        width: '90%', maxWidth: 440, maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020' }}>
            {step === 1 ? '📋 تفاصيل الطلب' : '✅ تم الإرسال!'}
          </h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: 'none', background: '#f1f5f9',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {step === 1 ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '1rem', background: '#f8fafc', borderRadius: 14, marginBottom: 20,
            }}>
              <span style={{ fontSize: '2rem' }}>{product.icon}</span>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020' }}>{product.name}</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{product.category}</p>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: currentTheme.primary }}>{product.price}</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                أدخل البيانات المطلوبة
              </label>
              <input
                value={inputVal} onChange={e => setInputVal(e.target.value)}
                placeholder="مثال: IMEI / رقم الحساب / البريد"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                  border: '1px solid #e2e8f0', fontSize: '0.85rem',
                  fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{
              padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: 10,
              marginBottom: 20, display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>المبلغ الإجمالي</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: currentTheme.primary }}>{product.price}</span>
            </div>

            <button onClick={() => setStep(2)} style={{
              width: '100%', padding: '0.85rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.9rem', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <ShoppingBag size={18} /> تأكيد الطلب
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#dcfce7', display: 'grid', placeItems: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 8 }}>
              تم إرسال طلبك بنجاح!
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              رقم الطلب: <strong>#ORD-{Math.floor(Math.random() * 9000 + 1000)}</strong>
              <br />سيتم التنفيذ خلال 1-24 ساعة
            </p>
            <button onClick={onClose} style={{
              padding: '0.7rem 2rem', borderRadius: radius,
              background: currentTheme.gradient, color: '#fff',
              border: 'none', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
              حسناً
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── صفحة الخدمات ───
export default function ServicesPage() {
  const { currentTheme, buttonRadius } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const radius = buttonRadius === 'sharp' ? '6px' : buttonRadius === 'pill' ? '50px' : '10px';

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

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'الكل' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', marginBottom: 20 }}>
        🛒 جميع الخدمات
      </h2>

      {/* Search + Categories */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.6rem 1rem', borderRadius: 12,
          background: '#fff', border: '1px solid #e2e8f0', flex: 1, minWidth: 200,
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن خدمة..."
            style={{
              border: 'none', outline: 'none', width: '100%',
              fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif',
              background: 'transparent',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '0.5rem 1rem', borderRadius: 10,
              background: activeCategory === cat ? currentTheme.primary : '#fff',
              color: activeCategory === cat ? '#fff' : '#64748b',
              border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
              fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="store-products-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16,
      }}>
        {filtered.map(product => (
          <div key={product.id} style={{
            background: '#fff', borderRadius: 16, overflow: 'hidden',
            border: '1px solid #f1f5f9', cursor: 'pointer', position: 'relative',
          }}>
            {product.badge && (
              <span style={{
                position: 'absolute', top: 10, right: 10,
                padding: '0.2rem 0.65rem', borderRadius: 8,
                background: product.badgeColor || currentTheme.primary,
                color: '#fff', fontSize: '0.65rem', fontWeight: 800, zIndex: 2,
              }}>{product.badge}</span>
            )}
            <div style={{
              height: 100,
              background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.secondary}15)`,
              display: 'grid', placeItems: 'center',
            }}>
              <span style={{ fontSize: '2.5rem' }}>{product.icon}</span>
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{product.name}</h3>
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
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through', marginRight: 6 }}>{product.originalPrice}</span>
                  )}
                </div>
                <button onClick={() => setOrderProduct(product)} style={{
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
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</p>
          <p>لا توجد نتائج مطابقة</p>
        </div>
      )}

      {orderProduct && <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />}
    </section>
  );
}
