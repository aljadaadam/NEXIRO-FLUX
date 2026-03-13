'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCircle, ChevronDown, Plus, Send, Lock, Headphones, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import type { Product } from '@/lib/types';

// ─── Hero Banner (Aflatoon style: dark with gold accent + city image) ───
function HeroBanner() {
  const { currentTheme, showBanner, t } = useTheme();
  const [dbBanners, setDbBanners] = useState<Array<{
    title: string; subtitle: string; desc: string;
    image_url?: string; link?: string; bg_image?: string;
  }> | null>(null);

  useEffect(() => {
    storeApi.getActiveBanners?.().then((data: { banners?: Array<{ title?: string; subtitle?: string; description?: string; image_url?: string; link?: string; extra_data?: string | { bg_image?: string } }> }) => {
      const list = data?.banners;
      if (list && list.length > 0) {
        setDbBanners(list.map(b => {
          const extra = typeof b.extra_data === 'string' ? (() => { try { return JSON.parse(b.extra_data); } catch { return {}; } })() : (b.extra_data || {});
          return {
            title: b.title || '', subtitle: b.subtitle || '', desc: b.description || '',
            image_url: b.image_url || '', link: b.link, bg_image: extra.bg_image || '',
          };
        }));
      }
    }).catch(() => {});
  }, []);

  if (!showBanner) return null;

  const banner = dbBanners?.[0];

  return (
    <div dir="rtl" style={{
      position: 'relative', borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #131829 50%, #1a2035 100%)',
      marginBottom: '2rem', minHeight: 320,
    }}>
      {/* Background image */}
      {banner?.bg_image && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${banner.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.3,
        }} />
      )}
      {/* Default decorative background */}
      {!banner?.bg_image && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(245, 166, 35, 0.08) 0%, transparent 60%)',
        }} />
      )}
      {/* Gold accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`,
      }} />

      <div className="afl-hero-container" style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', gap: '2rem',
        padding: '2.5rem 3rem',
      }}>
        {/* Image side */}
        <div className="afl-hero-image" style={{ flex: '0 0 320px' }}>
          {banner?.image_url ? (
            <img src={banner.image_url} alt={banner.title} style={{
              width: '100%', borderRadius: 16, objectFit: 'cover',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'aflFloat 4s ease-in-out infinite',
            }} />
          ) : (
            <div style={{
              width: '100%', aspectRatio: '4/3', borderRadius: 16,
              background: 'linear-gradient(135deg, #1a2035, #2a3352)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'aflFloat 4s ease-in-out infinite',
            }}>
              <span style={{ fontSize: '4rem' }}>🏪</span>
            </div>
          )}
        </div>

        {/* Text side */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div className="afl-hero-badge" style={{
            display: 'inline-block', padding: '0.35rem 1rem', borderRadius: 20,
            background: `${currentTheme.primary}20`, border: `1px solid ${currentTheme.primary}40`,
            color: currentTheme.primary, fontSize: '0.82rem', fontWeight: 700, marginBottom: 16,
          }}>
            {banner?.title || '⭐ أكبر منصة تفعيلات في السودان'}
          </div>

          <h1 className="afl-hero-title" style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff',
            lineHeight: 1.3, marginBottom: 12,
          }}>
            {banner?.subtitle || (
              <>
                {t('امتلك برامجك')}{' '}
                <span style={{ color: currentTheme.primary }}>{t('الأصلية')}</span>{' '}
                {t('بضغطة زر')}
              </>
            )}
          </h1>

          <p className="afl-hero-desc" style={{
            fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, maxWidth: 500,
          }}>
            {banner?.desc || t('متجر الأفلاطون يوفر لك تفعيلات ويندوز، ألعاب، beIN، ستارلينك واشتراكات بريميوم بأمان تام وتسليم فوري.')}
          </p>

          <div className="afl-hero-buttons" style={{ display: 'flex', gap: 12 }}>
            <Link href={banner?.link || '/services'} style={{
              padding: '0.75rem 2rem', borderRadius: 10,
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
              color: '#000', fontWeight: 800, fontSize: '0.95rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: `0 4px 20px ${currentTheme.primary}40`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              textDecoration: 'none',
            }}>
              {t('ابدأ التسوق الآن')}
            </Link>
            <Link href="/about" style={{
              padding: '0.75rem 2rem', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', transition: 'all 0.3s',
            }}>
              {t('تعرف علينا أكثر')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Cards (3 cards: instant delivery, secure payment, 24/7 support) ───
function FeatureCards() {
  const { currentTheme, t } = useTheme();

  const features = [
    {
      icon: <Send size={28} />,
      title: t('تسليم فوري'),
      desc: t('استلم المفتاح أو التفعيل خلال دقائق عبر البريد أو الواتساب.'),
      color: currentTheme.primary,
    },
    {
      icon: <Lock size={28} />,
      title: t('دفع آمن'),
      desc: t('خيارات دفع متعددة مع حماية بياناتك ومعاملاتك.'),
      color: '#10b981',
    },
    {
      icon: <Headphones size={28} />,
      title: t('دعم 24/7'),
      desc: t('فريق دعم جاهز لمساعدتك في التفعيل وأي استفسار.'),
      color: '#3b82f6',
    },
  ];

  return (
    <div className="afl-features-grid" style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2.5rem',
    }}>
      {features.map((f, i) => (
        <div key={i} className="afl-feature-card" style={{
          display: 'flex', alignItems: 'center', gap: 16,
          flexDirection: 'row-reverse', textAlign: 'right',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `${f.color}18`, color: f.color,
            display: 'grid', placeItems: 'center',
          }}>
            {f.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Product Card (Aflatoon style: image background with overlay) ───
function ProductCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  const { currentTheme } = useTheme();

  const hasImage = product.icon && (product.icon.startsWith('http') || product.icon.startsWith('/'));
  const priceNum = String(product.price || '').replace(/[^0-9.]/g, '');

  return (
    <div onClick={onClick} className="afl-product-card" style={{
      background: 'var(--bg-card)', borderRadius: 16,
      border: '1px solid var(--border-light)',
      cursor: 'pointer', overflow: 'hidden',
    }}>
      {/* Image area */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16/10',
        background: hasImage ? 'transparent' : 'var(--bg-subtle)',
        overflow: 'hidden',
      }}>
        {hasImage ? (
          <img src={product.icon} alt={product.name} className="afl-product-card-img" style={{
            width: '100%', height: '100%', objectFit: 'cover',
          }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'grid', placeItems: 'center',
            background: `linear-gradient(135deg, ${currentTheme.primary}10, ${currentTheme.primary}05)`,
            fontSize: '2.5rem',
          }}>
            {product.icon || '📦'}
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        }} />
        {/* Product name overlay */}
        <div style={{
          position: 'absolute', bottom: 8, left: 12, right: 12,
        }}>
          <h4 style={{
            fontSize: '0.82rem', fontWeight: 700, color: '#fff',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            lineHeight: 1.4,
          }}>
            {product.name}
          </h4>
        </div>
      </div>

      {/* Bottom bar: add button + price */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 0.75rem',
      }}>
        <button style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${currentTheme.primary}18`, border: `1px solid ${currentTheme.primary}30`,
          color: currentTheme.primary, display: 'grid', placeItems: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          <Plus size={16} />
        </button>
        <div style={{ textAlign: 'left' }}>
          {product.originalPrice && (
            <span style={{
              fontSize: '0.62rem', color: 'var(--text-muted)',
              textDecoration: 'line-through', display: 'block',
            }}>
              {product.originalPrice}
            </span>
          )}
          <span style={{
            fontSize: '0.85rem', fontWeight: 800,
            color: currentTheme.primary,
          }}>
            {priceNum ? `SDG ${Number(priceNum).toLocaleString()}` : product.price}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Order Modal (Aflatoon style: dark with service options) ───
function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currentTheme, t, isRTL } = useTheme();
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('_sidebar_profile');
        if (cached) { const p = JSON.parse(cached); const b = Number(p.balance); if (Number.isFinite(b)) return b; }
      } catch {}
    }
    return null;
  });
  const [loadingProfile, setLoadingProfile] = useState(() => {
    if (typeof window !== 'undefined') { try { return !localStorage.getItem('_sidebar_profile'); } catch {} }
    return true;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(product.minQuantity || 1);

  const parsePriceToNumber = (price: string): number => {
    const cleaned = String(price || '').replace(/[^0-9.]/g, '');
    return Number(cleaned) || 0;
  };

  const unitPrice = parsePriceToNumber(product.price);
  const totalPrice = unitPrice * qty;
  const isLoggedIn = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));

  const orderFields = (() => {
    if (Array.isArray(product.customFields) && product.customFields.length > 0) return product.customFields;
    const sType = String(product.service_type || '').toUpperCase();
    if (sType === 'IMEI') return [{ key: 'imei', label: t('رقم IMEI'), placeholder: 'مثال: 356938035643809', required: true }];
    return [];
  })();

  const allRequiredFilled = orderFields.filter(f => f.required !== false).every(f => (formValues[f.key] || '').trim().length > 0);

  useEffect(() => {
    let cancelled = false;
    const hasCachedBalance = walletBalance !== null;
    async function loadProfile() {
      if (!hasCachedBalance) setLoadingProfile(true);
      try {
        if (!isLoggedIn) { if (!cancelled) setWalletBalance(null); return; }
        const res = await storeApi.getProfile();
        const customer = res?.customer || res;
        const balance = Number(customer?.wallet_balance ?? customer?.balance ?? 0);
        if (!cancelled) {
          setWalletBalance(Number.isFinite(balance) ? balance : 0);
          try {
            const cached = localStorage.getItem('_sidebar_profile');
            const p = cached ? JSON.parse(cached) : {};
            p.balance = Number.isFinite(balance) ? balance : 0;
            localStorage.setItem('_sidebar_profile', JSON.stringify(p));
          } catch {}
        }
      } catch { if (!cancelled) setWalletBalance(null); }
      finally { if (!cancelled) setLoadingProfile(false); }
    }
    loadProfile();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const canPayWithWallet = walletBalance !== null && walletBalance >= totalPrice;

  const submitOrder = async () => {
    if (submitting) return;
    setError(null);
    if (!isLoggedIn) { setError(t('يرجى تسجيل الدخول أولاً')); return; }
    if (loadingProfile || walletBalance === null) { setError(t('تعذر تحميل رصيد المحفظة')); return; }
    if (!canPayWithWallet) { setError(t('رصيد المحفظة غير كافٍ')); return; }

    setSubmitting(true);
    try {
      const imeiValue = (formValues.imei || '').trim();
      const otherFields = Object.fromEntries(
        Object.entries(formValues).filter(([k, v]) => k !== 'imei' && String(v || '').trim().length > 0)
          .map(([k, v]) => {
            const field = orderFields.find(f => f.key === k);
            return [field?.originalKey || k, String(v).trim()];
          })
      );
      const notes = Object.keys(otherFields).length > 0 ? JSON.stringify(otherFields) : undefined;
      await storeApi.createOrder({
        product_id: product.id, product_name: product.name,
        quantity: qty, unit_price: unitPrice, payment_method: 'wallet',
        ...(imeiValue ? { imei: imeiValue } : {}),
        ...(notes ? { notes } : {}),
      });
      setWalletBalance(b => (typeof b === 'number' ? Math.max(0, b - totalPrice) : b));
      setStep(3);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('فشل إرسال الطلب');
      setError(msg || t('فشل إرسال الطلب'));
      setStep(2);
    } finally { setSubmitting(false); }
  };

  const filledFields = orderFields.map(f => ({ label: f.label, value: (formValues[f.key] || '').trim() })).filter(f => f.value);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'grid', placeItems: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 0,
        width: '90%', maxWidth: 440, maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '1px solid var(--border-light)',
        animation: 'aflSlideUp 0.3s ease',
      }}>
        {/* Close button */}
        <div style={{ padding: '1rem 1.25rem 0', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={onClose} style={{
            background: 'var(--bg-muted)', border: 'none', width: 32, height: 32, borderRadius: 8,
            cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--text-muted)',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Product icon + name */}
        <div style={{ textAlign: 'center', padding: '0.5rem 1.25rem 1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 8px',
            background: 'var(--bg-subtle)', display: 'grid', placeItems: 'center',
            fontSize: '1.8rem', border: '1px solid var(--border-light)',
          }}>
            {product.icon?.startsWith('http') || product.icon?.startsWith('/') ? (
              <img src={product.icon} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
            ) : (product.icon || '📦')}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{product.name}</h3>
        </div>

        <div style={{ padding: '0 1.25rem 1.5rem' }}>
          {/* ─── Step 1: Form ─── */}
          {step === 1 && (
            <>
              {/* Service options (quantity presets if applicable) */}
              {product.allowsQuantity && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: currentTheme.primary }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: currentTheme.primary }}>{t('خيارات الخدمة')}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>{t('اختر خياراً واحداً. السعر يظهر بجانب كل خيار.')}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[1, 2, 3, 5, 10, 15, 20, 50].filter(q => q >= (product.minQuantity || 1) && q <= (product.maxQuantity || 100)).slice(0, 8).map(q => (
                      <button key={q} onClick={() => setQty(q)} style={{
                        padding: '0.75rem 1rem', borderRadius: 12, textAlign: 'right',
                        background: qty === q ? `${currentTheme.primary}18` : 'var(--bg-subtle)',
                        border: qty === q ? `1.5px solid ${currentTheme.primary}` : '1.5px solid var(--border-default)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{q} {t('عمله')}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: currentTheme.primary }}>SDG {(unitPrice * q).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom fields */}
              {orderFields.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: currentTheme.primary }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: currentTheme.primary }}>{t('البيانات المطلوبة للتفعيل')}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    {t('أدخل البيانات أدناه كما هي مطلوبة لتفعيل الخدمة (بريد، معرفة، كلمة مرور، إلخ).')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {orderFields.map(field => (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textAlign: 'right' }}>
                          {t(field.label)}{field.required !== false && <span style={{ color: '#ef4444' }}> *</span>}
                        </label>
                        <input
                          value={formValues[field.key] || ''}
                          onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder || `${t('أدخل')} ${t(field.label)}`}
                          style={{
                            width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
                            border: '1.5px solid var(--border-default)', fontSize: '0.88rem',
                            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                            background: 'var(--bg-input)', color: 'var(--text-primary)',
                            textAlign: 'right',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total price */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem 1rem', borderRadius: 12,
                background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
                marginBottom: 16,
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: currentTheme.primary }}>
                  SDG {totalPrice.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('المبلغ الإجمالي')}</span>
              </div>

              {error && (
                <div style={{
                  marginBottom: 12, padding: '0.75rem 1rem', borderRadius: 12,
                  background: '#fef2f220', border: '1px solid #fecaca40',
                  color: '#f87171', fontSize: '0.82rem', fontWeight: 700,
                }}>{error}</div>
              )}

              {/* Submit button */}
              <button
                onClick={() => { setError(null); setStep(2); }}
                disabled={!allRequiredFilled || loadingProfile || !isLoggedIn || !canPayWithWallet}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 12,
                  background: (!canPayWithWallet && isLoggedIn && walletBalance !== null && !loadingProfile)
                    ? '#ef4444'
                    : `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                  color: '#000', border: 'none', fontSize: '0.95rem', fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: (allRequiredFilled && canPayWithWallet) ? 'pointer' : 'not-allowed',
                  opacity: (allRequiredFilled && canPayWithWallet) ? 1 : 0.6,
                  boxShadow: `0 4px 16px ${currentTheme.primary}30`,
                }}
              >
                {(isLoggedIn && walletBalance !== null && !loadingProfile && !canPayWithWallet)
                  ? t('الرصيد غير كافٍ لإتمام الطلب')
                  : t('شراء الآن')}
              </button>
            </>
          )}

          {/* ─── Step 2: Confirmation ─── */}
          {step === 2 && (
            <>
              <div style={{
                background: 'var(--bg-subtle)', borderRadius: 12, padding: '1rem',
                marginBottom: 12, border: '1px solid var(--border-default)',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>📝 {t('ملخص الطلب')}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '60%', textAlign: 'left', lineHeight: 1.3 }}>{product.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('المنتج')}</span>
                </div>
                {filledFields.map(f => (
                  <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', direction: 'ltr', fontFamily: 'monospace' }}>{f.value}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.label}</span>
                  </div>
                ))}
                {product.allowsQuantity && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{qty}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('الكمية')}</span>
                  </div>
                )}
                <div style={{ height: 1, background: 'var(--border-default)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: currentTheme.primary }}>SDG {totalPrice.toLocaleString()}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('المبلغ الإجمالي')}</span>
                </div>
              </div>

              {error && (
                <div style={{
                  marginBottom: 12, padding: '0.75rem 1rem', borderRadius: 12,
                  background: '#fef2f220', border: '1px solid #fecaca40',
                  color: '#f87171', fontSize: '0.82rem', fontWeight: 700,
                }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setError(null); setStep(1); }} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 12,
                  background: 'var(--bg-muted)', color: 'var(--text-primary)',
                  border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {isRTL ? `→ ${t('تعديل')}` : `← ${t('تعديل')}`}
                </button>
                <button onClick={submitOrder} disabled={submitting || !canPayWithWallet} style={{
                  flex: 2, padding: '0.75rem', borderRadius: 12,
                  background: canPayWithWallet ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})` : '#ef4444',
                  color: '#000', border: 'none', fontSize: '0.9rem', fontWeight: 800,
                  cursor: canPayWithWallet && !submitting ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  opacity: submitting ? 0.7 : 1,
                }}>
                  {submitting ? t('جارٍ إرسال الطلب...') : !canPayWithWallet ? t('الرصيد غير كافٍ') : `✓ ${t('تأكيد الطلب')}`}
                </button>
              </div>
            </>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `${currentTheme.primary}20`,
                display: 'grid', placeItems: 'center', margin: '0 auto 16px',
              }}>
                <CheckCircle size={32} color={currentTheme.primary} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t('تم إرسال الطلب بنجاح!')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة "طلباتي".')}</p>
              <button onClick={onClose} style={{
                marginTop: 20, padding: '0.65rem 2rem', borderRadius: 12,
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                color: '#000', border: 'none', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>{t('حسناً')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp Floating Button ───
function WhatsAppButton() {
  const { socialLinks } = useTheme();
  const url = socialLinks?.whatsapp || 'https://wa.me/';
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="afl-whatsapp-float" aria-label="WhatsApp">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

// ─── Dark Mode Toggle ───
function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();
  return (
    <button className="afl-theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
      {darkMode ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

// ─── الصفحة الرئيسية ───
export default function HomePage() {
  const { currentTheme, t } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('afl_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) { setProducts(parsed); setLoading(false); }
      }
    } catch {}

    async function load() {
      try {
        const res = await storeApi.getProducts();
        if (Array.isArray(res) && res.length > 0) {
          setProducts(res as Product[]);
          try { localStorage.setItem('afl_products_cache', JSON.stringify(res)); } catch {}
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const gameProducts = products.filter(p => p.is_game);
  const activationProducts = products.filter(p => !p.is_game);
  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <HeroBanner />
      <FeatureCards />

      {/* مركز الألعاب */}
      {(gameProducts.length > 0 || loading) && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
              {t('مركز الألعاب')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              PUBG، Free Fire، ببليستيشن — {t('شحن فوري بال ID')}
            </p>
          </div>
          <div className="store-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>{t('جاري التحميل...')}</div>
            ) : gameProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎮</p>
                <p style={{ fontWeight: 700 }}>{t('لا توجد ألعاب بعد')}</p>
              </div>
            ) : (
              gameProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />)
            )}
          </div>
          {gameProducts.length > 8 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link href="/services?cat=games" style={{
                padding: '0.55rem 1.5rem', borderRadius: 10,
                border: `1px solid ${currentTheme.primary}`, color: currentTheme.primary,
                fontSize: '0.82rem', fontWeight: 700,
              }}>
                {t('عرض الكل')} →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* التفعيلات العامة */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
            {t('التفعيلات العامة')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {t('ويندوز، أدوبي، ومفاتيح برمجيات')} — {t('أسعار بالجنيه السوداني (SDG)')}
          </p>
        </div>
        <div className="store-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>{t('جاري التحميل...')}</div>
          ) : activationProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>📦</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{t('لا توجد منتجات بعد')}</p>
              <p style={{ fontSize: '0.8rem' }}>{t('سيتم عرض المنتجات هنا بعد إضافتها من لوحة التحكم')}</p>
            </div>
          ) : (
            activationProducts.slice(0, 16).map(p => <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />)
          )}
        </div>
        {activationProducts.length > 16 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href="/services" style={{
              padding: '0.55rem 1.5rem', borderRadius: 10,
              border: `1px solid ${currentTheme.primary}`, color: currentTheme.primary,
              fontSize: '0.82rem', fontWeight: 700,
            }}>
              {t('عرض الكل')} →
            </Link>
          </div>
        )}
      </section>

      {/* المنتجات المميزة */}
      {featuredProducts.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
              🔥 {t('المنتجات المميزة')}
            </h2>
          </div>
          <div className="store-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {featuredProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />)}
          </div>
        </section>
      )}

      {selectedProduct && <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <WhatsAppButton />
      <ThemeToggle />
    </div>
  );
}
