import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { templates as staticTemplates } from '../data/templates';

//  Main Setup Page (Clean Multi-Step Form) 
export default function TerminalSetupPage() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const templateId = searchParams.get('template') || 'digital-services-store';
  const plan = searchParams.get('plan') || 'monthly';
  const paymentRef = searchParams.get('payment_ref') || searchParams.get('payment_id') || '';
  const urlPurchaseCode = searchParams.get('purchase_code') || '';
  const paymentStatus = searchParams.get('payment_status') || '';
  const returnedGateway = searchParams.get('gateway') || '';

  const templateData = staticTemplates.find(t => t.id === templateId);
  const templateName = isRTL ? (templateData?.name || templateId) : (templateData?.nameEn || templateId);

  //  Steps: 0=domain, 1=account, 2=storeName, 3=email(optional), 4=building, 5=done 
  const [step, setStep] = useState(0);

  // Form
  const [domain, setDomain] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [buildProgress, setBuildProgress] = useState([]);
  const [buildError, setBuildError] = useState('');

  // Payment state (from URL)
  const [codeVerified] = useState(!!urlPurchaseCode);
  const [purchaseCode] = useState(urlPurchaseCode);
  const [codeInfo] = useState(null);
  const [paymentConfirmed] = useState(paymentStatus === 'success' || paymentStatus === 'pending');
  const [selectedGateway] = useState(returnedGateway ? { type: returnedGateway, name: returnedGateway } : null);

  // DNS
  const [dnsChecking, setDnsChecking] = useState(false);
  const [dnsVerified, setDnsVerified] = useState(false);
  const [dnsResult, setDnsResult] = useState(null);
  const [dnsPartial, setDnsPartial] = useState(null); // { dnsOk }
  const [dnsCheckCount, setDnsCheckCount] = useState(0);

  //  Translations 
  const t = {
    welcome: isRTL ? 'مرحباً! شكراً على الشراء' : 'Welcome! Thanks for your purchase',
    welcomeSub: isRTL ? 'الآن دعنا نكمل إعداد موقعك' : "Now let's complete your site setup",
    domainLabel: isRTL ? 'أدخل رابط الدومين الخاص بك' : 'Enter your domain',
    domainPlaceholder: isRTL ? 'ادخل رابط الدومين الخاص بك  مثال magicdesign3.com' : 'Enter your domain e.g. magicdesign3.com',
    domainHint: isRTL ? 'وجّه الدومين إلى IP: 181.215.69.49 (سجل A) وتأكد أنه غير مرتبط باستضافة أخرى' : 'Point your domain to IP: 181.215.69.49 (A record) and make sure it is not linked to another hosting',
    checkDns: isRTL ? 'تحقق من الدومين' : 'Verify Domain',
    dnsOk: isRTL ? 'تم التحقق بنجاح! الدومين يشير لسيرفرنا' : 'Verified! Domain points to our server',
    dnsRequired: isRTL ? 'يجب التحقق من الدومين أولاً' : 'Domain verification is required',
    dnsOnlyOk: isRTL ? 'DNS يشير لسيرفرنا' : 'DNS points to our server',
    dnsNotOk: isRTL ? 'DNS لا يشير لسيرفرنا' : 'DNS not pointing to our server',
    dnsOkNote: isRTL ? 'تأكد أن الدومين غير مربوط باستضافة أخرى أو قوالب أخرى' : 'Make sure the domain is not linked to another hosting or templates',
    dnsPropagation: isRTL ? 'إذا أضفت سجل DNS للتو، قد يستغرق انتشاره من دقائق إلى 48 ساعة. يمكنك إعادة المحاولة بعد قليل' : 'If you just updated your DNS records, propagation can take from a few minutes up to 48 hours. You can retry shortly',
    retryCheck: isRTL ? 'إعادة التحقق' : 'Re-check',
    accountTitle: isRTL ? 'إنشاء حساب المدير' : 'Create Admin Account',
    accountSub: isRTL ? 'هذا الحساب سيكون لإدارة موقعك' : 'This account will manage your site',
    nameLabel: isRTL ? 'الاسم الكامل' : 'Full Name',
    namePlaceholder: isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name',
    emailLabel: isRTL ? 'البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    passwordLabel: isRTL ? 'كلمة المرور' : 'Password',
    passwordPlaceholder: isRTL ? 'أدخل كلمة مرور قوية' : 'Enter a strong password',
    storeTitle: isRTL ? 'اسم المتجر' : 'Store Name',
    storeSub: isRTL ? 'اختر اسماً لمتجرك' : 'Choose a name for your store',
    storeNameLabel: isRTL ? 'اسم المتجر' : 'Store Name',
    storeNamePlaceholder: isRTL ? 'مثال: متجر النجوم' : 'e.g. Star Store',
    emailSetupTitle: isRTL ? 'إعدادات البريد (اختياري)' : 'Email Settings (Optional)',
    emailSetupSub: isRTL ? 'لإرسال إشعارات من موقعك' : 'To send notifications from your site',
    smtpHostPlaceholder: isRTL ? 'خادم SMTP مثل smtp.gmail.com' : 'SMTP host e.g. smtp.gmail.com',
    smtpPortPlaceholder: isRTL ? 'المنفذ (587)' : 'Port (587)',
    smtpUserPlaceholder: isRTL ? 'اسم المستخدم / البريد' : 'Username / Email',
    smtpPassPlaceholder: isRTL ? 'كلمة المرور' : 'Password',
    smtpFromPlaceholder: isRTL ? 'البريد المرسل' : 'From email',
    next: isRTL ? 'التالي' : 'Next',
    back: isRTL ? 'السابق' : 'Back',
    skip: isRTL ? 'تخطي' : 'Skip',
    buildSite: isRTL ? 'بناء الموقع' : 'Build Site',
    building: isRTL ? 'جارٍ بناء موقعك...' : 'Building your site...',
    buildDone: isRTL ? 'تم بناء موقعك بنجاح!' : 'Your site is built successfully!',
    goToDashboard: isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard',
    manageAccount: isRTL ? 'إدارة حسابي' : 'Manage Account',
    visitSite: isRTL ? 'زيارة الموقع' : 'Visit Site',
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidEmail: isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address',
    shortPassword: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
    template: isRTL ? 'القالب' : 'Template',
    planLabel: isRTL ? 'الخطة' : 'Plan',
    checking: isRTL ? 'جارٍ التحقق...' : 'Checking...',
    processing: isRTL ? 'جارٍ المعالجة...' : 'Processing...',
    site: isRTL ? 'الموقع' : 'Site',
    domainWord: isRTL ? 'الدومين' : 'Domain',
    status: isRTL ? 'الحالة' : 'Status',
    active: isRTL ? 'نشط ✓' : 'Active ✓',
  };

  //  Check DNS 
  const checkDNS = useCallback(async () => {
    const d = domain.toLowerCase().replace(/\s/g, '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!d) return;
    setDnsChecking(true);
    setError('');
    setDnsResult(null);
    setDnsPartial(null);
    setDnsCheckCount(prev => prev + 1);
    try {
      const res = await api.checkDomainDNS(d);
      setDnsResult(res);
      setDnsPartial({ dnsOk: res.dnsOk });
      if (res.verified) {
        setDnsVerified(true);
      } else {
        setError(isRTL ? res.message : res.messageEn);
      }
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل التحقق من الدومين' : 'Domain verification failed'));
    } finally {
      setDnsChecking(false);
    }
  }, [domain, isRTL]);

  //  Build Site 
  const runBuild = useCallback(async () => {
    setStep(4);
    setBuildError('');
    const steps = isRTL ? [
      { msg: ' جارٍ الاتصال بالخادم...', delay: 600 },
      { msg: ' إنشاء قاعدة بيانات الموقع...', delay: 800 },
      { msg: ' إنشاء حساب المدير...', delay: 600 },
      { msg: ' تطبيق إعدادات القالب...', delay: 700 },
      { msg: ' تهيئة خدمة البريد...', delay: 500 },
      { msg: ' ربط الدومين...', delay: 900 },
      { msg: ' تفعيل شهادة SSL...', delay: 800 },
      { msg: '✅ البناء اكتمل بنجاح!', delay: 400 },
    ] : [
      { msg: ' Connecting to server...', delay: 600 },
      { msg: ' Creating site database...', delay: 800 },
      { msg: ' Creating admin account...', delay: 600 },
      { msg: ' Applying template settings...', delay: 700 },
      { msg: ' Configuring email service...', delay: 500 },
      { msg: ' Linking domain...', delay: 900 },
      { msg: ' Activating SSL certificate...', delay: 800 },
      { msg: '✅ Build completed successfully!', delay: 400 },
    ];

    setBuildProgress([]);

    const apiPromise = api.provisionSite({
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_password: ownerPassword,
      template_id: templateId,
      billing_cycle: codeInfo?.billing_cycle || plan,
      store_name: storeName,
      custom_domain: domain.toLowerCase().replace(/\s/g, '').replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      payment_method: codeVerified ? 'purchase_code' : (selectedGateway?.type || 'manual'),
      payment_reference: paymentRef || undefined,
      amount: templateData?.price?.[plan] || 0,
      purchase_code: codeVerified ? purchaseCode.trim().toUpperCase() : undefined,
      ...(smtpHost ? {
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_from: smtpFrom || ownerEmail,
      } : {}),
    });

    for (let i = 0; i < steps.length - 1; i++) {
      await new Promise(r => setTimeout(r, steps[i].delay));
      setBuildProgress(prev => [...prev, steps[i].msg]);
    }

    try {
      const data = await apiPromise;
      if (data.token) {
        localStorage.setItem('nf_token', data.token);
        localStorage.setItem('nf_user', JSON.stringify(data.user));
        localStorage.setItem('nf_site', JSON.stringify(data.site));
        // مسح بيانات الإعداد المعلق
        try { localStorage.removeItem('nexiro_pending_setup'); } catch(e) {}
      }
      setBuildProgress(prev => [...prev, steps[steps.length - 1].msg]);
      setResult(data);
      await new Promise(r => setTimeout(r, 800));
      setStep(5);
    } catch (err) {
      const errorMsg = err.error || err.errorEn || (isRTL ? 'فشل بناء الموقع' : 'Site build failed');
      setBuildProgress(prev => [...prev, '❌ ' + errorMsg]);
      setBuildError(errorMsg);
      // إذا كان خطأ دفع (402) — إرجاع المستخدم لصفحة الشراء
      if (err.payment_status === 'pending' || err.payment_status === 'failed' || err.payment_status === 'cancelled') {
        setTimeout(() => {
          navigate(`/buy?template=${templateId}&plan=${plan}`);
        }, 4000);
      }
    }
  }, [ownerName, ownerEmail, ownerPassword, storeName, domain, templateId, plan, paymentRef, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, templateData, isRTL, codeVerified, purchaseCode, codeInfo, selectedGateway, paymentConfirmed]);

  //  Validation 
  const validateStep = () => {
    setError('');
    switch (step) {
      case 0:
        if (!domain.trim()) { setError(t.required); return false; }
        if (!dnsVerified) { setError(t.dnsRequired); return false; }
        return true;
      case 1:
        if (!ownerName.trim()) { setError(t.required); return false; }
        if (!ownerEmail.trim() || !ownerEmail.includes('@')) { setError(t.invalidEmail); return false; }
        if (!ownerPassword || ownerPassword.length < 6) { setError(t.shortPassword); return false; }
        return true;
      case 2:
        if (!storeName.trim()) { setError(t.required); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setError('');
    if (step === 3) {
      runBuild();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(s => Math.max(0, s - 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  //  Step indicator data 
  const totalSteps = 4;
  const stepNames = isRTL
    ? ['الدومين', 'الحساب', 'المتجر', 'البريد']
    : ['Domain', 'Account', 'Store', 'Email'];

  const inputClass = 'w-full px-5 py-3.5 rounded-xl bg-[#13151c] border border-gray-800 text-white text-sm placeholder:text-gray-600 outline-none focus:border-emerald-500/50 transition-colors';

  return (
    <div
      className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-xl mx-auto">

        {/* Step 0: Domain */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 leading-relaxed">
              {t.welcome}
            </h1>
            <p className="text-gray-400 text-center mb-10 text-lg">
              {t.welcomeSub}
            </p>

            <div className="flex items-center justify-center gap-4 mb-8 text-sm text-gray-500">
              <span>{t.template}: <span className="text-white">{templateName}</span></span>
              <span className="text-gray-700">|</span>
              <span>{t.planLabel}: <span className="text-white">{plan}</span></span>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.domainPlaceholder}
                className={inputClass}
                dir="ltr"
                autoFocus
              />

              <p className="text-gray-600 text-xs text-center">{t.domainHint}</p>

              {domain.trim() && !dnsVerified && (
                <button
                  onClick={checkDNS}
                  disabled={dnsChecking}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 mx-auto block"
                >
                  {dnsChecking ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" /></svg>
                      {t.checking}
                    </span>
                  ) : dnsCheckCount > 0 ? t.retryCheck : t.checkDns}
                </button>
              )}

              {/* DNS status indicator */}
              {dnsPartial && !dnsVerified && (
                <div className="space-y-3 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                    dnsPartial.dnsOk 
                      ? 'bg-emerald-500/10 border border-emerald-500/20' 
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {dnsPartial.dnsOk ? (
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className={`text-sm font-medium ${dnsPartial.dnsOk ? 'text-emerald-400' : 'text-red-400'}`}>
                      {dnsPartial.dnsOk ? t.dnsOnlyOk : t.dnsNotOk}
                    </span>
                  </div>
                  {!dnsPartial.dnsOk && dnsCheckCount >= 1 && (
                    <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3 max-w-sm mx-auto">
                      <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      <p className="text-amber-300/90 text-xs leading-relaxed text-start">
                        {t.dnsPropagation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {dnsVerified && (
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <span className="text-emerald-400 text-sm font-semibold">{t.dnsOk}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <svg className="w-3.5 h-3.5 text-yellow-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-yellow-400/60 text-xs">{t.dnsOkNote}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3 max-w-md mx-auto">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-red-400/90 text-sm leading-relaxed text-start">{error}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-fit mx-auto block px-10 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Account */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              {t.accountTitle}
            </h1>
            <p className="text-gray-400 text-center mb-8 text-base">
              {t.accountSub}
            </p>

            <StepIndicator current={1} total={totalSteps} names={stepNames} />

            <div className="space-y-4 mt-8">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">{t.nameLabel}</label>
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.namePlaceholder} className={inputClass} autoFocus />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">{t.emailLabel}</label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.emailPlaceholder} className={inputClass} dir="ltr" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">{t.passwordLabel}</label>
                <input type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.passwordPlaceholder} className={inputClass} dir="ltr" />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors">{t.back}</button>
                <button onClick={handleNext} className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors">{t.next}</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Store Name */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              {t.storeTitle}
            </h1>
            <p className="text-gray-400 text-center mb-8 text-base">
              {t.storeSub}
            </p>

            <StepIndicator current={2} total={totalSteps} names={stepNames} />

            <div className="space-y-4 mt-8">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">{t.storeNameLabel}</label>
                <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.storeNamePlaceholder} className={inputClass} autoFocus />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors">{t.back}</button>
                <button onClick={handleNext} className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors">{t.next}</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Email (Optional) */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              {t.emailSetupTitle}
            </h1>
            <p className="text-gray-400 text-center mb-8 text-base">
              {t.emailSetupSub}
            </p>

            <StepIndicator current={3} total={totalSteps} names={stepNames} />

            <div className="space-y-4 mt-8">
              <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.smtpHostPlaceholder} className={inputClass} dir="ltr" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder={t.smtpUserPlaceholder} className={inputClass} dir="ltr" />
                <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder={t.smtpPortPlaceholder} className={inputClass} dir="ltr" />
              </div>
              <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder={t.smtpPassPlaceholder} className={inputClass} dir="ltr" />
              <input type="email" value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} placeholder={t.smtpFromPlaceholder} className={inputClass} dir="ltr" />

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors">{t.back}</button>
                <button onClick={() => { setSmtpHost(''); setSmtpUser(''); setSmtpPass(''); setSmtpFrom(''); runBuild(); }} className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium text-sm transition-colors">{t.skip}</button>
                <button onClick={handleNext} className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors">{t.buildSite}</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Building */}
        {step === 4 && (
          <div className="animate-fadeIn text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {t.building}
            </h1>

            <div className="w-full max-w-md mx-auto space-y-3 text-start mb-8">
              {buildProgress.map((msg, i) => (
                <div key={i} className="flex items-center gap-3 text-sm animate-fadeIn" style={{ animationDelay: i * 100 + 'ms' }}>
                  <span className="text-gray-300">{msg}</span>
                </div>
              ))}
              {!buildError && buildProgress.length < 8 && (
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  <span>{t.processing}</span>
                </div>
              )}
            </div>

            {buildError && (
              <div className="space-y-4">
                <p className="text-red-400 text-sm">{buildError}</p>
                <button onClick={() => { setBuildError(''); setStep(3); }} className="px-8 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors">{t.back}</button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && result && (
          <div className="animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {t.buildDone}
            </h1>

            <div className="bg-[#13151c] border border-gray-800 rounded-xl p-5 max-w-sm mx-auto mb-8 text-start space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.site}</span>
                <span className="text-white font-medium">{result.site?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.domainWord}</span>
                <span className="text-emerald-400 font-mono text-xs">{result.site?.domain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.status}</span>
                <span className="text-emerald-400">{t.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Site Key</span>
                <span className="text-gray-300 font-mono text-xs">{result.site?.site_key}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {result.site?.domain && (
                <a href={'https://' + result.site.domain + '/login?token=' + (result.token || localStorage.getItem('nf_token') || '') + (result.admin_slug ? '&slug=' + result.admin_slug : '')} className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors">{t.goToDashboard}</a>
              )}
              <button onClick={() => navigate('/my-dashboard')} className="px-8 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors">{t.manageAccount}</button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-700 text-[11px]">
          NEXIRO-FLUX
        </div>
      </div>

      <style>{'@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.animate-fadeIn{animation:fadeIn .4s ease-out forwards}'}</style>
    </div>
  );
}

//  Step Indicator Component 
function StepIndicator({ current, total, names }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ' + (i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-emerald-600/20 border-2 border-emerald-500 text-emerald-400' : 'bg-gray-800 text-gray-600')}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={'text-[10px] mt-1 ' + (i === current ? 'text-emerald-400' : 'text-gray-600')}>
              {names[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className={'w-8 h-px mb-4 ' + (i < current ? 'bg-emerald-500' : 'bg-gray-800')} />
          )}
        </div>
      ))}
    </div>
  );
}
