import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { templates as staticTemplates } from '../data/templates';

// ─── Terminal typing animation hook ───
function useTyping(text, speed = 30, startImmediately = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!startImmediately || !text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, startImmediately]);

  return { displayed, done };
}

// ─── Terminal Line Component ───
function TermLine({ prefix = '>', children, color = 'text-emerald-400', mono = true, delay = 0 }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);
  if (!visible) return null;
  return (
    <div className={`flex gap-2 items-start ${mono ? 'font-mono' : ''} text-sm leading-relaxed`}>
      <span className={`${color} flex-shrink-0 select-none`}>{prefix}</span>
      <span className="text-gray-300 flex-1">{children}</span>
    </div>
  );
}

// ─── Blinking Cursor ───
function Cursor() {
  return <span className="inline-block w-2.5 h-5 bg-emerald-400 animate-pulse ml-0.5 align-middle" />;
}

// ─── Main Terminal Setup Page ───
export default function TerminalSetupPage() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const templateId = searchParams.get('template') || 'digital-services-store';
  const plan = searchParams.get('plan') || 'monthly';
  const paymentRef = searchParams.get('payment_ref') || '';

  const templateData = staticTemplates.find(t => t.id === templateId);
  const templateName = isRTL ? (templateData?.name || templateId) : (templateData?.nameEn || templateId);

  // ─── State ───
  // 0=intro, 1=purchaseCode, 2=domain, 3=dns, 4=account, 5=email, 6=storeName, 7=building, 8=done
  const [phase, setPhase] = useState(0);
  const [purchaseCode, setPurchaseCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeInfo, setCodeInfo] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
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
  const [introComplete, setIntroComplete] = useState(false);
  const [dnsChecking, setDnsChecking] = useState(false);
  const [dnsVerified, setDnsVerified] = useState(false);
  const [dnsResult, setDnsResult] = useState(null);

  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  });

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [phase]);

  // ─── Intro typing effect ───
  const introText = isRTL
    ? `NEXIRO-FLUX — نظام إعداد المواقع v2.0\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nالقالب: ${templateName}\nالخطة: ${plan}\n\nجاري تهيئة بيئة الإعداد...`
    : `NEXIRO-FLUX — Site Setup System v2.0\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTemplate: ${templateName}\nPlan: ${plan}\n\nInitializing setup environment...`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroComplete(true);
      setPhase(1);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // ─── Validate purchase code ───
  const validatePurchaseCode = useCallback(async () => {
    if (!purchaseCode.trim()) {
      setError(isRTL ? 'يرجى إدخال كود الشراء' : 'Please enter a purchase code');
      return;
    }
    setCodeLoading(true);
    setError('');
    try {
      const res = await api.validatePurchaseCode(purchaseCode.trim().toUpperCase(), templateId);
      setCodeVerified(true);
      setCodeInfo(res);
      setTimeout(() => setPhase(2), 600);
    } catch (err) {
      setError(err.error || err.errorEn || (isRTL ? 'كود غير صالح' : 'Invalid code'));
    } finally {
      setCodeLoading(false);
    }
  }, [purchaseCode, templateId, isRTL]);

  // ─── Build progress simulation ───
  const runBuild = useCallback(async () => {
    setPhase(7);
    const steps = isRTL ? [
      { msg: '🔗 جارٍ الاتصال بالخادم...', delay: 600 },
      { msg: '📦 إنشاء قاعدة بيانات الموقع...', delay: 800 },
      { msg: '👤 إنشاء حساب المدير...', delay: 600 },
      { msg: '🎨 تطبيق إعدادات القالب...', delay: 700 },
      { msg: '📧 تهيئة خدمة البريد...', delay: 500 },
      { msg: '🌐 ربط الدومين...', delay: 900 },
      { msg: '🔐 تفعيل شهادة SSL...', delay: 800 },
      { msg: '✅ البناء اكتمل بنجاح!', delay: 400 },
    ] : [
      { msg: '🔗 Connecting to server...', delay: 600 },
      { msg: '📦 Creating site database...', delay: 800 },
      { msg: '👤 Creating admin account...', delay: 600 },
      { msg: '🎨 Applying template settings...', delay: 700 },
      { msg: '📧 Configuring email service...', delay: 500 },
      { msg: '🌐 Linking domain...', delay: 900 },
      { msg: '🔐 Activating SSL certificate...', delay: 800 },
      { msg: '✅ Build completed successfully!', delay: 400 },
    ];

    setBuildProgress([]);

    // Start the actual API call
    const apiPromise = api.provisionSite({
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_password: ownerPassword,
      template_id: templateId,
      billing_cycle: codeInfo?.billing_cycle || plan,
      store_name: storeName,
      custom_domain: domain.toLowerCase().replace(/\s/g, ''),
      payment_method: codeVerified ? 'purchase_code' : 'manual',
      payment_reference: paymentRef || 'SETUP-' + Date.now(),
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

    // Animate progress lines
    for (let i = 0; i < steps.length - 1; i++) {
      await new Promise(r => setTimeout(r, steps[i].delay));
      setBuildProgress(prev => [...prev, steps[i].msg]);
    }

    // Wait for API result
    try {
      const data = await apiPromise;
      // Save auth
      if (data.token) {
        localStorage.setItem('nf_token', data.token);
        localStorage.setItem('nf_user', JSON.stringify(data.user));
        localStorage.setItem('nf_site', JSON.stringify(data.site));
      }
      setBuildProgress(prev => [...prev, steps[steps.length - 1].msg]);
      setResult(data);
      await new Promise(r => setTimeout(r, 1000));
      setPhase(8);
    } catch (err) {
      setBuildProgress(prev => [...prev, `❌ ${err.error || 'Build failed'}`]);
      setError(err.error || (isRTL ? 'فشل بناء الموقع' : 'Site build failed'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerName, ownerEmail, ownerPassword, storeName, domain, templateId, plan, paymentRef, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, templateData, isRTL, codeVerified, purchaseCode, codeInfo]);

  // ─── Check DNS for domain ───
  const checkDNS = useCallback(async () => {
    const domainToCheck = domain ? domain.toLowerCase().replace(/\s/g, '') : '';
    if (!domainToCheck) return;
    setDnsChecking(true);
    setError('');
    setDnsResult(null);
    try {
      const result = await api.checkDomainDNS(domainToCheck);
      setDnsResult(result);
      if (result.verified) {
        setDnsVerified(true);
      } else {
        setError(isRTL ? result.message : result.messageEn);
      }
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل التحقق من DNS' : 'DNS check failed'));
    } finally {
      setDnsChecking(false);
    }
  }, [domain, isRTL]);

  // ─── Handle Enter key for each phase ───
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    setError('');

    switch (phase) {
      case 1: // Purchase code
        validatePurchaseCode();
        break;
      case 2: // Domain
        if (!domain.trim()) {
          setError(isRTL ? 'يرجى إدخال الدومين' : 'Please enter a domain');
          return;
        }
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i.test(domain.trim())) {
          setError(isRTL ? 'يرجى إدخال دومين صحيح مثل: example.com' : 'Please enter a valid domain like: example.com');
          return;
        }
        setPhase(3);
        break;
      case 3: // DNS verification — requires verified or skip
        if (!dnsVerified) {
          checkDNS();
          return;
        }
        setPhase(4);
        break;
      case 4: // Account info
        if (!ownerName.trim() || !ownerEmail.trim() || !ownerPassword.trim()) {
          setError(isRTL ? 'جميع حقول الحساب مطلوبة' : 'All account fields are required');
          return;
        }
        if (ownerPassword.length < 6) {
          setError(isRTL ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters');
          return;
        }
        if (!/\S+@\S+\.\S+/.test(ownerEmail)) {
          setError(isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address');
          return;
        }
        setPhase(5);
        break;
      case 5: // Email / SMTP → optional, Enter to skip or continue
        setPhase(6);
        break;
      case 6: // Store name
        if (!storeName.trim()) {
          setError(isRTL ? 'اسم المتجر مطلوب' : 'Store name is required');
          return;
        }
        runBuild();
        break;
      default:
        break;
    }
  };

  // ─── Computed values ───
  const fullDomain = domain ? domain.toLowerCase().replace(/\s/g, '') : '';
  const serverIP = '154.56.60.195'; // Hosting server IP

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-2 sm:p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-2xl">
        {/* ─── Terminal Window ─── */}
        <div className="rounded-lg overflow-hidden border border-white/[0.06]">
          {/* Title Bar — minimal */}
          <div className="bg-[#111] px-3 py-2 flex items-center gap-2 border-b border-white/[0.04]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-gray-600 text-[10px] font-mono mx-auto">setup@nexiro-flux ~ </span>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            className="bg-[#0a0a0a] p-4 sm:p-5 min-h-[70vh] max-h-[85vh] overflow-y-auto font-mono text-[13px] leading-[1.7] space-y-0"
            dir="ltr"
          >
            {/* ═══ Intro ═══ */}
            <pre className="text-emerald-500/80 whitespace-pre-wrap text-[10px] select-none mb-3">
{` ███╗   ██╗███████╗██╗  ██╗██╗██████╗  ██████╗ 
 ████╗  ██║██╔════╝╚██╗██╔╝██║██╔══██╗██╔═══██╗
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║██████╔╝██║   ██║
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║██╔══██╗██║   ██║
 ██║ ╚████║███████╗██╔╝ ╚██╗██║██║  ██║╚██████╔╝
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝`}
            </pre>
            <div className="text-gray-500 text-xs mb-1">
              {isRTL ? `القالب: ${templateName} | الخطة: ${plan}` : `template: ${templateName} | plan: ${plan}`}
            </div>
            <div className="text-gray-600 text-xs mb-4">{'─'.repeat(50)}</div>

            {!introComplete && (
              <div className="text-yellow-500/70 text-xs">{isRTL ? 'جارٍ التهيئة...' : 'initializing...'} <Cursor /></div>
            )}

            {/* ═══ Phase 1: Purchase Code ═══ */}
            {phase >= 1 && introComplete && (
              <>
                <div className="text-cyan-400 text-xs">{isRTL ? '── كود الشراء ──' : '── purchase code ──'}</div>
                {phase === 1 ? (
                  <>
                    <div className="text-gray-400 text-xs mt-1">{isRTL ? 'أدخل كود التفعيل:' : 'enter activation code:'}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-emerald-500 mr-1.5 select-none text-xs">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={purchaseCode}
                        onChange={e => setPurchaseCode(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        placeholder="NX-XXXX-XXXX-XXXX"
                        disabled={codeLoading}
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono tracking-wider"
                        autoFocus
                      />
                    </div>
                    {codeLoading && <div className="text-yellow-500/70 text-xs mt-1">{isRTL ? 'جارٍ التحقق...' : 'verifying...'} <Cursor /></div>}
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 text-xs">code: <span className="text-emerald-400">{purchaseCode}</span> <span className="text-green-600">✓</span></div>
                    {codeInfo?.discount_type === 'full' && <div className="text-gray-600 text-xs">{isRTL ? 'النوع: مجاني بالكامل' : 'type: full access'}</div>}
                    {codeInfo?.discount_type === 'percentage' && <div className="text-gray-600 text-xs">{isRTL ? `النوع: خصم ${codeInfo.discount_value}%` : `type: ${codeInfo.discount_value}% discount`}</div>}
                  </>
                )}
              </>
            )}

            {/* ═══ Phase 2: Domain ═══ */}
            {phase >= 2 && (
              <>
                <div className="text-cyan-400 text-xs mt-3">{isRTL ? '── الدومين ──' : '── domain ──'}</div>
                {phase === 2 ? (
                  <>
                    <div className="text-gray-400 text-xs mt-1">{isRTL ? 'أدخل دومين موقعك:' : 'enter your domain:'}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-emerald-500 mr-1.5 select-none text-xs">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={domain}
                        onChange={e => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.\-]/g, ''))}
                        onKeyDown={handleKeyDown}
                        placeholder="mystore.com"
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono"
                        autoFocus
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">domain: <span className="text-emerald-400">{fullDomain}</span> <span className="text-green-600">✓</span></div>
                )}
              </>
            )}

            {/* ═══ Phase 3: DNS ═══ */}
            {phase >= 3 && (
              <>
                <div className="text-cyan-400 text-xs mt-3">{isRTL ? '── إعداد DNS ──' : '── dns setup ──'}</div>
                <div className="text-yellow-500/80 text-xs mt-1">
                  {isRTL
                    ? `أضف السجل التالي في لوحة تحكم دومينك (${fullDomain}):`
                    : `add this record in your domain panel (${fullDomain}):`}
                </div>
                <div className="text-gray-300 text-xs mt-1 pl-2 border-l border-gray-800">
                  <div>Type: <span className="text-white">A</span></div>
                  <div>Name: <span className="text-white">@</span></div>
                  <div>Value: <span className="text-emerald-400 cursor-pointer hover:underline" onClick={() => navigator.clipboard.writeText(serverIP)}>{serverIP}</span> <span className="text-gray-600 text-[10px]">(click to copy)</span></div>
                </div>
                <div className="text-gray-600 text-[10px] mt-1 pl-2">
                  {isRTL ? 'أو CNAME → @' : 'or CNAME → @'} → nexiroflux.com
                </div>

                {phase === 3 ? (
                  <>
                    <div className="text-gray-500 text-[11px] mt-2">
                      {isRTL
                        ? '⏳ بعد الإضافة، انتظر 5-10 دقائق ثم اضغط Enter للتحقق'
                        : '⏳ after adding, wait 5-10 min then press Enter to verify'}
                    </div>

                    {/* DNS result */}
                    {dnsResult && !dnsResult.verified && (
                      <div className="mt-1">
                        <div className="text-red-400 text-xs">
                          ✗ {isRTL ? 'الدومين لا يشير إلى سيرفرنا بعد' : 'domain not pointing to our server yet'}
                        </div>
                        {dnsResult.dns?.current_ip && (
                          <div className="text-gray-500 text-[10px] pl-2">
                            {isRTL ? `حالياً: ${dnsResult.dns.current_ip} — المطلوب: ${dnsResult.server_ip}` : `current: ${dnsResult.dns.current_ip} — expected: ${dnsResult.server_ip}`}
                          </div>
                        )}
                        {dnsResult.dns?.type === 'NONE' && (
                          <div className="text-gray-500 text-[10px] pl-2">{isRTL ? 'لا توجد سجلات DNS' : 'no dns records found'}</div>
                        )}
                      </div>
                    )}

                    {dnsResult?.verified && (
                      <div className="text-emerald-400 text-xs mt-1">
                        ✓ {isRTL ? 'DNS يشير بشكل صحيح — اضغط Enter للمتابعة' : 'dns verified — press Enter to continue'}
                      </div>
                    )}

                    {dnsChecking && <div className="text-yellow-500/70 text-xs mt-1">{isRTL ? 'جارٍ التحقق...' : 'checking dns...'} <Cursor /></div>}

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center">
                        <span className="text-emerald-500 mr-1.5 select-none text-xs">$</span>
                        <span className="text-gray-600 text-xs cursor-pointer hover:text-gray-400" onClick={() => { setError(''); checkDNS(); }}>
                          [{isRTL ? 'Enter = تحقق' : 'Enter = verify'}]
                        </span>
                      </div>
                      <span className="text-gray-700 text-xs cursor-pointer hover:text-gray-500" onClick={() => { setDnsVerified(false); setPhase(4); }}>
                        [{isRTL ? 'S = تخطي' : 'S = skip'}]
                      </span>
                    </div>

                    <input
                      ref={inputRef}
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); setError(''); checkDNS(); }
                        if (e.key === 's' || e.key === 'S') { e.preventDefault(); setDnsVerified(false); setPhase(4); }
                      }}
                      className="opacity-0 absolute w-0 h-0"
                      autoFocus
                    />
                  </>
                ) : (
                  <div className={`text-xs mt-1 ${dnsVerified ? 'text-emerald-400' : 'text-yellow-500/70'}`}>
                    {dnsVerified
                      ? (isRTL ? 'dns: موثق ✓' : 'dns: verified ✓')
                      : (isRTL ? 'dns: تم التخطي — يمكن الإعداد لاحقاً' : 'dns: skipped — set up later')}
                  </div>
                )}
              </>
            )}

            {/* ═══ Phase 4: Account ═══ */}
            {phase >= 4 && (
              <>
                <div className="text-cyan-400 text-xs mt-3">{isRTL ? '── حساب المدير ──' : '── admin account ──'}</div>
                {phase === 4 ? (
                  <div className="space-y-1.5 mt-1" onKeyDown={handleKeyDown}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-20 text-right">{isRTL ? 'الاسم:' : 'name:'}</span>
                      <span className="text-emerald-500 text-xs">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('setup-email')?.focus(); }}}
                        placeholder={isRTL ? 'أحمد' : 'Ahmed'}
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-20 text-right">{isRTL ? 'البريد:' : 'email:'}</span>
                      <span className="text-emerald-500 text-xs">$</span>
                      <input
                        id="setup-email"
                        type="email"
                        value={ownerEmail}
                        onChange={e => setOwnerEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('setup-password')?.focus(); }}}
                        placeholder="admin@example.com"
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-20 text-right">{isRTL ? 'كلمة السر:' : 'password:'}</span>
                      <span className="text-emerald-500 text-xs">$</span>
                      <input
                        id="setup-password"
                        type="password"
                        value={ownerPassword}
                        onChange={e => setOwnerPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="••••••"
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono"
                      />
                    </div>
                    <div className="text-gray-700 text-[10px] pl-24">{isRTL ? 'Enter بعد كلمة السر للمتابعة' : 'Enter after password to continue'}</div>
                  </div>
                ) : (
                  <div className="text-xs space-y-0">
                    <div className="text-gray-400">name: <span className="text-emerald-400">{ownerName}</span> <span className="text-green-600">✓</span></div>
                    <div className="text-gray-400">email: <span className="text-emerald-400">{ownerEmail}</span> <span className="text-green-600">✓</span></div>
                    <div className="text-gray-400">password: <span className="text-emerald-400">••••••</span> <span className="text-green-600">✓</span></div>
                  </div>
                )}
              </>
            )}

            {/* ═══ Phase 5: SMTP ═══ */}
            {phase >= 5 && (
              <>
                <div className="text-cyan-400 text-xs mt-3">{isRTL ? '── البريد (اختياري) ──' : '── email smtp (optional) ──'}</div>
                <div className="text-gray-600 text-[10px] mt-0.5">
                  {isRTL ? 'بيانات SMTP من لوحة الاستضافة — أو اضغط Enter للتخطي' : 'smtp credentials from your hosting panel — or press Enter to skip'}
                </div>
                {phase === 5 ? (
                  <div className="space-y-1.5 mt-1" onKeyDown={handleKeyDown}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-20 text-right">host:</span>
                      <span className="text-emerald-500 text-xs">$</span>
                      <input ref={inputRef} type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (!smtpHost) { setPhase(6); return; } document.getElementById('smtp-port')?.focus(); }}}
                        placeholder="smtp.hostinger.com"
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono" />
                    </div>
                    {smtpHost && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-20 text-right">port:</span>
                          <span className="text-emerald-500 text-xs">$</span>
                          <input id="smtp-port" type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-user')?.focus(); }}}
                            placeholder="465"
                            className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-20 text-right">{isRTL ? 'المستخدم:' : 'user:'}</span>
                          <span className="text-emerald-500 text-xs">$</span>
                          <input id="smtp-user" type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-pass')?.focus(); }}}
                            placeholder="info@domain.com"
                            className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-20 text-right">{isRTL ? 'كلمة السر:' : 'pass:'}</span>
                          <span className="text-emerald-500 text-xs">$</span>
                          <input id="smtp-pass" type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-from')?.focus(); }}}
                            placeholder="••••••"
                            className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-20 text-right">{isRTL ? 'المرسل:' : 'from:'}</span>
                          <span className="text-emerald-500 text-xs">$</span>
                          <input id="smtp-from" type="text" value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="noreply@domain.com"
                            className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono" />
                        </div>
                      </>
                    )}
                    <div className="text-gray-700 text-[10px] pl-24">
                      {smtpHost
                        ? (isRTL ? 'Enter بعد آخر حقل للمتابعة' : 'Enter after last field to continue')
                        : (isRTL ? 'Enter للتخطي' : 'Enter to skip')}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs mt-0.5">
                    {smtpHost ? (
                      <div className="text-gray-400">smtp: <span className="text-emerald-400">{smtpHost}:{smtpPort}</span> <span className="text-green-600">✓</span></div>
                    ) : (
                      <div className="text-yellow-500/60">{isRTL ? 'تم التخطي' : 'skipped'}</div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ═══ Phase 6: Store Name ═══ */}
            {phase >= 6 && (
              <>
                <div className="text-cyan-400 text-xs mt-3">{isRTL ? '── اسم المتجر ──' : '── store name ──'}</div>
                {phase === 6 ? (
                  <>
                    <div className="text-gray-400 text-xs mt-1">{isRTL ? 'أدخل اسم موقعك:' : 'enter your site name:'}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-emerald-500 mr-1.5 select-none text-xs">$</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={storeName}
                        onChange={e => setStoreName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRTL ? 'متجر أحمد' : 'Ahmed Store'}
                        className="flex-1 bg-transparent text-white text-sm outline-none caret-emerald-400 placeholder:text-gray-800 font-mono"
                        autoFocus
                      />
                    </div>
                    <div className="text-gray-700 text-[10px] mt-1">{isRTL ? 'Enter لبدء البناء 🚀' : 'Enter to start build 🚀'}</div>
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">name: <span className="text-emerald-400">{storeName}</span> <span className="text-green-600">✓</span></div>
                )}
              </>
            )}

            {/* ═══ Phase 7: Building ═══ */}
            {phase === 7 && (
              <>
                <div className="text-gray-600 text-xs mt-3">{'─'.repeat(50)}</div>
                <div className="text-yellow-500 text-xs mt-1">{isRTL ? 'جارٍ بناء الموقع...' : 'building site...'}</div>
                <div className="w-full bg-white/[0.03] h-0.5 mt-2 mb-2 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-emerald-500/60 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.min(100, (buildProgress.length / 8) * 100)}%` }}
                  />
                </div>
                {buildProgress.map((msg, i) => (
                  <div key={i} className="text-gray-500 text-xs">  {msg}</div>
                ))}
                {!error && buildProgress.length < 8 && <Cursor />}
              </>
            )}

            {/* ═══ Phase 8: Done ═══ */}
            {phase === 8 && result && (
              <>
                <div className="text-gray-600 text-xs mt-3">{'─'.repeat(50)}</div>
                <div className="text-emerald-400 text-xs mt-2">
                  ✓ {isRTL ? 'تم بناء الموقع بنجاح!' : 'site built successfully!'}
                </div>
                <div className="text-xs mt-2 space-y-0.5 pl-2 border-l border-emerald-500/20">
                  <div className="text-gray-400">{isRTL ? 'الاسم' : 'name'}: <span className="text-white">{result.site?.name}</span></div>
                  <div className="text-gray-400">{isRTL ? 'الرابط' : 'url'}: <span className="text-emerald-400">{result.site?.domain}</span></div>
                  <div className="text-gray-400">{isRTL ? 'الخطة' : 'plan'}: <span className="text-cyan-400">{result.site?.plan}</span></div>
                  <div className="text-gray-400">{isRTL ? 'الحالة' : 'status'}: <span className="text-emerald-400">● {isRTL ? 'نشط' : 'active'}</span></div>
                  {result.subscription?.trial_ends_at && (
                    <div className="text-gray-400">{isRTL ? 'تجريبي' : 'trial'}: <span className="text-yellow-400">{isRTL ? '14 يوم' : '14 days'}</span></div>
                  )}
                </div>

                <div className="text-gray-600 text-xs mt-4">{'─'.repeat(50)}</div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <div
                    className="text-emerald-400 text-xs cursor-pointer hover:text-emerald-300 transition-colors"
                    onClick={() => navigate('/admin')}
                  >
                    $ <span className="underline underline-offset-2">{isRTL ? 'الدخول للوحة التحكم' : 'open dashboard'}</span> →
                  </div>
                  <div
                    className="text-gray-400 text-xs cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => window.open(`https://${result.site?.domain}`, '_blank')}
                  >
                    $ <span className="underline underline-offset-2">{isRTL ? 'زيارة الموقع' : 'visit site'}</span> ↗
                  </div>
                  <div
                    className="text-gray-500 text-xs cursor-pointer hover:text-gray-400 transition-colors"
                    onClick={() => navigate('/my-dashboard')}
                  >
                    $ <span className="underline underline-offset-2">{isRTL ? 'إدارة موقعي' : 'my dashboard'}</span>
                  </div>
                </div>
              </>
            )}

            {/* ═══ Error Display ═══ */}
            {error && (
              <div className="mt-2">
                <div className="text-red-400 text-xs">✗ {error}</div>
                {phase === 7 && (
                  <div className="text-yellow-500 text-xs cursor-pointer hover:text-yellow-400 mt-1" onClick={() => { setError(''); runBuild(); }}>
                    $ {isRTL ? 'إعادة المحاولة' : 'retry'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
