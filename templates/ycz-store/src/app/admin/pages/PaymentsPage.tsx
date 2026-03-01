'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { adminApi } from '@/lib/api';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

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
  invoice_number?: string;
  customer_id: number;
  customer_name?: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  currency: string;
  payment_method: string;
  payment_gateway_id?: number;
  status: 'pending' | 'awaiting_receipt' | 'completed' | 'failed' | 'refunded' | 'cancelled';
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
  bank_transfer: { label: 'التحويل البنكي',  labelEn: 'Bank Transfer', desc: 'عرض بيانات بنكية فقط (بدون رفع إيصال)', color: '#1D4ED8', bg: '#EFF6FF' },
  wallet:        { label: 'محفظة إلكترونية', labelEn: 'E-Wallet',      desc: 'شحن عبر محافظ إلكترونية (تعليمات فقط)',    color: '#6D28D9', bg: '#F5F3FF' },
  bankak:        { label: 'بنكك',            labelEn: 'Bankak',        desc: 'دفع عبر بنكك — رفع إشعار + تأكيد أدمن',   color: '#0E7490', bg: '#ECFEFF' },
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
    { key: 'account_number', label: 'رقم الحساب', placeholder: 'أدخل رقم الحساب', required: true },
    { key: 'full_name', label: 'الاسم', placeholder: 'اسم صاحب الحساب', required: true },
    { key: 'exchange_rate', label: 'سعر الصرف', placeholder: 'مثال: 600', required: true },
    { key: 'receipt_note', label: 'التعليق المطلوب في الإشعار', placeholder: 'مثال: اكتب اسمك ورقم هاتفك في الإشعار', required: true },
  ],
};

const ALL_TYPES: GatewayType[] = ['paypal', 'binance', 'usdt', 'bank_transfer', 'wallet', 'bankak'];

export default function PaymentsPage({ isActive }: { isActive?: boolean } = {}) {
  const { t, isRTL } = useAdminLang();
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
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'awaiting_receipt' | 'completed' | 'failed'>('all');
  const [txPage, setTxPage] = useState(1);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [receiptModal, setReceiptModal] = useState<PaymentTx | null>(null);
  const [txStats, setTxStats] = useState<{ totalRevenue: number; todayRevenue: number; totalDeposits: number } | null>(null);
  const [txSearch, setTxSearch] = useState('');

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
      showToast(t('فشل في جلب بوابات الدفع'), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isActive) fetchGateways(); }, [isActive, fetchGateways]);

  const fetchTransactions = useCallback(async (search?: string) => {
    try {
      const [txRes, statsRes] = await Promise.all([
        adminApi.getPayments(1, 200, undefined, search),
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

  useEffect(() => { if (isActive) fetchTransactions(); }, [isActive, fetchTransactions]);

  const handleApprove = async (tx: PaymentTx) => {
    setApprovingId(tx.id);
    try {
      await adminApi.updatePaymentStatus(tx.id, 'completed');
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t));
      showToast(isRTL ? `تمت الموافقة على الدفعة #${tx.id} وتم إضافة الرصيد` : `Payment #${tx.id} approved and balance added`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast(t('فشل في الموافقة على الدفعة'), 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (tx: PaymentTx) => {
    setApprovingId(tx.id);
    try {
      await adminApi.updatePaymentStatus(tx.id, 'failed');
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'failed' } : t));
      showToast(t('تم رفض الدفعة'));
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast(t('فشل في رفض الدفعة'), 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const openConfigModal = (type: GatewayType, gw?: Gateway) => {
    if (gw) {
      setEditingGw(gw);
      setFormType(gw.type);
      // بنكك: الاسم ثابت لا يتغير
      setFormName(gw.type === 'bankak' ? 'بنكك' : gw.name);
      setFormNameEn(gw.type === 'bankak' ? 'Bankak' : (gw.name_en || ''));
      setFormConfig(gw.config || {});
      setFormDefault(gw.is_default);
    } else {
      setEditingGw(null);
      setFormType(type);
      setFormName(type === 'bankak' ? 'بنكك' : GATEWAY_META[type].label);
      setFormNameEn(type === 'bankak' ? 'Bankak' : GATEWAY_META[type].labelEn);
      setFormConfig({});
      setFormDefault(false);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { showToast(t('اسم البوابة مطلوب'), 'error'); return; }
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
        showToast(t('تم تحديث البوابة بنجاح'));
      } else {
        await adminApi.createPaymentGateway(data);
        showToast(t('تم إضافة البوابة بنجاح'));
      }
      setShowModal(false);
      fetchGateways();
    } catch (err) {
      console.error(err);
      showToast(t('فشل في حفظ البوابة'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (gw: Gateway) => {
    if (!gw.is_enabled) {
      const requiredFields = (CONFIG_FIELDS[gw.type] || []).filter(f => f.required);
      const missing = requiredFields.filter(f => !gw.config?.[f.key]?.trim());
      if (missing.length > 0) {
        showToast(isRTL ? `أكمل الحقول المطلوبة أولاً: ${missing.map(f => f.label).join('، ')}` : `Complete required fields first: ${missing.map(f => f.label).join(', ')}`, 'error');
        return;
      }
    }
    try {
      const res = await adminApi.togglePaymentGateway(gw.id);
      if (res.error) { showToast(res.error, 'error'); return; }
      setGateways(prev => prev.map(g => g.id === gw.id ? { ...g, is_enabled: !g.is_enabled } : g));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل في تبديل الحالة');
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deletePaymentGateway(id);
      setGateways(prev => prev.filter(g => g.id !== id));
      setDeleteConfirm(null);
      showToast(t('تم حذف البوابة'));
    } catch (err) {
      console.error(err);
      showToast(t('فشل في حذف البوابة'), 'error');
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
            {t('بوابات الدفع')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.35rem 0.75rem', borderRadius: 8, background: activeCount > 0 ? '#dcfce7' : '#fef2f2', color: activeCount > 0 ? '#16a34a' : '#dc2626' }}>
              {activeCount > 0 ? (isRTL ? `${activeCount} مفعّلة` : `${activeCount} active`) : t('لا يوجد مفعّلة')}
            </span>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('اختر وفعّل بوابات الدفع التي تريد تقديمها لعملائك')}</p>
      </div>

      {/* Gateway Cards — Vertical List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_TYPES.map(type => {
          const meta = GATEWAY_META[type];
          const gw = gwByType.get(type);
          const isConfigured = !!gw;
          const isEnabled = gw?.is_enabled ?? false;
          const requiredFields = (CONFIG_FIELDS[type] || []).filter(f => f.required);
          const missingFields = isConfigured ? requiredFields.filter(f => !gw?.config?.[f.key]?.trim()) : [];

          return (
            <div key={type} className="gw-card" style={{
              background: '#fff',
              borderRadius: 14,
              border: `1px solid ${isEnabled ? meta.color + '30' : '#e2e8f0'}`,
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
              boxShadow: isEnabled ? `0 2px 12px ${meta.color}12` : '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              {/* ── Main Row: Icon + Name + Details + Actions + Toggle ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '0.9rem 1.15rem',
              }}>
                {/* Colored side accent */}
                <div style={{
                  width: 4, alignSelf: 'stretch', borderRadius: 4,
                  background: isEnabled ? meta.color : '#e2e8f0',
                  transition: 'background 0.3s',
                  flexShrink: 0,
                }} />

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: isEnabled ? `linear-gradient(135deg, ${meta.bg}, ${meta.color}12)` : meta.bg,
                  display: 'grid', placeItems: 'center',
                  transition: 'all 0.3s',
                }}>
                  {GatewayIcons[type]}
                </div>

                {/* Name + Description */}
                <div style={{ minWidth: 0, flex: '0 0 160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', whiteSpace: 'nowrap' }}>
                      {isRTL ? (gw?.name || meta.label) : (gw?.name_en || meta.labelEn)}
                    </h4>
                    {gw?.is_default && (
                      <span style={{
                        fontSize: '0.58rem', padding: '0.1rem 0.4rem', borderRadius: 4,
                        background: '#dbeafe', color: '#2563eb', fontWeight: 700,
                      }}>{t('افتراضي')}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(meta.desc)}</p>
                </div>

                {/* Inline Config Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {isConfigured && missingFields.length > 0 && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, color: '#b91c1c',
                      background: '#fef2f2', border: '1px solid #fecaca',
                      padding: '0.2rem 0.55rem', borderRadius: 6,
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M12 2L2 20h20L12 2z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {isRTL ? `${missingFields.length} حقول ناقصة` : `${missingFields.length} missing`}
                    </span>
                  )}
                  {isConfigured && missingFields.length === 0 && (
                    <>
                      {type === 'paypal' && (
                        <>
                          {gw?.config?.email && <InlineChip label={t("البريد")} value={gw.config.email} />}
                          {gw?.config?.mode && <InlineChip label={t("الوضع")} value={gw.config.mode === 'live' ? t('حقيقي') : t('تجريبي')} dotColor={gw.config.mode === 'live' ? '#16a34a' : '#d97706'} />}
                        </>
                      )}
                      {type === 'binance' && gw?.config?.binance_id && <InlineChip label="ID" value={gw.config.binance_id} />}
                      {type === 'usdt' && (
                        <>
                          {gw?.config?.network && <InlineChip label={t("الشبكة")} value={gw.config.network} />}
                          {gw?.config?.wallet_address && <InlineChip label={t("المحفظة")} value={maskString(gw.config.wallet_address)} />}
                        </>
                      )}
                      {type === 'bank_transfer' && (
                        <>
                          {gw?.config?.bank_name && <InlineChip label={t("البنك")} value={gw.config.bank_name} />}
                          {gw?.config?.iban && <InlineChip label="IBAN" value={maskString(gw.config.iban)} />}
                        </>
                      )}
                      {type === 'wallet' && (
                        <>
                          {gw?.config?.instructions && <InlineChip label={t("التعليمات")} value={gw.config.instructions.length > 25 ? gw.config.instructions.slice(0, 25) + '…' : gw.config.instructions} />}
                          {gw?.config?.contact_numbers && <InlineChip label={t("التواصل")} value={gw.config.contact_numbers} />}
                        </>
                      )}
                      {type === 'bankak' && (
                        <>
                          {gw?.config?.full_name && <InlineChip label={t("الحساب")} value={gw.config.full_name} />}
                          {gw?.config?.exchange_rate && <InlineChip label={t("الصرف")} value={`1$ = ${gw.config.exchange_rate}`} />}
                        </>
                      )}
                      {(!gw?.config || Object.keys(gw.config).length === 0) && (
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontStyle: 'italic' }}>{t('لم يتم إدخال بيانات بعد')}</span>
                      )}
                    </>
                  )}
                  {!isConfigured && (
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontStyle: 'italic' }}>{t('غير مُهيأة — اضغط إعداد')}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {isConfigured ? (
                    <>
                      <button onClick={() => openConfigModal(type, gw)} title={t('تعديل')} style={{
                        width: 34, height: 34, borderRadius: 9, border: '1px solid #e2e8f0',
                        background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                        transition: 'all 0.15s', color: '#3b82f6',
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(gw!.id)} title={t('حذف')} style={{
                        width: 34, height: 34, borderRadius: 9, border: '1px solid #fecaca',
                        background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                        transition: 'all 0.15s', color: '#dc2626',
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </>
                  ) : (
                    <button onClick={() => openConfigModal(type)} style={{
                      padding: '0.45rem 0.9rem', borderRadius: 9, border: 'none',
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                      cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700,
                      fontFamily: 'Tajawal, sans-serif', color: '#fff',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'all 0.15s', whiteSpace: 'nowrap',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      {t('إعداد')}
                    </button>
                  )}
                </div>

                {/* Separator before toggle */}
                <div style={{ width: 1, height: 32, background: '#f1f5f9', flexShrink: 0 }} />

                {/* Toggle ON/OFF */}
                {isConfigured ? (
                  <button onClick={() => handleToggle(gw!)} style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none',
                    background: isEnabled ? '#22c55e' : '#e2e8f0',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                    flexShrink: 0, boxShadow: isEnabled ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      ...(isEnabled ? { [isRTL ? 'right' : 'left']: 3 } : { [isRTL ? 'left' : 'right']: 3 }),
                    }} />
                  </button>
                ) : (
                  <div style={{
                    width: 48, height: 26, borderRadius: 13,
                    background: '#f1f5f9', flexShrink: 0, opacity: 0.5,
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* ═══════════════ Transaction Log ═══════════════ */}
      <div style={{ marginTop: 36 }}>        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'grid', placeItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 14l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {t('سجل عمليات الدفع')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>{t('جميع عمليات الشحن والدفع — يمكنك الموافقة على المعلقة')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...(isRTL ? { right: 10 } : { left: 10 }), pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>
              <input
                value={txSearch}
                onChange={e => setTxSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setTxPage(1); fetchTransactions(txSearch || undefined); } }}
                placeholder={isRTL ? 'بحث برقم الفاتورة أو اسم العميل...' : 'Search invoice or customer...'}
                style={{ width: 220, padding: '0.45rem 0.75rem', paddingInlineStart: 32, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff' }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {([['all', 'الكل'], ['pending', 'بانتظار المراجعة'], ['awaiting_receipt', 'بانتظار الإيصال'], ['completed', 'مكتملة'], ['failed', 'مرفوضة']] as const).map(([key, label]) => {
            const count = key === 'all' ? transactions.length : transactions.filter(t => t.status === key).length;
            const isActive = txFilter === key;
            const colorMap: Record<string, { bg: string; color: string }> = {
              pending: { bg: '#fef3c7', color: '#92400e' },
              awaiting_receipt: { bg: '#eef2ff', color: '#4338ca' },
              completed: { bg: '#dcfce7', color: '#166534' },
              failed: { bg: '#fee2e2', color: '#b91c1c' },
              all: { bg: '#f1f5f9', color: '#334155' },
            };
            const colors = colorMap[key] || colorMap.all;
            return (
              <button key={key} onClick={() => { setTxFilter(key); setTxPage(1); }} style={{
                padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none',
                background: isActive ? colors.bg : '#fff',
                color: isActive ? colors.color : '#94a3b8',
                fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}>
                {t(label)} {count > 0 && <span style={{ marginInlineStart: 4, opacity: 0.7 }}>({count})</span>}
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
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>{t('لا توجد عمليات دفع')} {txFilter !== 'all' ? t('بهذا التصنيف') : t('بعد')}</p>
              </div>
            );
          }

          return (
            <>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.7fr 0.8fr 0.8fr 1fr',
                  padding: '0.65rem 1rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                }}>
                  <span>{t('رقم الفاتورة')}</span>
                  <span>{t('العميل')}</span>
                  <span>{t('المبلغ')}</span>
                  <span>{t('البوابة')}</span>
                  <span>{t('الحالة')}</span>
                  <span>{t('الإجراء')}</span>
                </div>

                {/* Rows */}
                {paginated.map(tx => {
                  const isPending = tx.status === 'pending' || tx.status === 'awaiting_receipt';
                  const hasReceipt = !!tx.meta?.receipt_url;
                  const methodLabel = isRTL
                    ? (GATEWAY_META[tx.payment_method as GatewayType]?.label || tx.payment_method)
                    : (GATEWAY_META[tx.payment_method as GatewayType]?.labelEn || tx.payment_method);
                  const methodColor = GATEWAY_META[tx.payment_method as GatewayType]?.color || '#64748b';
                  const statusConfig = {
                    pending: { label: t('بانتظار المراجعة'), bg: '#fef3c7', color: '#92400e', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#92400e" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    awaiting_receipt: { label: t('بانتظار الإيصال'), bg: '#eef2ff', color: '#4338ca', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    completed: { label: t('مكتملة'), bg: '#dcfce7', color: '#166534', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    failed: { label: t('مرفوضة'), bg: '#fee2e2', color: '#b91c1c', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#b91c1c" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    refunded: { label: t('مستردة'), bg: '#e0e7ff', color: '#4338ca', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    cancelled: { label: t('ملغاة'), bg: '#f1f5f9', color: '#64748b', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#64748b" strokeWidth="2"/><path d="M4.93 4.93l14.14 14.14" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg> },
                  }[tx.status] || { label: tx.status, bg: '#f1f5f9', color: '#64748b', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="#64748b"/></svg> };

                  return (
                    <div key={tx.id} style={{
                      display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.7fr 0.8fr 0.8fr 1fr',
                      padding: '0.7rem 1rem', borderBottom: '1px solid #f8fafc',
                      alignItems: 'center', fontSize: '0.8rem',
                      background: isPending ? '#fffbeb05' : 'transparent',
                    }}>
                      {/* Invoice + Date */}
                      <div>
                        <span style={{ fontWeight: 700, color: '#7c5cff', fontSize: '0.82rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{tx.invoice_number || `#${tx.id}`}</span>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                          {new Date(tx.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                          {' '}
                          {new Date(tx.created_at).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Customer */}
                      <div>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{tx.customer_name || (isRTL ? `عميل #${tx.customer_id}` : `Customer #${tx.customer_id}`)}</span>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 1 }}>
                          {tx.type === 'deposit' ? t('شحن رصيد') : tx.type === 'purchase' ? t('شراء') : t('استرداد')}
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
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                          }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {t('إيصال')}</button>
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
                            >{approvingId === tx.id ? '...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> {t('موافقة')}</span>}</button>
                            <button
                              onClick={() => handleReject(tx)}
                              disabled={approvingId === tx.id}
                              style={{
                                padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid #fecaca',
                                background: '#fff', cursor: approvingId === tx.id ? 'not-allowed' : 'pointer',
                                fontSize: '0.68rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif',
                                color: '#dc2626', opacity: approvingId === tx.id ? 0.6 : 1,
                              }}
                            ><span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {t('رفض')}</span></button>
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
                  }}>{isRTL ? '← السابق' : '← Previous'}</button>
                  <span style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#64748b' }}>{txPage} / {totalPages}</span>
                  <button disabled={txPage >= totalPages} onClick={() => setTxPage(p => p + 1)} style={{
                    padding: '0.35rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: txPage >= totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', color: '#64748b', opacity: txPage >= totalPages ? 0.4 : 1,
                  }}>{isRTL ? 'التالي →' : 'Next →'}</button>
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
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#7c5cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#7c5cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {isRTL ? 'إيصال الدفع' : 'Payment Receipt'}  {receiptModal.invoice_number || `#${receiptModal.id}`}</h3>
              <button onClick={() => setReceiptModal(null)} style={{ background: '#f1f5f9', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', display: 'grid', placeItems: 'center' }}>✕</button>
            </div>

            {/* Payment Info */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: 16 }}>
              {receiptModal.invoice_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>{t('رقم الفاتورة')}</span>
                  <span style={{ fontWeight: 700, color: '#7c5cff', fontFamily: 'monospace' }}>{receiptModal.invoice_number}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>{t('العميل')}</span>
                <span style={{ fontWeight: 600, color: '#0b1020' }}>{receiptModal.customer_name || `#${receiptModal.customer_id}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>{t('المبلغ')}</span>
                <span style={{ fontWeight: 700, color: '#059669', direction: 'ltr' as const }}>${receiptModal.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>{t('البوابة')}</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{isRTL ? (GATEWAY_META[receiptModal.payment_method as GatewayType]?.label || receiptModal.payment_method) : (GATEWAY_META[receiptModal.payment_method as GatewayType]?.labelEn || receiptModal.payment_method)}</span>
              </div>
              {receiptModal.meta?.receipt_uploaded_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>{t('تاريخ الرفع')}</span>
                  <span style={{ fontWeight: 500, color: '#334155', fontSize: '0.78rem' }}>{new Date(receiptModal.meta.receipt_uploaded_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}</span>
                </div>
              )}
            </div>

            {/* Receipt Image */}
            {receiptModal.meta?.receipt_url && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img
                  src={receiptModal.meta.receipt_url}
                  alt={t("إيصال الدفع")}
                  style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, border: '1px solid #e2e8f0' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Receipt Notes */}
            {receiptModal.meta?.receipt_notes && (
              <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400e' }}>{t('ملاحظات العميل:')}</p>
                <p style={{ fontSize: '0.82rem', color: '#78350f', marginTop: 4 }}>{receiptModal.meta.receipt_notes}</p>
              </div>
            )}

            {/* Actions */}
            {(receiptModal.status === 'pending' || receiptModal.status === 'awaiting_receipt') && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { handleReject(receiptModal); setReceiptModal(null); }} style={{
                  flex: 1, padding: '0.65rem', borderRadius: 10, border: '1px solid #fecaca',
                  background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: 'Tajawal, sans-serif', color: '#dc2626',
                }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {t('رفض')}</span></button>
                <button onClick={() => { handleApprove(receiptModal); setReceiptModal(null); }} style={{
                  flex: 2, padding: '0.65rem', borderRadius: 10, border: 'none',
                  background: '#059669', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                  fontFamily: 'Tajawal, sans-serif', color: '#fff',
                }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> {t('موافقة وإضافة الرصيد')}</span></button>
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
                    {editingGw ? (isRTL ? `تعديل ${GATEWAY_META[formType].label}` : `Edit ${GATEWAY_META[formType].labelEn}`) : (isRTL ? `إعداد ${GATEWAY_META[formType].label}` : `Setup ${GATEWAY_META[formType].labelEn}`)}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t(GATEWAY_META[formType].desc)}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8,
                cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '1rem',
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name – hidden for bankak (fixed name) */}
              {formType !== 'bankak' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t('الاسم (عربي)')}</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t("اسم البوابة")} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('الاسم (إنجليزي)')}</label>
                  <input value={formNameEn} onChange={e => setFormNameEn(e.target.value)} placeholder="Gateway Name" style={inputStyle} />
                </div>
              </div>
              )}

              {/* Config Fields */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#475569" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#475569" strokeWidth="2"/></svg>
                  {isRTL ? 'إعدادات' : 'Settings'} {isRTL ? GATEWAY_META[formType].label : GATEWAY_META[formType].labelEn}
                </label>
                <div style={{ padding: '1rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fields.map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        {t(field.label)}
                        {field.required && <span style={{ color: '#dc2626', marginInlineStart: 2 }}> *</span>}
                      </label>
                      {field.options ? (
                        <select
                          value={formConfig[field.key] || field.options[0]?.value || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          style={inputStyle}
                        >
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formConfig[field.key] || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={t(field.placeholder)}
                          rows={4}
                          style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={formConfig[field.key] || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={t(field.placeholder)}
                          style={inputStyle}
                        />
                      )}
                      {field.key === 'image_url' && formConfig.image_url && (
                        <div style={{ marginTop: 8, textAlign: 'center' }}>
                          <img src={formConfig.image_url} alt={t("معاينة")} style={{ maxWidth: 120, maxHeight: 60, borderRadius: 8, border: '1px solid #e2e8f0' }} onError={e => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10 }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0b1020' }}>{t('بوابة افتراضية')}</p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('ستكون الأولى في قائمة الدفع')}</p>
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
                {saving ? (
                  <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> {t('جاري الحفظ...')}</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 21v-8H7v8M7 3v5h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {editingGw ? t('حفظ التعديلات') : t('إضافة البوابة')}</>
                )}
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>{t('حذف بوابة الدفع؟')}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>{t('هذا الإجراء لا يمكن التراجع عنه')}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>{t('إلغاء')}</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', background: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', color: '#fff' }}>{t('نعم، احذف')}</button>
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
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {toast.type === 'success'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          } {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .gw-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
        @media (max-width: 768px) {
          .gw-card > div:first-child { flex-wrap: wrap !important; gap: 10px !important; }
        }
      `}</style>
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

function InlineChip({ label, value, dotColor }: { label: string; value: string; dotColor?: string }) {
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: 500, color: '#475569',
      background: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: 6,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: '#94a3b8', fontWeight: 600 }}>{label}:</span>
      {dotColor && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />}
      <span style={{ fontWeight: 600, color: '#334155' }}>{value}</span>
    </span>
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
