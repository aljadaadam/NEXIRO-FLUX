'use client';

import { useState, useEffect } from 'react';
import { Globe, RefreshCw, TestTube, Trash2, Plus, X, Link2, Percent, Zap } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvSourcesPanel() {
  const { currentTheme } = useGxvTheme();
  const [sources, setSources] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [connectModal, setConnectModal] = useState(false);
  const [connectForm, setConnectForm] = useState({ name: '', type: 'dhrufusion', url: '', api_key: '' });
  const [profitModal, setProfitModal] = useState<Record<string, unknown> | null>(null);
  const [profitPercent, setProfitPercent] = useState('10');

  const load = () => {
    setLoading(true);
    gxvAdminApi.getSources().then(data => {
      setSources(Array.isArray(data) ? data : data?.sources || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleSync = async (id: number) => {
    setSyncing(id);
    try { await gxvAdminApi.syncSource(id); load(); }
    finally { setSyncing(null); }
  };

  const handleTest = async (id: number) => {
    const res = await gxvAdminApi.testSource(id);
    alert(res.success ? 'الاتصال ناجح ✅' : `فشل الاتصال: ${res.error || 'خطأ'}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا المصدر؟')) return;
    await gxvAdminApi.deleteSource(id);
    load();
  };

  const handleConnect = async () => {
    await gxvAdminApi.connectSource(connectForm);
    setConnectModal(false);
    load();
  };

  const handleProfit = async () => {
    if (!profitModal) return;
    await gxvAdminApi.applySourceProfit(profitModal.id as number, { profitPercentage: Number(profitPercent) });
    setProfitModal(null);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: '#666688', fontSize: '0.85rem', margin: 0 }}>ربط مصادر خارجية لاستيراد المنتجات</p>
        <button onClick={() => setConnectModal(true)} style={{
          padding: '10px 20px', borderRadius: 12, background: currentTheme.gradient,
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6, boxShadow: currentTheme.glow,
        }}>
          <Plus size={15} /> ربط مصدر
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sources.map((src, i) => (
            <div key={src.id as number} style={{
              padding: '18px', borderRadius: 16,
              background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
              animation: `gxvSlideUp ${0.15 + i * 0.05}s ease-out both`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Globe size={16} style={{ color: currentTheme.primary }} />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                      {String(src.name || '')}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.73rem', color: '#555577' }}>
                    <span>{String(src.type || '')}</span>
                    <span>{String(src.products_count || 0)} منتج</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleSync(src.id as number)} disabled={syncing === src.id} style={{
                    padding: '6px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <RefreshCw size={12} style={{ animation: syncing === src.id ? 'gxvSpin 1s linear infinite' : 'none' }} />
                    مزامنة
                  </button>
                  <button onClick={() => { setProfitModal(src); setProfitPercent('10'); }} style={{
                    padding: '6px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.15)', color: '#fbbf24', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Percent size={12} /> ربح
                  </button>
                  <button onClick={() => handleTest(src.id as number)} style={{
                    padding: '6px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <TestTube size={12} /> اختبار
                  </button>
                  <button onClick={() => handleDelete(src.id as number)} style={{
                    padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sources.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555577' }}>
              <Globe size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p>لا توجد مصادر مربوطة</p>
            </div>
          )}
        </div>
      )}

      {/* Connect Modal */}
      {connectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16 }}
          onClick={() => setConnectModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 440, borderRadius: 20, background: '#0f0f23',
            border: '1px solid rgba(255,255,255,0.08)', padding: '24px',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>🔗 ربط مصدر جديد</h3>
            {[
              { key: 'name', label: 'اسم المصدر', placeholder: 'مثال: DhruFusion' },
              { key: 'url', label: 'رابط API', placeholder: 'https://...' },
              { key: 'api_key', label: 'مفتاح API', placeholder: 'المفتاح' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  value={(connectForm as Record<string, string>)[f.key] || ''}
                  onChange={e => setConnectForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                  }} />
              </div>
            ))}
            <button onClick={handleConnect} style={{
              width: '100%', padding: '12px', borderRadius: 12, marginTop: 8,
              background: currentTheme.gradient, color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
            }}>ربط المصدر</button>
          </div>
        </div>
      )}

      {/* Profit Modal */}
      {profitModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16 }}
          onClick={() => setProfitModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 360, borderRadius: 20, background: '#0f0f23',
            border: '1px solid rgba(255,255,255,0.08)', padding: '24px',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>💰 نسبة الربح</h3>
            <p style={{ color: '#666688', fontSize: '0.82rem', marginBottom: 16 }}>
              تطبيق نسبة ربح على جميع منتجات: {String(profitModal.name)}
            </p>
            <input type="number" value={profitPercent} onChange={e => setProfitPercent(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif', textAlign: 'center',
              }} />
            <button onClick={handleProfit} style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: currentTheme.gradient, color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
            }}>تطبيق الربح</button>
          </div>
        </div>
      )}
    </div>
  );
}
