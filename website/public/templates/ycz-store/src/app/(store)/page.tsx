'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Shield, DollarSign, Headphones, ChevronDown, X, CheckCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { STEPS_DATA } from '@/lib/mockData';
import { storeApi } from '@/lib/api';
import type { Product } from '@/lib/types';

// ─── HeroBanner (Demo-style: contained, left-aligned, auto-rotate) ───
function HeroBanner() {
  const { currentTheme, showBanner, buttonRadius } = useTheme();
  const [active, setActive] = useState(0);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const banners = [
    { title: 'مرحباً بك 👋', subtitle: 'متجرك الإلكتروني جاهز', desc: 'أضف منتجاتك وابدأ البيع الآن', gradient: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.accent} 100%)` },
    { title: 'خدمات متنوعة ⚡', subtitle: 'كل ما تحتاجه في مكان واحد', desc: 'تصفح الخدمات واطلب بسهولة', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
    { title: 'دعم فني 🛡️', subtitle: 'نحن هنا لمساعدتك', desc: 'فريق دعم متاح على مدار الساعة', gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
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
      <h4 style={{
        fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 8, lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '2.52rem',
      }}>{product.name}</h4>
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

// ─── OrderModal (يتصل بالسيرفر مع فحص الرصيد) ───
function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currentTheme, buttonRadius } = useTheme();
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(product.minQuantity || 1);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const parsePriceToNumber = (price: string): number => {
    const cleaned = String(price || '').replace(/[^0-9.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const unitPrice = parsePriceToNumber(product.price);
  const totalPrice = unitPrice * qty;

  const orderFields = (() => {
    if (Array.isArray(product.customFields) && product.customFields.length > 0) {
      return product.customFields;
    }
    if (String(product.service_type || '').toUpperCase() === 'IMEI') {
      return [{ key: 'imei', label: 'رقم IMEI', placeholder: 'مثال: 356938035643809', required: true }];
    }
    return [];
  })();

  const allRequiredFilled = orderFields
    .filter((f) => f.required !== false)
    .every((f) => (formValues[f.key] || '').trim().length > 0);

  const isLoggedIn = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setLoadingProfile(true);
      setError(null);
      try {
        if (!isLoggedIn) {
          if (!cancelled) setWalletBalance(null);
          return;
        }
        const res = await storeApi.getProfile();
        const customer = res?.customer || res;
        const balance = Number(customer?.wallet_balance ?? customer?.balance ?? customer?.wallet?.balance ?? 0);
        if (!cancelled) setWalletBalance(Number.isFinite(balance) ? balance : 0);
      } catch {
        if (!cancelled) setWalletBalance(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  const canPayWithWallet = walletBalance !== null && walletBalance >= totalPrice;

  const submitOrder = async () => {
    if (submitting) return;
    setError(null);

    if (!isLoggedIn) {
      setError('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (loadingProfile || walletBalance === null) {
      setError('تعذر تحميل رصيد المحفظة');
      return;
    }

    if (!canPayWithWallet) {
      setError('رصيد المحفظة غير كافٍ');
      return;
    }

    setSubmitting(true);
    try {
      const imeiValue = (formValues.imei || '').trim();
      const otherFields = Object.fromEntries(
        Object.entries(formValues)
          .filter(([k, v]) => k !== 'imei' && String(v || '').trim().length > 0)
          .map(([k, v]) => [k, String(v).trim()])
      );

      const notes = Object.keys(otherFields).length > 0
        ? JSON.stringify(otherFields)
        : undefined;

      await storeApi.createOrder({
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        payment_method: 'wallet',
        ...(imeiValue ? { imei: imeiValue } : {}),
        ...(notes ? { notes } : {}),
      });

      setWalletBalance((b) => (typeof b === 'number' ? Math.max(0, b - totalPrice) : b));
      setStep(2);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'فشل إرسال الطلب';
      setError(msg || 'فشل إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 440, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020' }}>طلب المنتج</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', gap: 12, padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: 20 }}>
          <div style={{ fontSize: '2rem', width: 50, height: 50, display: 'grid', placeItems: 'center', background: '#fff', borderRadius: 10 }}>{product.icon}</div>
          <div>
            <h4 style={{
              fontSize: '0.9rem', fontWeight: 700, color: '#0b1020',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              lineHeight: 1.4,
            }}>{product.name}</h4>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: currentTheme.primary }}>{product.price}</p>
            {product.service_time && (
              <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>⏱</span> وقت الخدمة: {product.service_time}
              </p>
            )}
          </div>
        </div>

        {/* Quantity Input */}
        {product.allowsQuantity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 12, marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>الكمية</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
              <button onClick={() => setQty(q => Math.max(product.minQuantity || 1, q - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'grid', placeItems: 'center' }}>−</button>
              <input type="number" value={qty} min={product.minQuantity || 1} max={product.maxQuantity || 100} onChange={e => { const v = Math.max(product.minQuantity || 1, Math.min(product.maxQuantity || 100, Number(e.target.value) || 1)); setQty(v); }} style={{ width: 50, textAlign: 'center', padding: '0.4rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
              <button onClick={() => setQty(q => Math.min(product.maxQuantity || 100, q + 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'grid', placeItems: 'center' }}>+</button>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: currentTheme.primary, whiteSpace: 'nowrap' }}>${totalPrice.toFixed(2)}</span>
          </div>
        )}

        {/* Wallet Info */}
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 12,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          marginBottom: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
          fontSize: '0.82rem',
        }}>
          <div style={{ color: '#f8fafc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1rem' }}>💳</span> الدفع بالمحفظة
          </div>
          <div style={{ color: canPayWithWallet ? '#4ade80' : '#f87171', fontWeight: 800, textAlign: 'left' }}>
            {loadingProfile ? 'جاري جلب الرصيد...' : walletBalance === null ? 'غير متاح' : `$${walletBalance.toFixed(2)}`}
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: 12,
            padding: '0.75rem 1rem', borderRadius: 12,
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700,
          }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            {orderFields.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.82rem' }}>
                لا توجد حقول إضافية مطلوبة لهذا المنتج.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orderFields.map((field) => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      {field.label}
                      {field.required !== false && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <input
                      value={formValues[field.key] || ''}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder || `أدخل ${field.label}`}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={submitOrder}
              disabled={!allRequiredFilled || submitting || loadingProfile || !isLoggedIn}
              style={{ width: '100%', marginTop: 16, padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: allRequiredFilled ? 'pointer' : 'not-allowed', fontFamily: 'Tajawal, sans-serif', opacity: allRequiredFilled ? 1 : 0.6 }}>
              {submitting ? 'جارٍ إرسال الطلب...' : 'تقديم الطلب'}
            </button>

            {isLoggedIn && walletBalance !== null && !loadingProfile && !canPayWithWallet && (
              <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                الرصيد غير كافٍ لإتمام الطلب (المطلوب: ${totalPrice.toFixed(2)})
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>تم إرسال الطلب بنجاح!</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة &ldquo;طلباتي&rdquo;.</p>
            {walletBalance !== null && (
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 6 }}>الرصيد المتبقي: <strong style={{ color: '#0b1020' }}>${walletBalance.toFixed(2)}</strong></p>
            )}
            <button onClick={onClose} style={{ marginTop: 20, padding: '0.65rem 2rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>حسناً</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ───
export default function HomePage() {
  const { currentTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await storeApi.getProducts();
        if (Array.isArray(res) && res.length > 0) setProducts(res as Product[]);
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
          ) : products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>📦</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>لا توجد منتجات بعد</p>
              <p style={{ fontSize: '0.8rem' }}>سيتم عرض المنتجات هنا بعد إضافتها من لوحة التحكم</p>
            </div>
          ) : (
            (products.filter(p => p.is_featured).length > 0 ? products.filter(p => p.is_featured) : products).slice(0, 6).map(p => <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />)
          )}
        </div>
      </section>

      {/* كيف تطلب */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', textAlign: 'center', marginBottom: '1.5rem' }}>كيف تطلب؟</h3>
        <div className="store-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
        <div className="store-about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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

      {selectedProduct && <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
