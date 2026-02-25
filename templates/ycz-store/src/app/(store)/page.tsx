'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Shield, DollarSign, Headphones, ChevronDown, X, CheckCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { STEPS_DATA } from '@/lib/mockData';
import { storeApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import SeoHead from '@/components/seo/SeoHead';
import JsonLd from '@/components/seo/JsonLd';

// ─── HeroBanner (Modern animated hero with particles, glassmorphism, progress bar) ───
function HeroBanner() {
  const { currentTheme, showBanner, buttonRadius, t, isRTL } = useTheme();
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const banners = [
    {
      icon: '🚀',
      title: t('مرحباً بك'),
      subtitle: t('متجرك الإلكتروني جاهز'),
      desc: t('أضف منتجاتك وابدأ البيع الآن'),
      gradient: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.accent} 100%)`,
      meshColor1: 'rgba(255,255,255,0.12)',
      meshColor2: 'rgba(255,255,255,0.06)',
    },
    {
      icon: '⚡',
      title: t('خدمات متنوعة'),
      subtitle: t('كل ما تحتاجه في مكان واحد'),
      desc: t('تصفح الخدمات واطلب بسهولة'),
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      meshColor1: 'rgba(255,200,50,0.15)',
      meshColor2: 'rgba(239,68,68,0.1)',
    },
    {
      icon: '🛡️',
      title: t('دعم فني'),
      subtitle: t('نحن هنا لمساعدتك'),
      desc: t('فريق دعم متاح على مدار الساعة'),
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
      meshColor1: 'rgba(6,182,212,0.15)',
      meshColor2: 'rgba(139,92,246,0.1)',
    },
  ];

  const DURATION = 5000;

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();
    const frame = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef = requestAnimationFrame(frame);
    };
    let rafRef = requestAnimationFrame(frame);

    const timer = setTimeout(() => {
      setActive(p => (p + 1) % banners.length);
      setAnimKey(k => k + 1);
    }, DURATION);

    return () => {
      cancelAnimationFrame(rafRef);
      clearTimeout(timer);
    };
  }, [active, banners.length]);

  if (!showBanner) return null;
  const b = banners[active];

  // Floating particles/shapes positions
  const particles = [
    { size: 60, top: '10%', right: '8%', delay: '0s', dur: '6s', opacity: 0.08 },
    { size: 40, top: '60%', right: '15%', delay: '1s', dur: '8s', opacity: 0.06 },
    { size: 80, top: '20%', right: '35%', delay: '2s', dur: '7s', opacity: 0.05 },
    { size: 30, top: '70%', right: '50%', delay: '0.5s', dur: '9s', opacity: 0.07 },
    { size: 50, top: '5%', right: '60%', delay: '1.5s', dur: '6.5s', opacity: 0.06 },
    { size: 20, top: '80%', right: '75%', delay: '3s', dur: '5s', opacity: 0.09 },
  ];

  return (
    <div
      style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        background: b.gradient, marginBottom: '1.5rem',
        minHeight: 200, padding: 0,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Animated mesh/blob background ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Large animated gradient orb */}
        <div className="hero-orb hero-orb-1" style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, ${b.meshColor1} 0%, transparent 70%)`,
          top: '-20%', right: '-10%', filter: 'blur(40px)',
        }} />
        <div className="hero-orb hero-orb-2" style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${b.meshColor2} 0%, transparent 70%)`,
          bottom: '-15%', left: '-5%', filter: 'blur(30px)',
        }} />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div key={i} className="hero-particle" style={{
            position: 'absolute', width: p.size, height: p.size, borderRadius: '50%',
            background: 'rgba(255,255,255,' + p.opacity + ')',
            top: p.top, right: p.right,
            animationDelay: p.delay, animationDuration: p.dur,
          }} />
        ))}

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* ── Content with slide animation ── */}
      <div key={animKey} className="hero-slide-in" style={{
        position: 'relative', zIndex: 2,
        padding: '2rem 2rem 1rem',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        {/* Animated icon bubble */}
        <div className="hero-icon-bubble" style={{
          width: 64, height: 64, borderRadius: 18, flexShrink: 0,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'grid', placeItems: 'center', fontSize: '1.8rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          {b.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Animated tag */}
          <div className="hero-tag" style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
            marginBottom: 8, letterSpacing: '0.5px',
          }}>
            {b.title}
          </div>

          <h2 className="store-hero-title" style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.7rem)', fontWeight: 800, color: '#fff',
            marginBottom: 6, lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {b.subtitle}
          </h2>

          <p style={{
            fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)',
            marginBottom: 16, lineHeight: 1.5, maxWidth: 400,
          }}>
            {b.desc}
          </p>

         <Link href="/services" style={{ textDecoration: 'none' }}>
          <button className="hero-cta-btn" style={{
            padding: '0.6rem 1.5rem', borderRadius: btnR,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.3s',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {t('تسوق الآن')}
            <span style={{ transition: 'transform 0.3s' }}>{isRTL ? '←' : '→'}</span>
          </button>
         </Link>
        </div>
      </div>

      {/* ── Bottom bar: progress + dot indicators ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '0 2rem 1.2rem',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* Slide indicators */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setAnimKey(k => k + 1); }}
              style={{
                position: 'relative', width: i === active ? 32 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === active ? 'transparent' : 'rgba(255,255,255,0.3)',
                overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                padding: 0,
              }}
            >
              {i === active && (
                <>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 4,
                    background: 'rgba(255,255,255,0.25)',
                  }} />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    borderRadius: 4, background: '#fff',
                    width: `${progress}%`, transition: 'width 0.1s linear',
                  }} />
                </>
              )}
            </button>
          ))}
        </div>

        {/* Slide counter */}
        <span style={{
          fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(active + 1).padStart(2, '0')}/{String(banners.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ─── ProductCard (Demo-style: simpler, emoji on gray bg, availability badge) ───
function ProductCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  const { currentTheme, buttonRadius, t } = useTheme();
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  return (
    <div onClick={onClick} className="store-product-card" style={{
      background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '1rem',
      cursor: 'pointer', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: 8, height: 48, display: 'grid', placeItems: 'center', background: 'var(--bg-subtle)', borderRadius: 10 }}>
        {product.icon}
      </div>
      <p style={{ fontSize: '0.7rem', color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{t(product.category)}</p>
      <h4 style={{
        fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '2.52rem',
      }}>{product.name}</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: currentTheme.primary }}>{product.price}</span>
          {product.originalPrice && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: 6 }}>{product.originalPrice}</span>}
        </div>
        <div style={{ padding: '0.35rem 0.75rem', borderRadius: btnR, background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700 }}>
          {t('متاح')}
        </div>
      </div>
    </div>
  );
}

// ─── OrderModal (Enhanced: rich product details + confirmation step) ───
function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currentTheme, buttonRadius, t, isRTL } = useTheme();
  const [step, setStep] = useState(1); // 1=form, 2=confirm, 3=success
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(product.minQuantity || 1);
  const [descOpen, setDescOpen] = useState(false);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const parsePriceToNumber = (price: string): number => {
    const cleaned = String(price || '').replace(/[^0-9.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const unitPrice = parsePriceToNumber(product.price);
  const originalPriceNum = product.originalPrice ? parsePriceToNumber(product.originalPrice) : 0;
  const discountPct = originalPriceNum > unitPrice && originalPriceNum > 0 ? Math.round(((originalPriceNum - unitPrice) / originalPriceNum) * 100) : 0;
  const totalPrice = unitPrice * qty;
  const serviceType = String(product.service_type || '').toUpperCase();

  const orderFields = (() => {
    if (Array.isArray(product.customFields) && product.customFields.length > 0) {
      return product.customFields;
    }
    if (serviceType === 'IMEI') {
      return [{ key: 'imei', label: t('رقم IMEI'), placeholder: 'مثال: 356938035643809', required: true }];
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
      setError(t('يرجى تسجيل الدخول أولاً'));
      return;
    }

    if (loadingProfile || walletBalance === null) {
      setError(t('تعذر تحميل رصيد المحفظة'));
      return;
    }

    if (!canPayWithWallet) {
      setError(t('رصيد المحفظة غير كافٍ'));
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
      setStep(3);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('فشل إرسال الطلب');
      setError(msg || t('فشل إرسال الطلب'));
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const filledFields = orderFields.map(f => ({ label: f.label, value: (formValues[f.key] || '').trim() })).filter(f => f.value);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 440, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {step === 1 ? t('طلب المنتج') : step === 2 ? t('تأكيد الطلب') : t('تم الطلب')}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg-muted)', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* ─── Enhanced Product Info ─── */}
        <div style={{
          padding: '1rem',
          background: `linear-gradient(135deg, ${currentTheme.primary}08 0%, ${currentTheme.primary}15 100%)`,
          borderRadius: 14,
          marginBottom: 16,
          border: `1px solid ${currentTheme.primary}20`,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              fontSize: '2rem', width: 56, height: 56, display: 'grid', placeItems: 'center',
              background: 'var(--bg-card)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', flexShrink: 0,
            }}>{product.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, color: currentTheme.primary,
                  background: `${currentTheme.primary}15`, padding: '2px 8px', borderRadius: 6,
                }}>{t(product.category || 'عام')}</span>
                {serviceType && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, color: '#fff',
                    background: serviceType === 'IMEI' ? '#3b82f6' : '#8b5cf6',
                    padding: '2px 8px', borderRadius: 6,
                  }}>{serviceType}</span>
                )}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 2 }}>{product.name}</h4>
              {/* Service time (priority) or Group name (fallback) */}
              {product.service_time ? (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>⏱</span> {t('وقت الخدمة:')} {product.service_time}
                </p>
              ) : product.group_name ? (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>📁</span> {product.group_name}
                </p>
              ) : null}
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
            padding: '0.6rem 0.8rem', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)',
          }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: currentTheme.primary }}>{product.price}</span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{product.originalPrice}</span>
                {discountPct > 0 && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>−{discountPct}%</span>
                )}
              </>
            )}
          </div>

          {product.desc && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setDescOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem',
                  color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: 0,
                }}
              >
                <span>📋</span> {t('تفاصيل المنتج')}
                <ChevronDown size={12} style={{ transform: descOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {descOpen && (
                <p style={{
                  marginTop: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                  background: 'var(--bg-card)', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid var(--border-light)',
                }}>{product.desc}</p>
              )}
            </div>
          )}
        </div>

        {/* ─── Step 1: Form ─── */}
        {step === 1 && (
          <>
            {product.allowsQuantity && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 12, marginBottom: 12, border: '1px solid var(--border-default)' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{t('الكمية')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
                  <button onClick={() => setQty(q => Math.max(product.minQuantity || 1, q - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}>−</button>
                  <input type="number" value={qty} min={product.minQuantity || 1} max={product.maxQuantity || 100} onChange={e => { const v = Math.max(product.minQuantity || 1, Math.min(product.maxQuantity || 100, Number(e.target.value) || 1)); setQty(v); }} style={{ width: 50, textAlign: 'center', padding: '0.4rem', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
                  <button onClick={() => setQty(q => Math.min(product.maxQuantity || 100, q + 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}>+</button>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: currentTheme.primary, whiteSpace: 'nowrap' }}>${totalPrice.toFixed(2)}</span>
              </div>
            )}

            <div style={{
              padding: '0.75rem 1rem', borderRadius: 12,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              marginBottom: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
              fontSize: '0.82rem',
            }}>
              <div style={{ color: '#f8fafc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1rem' }}>💳</span> {t('الدفع بالمحفظة')}
              </div>
              <div style={{ color: canPayWithWallet ? '#4ade80' : '#f87171', fontWeight: 800, textAlign: 'left' }}>
                {loadingProfile ? t('جاري جلب الرصيد...') : walletBalance === null ? t('غير متاح') : `$${walletBalance.toFixed(2)}`}
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: 12, padding: '0.75rem 1rem', borderRadius: 12,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700,
              }}>{error}</div>
            )}

            {orderFields.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                {t('لا توجد حقول إضافية مطلوبة لهذا المنتج.')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orderFields.map((field) => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {t(field.label)}
                      {field.required !== false && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <input
                      value={formValues[field.key] || ''}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={`${t('أدخل')} ${t(field.label)}`}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid var(--border-default)', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { setError(null); setStep(2); }}
              disabled={!allRequiredFilled || loadingProfile || !isLoggedIn}
              style={{
                width: '100%', marginTop: 16, padding: '0.75rem', borderRadius: btnR,
                background: currentTheme.primary, color: '#fff', border: 'none',
                fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit',
                cursor: allRequiredFilled ? 'pointer' : 'not-allowed',
                opacity: allRequiredFilled ? 1 : 0.6,
              }}>
              {isRTL ? `${t('متابعة')} ←` : `${t('متابعة')} →`}
            </button>

            {isLoggedIn && walletBalance !== null && !loadingProfile && !canPayWithWallet && (
              <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                {t('الرصيد غير كافٍ لإتمام الطلب')} (${totalPrice.toFixed(2)})
              </p>
            )}
          </>
        )}

        {/* ─── Step 2: Confirmation Summary ─── */}
        {step === 2 && (
          <>
            <div style={{
              background: 'var(--bg-subtle)', borderRadius: 12, padding: '1rem', marginBottom: 12,
              border: '1px solid var(--border-default)',
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                📝 {t('ملخص الطلب')}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('المنتج')}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '60%', textAlign: 'left', lineHeight: 1.3 }}>{product.name}</span>
              </div>

              {filledFields.map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', direction: 'ltr', fontFamily: 'monospace' }}>{f.value}</span>
                </div>
              ))}

              {product.allowsQuantity && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('الكمية')}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{qty}</span>
                </div>
              )}

              <div style={{ height: 1, background: 'var(--border-default)', margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('المبلغ الإجمالي')}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: currentTheme.primary }}>${totalPrice.toFixed(2)}</span>
              </div>

              {walletBalance !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('الرصيد بعد الخصم')}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: (walletBalance - totalPrice) >= 0 ? '#16a34a' : '#ef4444' }}>
                    ${Math.max(0, walletBalance - totalPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                marginBottom: 12, padding: '0.75rem 1rem', borderRadius: 12,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700,
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setError(null); setStep(1); }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: btnR, background: 'var(--bg-muted)', color: 'var(--text-primary)', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isRTL ? `→ ${t('تعديل')}` : `← ${t('تعديل')}`}
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting || !canPayWithWallet}
                style={{
                  flex: 2, padding: '0.75rem', borderRadius: btnR,
                  background: canPayWithWallet ? currentTheme.primary : '#94a3b8',
                  color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700,
                  cursor: canPayWithWallet && !submitting ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  opacity: submitting ? 0.7 : 1,
                }}>
                {submitting ? t('جارٍ إرسال الطلب...') : `✓ ${t('تأكيد الطلب')}`}
              </button>
            </div>

            {!canPayWithWallet && (
              <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#ef4444', fontWeight: 700, textAlign: 'center' }}>
                {t('الرصيد غير كافٍ لإتمام الطلب')} (${totalPrice.toFixed(2)})
              </p>
            )}
          </>
        )}

        {/* ─── Step 3: Success ─── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t('تم إرسال الطلب بنجاح!')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة "طلباتي".')}</p>
            {walletBalance !== null && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>{t('الرصيد المتبقي:')} <strong style={{ color: 'var(--text-primary)' }}>${walletBalance.toFixed(2)}</strong></p>
            )}
            <button onClick={onClose} style={{ marginTop: 20, padding: '0.65rem 2rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t('حسناً')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ───
export default function HomePage() {
  const { currentTheme, t } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // 1. تحميل فوري من الكاش المحلي
    try {
      const cached = localStorage.getItem('ycz_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
        }
      }
    } catch {}

    // 2. جلب البيانات الحديثة من السيرفر في الخلفية
    async function load() {
      try {
        const res = await storeApi.getProducts();
        if (Array.isArray(res) && res.length > 0) {
          setProducts(res as Product[]);
          try { localStorage.setItem('ycz_products_cache', JSON.stringify(res)); } catch {}
        }
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('متجر خدمات رقمية'),
    url: typeof window !== 'undefined' ? window.location.origin : 'https://magicdesign3.com',
    description: t('المتجر — خدمات رقمية'),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: (typeof window !== 'undefined' ? window.location.origin : 'https://magicdesign3.com') + '/services?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <SeoHead
        title={t('الرئيسية — متجر خدمات رقمية')}
        description={t('متجر خدمات رقمية')}
        keywords="iCloud remove, iPhone unlock, Samsung unlock, FRP bypass, IMEI check, Unlocktool, Z3X, Chimera Tool, Octoplus, PUBG UC, Free Fire diamonds, Google Play gift card, PlayStation card"
      />
      <JsonLd data={jsonLdData} />
      <HeroBanner />

      {/* المنتجات المميزة */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('🔥 المنتجات المميزة')}</h3>
          <Link href="/services" style={{ background: 'none', border: 'none', color: currentTheme.primary, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t('عرض الكل ←')}</Link>
        </div>
        <div className="store-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>{t('جاري التحميل...')}</div>
          ) : products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>📦</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{t('لا توجد منتجات بعد')}</p>
              <p style={{ fontSize: '0.8rem' }}>{t('سيتم عرض المنتجات هنا بعد إضافتها من لوحة التحكم')}</p>
            </div>
          ) : (
            (products.filter(p => p.is_featured).length > 0 ? products.filter(p => p.is_featured) : products).slice(0, 15).map(p => <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />)
          )}
        </div>
      </section>

      {/* كيف تطلب */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '1.5rem' }}>{t('كيف تطلب؟')}</h3>
        <div className="store-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {STEPS_DATA.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{step.icon}</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: currentTheme.primary, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 8px', fontSize: '0.8rem', fontWeight: 800 }}>{i + 1}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{t(step.title)}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t(step.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* لماذا نحن */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '1.5rem' }}>{t('لماذا نحن؟')}</h3>
        <div className="store-about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: <Zap size={24} />, title: t('تنفيذ سريع'), desc: t('طلباتك تُنفَّذ خلال دقائق'), color: '#f59e0b' },
            { icon: <Shield size={24} />, title: t('حماية بياناتك'), desc: t('تشفير SSL وحماية متقدمة'), color: '#3b82f6' },
            { icon: <DollarSign size={24} />, title: t('أسعار منافسة'), desc: t('أفضل أسعار في السوق'), color: '#22c55e' },
            { icon: <Headphones size={24} />, title: t('دعم مستمر'), desc: t('فريق دعم متاح على مدار الساعة'), color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                {item.icon}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {selectedProduct && <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
