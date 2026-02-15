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

  //  Translations 
  const t = {
    welcome: isRTL ? 'مرحباً! شكراً على الشراء' : 'Welcome! Thanks for your purchase',
    welcomeSub: isRTL ? 'الآن دعنا نكمل إعداد موقعك' : "Now let's complete your site setup",
    domainLabel: isRTL ? 'أدخل رابط الدومين الخاص بك' : 'Enter your domain',
    domainPlaceholder: isRTL ? 'ادخل رابط الدومين الخاص بك  مثال magicdesign3.com' : 'Enter your domain e.g. magicdesign3.com',
    domainHint: isRTL ? 'وجّه الدومين إلى IP: 181.215.69.49 (سجل A) وتأكد أنه غير مرتبط باستضافة أخرى' : 'Point your domain to IP: 181.215.69.49 (A record) and make sure it is not linked to another hosting',
    checkDns: isRTL ? 'تحقق من الدومين' : 'Verify Domain',
    dnsOk: isRTL ? '✓ تم التحقق بنجاح! الدومين يشير لسيرفرنا' : '✓ Verified! Domain points to our server',
    dnsRequired: isRTL ? 'يجب التحقق من الدومين أولاً' : 'Domain verification is required',
    dnsOnlyOk: isRTL ? '✓ DNS يشير لسيرفرنا' : '✓ DNS points to our server',
    dnsNotOk: isRTL ? '✗ DNS لا يشير لسيرفرنا' : '✗ DNS not pointing to our server',
    dnsOkNote: isRTL ? '⚠ تأكد أن الدومين غير مربوط باستضافة أخرى أو قوالب أخرى' : '⚠ Make sure the domain is not linked to another hosting or templates',
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
      payment_reference: paymentRef || (paymentConfirmed ? 'GATEWAY-' + Date.now() : 'SETUP-' + Date.now()),
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
      }
      setBuildProgress(prev => [...prev, steps[steps.length - 1].msg]);
      setResult(data);
      await new Promise(r => setTimeout(r, 800));
      setStep(5);
    } catch (err) {
      setBuildProgress(prev => [...prev, '❌ ' + (err.error || 'Build failed')]);
      setBuildError(err.error || (isRTL ? 'فشل بناء الموقع' : 'Site build failed'));
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
                  ) : t.checkDns}
                </button>
              )}

              {/* DNS status indicator */}
              {dnsPartial && !dnsVerified && (
                <div className="space-y-1 text-xs text-center">
                  <p className={dnsPartial.dnsOk ? 'text-emerald-400' : 'text-red-400'}>
                    {dnsPartial.dnsOk ? t.dnsOnlyOk : t.dnsNotOk}
                  </p>
                </div>
              )}

              {dnsVerified && (
                <div className="space-y-1 text-center">
                  <p className="text-emerald-400 text-sm">{t.dnsOk}</p>
                  <p className="text-yellow-400/70 text-xs mt-1">{t.dnsOkNote}</p>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
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
                <a href={'https://' + result.site.domain + '/login?token=' + (result.token || localStorage.getItem('nf_token') || '')} className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors">{t.goToDashboard}</a>
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
