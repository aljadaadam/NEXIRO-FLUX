import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, Landmark, Bitcoin, Wallet, Loader2, CheckCircle2,
  XCircle, Clock, Copy, ExternalLink, ArrowRight, Shield, Key,
  Globe, RefreshCw, Upload, AlertCircle, ChevronLeft, QrCode, Sparkles, Check,
  CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { templates as staticTemplates } from '../data/templates';
import ReservationModal from '../components/common/ReservationModal';

const gatewayIcons = {
  paypal: Wallet,
  bank_transfer: Landmark,
  usdt: Bitcoin,
  binance: CreditCard,
};

const gatewayColors = {
  paypal: 'from-blue-500 to-blue-600',
  bank_transfer: 'from-emerald-500 to-emerald-600',
  usdt: 'from-green-500 to-teal-600',
  binance: 'from-yellow-500 to-orange-500',
};

const planLabels = {
  monthly: { ar: 'شهري', en: 'Monthly' },
  yearly: { ar: 'سنوي', en: 'Yearly' },
  lifetime: { ar: 'مدى الحياة', en: 'Lifetime' },
};

export default function TemplateBuyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const templateId = params.get('template') || 'digital-services-store';
  const plan = params.get('plan') || 'monthly';

  // Start with static data, then override with API data
  const [template, setTemplate] = useState(() => staticTemplates.find(t => t.id === templateId));

  // Fetch live prices from API (same logic as TemplatePreviewPage)
  useEffect(() => {
    let cancelled = false;
    api.getPublicProducts()
      .then(res => {
        if (cancelled) return;
        const staticT = staticTemplates.find(tp => tp.id === templateId);
        const apiByName = new Map((res.products || []).map(p => [p.name?.trim(), p]));
        const live = staticT ? apiByName.get(staticT.name?.trim()) : null;
        if (live && staticT) {
          const p = parseFloat(live.price);
          const py = live.price_yearly != null ? parseFloat(live.price_yearly) : (p ? p * 10 : null);
          const pl = live.price_lifetime != null ? parseFloat(live.price_lifetime) : (p ? p * 25 : null);
          setTemplate({
            ...staticT,
            _apiId: live.id,
            name: live.name || staticT.name,
            description: live.description || staticT.description,
            price: p ? { monthly: p, yearly: py, lifetime: pl } : staticT.price,
            image: live.image || staticT.image,
          });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [templateId]);

  const templateName = isRTL ? (template?.name || templateId) : (template?.nameEn || templateId);
  const price = template?.price?.[plan] || 0;
  const planLabel = isRTL ? planLabels[plan]?.ar : planLabels[plan]?.en;

  // ─── State ───
  const [step, setStep] = useState('select'); // select | paying | done
  const [paymentMode, setPaymentMode] = useState(''); // '' | 'code' | 'gateway'

  // Purchase code
  const [purchaseCode, setPurchaseCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeInfo, setCodeInfo] = useState(null);

  // Gateways
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState('');
  const [checking, setChecking] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [usdtExpired, setUsdtExpired] = useState(false);
  const [usdtTimeLeft, setUsdtTimeLeft] = useState(null); // seconds remaining
  const [usdtSubStep, setUsdtSubStep] = useState(1); // 1=send, 2=verify
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [showReservation, setShowReservation] = useState(false);

  // Country detection
  const [country, setCountry] = useState(null);
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setCountry(d.country_code))
      .catch(() => setCountry(''));
  }, []);

  // Load gateways
  const fetchGateways = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getEnabledPaymentGateways(country);
      setGateways(data.gateways || []);
    } catch {
      setGateways([]);
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    if (country !== null) fetchGateways();
  }, [country, fetchGateways]);

  // ─── Detect return from PayPal / Binance redirect ───
  useEffect(() => {
    const paymentStatus = params.get('payment_status');
    const pid = params.get('payment_id');
    const returnedGateway = params.get('gateway');

    if (paymentStatus === 'success' && pid) {
      // Payment successful — store in localStorage for dashboard fallback
      try {
        localStorage.setItem('nexiro_pending_setup', JSON.stringify({
          payment_id: pid, template_id: templateId, plan, paid_at: new Date().toISOString(),
        }));
      } catch(e) {}
      navigate(`/setup?template=${templateId}&plan=${plan}&payment_ref=${pid}&payment_status=success&gateway=${returnedGateway || 'gateway'}`, { replace: true });
    } else if (paymentStatus === 'cancelled') {
      setError(isRTL ? 'تم إلغاء عملية الدفع' : 'Payment was cancelled');
    } else if (paymentStatus === 'failed') {
      setError(isRTL ? 'فشلت عملية الدفع' : 'Payment failed');
    } else if (returnedGateway === 'binance' && pid) {
      // Check Binance payment status
      setProcessing(true);
      api.checkPaymentStatusPublic(pid)
        .then(res => {
          if (res.status === 'completed' || res.status === 'paid') {
            navigate(`/setup?template=${templateId}&plan=${plan}&payment_ref=${pid}&payment_status=success&gateway=binance`, { replace: true });
          } else {
            setError(isRTL ? 'لم يتم تأكيد الدفع بعد' : 'Payment not confirmed yet');
          }
        })
        .catch(() => setError(isRTL ? 'فشل التحقق من الدفع' : 'Payment check failed'))
        .finally(() => setProcessing(false));
    }
  }, [params, navigate, templateId, plan, isRTL]);

  // ─── USDT Countdown Timer ───
  useEffect(() => {
    if (usdtTimeLeft === null || usdtTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setUsdtTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setUsdtExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [usdtTimeLeft]);

  // Copy to clipboard
  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // ─── Validate Purchase Code ───
  const handleValidateCode = async () => {
    if (!purchaseCode.trim()) {
      setError(isRTL ? 'يرجى إدخال كود الشراء' : 'Please enter a purchase code');
      return;
    }
    setCodeLoading(true);
    setError(null);
    try {
      const res = await api.validatePurchaseCode(purchaseCode.trim().toUpperCase(), templateId);
      setCodeVerified(true);
      setCodeInfo(res);
      // After code verified, go directly to setup
      const code = purchaseCode.trim().toUpperCase();
      try {
        localStorage.setItem('nexiro_pending_setup', JSON.stringify({
          payment_id: `CODE-${code}`,
          template_id: templateId,
          plan: res.billing_cycle || plan,
          paid_at: new Date().toISOString(),
          method: 'purchase_code',
        }));
      } catch(e) {}
      setTimeout(() => {
        navigate(`/setup?template=${templateId}&plan=${res.billing_cycle || plan}&purchase_code=${code}&payment_status=success`);
      }, 1200);
    } catch (err) {
      setError(err.error || err.errorEn || (isRTL ? 'كود غير صالح' : 'Invalid code'));
    } finally {
      setCodeLoading(false);
    }
  };

  // ─── Start Gateway Payment ───
  const handlePay = async () => {
    if (!selectedGateway) return;
    setError(null);
    setProcessing(true);

    try {
      const currentUrl = window.location.origin + `/buy?template=${templateId}&plan=${plan}`;
      const gwLabel = selectedGateway.type;
      const returnUrl = `${currentUrl}&gateway=${gwLabel}`;

      const result = await api.initCheckout({
        gateway_id: selectedGateway.id,
        amount: price,
        currency: selectedGateway.type === 'binance' ? 'USDT' : 'USD',
        description: `${templateName} - ${planLabel}`,
        template_id: templateId,
        plan: plan,
        customer_email: user?.email || null,
        customer_name: user?.name || null,
        return_url: selectedGateway.type === 'binance' ? `${returnUrl}&payment_id=__PAYMENT_ID__` : returnUrl,
        cancel_url: `${returnUrl}&payment_status=cancelled`,
      });

      setPaymentId(result.paymentId);
      setPaymentResult(result);

      // PayPal → redirect
      if (result.method === 'redirect' && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      // Binance → redirect or show QR
      if (result.method === 'qr_or_redirect' && result.checkoutUrl) {
        setStep('paying');
      }

      // USDT → show wallet + start countdown
      if (result.method === 'manual_crypto') {
        const expiresIn = result.expires_in || 1800; // 30 min default
        setUsdtTimeLeft(expiresIn);
        setUsdtExpired(false);
        setUsdtSubStep(1);
        setUsdtTxHash('');
        setStep('paying');
      }

      // Bank → show details
      if (result.method === 'manual_bank') {
        setStep('paying');
      }
    } catch (err) {
      setError(err.error || err.message || (isRTL ? 'فشل في بدء الدفع' : 'Payment failed'));
    } finally {
      setProcessing(false);
    }
  };

  // ─── Check USDT ───
  const handleCheckUsdt = async () => {
    if (!paymentId || usdtExpired) return;
    // BEP20/ERC20: require tx hash
    const network = paymentResult?.network;
    const needsTxHash = network === 'BEP20' || network === 'ERC20';
    if (needsTxHash && !usdtTxHash.trim()) {
      setError(isRTL ? 'يرجى إدخال هاش المعاملة (Transaction Hash)' : 'Please enter the Transaction Hash');
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const result = await api.checkUsdtPayment(paymentId, needsTxHash ? usdtTxHash.trim() : undefined);
      if (result.confirmed) {
        try { localStorage.setItem('nexiro_pending_setup', JSON.stringify({ payment_id: paymentId, template_id: templateId, plan, paid_at: new Date().toISOString() })); } catch(e) {}
        navigate(`/setup?template=${templateId}&plan=${plan}&payment_ref=${paymentId}&payment_status=success&gateway=usdt`);
      } else {
        if (result.remaining !== undefined) {
          setUsdtTimeLeft(result.remaining);
        }
        setError(isRTL ? 'لم يتم العثور على تحويل مطابق بعد. حاول خلال دقائق.' : 'No matching transfer found yet. Try again in a few minutes.');
      }
    } catch (err) {
      if (err.expired) {
        setUsdtExpired(true);
        setUsdtTimeLeft(0);
        setError(isRTL ? 'انتهت مهلة الدفع (30 دقيقة). أنشئ عملية دفع جديدة' : 'Payment expired (30 minutes). Please create a new payment');
      } else {
        setError(err.error || err.message);
      }
    } finally {
      setChecking(false);
    }
  };

  // ─── Upload Receipt ───
  const handleUploadReceipt = async () => {
    if (!receiptUrl.trim()) {
      setError(isRTL ? 'يرجى إدخال رابط الإيصال' : 'Please enter receipt URL');
      return;
    }
    setUploadingReceipt(true);
    setError(null);
    try {
      await api.uploadBankReceipt(paymentId, { receipt_url: receiptUrl, notes: receiptNotes });
      // Bank transfer = pending, go to setup with pending status
      navigate(`/setup?template=${templateId}&plan=${plan}&payment_ref=${paymentId}&payment_status=pending&gateway=bank_transfer`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };

  // ─── Check Binance ───
  const handleCheckBinance = async () => {
    if (!paymentId) return;
    setChecking(true);
    setError(null);
    try {
      const result = await api.checkPaymentStatusPublic(paymentId);
      if (result.status === 'completed') {
        try { localStorage.setItem('nexiro_pending_setup', JSON.stringify({ payment_id: paymentId, template_id: templateId, plan, paid_at: new Date().toISOString() })); } catch(e) {}
        navigate(`/setup?template=${templateId}&plan=${plan}&payment_ref=${paymentId}&payment_status=success&gateway=binance`);
      } else {
        setError(isRTL ? 'لم يتم تأكيد الدفع بعد' : 'Payment not confirmed yet');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  // ─── No template found ───
  if (!template) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{isRTL ? 'القالب غير موجود' : 'Template not found'}</h1>
          <Link to="/templates" className="text-primary-400 hover:underline">{isRTL ? 'تصفح القوالب' : 'Browse templates'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl">
        {/* Back */}
        <Link to={`/template/${templateId}`} className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {isRTL ? 'العودة للقالب' : 'Back to Template'}
        </Link>

        {/* Main Card */}
        <div className="bg-[#0d1221] border border-white/10 rounded-2xl overflow-hidden">

          {/* ═══ Header — Order Summary ═══ */}
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{templateName}</h1>
                <p className="text-dark-400 text-sm">{planLabel}</p>
              </div>
              <div className="text-end flex-shrink-0">
                <div className="text-3xl font-display font-black text-white">${price}</div>
                <p className="text-dark-500 text-xs">{isRTL ? 'دولار أمريكي' : 'USD'}</p>
              </div>
            </div>
          </div>

          {/* ═══ Step: Select Payment Method ═══ */}
          {step === 'select' && (
            <div className="p-6 space-y-6">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-300">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Purchase Code Section ── */}
              <div>
                <button
                  onClick={() => { setPaymentMode(paymentMode === 'code' ? '' : 'code'); setError(null); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMode === 'code'
                      ? 'border-primary-500/50 bg-primary-500/5 shadow-lg shadow-primary-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center`}>
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-start">
                    <h3 className="text-white font-medium text-sm">{isRTL ? 'كود الشراء' : 'Purchase Code'}</h3>
                    <p className="text-dark-500 text-xs">{isRTL ? 'أدخل كود الشراء للتفعيل المباشر' : 'Enter your purchase code for instant activation'}</p>
                  </div>
                  {codeVerified && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </button>

                {paymentMode === 'code' && (
                  <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={purchaseCode}
                        onChange={e => setPurchaseCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleValidateCode()}
                        placeholder={isRTL ? 'أدخل كود الشراء...' : 'Enter purchase code...'}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 font-mono tracking-wider"
                        dir="ltr"
                        disabled={codeVerified}
                      />
                      <button
                        onClick={handleValidateCode}
                        disabled={codeLoading || codeVerified || !purchaseCode.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                      >
                        {codeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : codeVerified ? <CheckCircle2 className="w-4 h-4" /> : null}
                        {codeVerified ? (isRTL ? 'تم التحقق ✓' : 'Verified ✓') : (isRTL ? 'تحقق' : 'Verify')}
                      </button>
                    </div>
                    {codeVerified && codeInfo && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isRTL ? 'كود صالح! جاري التحويل لإعداد الموقع...' : 'Valid code! Redirecting to setup...'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-dark-500 text-xs font-medium">{isRTL ? 'أو ادفع عبر' : 'Or pay via'}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* ── Gateway Selection ── */}
              <div>
                <h3 className="text-sm font-medium text-dark-300 mb-3">{isRTL ? 'اختر طريقة الدفع' : 'Choose Payment Method'}</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : gateways.length === 0 ? (
                  <div className="text-center py-6 text-dark-500 text-sm">
                    {isRTL ? 'لا توجد بوابات دفع متاحة حالياً' : 'No payment gateways available'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gateways.map(gw => {
                      const Icon = gatewayIcons[gw.type] || CreditCard;
                      const color = gatewayColors[gw.type] || 'from-gray-500 to-gray-600';
                      const isSelected = selectedGateway?.id === gw.id;
                      return (
                        <button
                          key={gw.id}
                          onClick={() => {
                            setSelectedGateway(gw);
                            setPaymentMode('gateway');
                            setError(null);
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-primary-500/50 bg-primary-500/5 shadow-lg shadow-primary-500/5'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-start">
                            <h3 className="text-white font-medium text-sm">{isRTL ? gw.name : (gw.name_en || gw.name)}</h3>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Pay Button ── */}
              {paymentMode === 'gateway' && selectedGateway && (
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-base hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      {isRTL ? `ادفع $${price}` : `Pay $${price}`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {/* ── Features reminder ── */}
              <div className="pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-3 text-xs text-dark-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    {isRTL ? 'دفع آمن ومشفر' : 'Secure payment'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary-400" />
                    {isRTL ? 'تفعيل فوري' : 'Instant activation'}
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    {isRTL ? '14 يوم تجربة مجانية' : '14-day free trial'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    {isRTL ? 'ضمان استرداد' : 'Money-back guarantee'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step: Paying (Binance / USDT / Bank) ═══ */}
          {step === 'paying' && paymentResult && (
            <div className="p-6 space-y-5">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Binance Pay */}
              {paymentResult.method === 'qr_or_redirect' && (
                <>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{isRTL ? 'الدفع عبر Binance Pay' : 'Pay with Binance Pay'}</h3>
                    <p className="text-dark-400 text-sm">
                      {isRTL ? 'افتح تطبيق Binance واكمل الدفع' : 'Open Binance app and complete payment'}
                    </p>
                    <a
                      href={paymentResult.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isRTL ? 'فتح Binance Pay' : 'Open Binance Pay'}
                    </a>
                  </div>
                  <button
                    onClick={handleCheckBinance}
                    disabled={checking}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isRTL ? 'تحقق من الدفع' : 'Verify Payment'}
                  </button>
                </>
              )}

              {/* USDT */}
              {paymentResult.method === 'manual_crypto' && (
                <>
                  {usdtExpired ? (
                    /* ═══ Expired State ═══ */
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {isRTL ? 'انتهت مهلة الدفع' : 'Payment Expired'}
                        </h3>
                        <p className="text-dark-400 text-sm">
                          {isRTL ? 'انتهت صلاحية عملية الدفع (30 دقيقة). يرجى إنشاء عملية جديدة' : 'Payment session expired (30 minutes). Please start a new payment'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setStep('select');
                          setPaymentResult(null);
                          setPaymentId(null);
                          setUsdtExpired(false);
                          setUsdtTimeLeft(null);
                          setUsdtSubStep(1);
                          setUsdtTxHash('');
                          setError(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {isRTL ? 'إنشاء دفعة جديدة' : 'Create New Payment'}
                      </button>
                    </div>
                  ) : (
                    /* ═══ Active Payment ═══ */
                    <>
                      {/* Step indicator + Timer */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold ${usdtSubStep >= 1 ? 'bg-green-500 text-white' : 'bg-white/10 text-dark-500'}`}>1</div>
                            <span className={`text-xs ${usdtSubStep === 1 ? 'text-white font-semibold' : 'text-dark-500'}`}>{isRTL ? 'إرسال' : 'Send'}</span>
                          </div>
                          <div className="w-5 h-px bg-white/10" />
                          <div className="flex items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold ${usdtSubStep === 2 ? 'bg-green-500 text-white' : 'bg-white/10 text-dark-500'}`}>2</div>
                            <span className={`text-xs ${usdtSubStep === 2 ? 'text-white font-semibold' : 'text-dark-500'}`}>{isRTL ? 'تحقق' : 'Verify'}</span>
                          </div>
                        </div>
                        {usdtTimeLeft !== null && usdtTimeLeft > 0 && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${
                            usdtTimeLeft <= 300
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {Math.floor(usdtTimeLeft / 60).toString().padStart(2, '0')}:{(usdtTimeLeft % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>

                      {/* ── Sub-Step 1: Send ── */}
                      {usdtSubStep === 1 && (
                        <>
                          {/* Amount card */}
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-5 text-center text-white">
                            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10" />
                            <p className="text-xs opacity-80 mb-1">{isRTL ? 'أرسل بالضبط' : 'Send Exactly'}</p>
                            <p className="text-3xl font-extrabold font-mono tracking-wide">{paymentResult.amount} <span className="text-base font-semibold opacity-90">USDT</span></p>
                            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-white/15 text-xs">
                              <Globe className="w-3 h-3" />
                              {paymentResult.network}
                            </div>
                          </div>

                          {/* QR + Address */}
                          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                              {/* QR Code */}
                              {paymentResult.walletAddress && (
                                <div className="flex-shrink-0 bg-white rounded-xl p-2">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(paymentResult.walletAddress)}`}
                                    alt="QR Code"
                                    className="w-[100px] h-[100px]"
                                  />
                                </div>
                              )}
                              {/* Address */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-dark-500 text-xs">{isRTL ? 'عنوان المحفظة' : 'Wallet Address'}</span>
                                  <button onClick={() => copyText(paymentResult.walletAddress, 'wallet')} className="text-dark-500 hover:text-white transition-colors">
                                    {copied === 'wallet' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <p className="text-white text-xs font-mono break-all bg-white/5 rounded-lg p-2.5 leading-relaxed">{paymentResult.walletAddress}</p>
                              </div>
                            </div>
                          </div>

                          {/* Warning */}
                          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{isRTL ? paymentResult.instructions?.ar : paymentResult.instructions?.en}</span>
                          </div>

                          {/* Next button */}
                          <button
                            onClick={() => setUsdtSubStep(2)}
                            disabled={usdtTimeLeft <= 0}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isRTL ? 'أرسلت المبلغ — التالي' : "I've Sent — Next"}
                          </button>
                        </>
                      )}

                      {/* ── Sub-Step 2: Verify ── */}
                      {usdtSubStep === 2 && (
                        <>
                          {/* Summary mini card */}
                          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                            <div>
                              <p className="text-dark-500 text-[0.65rem]">{isRTL ? 'المبلغ المرسل' : 'Amount Sent'}</p>
                              <p className="text-white text-lg font-extrabold font-mono">{paymentResult.amount} USDT</p>
                            </div>
                            <div className="text-end">
                              <p className="text-dark-500 text-[0.65rem]">{isRTL ? 'الشبكة' : 'Network'}</p>
                              <p className="text-green-400 text-sm font-bold">{paymentResult.network}</p>
                            </div>
                          </div>

                          {/* TX Hash input for BEP20/ERC20 */}
                          {(paymentResult.network === 'BEP20' || paymentResult.network === 'ERC20') && (
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                              <label className="block text-sm font-bold text-green-400 mb-1">
                                {isRTL ? 'هاش المعاملة (Transaction Hash)' : 'Transaction Hash'}
                              </label>
                              <p className="text-dark-500 text-xs mb-2">
                                {isRTL ? 'انسخ TX Hash من محفظتك والصقه هنا' : 'Copy the TX Hash from your wallet and paste it here'}
                              </p>
                              <input
                                type="text"
                                value={usdtTxHash}
                                onChange={e => setUsdtTxHash(e.target.value)}
                                placeholder="0x..."
                                dir="ltr"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-mono placeholder:text-dark-600 outline-none focus:border-green-500/30"
                              />
                            </div>
                          )}

                          {/* TRC20: auto-detection note */}
                          {paymentResult.network === 'TRC20' && (
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
                              <p className="text-green-400 text-sm font-semibold">
                                {isRTL ? 'سيتم الكشف عن التحويل تلقائياً' : 'Transfer will be detected automatically'}
                              </p>
                              <p className="text-dark-500 text-xs mt-1">
                                {isRTL ? 'اضغط زر التحقق بعد إتمام التحويل' : 'Press verify after completing the transfer'}
                              </p>
                            </div>
                          )}

                          {/* Verify button */}
                          <button
                            onClick={handleCheckUsdt}
                            disabled={checking || usdtTimeLeft <= 0}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            {checking ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? '🔍 تحقق من الدفع' : '🔍 Verify Payment')}
                          </button>

                          {/* Back to step 1 */}
                          <button
                            onClick={() => setUsdtSubStep(1)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-dark-400 text-sm font-medium hover:bg-white/10 transition-all"
                          >
                            {isRTL ? '← العودة لبيانات التحويل' : '← Back to transfer details'}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Bank Transfer */}
              {paymentResult.method === 'manual_bank' && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                      <Landmark className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</h3>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl divide-y divide-white/5">
                    {Object.entries(paymentResult.bankDetails).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-3">
                        <span className="text-dark-500 text-xs capitalize">{k.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{v}</span>
                          <button onClick={() => copyText(v, k)} className="text-dark-500 hover:text-white transition-colors">
                            {copied === k ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reference */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                    <span className="text-dark-400 text-xs">{isRTL ? 'رقم المرجع' : 'Reference'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary-300 font-mono text-sm">{paymentResult.referenceId}</span>
                      <button onClick={() => copyText(paymentResult.referenceId, 'ref')} className="text-dark-500 hover:text-white">
                        {copied === 'ref' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{isRTL ? paymentResult.instructions?.ar : paymentResult.instructions?.en}</span>
                  </div>

                  {/* Upload Receipt */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-dark-300">{isRTL ? 'رفع إيصال الدفع' : 'Upload Payment Receipt'}</h4>
                    <input
                      type="url"
                      value={receiptUrl}
                      onChange={e => setReceiptUrl(e.target.value)}
                      placeholder={isRTL ? 'رابط صورة الإيصال' : 'Receipt image URL'}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50"
                      dir="ltr"
                    />
                    <textarea
                      value={receiptNotes}
                      onChange={e => setReceiptNotes(e.target.value)}
                      placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 resize-none"
                    />
                    <button
                      onClick={handleUploadReceipt}
                      disabled={uploadingReceipt || !receiptUrl.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {uploadingReceipt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {isRTL ? 'إرسال الإيصال' : 'Submit Receipt'}
                    </button>
                  </div>
                </>
              )}

              {/* Back to selection */}
              <button
                onClick={() => { setStep('select'); setPaymentResult(null); setError(null); }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-dark-300 text-sm hover:bg-white/10 transition-all"
              >
                {isRTL ? '← العودة لطرق الدفع' : '← Back to payment methods'}
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 space-y-3">
            <button
              onClick={() => setShowReservation(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary-500/20 text-primary-400 hover:bg-primary-500/10 transition-all text-xs font-medium"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              {isRTL ? 'لست مستعداً؟ احجز الآن وسنتواصل معك' : 'Not ready? Book now and we\'ll contact you'}
            </button>
            <div className="flex items-center justify-center gap-2 text-dark-600 text-[11px]">
              <Shield className="w-3 h-3" />
              {isRTL ? 'مدفوعات مشفرة ومحمية — NEXIRO-FLUX' : 'Encrypted & Secure — NEXIRO-FLUX'}
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
        templateId={templateId}
        templateName={templateName}
        plan={plan}
      />
    </div>
  );
}
