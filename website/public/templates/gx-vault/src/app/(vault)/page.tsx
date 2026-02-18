'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Zap, Shield, Clock, Star, ChevronDown, ChevronUp, ShoppingCart, Sparkles, TrendingUp, Award, CreditCard } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvStoreApi, gxvIsDemoMode } from '@/engine/gxvApi';
import { GXV_GAMES, GXV_TOPUP_STEPS, GXV_FAQ } from '@/engine/gxvData';

export default function GxvHomePage() {
  const { currentTheme, storeName, showBanner } = useGxvTheme();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [orderModal, setOrderModal] = useState<Record<string, unknown> | null>(null);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [gateways, setGateways] = useState<Record<string, unknown>[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<number | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'fields' | 'payment'>('fields');
  const isDemo = gxvIsDemoMode();

  useEffect(() => {
    gxvStoreApi.getProducts().then(setProducts);
  }, []);

  const filteredProducts = selectedGame
    ? products.filter(p => p.gameSlug === selectedGame)
    : products;

  const openOrderModal = (product: Record<string, unknown>) => {
    setOrderModal(product);
    setCustomValues({});
    setOrderResult(null);
    setCheckoutStep('fields');
    setSelectedGateway(null);
    // Fetch gateways
    if (gateways.length === 0) {
      gxvStoreApi.getEnabledGateways().then(data => {
        const list = Array.isArray(data) ? data : data?.gateways || [];
        setGateways(list);
        if (list.length === 1) setSelectedGateway(list[0].id as number);
      }).catch(() => {});
    }
  };

  const handleOrder = async (product: Record<string, unknown>) => {
    // If not in payment step yet and not demo, go to payment step
    if (checkoutStep === 'fields' && !isDemo && gateways.length > 0) {
      setCheckoutStep('payment');
      return;
    }
    if (!isDemo && !selectedGateway && gateways.length > 0) {
      setOrderResult({ ok: false, msg: 'اختر طريقة الدفع أولاً' });
      return;
    }
    setOrderLoading(true);
    setOrderResult(null);
    try {
      const fields = (product.customFields as Array<{ key: string }>) || [];
      const customData: Record<string, string> = {};
      fields.forEach(f => { customData[f.key] = customValues[f.key] || ''; });

      const res = await gxvStoreApi.createOrder({
        product_id: product.id,
        quantity: 1,
        custom_fields: customData,
        ...(selectedGateway ? { gateway_id: selectedGateway } : {}),
      });
      if (res.error) throw new Error(res.error);

      // Handle payment redirects
      if (res.redirectUrl) { window.location.href = res.redirectUrl; return; }
      if (res.checkoutUrl) { window.location.href = res.checkoutUrl; return; }
      if (res.method === 'manual_crypto') {
        setOrderResult({ ok: true, msg: `تم إنشاء الطلب! أرسل ${res.amount} USDT إلى: ${res.walletAddress} (${res.network})` });
      } else if (res.method === 'manual_bank') {
        const bank = res.bankDetails as Record<string, string>;
        setOrderResult({ ok: true, msg: `تم إنشاء الطلب! حوّل المبلغ إلى: ${bank?.bank_name} - ${bank?.iban} (المرجع: ${res.referenceId})` });
      } else {
        setOrderResult({ ok: true, msg: 'تم إنشاء الطلب بنجاح! ✅' });
        setTimeout(() => { setOrderModal(null); setOrderResult(null); setCustomValues({}); setCheckoutStep('fields'); }, 2000);
      }
    } catch (err: unknown) {
      setOrderResult({ ok: false, msg: (err as Error).message || 'حدث خطأ أثناء إنشاء الطلب' });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div>
      {/* ═══════ HERO SECTION ═══════ */}
      {showBanner && (
        <section style={{
          position: 'relative',
          padding: '80px 24px 60px',
          overflow: 'hidden',
          minHeight: 420,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Animated background orbs */}
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: `radial-gradient(circle, ${currentTheme.primary}18 0%, transparent 70%)`,
            top: '-20%', right: '-10%', filter: 'blur(80px)',
            animation: 'gxvFloat 6s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
            bottom: '-15%', left: '-5%', filter: 'blur(60px)',
            animation: 'gxvFloat 8s ease-in-out infinite reverse',
          }} />
          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: `linear-gradient(${currentTheme.primary}40 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.primary}40 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 20,
              background: currentTheme.surface,
              border: `1px solid ${currentTheme.primary}30`,
              marginBottom: 24,
              animation: 'gxvSlideUp 0.5s ease-out',
            }}>
              <Sparkles size={14} style={{ color: currentTheme.primary }} />
              <span style={{ color: currentTheme.primary, fontSize: '0.8rem', fontWeight: 600 }}>
                شحن فوري وموثوق
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: 18,
              color: '#fff',
              animation: 'gxvSlideUp 0.6s ease-out',
            }}>
              اشحن ألعابك المفضلة
              <br />
              <span className="gxv-gradient-text" style={{
                background: currentTheme.gradient,
              }}>
                بأسرع وقت وأفضل سعر
              </span>
            </h1>

            <p style={{
              color: '#8888aa', fontSize: '1.05rem', lineHeight: 1.7,
              maxWidth: 500, margin: '0 auto 32px',
              animation: 'gxvSlideUp 0.7s ease-out',
            }}>
              ببجي، فورتنايت، فري فاير، كول اوف ديوتي والمزيد.
              شحن مباشر وآمن لحسابك في ثوانٍ.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
              animation: 'gxvSlideUp 0.8s ease-out',
            }}>
              <a href="#games" style={{
                padding: '14px 32px', borderRadius: 14,
                background: currentTheme.gradient,
                color: '#fff', textDecoration: 'none',
                fontSize: '0.95rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: currentTheme.glow,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Gamepad2 size={18} />
                ابدأ الشحن الآن
              </a>
              <a href="/services" style={{
                padding: '14px 32px', borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#b8b8cc', textDecoration: 'none',
                fontSize: '0.95rem', fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              >
                تصفح الألعاب
              </a>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex', gap: 32, justifyContent: 'center', marginTop: 48,
              animation: 'gxvSlideUp 0.9s ease-out',
              flexWrap: 'wrap',
            }}>
              {[
                { icon: <TrendingUp size={16} />, value: '+10K', label: 'طلب مكتمل' },
                { icon: <Award size={16} />, value: '99%', label: 'نسبة الرضا' },
                { icon: <Zap size={16} />, value: '<30s', label: 'وقت الشحن' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                    color: currentTheme.primary, marginBottom: 4,
                  }}>
                    {stat.icon}
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{stat.value}</span>
                  </div>
                  <span style={{ color: '#666688', fontSize: '0.78rem' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ GAMES GRID ═══════ */}
      <section id="games" style={{ padding: '40px 24px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            🎮 اختر لعبتك
          </h2>
          <p style={{ color: '#666688', fontSize: '0.9rem' }}>اختر اللعبة لعرض باقات الشحن المتاحة</p>
        </div>

        <div className="gxv-grid-games" style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* All Games button */}
          <button
            onClick={() => setSelectedGame(null)}
            style={{
              padding: '20px 16px', borderRadius: 16,
              background: !selectedGame ? currentTheme.surface : 'rgba(15,15,35,0.6)',
              border: `1px solid ${!selectedGame ? currentTheme.primary + '40' : 'rgba(255,255,255,0.06)'}`,
              color: !selectedGame ? currentTheme.primary : '#b8b8cc',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'all 0.25s',
              boxShadow: !selectedGame ? currentTheme.glow : 'none',
            }}
            onMouseEnter={e => {
              if (selectedGame) {
                e.currentTarget.style.borderColor = `${currentTheme.primary}30`;
                e.currentTarget.style.background = currentTheme.surface;
              }
            }}
            onMouseLeave={e => {
              if (selectedGame) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(15,15,35,0.6)';
              }
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>الكل</span>
          </button>

          {GXV_GAMES.map(game => {
            const active = selectedGame === game.slug;
            return (
              <button
                key={game.slug}
                onClick={() => setSelectedGame(game.slug)}
                className="gxv-card-hover"
                style={{
                  padding: '20px 16px', borderRadius: 16,
                  background: active ? `linear-gradient(135deg, ${game.color}15, ${game.color}08)` : 'rgba(15,15,35,0.6)',
                  border: `1px solid ${active ? game.color + '40' : 'rgba(255,255,255,0.06)'}`,
                  color: active ? game.color : '#b8b8cc',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'all 0.25s',
                  boxShadow: active ? `0 0 25px ${game.color}30` : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.borderColor = `${game.color}30`;
                    e.currentTarget.style.background = `linear-gradient(135deg, ${game.color}08, transparent)`;
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(15,15,35,0.6)';
                  }
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{game.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{game.nameAr}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════ PRODUCTS GRID ═══════ */}
      <section style={{ padding: '30px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
        {filteredProducts.length > 0 ? (
          <>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e8e8ff' }}>
                💎 الباقات المتاحة
                <span style={{ color: '#666688', fontSize: '0.85rem', fontWeight: 400, marginRight: 8 }}>
                  ({filteredProducts.length})
                </span>
              </h3>
            </div>
            <div className="gxv-grid-products">
              {filteredProducts.map((product, idx) => {
                const game = GXV_GAMES.find(g => g.slug === product.gameSlug);
                const accentColor = game?.color || currentTheme.primary;
                return (
                  <div
                    key={product.id as number}
                    className="gxv-card-hover"
                    style={{
                      borderRadius: 16,
                      background: 'rgba(15,15,35,0.7)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                      animation: `gxvSlideUp ${0.3 + idx * 0.05}s ease-out both`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 8px 30px ${accentColor}15`;
                      e.currentTarget.style.borderColor = `${accentColor}25`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    {/* Top accent bar */}
                    <div style={{
                      height: 3,
                      background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60, transparent)`,
                    }} />

                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: '1.2rem' }}>{product.icon as string}</span>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                              {product.name as string}
                            </h4>
                          </div>
                          {String(product.desc || '') !== '' && (
                            <p style={{
                              color: '#666688', fontSize: '0.78rem', margin: 0,
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {String(product.desc)}
                            </p>
                          )}
                        </div>
                        {game && (
                          <span style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: `${accentColor}15`,
                            color: accentColor,
                            fontSize: '0.7rem', fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}>
                            {game.nameAr}
                          </span>
                        )}
                      </div>

                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: 14, paddingTop: 14,
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <div>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                            {product.price as string}
                          </span>
                          {String(product.originalPrice || '') !== '' && (
                            <span style={{
                              color: '#555577', fontSize: '0.8rem',
                              textDecoration: 'line-through', marginRight: 8,
                            }}>
                              {String(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openOrderModal(product)}
                          style={{
                            padding: '8px 20px', borderRadius: 10,
                            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s',
                            boxShadow: `0 4px 15px ${accentColor}30`,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <ShoppingCart size={14} />
                          اشحن
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: '#666688',
          }}>
            <Gamepad2 size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>لا توجد باقات متاحة حالياً</p>
            <p style={{ fontSize: '0.85rem', marginTop: 6 }}>جرب اختيار لعبة أخرى أو عد لاحقاً</p>
          </div>
        )}
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section style={{
        padding: '50px 24px', maxWidth: 900, margin: '0 auto',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 40 }}>
          ⚡ كيف يعمل الشحن؟
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
        }}>
          {GXV_TOPUP_STEPS.map((step, i) => (
            <div key={i} className="gxv-card-hover" style={{
              padding: '28px 20px', borderRadius: 16,
              background: 'rgba(15,15,35,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              position: 'relative',
              animation: `gxvSlideUp ${0.4 + i * 0.1}s ease-out both`,
            }}>
              {/* Step number */}
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                background: currentTheme.gradient,
                display: 'grid', placeItems: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                boxShadow: currentTheme.glow,
              }}>
                {step.step}
              </div>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12, marginTop: 8 }}>{step.icon}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e8e8ff', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: '#666688', fontSize: '0.82rem', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section style={{ padding: '40px 24px 60px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 30 }}>
          ❓ الأسئلة الشائعة
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GXV_FAQ.map((faq, i) => (
            <div key={i} style={{
              borderRadius: 14,
              background: 'rgba(15,15,35,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', padding: '16px 20px',
                  background: 'transparent', border: 'none',
                  color: '#e8e8ff', fontSize: '0.92rem', fontWeight: 600,
                  cursor: 'pointer', textAlign: 'right',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                {faq.q}
                {openFaq === i ? <ChevronUp size={16} color="#666688" /> : <ChevronDown size={16} color="#666688" />}
              </button>
              {openFaq === i && (
                <div style={{
                  padding: '0 20px 16px',
                  color: '#8888aa', fontSize: '0.85rem', lineHeight: 1.7,
                  animation: 'gxvFadeIn 0.2s ease-out',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ ORDER MODAL ═══════ */}
      {orderModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center',
          padding: 16,
          animation: 'gxvFadeIn 0.2s ease-out',
        }}
        onClick={() => { setOrderModal(null); setOrderResult(null); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440,
              borderRadius: 20,
              background: '#0f0f23',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              animation: 'gxvSlideUp 0.3s ease-out',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '20px 24px',
              background: currentTheme.surface,
              borderBottom: `1px solid ${currentTheme.primary}20`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{orderModal.icon as string}</span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {orderModal.name as string}
                  </h3>
                  <span style={{ color: currentTheme.primary, fontSize: '1.1rem', fontWeight: 800 }}>
                    {orderModal.price as string}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Step 1: Custom fields */}
              {checkoutStep === 'fields' && ((orderModal.customFields as Array<{ key: string; label: string; placeholder: string; required: boolean }>) || []).map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={customValues[field.key] || ''}
                    onChange={e => setCustomValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#e8e8ff', fontSize: '0.9rem',
                      outline: 'none', transition: 'border-color 0.2s',
                      fontFamily: 'Tajawal, sans-serif',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}60`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              ))}

              {/* Step 2: Payment gateway selection */}
              {checkoutStep === 'payment' && gateways.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#b8b8cc', fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={16} style={{ color: currentTheme.primary }} /> اختر طريقة الدفع
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: gateways.length <= 3 ? `repeat(${gateways.length}, 1fr)` : 'repeat(2, 1fr)', gap: 8 }}>
                    {gateways.map(gw => {
                      const gwId = gw.id as number;
                      const gwType = String(gw.type || '');
                      const icons: Record<string, string> = { paypal: '💳', binance: '🪙', usdt: '💲', bank_transfer: '🏦', wallet: '📱' };
                      return (
                        <button key={gwId} onClick={() => setSelectedGateway(gwId)} style={{
                          padding: '16px 12px', borderRadius: 14,
                          background: selectedGateway === gwId
                            ? `linear-gradient(135deg, ${currentTheme.primary}20, ${currentTheme.primary}08)`
                            : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selectedGateway === gwId ? `${currentTheme.primary}40` : 'rgba(255,255,255,0.06)'}`,
                          color: selectedGateway === gwId ? currentTheme.primary : '#b8b8cc',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          transition: 'all 0.2s',
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>{icons[gwType] || '💰'}</span>
                          {String(gw.name || gwType)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {orderResult && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                  background: orderResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${orderResult.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: orderResult.ok ? '#4ade80' : '#f87171',
                  fontSize: '0.85rem', fontWeight: 600, textAlign: 'center',
                }}>
                  {orderResult.msg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => handleOrder(orderModal)}
                  disabled={orderLoading}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 14,
                    background: currentTheme.gradient,
                    color: '#fff', border: 'none', cursor: orderLoading ? 'wait' : 'pointer',
                    fontSize: '0.95rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: currentTheme.glow,
                    opacity: orderLoading ? 0.7 : 1,
                  }}
                >
                  {orderLoading ? (
                    <div style={{
                      width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'gxvSpin 0.6s linear infinite',
                    }} />
                  ) : (
                    <>
                      <Zap size={16} />
                      {checkoutStep === 'fields' && !isDemo && gateways.length > 0 ? 'التالي — اختر الدفع' : 'تأكيد الشحن'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (checkoutStep === 'payment') { setCheckoutStep('fields'); setOrderResult(null); }
                    else { setOrderModal(null); setOrderResult(null); setCheckoutStep('fields'); }
                  }}
                  style={{
                    padding: '14px 24px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#8888aa', cursor: 'pointer',
                    fontSize: '0.9rem', fontWeight: 600,
                  }}
                >
                  {checkoutStep === 'payment' ? 'رجوع' : 'إلغاء'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
