'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import {
  Plus, RefreshCcw, Settings, Trash2, Wifi, CreditCard,
  Package, Clock, CheckCircle, AlertCircle, PlugZap, Loader2,
  X, Eye, EyeOff, Link2, Send, ChevronDown, ChevronUp, Zap,
} from 'lucide-react';

interface ConnectedSource {
  id: number;
  name: string;
  icon: string;
  type: string;
  url: string;
  status: string;
  statusColor: string;
  lastSync: string;
  products: number;
  balance: string;
  connectionError: string | null;
}

interface AvailableSource {
  name: string;
  type: string;
  icon: string;
  desc: string;
  category: string;
  fields: string[];
}

interface SyncLog {
  time: string;
  source: string;
  action: string;
  count: string;
  status: string;
}

// بيانات احتياطية تُعرض عند عدم توفر الـ API
const FALLBACK_CONNECTED: ConnectedSource[] = [];
const FALLBACK_AVAILABLE: AvailableSource[] = [
  { name: 'DHRU FUSION', type: 'dhru-fusion', icon: 'https://6990ab01681c79fa0bccfe99.imgix.net/ic_logo.svg', desc: 'اتصل بأي نظام DHRU FUSION لجلب خدمات فك القفل والـ IMEI تلقائياً. يدعم SD-Unlocker وغيرها.', category: 'API', fields: ['URL', 'Username', 'API Access Key'] },
];

// ─── Connection Modal ───
function ConnectSourceModal({ source, onClose, onSuccess }: { source: AvailableSource; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [step, setStep] = useState<'form' | 'testing' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [sourceName, setSourceName] = useState(source.name);

  const fieldLabels: Record<string, string> = {
    'URL': 'رابط الـ API',
    'Username': 'اسم المستخدم',
    'API Access Key': 'مفتاح الـ API',
  };

  const fieldPlaceholders: Record<string, string> = {
    'URL': 'https://example.com/api',
    'Username': 'اسم المستخدم في النظام',
    'API Access Key': 'أدخل مفتاح الوصول',
  };

  const allFilled = source.fields.every(f => formData[f]?.trim());

  async function handleConnect() {
    if (!allFilled) return;
    setStep('testing');
    setErrorMsg('');
    try {
      const payload: Record<string, unknown> = {
        name: sourceName || source.name,
        type: source.type,
        url: formData['URL'] || '',
        username: formData['Username'] || '',
        api_key: formData['API Access Key'] || '',
        category: source.category,
      };
      const res = await adminApi.connectSource(payload);
      if (res?.error) {
        setStep('error');
        setErrorMsg(res.error || res.message || 'فشل الاتصال');
      } else {
        setStep('success');
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      }
    } catch (err: unknown) {
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : 'فشل الاتصال بالمصدر');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '92%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {source.icon.startsWith('http') ? <img src={source.icon} alt={source.name} style={{ width: 32, height: 32, objectFit: 'contain' }} /> : <span style={{ fontSize: '1.5rem' }}>{source.icon}</span>}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020' }}>ربط {source.name}</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{source.category}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Form */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Source Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>اسم المصدر</label>
              <input
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                placeholder="مثال: SD-Unlocker"
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Dynamic Fields */}
            {source.fields.map(field => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  {fieldLabels[field] || field} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={formData[field] || ''}
                    onChange={e => setFormData(d => ({ ...d, [field]: e.target.value }))}
                    placeholder={fieldPlaceholders[field] || field}
                    type={field === 'API Access Key' && !showApiKey ? 'password' : 'text'}
                    dir={field === 'URL' || field === 'API Access Key' ? 'ltr' : 'rtl'}
                    style={{
                      width: '100%', padding: '0.7rem 1rem',
                      paddingLeft: field === 'API Access Key' ? '2.5rem' : '1rem',
                      borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem',
                      fontFamily: field === 'URL' || field === 'API Access Key' ? 'monospace, Tajawal' : 'Tajawal, sans-serif',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {field === 'API Access Key' && (
                    <button onClick={() => setShowApiKey(!showApiKey)} style={{
                      position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}>
                      {showApiKey ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  )}
                </div>
                {field === 'URL' && (
                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                    مثال: https://sd-unlocker.com أو https://yourdomain.com
                  </p>
                )}
              </div>
            ))}

            {/* Info Box */}
            <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Link2 size={14} color="#0369a1" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: 1.6 }}>
                سيتم اختبار الاتصال تلقائياً ثم جلب جميع الخدمات المتاحة من المصدر.
              </p>
            </div>

            {/* Submit */}
            <button onClick={handleConnect} disabled={!allFilled} style={{
              width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
              background: allFilled ? 'linear-gradient(135deg, #7c5cff, #6d4de6)' : '#e2e8f0',
              color: allFilled ? '#fff' : '#94a3b8', fontSize: '0.88rem', fontWeight: 700,
              cursor: allFilled ? 'pointer' : 'not-allowed', fontFamily: 'Tajawal, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <PlugZap size={16} /> اختبار وربط المصدر
            </button>
          </div>
        )}

        {/* Testing */}
        {step === 'testing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Loader2 size={40} color="#7c5cff" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>جاري اختبار الاتصال...</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>يتم التحقق من بيانات الدخول وجلب الخدمات</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>تم الربط بنجاح! ✅</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>تم الاتصال بـ {sourceName} وجلب الخدمات المتاحة.</p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>فشل الاتصال</h3>
            <p style={{ fontSize: '0.82rem', color: '#ef4444', marginBottom: 16, lineHeight: 1.6 }}>{errorMsg}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setStep('form')} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b',
                border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>تعديل البيانات</button>
              <button onClick={handleConnect} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff',
                border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', gap: 4,
              }}><RefreshCcw size={14} /> إعادة المحاولة</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExternalSourcesPage() {
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const [sourceResults, setSourceResults] = useState<Record<number, { type: 'sync' | 'test'; success: boolean; message: string; logs?: string[]; count?: number; balance?: string; currency?: string }>>({});
  const [connectingSource, setConnectingSource] = useState<AvailableSource | null>(null);
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>(FALLBACK_CONNECTED);
  const [availableSources, setAvailableSources] = useState<AvailableSource[]>(FALLBACK_AVAILABLE);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState({ connected: 0, balance: '$0.00', imported: 0, lastSync: '--' });

  // ─── جلب المصادر من الباك اند ───
  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSources();

      // الباكند يرجع مصفوفة مسطحة من المصادر
      const rawList = Array.isArray(data) ? data : (data?.sources || data?.connected || []);
      const mapped: ConnectedSource[] = rawList.map((s: Record<string, unknown>) => {
        const typeIcons: Record<string, string> = {
          'dhru-fusion': 'https://6990ab01681c79fa0bccfe99.imgix.net/ic_logo.svg',
          'sd-unlocker': '🔓',
          'unlock-world': '🌍',
          'custom-api': '🔧',
        };
        const statusMap: Record<string, { label: string; color: string }> = {
          connected: { label: 'متصل', color: '#16a34a' },
          disconnected: { label: 'غير متصل', color: '#dc2626' },
          unknown: { label: 'غير محدد', color: '#f59e0b' },
        };
        const st = statusMap[String(s.connectionStatus)] || statusMap.unknown;
        return {
          id: Number(s.id),
          name: String(s.name || ''),
          icon: typeIcons[String(s.type)] || '🔧',
          type: String(s.type || ''),
          url: String(s.url || ''),
          status: st.label,
          statusColor: st.color,
          lastSync: s.lastConnectionCheckedAt ? new Date(String(s.lastConnectionCheckedAt)).toLocaleString('ar-EG') : '--',
          products: Number(s.productsCount || 0),
          balance: s.lastAccountBalance ? `${s.lastAccountBalance} ${s.lastAccountCurrency || ''}`.trim() : '--',
          connectionError: s.lastConnectionError ? String(s.lastConnectionError) : null,
        };
      });

      setConnectedSources(mapped);
      // تحديث الإحصائيات
      setStats({
        connected: mapped.length,
        balance: mapped.find(m => m.balance !== '--')?.balance || '$0.00',
        imported: mapped.reduce((sum, m) => sum + m.products, 0),
        lastSync: mapped.find(m => m.lastSync !== '--')?.lastSync || '--',
      });
    } catch {
      console.warn('[Sources] فشل جلب المصادر من الخادم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  // ─── مزامنة مصدر ───
  const handleSync = async (sourceId: number) => {
    setSyncing(sourceId);
    setExpandedSource(sourceId);
    try {
      const res = await adminApi.syncSource(sourceId);
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'sync',
          success: !!res?.success,
          message: res?.success ? `تم مزامنة ${res.count || 0} خدمة بنجاح` : (res?.error || 'فشل المزامنة'),
          logs: res?.logs || [],
          count: res?.count,
          balance: res?.account?.creditraw || res?.account?.credits,
          currency: res?.account?.currency,
        }
      }));
      await fetchSources();
    } catch (err: unknown) {
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'sync',
          success: false,
          message: err instanceof Error ? err.message : 'فشل المزامنة',
          logs: [],
        }
      }));
    } finally {
      setSyncing(null);
    }
  };

  // ─── اختبار اتصال مصدر ───
  const handleTest = async (sourceId: number) => {
    setTesting(sourceId);
    setExpandedSource(sourceId);
    try {
      const res = await adminApi.testSource(sourceId);
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'test',
          success: !!res?.connectionOk,
          message: res?.connectionOk ? 'الاتصال ناجح ✅' : (res?.error || 'فشل الاتصال'),
          balance: res?.sourceBalance,
          currency: res?.sourceCurrency,
        }
      }));
      await fetchSources();
    } catch (err: unknown) {
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'test',
          success: false,
          message: err instanceof Error ? err.message : 'فشل اختبار الاتصال',
        }
      }));
    } finally {
      setTesting(null);
    }
  };

  // ─── حذف مصدر ───
  const handleDelete = async (sourceId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصدر؟ سيتم حذف جميع الخدمات المرتبطة به.')) return;
    setDeleting(sourceId);
    try {
      await adminApi.deleteSource(sourceId);
      await fetchSources();
    } catch {
      console.warn('[Sources] فشل حذف المصدر');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🔗 المصادر الخارجية</h2>
        <button onClick={() => { setActiveTab('available'); }} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.6rem 1.25rem', borderRadius: 10,
          background: '#7c5cff', color: '#fff',
          border: 'none', fontSize: '0.82rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
        }}>
          <Plus size={16} /> ربط مصدر جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'مصادر متصلة', value: String(stats.connected), icon: Wifi, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'الرصيد', value: stats.balance, icon: CreditCard, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'خدمات مستوردة', value: String(stats.imported), icon: Package, color: '#7c5cff', bg: '#f5f3ff' },
          { label: 'آخر مزامنة', value: stats.lastSync, icon: RefreshCcw, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '1rem',
              border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0b1020', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #f1f5f9' }}>
        {[
          { id: 'available', label: 'المصادر المتاحة' },
          { id: 'connected', label: 'المصادر المتصلة' },
          { id: 'logs', label: 'سجل المزامنة' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif', fontSize: '0.8rem', fontWeight: 600,
            background: activeTab === tab.id ? '#7c5cff' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#64748b',
            transition: 'all 0.2s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Connected Sources */}
      {activeTab === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {connectedSources.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>🔗</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0b1020', marginBottom: 4 }}>لا توجد مصادر متصلة بعد</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16 }}>اربط مصدر من تبويب "المصادر المتاحة" لبدء جلب الخدمات</p>
              <button onClick={() => setActiveTab('available')} style={{
                padding: '0.55rem 1.25rem', borderRadius: 10, border: 'none',
                background: '#7c5cff', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}><Plus size={15} /> ربط مصدر جديد</button>
            </div>
          )}
          {connectedSources.map(src => {
            const result = sourceResults[src.id];
            const isExpanded = expandedSource === src.id;
            return (
            <div key={src.id} style={{
              background: '#fff', borderRadius: 14, padding: '1.25rem',
              border: `1px solid ${src.connectionError ? '#fecaca' : '#f1f5f9'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {src.icon.startsWith('http') ? <img src={src.icon} alt={src.name} style={{ width: 36, height: 36, objectFit: 'contain' }} /> : <span style={{ fontSize: '1.75rem' }}>{src.icon}</span>}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{src.name}</h4>
                      <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: src.statusColor === '#16a34a' ? '#dcfce7' : src.statusColor === '#dc2626' ? '#fee2e2' : '#fef9c3',
                        color: src.statusColor,
                      }}>{src.status}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{src.type} • {src.url}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => handleTest(src.id)} disabled={testing === src.id} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: testing === src.id ? 'wait' : 'pointer', fontSize: '0.72rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#3b82f6', opacity: testing === src.id ? 0.6 : 1,
                  }}>
                    {testing === src.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />} {testing === src.id ? 'جاري...' : 'اختبار'}
                  </button>
                  <button onClick={() => handleSync(src.id)} disabled={syncing === src.id} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: syncing === src.id ? 'wait' : 'pointer', fontSize: '0.72rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#64748b', opacity: syncing === src.id ? 0.6 : 1,
                  }}>
                    <RefreshCcw size={13} style={syncing === src.id ? { animation: 'spin 1s linear infinite' } : {}} /> {syncing === src.id ? 'جاري...' : 'مزامنة'}
                  </button>
                  <button onClick={() => handleDelete(src.id)} disabled={deleting === src.id} style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none',
                    background: '#fee2e2', cursor: deleting === src.id ? 'wait' : 'pointer',
                    display: 'grid', placeItems: 'center', opacity: deleting === src.id ? 0.5 : 1,
                  }}>
                    {deleting === src.id ? <Loader2 size={13} color="#dc2626" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} color="#dc2626" />}
                  </button>
                </div>
              </div>

              {/* إحصائيات + خطأ الاتصال */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: src.connectionError || result ? 12 : 0 }}>
                {[
                  { label: 'الخدمات', value: src.products, icon: Package },
                  { label: 'الرصيد', value: src.balance, icon: CreditCard },
                  { label: 'آخر مزامنة', value: src.lastSync, icon: Clock },
                ].map((info, j) => {
                  const InfoIcon = info.icon;
                  return (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0.5rem 0.85rem', background: '#f8fafc', borderRadius: 8,
                    }}>
                      <InfoIcon size={14} color="#94a3b8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {info.label}: <strong style={{ color: '#0b1020' }}>{info.value}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* خطأ اتصال محفوظ */}
              {src.connectionError && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0.65rem 0.85rem',
                  background: '#fef2f2', borderRadius: 8, marginBottom: result ? 12 : 0,
                }}>
                  <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>خطأ اتصال</p>
                    <p style={{ fontSize: '0.7rem', color: '#991b1b', lineHeight: 1.5, wordBreak: 'break-word' }}>{src.connectionError}</p>
                  </div>
                </div>
              )}

              {/* نتيجة الاختبار / المزامنة */}
              {result && (
                <div style={{
                  background: result.success ? '#f0fdf4' : '#fef2f2', borderRadius: 10,
                  border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                  overflow: 'hidden',
                }}>
                  <button onClick={() => setExpandedSource(isExpanded ? null : src.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Tajawal, sans-serif',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {result.success ? <CheckCircle size={15} color="#16a34a" /> : <AlertCircle size={15} color="#dc2626" />}
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: result.success ? '#16a34a' : '#dc2626' }}>
                        {result.type === 'test' ? 'نتيجة الاختبار' : 'نتيجة المزامنة'}: {result.message}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 0.85rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
                      {result.balance && (
                        <p style={{ marginBottom: 6 }}>
                          <CreditCard size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                          الرصيد: <strong>{result.balance} {result.currency || ''}</strong>
                        </p>
                      )}
                      {result.count !== undefined && (
                        <p style={{ marginBottom: 6 }}>
                          <Package size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                          خدمات مستوردة: <strong>{result.count}</strong>
                        </p>
                      )}
                      {result.logs && result.logs.length > 0 && (
                        <div style={{
                          marginTop: 8, background: '#0b1020', borderRadius: 8, padding: '0.75rem',
                          maxHeight: 200, overflow: 'auto', direction: 'ltr',
                        }}>
                          <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>سجل العمليات:</p>
                          {result.logs.map((log, li) => (
                            <p key={li} style={{
                              fontSize: '0.68rem', fontFamily: 'monospace, Tajawal',
                              color: log.startsWith('✓') || log.includes('OK') ? '#4ade80' : log.startsWith('✗') || log.includes('FAILED') || log.includes('Error') ? '#f87171' : '#94a3b8',
                              lineHeight: 1.7,
                            }}>
                              {log}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}

      {/* Available Sources */}
      {activeTab === 'available' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {availableSources.map((src, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: '1.5rem',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {src.icon.startsWith('http') ? <img src={src.icon} alt={src.name} style={{ width: 32, height: 32, objectFit: 'contain' }} /> : <span style={{ fontSize: '1.5rem' }}>{src.icon}</span>}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1020' }}>{src.name}</h4>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: 4,
                    background: '#f0fdf4', color: '#16a34a', fontWeight: 600, border: '1px solid #bbf7d0',
                  }}>{src.category}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{src.desc}</p>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>الحقول المطلوبة للاتصال:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {src.fields.map((f, j) => (
                    <span key={j} style={{
                      fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: 6,
                      background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600,
                    }}>{f}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => setConnectingSource(src)} style={{
                width: '100%', padding: '0.6rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', color: '#fff',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <PlugZap size={15} /> ربط الآن
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sync Logs */}
      {activeTab === 'logs' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020' }}>سجل المزامنة الأخيرة</h3>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              fontFamily: 'Tajawal, sans-serif', color: '#64748b',
            }}>
              <RefreshCcw size={12} /> تحديث
            </button>
          </div>
          {syncLogs.map((log, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0.85rem 1.25rem',
              borderBottom: i < syncLogs.length - 1 ? '1px solid #f8fafc' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#dcfce7', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <CheckCircle size={15} color="#16a34a" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{log.source} — {log.action}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.count}</p>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{log.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      {connectingSource && (
        <ConnectSourceModal
          source={connectingSource}
          onClose={() => setConnectingSource(null)}
          onSuccess={() => { fetchSources(); setActiveTab('connected'); }}
        />
      )}
    </>
  );
}
