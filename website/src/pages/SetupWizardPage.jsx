import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Globe, Store, Mail, CheckCircle2, ArrowRight,
  ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, Lock, User,
  Palette, ChevronRight, CreditCard, Wallet, Building2, Banknote, Copy, Check
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

const PAYMENT_METHODS = [
  { id: 'binance', icon: '🪙', labelAr: 'Binance Pay', labelEn: 'Binance Pay', color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30' },
  { id: 'paypal', icon: '🅿️', labelAr: 'PayPal', labelEn: 'PayPal', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30' },
  { id: 'credit_card', icon: '💳', labelAr: 'بطاقة ائتمان', labelEn: 'Credit Card', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30' },
  { id: 'bank_transfer', icon: '🏦', labelAr: 'تحويل بنكي', labelEn: 'Bank Transfer', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30' },
  { id: 'e_wallet', icon: '📱', labelAr: 'محفظة إلكترونية', labelEn: 'E-Wallet (STC Pay, etc.)', color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/30' },
  { id: 'crypto', icon: '₿', labelAr: 'عملات رقمية أخرى', labelEn: 'Other Crypto', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30' },
];

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
        const live = res.products?.find(p => p.id === templateId);
        const staticT = staticTemplates.find(t => t.id === templateId);
        if (live && staticT) {
          setTemplateData({
            ...staticT,
            name: live.name || staticT.name,
            price: live.price ? { monthly: live.price, yearly: live.price * 10, lifetime: live.price * 25 } : staticT.price,
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

  const [form, setForm] = useState({
    // Step 0: Payment
    payment_method: '',
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
    smtp_from: '',
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
        amount: templatePrice,
        ...(form.smtp_host ? {
          smtp_host: form.smtp_host,
          smtp_port: form.smtp_port,
          smtp_user: form.smtp_user,
          smtp_pass: form.smtp_pass,
          smtp_from: form.smtp_from || form.owner_email,
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
      setError(err.error || (isRTL ? 'حدث خطأ أثناء الإعداد' : 'Setup failed'));
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
                    .nexiro.com
                  </div>
                </div>
                <p className="text-dark-500 text-xs mt-1.5">
                  {isRTL ? 'سيكون رابط متجرك: ' : 'Your store URL: '}
                  <span className="text-primary-400 font-mono">{form.domain_slug || 'your-store'}.nexiro.com</span>
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

              {/* Payment Methods */}
              <div>
                <label className="block text-sm text-dark-300 mb-3">{isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}</label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      onClick={() => {
                        handleChange('payment_method', method.id);
                        setPaymentConfirmed(false);
                      }}
                      className={`relative p-4 rounded-xl border transition-all duration-300 text-start ${
                        form.payment_method === method.id
                          ? `bg-gradient-to-br ${method.color} ${method.border} border-2 scale-[1.02]`
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{method.icon}</span>
                      <span className={`text-sm font-medium ${form.payment_method === method.id ? 'text-white' : 'text-dark-300'}`}>
                        {isRTL ? method.labelAr : method.labelEn}
                      </span>
                      {form.payment_method === method.id && (
                        <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Instructions */}
              {form.payment_method && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary-400" />
                    {isRTL ? 'تعليمات الدفع' : 'Payment Instructions'}
                  </h4>

                  {form.payment_method === 'binance' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'أرسل المبلغ إلى عنوان Binance Pay التالي:' : 'Send the amount to the following Binance Pay ID:'}
                      </p>
                      <div className="flex items-center gap-2 bg-dark-900/50 rounded-lg px-3 py-2">
                        <code className="text-yellow-400 text-sm flex-1 font-mono">nexiro@binance.pay</code>
                        <button onClick={() => handleCopy('nexiro@binance.pay')} className="text-dark-400 hover:text-white transition-colors">
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-dark-500 text-xs">{isRTL ? 'العملة: USDT (شبكة BEP20)' : 'Currency: USDT (BEP20 Network)'}</p>
                    </div>
                  )}

                  {form.payment_method === 'paypal' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'أرسل المبلغ إلى حساب PayPal التالي:' : 'Send the amount to the following PayPal account:'}
                      </p>
                      <div className="flex items-center gap-2 bg-dark-900/50 rounded-lg px-3 py-2">
                        <code className="text-blue-400 text-sm flex-1 font-mono">payments@nexiro-flux.com</code>
                        <button onClick={() => handleCopy('payments@nexiro-flux.com')} className="text-dark-400 hover:text-white transition-colors">
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {form.payment_method === 'credit_card' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'سيتم توجيهك لبوابة الدفع الآمنة بعد تأكيد الطلب.' : 'You will be redirected to the secure payment gateway after confirming.'}
                      </p>
                      <div className="flex items-center gap-2 text-dark-500 text-xs">
                        <Lock className="w-3 h-3" />
                        {isRTL ? 'مشفر ومؤمن بـ SSL 256-bit' : 'Encrypted & secured with 256-bit SSL'}
                      </div>
                    </div>
                  )}

                  {form.payment_method === 'bank_transfer' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'حوّل المبلغ إلى الحساب البنكي التالي:' : 'Transfer the amount to the following bank account:'}
                      </p>
                      <div className="bg-dark-900/50 rounded-lg p-3 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-dark-500">{isRTL ? 'البنك' : 'Bank'}</span>
                          <span className="text-white font-mono">Al Rajhi Bank</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-500">IBAN</span>
                          <span className="text-emerald-400 font-mono text-xs">SA0380000000608010167519</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-500">{isRTL ? 'اسم المستفيد' : 'Beneficiary'}</span>
                          <span className="text-white font-mono">NEXIRO-FLUX LLC</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {form.payment_method === 'e_wallet' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'أرسل المبلغ عبر STC Pay أو أي محفظة إلكترونية إلى:' : 'Send amount via STC Pay or any e-wallet to:'}
                      </p>
                      <div className="flex items-center gap-2 bg-dark-900/50 rounded-lg px-3 py-2">
                        <code className="text-pink-400 text-sm flex-1 font-mono">+966 5X XXX XXXX</code>
                        <button onClick={() => handleCopy('+966 5X XXX XXXX')} className="text-dark-400 hover:text-white transition-colors">
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {form.payment_method === 'crypto' && (
                    <div className="space-y-2">
                      <p className="text-dark-400 text-sm">
                        {isRTL ? 'أرسل USDT إلى العنوان التالي (شبكة TRC20):' : 'Send USDT to the following address (TRC20 network):'}
                      </p>
                      <div className="flex items-center gap-2 bg-dark-900/50 rounded-lg px-3 py-2">
                        <code className="text-orange-400 text-xs flex-1 font-mono break-all">TXYz...demo...address</code>
                        <button onClick={() => handleCopy('TXYz...demo...address')} className="text-dark-400 hover:text-white transition-colors">
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Reference */}
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
                </div>
              )}

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

              <div>
                <label className="block text-sm text-dark-300 mb-2">{isRTL ? 'البريد المرسل (From)' : 'From Email'}</label>
                <input
                  type="email"
                  value={form.smtp_from}
                  onChange={e => handleChange('smtp_from', e.target.value)}
                  placeholder="noreply@yourstore.com"
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
