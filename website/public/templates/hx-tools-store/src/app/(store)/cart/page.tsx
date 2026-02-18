'use client';

import { useState, useEffect, useMemo } from 'react';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { hxStoreApi } from '@/lib/hxApi';
import { HxShippingAddress, HxDeliveryZone, HxPaymentGateway } from '@/lib/hxTypes';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, MapPin, CreditCard, Check, Truck, Package, ChevronDown } from 'lucide-react';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirm';

export default function HxCartPage() {
  const { currentTheme, darkMode, t, isRTL, cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount, formatPrice, buttonRadius } = useHxTheme();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [deliveryZones, setDeliveryZones] = useState<HxDeliveryZone[]>([]);
  const [gateways, setGateways] = useState<HxPaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<Record<string, unknown> | null>(null);

  const [address, setAddress] = useState<HxShippingAddress>({
    fullName: '', phone: '', country: '', city: '', area: '', street: '', building: '', postalCode: '', notes: '',
  });

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const load = async () => {
      try {
        const [zonesData, gwData] = await Promise.all([
          hxStoreApi.getProducts().then(() => {
            // Demo/custom endpoint for delivery zones
            return fetch('/api/delivery-zones').then(r => r.ok ? r.json() : { zones: [] }).catch(() => ({ zones: [] }));
          }),
          hxStoreApi.getPaymentGateways(),
        ]);
        setDeliveryZones(zonesData.zones || []);
        setGateways((gwData.gateways || []).filter((g: HxPaymentGateway) => g.is_enabled));
      } catch {}
    };
    load();
  }, []);

  // Calculate shipping when country/area changes
  useEffect(() => {
    if (!address.country) { setShippingCost(0); setEstimatedDays(''); return; }
    const zone = deliveryZones.find(z => z.country === address.country);
    if (!zone) { setShippingCost(0); return; }
    let cost = zone.base_shipping_cost;
    if (address.area) {
      const region = zone.regions.find(r => r.name === address.area);
      if (region) cost += region.extra_cost;
    }
    setShippingCost(cost);
    setEstimatedDays(zone.estimated_days);
  }, [address.country, address.area, deliveryZones]);

  const grandTotal = cartTotal + shippingCost;

  const enabledCountries = deliveryZones.filter(z => z.is_enabled);
  const selectedZone = deliveryZones.find(z => z.country === address.country);
  const enabledRegions = selectedZone?.regions.filter(r => r.is_enabled) || [];

  const canProceedShipping = address.fullName && address.phone && address.country && address.city && address.street;
  const canProceedPayment = selectedGateway !== null;

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.arabic_name || item.product.name,
          quantity: item.quantity,
          unit_price: Number(item.product.price),
        })),
        shipping_address: address,
        shipping_cost: shippingCost,
        payment_gateway_id: selectedGateway,
        total: grandTotal,
        currency: 'USD',
      };
      const result = await hxStoreApi.createOrder(orderData);
      setOrderResult(result);
      clearCart();
      setStep('confirm');
    } catch (err: any) {
      alert(err.message || t('خطأ'));
    }
    setSubmitting(false);
  };

  const steps: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { key: 'cart', label: t('سلة المشتريات'), icon: <ShoppingCart size={18} /> },
    { key: 'shipping', label: t('معلومات التوصيل'), icon: <MapPin size={18} /> },
    { key: 'payment', label: t('طريقة الدفع'), icon: <CreditCard size={18} /> },
    { key: 'confirm', label: t('تأكيد الطلب'), icon: <Check size={18} /> },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* ─── Progress Steps ─── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 30,
                background: i <= stepIndex ? currentTheme.primary : (darkMode ? '#1e293b' : '#f1f5f9'),
                color: i <= stepIndex ? '#fff' : subtext,
                fontSize: 13, fontWeight: 600, transition: 'all 0.3s',
              }}>
                {s.icon}
                <span className="hx-hide-mobile">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 30, height: 2, background: i < stepIndex ? currentTheme.primary : (darkMode ? '#334155' : '#e2e8f0') }} />
              )}
            </div>
          ))}
        </div>

        {/* ─── STEP: Cart ─── */}
        {step === 'cart' && (
          <div className="hx-animate-fade">
            <h1 style={{ fontSize: 24, fontWeight: 800, color: text, marginBottom: 24 }}>🛒 {t('سلة المشتريات')}</h1>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: text, marginBottom: 8 }}>{t('السلة فارغة')}</h2>
                <a href="/products" className="hx-btn-primary" style={{ background: currentTheme.primary, borderRadius: Number(buttonRadius), marginTop: 16, display: 'inline-flex' }}>
                  {t('تابع التسوق')}
                </a>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{
                      background: cardBg, borderRadius: 16, padding: 16,
                      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      display: 'flex', gap: 16, alignItems: 'center',
                    }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                        background: darkMode ? '#111827' : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                      }}>
                        {item.product.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 4 }}>
                          {item.product.arabic_name || item.product.name}
                        </h3>
                        <p style={{ fontSize: 16, fontWeight: 800, color: currentTheme.primary }}>
                          {formatPrice(Number(item.product.price))}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="hx-qty-btn" style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text }}>-</button>
                        <span style={{ fontWeight: 700, color: text, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="hx-qty-btn" style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text }}>+</button>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: text }}>{formatPrice(Number(item.product.price) * item.quantity)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} style={{
                        width: 36, height: 36, borderRadius: 8, border: 'none',
                        background: '#ef444415', color: '#ef4444', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div style={{
                  background: cardBg, borderRadius: 16, padding: 24,
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: subtext }}>{t('المجموع')} ({cartCount} {t('عناصر')})</span>
                    <span style={{ fontWeight: 700, color: text }}>{formatPrice(cartTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: subtext }}>{t('رسوم التوصيل')}</span>
                    <span style={{ fontWeight: 600, color: subtext }}>{t('يحدد في الخطوة التالية')}</span>
                  </div>
                  <button
                    onClick={() => setStep('shipping')}
                    className="hx-btn-primary"
                    style={{ width: '100%', background: currentTheme.primary, borderRadius: Number(buttonRadius), padding: '14px', fontSize: 16 }}
                  >
                    {t('متابعة')} — {t('معلومات التوصيل')}
                    {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── STEP: Shipping ─── */}
        {step === 'shipping' && (
          <div className="hx-animate-fade">
            <h1 style={{ fontSize: 24, fontWeight: 800, color: text, marginBottom: 24 }}>📍 {t('معلومات التوصيل')}</h1>

            <div style={{
              background: cardBg, borderRadius: 16, padding: 24,
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, marginBottom: 24,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الاسم الكامل')} *</label>
                  <input className="hx-input" value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder={t('الاسم الكامل')} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('رقم الهاتف')} *</label>
                  <input className="hx-input" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+966 5x xxx xxxx" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الدولة')} *</label>
                  <select className="hx-select" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value, area: '' })}>
                    <option value="">{t('اختر الدولة')}</option>
                    {enabledCountries.map(z => (
                      <option key={z.country_code} value={z.country}>{z.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('المنطقة')}</label>
                  <select className="hx-select" value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })} disabled={!address.country}>
                    <option value="">{t('اختر المنطقة')}</option>
                    {enabledRegions.map(r => (
                      <option key={r.id} value={r.name}>{r.name} {r.extra_cost > 0 ? `(+${formatPrice(r.extra_cost)})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('المدينة')} *</label>
                  <input className="hx-input" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder={t('المدينة')} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الشارع')} *</label>
                  <input className="hx-input" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder={t('الشارع')} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('المبنى')}</label>
                  <input className="hx-input" value={address.building || ''} onChange={e => setAddress({ ...address, building: e.target.value })} placeholder={t('المبنى')} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الرمز البريدي')}</label>
                  <input className="hx-input" value={address.postalCode || ''} onChange={e => setAddress({ ...address, postalCode: e.target.value })} placeholder={t('الرمز البريدي')} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('ملاحظات إضافية')}</label>
                <textarea
                  className="hx-input"
                  value={address.notes || ''}
                  onChange={e => setAddress({ ...address, notes: e.target.value })}
                  placeholder={t('ملاحظات إضافية')}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Shipping Summary */}
            {shippingCost > 0 && (
              <div style={{
                background: `${currentTheme.primary}10`, borderRadius: 12, padding: 16, marginBottom: 24,
                border: `1px solid ${currentTheme.primary}30`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Truck size={20} style={{ color: currentTheme.primary }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: text }}>
                    {t('رسوم التوصيل')}: {formatPrice(shippingCost)}
                  </div>
                  {estimatedDays && (
                    <div style={{ fontSize: 12, color: subtext }}>{t('التوصيل خلال')} {estimatedDays} {t('يوم عمل')}</div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('cart')} className="hx-btn-secondary" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', color: text, borderRadius: Number(buttonRadius) }}>
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                {t('رجوع')}
              </button>
              <button
                onClick={() => setStep('payment')}
                disabled={!canProceedShipping}
                className="hx-btn-primary"
                style={{
                  flex: 1, background: canProceedShipping ? currentTheme.primary : '#94a3b8',
                  borderRadius: Number(buttonRadius), cursor: canProceedShipping ? 'pointer' : 'not-allowed',
                }}
              >
                {t('التالي')} — {t('طريقة الدفع')}
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP: Payment ─── */}
        {step === 'payment' && (
          <div className="hx-animate-fade">
            <h1 style={{ fontSize: 24, fontWeight: 800, color: text, marginBottom: 24 }}>💳 {t('طريقة الدفع')}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {gateways.map(gw => (
                <div
                  key={gw.id}
                  onClick={() => setSelectedGateway(gw.id)}
                  style={{
                    background: cardBg, borderRadius: 16, padding: 20, cursor: 'pointer',
                    border: `2px solid ${selectedGateway === gw.id ? currentTheme.primary : (darkMode ? '#334155' : '#e2e8f0')}`,
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${selectedGateway === gw.id ? currentTheme.primary : '#94a3b8'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedGateway === gw.id && (
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: currentTheme.primary }} />
                    )}
                  </div>
                  <div style={{ fontSize: 28 }}>
                    {gw.type === 'bank_transfer' ? '🏦' : gw.type === 'paypal' ? '💳' : gw.type === 'usdt' ? '₿' : gw.type === 'cod' ? '💵' : '💰'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: text }}>{gw.name}</div>
                    {gw.name_en && <div style={{ fontSize: 12, color: subtext }}>{gw.name_en}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{
              background: cardBg, borderRadius: 16, padding: 24, marginBottom: 24,
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 16 }}>📋 {t('ملخص الطلب')}</h3>
              {cart.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: text }}>{item.product.arabic_name || item.product.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600, color: text }}>{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, marginTop: 12, paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: subtext }}>{t('المجموع')}</span>
                  <span style={{ fontWeight: 600, color: text }}>{formatPrice(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: subtext }}>{t('رسوم التوصيل')}</span>
                  <span style={{ fontWeight: 600, color: text }}>{formatPrice(shippingCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: text }}>{t('الإجمالي')}</span>
                  <span style={{ color: currentTheme.primary }}>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: subtext }}>
                📍 {address.country} — {address.city} {address.area && `— ${address.area}`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('shipping')} className="hx-btn-secondary" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', color: text, borderRadius: Number(buttonRadius) }}>
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                {t('رجوع')}
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={!canProceedPayment || submitting}
                className="hx-btn-primary"
                style={{
                  flex: 1,
                  background: (canProceedPayment && !submitting) ? currentTheme.primary : '#94a3b8',
                  borderRadius: Number(buttonRadius),
                  cursor: (canProceedPayment && !submitting) ? 'pointer' : 'not-allowed',
                }}
              >
                {submitting ? t('جاري المعالجة...') : `${t('تأكيد الطلب')} — ${formatPrice(grandTotal)}`}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP: Confirmation ─── */}
        {step === 'confirm' && (
          <div className="hx-animate-scale" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#10b98120',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', animation: 'hxPulse 2s infinite',
            }}>
              <Check size={40} style={{ color: '#10b981' }} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: text, marginBottom: 8 }}>🎉 {t('تم الطلب بنجاح')}</h1>
            <p style={{ fontSize: 16, color: subtext, marginBottom: 24 }}>
              {t('رقم الطلب')}: <strong style={{ color: currentTheme.primary }}>{(orderResult as any)?.order?.order_number || 'HX-99999'}</strong>
            </p>
            {estimatedDays && (
              <p style={{ fontSize: 14, color: subtext, marginBottom: 24 }}>
                🚚 {t('التوصيل خلال')} {estimatedDays} {t('يوم عمل')}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/orders" className="hx-btn-primary" style={{ background: currentTheme.primary, borderRadius: Number(buttonRadius) }}>
                {t('طلباتي')}
              </a>
              <a href="/products" className="hx-btn-secondary" style={{ borderColor: currentTheme.primary, color: currentTheme.primary, borderRadius: Number(buttonRadius) }}>
                {t('تابع التسوق')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
