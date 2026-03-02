import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Globe, Store, Mail, CheckCircle2, ArrowRight,
  ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, Lock, User,
  Palette, ChevronRight, CreditCard, Wallet, Building2, Banknote, Copy, Check, Bitcoin, Landmark
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { templates as staticTemplates } from '../data/templates';

const STEPS = [
  { id: 'payment', iconAr: '💳', iconEn: '💳', labelAr: 'الدفع', labelEn: 'Payment' },
  { id: 'account', iconAr: '👤', iconEn: '👤', labelAr: 'الحساب', labelEn: 'Account' },
  { id: 'store', iconAr: '🏪', iconEn: '🏪', labelAr: 'المتجر', labelEn: 'Store' },
  { id: 'email', iconAr: '📧', iconEn: '📧', labelAr: 'البريد', labelEn: 'Email' },
  { id: 'done', iconAr: '✅', iconEn: '✅', labelAr: 'تم', labelEn: 'Done' },
];

// Gateway type → icon and colors mapping
const gatewayStyle = {
  paypal: { Icon: Wallet, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', textColor: 'text-blue-400' },
  bank_transfer: { Icon: Landmark, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', textColor: 'text-emerald-400' },
  usdt: { Icon: Bitcoin, color: 'from-green-500/20 to-teal-600/10', border: 'border-green-500/30', textColor: 'text-green-400' },
  binance: { Icon: CreditCard, color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', textColor: 'text-yellow-400' },
};

export default function SetupWizardPage() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const templateId = searchParams.get('template') || 'digital-services-store';
  const plan = searchParams.get('plan') || 'monthly';

  // Find template data for pricing — start with static, override with API
  const [templateData, setTemplateData] = useState(() => staticTemplates.find(t => t.id === templateId));
  const templatePrice = templateData?.price?.[plan] || 0;
  const templateName = isRTL ? (templateData?.name || templateId) : (templateData?.nameEn || templateId);

  useEffect(() => {
    api.getPublicProducts()
      .then(res => {
        const staticT = staticTemplates.find(t => t.id === templateId);
        // Match API product by name (DB has no slug field)
        const apiByName = new Map((res.products || []).map(p => [p.name?.trim(), p]));
        const live = staticT ? apiByName.get(staticT.name?.trim()) : null;
        if (live && staticT) {
          const price = parseFloat(live.price);
          setTemplateData({
            ...staticT,
            name: live.name || staticT.name,
            price: price ? { monthly: price, yearly: price * 10, lifetime: price * 25 } : staticT.price,
          });
        } else if (live) {
          setTemplateData({
            id: live.id, name: live.name, nameEn: live.name,
            price: { monthly: live.price || 0, yearly: (live.price || 0) * 10, lifetime: (live.price || 0) * 25 },
          });
        }
      })
      .catch(() => {});
  }, [templateId]);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [provisioningStarted, setProvisioningStarted] = useState(false);

  // Dynamic gateways from server
  const [enabledGateways, setEnabledGateways] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [paypalLoading, setPaypalLoading] = useState(false);

  // Detect user's country via IP geolocation
  const [detectedCountry, setDetectedCountry] = useState(null);
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setDetectedCountry(d.country_code || null))
      .catch(() => setDetectedCountry(null));
  }, []);

  // Detect return from PayPal / Binance redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const paymentId = searchParams.get('payment_id') || searchParams.get('payment_ref');
    const returnedGateway = searchParams.get('gateway') || 'paypal';
    const urlPurchaseCode = searchParams.get('purchase_code');
    if (urlPurchaseCode) {
      setPaymentConfirmed(true);
      setForm(prev => ({ ...prev, payment_reference: `CODE-${urlPurchaseCode}` }));
    } else if (paymentStatus === 'success' && paymentId) {
      setPaymentConfirmed(true);
      setForm(prev => ({ ...prev, payment_reference: `${returnedGateway.toUpperCase()}-${paymentId}` }));
    } else if (paymentStatus === 'cancelled') {
      setError(isRTL ? 'تم إلغاء عملية الدفع' : 'Payment was cancelled');
    } else if (paymentStatus === 'failed') {
      setError(isRTL ? 'فشلت عملية الدفع' : 'Payment failed');
    } else if (returnedGateway === 'binance' && paymentId && !paymentStatus) {
      // Binance returnUrl doesn't include payment_status — check via API
      setPaypalLoading(true);
      api.checkPaymentStatusPublic(paymentId)
        .then(res => {
          if (res.status === 'completed' || res.status === 'paid') {
            setPaymentConfirmed(true);
            setForm(prev => ({ ...prev, payment_reference: `BINANCE-${paymentId}` }));
          }
        })
        .catch(() => {})
        .finally(() => setPaypalLoading(false));
    }
  }, [searchParams]);

  // Load gateways after country is detected (or failed)
  useEffect(() => {
    setGatewaysLoading(true);
    api.getEnabledPaymentGateways(detectedCountry)
      .then(data => setEnabledGateways(data.gateways || []))
      .catch(() => setEnabledGateways([]))
      .finally(() => setGatewaysLoading(false));
  }, [detectedCountry]);

  const [form, setForm] = useState({
    // Step 0: Payment
    payment_method: '',
    payment_method_type: '',
    payment_reference: '',
    // Step 1: Account
    owner_name: '',
    owner_email: '',
    owner_password: '',
    confirm_password: '',
    // Step 2: Store
    store_name: '',
    domain_slug: '',
    primary_color: '#7c5cff',
    // Step 3: Email (optional)
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'store_name' && !form.domain_slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 30);
      setForm(prev => ({ ...prev, domain_slug: slug }));
    }
  };

  const validateStep = () => {
    setError('');
    // Step 0: Payment — no validation required (blind/test mode)
    if (step === 1) {
      if (!form.owner_name || !form.owner_email || !form.owner_password) {
        setError(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
        return false;
      }
      if (form.owner_password.length < 6) {
        setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        return false;
      }
      if (form.owner_password !== form.confirm_password) {
        setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return false;
      }
    }
    if (step === 2) {
      if (!form.store_name) {
        setError(isRTL ? 'اسم المتجر مطلوب' : 'Store name is required');
        return false;
      }
      if (!form.domain_slug) {
        setError(isRTL ? 'عنوان النطاق مطلوب' : 'Domain slug is required');
        return false;
      }
    }
    // Step 3: Email — optional, no validation
    return true;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // ─── منع الإرسال المزدوج (نافذتين في نفس الوقت) ───
    if (provisioningStarted) return;
    const provisionKey = `provisioning_${form.payment_reference}`;
    if (form.payment_reference && sessionStorage.getItem(provisionKey)) {
      setError(isRTL ? 'تم بدء عملية التثبيت بالفعل. لا يمكن التثبيت مرتين بنفس الدفعة' : 'Installation already started. Cannot install twice with the same payment');
      return;
    }
    setProvisioningStarted(true);
    if (form.payment_reference) {
      sessionStorage.setItem(provisionKey, Date.now().toString());
    }

    setError('');
    setLoading(true);
    try {
      const data = await api.provisionSite({
        owner_name: form.owner_name,
        owner_email: form.owner_email,
        owner_password: form.owner_password,
        template_id: templateId,
        billing_cycle: plan,
        store_name: form.store_name,
        domain_slug: form.domain_slug,
        primary_color: form.primary_color,
        payment_method: form.payment_method,
        payment_reference: form.payment_reference,
        purchase_code: searchParams.get('purchase_code') || undefined,
        amount: templatePrice,
        ...(form.smtp_host ? {
          smtp_host: form.smtp_host,
          smtp_port: form.smtp_port,
          smtp_user: form.smtp_user,
          smtp_pass: form.smtp_pass,
        } : {})
      });

      // حفظ التوكن والبيانات
      if (data.token) {
        localStorage.setItem('nf_token', data.token);
        localStorage.setItem('nf_user', JSON.stringify(data.user));
        localStorage.setItem('nf_site', JSON.stringify(data.site));
      }

      setResult(data);
      setStep(4); // الانتقال لخطوة "تم"
    } catch (err) {
      // إذا كانت الدفعة مستخدمة بالفعل (409) لا نعيد المحاولة
      if (err.already_provisioned) {
        setError(isRTL ? 'تم استخدام هذه الدفعة لإنشاء موقع بالفعل' : 'This payment was already used to provision a site');
      } else {
        setError(err.error || (isRTL ? 'حدث خطأ أثناء الإعداد' : 'Setup failed'));
        // السماح بإعادة المحاولة فقط في حالة الأخطاء غير المتعلقة بالدفع المكرر
        setProvisioningStarted(false);
        if (form.payment_reference) {
          sessionStorage.removeItem(`provisioning_${form.payment_reference}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { value: '#7c5cff', label: 'Purple' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#ef4444', label: 'Red' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#8b5cf6', label: 'Violet' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'إعداد موقعك الجديد' : 'Setup Your New Site'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'أكمل الخطوات التالية لتشغيل متجرك' : 'Complete these steps to launch your store'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                i < step ? 'bg-emerald-500/20 text-emerald-400' :
                i === step ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500/30' :
                'bg-white/5 text-dark-500'
              }`}>
                {i < step ? '✓' : s.iconAr}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-8">

          {/* ═══ Step 1: Account ═══ */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-bold text-white">{isRTL ? 'بيانات حسابك' : 'Your Account'}</h2>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                <input
                  type="text"
                  value={form.owner_name}
                  onChange={e => handleChange('owner_name', e.target.value)}
                  placeholder={isRTL ? 'أحمد المالكي' : 'Ahmed Al-Malki'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={form.owner_email}
                  onChange={e => handleChange('owner_email', e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.owner_password}
                    onChange={e => handleChange('owner_password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                    style={{ [isRTL ? 'left' : 'right']: '12px' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={e => handleChange('confirm_password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                />
              </div>
            </div>
          )}

          {/* ═══ Step 2: Store Info ═══ */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <Store className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-bold text-white">{isRTL ? 'بيانات المتجر' : 'Store Details'}</h2>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'اسم المتجر' : 'Store Name'}</label>
                <input
                  type="text"
                  value={form.store_name}
                  onChange={e => handleChange('store_name', e.target.value)}
                  placeholder={isRTL ? 'متجر أحمد للخدمات الرقمية' : 'Ahmed Digital Store'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'عنوان النطاق (الدومين)' : 'Domain Slug'}</label>
                <div className="flex items-center gap-0">
                  <input
                    type="text"
                    value={form.domain_slug}
                    onChange={e => handleChange('domain_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="ahmed-store"
                    className="flex-1 bg-white/5 border border-white/10 rounded-s-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                    dir="ltr"
                  />
                  <div className="bg-white/10 border border-white/10 rounded-e-xl px-4 py-3 text-dark-400 text-sm border-s-0">
                    .nexiroflux.com
                  </div>
                </div>
                <p className="text-dark-500 text-xs mt-1.5">
                  {isRTL ? 'سيكون رابط متجرك: ' : 'Your store URL: '}
                  <span className="text-primary-400 font-mono">{form.domain_slug || 'your-store'}.nexiroflux.com</span>
                </p>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">
                  <Palette className="w-4 h-4 inline-block mr-1" />
                  {isRTL ? 'اللون الأساسي' : 'Primary Color'}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      onClick={() => handleChange('primary_color', c.value)}
                      className={`w-9 h-9 rounded-xl transition-all ${
                        form.primary_color === c.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111827] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ Step 0: Payment ═══ */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-bold text-white">{isRTL ? 'الدفع' : 'Payment'}</h2>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{isRTL ? 'القالب' : 'Template'}</span>
                  <span className="text-white font-medium text-sm">{templateName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{isRTL ? 'الخطة' : 'Plan'}</span>
                  <span className="text-primary-400 font-medium text-sm capitalize">{plan}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="text-white font-bold">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                  <span className="text-2xl font-display font-black text-emerald-400">${templatePrice}</span>
                </div>
              </div>

              {/* Payment Methods — from server */}
              <div>
                <label className="block text-sm text-dark-300 mb-3">{isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}</label>
                {gatewaysLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : enabledGateways.length === 0 ? (
                  <div className="text-center py-6 text-dark-500 text-sm">
                    {isRTL ? 'لا توجد طرق دفع متاحة حالياً' : 'No payment methods available'}
                  </div>
                ) : (
                  <div className={`grid ${enabledGateways.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                    {enabledGateways.map(gw => {
                      const style = gatewayStyle[gw.type] || gatewayStyle.paypal;
                      const GwIcon = style.Icon;
                      const selected = form.payment_method === String(gw.id);
                      return (
                        <button
                          key={gw.id}
                          onClick={() => {
                            handleChange('payment_method', String(gw.id));
                            handleChange('payment_method_type', gw.type);
                            setPaymentConfirmed(false);
                          }}
                          className={`relative p-4 rounded-xl border transition-all duration-300 text-start ${
                            selected
                              ? `bg-gradient-to-br ${style.color} ${style.border} border-2 scale-[1.02]`
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center mb-2`}>
                            <GwIcon className={`w-4 h-4 ${style.textColor}`} />
                          </div>
                          <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-dark-300'}`}>
                            {isRTL ? gw.name : (gw.name_en || gw.name)}
                          </span>
                          {selected && (
                            <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Instructions — dynamic from selected gateway */}
              {form.payment_method && (() => {
                const selectedGw = enabledGateways.find(g => String(g.id) === form.payment_method);
                if (!selectedGw) return null;
                const cfg = selectedGw.config || {};
                const style = gatewayStyle[selectedGw.type] || gatewayStyle.paypal;

                return (
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary-400" />
                    {isRTL ? 'تعليمات الدفع' : 'Payment Instructions'}
                  </h4>

                  {selectedGw.type === 'paypal' && (
                    <div className="space-y-3">
                      {paymentConfirmed ? (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <p className="text-emerald-400 text-sm font-medium">
                            {isRTL ? 'تم الدفع بنجاح عبر PayPal ✓' : 'PayPal payment completed successfully ✓'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-dark-400 text-sm">
                            {isRTL
                              ? 'سيتم توجيهك إلى موقع PayPal لإكمال عملية الدفع بأمان.'
                              : 'You will be redirected to PayPal to complete your payment securely.'}
                          </p>
                          <button
                            onClick={async () => {
                              setPaypalLoading(true);
                              setError('');
                              try {
                                const currentUrl = window.location.origin + window.location.pathname;
                                const returnUrl = `${currentUrl}?template=${templateId}&plan=${plan}`;
                                const data = await api.initCheckout({
                                  gateway_id: parseInt(form.payment_method),
                                  amount: templatePrice,
                                  currency: 'USD',
                                  description: `${templateName} - ${plan} plan`,
                                  return_url: returnUrl,
                                  cancel_url: returnUrl,
                                });
                                if (data.redirectUrl) {
                                  window.location.href = data.redirectUrl;
                                } else {
                                  setError(isRTL ? 'لم يتم الحصول على رابط PayPal' : 'Failed to get PayPal redirect URL');
                                }
                              } catch (err) {
                                setError(err.error || (isRTL ? 'فشل بدء الدفع عبر PayPal' : 'Failed to initiate PayPal payment'));
                              } finally {
                                setPaypalLoading(false);
                              }
                            }}
                            disabled={paypalLoading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {paypalLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isRTL ? 'جارٍ التوجيه...' : 'Redirecting...'}
                              </>
                            ) : (
                              <>
                                <Wallet className="w-4 h-4" />
                                {isRTL ? `ادفع $${templatePrice} عبر PayPal` : `Pay $${templatePrice} with PayPal`}
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {selectedGw.type === 'binance' && (
                    <div className="space-y-3">
                      {paymentConfirmed ? (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <p className="text-emerald-400 text-sm font-medium">
                            {isRTL ? 'تم الدفع بنجاح عبر Binance Pay ✓' : 'Binance Pay payment completed successfully ✓'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-dark-400 text-sm">
                            {isRTL
                              ? 'سيتم توجيهك إلى Binance Pay لإكمال عملية الدفع.'
                              : 'You will be redirected to Binance Pay to complete your payment.'}
                          </p>
                          <button
                            onClick={async () => {
                              setPaypalLoading(true);
                              setError('');
                              try {
                                const currentUrl = window.location.origin + window.location.pathname;
                                const returnBase = `${currentUrl}?template=${templateId}&plan=${plan}&gateway=binance`;
                                const data = await api.initCheckout({
                                  gateway_id: parseInt(form.payment_method),
                                  amount: templatePrice,
                                  currency: 'USDT',
                                  description: `${templateName} - ${plan} plan`,
                                  return_url: `${returnBase}&payment_id=__PAYMENT_ID__`,
                                });
                                if (data.checkoutUrl) {
                                  window.location.href = data.checkoutUrl;
                                } else {
                                  setError(isRTL ? 'لم يتم الحصول على رابط Binance Pay' : 'Failed to get Binance Pay URL');
                                  setPaypalLoading(false);
                                }
                              } catch (err) {
                                const detail = err.details ? ` (${err.details})` : '';
                                setError((err.error || (isRTL ? 'فشل بدء الدفع عبر Binance' : 'Failed to initiate Binance payment')) + detail);
                                setPaypalLoading(false);
                              }
                            }}
                            disabled={paypalLoading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-[#F0B90B] hover:bg-[#d4a30a] text-black disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {paypalLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                {isRTL ? `ادفع $${templatePrice} عبر Binance Pay` : `Pay $${templatePrice} with Binance Pay`}
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {selectedGw.type === 'bank_transfer' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'حوّل المبلغ إلى الحساب البنكي التالي:' : 'Transfer the amount to the following bank account:'}
                      </p>
                      <div className="bg-dark-900/50 rounded-lg p-3 space-y-1.5 text-sm">
                        {cfg.bank_name && (
                          <div className="flex justify-between">
                            <span className="text-dark-500">{isRTL ? 'البنك' : 'Bank'}</span>
                            <span className="text-white font-mono">{cfg.bank_name}</span>
                          </div>
                        )}
                        {cfg.iban && (
                          <div className="flex justify-between items-center">
                            <span className="text-dark-500">IBAN</span>
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-400 font-mono text-xs">{cfg.iban}</span>
                              <button onClick={() => handleCopy(cfg.iban)} className="text-dark-400 hover:text-white transition-colors">
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        )}
                        {cfg.account_holder && (
                          <div className="flex justify-between">
                            <span className="text-dark-500">{isRTL ? 'اسم المستفيد' : 'Beneficiary'}</span>
                            <span className="text-white font-mono">{cfg.account_holder}</span>
                          </div>
                        )}
                        {cfg.currency && (
                          <div className="flex justify-between">
                            <span className="text-dark-500">{isRTL ? 'العملة' : 'Currency'}</span>
                            <span className="text-white font-mono">{cfg.currency}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedGw.type === 'usdt' && (
                    <div className="space-y-3">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? `أرسل $${templatePrice} USDT إلى العنوان التالي (شبكة ${cfg.network || 'TRC20'}):` : `Send $${templatePrice} USDT to the following address (${cfg.network || 'TRC20'} network):`}
                      </p>
                      {cfg.wallet_address && (
                        <div className="bg-dark-900/50 rounded-xl p-4">
                          <div className="flex items-center gap-4">
                            {/* QR Code */}
                            <div className="flex-shrink-0 bg-white rounded-xl p-2">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(cfg.wallet_address)}`}
                                alt="QR Code"
                                className="w-[100px] h-[100px]"
                              />
                            </div>
                            {/* Address */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-dark-500 text-xs">{isRTL ? 'عنوان المحفظة' : 'Wallet Address'}</span>
                                <button onClick={() => handleCopy(cfg.wallet_address)} className="text-dark-400 hover:text-white transition-colors">
                                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <code className="text-green-400 text-xs font-mono break-all bg-white/5 rounded-lg p-2.5 block leading-relaxed">{cfg.wallet_address}</code>
                              {cfg.network && (
                                <p className="text-dark-500 text-xs mt-2 flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {isRTL ? 'الشبكة:' : 'Network:'} {cfg.network}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Reference — only for manual methods (bank/usdt) */}
                  {(selectedGw.type === 'bank_transfer' || selectedGw.type === 'usdt') && (
                  <>
                  <div className="pt-2">
                    <label className="block text-sm text-dark-300 mb-2">
                      {isRTL ? 'رقم العملية / المرجع (اختياري)' : 'Transaction ID / Reference (optional)'}
                    </label>
                    <input
                      type="text"
                      value={form.payment_reference}
                      onChange={e => handleChange('payment_reference', e.target.value)}
                      placeholder={isRTL ? 'مثال: TXN123456789' : 'e.g. TXN123456789'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                    />
                  </div>

                  {/* Confirm Payment Button */}
                  <button
                    onClick={() => setPaymentConfirmed(true)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      paymentConfirmed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30'
                    }`}
                  >
                    {paymentConfirmed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {isRTL ? 'تم تأكيد الدفع ✓' : 'Payment Confirmed ✓'}
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        {isRTL ? 'أؤكد أنني قمت بالدفع' : 'I confirm I have made the payment'}
                      </>
                    )}
                  </button>
                  </>
                  )}
                </div>
                );
              })()}

              {/* Trial notice */}
              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-dark-400 text-xs leading-relaxed">
                  {isRTL
                    ? 'سيتم مراجعة دفعتك من قبل فريقنا وتفعيل موقعك خلال دقائق. في حال عدم الدفع، ستحصل على فترة تجريبية مجانية 14 يوم.'
                    : 'Your payment will be reviewed by our team and your site activated within minutes. If no payment is made, you will get a free 14-day trial.'}
                </p>
              </div>
            </div>
          )}

          {/* ═══ Step 3: Email / SMTP ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-bold text-white">{isRTL ? 'إعدادات البريد' : 'Email Settings'}</h2>
              </div>
              <p className="text-dark-400 text-sm mb-4">
                {isRTL
                  ? 'هذه الخطوة اختيارية — يمكنك إعدادها لاحقًا من لوحة التحكم'
                  : 'This step is optional — you can configure it later from your dashboard'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'سيرفر SMTP' : 'SMTP Host'}</label>
                  <input
                    type="text"
                    value={form.smtp_host}
                    onChange={e => handleChange('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'المنفذ' : 'Port'}</label>
                  <input
                    type="text"
                    value={form.smtp_port}
                    onChange={e => handleChange('smtp_port', e.target.value)}
                    placeholder="587"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'اسم المستخدم / البريد' : 'Username / Email'}</label>
                <input
                  type="text"
                  value={form.smtp_user}
                  onChange={e => handleChange('smtp_user', e.target.value)}
                  placeholder="noreply@yourstore.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'كلمة مرور SMTP' : 'SMTP Password'}</label>
                <input
                  type="password"
                  value={form.smtp_pass}
                  onChange={e => handleChange('smtp_pass', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 text-sm"
                />
              </div>


            </div>
          )}

          {/* ═══ Step 4: Done ═══ */}
          {step === 4 && result && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                {isRTL ? 'تم إنشاء موقعك بنجاح! 🎉' : 'Your Site is Ready! 🎉'}
              </h2>
              <p className="text-dark-400 text-sm mb-8">
                {isRTL ? 'يمكنك الآن الدخول للوحة التحكم وإدارة متجرك' : 'You can now access your dashboard and manage your store'}
              </p>

              {/* Site Info Card */}
              <div className="bg-white/5 rounded-2xl border border-white/5 p-6 text-start mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{isRTL ? 'اسم المتجر' : 'Store Name'}</span>
                  <span className="text-white font-medium">{result.site?.name}</span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{isRTL ? 'الدومين' : 'Domain'}</span>
                  <span className="text-primary-400 font-mono text-sm">{result.site?.domain}</span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{isRTL ? 'الخطة' : 'Plan'}</span>
                  <span className="text-emerald-400 font-medium capitalize">{result.site?.plan}</span>
                </div>
                <div className="border-t border-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{isRTL ? 'فترة تجريبية' : 'Trial Period'}</span>
                  <span className="text-yellow-400 text-sm">
                    {isRTL ? '14 يوم مجاناً' : '14 days free'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/my-dashboard')}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all border border-white/10"
                >
                  {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ Navigation Buttons (Steps 0-3) ═══ */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {isRTL ? 'السابق' : 'Back'}
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all"
                >
                  {isRTL ? 'التالي' : 'Next'}
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isRTL ? 'جارٍ الإنشاء...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isRTL ? 'إنشاء الموقع' : 'Create Site'}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Step description */}
        {step < 4 && (
          <p className="text-center text-dark-500 text-xs mt-4">
            {isRTL ? `الخطوة ${step + 1} من 4` : `Step ${step + 1} of 4`}
          </p>
        )}
      </div>
    </div>
  );
}
