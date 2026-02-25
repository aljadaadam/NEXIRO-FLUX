'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '@/lib/api';
import {
  Plus, RefreshCcw, Settings, Trash2, Wifi, CreditCard,
  Package, Clock, CheckCircle, AlertCircle, PlugZap, Loader2,
  X, Eye, EyeOff, Link2, Send, ChevronDown, ChevronUp, Zap,
  Edit3, DollarSign, Percent, Globe, WifiOff, Search, Server,
} from 'lucide-react';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

/* ───────── Interfaces ───────── */
interface ConnectedSource {
  id: number;
  name: string;
  icon: string;
  type: string;
  url: string;
  profitPercentage: number;
  profitAmount: number | null;
  status: string;
  statusColor: string;
  lastSync: string;
  products: number;
  balance: string;
  connectionError: string | null;
  syncOnly: boolean;
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
  status: 'success' | 'error';
}

// بيانات احتياطية
const FALLBACK_CONNECTED: ConnectedSource[] = [];
const FALLBACK_AVAILABLE: AvailableSource[] = [
  { name: 'DHRU FUSION', type: 'dhru-fusion', icon: 'https://6990ab01681c79fa0bccfe99.imgix.net/ic_logo.svg', desc: 'اتصل بأي نظام DHRU FUSION لجلب خدمات فك القفل والـ IMEI تلقائياً. يدعم SD-Unlocker وغيرها.', category: 'API', fields: ['URL', 'Username', 'API Access Key'] },
  { name: 'IMEI Checker', type: 'imeicheck', icon: 'https://imeicheck.com/front/images/logo.svg', desc: 'اتصل بمنصة IMEI Checker لفحص أجهزة Apple والتحقق من حالة IMEI/SN فورياً. نتائج لحظية مع دعم كامل لجميع خدمات الفحص.', category: 'IMEI', fields: ['Username', 'API Access Key'] },
];

/* ───────── Skeleton Components ───────── */
function StatSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '1rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: 50, height: 18, borderRadius: 6, background: '#f1f5f9', marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 70, height: 12, borderRadius: 4, background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

function SourceCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      <div style={{ height: 100, background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[80, 60, 90, 70].map((w, i) => (
            <div key={i} style={{ width: w, height: 28, borderRadius: 6, background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ width: '100%', height: 42, borderRadius: 10, background: '#f1f5f9', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '100%', height: 48, borderRadius: 10, background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

/* ───────── Delete Confirmation Modal ───────── */
function DeleteConfirmModal({ sourceName, onConfirm, onCancel }: { sourceName: string; onConfirm: () => void; onCancel: () => void }) {
  const { t, isRTL } = useAdminLang();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={24} color="#dc2626" />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020', textAlign: 'center', marginBottom: 8 }}>{t('حذف المصدر')}</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', lineHeight: 1.7, marginBottom: 20 }}>
          {t('هل أنت متأكد من حذف')} <strong style={{ color: '#0b1020' }}>{sourceName}</strong>{t('؟')}<br />{t('سيتم حذف جميع الخدمات المرتبطة به نهائياً.')}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>{t('إلغاء')}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, background: '#dc2626', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Trash2 size={14} /> {t('نعم، احذف')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Edit Source Modal ───────── */
function EditSourceModal({ source, onClose, onSuccess }: { source: ConnectedSource; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(source.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t, isRTL } = useAdminLang();

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await adminApi.updateSource(source.id, { name: name.trim() });
      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('فشل التحديث'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020' }}>{t('تعديل المصدر')}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>{t('اسم المصدر')}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('اسم المصدر')} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('النوع:')} <strong style={{ color: '#475569' }}>{source.type}</strong></p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('الرابط:')} <strong style={{ color: '#475569', direction: 'ltr', display: 'inline-block' }}>{source.url}</strong></p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 0.85rem', background: '#fef2f2', borderRadius: 8 }}>
              <AlertCircle size={14} color="#dc2626" />
              <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</p>
            </div>
          )}

          <button onClick={handleSave} disabled={saving || !name.trim()} style={{
            width: '100%', padding: '0.7rem', borderRadius: 10, border: 'none',
            background: name.trim() ? '#7c5cff' : '#e2e8f0', color: name.trim() ? '#fff' : '#94a3b8',
            fontSize: '0.85rem', fontWeight: 700, cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
            {saving ? t('جاري الحفظ...') : t('حفظ التغييرات')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Connect Source Modal ───────── */
function ConnectSourceModal({ source, onClose, onSuccess }: { source: AvailableSource; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [step, setStep] = useState<'form' | 'testing' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [sourceName, setSourceName] = useState(source.name);
  const [profitPercentage, setProfitPercentage] = useState('0');
  const [profitType, setProfitType] = useState<'percentage' | 'fixed'>('percentage');
  const [profitAmount, setProfitAmount] = useState('0');
  const { t, isRTL } = useAdminLang();

  const fieldLabels: Record<string, string> = {
    'URL': t('رابط الـ API'),
    'Username': t('اسم المستخدم'),
    'API Access Key': t('مفتاح الـ API'),
  };

  const fieldPlaceholders: Record<string, string> = {
    'URL': 'https://sd-unlocker.com',
    'Username': t('اسم المستخدم في النظام'),
    'API Access Key': source.type === 'imeicheck' ? t('أدخل مفتاح API من لوحة تحكم IMEI Check') : t('أدخل مفتاح الوصول'),
  };

  const allFilled = source.fields.every(f => formData[f]?.trim());

  async function handleConnect() {
    if (!allFilled) return;
    setStep('testing');
    setErrorMsg('');
    try {
      const isImeiCheck = source.type === 'imeicheck';
      const payload: Record<string, unknown> = {
        name: sourceName || source.name,
        type: source.type,
        url: isImeiCheck ? 'https://alpha.imeicheck.com/api/index.php' : (formData['URL'] || ''),
        username: isImeiCheck ? (formData['Username'] || '') : (formData['Username'] || ''),
        apiKey: formData['API Access Key'] || '',
        profitPercentage: profitType === 'percentage' ? Number(profitPercentage || '0') : 0,
        profitAmount: profitType === 'fixed' ? Number(profitAmount || '0') : null,
        category: source.category,
      };
      const res = await adminApi.connectSource(payload);
      if (res?.error) {
        setStep('error');
        setErrorMsg(res.error || res.message || t('فشل الاتصال'));
      } else {
        setStep('success');
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      }
    } catch (err: unknown) {
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : t('فشل الاتصال بالمصدر'));
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '92%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {source.icon.startsWith('http') ? <img src={source.icon} alt={source.name} style={{ width: 32, height: 32, objectFit: 'contain' }} /> : <Globe size={24} color="#7c5cff" />}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020' }}>{t('ربط')} {source.name}</h3>
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
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>{t('اسم المصدر')}</label>
              <input value={sourceName} onChange={e => setSourceName(e.target.value)} placeholder={isRTL ? 'مثال: SD-Unlocker' : 'Example: SD-Unlocker'} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>

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
                    <Search size={10} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: isRTL ? 3 : 0, marginRight: isRTL ? 0 : 3 }} />
                    {t('أدخل رابط الموقع فقط — سيتم اكتشاف مسار API تلقائياً')}
                  </p>
                )}
              </div>
            ))}

            {/* Profit Type Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>{t('نوع الربح')}</label>
              <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 3, marginBottom: 10 }}>
                <button onClick={() => setProfitType('percentage')} style={{
                  flex: 1, padding: '0.45rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif', fontSize: '0.75rem', fontWeight: 600,
                  background: profitType === 'percentage' ? '#7c5cff' : 'transparent',
                  color: profitType === 'percentage' ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transition: 'all 0.2s',
                }}><Percent size={13} /> {t('نسبة مئوية')}</button>
                <button onClick={() => setProfitType('fixed')} style={{
                  flex: 1, padding: '0.45rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif', fontSize: '0.75rem', fontWeight: 600,
                  background: profitType === 'fixed' ? '#7c5cff' : 'transparent',
                  color: profitType === 'fixed' ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transition: 'all 0.2s',
                }}><DollarSign size={13} /> {t('مبلغ ثابت')}</button>
              </div>
              <input
                value={profitType === 'percentage' ? profitPercentage : profitAmount}
                onChange={e => profitType === 'percentage' ? setProfitPercentage(e.target.value) : setProfitAmount(e.target.value)}
                type="number" min={0} step="0.01" placeholder="0"
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                {profitType === 'percentage' ? t('تُضاف كنسبة مئوية فوق سعر التكلفة.') : t('يُضاف كمبلغ ثابت ($) فوق سعر التكلفة.')}
              </p>
            </div>

            <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Link2 size={14} color="#0369a1" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: 1.6 }}>
                {source.type === 'imeicheck'
                  ? t('سيتم اختبار الاتصال عبر فحص الرصيد ثم جلب جميع الخدمات المتاحة من IMEI Check.')
                  : t('سيتم اختبار الاتصال تلقائياً ثم جلب جميع الخدمات المتاحة من المصدر.')
                }
              </p>
            </div>

            <button onClick={handleConnect} disabled={!allFilled} style={{
              width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
              background: allFilled ? 'linear-gradient(135deg, #7c5cff, #6d4de6)' : '#e2e8f0',
              color: allFilled ? '#fff' : '#94a3b8', fontSize: '0.88rem', fontWeight: 700,
              cursor: allFilled ? 'pointer' : 'not-allowed', fontFamily: 'Tajawal, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <PlugZap size={16} /> {t('اختبار وربط المصدر')}
            </button>
          </div>
        )}

        {/* Testing */}
        {step === 'testing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Loader2 size={40} color="#7c5cff" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>{t('جاري اختبار الاتصال...')}</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('يتم التحقق من بيانات الدخول وجلب الخدمات')}</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>{t('تم الربط بنجاح!')}</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{isRTL ? <>تم الاتصال بـ {sourceName} وجلب الخدمات المتاحة.</> : <>Connected to {sourceName} and imported available services.</>}</p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>{t('فشل الاتصال')}</h3>
            <p style={{ fontSize: '0.82rem', color: '#ef4444', marginBottom: 16, lineHeight: 1.6 }}>{errorMsg}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setStep('form')} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b',
                border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>{t('تعديل البيانات')}</button>
              <button onClick={handleConnect} style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff',
                border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', gap: 4,
              }}><RefreshCcw size={14} /> {t('إعادة المحاولة')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* ═══════════ Main Page Component ═══════════ */
/* ═══════════════════════════════════════════ */
export default function ExternalSourcesPage() {
  const { t, isRTL } = useAdminLang();
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const [sourceResults, setSourceResults] = useState<Record<number, { type: 'sync' | 'test'; success: boolean; message: string; logs?: string[]; count?: number; balance?: string; currency?: string }>>({});
  const [connectingSource, setConnectingSource] = useState<AvailableSource | null>(null);
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>(FALLBACK_CONNECTED);
  const [profitInputs, setProfitInputs] = useState<Record<number, string>>({});
  const [profitTypeInputs, setProfitTypeInputs] = useState<Record<number, 'percentage' | 'fixed'>>({});
  const [applyingProfit, setApplyingProfit] = useState<number | null>(null);
  const [togglingSync, setTogglingSync] = useState<number | null>(null);
  const [availableSources] = useState<AvailableSource[]>(FALLBACK_AVAILABLE);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState({ connected: 0, balance: '$0.00', imported: 0, lastSync: '--' });
  const [deleteTarget, setDeleteTarget] = useState<ConnectedSource | null>(null);
  const [editTarget, setEditTarget] = useState<ConnectedSource | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Toast
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── جلب المصادر ───
  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSources();
      const rawList = Array.isArray(data) ? data : (data?.sources || data?.connected || []);
      const mapped: ConnectedSource[] = rawList.map((s: Record<string, unknown>) => {
        const typeIcons: Record<string, string> = {
          'dhru-fusion': 'https://6990ab01681c79fa0bccfe99.imgix.net/ic_logo.svg',
          'imeicheck': 'https://imeicheck.com/front/images/logo.svg',
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
          icon: typeIcons[String(s.type)] || '',
          type: String(s.type || ''),
          url: String(s.url || ''),
          profitPercentage: Number(s.profitPercentage || 0),
          profitAmount: s.profitAmount != null ? Number(s.profitAmount) : null,
          status: st.label,
          statusColor: st.color,
          lastSync: s.lastConnectionCheckedAt ? new Date(String(s.lastConnectionCheckedAt)).toLocaleString('ar-EG') : '--',
          products: Number(s.productsCount || 0),
          balance: s.lastAccountBalance ? `${s.lastAccountBalance} ${s.lastAccountCurrency || ''}`.trim() : '--',
          connectionError: s.lastConnectionError ? String(s.lastConnectionError) : null,
          syncOnly: Boolean(s.syncOnly),
        };
      });

      setConnectedSources(mapped);
      const nextProfitInputs: Record<number, string> = {};
      const nextProfitTypes: Record<number, 'percentage' | 'fixed'> = {};
      mapped.forEach((m) => {
        if (m.profitAmount && m.profitAmount > 0) {
          nextProfitInputs[m.id] = String(m.profitAmount);
          nextProfitTypes[m.id] = 'fixed';
        } else {
          nextProfitInputs[m.id] = String(m.profitPercentage ?? 0);
          nextProfitTypes[m.id] = 'percentage';
        }
      });
      setProfitInputs(nextProfitInputs);
      setProfitTypeInputs(nextProfitTypes);

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

  // ─── تطبيق الربح ───
  const handleApplyProfit = useCallback(async (sourceId: number) => {
    const pType = profitTypeInputs[sourceId] || 'percentage';
    const val = Number(profitInputs[sourceId] ?? 0);
    if (Number.isNaN(val) || val < 0) {
      showToast(t('القيمة غير صالحة'), 'error');
      return;
    }

    setApplyingProfit(sourceId);
    setExpandedSource(sourceId);
    try {
      const payload = pType === 'percentage'
        ? { profitPercentage: val, profitAmount: null }
        : { profitPercentage: 0, profitAmount: val };
      const res = await adminApi.applySourceProfit(sourceId, payload);
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'sync', success: !!res?.success,
          message: res?.success
            ? (isRTL ? `تم تطبيق ${pType === 'percentage' ? `نسبة ${val}%` : `مبلغ $${val}`} على ${res?.productsCount || 0} منتج` : `Applied ${pType === 'percentage' ? `${val}% profit` : `$${val} fixed`} to ${res?.productsCount || 0} products`)
            : (res?.error || t('فشل تطبيق الربح')),
          logs: res?.success ? [
            `✓ ${pType === 'percentage' ? `Profit percentage: ${val}%` : `Fixed profit: $${val}`}`,
            `✓ Applied to ${res?.productsCount || 0} products`,
            '✓ Saved in DB — persists across syncs',
          ] : [],
        }
      }));
      if (res?.success) showToast(t('تم تطبيق الربح بنجاح'), 'success');
      await fetchSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل تطبيق الربح');
      showToast(msg, 'error');
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: { type: 'sync', success: false, message: msg, logs: [] }
      }));
    } finally {
      setApplyingProfit(null);
    }
  }, [profitInputs, profitTypeInputs, fetchSources, showToast, t, isRTL]);

  // ─── مزامنة ───
  const handleSync = useCallback(async (sourceId: number) => {
    setSyncing(sourceId);
    setExpandedSource(sourceId);
    try {
      const res = await adminApi.syncSource(sourceId);
      const newLog: SyncLog = {
        time: new Date().toLocaleString('ar-EG'),
        source: connectedSources.find(s => s.id === sourceId)?.name || t('مصدر'),
        action: t('مزامنة الخدمات'),
        count: isRTL ? `${res?.count || 0} خدمة` : `${res?.count || 0} services`,
        status: res?.success ? 'success' : 'error',
      };
      setSyncLogs(prev => [newLog, ...prev].slice(0, 20));
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'sync', success: !!res?.success,
          message: res?.success ? (isRTL ? `تم مزامنة ${res.count || 0} خدمة بنجاح` : `Synced ${res.count || 0} services successfully`) : (res?.error || t('فشل المزامنة')),
          logs: res?.logs || [], count: res?.count,
          balance: res?.account?.creditraw || res?.account?.credits,
          currency: res?.account?.currency,
        }
      }));
      if (res?.success) showToast(isRTL ? `تم مزامنة ${res.count || 0} خدمة` : `Synced ${res.count || 0} services`, 'success');
      await fetchSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل المزامنة');
      showToast(msg, 'error');
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: { type: 'sync', success: false, message: msg, logs: [] }
      }));
    } finally {
      setSyncing(null);
    }
  }, [connectedSources, fetchSources, showToast, t, isRTL]);

  // ─── اختبار ───
  const handleTest = useCallback(async (sourceId: number) => {
    setTesting(sourceId);
    setExpandedSource(sourceId);
    try {
      const res = await adminApi.testSource(sourceId);
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: {
          type: 'test', success: !!res?.connectionOk,
          message: res?.connectionOk
            ? (isRTL ? `الاتصال ناجح${res?.resolvedUrl ? ` — تم اكتشاف: ${res.resolvedUrl}` : ''}` : `Connection successful${res?.resolvedUrl ? ` — Resolved: ${res.resolvedUrl}` : ''}`)
            : (res?.error || t('فشل الاتصال')),
          balance: res?.sourceBalance, currency: res?.sourceCurrency,
        }
      }));
      if (res?.connectionOk) showToast(t('الاتصال ناجح'), 'success');
      await fetchSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل اختبار الاتصال');
      showToast(msg, 'error');
      setSourceResults(prev => ({
        ...prev,
        [sourceId]: { type: 'test', success: false, message: msg }
      }));
    } finally {
      setTesting(null);
    }
  }, [fetchSources, showToast, t, isRTL]);

  // ─── حذف ───
  const handleDelete = useCallback(async (sourceId: number) => {
    setDeleting(sourceId);
    try {
      await adminApi.deleteSource(sourceId);
      showToast(t('تم حذف المصدر بنجاح'), 'success');
      await fetchSources();
    } catch {
      showToast(t('فشل حذف المصدر'), 'error');
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  }, [fetchSources, showToast, t]);

  // ─── تبديل وضع المزامنة ───
  const handleToggleSyncOnly = useCallback(async (sourceId: number, currentSyncOnly: boolean) => {
    setTogglingSync(sourceId);
    try {
      await adminApi.toggleSyncOnly(sourceId, !currentSyncOnly);
      showToast(!currentSyncOnly ? t('تم التبديل لوضع المزامنة فقط') : t('تم تفعيل التثبيت في المتجر'), 'success');
      await fetchSources();
    } catch {
      showToast(t('فشل تبديل وضع المزامنة'), 'error');
    } finally {
      setTogglingSync(null);
    }
  }, [fetchSources, showToast, t]);

  // Count per tab
  const connectedCount = connectedSources.length;

  // Tabs memoized
  const tabs = useMemo(() => [
    { id: 'available', label: t('المصادر المتاحة'), count: availableSources.length },
    { id: 'connected', label: t('المصادر المتصلة'), count: connectedCount },
    { id: 'logs', label: t('سجل المزامنة'), count: syncLogs.length },
  ], [availableSources.length, connectedCount, syncLogs.length, t]);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
          padding: '0.7rem 1.5rem', borderRadius: 12,
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#15803d' : '#dc2626',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          animation: 'slideDown 0.3s ease-out',
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .src-card { transition: transform 0.2s, box-shadow 0.2s; }
        .src-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124,92,255,0.12) !important; }
        .src-btn { transition: all 0.2s; }
        .src-btn:hover { opacity: 0.85; transform: scale(1.02); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', display: 'grid', placeItems: 'center' }}>
            <Link2 size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>{t('المصادر الخارجية')}</h2>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('إدارة مصادر API الخارجية ومزامنة الخدمات')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchSources} className="src-btn" style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 1rem', borderRadius: 10,
            background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}><RefreshCcw size={14} /> {t('تحديث')}</button>
          <button onClick={() => setActiveTab('available')} className="src-btn" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', color: '#fff',
            border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}><Plus size={16} /> {t('ربط مصدر جديد')}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="src-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          [
            { label: t('مصادر متصلة'), value: String(stats.connected), icon: Wifi, color: '#22c55e', bg: '#f0fdf4' },
            { label: t('الرصيد'), value: stats.balance, icon: CreditCard, color: '#3b82f6', bg: '#eff6ff' },
            { label: t('خدمات مستوردة'), value: String(stats.imported), icon: Package, color: '#7c5cff', bg: '#f5f3ff' },
            { label: t('آخر مزامنة'), value: stats.lastSync, icon: RefreshCcw, color: '#f59e0b', bg: '#fffbeb' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '1rem',
                border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12,
                transition: 'box-shadow 0.2s',
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
          })
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #f1f5f9' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif', fontSize: '0.8rem', fontWeight: 600,
            background: activeTab === tab.id ? '#7c5cff' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#64748b',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 6,
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ Available Sources ═══ */}
      {activeTab === 'available' && (
        <div className="src-available-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {availableSources.map((src, i) => (
            <div key={i} className="src-card" style={{
              background: '#fff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', cursor: 'pointer',
            }} onClick={() => setConnectingSource(src)}>
              {/* Card background with source image */}
              <div style={{
                height: 120, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              }}>
                {src.icon.startsWith('http') ? (
                  <img src={src.icon} alt={src.name} style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'contain', padding: 28, opacity: 0.15, filter: 'brightness(2)',
                  }} />
                ) : (
                  <Globe size={60} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: -10, left: -10 }} />
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                  {src.icon.startsWith('http') ? (
                    <img src={src.icon} alt={src.name} style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }} />
                  ) : (
                    <Server size={28} color="#fff" />
                  )}
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{src.name}</h4>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.15rem 0.55rem', borderRadius: 6,
                    background: 'rgba(255,255,255,0.15)', color: '#e0e7ff', fontWeight: 600,
                    backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)',
                  }}>{src.category}</span>
                </div>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{t(src.desc)}</p>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>{t('الحقول المطلوبة:')}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {src.fields.map((f, j) => (
                      <span key={j} style={{
                        fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: 6,
                        background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600,
                      }}>{f}</span>
                    ))}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setConnectingSource(src); }} className="src-btn" style={{
                  width: '100%', padding: '0.65rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', color: '#fff',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <PlugZap size={15} /> {t('ربط الآن')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Connected Sources ═══ */}
      {activeTab === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading && (
            <>
              <SourceCardSkeleton /><SourceCardSkeleton />
            </>
          )}

          {!loading && connectedSources.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f5f3ff', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <WifiOff size={28} color="#7c5cff" />
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0b1020', marginBottom: 4 }}>{t('لا توجد مصادر متصلة بعد')}</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>{t('اربط مصدر من تبويب "المصادر المتاحة" لبدء جلب الخدمات تلقائياً')}</p>
              <button onClick={() => setActiveTab('available')} className="src-btn" style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #7c5cff, #6d4de6)', color: '#fff',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}><Plus size={15} /> {t('ربط مصدر جديد')}</button>
            </div>
          )}

          {!loading && connectedSources.map(src => {
            const result = sourceResults[src.id];
            const isExpanded = expandedSource === src.id;
            const pType = profitTypeInputs[src.id] || 'percentage';
            return (
            <div key={src.id} className="src-card" style={{
              background: '#fff', borderRadius: 16, overflow: 'hidden',
              border: `1px solid ${src.connectionError ? '#fecaca' : '#f1f5f9'}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              {/* ── Card Header with Background Image ── */}
              <div style={{
                position: 'relative', padding: '1.25rem', overflow: 'hidden',
                background: src.statusColor === '#16a34a'
                  ? 'linear-gradient(135deg, #0f172a, #1e293b)'
                  : src.statusColor === '#dc2626'
                  ? 'linear-gradient(135deg, #1c1917, #292524)'
                  : 'linear-gradient(135deg, #1a1a2e, #16213e)',
                minHeight: 90,
              }}>
                {/* Background source icon */}
                {src.icon.startsWith('http') ? (
                  <img src={src.icon} alt="" style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%', maxWidth: 200, height: 'auto',
                    objectFit: 'contain', opacity: 0.06, filter: 'brightness(2)',
                    pointerEvents: 'none',
                  }} />
                ) : (
                  <Globe size={100} color="rgba(255,255,255,0.04)" style={{ position: 'absolute', bottom: -20, left: -20, pointerEvents: 'none' }} />
                )}

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Source icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center',
                      border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0,
                    }}>
                      {src.icon.startsWith('http') ? (
                        <img src={src.icon} alt={src.name} style={{ width: 26, height: 26, objectFit: 'contain' }} />
                      ) : (
                        <Server size={20} color="#94a3b8" />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{src.name}</h4>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.62rem', fontWeight: 700,
                          background: src.statusColor === '#16a34a' ? 'rgba(34,197,94,0.15)' : src.statusColor === '#dc2626' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: src.statusColor === '#16a34a' ? '#4ade80' : src.statusColor === '#dc2626' ? '#f87171' : '#fbbf24',
                          border: `1px solid ${src.statusColor === '#16a34a' ? 'rgba(34,197,94,0.2)' : src.statusColor === '#dc2626' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        }}>{t(src.status)}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.8)', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{src.type} • {src.url}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => handleTest(src.id)} disabled={testing === src.id} className="src-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '0.4rem 0.75rem', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)',
                      cursor: testing === src.id ? 'wait' : 'pointer', fontSize: '0.72rem', fontWeight: 600,
                      fontFamily: 'Tajawal, sans-serif', color: '#93c5fd', opacity: testing === src.id ? 0.6 : 1,
                    }}>
                      {testing === src.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
                      {testing === src.id ? t('جاري...') : t('اختبار')}
                    </button>
                    <button onClick={() => handleSync(src.id)} disabled={syncing === src.id} className="src-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '0.4rem 0.75rem', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)',
                      cursor: syncing === src.id ? 'wait' : 'pointer', fontSize: '0.72rem', fontWeight: 600,
                      fontFamily: 'Tajawal, sans-serif', color: '#d1d5db', opacity: syncing === src.id ? 0.6 : 1,
                    }}>
                      <RefreshCcw size={13} style={syncing === src.id ? { animation: 'spin 1s linear infinite' } : {}} />
                      {syncing === src.id ? t('جاري...') : t('مزامنة')}
                    </button>
                    <button onClick={() => setEditTarget(src)} className="src-btn" style={{
                      width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'grid', placeItems: 'center',
                    }}>
                      <Edit3 size={13} color="#94a3b8" />
                    </button>
                    <button onClick={() => setDeleteTarget(src)} disabled={deleting === src.id} className="src-btn" style={{
                      width: 30, height: 30, borderRadius: 8, border: 'none',
                      background: 'rgba(239,68,68,0.15)', cursor: deleting === src.id ? 'wait' : 'pointer',
                      display: 'grid', placeItems: 'center', opacity: deleting === src.id ? 0.5 : 1,
                    }}>
                      {deleting === src.id ? <Loader2 size={13} color="#f87171" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} color="#f87171" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Card Body ── */}
              <div style={{ padding: '1rem 1.25rem' }}>
                {/* Quick stats */}
                <div className="src-mini-stats" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[
                    { label: t('الخدمات'), value: String(src.products), icon: Package, color: '#7c5cff' },
                    { label: t('الرصيد'), value: src.balance, icon: CreditCard, color: '#3b82f6' },
                    { label: t('آخر مزامنة'), value: src.lastSync, icon: Clock, color: '#f59e0b' },
                    { label: t('الربح'), value: src.profitAmount && src.profitAmount > 0 ? `$${src.profitAmount}` : `${src.profitPercentage}%`, icon: Settings, color: '#22c55e' },
                  ].map((info, j) => {
                    const InfoIcon = info.icon;
                    return (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '0.45rem 0.75rem', background: '#f8fafc', borderRadius: 8, flex: '1 1 auto', minWidth: 'fit-content',
                      }}>
                        <InfoIcon size={13} color={info.color} />
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {info.label}: <strong style={{ color: '#0b1020' }}>{info.value}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sync mode toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem', background: src.syncOnly ? '#fefce8' : '#f0fdf4',
                  borderRadius: 10, marginBottom: 12,
                  border: `1px solid ${src.syncOnly ? '#fde68a' : '#bbf7d0'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {src.syncOnly ? <EyeOff size={15} color="#ca8a04" /> : <Eye size={15} color="#16a34a" />}
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: src.syncOnly ? '#a16207' : '#15803d' }}>
                        {src.syncOnly ? t('مزامنة فقط') : t('مزامنة وتثبيت')}
                      </p>
                      <p style={{ fontSize: '0.65rem', color: src.syncOnly ? '#ca8a04' : '#16a34a' }}>
                        {src.syncOnly ? t('المنتجات مُزامَنة لكن لا تظهر للزبائن') : t('المنتجات مُزامَنة وتظهر في المتجر')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSyncOnly(src.id, src.syncOnly)}
                    disabled={togglingSync === src.id}
                    style={{
                      position: 'relative', width: 44, height: 24, borderRadius: 12,
                      border: 'none', cursor: togglingSync === src.id ? 'wait' : 'pointer',
                      background: src.syncOnly ? '#fbbf24' : '#22c55e',
                      transition: 'background 0.3s', flexShrink: 0,
                      opacity: togglingSync === src.id ? 0.6 : 1,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3,
                      left: src.syncOnly ? 3 : 23,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>

                {/* Profit section */}
                <div style={{
                  padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 10,
                  marginBottom: src.connectionError || result ? 12 : 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>{t('تطبيق الربح')}</span>
                    <div style={{ display: 'flex', gap: 2, background: '#e2e8f0', borderRadius: 6, padding: 2 }}>
                      <button onClick={() => setProfitTypeInputs(prev => ({ ...prev, [src.id]: 'percentage' }))} style={{
                        padding: '0.2rem 0.5rem', borderRadius: 5, border: 'none', cursor: 'pointer',
                        fontSize: '0.68rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                        background: pType === 'percentage' ? '#7c5cff' : 'transparent',
                        color: pType === 'percentage' ? '#fff' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: 3, transition: 'all 0.2s',
                      }}><Percent size={10} /> {t('نسبة')}</button>
                      <button onClick={() => setProfitTypeInputs(prev => ({ ...prev, [src.id]: 'fixed' }))} style={{
                        padding: '0.2rem 0.5rem', borderRadius: 5, border: 'none', cursor: 'pointer',
                        fontSize: '0.68rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                        background: pType === 'fixed' ? '#7c5cff' : 'transparent',
                        color: pType === 'fixed' ? '#fff' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: 3, transition: 'all 0.2s',
                      }}><DollarSign size={10} /> {t('مبلغ')}</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 100px' }}>
                      <input
                        type="number" min={0} step="0.01"
                        value={profitInputs[src.id] ?? '0'}
                        onChange={(e) => setProfitInputs(prev => ({ ...prev, [src.id]: e.target.value }))}
                        style={{
                          width: '100%', padding: '0.45rem 0.65rem', borderRadius: 8,
                          border: '1px solid #e2e8f0', fontSize: '0.78rem',
                          fontFamily: 'Tajawal, sans-serif', background: '#fff', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleApplyProfit(src.id)}
                      disabled={applyingProfit === src.id}
                      className="src-btn"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '0.45rem 0.85rem', borderRadius: 8, border: 'none',
                        background: '#7c5cff', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                        cursor: applyingProfit === src.id ? 'wait' : 'pointer',
                        opacity: applyingProfit === src.id ? 0.7 : 1,
                        fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap',
                      }}
                    >
                      {applyingProfit === src.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                      {applyingProfit === src.id ? t('جاري...') : t('تطبيق')}
                    </button>
                  </div>
                </div>

                {/* Connection error */}
                {src.connectionError && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0.6rem 0.85rem',
                    background: '#fef2f2', borderRadius: 8, marginBottom: result ? 12 : 0, marginTop: 12,
                  }}>
                    <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>{t('خطأ اتصال')}</p>
                      <p style={{ fontSize: '0.7rem', color: '#991b1b', lineHeight: 1.5, wordBreak: 'break-word' }}>{src.connectionError}</p>
                    </div>
                  </div>
                )}

                {/* Result panel */}
                {result && (
                  <div style={{
                    background: result.success ? '#f0fdf4' : '#fef2f2', borderRadius: 10,
                    border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                    overflow: 'hidden', marginTop: 12,
                  }}>
                    <button onClick={() => setExpandedSource(isExpanded ? null : src.id)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Tajawal, sans-serif',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {result.success ? <CheckCircle size={15} color="#16a34a" /> : <AlertCircle size={15} color="#dc2626" />}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: result.success ? '#16a34a' : '#dc2626' }}>
                          {result.type === 'test' ? t('نتيجة الاختبار') : t('نتيجة المزامنة')}: {result.message}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '0 0.85rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
                        {result.balance && (
                          <p style={{ marginBottom: 6 }}>
                            <CreditCard size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: isRTL ? 4 : 0, marginRight: isRTL ? 0 : 4 }} />
                            {t('الرصيد:')} <strong>{result.balance} {result.currency || ''}</strong>
                          </p>
                        )}
                        {result.count !== undefined && (
                          <p style={{ marginBottom: 6 }}>
                            <Package size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: isRTL ? 4 : 0, marginRight: isRTL ? 0 : 4 }} />
                            {t('خدمات مستوردة:')} <strong>{result.count}</strong>
                          </p>
                        )}
                        {result.logs && result.logs.length > 0 && (
                          <div style={{
                            marginTop: 8, background: '#0b1020', borderRadius: 8, padding: '0.75rem',
                            maxHeight: 200, overflow: 'auto', direction: 'ltr',
                          }}>
                            <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>{t('سجل العمليات:')}</p>
                            {result.logs.map((log, li) => (
                              <p key={li} style={{
                                fontSize: '0.68rem', fontFamily: 'monospace, Tajawal',
                                color: log.startsWith('✓') || log.includes('OK') ? '#4ade80' : log.startsWith('✗') || log.includes('FAILED') || log.includes('Error') ? '#f87171' : '#94a3b8',
                                lineHeight: 1.7,
                              }}>{log}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* ═══ Sync Logs ═══ */}
      {activeTab === 'logs' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020' }}>{t('سجل المزامنة الأخيرة')}</h3>
            <button onClick={fetchSources} className="src-btn" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              fontFamily: 'Tajawal, sans-serif', color: '#64748b',
            }}>
              <RefreshCcw size={12} /> {t('تحديث')}
            </button>
          </div>

          {syncLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f5f3ff', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <Clock size={24} color="#7c5cff" />
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0b1020', marginBottom: 4 }}>{t('لا توجد عمليات مزامنة بعد')}</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>{t('ستظهر هنا سجلات المزامنة عند تنفيذ أي عملية مزامنة من تبويب المصادر المتصلة')}</p>
            </div>
          ) : (
            syncLogs.map((log, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.85rem 1.25rem',
                borderBottom: i < syncLogs.length - 1 ? '1px solid #f8fafc' : 'none',
                transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: log.status === 'success' ? '#dcfce7' : '#fee2e2',
                  display: 'grid', placeItems: 'center',
                }}>
                  {log.status === 'success' ? <CheckCircle size={15} color="#16a34a" /> : <AlertCircle size={15} color="#dc2626" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{log.source} — {log.action}</p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.count}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{log.time}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ Modals ═══ */}
      {connectingSource && (
        <ConnectSourceModal
          source={connectingSource}
          onClose={() => setConnectingSource(null)}
          onSuccess={() => { fetchSources(); setActiveTab('connected'); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          sourceName={deleteTarget.name}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {editTarget && (
        <EditSourceModal
          source={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={fetchSources}
        />
      )}
    </>
  );
}
