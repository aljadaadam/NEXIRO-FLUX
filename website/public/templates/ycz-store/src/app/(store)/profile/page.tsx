'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, CreditCard, Shield, Wallet, Lock, Mail, Phone,
  CheckCircle, X, Upload, Send, Save, ChevronRight, ChevronLeft,
  ShoppingCart, Bell, Settings, LogOut, DollarSign, Clock
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';

// ─── WalletChargeModal (Real checkout flow: PayPal/Binance/USDT/Bank) ───
// ─── Gateway type → display info ───
const GATEWAY_ICONS: Record<string, { icon: string; color: string; desc: string }> = {
  binance: { icon: '₿', color: '#f0b90b', desc: 'USDT — Binance Pay' },
  paypal:  { icon: '💳', color: '#003087', desc: 'تحويل عبر PayPal' },
  bank_transfer: { icon: '🏦', color: '#059669', desc: 'حوالة بنكية مباشرة' },
  usdt:    { icon: '💚', color: '#26a17b', desc: 'USDT — تيثر' },
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
};

function WalletChargeModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted?: () => void }) {
  const { currentTheme, buttonRadius } = useTheme();
  // Steps: 1=amount+method, 2=processing/payment-details, 3=receipt(bank), 4=success
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutResult | null>(null);
  const [usdtChecking, setUsdtChecking] = useState(false);
  const [usdtCountdown, setUsdtCountdown] = useState(0);
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
    setSubmitting(true);
    setSubmitError('');
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '/profile';
      const result = await storeApi.initCheckout({
        gateway_id: selectedGw.id,
        amount: Number(amount),
        currency: 'USD',
        description: `شحن محفظة — $${amount}`,
        return_url: currentUrl,
        cancel_url: currentUrl,
      });
      setPaymentId(result.paymentId);
      setCheckoutData(result);

      // Handle based on payment method
      if (result.method === 'redirect' && result.redirectUrl && !result.redirectUrl.startsWith('#')) {
        // PayPal: redirect to payment page
        window.location.href = result.redirectUrl;
        return;
      }
      if (result.method === 'qr_or_redirect' && result.checkoutUrl && !result.checkoutUrl.startsWith('#')) {
        // Binance: open checkout in new tab, show waiting screen
        window.open(result.checkoutUrl, '_blank');
      }
      // For all methods: show step 2 with payment details
      setStep(2);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'فشل في بدء عملية الدفع');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Check USDT Payment ───
  const handleCheckUsdt = async () => {
    if (!paymentId) return;
    setUsdtChecking(true);
    try {
      const result = await storeApi.checkUsdtPayment(paymentId);
      if (result.confirmed) {
        setPaymentConfirmed(true);
        setStep(4);
        onSubmitted?.();
      } else {
        setSubmitError(result.message || 'لم يتم العثور على تحويل مطابق بعد');
        setTimeout(() => setSubmitError(''), 4000);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'فشل في التحقق');
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
        setSubmitError('الدفع لا يزال قيد الانتظار...');
        setTimeout(() => setSubmitError(''), 3000);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'فشل في التحقق');
    } finally {
      setUsdtChecking(false);
    }
  };

  // ─── Submit Bank Receipt ───
  const handleSubmitReceipt = async () => {
    if (!receipt || !paymentId) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await storeApi.uploadReceipt(paymentId, {
        receipt_url: 'receipt_uploaded',
        notes: `شحن محفظة — $${amount}`,
      });
      setStep(4);
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'فشل في رفع الإيصال');
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
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1020' }}>
            {step === 1 ? '💰 شحن المحفظة' : step === 2 ? '📋 إتمام الدفع' : step === 3 ? '📎 رفع الإيصال' : '✅ تم الإرسال'}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Amount + Method */}
        {step === 1 && (
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10, display: 'block' }}>المبلغ ($)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {presetAmounts.map(a => (
                <button key={a} onClick={() => setAmount(String(a))} style={{
                  padding: '0.5rem 1rem', borderRadius: 10, border: amount === String(a) ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: amount === String(a) ? `${currentTheme.primary}10` : '#f8fafc', color: amount === String(a) ? currentTheme.primary : '#64748b',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', minWidth: 48,
                }}>${a}</button>
              ))}
            </div>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="أو أدخل مبلغ مخصص" type="number" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.88rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10, display: 'block' }}>طريقة الدفع</label>
            {gatewaysLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>جاري تحميل بوابات الدفع...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : gateways.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fef2f2', borderRadius: 12 }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚠️</p>
                <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>لا توجد بوابات دفع مفعّلة حالياً</p>
                <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: 4 }}>تواصل مع الإدارة لتفعيل بوابات الدفع</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gateways.map(gw => {
                  const meta = GATEWAY_ICONS[gw.type] || { icon: '💳', color: '#64748b', desc: gw.type };
                  return (
                    <button key={gw.id} onClick={() => setMethod(gw.type)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem',
                      borderRadius: 12, cursor: 'pointer', width: '100%', fontFamily: 'Tajawal, sans-serif', textAlign: 'right',
                      border: method === gw.type ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                      background: method === gw.type ? `${currentTheme.primary}08` : '#fff',
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}15`, color: meta.color, display: 'grid', placeItems: 'center', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020' }}>{gw.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{meta.desc}</p>
                      </div>
                      {method === gw.type && <CheckCircle size={18} color={currentTheme.primary} />}
                      {gw.is_default && <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, background: '#dbeafe', color: '#2563eb', fontWeight: 700 }}>افتراضي</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginTop: 10 }}>{submitError}</p>}

            <button onClick={handleStartCheckout} disabled={!amount || !method || submitting} style={{
              width: '100%', marginTop: 20, padding: '0.75rem', borderRadius: btnR,
              background: amount && method && !submitting ? currentTheme.primary : '#e2e8f0', color: amount && method && !submitting ? '#fff' : '#94a3b8',
              border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: amount && method && !submitting ? 'pointer' : 'not-allowed',
              fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {submitting ? (
                <><div style={{ width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> جاري المعالجة...</>
              ) : (
                <>متابعة — ${amount || '0'}</>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Payment Details (from real checkout API) */}
        {step === 2 && checkoutData && (
          <div>
            {/* Amount banner */}
            <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, borderRadius: 14, padding: '1.25rem', marginBottom: 20, color: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>المبلغ المطلوب</p>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>${amount}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 4 }}>عبر {selectedGw?.name || method}</p>
            </div>

            {/* ── PayPal: redirect happened, show waiting ── */}
            {checkoutData.method === 'redirect' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#003087', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontSize: '1.8rem' }}>💳</span>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>تم توجيهك إلى PayPal</p>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>أكمل الدفع في صفحة PayPal ثم عد هنا</p>
                <button onClick={handleCheckStatus} disabled={usdtChecking} style={{
                  padding: '0.7rem 2rem', borderRadius: btnR, background: '#003087', color: '#fff',
                  border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  display: 'inline-flex', alignItems: 'center', gap: 6, opacity: usdtChecking ? 0.7 : 1,
                }}>
                  {usdtChecking ? 'جاري التحقق...' : '🔄 تحقق من حالة الدفع'}
                </button>
              </div>
            )}

            {/* ── Binance: QR code or redirect ── */}
            {checkoutData.method === 'qr_or_redirect' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fef9c3', borderRadius: 12, padding: '1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem' }}>₿</span>
                  <p style={{ fontSize: '0.82rem', color: '#854d0e', fontWeight: 600 }}>ادفع عبر Binance Pay</p>
                </div>
                {checkoutData.qrContent && (
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: 12, wordBreak: 'break-all' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 6 }}>رابط الدفع:</p>
                    <p style={{ fontSize: '0.78rem', color: '#0b1020', fontWeight: 600, fontFamily: 'monospace' }}>{checkoutData.qrContent}</p>
                  </div>
                )}
                {checkoutData.checkoutUrl && (
                  <a href={checkoutData.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.7rem 1.5rem', borderRadius: btnR,
                    background: '#f0b90b', color: '#000', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', marginBottom: 16, fontFamily: 'Tajawal, sans-serif',
                  }}>🔗 فتح صفحة الدفع</a>
                )}
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleCheckStatus} disabled={usdtChecking} style={{
                    width: '100%', padding: '0.7rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff',
                    border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                    opacity: usdtChecking ? 0.7 : 1,
                  }}>
                    {usdtChecking ? 'جاري التحقق...' : '🔄 تحقق من حالة الدفع'}
                  </button>
                </div>
              </div>
            )}

            {/* ── USDT: manual crypto with countdown ── */}
            {checkoutData.method === 'manual_crypto' && (
              <div>
                {/* Countdown */}
                {usdtCountdown > 0 && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10, background: usdtCountdown < 300 ? '#fef2f2' : '#f0fdf4' }}>
                      <Clock size={14} color={usdtCountdown < 300 ? '#ef4444' : '#16a34a'} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: usdtCountdown < 300 ? '#ef4444' : '#16a34a', fontFamily: 'monospace' }}>{formatTime(usdtCountdown)}</span>
                    </div>
                  </div>
                )}
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} color={currentTheme.primary} /> بيانات التحويل
                  </h4>
                  {[
                    { label: 'عنوان المحفظة', value: checkoutData.walletAddress || '—' },
                    { label: 'الشبكة', value: checkoutData.network || '—' },
                    { label: 'المبلغ', value: `${checkoutData.amount || amount} USDT` },
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020', direction: 'ltr', maxWidth: '60%', textAlign: 'left', wordBreak: 'break-all' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {checkoutData.instructions && (
                  <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>{typeof checkoutData.instructions === 'string' ? checkoutData.instructions : checkoutData.instructions?.ar || ''}</p>
                  </div>
                )}
                <button onClick={handleCheckUsdt} disabled={usdtChecking || usdtCountdown <= 0} style={{
                  width: '100%', padding: '0.75rem', borderRadius: btnR,
                  background: usdtChecking || usdtCountdown <= 0 ? '#e2e8f0' : '#26a17b', color: usdtChecking || usdtCountdown <= 0 ? '#94a3b8' : '#fff',
                  border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: usdtChecking ? 'not-allowed' : 'pointer',
                  fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {usdtChecking ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> جاري التحقق من البلوكتشين...</>
                  ) : usdtCountdown <= 0 ? 'انتهت المهلة' : '🔍 تحقق من الدفع'}
                </button>
              </div>
            )}

            {/* ── Bank Transfer: show details + go to receipt ── */}
            {checkoutData.method === 'manual_bank' && (
              <div>
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} color={currentTheme.primary} /> بيانات التحويل
                  </h4>
                  {[
                    ...(checkoutData.bankDetails?.bank_name ? [{ label: 'البنك', value: checkoutData.bankDetails.bank_name }] : []),
                    ...(checkoutData.bankDetails?.account_holder ? [{ label: 'اسم الحساب', value: checkoutData.bankDetails.account_holder }] : []),
                    ...(checkoutData.bankDetails?.iban ? [{ label: 'IBAN', value: checkoutData.bankDetails.iban }] : []),
                    ...(checkoutData.bankDetails?.swift ? [{ label: 'SWIFT', value: checkoutData.bankDetails.swift }] : []),
                    ...(checkoutData.bankDetails?.currency ? [{ label: 'العملة', value: checkoutData.bankDetails.currency }] : []),
                    ...(checkoutData.referenceId ? [{ label: 'رقم المرجع', value: checkoutData.referenceId }] : []),
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020', direction: 'ltr', maxWidth: '60%', textAlign: 'left', wordBreak: 'break-all' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>
                    {typeof checkoutData.instructions === 'object' && checkoutData.instructions !== null
                      ? checkoutData.instructions.ar
                      : 'تأكد من إرسال المبلغ الصحيح. بعد التحويل أرفق إيصال الدفع للتأكيد.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setStep(1); setCheckoutData(null); }} style={{ flex: 1, padding: '0.7rem', borderRadius: btnR, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>رجوع</button>
                  <button onClick={() => setStep(3)} style={{ flex: 2, padding: '0.7rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Upload size={14} /> رفع الإيصال
                  </button>
                </div>
              </div>
            )}

            {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginTop: 10 }}>{submitError}</p>}

            {/* Back button for non-bank methods */}
            {checkoutData.method !== 'manual_bank' && (
              <button onClick={() => { setStep(1); setCheckoutData(null); setSubmitError(''); }} style={{
                width: '100%', marginTop: 12, padding: '0.6rem', borderRadius: btnR, background: '#f1f5f9',
                color: '#64748b', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>← رجوع</button>
            )}
          </div>
        )}

        {/* Step 3: Upload Receipt (bank_transfer only) */}
        {step === 3 && (
          <div>
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: 16, padding: '2.5rem 1rem', textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: receipt ? '#f0fdf4' : '#fafafa' }} onClick={() => setReceipt(true)}>
              {receipt ? (
                <>
                  <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>تم رفع الإيصال بنجاح</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>receipt_2026.jpg</p>
                </>
              ) : (
                <>
                  <Upload size={36} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>اضغط لرفع صورة الإيصال</p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>JPG, PNG — حد أقصى 5MB</p>
                </>
              )}
            </div>

            <input placeholder="ملاحظات إضافية (اختياري)" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

            {submitError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginBottom: 10 }}>{submitError}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.7rem', borderRadius: btnR, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>رجوع</button>
              <button onClick={handleSubmitReceipt} disabled={!receipt || submitting} style={{
                flex: 2, padding: '0.7rem', borderRadius: btnR,
                background: receipt && !submitting ? currentTheme.primary : '#e2e8f0', color: receipt && !submitting ? '#fff' : '#94a3b8',
                border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: receipt ? 'pointer' : 'not-allowed',
                fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}><Send size={14} /> {submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}</button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>
              {paymentConfirmed ? 'تم تأكيد الدفع!' : 'تم إرسال طلب الشحن!'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 6 }}>
              {paymentConfirmed
                ? 'تم تأكيد الدفع وإضافة الرصيد لمحفظتك.'
                : 'سيتم مراجعة الإيصال وإضافة الرصيد لمحفظتك خلال دقائق.'}
            </p>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: 10, background: '#f0f9ff', marginBottom: 20 }}>
              <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>رقم العملية: {paymentId ? `#PAY-${paymentId}` : '—'}</span>
            </div>
            <br />
            <button onClick={onClose} style={{ padding: '0.7rem 2.5rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>حسناً</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── صفحة الملف الشخصي (Demo-style) ───
export default function ProfilePage() {
  const router = useRouter();
  const { currentTheme, buttonRadius } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState('login');
  const [view, setView] = useState('menu');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [personalData, setPersonalData] = useState({ name: '', email: '', phone: '', country: '', password: '' });
  const [personalSaved, setPersonalSaved] = useState(false);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalError, setPersonalError] = useState('');
  const [profile, setProfile] = useState<{ name: string; email: string; phone?: string; balance?: string }>({ name: '', email: '' });
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [transactions, setTransactions] = useState<{ id: string; type: string; amount: string; method: string; date: string; status: string; statusColor: string; statusBg: string }[]>([]);

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
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      setIsLoggedIn(true);
      loadProfile();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && view === 'wallet') {
      loadPayments();
    }
  }, [isLoggedIn, view]);

  async function loadProfile() {
    try {
      const res = await storeApi.getProfile();
      const customer = res?.customer || res?.user || res;
      if (customer) {
        const walletBalance = Number(customer.wallet_balance ?? customer.balance ?? customer.wallet?.balance ?? 0);
        setProfile({
          name: customer.name || customer.username || '',
          email: customer.email || '',
          phone: customer.phone || '',
          balance: `$${walletBalance.toFixed(2)}`,
        });
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
      console.error('[Profile] فشل جلب الملف الشخصي:', err?.message);
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

      const mapped = payments.map((p: any) => {
        const type = String(p.type || '').toLowerCase();
        const status = String(p.status || 'pending').toLowerCase();
        const amountNum = Number(p.amount || 0);

        const signedAmount = type === 'purchase' ? -Math.abs(amountNum) : Math.abs(amountNum);
        const amount = `${signedAmount >= 0 ? '+' : '-'}$${Math.abs(signedAmount).toFixed(2)}`;

        const statusMap: Record<string, { label: string; color: string; bg: string }> = {
          completed: { label: 'مكتمل', color: '#16a34a', bg: '#dcfce7' },
          pending: { label: 'قيد المراجعة', color: '#f59e0b', bg: '#fffbeb' },
          failed: { label: 'فشل', color: '#ef4444', bg: '#fee2e2' },
          refunded: { label: 'مسترجع', color: '#2563eb', bg: '#dbeafe' },
          cancelled: { label: 'ملغي', color: '#64748b', bg: '#f1f5f9' },
        };

        const s = statusMap[status] || statusMap.pending;
        const createdAt = p.created_at ? new Date(p.created_at) : null;
        const date = createdAt ? createdAt.toLocaleString() : '';

        return {
          id: `#PAY-${p.id}`,
          type: type === 'deposit' ? 'شحن محفظة' : type === 'purchase' ? 'شراء' : 'عملية',
          amount,
          method: String(p.payment_method || ''),
          date,
          status: s.label,
          statusColor: s.color,
          statusBg: s.bg,
        };
      });

      setTransactions(mapped);
    } catch { /* ignore */ }
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
      setPersonalError(err?.message || 'فشل حفظ البيانات. تأكد من تسجيل الدخول.');
      setPersonalSaved(false);
    } finally {
      setPersonalSaving(false);
    }
  }

  async function handleAuth() {
    setAuthLoading(true);
    setAuthError('');
    try {
      let res;
      if (tab === 'login') {
        res = await storeApi.login({ email, password });
      } else {
        res = await storeApi.register({ name, email, password });
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
        setAuthError('حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'فشل الاتصال بالخادم');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setProfile({ name: '', email: '' });
    setView('menu');
  }

  // ─── Login / Register (Demo-style tabs) ───
  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
            {(['login', 'register'] as const).map(t2 => (
              <button key={t2} onClick={() => setTab(t2)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.85rem', fontWeight: 600, background: tab === t2 ? '#fff' : 'transparent', color: tab === t2 ? currentTheme.primary : '#94a3b8', boxShadow: tab === t2 ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t2 === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="كلمة المرور" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <button onClick={handleAuth} disabled={authLoading} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: authLoading ? 0.7 : 1 }}>
              {authLoading ? 'جاري...' : tab === 'login' ? 'دخول' : 'إنشاء حساب'}
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
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px', position: 'relative' }}>
              <User size={30} color="#fff" />
              <button style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: currentTheme.primary, border: '2px solid #fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Upload size={10} color="#fff" />
              </button>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>البيانات الشخصية</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'الاسم الكامل', type: 'text' },
              { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
              { key: 'phone', label: 'رقم الهاتف', type: 'tel' },
              { key: 'country', label: 'الدولة', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={personalData[field.key as keyof typeof personalData]}
                  onChange={e => { setPersonalData(d => ({ ...d, [field.key]: e.target.value })); setPersonalSaved(false); }}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>كلمة المرور الجديدة</label>
              <input type="password" value={personalData.password} onChange={e => { setPersonalData(d => ({ ...d, password: e.target.value })); setPersonalSaved(false); }} placeholder="اتركه فارغاً إذا لم ترد تغييرها" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSavePersonal} disabled={personalSaving} style={{
              padding: '0.75rem', borderRadius: btnR,
              background: personalSaved ? '#16a34a' : currentTheme.primary,
              color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.3s',
              opacity: personalSaving ? 0.75 : 1,
            }}>
              {personalSaved ? <><CheckCircle size={16} /> تم الحفظ</> : <><Save size={16} /> {personalSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</>}
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
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>

        {/* Balance Card */}
        <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, borderRadius: 18, padding: '1.75rem', marginBottom: 20, color: '#fff' }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 4 }}>رصيدك الحالي</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{displayBalance}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => setShowWalletModal(true)} style={{ padding: '0.55rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} /> شحن رصيد
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'إجمالي الشحن', value: '$0.00', color: '#22c55e' },
            { label: 'إجمالي الشراء', value: '$0.00', color: '#f59e0b' },
            { label: 'المسترجع', value: '$0.00', color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '1rem 0.75rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 12 }}>سجل العمليات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.1rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{tx.type}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{tx.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.method}</span>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.date}</span>
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
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color={currentTheme.primary} /> التحقق من الهوية
          </h3>

          {/* Verification Status */}
          <div style={{ background: '#fffbeb', borderRadius: 14, padding: '1.25rem', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>غير متحقق</p>
              <p style={{ fontSize: '0.78rem', color: '#b45309' }}>يرجى رفع بطاقة هوية لتوثيق حسابك</p>
            </div>
          </div>

          {/* Benefits */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>مميزات التوثيق:</p>
            {[
              'رفع حد السحب والشحن',
              'أولوية في معالجة الطلبات',
              'الوصول لعروض حصرية',
              'حماية إضافية للحساب',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CheckCircle size={14} color="#22c55e" />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Upload ID */}
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>رفع صورة الهوية</p>
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <Upload size={28} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>اضغط لرفع صورة بطاقة الهوية</p>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: 4 }}>JPG, PNG — حد أقصى 5MB</p>
          </div>

          <button style={{ width: '100%', padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Send size={14} /> إرسال للتوثيق
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Menu (Demo-style: 8 items) ───
  const displayName = profile.name || personalData.name || 'مستخدم';
  const displayEmail = profile.email || personalData.email || '';
  const displayBalance = profile.balance || '$0.00';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Avatar & Name */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <User size={36} color="#fff" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1020' }}>{displayName}</h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{displayEmail}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '0.3rem 0.75rem', borderRadius: 20, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <Clock size={12} color="#f59e0b" />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#92400e' }}>غير متحقق</span>
        </div>
      </div>

      {/* Wallet */}
      <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, borderRadius: 16, padding: '1.5rem', marginBottom: 20, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>رصيد المحفظة</p>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>{displayBalance}</p>
          </div>
          <Wallet size={32} style={{ opacity: 0.3 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => setShowWalletModal(true)} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            شحن المحفظة
          </button>
          <button onClick={() => setView('wallet')} style={{ padding: '0.5rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            التفاصيل
          </button>
        </div>
      </div>

      {/* Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: <User size={18} />, label: 'البيانات الشخصية', color: '#3b82f6', action: () => setView('personal') },
          { icon: <Wallet size={18} />, label: 'المحفظة والعمليات', color: '#22c55e', action: () => setView('wallet') },
          { icon: <CreditCard size={18} />, label: 'شحن الرصيد', color: '#f59e0b', action: () => setShowWalletModal(true) },
          { icon: <ShoppingCart size={18} />, label: 'طلباتي', color: '#8b5cf6', action: () => router.push('/orders') },
          { icon: <Shield size={18} />, label: 'التحقق من الهوية', color: '#06b6d4', action: () => setView('security') },
          { icon: <Bell size={18} />, label: 'الإشعارات', color: '#8b5cf6', action: () => {} },
          { icon: <Settings size={18} />, label: 'الإعدادات', color: '#64748b', action: () => {} },
          { icon: <LogOut size={18} />, label: 'تسجيل الخروج', color: '#ef4444', action: handleLogout },
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', cursor: 'pointer', width: '100%', fontFamily: 'Tajawal, sans-serif', textAlign: 'right' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center' }}>{item.icon}</div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: item.color === '#ef4444' ? '#ef4444' : '#0b1020', flex: 1 }}>{item.label}</span>
            <ChevronLeft size={16} color="#cbd5e1" />
          </button>
        ))}
      </div>

      {showWalletModal && <WalletChargeModal onClose={() => setShowWalletModal(false)} onSubmitted={() => { loadProfile(); loadPayments(); }} />}
    </div>
  );
}
