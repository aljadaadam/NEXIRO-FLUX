'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle, ChevronDown } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import SeoHead from '@/components/seo/SeoHead';
import JsonLd from '@/components/seo/JsonLd';

// ─── OrderModal (Demo-style: IMEI input → success) ───
function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { currentTheme, buttonRadius, t } = useTheme();
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

      // تحديث الرصيد محلياً فوراً
      setWalletBalance((b) => (typeof b === 'number' ? Math.max(0, b - totalPrice) : b));
      setStep(2);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('فشل إرسال الطلب');
      setError(msg || t('فشل إرسال الطلب'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 440, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020' }}>{t('طلب المنتج')}</h3>
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
                <span>⏱</span> {t('وقت الخدمة:')} {product.service_time}
              </p>
            )}
          </div>
        </div>

        {/* Quantity Input */}
        {product.allowsQuantity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 12, marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>{t('الكمية')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
              <button onClick={() => setQty(q => Math.max(product.minQuantity || 1, q - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'grid', placeItems: 'center' }}>−</button>
              <input type="number" value={qty} min={product.minQuantity || 1} max={product.maxQuantity || 100} onChange={e => { const v = Math.max(product.minQuantity || 1, Math.min(product.maxQuantity || 100, Number(e.target.value) || 1)); setQty(v); }} style={{ width: 50, textAlign: 'center', padding: '0.4rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
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
            <span style={{ fontSize: '1rem' }}>💳</span> {t('الدفع بالمحفظة')}
          </div>
          <div style={{ color: canPayWithWallet ? '#4ade80' : '#f87171', fontWeight: 800, textAlign: 'left' }}>
            {loadingProfile ? t('جاري جلب الرصيد...') : walletBalance === null ? t('غير متاح') : `$${walletBalance.toFixed(2)}`}
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
                {t('لا توجد حقول إضافية مطلوبة لهذا المنتج.')}
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
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={submitOrder}
              disabled={!allRequiredFilled || submitting || loadingProfile || !isLoggedIn}
              style={{ width: '100%', marginTop: 16, padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: allRequiredFilled ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: allRequiredFilled ? 1 : 0.6 }}>
              {submitting ? t('جارٍ إرسال الطلب...') : t('تقديم الطلب')}
            </button>

            {isLoggedIn && walletBalance !== null && !loadingProfile && !canPayWithWallet && (
              <p style={{ marginTop: 10, fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                {t('الرصيد غير كافٍ لإتمام الطلب')} (${totalPrice.toFixed(2)})
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>{t('تم إرسال الطلب بنجاح!')}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('سيتم معالجة طلبك خلال دقائق. يمكنك متابعة حالة الطلب من صفحة "طلباتي".')}</p>
            {walletBalance !== null && (
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 6 }}>{t('الرصيد المتبقي:')} <strong style={{ color: '#0b1020' }}>${walletBalance.toFixed(2)}</strong></p>
            )}
            <button onClick={onClose} style={{ marginTop: 20, padding: '0.65rem 2rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t('حسناً')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── صفحة الخدمات (Demo-style) ───
export default function ServicesPage() {
  const { currentTheme, buttonRadius, t } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGroup, setActiveGroup] = useState('all');
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

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

  const DEFAULT_CATEGORIES = [
    { id: 'all', name: t('الكل'), icon: '📦' },
    { id: 'أدوات سوفتوير', name: t('أدوات سوفتوير'), icon: '🛠️' },
    { id: 'خدمات IMEI', name: t('خدمات IMEI'), icon: '📱' },
    { id: 'ألعاب', name: t('ألعاب'), icon: '🎮' },
  ];

  // تثبيت التصنيفات على القيم المعتمدة فقط
  const categories = DEFAULT_CATEGORIES;

  // حتى تبويب "الكل" يعرض فقط المنتجات ضمن التصنيفات المعتمدة
  const normalizedProducts = products
    .map((p) => {
      const serviceType = String((p as { service_type?: string }).service_type || '').toUpperCase();
      const rawCategory = String(p.category || '');

      // ألعاب أولاً — حتى لو service_type كان IMEI أو SERVER
      if (rawCategory === 'ألعاب') {
        return { ...p, category: 'ألعاب' };
      }

      if (serviceType === 'IMEI' || rawCategory === 'IMEI' || rawCategory === 'خدمات IMEI') {
        return { ...p, category: 'خدمات IMEI' };
      }

      if (serviceType === 'SERVER' || rawCategory === 'منتجات سوفت وير' || rawCategory === 'أدوات سوفتوير') {
        return { ...p, category: 'أدوات سوفتوير' };
      }

      return null;
    })
    .filter((p): p is Product => p !== null);

  const groupSourceCategory = activeCategory === 'أدوات سوفتوير' || activeCategory === 'خدمات IMEI'
    ? activeCategory
    : '';

  const availableGroups = groupSourceCategory
    ? Array.from(new Set(
      normalizedProducts
        .filter((p) => p.category === groupSourceCategory)
        .map((p) => String(p.group_name || '').trim())
        .filter((g) => g.length > 0)
    ))
    : [];

  useEffect(() => {
    setActiveGroup('all');
    setGroupsOpen(false);
  }, [activeCategory]);

  const filtered = normalizedProducts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchGroup = activeGroup === 'all' || String(p.group_name || '').trim() === activeGroup;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search);
    return matchCat && matchGroup && matchSearch;
  });

  const servicesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'خدمات المتجر',
    description: 'جميع خدمات فتح الشبكات وإزالة iCloud وأدوات السوفتوير وشحن الألعاب',
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.category || 'خدمة رقمية',
        offers: {
          '@type': 'Offer',
          price: String(p.price || '').replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <SeoHead
        title="جميع الخدمات — فتح شبكات، إزالة iCloud، أدوات سوفتوير، شحن ألعاب"
        description="تصفّح جميع خدماتنا: إزالة iCloud لجميع أجهزة iPhone و iPad، فتح شبكات Samsung و Xiaomi و Motorola، أدوات سوفتوير مثل Unlocktool و Z3X و Chimera و Octoplus و Sigma Plus و NCK، إزالة FRP، فحص IMEI، شحن PUBG و Free Fire، بطاقات Google Play و PlayStation و Xbox و TikTok Coins."
        keywords="iCloud remove, iPhone unlock, Samsung unlock, Samsung FRP remove, Xiaomi Mi Account remove, Unlocktool, Z3X, EFT Pro, Chimera Tool, Octoplus, Sigma Plus, NCK Box, UMT Box, Hydra Tool, Griffin Unlocker, Borneo Schematics, DC Unlocker, HCU, Cheetah Tool, DFT Pro, Halabtech, iRemoval Pro, TSM Tool, PUBG UC, Free Fire diamonds, AT&T unlock, T-Mobile unlock, Verizon unlock, Google Play gift card, PlayStation card, Xbox card, TikTok coins, Telegram Premium, فتح شبكات, إزالة iCloud, أدوات صيانة, شحن ألعاب, فحص IMEI, إزالة FRP, بطاقات هدايا, أدوات سوفتوير"
        canonical="/services"
      />
      <JsonLd data={servicesJsonLd} />
      {/* Banner */}
      <div style={{ borderRadius: 20, overflow: 'hidden', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('تصفّح جميع خدماتنا')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{t('اختر الخدمة المناسبة من بين مجموعة واسعة')}</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            padding: '0.5rem 1rem', borderRadius: btnR, border: 'none', cursor: 'pointer',
            background: activeCategory === cat.id ? currentTheme.primary : '#fff',
            color: activeCategory === cat.id ? '#fff' : '#64748b',
            fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1rem', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', marginBottom: 20, position: 'relative' }}>
        <Search size={16} color="#94a3b8" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('بحث في الخدمات...')} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem', fontFamily: 'inherit', color: '#0b1020', background: 'transparent' }} />

        <div style={{ position: 'relative', minWidth: 0, width: 'clamp(140px, 42vw, 240px)' }}>
          <button
            onClick={() => setGroupsOpen((v) => !v)}
            disabled={!groupSourceCategory}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.7rem', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: groupSourceCategory ? '#334155' : '#94a3b8',
              cursor: groupSourceCategory ? 'pointer' : 'not-allowed',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
              width: '100%', minWidth: 0, justifyContent: 'space-between', overflow: 'hidden',
            }}
          >
            <span style={{ flex: 1, minWidth: 0, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
              {activeGroup === 'all' ? t('اختر الجروب') : activeGroup}
            </span>
            <ChevronDown size={14} />
          </button>

          {groupsOpen && groupSourceCategory && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              width: '100%', minWidth: 220, background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 20,
              maxHeight: 260, overflowY: 'auto',
            }}>
              <button
                onClick={() => { setActiveGroup('all'); setGroupsOpen(false); }}
                style={{
                  width: '100%', textAlign: 'right', padding: '0.6rem 0.8rem', border: 'none', background: activeGroup === 'all' ? '#f8fafc' : '#fff',
                  fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer', color: '#334155',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {t('كل الجروبات')}
              </button>

              {availableGroups.length === 0 ? (
                <div style={{ padding: '0.7rem 0.8rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {t('لا توجد جروبات ضمن هذا التصنيف')}
                </div>
              ) : (
                availableGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => { setActiveGroup(group); setGroupsOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'right', padding: '0.6rem 0.8rem', border: 'none', background: activeGroup === group ? '#f8fafc' : '#fff',
                      fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer', color: '#334155',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {group}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="store-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map(p => (
          <div key={p.id} onClick={() => setOrderProduct(p)} className="store-product-card" style={{
            background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '1rem',
            cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: 8, height: 48, display: 'grid', placeItems: 'center', background: '#f8fafc', borderRadius: 10 }}>
              {p.icon}
            </div>
            <p style={{ fontSize: '0.7rem', color: currentTheme.primary, fontWeight: 600, marginBottom: 4 }}>{p.category}</p>
            <h4 style={{
              fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 8, lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              minHeight: '2.52rem',
            }}>{p.name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: currentTheme.primary }}>{p.price}</span>
                {p.originalPrice && <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', marginRight: 6 }}>{p.originalPrice}</span>}
              </div>
              <div style={{ padding: '0.35rem 0.75rem', borderRadius: btnR, background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700 }}>
                {t('متاح')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</p>
          <p>{t('لا توجد نتائج مطابقة')}</p>
        </div>
      )}

      {orderProduct && <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />}
    </div>
  );
}
