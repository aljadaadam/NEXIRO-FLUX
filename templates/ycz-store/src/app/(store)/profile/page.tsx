'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, CreditCard, Shield, Wallet, Lock, Mail, Phone,
  CheckCircle, X, Upload, Send, Save, ChevronRight, ChevronLeft,
  ShoppingCart, Bell, Settings, LogOut, DollarSign, Clock,
  Eye, EyeOff, ArrowRight, Globe, Loader2
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';

// ─── WalletChargeModal (Real checkout flow: PayPal/Binance/USDT/Bank) ───
// ─── Gateway type → display info ───
const GATEWAY_ICONS: Record<string, { icon: string; color: string; desc: string }> = {
  binance: { icon: '₿', color: '#f0b90b', desc: 'USDT — Binance Pay' },
  paypal:  { icon: '💳', color: '#003087', desc: 'تحويل عبر PayPal' },
  bank_transfer: { icon: '🏦', color: '#059669', desc: 'بيانات بنكية — للعرض فقط' },
  usdt:    { icon: '💚', color: '#26a17b', desc: 'USDT — تيثر' },
  wallet:  { icon: '📱', color: '#8b5cf6', desc: 'شحن عبر محفظة إلكترونية' },
  bankak:  { icon: '🏛️', color: '#0891b2', desc: 'دفع عبر بنكك' },
};

// ─── Types for checkout response ───
type CheckoutResult = {
  success: boolean;
  paymentId: number;
  gatewayType: string;
  method: string;
  // PayPal
  redirectUrl?: string;
  orderId?: string;
  // Binance
  checkoutUrl?: string;
  qrContent?: string;
  // USDT
  walletAddress?: string;
  network?: string;
  amount?: number;
  originalAmount?: number;
  currency?: string;
  contractAddress?: string;
  instructions?: string | { ar: string; en: string };
  expires_in?: number;
  expires_at?: string;
  // Bank Transfer
  bankDetails?: {
    bank_name?: string;
    account_holder?: string;
    iban?: string;
    swift?: string;
    account_number?: string;
    currency?: string;
  };
  referenceId?: string;
  // Wallet (info-only)
  walletConfig?: {
    instructions?: string;
    contact_numbers?: string;
    image_url?: string;
  };
  // Bankak
  bankakDetails?: {
    account_number?: string;
    full_name?: string;
    exchange_rate?: string;
    local_currency?: string;
    receipt_note?: string;
    image_url?: string;
  };
  localAmount?: number;
};

function WalletChargeModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted?: () => void }) {
  const { currentTheme, buttonRadius, t, isRTL } = useTheme();
  // Steps: 1=amount+method, 2=processing/payment-details, 3=receipt(bank), 4=success
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptNotes, setReceiptNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutResult | null>(null);
  const [usdtChecking, setUsdtChecking] = useState(false);
  const [usdtCountdown, setUsdtCountdown] = useState(0);
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [usdtSubStep, setUsdtSubStep] = useState<1 | 2>(1); // 1=send info, 2=verify
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  // Fetch enabled gateways from backend
  const [gateways, setGateways] = useState<{ id: number; type: string; name: string; name_en?: string; is_default: boolean; config?: Record<string, string> | null }[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);

  useEffect(() => {
    storeApi.getEnabledGateways()
      .then(res => {
        const list = res?.gateways || [];
        setGateways(list);
        const def = list.find((g: { is_default: boolean }) => g.is_default);
        if (def) setMethod(def.type);
      })
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  }, []);

  // USDT countdown timer
  useEffect(() => {
    if (step !== 2 || checkoutData?.method !== 'manual_crypto' || !checkoutData.expires_at) return;
    const expiresAt = new Date(checkoutData.expires_at).getTime();
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setUsdtCountdown(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, checkoutData]);

  const presetAmounts = [5, 10, 25, 50, 100];
  const selectedGw = gateways.find(g => g.type === method);

  // ─── Start Checkout ───
  const handleStartCheckout = async () => {
    if (!amount || !method || !selectedGw) return;

    // ─── Wallet type: info-only, no backend checkout ───
    if (selectedGw.type === 'wallet') {
      setCheckoutData({
        success: true,
        method: 'info_wallet',
        paymentId: 0,
        gatewayType: 'wallet',
        walletConfig: selectedGw.config,
      } as CheckoutResult);
      setStep(2);
      return;
    }

    // ─── Bank Transfer type: info-only, show bank details without creating payment ───
    if (selectedGw.type === 'bank_transfer') {
      setCheckoutData({
        success: true,
        method: 'info_bank',
        paymentId: 0,
        gatewayType: 'bank_transfer',
        bankDetails: {
          bank_name: selectedGw.config?.bank_name || '',
          account_holder: selectedGw.config?.account_holder || '',
          iban: selectedGw.config?.iban || '',
          swift: selectedGw.config?.swift || '',
          currency: selectedGw.config?.currency || 'USD',
        },
      } as CheckoutResult);
      setStep(2);
      return;
    }

    // ─── Bankak type: show bank info + receipt upload ───
    // In demo mode, handle locally; otherwise let it go through backend checkout
    if (selectedGw.type === 'bankak' && typeof window !== 'undefined' && (
      new URLSearchParams(window.location.search).get('demo') === '1' ||
      sessionStorage.getItem('demo_mode') === '1' ||
      window.location.hostname.startsWith('demo-')
    )) {
      const rate = Number(selectedGw.config?.exchange_rate || 0);
      const localAmt = rate > 0 ? Math.round(Number(amount) * rate) : 0;
      setCheckoutData({
        success: true,
        method: 'manual_bankak',
        paymentId: 0,
        gatewayType: 'bankak',
        bankakDetails: {
          account_number: selectedGw.config?.account_number || '',
          full_name: selectedGw.config?.full_name || '',
          exchange_rate: selectedGw.config?.exchange_rate || '',
          local_currency: 'SDG',
          receipt_note: selectedGw.config?.receipt_note || '',
          image_url: 'https://6990ab01681c79fa0bccfe99.imgix.net/bank.png',
        },
        localAmount: localAmt,
        amount: Number(amount),
        referenceId: `BK${Date.now()}`,
      } as CheckoutResult);
      setStep(2);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const currentUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/profile?payment_id=__PAYMENT_ID__`
        : '/profile?payment_id=__PAYMENT_ID__';
      const result = await storeApi.initCheckout({
        gateway_id: selectedGw.id,
        amount: Number(amount),
        currency: 'USD',
        type: 'deposit',
        description: `شحن محفظة — $${amount}`,
        return_url: currentUrl,
        cancel_url: currentUrl,
      });
      setPaymentId(result.paymentId);
      setCheckoutData(result);

      // Store pending payment id to confirm later even if provider returns without query params
      if (typeof window !== 'undefined' && result?.paymentId) {
        sessionStorage.setItem('pending_payment_id', String(result.paymentId));
      }

      // Handle based on payment method
      if (result.method === 'redirect' && result.redirectUrl && !result.redirectUrl.startsWith('#')) {
        // Security: validate redirect URL is HTTPS and not javascript:/data:
        try {
          const parsed = new URL(result.redirectUrl);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            window.location.href = parsed.href;
          } else {
            setSubmitError(t('رابط الدفع غير صالح'));
          }
        } catch {
          setSubmitError(t('رابط الدفع غير صالح'));
        }
        return;
      }
      if (result.method === 'qr_or_redirect' && result.checkoutUrl && !result.checkoutUrl.startsWith('#')) {
        // Security: validate checkout URL
        try {
          const parsed = new URL(result.checkoutUrl);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            window.open(parsed.href, '_blank', 'noopener,noreferrer');
          }
        } catch { /* invalid URL */ }
      }
      // For all methods: show step 2 with payment details
      setStep(2);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل في بدء عملية الدفع'));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Check USDT Payment ───
  const handleCheckUsdt = async () => {
    if (!paymentId) return;
    // For BEP20/ERC20: require tx hash
    const network = checkoutData?.network;
    const needsTxHash = network === 'BEP20' || network === 'ERC20';
    if (needsTxHash && !usdtTxHash.trim()) {
      setSubmitError(t('يرجى إدخال هاش المعاملة (Transaction Hash)'));
      setTimeout(() => setSubmitError(''), 4000);
      return;
    }
    setUsdtChecking(true);
    try {
      const result = await storeApi.checkUsdtPayment(paymentId, usdtTxHash.trim() || undefined);
      if (result.confirmed) {
        setPaymentConfirmed(true);
        setStep(4);
        onSubmitted?.();
      } else {
        setSubmitError(result.message || t('لم يتم العثور على تحويل مطابق بعد'));
        setTimeout(() => setSubmitError(''), 4000);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل في التحقق'));
    } finally {
      setUsdtChecking(false);
    }
  };

  // ─── Check Payment Status (Binance/PayPal polling) ───
  const handleCheckStatus = async () => {
    if (!paymentId) return;
    setUsdtChecking(true);
    try {
      const result = await storeApi.checkPaymentStatus(paymentId);
      if (result.status === 'completed') {
        setPaymentConfirmed(true);
        setStep(4);
        onSubmitted?.();
      } else {
        setSubmitError(t('الدفع لا يزال قيد الانتظار...'));
        setTimeout(() => setSubmitError(''), 3000);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل في التحقق'));
    } finally {
      setUsdtChecking(false);
    }
  };

  // ─── Handle File Selection ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(t('حجم الملف يتجاوز 5MB'));
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }
    setReceiptFile(file);
    setReceipt(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ─── Submit Bank Receipt ───
  const handleSubmitReceipt = async () => {
    if (!receiptPreview) {
      setSubmitError(t('يرجى رفع صورة الإيصال أولاً'));
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }
    // In demo mode paymentId may be 0/null — use demo api path
    const effectiveId = paymentId || 0;
    setSubmitting(true);
    setSubmitError('');
    try {
      await storeApi.uploadReceipt(effectiveId, {
        receipt_url: receiptPreview,
        notes: receiptNotes || `شحن محفظة — $${amount}`,
      });
      setStep(4);
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('فشل في رفع الإيصال'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {step === 1 ? t('💰 شحن المحفظة') : step === 2 ? t('📋 إتمام الدفع') : step === 3 ? t('📎 رفع الإيصال') : t('✅ تم الإرسال')}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg-muted)', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Amount + Method */}
        {step === 1 && (
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'block' }}>{t('المبلغ ($)')}</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {presetAmounts.map(a => (
                <button key={a} onClick={() => setAmount(String(a))} style={{
                  padding: '0.5rem 1rem', borderRadius: 10, border: amount === String(a) ? `2px solid ${currentTheme.primary}` : '1px solid var(--border-default)',
                  background: amount === String(a) ? `${currentTheme.primary}10` : 'var(--bg-subtle)', color: amount === String(a) ? currentTheme.primary : 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minWidth: 48,
                }}>${a}</button>
              ))}
            </div>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('أو أدخل مبلغ مخصص')} type="number" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid var(--border-default)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'block' }}>{t('طريقة الدفع')}</label>
            {gatewaysLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('جاري تحميل بوابات الدفع...')}</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : gateways.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fef2f2', borderRadius: 12 }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚠️</p>
                <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>{t('لا توجد بوابات دفع مفعّلة حالياً')}</p>
                <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: 4 }}>{t('تواصل مع الإدارة لتفعيل بوابات الدفع')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gateways.map(gw => {
                  const meta = GATEWAY_ICONS[gw.type] || { icon: '💳', color: '#64748b', desc: gw.type };
                  return (
                    <button key={gw.id} onClick={() => setMethod(gw.type)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem',
                      borderRadius: 12, cursor: 'pointer', width: '100%', fontFamily: 'inherit', textAlign: isRTL ? 'right' : 'left',
                      border: method === gw.type ? `2px solid ${currentTheme.primary}` : '1px solid var(--border-default)',
                      background: method === gw.type ? `${currentTheme.primary}08` : 'var(--bg-card)',
                    }}>
                      {gw.config?.image_url ? (
                        <img src={gw.config.image_url} alt={gw.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', flexShrink: 0, background: 'var(--bg-subtle)' }} onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling && ((e.currentTarget.nextElementSibling as HTMLElement).style.display = 'grid'); }} />
                      ) : null}
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}15`, color: meta.color, display: gw.config?.image_url ? 'none' : 'grid', placeItems: 'center', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{gw.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t(meta.desc)}</p>
                      </div>
                      {method === gw.type && <CheckCircle size={18} color={currentTheme.primary} />}
                      {gw.is_default && <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, background: '#dbeafe', color: '#2563eb', fontWeight: 700 }}>{t('افتراضي')}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginTop: 10 }}>{submitError}</p>}

            <button onClick={handleStartCheckout} disabled={!amount || !method || submitting} style={{
              width: '100%', marginTop: 20, padding: '0.75rem', borderRadius: btnR,
              background: amount && method && !submitting ? currentTheme.primary : 'var(--border-default)', color: amount && method && !submitting ? '#fff' : 'var(--text-muted)',
              border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: amount && method && !submitting ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {submitting ? (
                <><div style={{ width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> {t('جاري المعالجة...')}</>
              ) : (
                <>{t('متابعة')} — ${amount || '0'}</>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Payment Details (from real checkout API) */}
        {step === 2 && checkoutData && (
          <div>
            {/* Amount banner (hide for USDT & Bankak - they have their own) */}
            {checkoutData.method !== 'manual_crypto' && checkoutData.method !== 'manual_bankak' && (
            <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, borderRadius: 14, padding: '1.25rem', marginBottom: 20, color: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>{t('المبلغ المطلوب')}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>${amount}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 4 }}>{t('عبر')} {selectedGw?.name || method}</p>
            </div>
            )}

            {/* ── PayPal: redirect happened, show waiting ── */}
            {checkoutData.method === 'redirect' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#003087', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: '1.8rem' }}>💳</span>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t('تم توجيهك إلى PayPal')}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{t('أكمل الدفع في صفحة PayPal ثم عد هنا')}</p>
                <button onClick={handleCheckStatus} disabled={usdtChecking} style={{
                  padding: '0.7rem 2rem', borderRadius: btnR, background: '#003087', color: '#fff',
                  border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: 6, opacity: usdtChecking ? 0.7 : 1,
                }}>
                  {usdtChecking ? t('جاري التحقق...') : t('🔄 تحقق من حالة الدفع')}
                </button>
              </div>
            )}

            {/* ── Binance: QR code or redirect ── */}
            {checkoutData.method === 'qr_or_redirect' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fef9c3', borderRadius: 12, padding: '1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem' }}>₿</span>
                  <p style={{ fontSize: '0.82rem', color: '#854d0e', fontWeight: 600 }}>{t('ادفع عبر Binance Pay')}</p>
                </div>
                {checkoutData.qrContent && (
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '1rem', marginBottom: 12, wordBreak: 'break-all' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{t('رابط الدفع:')}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{checkoutData.qrContent}</p>
                  </div>
                )}
                {checkoutData.checkoutUrl && (
                  <a href={checkoutData.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.7rem 1.5rem', borderRadius: btnR,
                    background: '#f0b90b', color: '#000', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', marginBottom: 16, fontFamily: 'inherit',
                  }}>{t('🔗 فتح صفحة الدفع')}</a>
                )}
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleCheckStatus} disabled={usdtChecking} style={{
                    width: '100%', padding: '0.7rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff',
                    border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    opacity: usdtChecking ? 0.7 : 1,
                  }}>
                    {usdtChecking ? t('جاري التحقق...') : t('🔄 تحقق من حالة الدفع')}
                  </button>
                </div>
              </div>
            )}

            {/* ── USDT: 2-Step Flow ── */}
            {checkoutData.method === 'manual_crypto' && (
              <div>
                {/* Step indicator + Timer row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: currentTheme.primary, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800 }}>1</div>
                      <span style={{ fontSize: '0.72rem', fontWeight: usdtSubStep === 1 ? 700 : 400, color: usdtSubStep === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t('إرسال')}</span>
                    </div>
                    <div style={{ width: 20, height: 1, background: 'var(--border-default)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: usdtSubStep === 2 ? currentTheme.primary : 'var(--border-default)', color: usdtSubStep === 2 ? '#fff' : 'var(--text-muted)', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800 }}>2</div>
                      <span style={{ fontSize: '0.72rem', fontWeight: usdtSubStep === 2 ? 700 : 400, color: usdtSubStep === 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t('تحقق')}</span>
                    </div>
                  </div>
                  {usdtCountdown > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: usdtCountdown < 300 ? '#fef2f2' : '#f0fdf4' }}>
                      <Clock size={12} color={usdtCountdown < 300 ? '#ef4444' : '#16a34a'} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: usdtCountdown < 300 ? '#ef4444' : '#16a34a', fontFamily: 'monospace' }}>{formatTime(usdtCountdown)}</span>
                    </div>
                  )}
                </div>

                {/* ── Sub-Step 1: Send ── */}
                {usdtSubStep === 1 && (
                  <div>
                    {/* Amount + Network compact header */}
                    <div style={{
                      background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                      borderRadius: 16,
                      padding: '1.2rem',
                      marginBottom: 14,
                      color: '#fff',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                      <p style={{ fontSize: '0.72rem', opacity: 0.85, marginBottom: 4 }}>{t('أرسل بالضبط')}</p>
                      <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
                        {checkoutData.amount} <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>USDT</span>
                      </p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', fontSize: '0.72rem' }}>
                        <span>{checkoutData.network}</span>
                      </div>
                      {checkoutData.originalAmount && String(checkoutData.originalAmount) !== String(checkoutData.amount) && (
                        <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 6 }}>
                          ${checkoutData.originalAmount} + {t('تحقق')}: ${(Number(checkoutData.amount) - Number(checkoutData.originalAmount)).toFixed(3)}
                        </p>
                      )}
                    </div>

                    {/* QR + Address compact card */}
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 14,
                      padding: '1rem',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}>
                      {/* QR Code - smaller */}
                      {checkoutData.walletAddress && (
                        <div style={{ flexShrink: 0, background: 'var(--bg-card)', borderRadius: 10, padding: 6, border: '1px solid var(--border-light)' }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(checkoutData.walletAddress)}&bgcolor=ffffff&color=000000&margin=4`}
                            alt="QR"
                            width={100}
                            height={100}
                            style={{ display: 'block', borderRadius: 6 }}
                          />
                        </div>
                      )}
                      {/* Address + Copy */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('عنوان المحفظة')}</p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.4, direction: 'ltr', textAlign: 'left' }}>
                          {checkoutData.walletAddress}
                        </p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(checkoutData.walletAddress || '');
                              const el = document.getElementById('copy-addr-btn');
                              if (el) { el.textContent = '✓ ' + t('تم النسخ'); setTimeout(() => { el.textContent = '📋 ' + t('نسخ العنوان'); }, 1500); }
                            }}
                            id="copy-addr-btn"
                            style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                          >📋 {t('نسخ العنوان')}</button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(checkoutData.amount || ''));
                              const el = document.getElementById('copy-amt-btn');
                              if (el) { el.textContent = '✓'; setTimeout(() => { el.textContent = '📋 ' + t('نسخ المبلغ'); }, 1500); }
                            }}
                            id="copy-amt-btn"
                            style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                          >📋 {t('نسخ المبلغ')}</button>
                        </div>
                      </div>
                    </div>

                    {/* Warning note - compact */}
                    <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.6rem 0.8rem', marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>⚠️</span>
                      <p style={{ fontSize: '0.7rem', color: '#92400e', lineHeight: 1.5 }}>
                        {checkoutData.network === 'TRC20'
                          ? t('أرسل المبلغ بالضبط عبر الشبكة الصحيحة. المبلغ فريد لعمليتك.')
                          : t('أرسل المبلغ عبر الشبكة الصحيحة. بعد الإرسال انسخ TX Hash للتحقق.')}
                      </p>
                    </div>

                    {/* "I've sent" button */}
                    <button
                      onClick={() => setUsdtSubStep(2)}
                      disabled={usdtCountdown <= 0}
                      style={{
                        width: '100%', padding: '0.75rem', borderRadius: btnR,
                        background: usdtCountdown <= 0 ? 'var(--border-default)' : currentTheme.primary, color: usdtCountdown <= 0 ? 'var(--text-muted)' : '#fff',
                        border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: usdtCountdown <= 0 ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      {usdtCountdown <= 0 ? t('انتهت المهلة') : <>{t('✅ أرسلت المبلغ — التالي')}</>}
                    </button>
                  </div>
                )}

                {/* ── Sub-Step 2: Verify ── */}
                {usdtSubStep === 2 && (
                  <div>
                    {/* Summary mini card */}
                    <div style={{
                      background: `${currentTheme.primary}08`,
                      border: `1px solid ${currentTheme.primary}25`,
                      borderRadius: 12,
                      padding: '0.8rem 1rem',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('المبلغ المرسل')}</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{checkoutData.amount} USDT</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('الشبكة')}</p>
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: currentTheme.primary }}>{checkoutData.network}</p>
                      </div>
                    </div>

                    {/* TX Hash input for BEP20/ERC20 */}
                    {(checkoutData.network === 'BEP20' || checkoutData.network === 'ERC20') && (
                      <div style={{
                        background: `${currentTheme.primary}0a`,
                        border: `1.5px solid ${currentTheme.primary}`,
                        borderRadius: 12,
                        padding: '1rem',
                        marginBottom: 14,
                      }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: currentTheme.primary, display: 'block', marginBottom: 6 }}>
                          {t('هاش المعاملة (Transaction Hash)')}
                        </label>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                          {t('انسخ TX Hash من محفظتك والصقه هنا')}
                        </p>
                        <input
                          type="text"
                          value={usdtTxHash}
                          onChange={e => setUsdtTxHash(e.target.value)}
                          placeholder="0x..."
                          dir="ltr"
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: 8,
                            border: `1px solid ${currentTheme.primary}40`,
                            fontSize: '0.82rem',
                            fontFamily: 'monospace',
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    )}

                    {/* TRC20: auto-detection note */}
                    {checkoutData.network === 'TRC20' && (
                      <div style={{ background: `${currentTheme.primary}0a`, border: `1px solid ${currentTheme.primary}30`, borderRadius: 12, padding: '1rem', marginBottom: 14, textAlign: 'center' }}>
                        <p style={{ fontSize: '0.82rem', color: currentTheme.primary, fontWeight: 600 }}>
                          {t('سيتم الكشف عن التحويل تلقائياً')}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {t('اضغط زر التحقق بعد إتمام التحويل')}
                        </p>
                      </div>
                    )}

                    {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginBottom: 10 }}>{submitError}</p>}

                    {/* Verify button */}
                    <button onClick={handleCheckUsdt} disabled={usdtChecking || usdtCountdown <= 0} style={{
                      width: '100%', padding: '0.75rem', borderRadius: btnR,
                      background: usdtChecking || usdtCountdown <= 0 ? 'var(--border-default)' : currentTheme.primary, color: usdtChecking || usdtCountdown <= 0 ? 'var(--text-muted)' : '#fff',
                      border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: usdtChecking ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      marginBottom: 10,
                    }}>
                      {usdtChecking ? (
                        <><div style={{ width: 14, height: 14, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> {t('جاري التحقق...')}</>
                      ) : usdtCountdown <= 0 ? t('انتهت المهلة') : t('🔍 تحقق من الدفع')}
                    </button>

                    {/* Back to step 1 */}
                    <button
                      onClick={() => setUsdtSubStep(1)}
                      style={{
                        width: '100%', padding: '0.55rem', borderRadius: btnR,
                        background: 'transparent', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t('← العودة لبيانات التحويل')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Bank Transfer: info-only — عرض بيانات البنك فقط بدون رفع إيصال ── */}
            {checkoutData.method === 'info_bank' && (
              <div>
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} color={currentTheme.primary} /> {t('بيانات الحساب البنكي')}
                  </h4>
                  {[
                    ...(checkoutData.bankDetails?.bank_name ? [{ label: t('البنك'), value: checkoutData.bankDetails.bank_name }] : []),
                    ...(checkoutData.bankDetails?.account_holder ? [{ label: t('اسم الحساب'), value: checkoutData.bankDetails.account_holder }] : []),
                    ...(checkoutData.bankDetails?.iban ? [{ label: 'IBAN', value: checkoutData.bankDetails.iban }] : []),
                    ...(checkoutData.bankDetails?.swift ? [{ label: 'SWIFT', value: checkoutData.bankDetails.swift }] : []),
                    ...(checkoutData.bankDetails?.currency ? [{ label: t('العملة'), value: checkoutData.bankDetails.currency }] : []),
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: '60%' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', direction: 'ltr', textAlign: 'left', wordBreak: 'break-all' }}>{item.value}</span>
                        <button onClick={() => { navigator.clipboard.writeText(item.value); }} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-default)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>📋</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info note — للعرض فقط */}
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
                  <p style={{ fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.6 }}>{t('هذه البوابة للعرض فقط. حوّل المبلغ إلى الحساب أعلاه وتواصل مع الإدارة لتأكيد التحويل.')}</p>
                </div>

                <button onClick={() => { setStep(1); setCheckoutData(null); }} style={{
                  width: '100%', padding: '0.7rem', borderRadius: btnR, background: 'var(--bg-muted)',
                  color: 'var(--text-secondary)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{t('← رجوع')}</button>
              </div>
            )}

            {/* ── Wallet: info-only, no checkout ── */}
            {checkoutData.method === 'info_wallet' && checkoutData.walletConfig && (
              <div>
                {/* Image/Logo */}
                {checkoutData.walletConfig.image_url && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img src={checkoutData.walletConfig.image_url} alt={selectedGw?.name || ''} style={{ maxWidth: 140, maxHeight: 80, borderRadius: 12, border: '1px solid var(--border-default)' }} onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}

                {/* Instructions */}
                {checkoutData.walletConfig.instructions && (
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📋 {t('تعليمات الشحن')}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{checkoutData.walletConfig.instructions}</p>
                  </div>
                )}

                {/* Contact Numbers */}
                {checkoutData.walletConfig.contact_numbers && (
                  <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📞 {t('أرقام التواصل للشحن')}
                    </h4>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', direction: 'ltr', letterSpacing: 1 }}>{checkoutData.walletConfig.contact_numbers}</p>
                  </div>
                )}

                {/* Info note */}
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
                  <p style={{ fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.6 }}>{t('هذه البوابة للتواصل فقط. تواصل مع الأرقام أعلاه لإتمام عملية الشحن.')}</p>
                </div>

                <button onClick={() => { setStep(1); setCheckoutData(null); }} style={{
                  width: '100%', padding: '0.7rem', borderRadius: btnR, background: 'var(--bg-muted)',
                  color: 'var(--text-secondary)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{t('← رجوع')}</button>
              </div>
            )}

            {/* ── Bankak: local bank transfer with exchange rate ── */}
            {checkoutData.method === 'manual_bankak' && checkoutData.bankakDetails && (
              <div>
                {/* Bankak logo */}
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <img src={checkoutData.bankakDetails.image_url || 'https://6990ab01681c79fa0bccfe99.imgix.net/bank.png'} alt="بنكك" style={{ height: 48, objectFit: 'contain', borderRadius: 10 }} />
                </div>

                {/* Amount banner with exchange rate */}
                <div style={{
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  borderRadius: 16, padding: '1.25rem', marginBottom: 16, color: '#fff', textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                  <p style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: 4 }}>{t('المبلغ المطلوب')}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800 }}>${amount}</p>
                  {checkoutData.localAmount && checkoutData.localAmount > 0 && (
                    <div style={{ marginTop: 8, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        = {checkoutData.localAmount.toLocaleString()} {checkoutData.bankakDetails.local_currency || 'SDG'}
                      </p>
                    </div>
                  )}
                  {checkoutData.bankakDetails.exchange_rate && (
                    <p style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 6 }}>
                      {t('سعر الصرف')}: 1$ = {checkoutData.bankakDetails.exchange_rate} {checkoutData.bankakDetails.local_currency || 'SDG'}
                    </p>
                  )}
                </div>

                {/* Account details */}
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏛️ {t('بيانات الحساب')}
                  </h4>
                  {[
                    { label: t('صاحب الحساب'), value: checkoutData.bankakDetails.full_name || '' },
                    { label: t('رقم الحساب'), value: checkoutData.bankakDetails.account_number || '' },
                    ...(checkoutData.referenceId ? [{ label: t('رقم المرجع'), value: checkoutData.referenceId }] : []),
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', direction: 'ltr' }}>{item.value}</span>
                        <button onClick={() => { navigator.clipboard.writeText(item.value); }} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-default)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)' }}>📋</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Receipt note from admin */}
                {checkoutData.bankakDetails.receipt_note && (
                  <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>
                      {checkoutData.bankakDetails.receipt_note}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setStep(1); setCheckoutData(null); }} style={{ flex: 1, padding: '0.7rem', borderRadius: btnR, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t('رجوع')}</button>
                  <button onClick={() => setStep(3)} style={{ flex: 2, padding: '0.7rem', borderRadius: btnR, background: '#0891b2', color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Upload size={14} /> {t('رفع إشعار التحويل')}
                  </button>
                </div>
              </div>
            )}

            {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginTop: 10 }}>{submitError}</p>}
            {checkoutData.method !== 'info_bank' && checkoutData.method !== 'info_wallet' && checkoutData.method !== 'manual_bankak' && (
              <button onClick={() => { setStep(1); setCheckoutData(null); setSubmitError(''); }} style={{
                width: '100%', marginTop: 12, padding: '0.6rem', borderRadius: btnR, background: 'var(--bg-muted)',
                color: 'var(--text-secondary)', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>{t('← رجوع')}</button>
            )}
          </div>
        )}

        {/* Step 3: Upload Receipt (bank_transfer / bankak) */}
        {step === 3 && (
          <div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <div
              style={{ border: '2px dashed var(--border-default)', borderRadius: 16, padding: receiptPreview ? '1rem' : '2.5rem 1rem', textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: receiptPreview ? '#f0fdf4' : 'var(--bg-subtle)', overflow: 'hidden' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {receiptPreview ? (
                <>
                  <img src={receiptPreview} alt="receipt" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, objectFit: 'contain', marginBottom: 8 }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#16a34a' }}>{checkoutData?.method === 'manual_bankak' ? t('تم رفع إشعار التحويل بنجاح') : t('تم رفع الإيصال بنجاح')}</p>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{receiptFile?.name || 'receipt.jpg'} — {t('اضغط لتغيير الصورة')}</p>
                </>
              ) : (
                <>
                  <Upload size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('اضغط لرفع صورة الإيصال')}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>JPG, PNG — {t('حد أقصى')} 5MB</p>
                </>
              )}
            </div>

            <input
              placeholder={t('ملاحظات إضافية (اختياري)')}
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
            />

            {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginBottom: 10 }}>{submitError}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.7rem', borderRadius: btnR, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t('رجوع')}</button>
              <button onClick={handleSubmitReceipt} disabled={!receiptPreview || submitting} style={{
                flex: 2, padding: '0.7rem', borderRadius: btnR,
                background: receiptPreview && !submitting ? currentTheme.primary : 'var(--border-default)', color: receiptPreview && !submitting ? '#fff' : 'var(--text-muted)',
                border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: receiptPreview ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}><Send size={14} /> {submitting ? t('جاري الإرسال...') : t('إرسال للمراجعة')}</button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {paymentConfirmed ? t('تم تأكيد الدفع!') : t('تم إرسال طلب الشحن!')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 6 }}>
              {paymentConfirmed
                ? t('تم تأكيد الدفع وإضافة الرصيد لمحفظتك.')
                : t('سيتم مراجعة الإيصال وإضافة الرصيد لمحفظتك خلال دقائق.')}
            </p>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: 10, background: '#f0f9ff', marginBottom: 20 }}>
              <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>{t('رقم العملية:')} {paymentId ? `#PAY-${paymentId}` : '—'}</span>
            </div>
            <br />
            <button onClick={onClose} style={{ padding: '0.7rem 2.5rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t('حسناً')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── صفحة الملف الشخصي (Demo-style) ───
export default function ProfilePage() {
  const router = useRouter();
  const { currentTheme, buttonRadius, t, isRTL } = useTheme();
  // Initialize isLoggedIn synchronously from token
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return !!localStorage.getItem('auth_token');
    return false;
  });
  const [tab, setTab] = useState('login');
  const [view, setView] = useState('menu');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [personalData, setPersonalData] = useState({ name: '', email: '', phone: '', country: '', password: '' });
  const [personalSaved, setPersonalSaved] = useState(false);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalError, setPersonalError] = useState('');
  // Initialize profile from localStorage cache for instant display
  const [profile, setProfile] = useState<{ name: string; email: string; phone?: string; balance?: string }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('_profile_page_cache');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return { name: '', email: '' };
  });
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  // Forgot / Reset password state
  const [forgotStep, setForgotStep] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [transactions, setTransactions] = useState<{ id: string; type: string; amount: string; method: string; date: string; status: string; statusColor: string; statusBg: string }[]>([]);
  const [walletStats, setWalletStats] = useState({ totalDeposits: 0, totalPurchases: 0, totalRefunded: 0 });

  // Identity verification state
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');
  const [verificationNote, setVerificationNote] = useState('');
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null);
  const [idUploading, setIdUploading] = useState(false);
  const [idUploadError, setIdUploadError] = useState('');
  const [idUploadSuccess, setIdUploadSuccess] = useState(false);
  const idFileRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; type: string; is_read: number; created_at: string }[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // Check if already logged in (or demo mode)
  useEffect(() => {
    const isDemo = typeof window !== 'undefined' && (
      new URLSearchParams(window.location.search).get('demo') === '1' ||
      sessionStorage.getItem('demo_mode') === '1'
    );
    if (isDemo) {
      sessionStorage.setItem('demo_mode', '1');
      setIsLoggedIn(true);
      loadProfile();
      loadNotifications();
      return;
    }
    // Check for password reset token in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const rt = urlParams.get('reset_token');
      if (rt) {
        setResetToken(rt);
      }
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      setIsLoggedIn(true);
      loadProfile();
      loadNotifications();
    }
  }, []);

  // If user comes back from checkout with payment_id, confirm status and refresh wallet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paymentIdParam = params.get('payment_id');
    const fallbackId = sessionStorage.getItem('pending_payment_id');
    const id = Number(paymentIdParam || fallbackId || '');
    if (!Number.isFinite(id) || id <= 0) return;

    storeApi.checkPaymentStatus(id)
      .then((res: { status?: string }) => {
        if (res?.status === 'completed') {
          loadProfile();
          if (view === 'wallet') loadPayments();
          sessionStorage.removeItem('pending_payment_id');
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn && view === 'wallet') {
      loadPayments();
    }
    if (isLoggedIn && view === 'notifications') {
      loadNotifications();
    }
  }, [isLoggedIn, view]);

  async function loadProfile() {
    try {
      const res = await storeApi.getProfile();
      const customer = res?.customer || res?.user || res;
      if (customer) {
        const walletBalance = Number(customer.wallet_balance ?? customer.balance ?? customer.wallet?.balance ?? 0);
        const profileData = {
          name: customer.name || customer.username || '',
          email: customer.email || '',
          phone: customer.phone || '',
          balance: `$${walletBalance.toFixed(2)}`,
        };
        setProfile(profileData);
        // Cache for instant display next time
        try { localStorage.setItem('_profile_page_cache', JSON.stringify(profileData)); } catch {}
        // Also update sidebar cache
        try { localStorage.setItem('_sidebar_profile', JSON.stringify({ name: profileData.name, email: profileData.email, balance: walletBalance })); } catch {}
        // Verification status from backend
        const vs = customer.verification_status || (customer.is_verified ? 'verified' : 'none');
        setVerificationStatus(vs as 'none' | 'pending' | 'verified' | 'rejected');
        if (customer.verification_note) setVerificationNote(customer.verification_note);
        setPersonalData(d => ({
          ...d,
          name: customer.name || customer.username || d.name,
          email: customer.email || d.email,
          phone: customer.phone || d.phone,
          country: customer.country || d.country,
          password: '',
        }));
      }
    } catch (err: any) {
      // Security: don't log error details to console in production
      // إذا كان خطأ مصادقة — أخرج المستخدم
      if (err?.message?.includes('غير مصرح') || err?.message?.includes('Token')) {
        localStorage.removeItem('auth_token');
        setIsLoggedIn(false);
      }
    }
  }

  async function loadPayments() {
    try {
      const res = await storeApi.getPayments();
      const payments = Array.isArray(res) ? res : res?.payments;
      if (!Array.isArray(payments)) return;

      // ── Compute wallet stats from raw payments ──
      let totalDeposits = 0;
      let totalPurchases = 0;
      let totalRefunded = 0;

      const mapped = payments.map((p: any) => {
        const type = String(p.type || '').toLowerCase();
        const status = String(p.status || 'pending').toLowerCase();
        const amountNum = Number(p.amount || 0);

        // Accumulate stats (only count completed / refunded)
        if (type === 'deposit' && status === 'completed') {
          totalDeposits += Math.abs(amountNum);
        } else if (type === 'purchase' && (status === 'completed' || status === 'paid')) {
          totalPurchases += Math.abs(amountNum);
        }
        if (status === 'refunded') {
          totalRefunded += Math.abs(amountNum);
        }

        const signedAmount = type === 'purchase' ? -Math.abs(amountNum) : Math.abs(amountNum);
        const amount = `${signedAmount >= 0 ? '+' : '-'}$${Math.abs(signedAmount).toFixed(2)}`;

        const statusMap: Record<string, { label: string; color: string; bg: string }> = {
          completed: { label: t('مكتمل'), color: '#16a34a', bg: '#dcfce7' },
          pending: { label: t('قيد المراجعة'), color: '#f59e0b', bg: '#fffbeb' },
          awaiting_receipt: { label: t('بانتظار رفع الإيصال'), color: '#6366f1', bg: '#eef2ff' },
          failed: { label: t('فشل'), color: '#ef4444', bg: '#fee2e2' },
          refunded: { label: t('مسترجع'), color: '#2563eb', bg: '#dbeafe' },
          cancelled: { label: t('ملغي'), color: '#64748b', bg: '#f1f5f9' },
        };

        const s = statusMap[status] || statusMap.pending;
        const createdAt = p.created_at ? new Date(p.created_at) : null;
        const date = createdAt ? createdAt.toLocaleString() : '';

        return {
          id: `#PAY-${p.id}`,
          type: type === 'deposit' ? t('شحن محفظة') : type === 'purchase' ? t('شراء') : t('عملية'),
          amount,
          method: String(p.payment_method || ''),
          date,
          status: s.label,
          statusColor: s.color,
          statusBg: s.bg,
        };
      });

      setWalletStats({ totalDeposits, totalPurchases, totalRefunded });
      setTransactions(mapped);
    } catch { /* ignore */ }
  }

  async function loadNotifications() {
    setNotifLoading(true);
    try {
      const res = await storeApi.getNotifications();
      const list = res?.notifications || [];
      setNotifications(list);
      setNotifUnread(res?.unreadCount || 0);
    } catch { /* ignore */ }
    finally { setNotifLoading(false); }
  }

  async function handleUploadIdentity() {
    if (!idDocPreview) return;
    setIdUploading(true);
    setIdUploadError('');
    try {
      await storeApi.uploadIdentity({ document_url: idDocPreview });
      setIdUploadSuccess(true);
      setVerificationStatus('pending');
      setIdDocFile(null);
      setIdDocPreview(null);
      loadProfile();
    } catch (err: any) {
      setIdUploadError(err?.message || t('فشل في رفع الوثيقة'));
    } finally {
      setIdUploading(false);
    }
  }

  async function handleSavePersonal() {
    setPersonalSaving(true);
    setPersonalError('');
    try {
      const updateData: Record<string, string> = {
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        country: personalData.country,
      };
      // أرسل كلمة المرور فقط إذا أدخلها المستخدم
      if (personalData.password && personalData.password.trim()) {
        updateData.password = personalData.password;
      }
      const res = await storeApi.updateProfile(updateData);
      if (res?.error) {
        setPersonalError(res.error);
        setPersonalSaved(false);
      } else {
        setPersonalSaved(true);
        setPersonalData(d => ({ ...d, password: '' }));
        await loadProfile();
      }
    } catch (err: any) {
      setPersonalError(err?.message || t('فشل حفظ البيانات. تأكد من تسجيل الدخول.'));
      setPersonalSaved(false);
    } finally {
      setPersonalSaving(false);
    }
  }

  async function handleAuth() {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (tab === 'register' && password !== confirmPassword) {
        setAuthError(t('كلمات المرور غير متطابقة'));
        return;
      }
      let res;
      if (tab === 'login') {
        res = await storeApi.login({ email, password });
      } else {
        res = await storeApi.register({ name, email, password });
      }
      // OTP required — show code input
      if (res?.otpRequired) {
        setOtpStep(true);
        setOtpEmail(email);
        setAuthError('');
        return;
      }
      if (res?.token) {
        localStorage.setItem('auth_token', res.token);
        setIsLoggedIn(true);
        const customer = res?.customer || res;
        setProfile({ name: customer?.name || name, email: customer?.email || email });
        loadProfile();
      } else if (res?.error) {
        setAuthError(res.error);
      } else {
        setAuthError(t('حدث خطأ غير متوقع'));
      }
    } catch (err: any) {
      setAuthError(err?.message || t('فشل الاتصال بالخادم'));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await storeApi.verifyOtp({ email: otpEmail, code: otpCode });
      if (res?.token) {
        localStorage.setItem('auth_token', res.token);
        setIsLoggedIn(true);
        const customer = res?.customer || res;
        setProfile({ name: customer?.name || name, email: customer?.email || email });
        setOtpStep(false);
        setOtpCode('');
        loadProfile();
      } else if (res?.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      setAuthError(err?.message || t('فشل التحقق'));
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('_profile_page_cache');
    localStorage.removeItem('_sidebar_profile');
    setIsLoggedIn(false);
    setProfile({ name: '', email: '' });
    setView('menu');
  }

  async function handleForgotPassword() {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await storeApi.forgotPassword({ email });
      if (res?.error) {
        setAuthError(res.error);
      } else {
        setForgotSent(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || t('فشل الاتصال بالخادم'));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleResetPassword() {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (resetNewPassword !== resetConfirm) {
        setAuthError(t('كلمات المرور غير متطابقة'));
        return;
      }
      if (resetNewPassword.length < 8) {
        setAuthError(t('كلمة المرور يجب أن تكون 8 أحرف على الأقل'));
        return;
      }
      const res = await storeApi.resetPassword({ token: resetToken, password: resetNewPassword });
      if (res?.error) {
        setAuthError(res.errorEn || res.error);
      } else {
        setResetSuccess(true);
        setResetToken('');
        // Clean URL
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('reset_token');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || t('فشل الاتصال بالخادم'));
    } finally {
      setAuthLoading(false);
    }
  }

  // ─── Login / Register (Demo-style tabs) ───
  if (!isLoggedIn) {
    // ─── تنبيه الحساب المحظور ───
    const wasBlocked = typeof window !== 'undefined' && sessionStorage.getItem('account_blocked') === '1';
    if (wasBlocked) {
      // مسح العلامة بعد عرضها مرة واحدة
      sessionStorage.removeItem('account_blocked');
    }
    // ─── Reset Password Step (from email link) ───
    if (resetToken) {
      return (
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}22, ${currentTheme.primary}11)`, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Shield size={26} color={currentTheme.primary} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'inherit' }}>{t('إعادة تعيين كلمة المرور')}</h3>
            {resetSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>{t('تم تعيين كلمة المرور بنجاح')}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'inherit' }}>{t('يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة')}</p>
                <button onClick={() => { setResetSuccess(false); setResetToken(''); setAuthError(''); }} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t('تسجيل الدخول')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} type="password" placeholder={t('أدخل كلمة المرور الجديدة')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
                <input value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} type="password" placeholder={t('تأكيد كلمة المرور الجديدة')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={handleResetPassword} disabled={authLoading || !resetNewPassword || !resetConfirm} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: (authLoading || !resetNewPassword || !resetConfirm) ? 0.6 : 1 }}>
                  {authLoading ? t('جاري التحديث...') : t('تحديث كلمة المرور')}
                </button>
                <button onClick={() => { setResetToken(''); setAuthError(''); if (typeof window !== 'undefined') { const url = new URL(window.location.href); url.searchParams.delete('reset_token'); window.history.replaceState({}, '', url.toString()); } }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t('← رجوع لتسجيل الدخول')}
                </button>
                {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center' }}>{authError}</p>}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ─── Forgot Password Step ───
    if (forgotStep) {
      return (
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}22, ${currentTheme.primary}11)`, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Shield size={26} color={currentTheme.primary} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'inherit' }}>{t('استعادة كلمة المرور')}</h3>
            {forgotSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>{t('تم إرسال رابط الاستعادة إلى بريدك الإلكتروني')}</p>
                <button onClick={() => { setForgotStep(false); setForgotSent(false); setAuthError(''); }} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t('← رجوع لتسجيل الدخول')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4, fontFamily: 'inherit' }}>{t('أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور')}</p>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('البريد الإلكتروني')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={handleForgotPassword} disabled={authLoading || !email} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: (authLoading || !email) ? 0.6 : 1 }}>
                  {authLoading ? t('جاري الإرسال...') : t('إرسال رابط الاستعادة')}
                </button>
                <button onClick={() => { setForgotStep(false); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t('← رجوع لتسجيل الدخول')}
                </button>
                {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center' }}>{authError}</p>}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ─── OTP Verification Step ───
    if (otpStep) {
      return (
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}22, ${currentTheme.primary}11)`, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Shield size={26} color={currentTheme.primary} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'inherit' }}>{t('كود التحقق')}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20, fontFamily: 'inherit' }}>{t('تم إرسال كود التحقق إلى')} <strong style={{ color: 'var(--text-primary)' }}>{otpEmail}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('أدخل الكود المكون من 6 أرقام')}
                maxLength={6}
                inputMode="numeric"
                autoFocus
                style={{ padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none', textAlign: 'center', letterSpacing: 8, fontWeight: 700 }}
              />
              <button onClick={handleVerifyOtp} disabled={authLoading || otpCode.length < 6} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: (authLoading || otpCode.length < 6) ? 0.6 : 1 }}>
                {authLoading ? t('جاري التحقق...') : t('تأكيد')}
              </button>
              <button onClick={() => { setOtpStep(false); setOtpCode(''); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('← رجوع لتسجيل الدخول')}
              </button>
              {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center' }}>{authError}</p>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* ─── تنبيه الحساب المحظور ─── */}
        {wasBlocked && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
            padding: '1rem 1.2rem', marginBottom: 16, textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center' }}>
              <Shield size={20} color="#dc2626" />
            </div>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#dc2626', margin: 0, fontFamily: 'inherit' }}>
              {t('تم حظر حسابك')}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#991b1b', margin: 0, fontFamily: 'inherit' }}>
              {t('تواصل مع الدعم إذا كنت تعتقد أن هذا خطأ')}
            </p>
          </div>
        )}
        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-muted)', borderRadius: 10, padding: 4 }}>
            {(['login', 'register'] as const).map(t2 => (
              <button key={t2} onClick={() => setTab(t2)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, background: tab === t2 ? 'var(--bg-card)' : 'transparent', color: tab === t2 ? currentTheme.primary : 'var(--text-muted)', boxShadow: tab === t2 ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t2 === 'login' ? t('تسجيل الدخول') : t('إنشاء حساب')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t('الاسم الكامل')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('البريد الإلكتروني')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
            <div style={{ position: 'relative' }}>
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder={t('كلمة المرور')} style={{ padding: '0.7rem 1rem', paddingLeft: '2.5rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {tab === 'register' && (
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder={t('تأكيد كلمة المرور')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
            )}
            {tab === 'login' && (
              <button type="button" onClick={() => { setForgotStep(true); setAuthError(''); }} style={{ background: 'none', border: 'none', color: currentTheme.primary, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', padding: 0 }}>
                {t('نسيت كلمة المرور؟')}
              </button>
            )}
            <button onClick={handleAuth} disabled={authLoading} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: authLoading ? 0.7 : 1 }}>
              {authLoading ? t('جاري...') : tab === 'login' ? t('دخول') : t('إنشاء حساب')}
            </button>
            {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center' }}>{authError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Personal Info Sub-View ───
  if (view === 'personal') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> {t('رجوع')}
        </button>
        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px', position: 'relative' }}>
              <User size={30} color="#fff" />
              <button style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: currentTheme.primary, border: '2px solid #fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Upload size={10} color="#fff" />
              </button>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('البيانات الشخصية')}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: t('الاسم الكامل'), type: 'text' },
              { key: 'email', label: t('البريد الإلكتروني'), type: 'email' },
              { key: 'phone', label: t('رقم الهاتف'), type: 'tel' },
              { key: 'country', label: t('الدولة'), type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={personalData[field.key as keyof typeof personalData]}
                  onChange={e => { setPersonalData(d => ({ ...d, [field.key]: e.target.value })); setPersonalSaved(false); }}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{t('كلمة المرور الجديدة')}</label>
              <input type="password" value={personalData.password} onChange={e => { setPersonalData(d => ({ ...d, password: e.target.value })); setPersonalSaved(false); }} placeholder={t('اتركه فارغاً إذا لم ترد تغييرها')} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSavePersonal} disabled={personalSaving} style={{
              padding: '0.75rem', borderRadius: btnR,
              background: personalSaved ? '#16a34a' : currentTheme.primary,
              color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.3s',
              opacity: personalSaving ? 0.75 : 1,
            }}>
              {personalSaved ? <><CheckCircle size={16} /> {t('تم الحفظ')}</> : <><Save size={16} /> {personalSaving ? t('جاري الحفظ...') : t('حفظ التغييرات')}</>}
            </button>
            {personalError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center' }}>{personalError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Wallet Sub-View ───
  if (view === 'wallet') {
    const displayBalance = profile.balance || '$0.00';
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> {t('رجوع')}
        </button>

        {/* Balance Card */}
        <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, borderRadius: 18, padding: '1.75rem', marginBottom: 20, color: '#fff' }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 4 }}>{t('رصيدك الحالي')}</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{displayBalance}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => setShowWalletModal(true)} style={{ padding: '0.55rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} /> {t('شحن رصيد')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: t('إجمالي الشحن'), value: `$${walletStats.totalDeposits.toFixed(2)}`, color: '#22c55e' },
            { label: t('إجمالي الشراء'), value: `$${walletStats.totalPurchases.toFixed(2)}`, color: '#f59e0b' },
            { label: t('المسترجع'), value: `$${walletStats.totalRefunded.toFixed(2)}`, color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '1rem 0.75rem', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{t('سجل العمليات')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '1rem 1.1rem', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tx.type}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.method}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.date}</span>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: tx.amount.startsWith('+') ? '#16a34a' : '#ef4444', direction: 'ltr' }}>{tx.amount}</p>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: tx.statusBg, color: tx.statusColor }}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>

        {showWalletModal && <WalletChargeModal onClose={() => setShowWalletModal(false)} onSubmitted={() => { loadProfile(); loadPayments(); }} />}
      </div>
    );
  }

  // ─── Security / Verification Sub-View ───
  if (view === 'security') {
    const statusConfig = {
      none: { bg: '#fffbeb', iconBg: '#fef3c7', iconColor: '#f59e0b', textColor: '#92400e', subColor: '#b45309', icon: <Clock size={20} color="#f59e0b" />, title: t('غير متحقق'), desc: t('يرجى رفع بطاقة هوية لتوثيق حسابك') },
      pending: { bg: '#eff6ff', iconBg: '#dbeafe', iconColor: '#3b82f6', textColor: '#1e40af', subColor: '#2563eb', icon: <Clock size={20} color="#3b82f6" />, title: t('قيد المراجعة'), desc: t('تم استلام وثيقتك وهي قيد المراجعة') },
      verified: { bg: '#f0fdf4', iconBg: '#dcfce7', iconColor: '#22c55e', textColor: '#166534', subColor: '#16a34a', icon: <CheckCircle size={20} color="#22c55e" />, title: t('تم التحقق ✓'), desc: t('تم التحقق من هويتك بنجاح') },
      rejected: { bg: '#fef2f2', iconBg: '#fee2e2', iconColor: '#ef4444', textColor: '#991b1b', subColor: '#dc2626', icon: <X size={20} color="#ef4444" />, title: t('مرفوض'), desc: verificationNote || t('تم رفض الوثيقة. يرجى إعادة رفع صورة واضحة.') },
    };
    const sc = statusConfig[verificationStatus] || statusConfig.none;
    const canUpload = verificationStatus === 'none' || verificationStatus === 'rejected';

    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> {t('رجوع')}
        </button>
        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '2rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color={currentTheme.primary} /> {t('التحقق من الهوية')}
          </h3>

          {/* Verification Status */}
          <div style={{ background: sc.bg, borderRadius: 14, padding: '1.25rem', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: sc.iconBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {sc.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: sc.textColor }}>{sc.title}</p>
              <p style={{ fontSize: '0.78rem', color: sc.subColor }}>{sc.desc}</p>
            </div>
          </div>

          {idUploadSuccess && (
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} color="#22c55e" />
              <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>{t('تم رفع الوثيقة بنجاح. سيتم مراجعتها قريباً.')}</span>
            </div>
          )}

          {/* Benefits */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>{t('مميزات التوثيق:')}</p>
            {[
              t('رفع حد السحب والشحن'),
              t('أولوية في معالجة الطلبات'),
              t('الوصول لعروض حصرية'),
              t('حماية إضافية للحساب'),
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CheckCircle size={14} color="#22c55e" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Upload ID - only if none or rejected */}
          {canUpload && (
            <>
              <input ref={idFileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { setIdUploadError(t('حجم الملف كبير جداً. الحد الأقصى 5MB')); return; }
                setIdDocFile(file);
                setIdUploadError('');
                setIdUploadSuccess(false);
                const reader = new FileReader();
                reader.onload = () => setIdDocPreview(reader.result as string);
                reader.readAsDataURL(file);
              }} />
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>{t('رفع صورة الهوية')}</p>
              <div onClick={() => idFileRef.current?.click()} style={{ border: '2px dashed var(--border-default)', borderRadius: 14, padding: idDocPreview ? '0.5rem' : '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.2s' }}>
                {idDocPreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={idDocPreview} alt="ID" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10, objectFit: 'contain' }} />
                    <button type="button" onClick={e => { e.stopPropagation(); setIdDocFile(null); setIdDocPreview(null); }} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                      <X size={12} color="#fff" />
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{idDocFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('اضغط لرفع صورة بطاقة الهوية')}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG — {t('حد أقصى')} 5MB</p>
                  </>
                )}
              </div>

              {idUploadError && (
                <p style={{ fontSize: '0.78rem', color: '#dc2626', marginBottom: 12, fontWeight: 600 }}>{idUploadError}</p>
              )}

              <button onClick={handleUploadIdentity} disabled={!idDocPreview || idUploading} style={{ width: '100%', padding: '0.75rem', borderRadius: btnR, background: !idDocPreview ? '#94a3b8' : currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: !idDocPreview || idUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: idUploading ? 0.7 : 1 }}>
                {idUploading ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> {t('جاري الرفع...')}</>
                ) : (
                  <><Send size={14} /> {t('إرسال للتوثيق')}</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Notifications View ───
  if (view === 'notifications') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <button onClick={() => setView('main')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'inherit', fontSize: '0.85rem' }}>
          <ArrowRight size={16} /> {t('رجوع')}
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>{t('الإشعارات')}</h2>

        {notifLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="spin" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
            <p>{t('جاري التحميل...')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Bell size={48} color="var(--text-muted)" style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('لا توجد إشعارات')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifUnread > 0 && (
              <button onClick={async () => { try { await storeApi.markNotificationRead('all'); loadNotifications(); } catch {} }} style={{ alignSelf: isRTL ? 'flex-start' : 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit', marginBottom: 4 }}>
                {t('تعيين الكل كمقروء')}
              </button>
            )}
            {notifications.map((n: any) => (
              <div key={n.id} onClick={async () => { if (!n.is_read) { try { await storeApi.markNotificationRead(n.id); loadNotifications(); } catch {} } }} style={{ padding: '0.85rem 1rem', background: n.is_read ? 'var(--bg-card)' : `${currentTheme.primary}08`, borderRadius: 12, border: `1px solid ${n.is_read ? 'var(--border-light)' : currentTheme.primary + '30'}`, cursor: n.is_read ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : currentTheme.primary, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: n.is_read ? 400 : 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.5 }}>{n.title}</p>
                    {n.message && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</p>}
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{new Date(n.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Settings View ───
  if (view === 'settings') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <button onClick={() => setView('main')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'inherit', fontSize: '0.85rem' }}>
          <ArrowRight size={16} /> {t('رجوع')}
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>{t('الإعدادات')}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Language */}
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#3b82f615', color: '#3b82f6', display: 'grid', placeItems: 'center' }}><Globe size={18} /></div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('اللغة')}</span>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{isRTL ? 'العربية' : 'English'}</span>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#8b5cf615', color: '#8b5cf6', display: 'grid', placeItems: 'center' }}><Bell size={18} /></div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('الإشعارات')}</span>
              </div>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: currentTheme.primary, padding: 2, cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: isRTL ? 'translateX(0)' : 'translateX(18px)', transition: 'transform 0.2s' }} />
              </div>
            </div>
          </div>

          {/* Account */}
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#06b6d415', color: '#06b6d4', display: 'grid', placeItems: 'center' }}><Shield size={18} /></div>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{t('حالة الحساب')}</span>
                  <span style={{ fontSize: '0.75rem', color: verificationStatus === 'verified' ? '#22c55e' : 'var(--text-muted)' }}>{verificationStatus === 'verified' ? t('متحقق ✓') : verificationStatus === 'pending' ? t('قيد المراجعة') : t('غير متحقق')}</span>
                </div>
              </div>
              <button onClick={() => setView('security')} style={{ fontSize: '0.78rem', color: currentTheme.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>{t('إدارة')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Menu (Demo-style: 8 items) ───
  const displayName = profile.name || personalData.name || t('مستخدم');
  const displayEmail = profile.email || personalData.email || '';
  const displayBalance = profile.balance || '$0.00';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Avatar & Name */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <User size={36} color="#fff" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{displayEmail}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '0.3rem 0.75rem', borderRadius: 20, background: verificationStatus === 'verified' ? '#f0fdf4' : verificationStatus === 'pending' ? '#eff6ff' : '#fffbeb', border: `1px solid ${verificationStatus === 'verified' ? '#bbf7d0' : verificationStatus === 'pending' ? '#bfdbfe' : '#fde68a'}` }}>
          {verificationStatus === 'verified' ? <CheckCircle size={12} color="#22c55e" /> : verificationStatus === 'pending' ? <Clock size={12} color="#3b82f6" /> : <Clock size={12} color="#f59e0b" />}
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: verificationStatus === 'verified' ? '#166534' : verificationStatus === 'pending' ? '#1e40af' : '#92400e' }}>{verificationStatus === 'verified' ? t('متحقق ✓') : verificationStatus === 'pending' ? t('قيد المراجعة') : t('غير متحقق')}</span>
        </div>
      </div>

      {/* Wallet */}
      <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, borderRadius: 16, padding: '1.5rem', marginBottom: 20, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>{t('رصيد المحفظة')}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>{displayBalance}</p>
          </div>
          <Wallet size={32} style={{ opacity: 0.3 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => setShowWalletModal(true)} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('شحن المحفظة')}
          </button>
          <button onClick={() => setView('wallet')} style={{ padding: '0.5rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('التفاصيل')}
          </button>
        </div>
      </div>

      {/* Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: <User size={18} />, label: t('البيانات الشخصية'), color: '#3b82f6', action: () => setView('personal') },
          { icon: <Wallet size={18} />, label: t('المحفظة والعمليات'), color: '#22c55e', action: () => setView('wallet') },
          { icon: <CreditCard size={18} />, label: t('شحن الرصيد'), color: '#f59e0b', action: () => setShowWalletModal(true) },
          { icon: <ShoppingCart size={18} />, label: t('طلباتي'), color: '#8b5cf6', action: () => router.push('/orders') },
          { icon: <Shield size={18} />, label: t('التحقق من الهوية'), color: '#06b6d4', action: () => setView('security') },
          { icon: <Bell size={18} />, label: t('الإشعارات'), color: '#8b5cf6', action: () => setView('notifications'), badge: notifUnread },
          { icon: <Settings size={18} />, label: t('الإعدادات'), color: '#64748b', action: () => setView('settings') },
          { icon: <LogOut size={18} />, label: t('تسجيل الخروج'), color: '#ef4444', action: handleLogout },
        ].map((item: any, i: number) => (
          <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', cursor: 'pointer', width: '100%', fontFamily: 'inherit', textAlign: isRTL ? 'right' : 'left', position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center', position: 'relative' }}>
              {item.icon}
              {item.badge > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'grid', placeItems: 'center', border: '2px solid var(--bg-card)' }}>{item.badge > 9 ? '9+' : item.badge}</span>}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: item.color === '#ef4444' ? '#ef4444' : 'var(--text-primary)', flex: 1 }}>{item.label}</span>
            <ChevronLeft size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>

      {showWalletModal && <WalletChargeModal onClose={() => setShowWalletModal(false)} onSubmitted={() => { loadProfile(); loadPayments(); }} />}
    </div>
  );
}
