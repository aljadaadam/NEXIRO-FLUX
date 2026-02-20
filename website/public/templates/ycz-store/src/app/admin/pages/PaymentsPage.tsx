'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { adminApi } from '@/lib/api';

type GatewayType = 'paypal' | 'bank_transfer' | 'usdt' | 'binance' | 'wallet' | 'bankak';

interface Gateway {
  id: number;
  type: GatewayType;
  name: string;
  name_en?: string;
  is_enabled: boolean;
  is_default: boolean;
  config: Record<string, string>;
  display_order: number;
}

interface PaymentTx {
  id: number;
  customer_id: number;
  customer_name?: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  currency: string;
  payment_method: string;
  payment_gateway_id?: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  description?: string;
  external_id?: string;
  meta?: Record<string, string>;
  created_at: string;
}

/* ─── SVG Icons ─── */
const GatewayIcons: Record<GatewayType, ReactNode> = {
  paypal: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.243A.774.774 0 015.71 1.6h6.486c2.156 0 3.65.55 4.44 1.634.37.51.6 1.06.69 1.658.1.617.04 1.353-.17 2.246l-.01.038v.335l.26.148c.22.12.4.264.54.433.24.29.39.646.44 1.058.06.43.02.93-.12 1.49-.16.64-.42 1.2-.77 1.66-.32.42-.72.77-1.19 1.03-.45.26-.98.44-1.56.55-.57.1-1.2.16-1.87.16h-.44c-.32 0-.63.12-.86.32a1.31 1.31 0 00-.43.8l-.03.17-.56 3.56-.03.12c-.01.06-.03.09-.06.12a.16.16 0 01-.1.04H7.076z" fill="#253B80"/>
      <path d="M19.442 5.862c-.01.07-.02.14-.04.21-.79 4.06-3.49 5.46-6.94 5.46h-1.76a.85.85 0 00-.84.72l-.9 5.73-.25 1.62a.45.45 0 00.44.52h3.13c.37 0 .68-.27.74-.63l.03-.16.58-3.7.04-.2c.06-.37.37-.64.74-.64h.47c3.04 0 5.41-1.23 6.11-4.8.29-1.49.14-2.73-.63-3.61a2.98 2.98 0 00-.86-.62z" fill="#179BD7"/>
      <path d="M18.36 5.42a6.22 6.22 0 00-.77-.17 9.83 9.83 0 00-1.56-.11h-4.73a.74.74 0 00-.73.63l-1.01 6.37-.03.18a.85.85 0 01.84-.72h1.76c3.44 0 6.14-1.4 6.93-5.45.02-.12.04-.23.05-.34a4.15 4.15 0 00-.76-.39z" fill="#222D65"/>
    </svg>
  ),
  binance: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L7.5 6.5l2.65 2.65L12 7.3l1.85 1.85L16.5 6.5 12 2zM4.5 9.5L2 12l2.5 2.5L7 12 4.5 9.5zM19.5 9.5L17 12l2.5 2.5L22 12l-2.5-2.5zM12 16.7l-1.85-1.85L7.5 17.5 12 22l4.5-4.5-2.65-2.65L12 16.7zM12 14.35L14.35 12 12 9.65 9.65 12 12 14.35z" fill="#F0B90B"/>
    </svg>
  ),
  usdt: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#26A17B"/>
      <path d="M13.5 10.8v-1.5h3.3V7.2H7.2v2.1h3.3v1.5c-2.79.15-4.9.78-4.9 1.53 0 .75 2.11 1.38 4.9 1.53v4.87h3V13.86c2.79-.15 4.9-.78 4.9-1.53 0-.75-2.11-1.38-4.9-1.53zm-1.5 2.82c-2.94-.13-4.75-.69-4.75-1.29 0-.6 1.81-1.16 4.75-1.29v2.06c.24.02.49.03.75.03s.51-.01.75-.03v-2.06c2.94.13 4.75.69 4.75 1.29 0 .6-1.81 1.16-4.75 1.29z" fill="#fff"/>
    </svg>
  ),
  bank_transfer: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="3" rx="1" fill="#3B82F6"/>
      <path d="M4 7v10h2V7H4zm5 0v10h2V7H9zm5 0v10h2V7h-2zm5 0v10h2V7h-2z" fill="#60A5FA"/>
      <rect x="2" y="17" width="20" height="3" rx="1" fill="#3B82F6"/>
      <path d="M12 2l9 2H3l9-2z" fill="#93C5FD"/>
    </svg>
  ),
  wallet: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="15" rx="3" fill="#8B5CF6"/>
      <rect x="14" y="10" width="8" height="5" rx="1.5" fill="#C4B5FD"/>
      <circle cx="17" cy="12.5" r="1.2" fill="#7C3AED"/>
      <path d="M5 5V4a2 2 0 012-2h8a2 2 0 012 2v1" stroke="#A78BFA" strokeWidth="1.5"/>
    </svg>
  ),
  bankak: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v2h20V7L12 2z" fill="#0891B2"/>
      <rect x="4" y="9" width="2.5" height="8" fill="#06B6D4" rx="0.5"/>
      <rect x="8.5" y="9" width="2.5" height="8" fill="#06B6D4" rx="0.5"/>
      <rect x="13" y="9" width="2.5" height="8" fill="#06B6D4" rx="0.5"/>
      <rect x="17.5" y="9" width="2.5" height="8" fill="#06B6D4" rx="0.5"/>
      <rect x="2" y="17" width="20" height="3" rx="1" fill="#0891B2"/>
      <circle cx="12" cy="5" r="1.2" fill="#fff"/>
    </svg>
  ),
};

const GATEWAY_META: Record<GatewayType, { label: string; labelEn: string; desc: string; color: string; bg: string }> = {
  paypal:        { label: 'PayPal',          labelEn: 'PayPal',        desc: 'بطاقات ائتمان و PayPal',                  color: '#253B80', bg: '#EFF6FF' },
  binance:       { label: 'Binance Pay',     labelEn: 'Binance Pay',   desc: 'دفع عبر العملات الرقمية',                 color: '#B8860B', bg: '#FFFBEB' },
  usdt:          { label: 'USDT',            labelEn: 'USDT Crypto',   desc: 'تيثر على شبكة Tron/ERC20/BEP20',         color: '#166534', bg: '#F0FDF4' },
  bank_transfer: { label: 'التحويل البنكي',  labelEn: 'Bank Transfer', desc: 'تحويل بنكي مباشر',                        color: '#1D4ED8', bg: '#EFF6FF' },
  wallet:        { label: 'محفظة إلكترونية', labelEn: 'E-Wallet',      desc: 'شحن عبر محافظ إلكترونية (تعليمات فقط)',    color: '#6D28D9', bg: '#F5F3FF' },
  bankak:        { label: 'بنكك',            labelEn: 'Bankak',        desc: 'دفع عبر بنكك — تحويل محلي بسعر الصرف',    color: '#0E7490', bg: '#ECFEFF' },
};

const CONFIG_FIELDS: Record<GatewayType, { key: string; label: string; type?: string; placeholder: string; required?: boolean; options?: { value: string; label: string }[] }[]> = {
  paypal: [
    { key: 'client_id', label: 'Client ID', placeholder: 'AX...', required: true },
    { key: 'secret', label: 'Secret', type: 'password', placeholder: 'EL...', required: true },
    { key: 'email', label: 'بريد PayPal', placeholder: 'email@example.com', required: true },
    { key: 'mode', label: 'الوضع', placeholder: 'sandbox', required: true, options: [{ value: 'sandbox', label: 'Sandbox (تجريبي)' }, { value: 'live', label: 'Live (حقيقي)' }] },
  ],
  binance: [
    { key: 'api_key', label: 'API Key', placeholder: 'مفتاح الـ API', required: true },
    { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'السر', required: true },
    { key: 'binance_id', label: 'Binance ID', placeholder: 'رقم حساب Binance', required: true },
    { key: 'binance_email', label: 'البريد (اختياري)', placeholder: 'binance@email.com' },
  ],
  usdt: [
    { key: 'wallet_address', label: 'عنوان المحفظة', placeholder: 'T...', required: true },
    { key: 'network', label: 'الشبكة', placeholder: 'TRC20', required: true, options: [{ value: 'TRC20', label: 'TRC20 (Tron)' }, { value: 'ERC20', label: 'ERC20 (Ethereum)' }, { value: 'BEP20', label: 'BEP20 (BSC)' }] },
    { key: 'api_key', label: 'مفتاح API (اختياري)', placeholder: 'مفتاح BscScan / Etherscan / TronGrid', type: 'password' },
  ],
  bank_transfer: [
    { key: 'bank_name', label: 'اسم البنك', placeholder: 'مثال: البنك المركزي', required: true },
    { key: 'account_holder', label: 'اسم صاحب الحساب', placeholder: 'الاسم الكامل', required: true },
    { key: 'iban', label: 'IBAN / رقم الحساب', placeholder: 'IQ...', required: true },
    { key: 'currency', label: 'عملة الحساب', placeholder: 'USD', required: true, options: [{ value: 'USD', label: 'USD ($)' }, { value: 'IQD', label: 'IQD (د.ع)' }, { value: 'SAR', label: 'SAR (ر.س)' }, { value: 'EUR', label: 'EUR (€)' }] },
  ],
  wallet: [
    { key: 'instructions', label: 'تعليمات الشحن', placeholder: 'اكتب تعليمات الشحن عبر هذه المحفظة...', required: true, type: 'textarea' },
    { key: 'contact_numbers', label: 'أرقام التواصل للشحن', placeholder: 'مثال: 07701234567' },
    { key: 'image_url', label: 'رابط صورة/لوغو المحفظة', placeholder: 'https://example.com/logo.png' },
  ],
  bankak: [
    { key: 'account_number', label: 'رقم الحساب', placeholder: 'أدخل رقم الحساب البنكي', required: true },
    { key: 'full_name', label: 'الاسم الكامل (صاحب الحساب)', placeholder: 'مثال: أحمد محمد علي', required: true },
    { key: 'exchange_rate', label: 'سعر الصرف (1 دولار = ؟ جنيه سوداني)', placeholder: 'مثال: 600', required: true },
    { key: 'local_currency', label: 'رمز العملة المحلية', placeholder: 'SDG', required: true, options: [{ value: 'SDG', label: 'SDG (ج.س)' }] },
    { key: 'image_url', label: 'رابط صورة/لوغو بنكك', placeholder: 'https://example.com/bankak-logo.png' },
  ],
};

const ALL_TYPES: GatewayType[] = ['paypal', 'binance', 'usdt', 'bank_transfer', 'wallet', 'bankak'];

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGw, setEditingGw] = useState<Gateway | null>(null);
  const [formType, setFormType] = useState<GatewayType>('paypal');
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formConfig, setFormConfig] = useState<Record<string, string>>({});
  const [formDefault, setFormDefault] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Transaction log state
  const [transactions, setTransactions] = useState<PaymentTx[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [txPage, setTxPage] = useState(1);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [receiptModal, setReceiptModal] = useState<PaymentTx | null>(null);
  const [txStats, setTxStats] = useState<{ totalRevenue: number; todayRevenue: number; totalDeposits: number } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGateways = useCallback(async () => {
    try {
      const res = await adminApi.getPaymentGateways();
      setGateways(res.gateways || []);
    } catch (err) {
      console.error(err);
      showToast('فشل في جلب بوابات الدفع', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);

  const fetchTransactions = useCallback(async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        adminApi.getPayments(1, 100),
        adminApi.getPaymentStats(),
      ]);
      setTransactions(txRes.payments || []);
      setTxStats(statsRes.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleApprove = async (tx: PaymentTx) => {
    setApprovingId(tx.id);
    try {
      await adminApi.updatePaymentStatus(tx.id, 'completed');
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t));
      showToast(`تمت الموافقة على الدفعة #${tx.id} وتم إضافة الرصيد`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast('فشل في الموافقة على الدفعة', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (tx: PaymentTx) => {
    setApprovingId(tx.id);
    try {
      await adminApi.updatePaymentStatus(tx.id, 'failed');
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'failed' } : t));
      showToast('تم رفض الدفعة');
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast('فشل في رفض الدفعة', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const openConfigModal = (type: GatewayType, gw?: Gateway) => {
    if (gw) {
      setEditingGw(gw);
      setFormType(gw.type);
      setFormName(gw.name);
      setFormNameEn(gw.name_en || '');
      setFormConfig(gw.config || {});
      setFormDefault(gw.is_default);
    } else {
      setEditingGw(null);
      setFormType(type);
      setFormName(GATEWAY_META[type].label);
      setFormNameEn(GATEWAY_META[type].labelEn);
      setFormConfig({});
      setFormDefault(false);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { showToast('اسم البوابة مطلوب', 'error'); return; }
    setSaving(true);
    try {
      const data = {
        type: formType,
        name: formName.trim(),
        name_en: formNameEn.trim() || undefined,
        config: formConfig,
        is_default: formDefault,
      };
      if (editingGw) {
        await adminApi.updatePaymentGateway(editingGw.id, data);
        showToast('تم تحديث البوابة بنجاح');
      } else {
        await adminApi.createPaymentGateway(data);
        showToast('تم إضافة البوابة بنجاح');
      }
      setShowModal(false);
      fetchGateways();
    } catch (err) {
      console.error(err);
      showToast('فشل في حفظ البوابة', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (gw: Gateway) => {
    if (!gw.is_enabled) {
      const requiredFields = (CONFIG_FIELDS[gw.type] || []).filter(f => f.required);
      const missing = requiredFields.filter(f => !gw.config?.[f.key]?.trim());
      if (missing.length > 0) {
        showToast(`أكمل الحقول المطلوبة أولاً: ${missing.map(f => f.label).join('، ')}`, 'error');
        return;
      }
    }
    try {
      const res = await adminApi.togglePaymentGateway(gw.id);
      if (res.error) { showToast(res.error, 'error'); return; }
      setGateways(prev => prev.map(g => g.id === gw.id ? { ...g, is_enabled: !g.is_enabled } : g));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل في تبديل الحالة';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deletePaymentGateway(id);
      setGateways(prev => prev.filter(g => g.id !== id));
      setDeleteConfirm(null);
      showToast('تم حذف البوابة');
    } catch (err) {
      console.error(err);
      showToast('فشل في حذف البوابة', 'error');
    }
  };

  // Group gateways by type
  const gwByType = new Map<GatewayType, Gateway>();
  gateways.forEach(gw => gwByType.set(gw.type, gw));

  const activeCount = gateways.filter(g => g.is_enabled).length;
  const fields = CONFIG_FIELDS[formType] || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#7c5cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c5cff, #a78bfa)', display: 'grid', placeItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" fill="#fff"/>
                <rect x="2" y="8" width="20" height="3" fill="#e2e8f0"/>
                <circle cx="6" cy="15" r="1.5" fill="#7c5cff"/>
              </svg>
            </div>
            بوابات الدفع
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.35rem 0.75rem', borderRadius: 8, background: activeCount > 0 ? '#dcfce7' : '#fef2f2', color: activeCount > 0 ? '#16a34a' : '#dc2626' }}>
              {activeCount > 0 ? `${activeCount} مفعّلة` : 'لا يوجد مفعّلة'}
            </span>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>اختر وفعّل بوابات الدفع التي تريد تقديمها لعملائك</p>
      </div>

      {/* Gateway Cards Grid — Always Show All Types */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {ALL_TYPES.map(type => {
          const meta = GATEWAY_META[type];
          const gw = gwByType.get(type);
          const isConfigured = !!gw;
          const isEnabled = gw?.is_enabled ?? false;

          return (
            <div key={type} style={{
              background: '#fff',
              borderRadius: 16,
              border: isEnabled ? `2px solid ${meta.color}22` : '1px solid #f1f5f9',
              boxShadow: isEnabled ? `0 4px 16px ${meta.color}10` : '0 1px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}>
              {/* Card Header */}
              <div style={{
                padding: '1.25rem 1.25rem 0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: meta.bg,
                    display: 'grid', placeItems: 'center',
                    boxShadow: `0 2px 8px ${meta.color}15`,
                  }}>
                    {GatewayIcons[type]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>
                        {gw?.name || meta.label}
                      </h4>
                      {gw?.is_default && (
                        <span style={{
                          fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: 4,
                          background: '#dbeafe', color: '#2563eb', fontWeight: 700, letterSpacing: '0.02em',
                        }}>افتراضي</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 2 }}>{meta.desc}</p>
                  </div>
                </div>

                {/* Toggle or Status Badge */}
                {isConfigured ? (
                  <button onClick={() => handleToggle(gw!)} style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none',
                    background: isEnabled ? '#22c55e' : '#e2e8f0',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.25s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, transition: 'all 0.25s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      ...(isEnabled ? { left: 3 } : { right: 3 }),
                    }} />
                  </button>
                ) : (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '0.25rem 0.6rem',
                    borderRadius: 6, background: '#f8fafc', color: '#94a3b8',
                    border: '1px solid #f1f5f9',
                  }}>غير مُهيأة</span>
                )}
              </div>

              {/* Config Details (if configured) */}
              {isConfigured && (
                <div style={{ padding: '0 1.25rem' }}>
                  {/* Missing Fields Warning */}
                  {(() => {
                    const requiredFields = (CONFIG_FIELDS[type] || []).filter(f => f.required);
                    const missing = requiredFields.filter(f => !gw?.config?.[f.key]?.trim());
                    if (missing.length > 0) {
                      return (
                        <div style={{
                          padding: '0.45rem 0.75rem', background: '#fef2f2', border: '1px solid #fecaca',
                          borderRadius: 8, marginBottom: 8, fontSize: '0.73rem', color: '#b91c1c', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M12 2L2 20h20L12 2z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          حقول ناقصة: {missing.map(f => f.label).join('، ')}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {/* Type-specific preview */}
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.6rem 0.75rem', marginBottom: 8 }}>
                    {type === 'paypal' && (
                      <>
                        {gw?.config?.email && <ConfigRow label="البريد" value={gw.config.email} />}
                        {gw?.config?.mode && <ConfigRow label="الوضع" value={gw.config.mode === 'live' ? '● حقيقي' : '● تجريبي'} valueColor={gw.config.mode === 'live' ? '#16a34a' : '#d97706'} />}
                      </>
                    )}
                    {type === 'binance' && gw?.config?.binance_id && <ConfigRow label="Binance ID" value={gw.config.binance_id} />}
                    {type === 'usdt' && (
                      <>
                        {gw?.config?.network && <ConfigRow label="الشبكة" value={gw.config.network} />}
                        {gw?.config?.wallet_address && <ConfigRow label="المحفظة" value={maskString(gw.config.wallet_address)} />}
                      </>
                    )}
                    {type === 'bank_transfer' && (
                      <>
                        {gw?.config?.bank_name && <ConfigRow label="البنك" value={gw.config.bank_name} />}
                        {gw?.config?.iban && <ConfigRow label="IBAN" value={maskString(gw.config.iban)} />}
                      </>
                    )}
                    {type === 'wallet' && (
                      <>
                        {gw?.config?.instructions && <ConfigRow label="التعليمات" value={gw.config.instructions.length > 35 ? gw.config.instructions.slice(0, 35) + '...' : gw.config.instructions} />}
                        {gw?.config?.contact_numbers && <ConfigRow label="التواصل" value={gw.config.contact_numbers} />}
                        {gw?.config?.image_url && <ImgPreview src={gw.config.image_url} />}
                      </>
                    )}
                    {type === 'bankak' && (
                      <>
                        {gw?.config?.full_name && <ConfigRow label="صاحب الحساب" value={gw.config.full_name} />}
                        {gw?.config?.account_number && <ConfigRow label="رقم الحساب" value={maskString(gw.config.account_number)} />}
                        {gw?.config?.exchange_rate && <ConfigRow label="سعر الصرف" value={`1$ = ${gw.config.exchange_rate} ${gw.config.local_currency || 'SDG'}`} />}
                        {gw?.config?.image_url && <ImgPreview src={gw.config.image_url} />}
                      </>
                    )}
                    {/* Fallback if no details to show */}
                    {!gw?.config || Object.keys(gw.config).length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.25rem 0' }}>لم يتم إدخال بيانات بعد</p>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid #f8fafc',
                display: 'flex', gap: 8,
              }}>
                {isConfigured ? (
                  <>
                    <button onClick={() => openConfigModal(type, gw)} style={{
                      flex: 1, padding: '0.55rem', borderRadius: 10,
                      border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                      color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      transition: 'all 0.15s',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      تعديل
                    </button>
                    <button onClick={() => setDeleteConfirm(gw!.id)} style={{
                      padding: '0.55rem 0.75rem', borderRadius: 10,
                      border: '1px solid #fecaca', background: '#fff', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                      color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </>
                ) : (
                  <button onClick={() => openConfigModal(type)} style={{
                    flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                    fontFamily: 'Tajawal, sans-serif', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    إعداد البوابة
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* ═══════════════ Transaction Log ═══════════════ */}
      <div style={{ marginTop: 36 }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'grid', placeItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 14l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              سجل عمليات الدفع
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>جميع عمليات الشحن والدفع — يمكنك الموافقة على المعلقة</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {([['all', 'الكل'], ['pending', 'معلّقة'], ['completed', 'مكتملة'], ['failed', 'مرفوضة']] as const).map(([key, label]) => {
            const count = key === 'all' ? transactions.length : transactions.filter(t => t.status === key).length;
            const isActive = txFilter === key;
            return (
              <button key={key} onClick={() => { setTxFilter(key); setTxPage(1); }} style={{
                padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none',
                background: isActive ? (key === 'pending' ? '#fef3c7' : key === 'completed' ? '#dcfce7' : key === 'failed' ? '#fee2e2' : '#f1f5f9') : '#fff',
                color: isActive ? (key === 'pending' ? '#92400e' : key === 'completed' ? '#166534' : key === 'failed' ? '#b91c1c' : '#334155') : '#94a3b8',
                fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}>
                {label} {count > 0 && <span style={{ marginRight: 4, opacity: 0.7 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Transactions Table */}
        {txLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (() => {
          const filtered = txFilter === 'all' ? transactions : transactions.filter(t => t.status === txFilter);
          const perPage = 10;
          const totalPages = Math.ceil(filtered.length / perPage);
          const paginated = filtered.slice((txPage - 1) * perPage, txPage * perPage);

          if (filtered.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: 14 }}>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>لا توجد عمليات دفع {txFilter !== 'all' ? 'بهذا التصنيف' : 'بعد'}</p>
              </div>
            );
          }

          return (
            <>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.7fr 0.8fr 0.8fr 1fr',
                  padding: '0.65rem 1rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                }}>
                  <span>#</span>
                  <span>العميل</span>
                  <span>المبلغ</span>
                  <span>البوابة</span>
                  <span>الحالة</span>
                  <span>الإجراء</span>
                </div>

                {/* Rows */}
                {paginated.map(tx => {
                  const isPending = tx.status === 'pending';
                  const hasReceipt = !!tx.meta?.receipt_url;
                  const methodLabel = GATEWAY_META[tx.payment_method as GatewayType]?.label || tx.payment_method;
                  const methodColor = GATEWAY_META[tx.payment_method as GatewayType]?.color || '#64748b';
                  const statusConfig = {
                    pending: { label: 'معلّقة', bg: '#fef3c7', color: '#92400e', icon: '⏳' },
                    completed: { label: 'مكتملة', bg: '#dcfce7', color: '#166534', icon: '✅' },
                    failed: { label: 'مرفوضة', bg: '#fee2e2', color: '#b91c1c', icon: '❌' },
                    refunded: { label: 'مستردة', bg: '#e0e7ff', color: '#4338ca', icon: '↩️' },
                    cancelled: { label: 'ملغاة', bg: '#f1f5f9', color: '#64748b', icon: '🚫' },
                  }[tx.status] || { label: tx.status, bg: '#f1f5f9', color: '#64748b', icon: '•' };

                  return (
                    <div key={tx.id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.7fr 0.8fr 0.8fr 1fr',
                      padding: '0.7rem 1rem', borderBottom: '1px solid #f8fafc',
                      alignItems: 'center', fontSize: '0.8rem',
                      background: isPending ? '#fffbeb05' : 'transparent',
                    }}>
                      {/* ID + Date */}
                      <div>
                        <span style={{ fontWeight: 700, color: '#0b1020' }}>#{tx.id}</span>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                          {new Date(tx.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                          {' '}
                          {new Date(tx.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Customer */}
                      <div>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{tx.customer_name || `عميل #${tx.customer_id}`}</span>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 1 }}>
                          {tx.type === 'deposit' ? 'شحن رصيد' : tx.type === 'purchase' ? 'شراء' : 'استرداد'}
                        </p>
                      </div>

                      {/* Amount */}
                      <span style={{ fontWeight: 700, color: tx.type === 'refund' ? '#dc2626' : '#059669', direction: 'ltr' as const }}>
                        {tx.type === 'refund' ? '-' : '+'}${tx.amount}
                      </span>

                      {/* Gateway */}
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600, color: methodColor,
                        background: `${methodColor}10`, padding: '0.2rem 0.5rem', borderRadius: 6,
                        display: 'inline-block', width: 'fit-content',
                      }}>
                        {methodLabel}
                      </span>

                      {/* Status */}
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6,
                        background: statusConfig.bg, color: statusConfig.color,
                        display: 'inline-flex', alignItems: 'center', gap: 3, width: 'fit-content',
                      }}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {hasReceipt && (
                          <button onClick={() => setReceiptModal(tx)} style={{
                            padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0',
                            background: '#fff', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
                            fontFamily: 'Tajawal, sans-serif', color: '#2563eb',
                          }}>🧾 إيصال</button>
                        )}
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(tx)}
                              disabled={approvingId === tx.id}
                              style={{
                                padding: '0.3rem 0.55rem', borderRadius: 6, border: 'none',
                                background: '#059669', cursor: approvingId === tx.id ? 'not-allowed' : 'pointer',
                                fontSize: '0.68rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif',
                                color: '#fff', opacity: approvingId === tx.id ? 0.6 : 1,
                              }}
                            >{approvingId === tx.id ? '...' : '✓ موافقة'}</button>
                            <button
                              onClick={() => handleReject(tx)}
                              disabled={approvingId === tx.id}
                              style={{
                                padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid #fecaca',
                                background: '#fff', cursor: approvingId === tx.id ? 'not-allowed' : 'pointer',
                                fontSize: '0.68rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                                color: '#dc2626', opacity: approvingId === tx.id ? 0.6 : 1,
                              }}
                            >✗ رفض</button>
                          </>
                        )}
                        {!isPending && !hasReceipt && (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                  <button disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)} style={{
                    padding: '0.35rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: txPage <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', color: '#64748b', opacity: txPage <= 1 ? 0.4 : 1,
                  }}>← السابق</button>
                  <span style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#64748b' }}>{txPage} / {totalPages}</span>
                  <button disabled={txPage >= totalPages} onClick={() => setTxPage(p => p + 1)} style={{
                    padding: '0.35rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: txPage >= totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', color: '#64748b', opacity: txPage >= totalPages ? 0.4 : 1,
                  }}>التالي →</button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Receipt Preview Modal */}
      {receiptModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setReceiptModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, padding: '1.5rem', width: '92%', maxWidth: 480,
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>🧾 إيصال الدفع — #{receiptModal.id}</h3>
              <button onClick={() => setReceiptModal(null)} style={{ background: '#f1f5f9', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', display: 'grid', placeItems: 'center' }}>✕</button>
            </div>

            {/* Payment Info */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>العميل</span>
                <span style={{ fontWeight: 600, color: '#0b1020' }}>{receiptModal.customer_name || `#${receiptModal.customer_id}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>المبلغ</span>
                <span style={{ fontWeight: 700, color: '#059669', direction: 'ltr' as const }}>${receiptModal.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>البوابة</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{GATEWAY_META[receiptModal.payment_method as GatewayType]?.label || receiptModal.payment_method}</span>
              </div>
              {receiptModal.meta?.receipt_uploaded_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>تاريخ الرفع</span>
                  <span style={{ fontWeight: 500, color: '#334155', fontSize: '0.78rem' }}>{new Date(receiptModal.meta.receipt_uploaded_at).toLocaleString('ar-SA')}</span>
                </div>
              )}
            </div>

            {/* Receipt Image */}
            {receiptModal.meta?.receipt_url && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img
                  src={receiptModal.meta.receipt_url}
                  alt="إيصال الدفع"
                  style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, border: '1px solid #e2e8f0' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Receipt Notes */}
            {receiptModal.meta?.receipt_notes && (
              <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400e' }}>ملاحظات العميل:</p>
                <p style={{ fontSize: '0.82rem', color: '#78350f', marginTop: 4 }}>{receiptModal.meta.receipt_notes}</p>
              </div>
            )}

            {/* Actions */}
            {receiptModal.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { handleReject(receiptModal); setReceiptModal(null); }} style={{
                  flex: 1, padding: '0.65rem', borderRadius: 10, border: '1px solid #fecaca',
                  background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: 'Tajawal, sans-serif', color: '#dc2626',
                }}>✗ رفض</button>
                <button onClick={() => { handleApprove(receiptModal); setReceiptModal(null); }} style={{
                  flex: 2, padding: '0.65rem', borderRadius: 10, border: 'none',
                  background: '#059669', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                  fontFamily: 'Tajawal, sans-serif', color: '#fff',
                }}>✓ موافقة وإضافة الرصيد</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, padding: '2rem', width: '92%', maxWidth: 520,
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)', maxHeight: '88vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: GATEWAY_META[formType].bg,
                  display: 'grid', placeItems: 'center',
                }}>
                  {GatewayIcons[formType]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020' }}>
                    {editingGw ? `تعديل ${GATEWAY_META[formType].label}` : `إعداد ${GATEWAY_META[formType].label}`}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{GATEWAY_META[formType].desc}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8,
                cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '1rem',
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>الاسم (عربي)</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="اسم البوابة" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>الاسم (إنجليزي)</label>
                  <input value={formNameEn} onChange={e => setFormNameEn(e.target.value)} placeholder="Gateway Name" style={inputStyle} />
                </div>
              </div>

              {/* Config Fields */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#475569" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#475569" strokeWidth="2"/></svg>
                  إعدادات {GATEWAY_META[formType].label}
                </label>
                <div style={{ padding: '1rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fields.map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        {field.label}
                        {field.required && <span style={{ color: '#dc2626', marginRight: 2 }}> *</span>}
                      </label>
                      {field.options ? (
                        <select
                          value={formConfig[field.key] || field.options[0]?.value || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          style={inputStyle}
                        >
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formConfig[field.key] || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          rows={4}
                          style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={formConfig[field.key] || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={inputStyle}
                        />
                      )}
                      {field.key === 'image_url' && formConfig.image_url && (
                        <div style={{ marginTop: 8, textAlign: 'center' }}>
                          <img src={formConfig.image_url} alt="معاينة" style={{ maxWidth: 120, maxHeight: 60, borderRadius: 8, border: '1px solid #e2e8f0' }} onError={e => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10 }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0b1020' }}>بوابة افتراضية</p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ستكون الأولى في قائمة الدفع</p>
                </div>
                <button onClick={() => setFormDefault(!formDefault)} style={{
                  width: 42, height: 24, borderRadius: 12, border: 'none',
                  background: formDefault ? '#7c5cff' : '#e2e8f0',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', ...(formDefault ? { left: 3 } : { right: 3 }) }} />
                </button>
              </div>

              {/* Save Button */}
              <button onClick={handleSave} disabled={saving} style={{
                padding: '0.75rem', borderRadius: 10,
                background: saving ? '#94a3b8' : `linear-gradient(135deg, ${GATEWAY_META[formType].color}, ${GATEWAY_META[formType].color}dd)`,
                color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {saving ? '⏳ جاري الحفظ...' : editingGw ? '💾 حفظ التعديلات' : '💾 إضافة البوابة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M12 2L2 20h20L12 2z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>حذف بوابة الدفع؟</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>هذا الإجراء لا يمكن التراجع عنه</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', background: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', color: '#fff' }}>نعم، احذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000, padding: '0.7rem 1.5rem', borderRadius: 12,
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </>
  );
}

/* ─── Helpers ─── */

function ConfigRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', fontSize: '0.78rem' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor || '#334155', direction: 'ltr' }}>{value}</span>
    </div>
  );
}

function ImgPreview({ src }: { src: string }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 6 }}>
      <img src={src} alt="" style={{ maxWidth: 80, maxHeight: 40, borderRadius: 6, border: '1px solid #e2e8f0' }} onError={e => (e.currentTarget.style.display = 'none')} />
    </div>
  );
}

function maskString(str: string): string {
  if (str.length <= 8) return str;
  return str.slice(0, 4) + '••••' + str.slice(-4);
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 1rem', borderRadius: 10,
  border: '1px solid #e2e8f0', fontSize: '0.85rem',
  fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
  background: '#fff',
};
