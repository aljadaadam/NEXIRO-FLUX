'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { ExternalSource } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Globe, Plus, RefreshCw, Trash2, Settings, TestTube, Zap, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

export default function SmmSourcesPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [sources, setSources] = useState<ExternalSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: 'smmstone', url: '', api_key: '' });
  const [testingId, setTestingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [profitModal, setProfitModal] = useState<ExternalSource | null>(null);
  const [profitPct, setProfitPct] = useState('0');

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getSources();
      setSources(Array.isArray(data) ? data : data?.sources || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConnect = async () => {
    try {
      await adminApi.connectSource(addForm);
      setShowAdd(false);
      setAddForm({ name: '', type: 'smmstone', url: '', api_key: '' });
      load();
    } catch {}
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    try { await adminApi.testSource(id); } catch {}
    setTestingId(null);
    load();
  };

  const handleSync = async (id: number) => {
    setSyncingId(id);
    try { await adminApi.syncSource(id); } catch {}
    setSyncingId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد؟'))) return;
    try { await adminApi.deleteSource(id); load(); } catch {}
  };

  const handleToggleSyncOnly = async (id: number, syncOnly: boolean) => {
    try { await adminApi.toggleSyncOnly(id, syncOnly); load(); } catch {}
  };

  const handleApplyProfit = async () => {
    if (!profitModal) return;
    try { await adminApi.applySourceProfit(profitModal.id, { profitPercentage: parseFloat(profitPct) }); setProfitModal(null); load(); } catch {}
  };

  const statusColor = (s: string) => s === 'connected' || s === 'active' ? '#10b981' : s === 'error' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>🌐 {t('المصادر الخارجية')} ({sources.length})</h2>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          borderRadius: Number(buttonRadius), border: 'none',
          background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          <Plus size={16} /> {t('ربط مصدر جديد')}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 200, borderRadius: 16, background: `linear-gradient(90deg, ${cardBg}, ${darkMode ? '#1e2642' : '#f1f5f9'}, ${cardBg})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
        </div>
      ) : sources.length === 0 ? (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: 60, textAlign: 'center' }}>
          <Globe size={40} style={{ margin: '0 auto 12px', color: subtext, opacity: 0.3 }} />
          <p style={{ color: subtext }}>{t('لا توجد مصادر مربوطة')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {sources.map(src => (
            <div key={src.id} style={{
              background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}`,
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.primary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = border; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{src.icon || '🌐'}</span>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: text }}>{src.name}</h4>
                    <span style={{ fontSize: 12, color: subtext }}>{src.type}</span>
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, height: 'fit-content',
                  background: `${statusColor(src.status)}15`, color: statusColor(src.status),
                }}>
                  {src.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: inputBg, borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: subtext }}>{t('المنتجات')}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: text }}>{src.products}</div>
                </div>
                <div style={{ background: inputBg, borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: subtext }}>{t('الرصيد')}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: theme.primary }}>{src.balance}</div>
                </div>
              </div>

              {src.profitPercentage !== undefined && (
                <div style={{ fontSize: 12, color: subtext, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('نسبة الربح')}: {src.profitPercentage}%</span>
                  <button onClick={() => handleToggleSyncOnly(src.id, !src.syncOnly)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: src.syncOnly ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                  }}>
                    {src.syncOnly ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                    {src.syncOnly ? 'Sync Only' : 'Auto'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => handleTest(src.id)} disabled={testingId === src.id} style={{
                  flex: 1, padding: '8px', border: `1px solid ${border}`, borderRadius: 8,
                  background: 'transparent', color: theme.primary, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: testingId === src.id ? 0.5 : 1,
                }}>
                  <TestTube size={12} /> {t('اختبار')}
                </button>
                <button onClick={() => handleSync(src.id)} disabled={syncingId === src.id} style={{
                  flex: 1, padding: '8px', border: `1px solid ${border}`, borderRadius: 8,
                  background: 'transparent', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: syncingId === src.id ? 0.5 : 1,
                }}>
                  <RefreshCw size={12} className={syncingId === src.id ? 'animate-spin' : ''} /> {t('مزامنة')}
                </button>
                <button onClick={() => { setProfitModal(src); setProfitPct(String(src.profitPercentage || 0)); }} style={{
                  padding: '8px', border: `1px solid ${border}`, borderRadius: 8,
                  background: 'transparent', color: '#f59e0b', cursor: 'pointer',
                }}>
                  <Settings size={14} />
                </button>
                <button onClick={() => handleDelete(src.id)} style={{
                  padding: '8px', border: 'none', borderRadius: 8,
                  background: '#ef444412', color: '#ef4444', cursor: 'pointer',
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add source modal */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 460, background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{t('ربط مصدر جديد')}</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('الاسم')}</label>
                <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('النوع')}</label>
                <select value={addForm.type} onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}>
                  {['smmstone', 'smmpanel', 'custom'].map(t2 => <option key={t2} value={t2}>{t2}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>API URL</label>
                <input value={addForm.url} onChange={e => setAddForm(p => ({ ...p, url: e.target.value }))} placeholder="https://api.example.com" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>API Key</label>
                <input type="password" value={addForm.api_key} onChange={e => setAddForm(p => ({ ...p, api_key: e.target.value }))} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
              </div>
              <button onClick={handleConnect} style={{ padding: '12px', border: 'none', borderRadius: Number(buttonRadius), background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                <Zap size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} /> {t('ربط المصدر')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Profit modal */}
      {profitModal && (
        <>
          <div onClick={() => setProfitModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 400, background: cardBg, borderRadius: 20, padding: 28, zIndex: 101, border: `1px solid ${border}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: text, marginBottom: 16 }}>{t('نسبة الربح')} - {profitModal.name}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('النسبة المئوية')} %</label>
              <input type="number" step="0.1" value={profitPct} onChange={e => setProfitPct(e.target.value)} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleApplyProfit} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: Number(buttonRadius), background: theme.gradient, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{t('تطبيق')}</button>
              <button onClick={() => setProfitModal(null)} style={{ padding: '12px 20px', border: `1px solid ${border}`, borderRadius: Number(buttonRadius), background: 'transparent', color: text, fontWeight: 600, cursor: 'pointer' }}>{t('إلغاء')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
