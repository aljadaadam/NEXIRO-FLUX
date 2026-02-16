'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, ShoppingCart, Search, Filter, Zap } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvStoreApi } from '@/engine/gxvApi';
import { GXV_GAMES } from '@/engine/gxvData';

export default function GxvServicesPage() {
  const { currentTheme } = useGxvTheme();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [orderModal, setOrderModal] = useState<Record<string, unknown> | null>(null);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => { gxvStoreApi.getProducts().then(setProducts); }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || String(p.name).toLowerCase().includes(search.toLowerCase());
    const matchGame = !selectedGame || p.gameSlug === selectedGame;
    return matchSearch && matchGame;
  });

  const handleOrder = async (product: Record<string, unknown>) => {
    setOrderLoading(true);
    setOrderResult(null);
    try {
      const fields = (product.customFields as Array<{ key: string }>) || [];
      const customData: Record<string, string> = {};
      fields.forEach(f => { customData[f.key] = customValues[f.key] || ''; });
      const res = await gxvStoreApi.createOrder({ product_id: product.id, quantity: 1, custom_fields: customData });
      if (res.error) throw new Error(res.error);
      setOrderResult({ ok: true, msg: 'تم إنشاء الطلب بنجاح! ✅' });
      setTimeout(() => { setOrderModal(null); setOrderResult(null); setCustomValues({}); }, 2000);
    } catch (err: unknown) {
      setOrderResult({ ok: false, msg: (err as Error).message || 'حدث خطأ' });
    } finally { setOrderLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          🎮 جميع الألعاب والباقات
        </h1>
        <p style={{ color: '#666688', fontSize: '0.9rem' }}>تصفح جميع باقات الشحن المتاحة</p>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 200, position: 'relative',
        }}>
          <Search size={16} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            color: '#555577',
          }} />
          <input
            type="text"
            placeholder="ابحث عن لعبة أو باقة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 42px 12px 16px',
              borderRadius: 12, background: 'rgba(15,15,35,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#e8e8ff', fontSize: '0.9rem', outline: 'none',
              fontFamily: 'Tajawal, sans-serif',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          />
        </div>
      </div>

      {/* Game filter pills */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto',
        paddingBottom: 8,
      }}>
        <button
          onClick={() => setSelectedGame(null)}
          style={{
            padding: '8px 18px', borderRadius: 20, whiteSpace: 'nowrap',
            background: !selectedGame ? currentTheme.gradient : 'rgba(255,255,255,0.04)',
            border: `1px solid ${!selectedGame ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
            color: !selectedGame ? '#fff' : '#888',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
            boxShadow: !selectedGame ? currentTheme.glow : 'none',
          }}
        >
          الكل
        </button>
        {GXV_GAMES.map(g => (
          <button
            key={g.slug}
            onClick={() => setSelectedGame(g.slug)}
            style={{
              padding: '8px 18px', borderRadius: 20, whiteSpace: 'nowrap',
              background: selectedGame === g.slug ? `${g.color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedGame === g.slug ? `${g.color}40` : 'rgba(255,255,255,0.06)'}`,
              color: selectedGame === g.slug ? g.color : '#888',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>{g.icon}</span> {g.nameAr}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="gxv-grid-products">
        {filtered.map((product, idx) => {
          const game = GXV_GAMES.find(g => g.slug === product.gameSlug);
          const accent = game?.color || currentTheme.primary;
          return (
            <div key={product.id as number} className="gxv-card-hover" style={{
              borderRadius: 16, background: 'rgba(15,15,35,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              animation: `gxvSlideUp ${0.2 + idx * 0.03}s ease-out both`,
            }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}60, transparent)` }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>{product.icon as string}</span>
                  <h4 style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                    {product.name as string}
                  </h4>
                </div>
                {String(product.desc || '') !== '' && (
                  <p style={{
                    color: '#666688', fontSize: '0.78rem', margin: '0 0 14px',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {String(product.desc)}
                  </p>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{product.price as string}</span>
                  <button
                    onClick={() => { setOrderModal(product); setCustomValues({}); setOrderResult(null); }}
                    style={{
                      padding: '8px 18px', borderRadius: 10,
                      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                      color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: '0.82rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: `0 4px 15px ${accent}30`,
                    }}
                  >
                    <ShoppingCart size={14} /> اشحن
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666688' }}>
          <Gamepad2 size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>لا توجد نتائج</p>
        </div>
      )}

      {/* Order Modal — same as homepage */}
      {orderModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center', padding: 16,
          animation: 'gxvFadeIn 0.2s ease-out',
        }} onClick={() => { setOrderModal(null); setOrderResult(null); }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 440, borderRadius: 20,
            background: '#0f0f23', border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden', animation: 'gxvSlideUp 0.3s ease-out',
          }}>
            <div style={{ padding: '20px 24px', background: currentTheme.surface, borderBottom: `1px solid ${currentTheme.primary}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{orderModal.icon as string}</span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{orderModal.name as string}</h3>
                  <span style={{ color: currentTheme.primary, fontSize: '1.1rem', fontWeight: 800 }}>{orderModal.price as string}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {((orderModal.customFields as Array<{ key: string; label: string; placeholder: string; required: boolean }>) || []).map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input type="text" placeholder={field.placeholder} value={customValues[field.key] || ''}
                    onChange={e => setCustomValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                    }}
                  />
                </div>
              ))}
              {orderResult && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'center',
                  background: orderResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${orderResult.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: orderResult.ok ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600,
                }}>{orderResult.msg}</div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleOrder(orderModal)} disabled={orderLoading} style={{
                  flex: 1, padding: '14px', borderRadius: 14, background: currentTheme.gradient,
                  color: '#fff', border: 'none', cursor: orderLoading ? 'wait' : 'pointer',
                  fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: currentTheme.glow, opacity: orderLoading ? 0.7 : 1,
                }}>
                  {orderLoading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'gxvSpin 0.6s linear infinite' }} /> : <><Zap size={16} /> تأكيد الشحن</>}
                </button>
                <button onClick={() => { setOrderModal(null); setOrderResult(null); }} style={{
                  padding: '14px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#8888aa', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
