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
  const [phase, setPhase] = useState(0); // 0=intro, 1=domain, 2=dns, 3=account, 4=email, 5=storeName, 6=building, 7=done
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

  // ─── Build progress simulation ───
  const runBuild = useCallback(async () => {
    setPhase(6);
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
      billing_cycle: plan,
      store_name: storeName,
      domain_slug: domain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      payment_method: 'manual',
      payment_reference: paymentRef || 'SETUP-' + Date.now(),
      amount: templateData?.price?.[plan] || 0,
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
      setPhase(7);
    } catch (err) {
      setBuildProgress(prev => [...prev, `❌ ${err.error || 'Build failed'}`]);
      setError(err.error || (isRTL ? 'فشل بناء الموقع' : 'Site build failed'));
    }
  }, [ownerName, ownerEmail, ownerPassword, storeName, domain, templateId, plan, paymentRef, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, templateData, isRTL]);

  // ─── Handle Enter key for each phase ───
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    setError('');

    switch (phase) {
      case 1: // Domain
        if (!domain.trim()) {
          setError(isRTL ? 'يرجى إدخال اسم الدومين' : 'Please enter a domain name');
          return;
        }
        if (domain.trim().length < 3) {
          setError(isRTL ? 'اسم الدومين يجب أن يكون 3 أحرف على الأقل' : 'Domain must be at least 3 characters');
          return;
        }
        setPhase(2);
        break;
      case 2: // DNS confirmation → just press Enter to continue
        setPhase(3);
        break;
      case 3: // Account info
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
        setPhase(4);
        break;
      case 4: // Email / SMTP → optional, Enter to skip or continue
        setPhase(5);
        break;
      case 5: // Store name
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
  const fullDomain = domain ? `${domain.toLowerCase().replace(/[^a-z0-9-]/g, '')}.nexiroflux.com` : '';
  const serverIP = '154.56.60.195'; // Hosting server IP

  return (
    <div
      className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-3xl">
        {/* ─── Terminal Window ─── */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
          {/* Title Bar */}
          <div className="bg-[#1a1a2e] px-4 py-3 flex items-center gap-3 border-b border-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-gray-500 text-xs font-mono">
                nexiro-flux — site-setup
              </span>
            </div>
            <div className="w-14" />
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            className="bg-[#0d1117] p-6 min-h-[500px] max-h-[80vh] overflow-y-auto font-mono text-sm leading-relaxed space-y-1"
            dir="ltr"
          >
            {/* ═══ Phase 0: Intro ═══ */}
            <pre className="text-emerald-400 whitespace-pre-wrap text-xs mb-4 select-none">
{`
 ███╗   ██╗███████╗██╗  ██╗██╗██████╗  ██████╗ 
 ████╗  ██║██╔════╝╚██╗██╔╝██║██╔══██╗██╔═══██╗
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║██████╔╝██║   ██║
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║██╔══██╗██║   ██║
 ██║ ╚████║███████╗██╔╝ ╚██╗██║██║  ██║╚██████╔╝
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝`}
            </pre>

            <TermLine prefix="$" color="text-blue-400">
              {isRTL ? 'نظام إعداد المواقع — NEXIRO-FLUX v2.0' : 'NEXIRO-FLUX Site Setup System v2.0'}
            </TermLine>
            <TermLine prefix="→" color="text-gray-500">
              {isRTL ? `القالب: ${templateName} | الخطة: ${plan}` : `Template: ${templateName} | Plan: ${plan}`}
            </TermLine>

            {!introComplete && (
              <div className="mt-4">
                <TermLine prefix="⏳" color="text-yellow-500">
                  {isRTL ? 'جارٍ تهيئة البيئة...' : 'Initializing environment...'}
                  <Cursor />
                </TermLine>
              </div>
            )}

            {introComplete && <div className="border-t border-white/5 my-4" />}

            {/* ═══ Phase 1: Domain Input ═══ */}
            {phase >= 1 && introComplete && (
              <div className="space-y-2">
                <TermLine prefix="[1/5]" color="text-cyan-400">
                  {isRTL ? '🌐 أدخل اسم الدومين (الرابط) لموقعك:' : '🌐 Enter your site domain name:'}
                </TermLine>
                <TermLine prefix="" color="text-gray-600">
                  {isRTL
                    ? 'سيكون رابط موقعك: [اسمك].nexiroflux.com'
                    : 'Your site URL will be: [name].nexiroflux.com'}
                </TermLine>

                {phase === 1 ? (
                  <div className="mt-3 mb-2">
                    <div className="flex items-center gap-0">
                      <span className="text-emerald-400 mr-2 select-none">{'>'}</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={domain}
                        onChange={e => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        onKeyDown={handleKeyDown}
                        placeholder="my-store"
                        className="flex-1 bg-transparent text-white text-lg outline-none caret-emerald-400 placeholder:text-gray-700 font-mono"
                        autoFocus
                      />
                      <span className="text-gray-600 text-lg">.nexiroflux.com</span>
                    </div>
                    {domain && (
                      <div className="mt-2 ml-5">
                        <span className="text-gray-500 text-xs">
                          {isRTL ? 'الرابط الكامل: ' : 'Full URL: '}
                        </span>
                        <span className="text-emerald-400 text-xs">{fullDomain}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <TermLine prefix="✓" color="text-emerald-400">
                    {fullDomain}
                  </TermLine>
                )}
              </div>
            )}

            {/* ═══ Phase 2: DNS Instructions ═══ */}
            {phase >= 2 && (
              <div className="space-y-2 mt-4">
                <div className="border-t border-white/5 my-3" />
                <TermLine prefix="[2/5]" color="text-cyan-400">
                  {isRTL ? '🔧 إعداد DNS — توجيه الدومين' : '🔧 DNS Setup — Domain Pointing'}
                </TermLine>

                <div className="bg-[#161b22] rounded-xl p-4 border border-white/5 mt-2 space-y-3">
                  <p className="text-yellow-400 text-xs font-bold mb-2">
                    {isRTL ? '⚠️ مطلوب: أضف سجل DNS التالي في مزود الدومين:' : '⚠️ Required: Add this DNS record at your domain provider:'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1">Type</span>
                      <span className="text-white bg-white/5 px-2 py-1 rounded">A</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Name</span>
                      <span className="text-white bg-white/5 px-2 py-1 rounded">@</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Value</span>
                      <button 
                        onClick={() => {navigator.clipboard.writeText(serverIP)}}
                        className="text-emerald-400 bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {serverIP} 📋
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2">
                    <p className="text-gray-500 text-[11px]">
                      {isRTL ? 'أو بدل ذلك، أضف سجل CNAME:' : 'Or alternatively, add a CNAME record:'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                      <div>
                        <span className="text-white bg-white/5 px-2 py-1 rounded">CNAME</span>
                      </div>
                      <div>
                        <span className="text-white bg-white/5 px-2 py-1 rounded">@</span>
                      </div>
                      <div>
                        <button 
                          onClick={() => {navigator.clipboard.writeText('nexiroflux.com')}}
                          className="text-emerald-400 bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          nexiroflux.com 📋
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2">
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      {isRTL
                        ? '💡 يمكنك إعداد DNS لاحقًا. حالياً سيعمل موقعك على الرابط الفرعي ([اسمك].nexiroflux.com) بدون إعداد DNS.'
                        : '💡 You can configure DNS later. Your site will work on the subdomain ([name].nexiroflux.com) without DNS setup.'}
                    </p>
                  </div>
                </div>

                {phase === 2 ? (
                  <div className="mt-3">
                    <span className="text-gray-500 text-xs">
                      {isRTL ? 'اضغط Enter للمتابعة ←' : 'Press Enter to continue →'}
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      onKeyDown={handleKeyDown}
                      className="opacity-0 absolute w-0 h-0"
                      autoFocus
                    />
                    <Cursor />
                  </div>
                ) : (
                  <TermLine prefix="✓" color="text-emerald-400">
                    {isRTL ? 'DNS — تم التأكيد' : 'DNS — Confirmed'}
                  </TermLine>
                )}
              </div>
            )}

            {/* ═══ Phase 3: Account Info ═══ */}
            {phase >= 3 && (
              <div className="space-y-2 mt-4">
                <div className="border-t border-white/5 my-3" />
                <TermLine prefix="[3/5]" color="text-cyan-400">
                  {isRTL ? '👤 إنشاء حساب المدير (الأدمن):' : '👤 Create Admin Account:'}
                </TermLine>

                {phase === 3 ? (
                  <div className="space-y-4 mt-3" onKeyDown={handleKeyDown}>
                    {/* Name */}
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">
                        {isRTL ? 'الاسم الكامل:' : 'Full Name:'}
                      </span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={ownerName}
                          onChange={e => setOwnerName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('setup-email')?.focus(); }}}
                          placeholder={isRTL ? 'أحمد محمد' : 'Ahmed Mohammed'}
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">
                        {isRTL ? 'البريد:' : 'Email:'}
                      </span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          id="setup-email"
                          type="email"
                          value={ownerEmail}
                          onChange={e => setOwnerEmail(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('setup-password')?.focus(); }}}
                          placeholder="admin@example.com"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    {/* Password */}
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">
                        {isRTL ? 'كلمة المرور:' : 'Password:'}
                      </span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          id="setup-password"
                          type="password"
                          value={ownerPassword}
                          onChange={e => setOwnerPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="••••••••"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="ml-32">
                      <span className="text-gray-600 text-[11px]">
                        {isRTL ? 'اضغط Enter بعد كلمة المرور للمتابعة' : 'Press Enter after password to continue'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <TermLine prefix="✓" color="text-emerald-400">{ownerName}</TermLine>
                    <TermLine prefix="✓" color="text-emerald-400">{ownerEmail}</TermLine>
                    <TermLine prefix="✓" color="text-emerald-400">{'••••••••'}</TermLine>
                  </div>
                )}
              </div>
            )}

            {/* ═══ Phase 4: Email / SMTP ═══ */}
            {phase >= 4 && (
              <div className="space-y-2 mt-4">
                <div className="border-t border-white/5 my-3" />
                <TermLine prefix="[4/5]" color="text-cyan-400">
                  {isRTL ? '📧 إعداد البريد (SMTP) — اختياري:' : '📧 Email Setup (SMTP) — Optional:'}
                </TermLine>

                <div className="bg-[#161b22] rounded-xl p-4 border border-white/5 mt-2">
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">
                    {isRTL
                      ? '💡 للحصول على بيانات SMTP، ادخل لوحة تحكم استضافتك (مثل cPanel، Hostinger، Namecheap) → ابحث عن Email Accounts أو SMTP Settings.'
                      : '💡 To get SMTP credentials, go to your hosting panel (cPanel, Hostinger, Namecheap) → look for Email Accounts or SMTP Settings.'}
                  </p>
                  <div className="text-[11px] text-gray-500 space-y-1">
                    <p>• Hostinger: smtp.hostinger.com | Port: 465 (SSL)</p>
                    <p>• cPanel: mail.yourdomain.com | Port: 587 (TLS)</p>
                    <p>• Gmail: smtp.gmail.com | Port: 587 (App Password)</p>
                  </div>
                </div>

                {phase === 4 ? (
                  <div className="space-y-3 mt-3" onKeyDown={handleKeyDown}>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">SMTP Host:</span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={smtpHost}
                          onChange={e => setSmtpHost(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-port')?.focus(); }}}
                          placeholder="smtp.hostinger.com"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">Port:</span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          id="smtp-port"
                          type="text"
                          value={smtpPort}
                          onChange={e => setSmtpPort(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-user')?.focus(); }}}
                          placeholder="465"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">
                        {isRTL ? 'المستخدم:' : 'Username:'}
                      </span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          id="smtp-user"
                          type="text"
                          value={smtpUser}
                          onChange={e => setSmtpUser(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-pass')?.focus(); }}}
                          placeholder="info@yourdomain.com"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">
                        {isRTL ? 'كلمة المرور:' : 'Password:'}
                      </span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          id="smtp-pass"
                          type="password"
                          value={smtpPass}
                          onChange={e => setSmtpPass(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('smtp-from')?.focus(); }}}
                          placeholder="••••••••"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-28 text-right flex-shrink-0">
                        {isRTL ? 'بريد المرسل:' : 'From Email:'}
                      </span>
                      <div className="flex items-center flex-1">
                        <span className="text-emerald-400 mr-2">{'>'}</span>
                        <input
                          id="smtp-from"
                          type="text"
                          value={smtpFrom}
                          onChange={e => setSmtpFrom(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="noreply@yourdomain.com"
                          className="flex-1 bg-transparent text-white outline-none caret-emerald-400 placeholder:text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="ml-32">
                      <span className="text-gray-600 text-[11px]">
                        {isRTL 
                          ? 'اضغط Enter للمتابعة (اتركها فارغة لتخطي الإعداد)' 
                          : 'Press Enter to continue (leave empty to skip)'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {smtpHost ? (
                      <div className="space-y-1">
                        <TermLine prefix="✓" color="text-emerald-400">{smtpHost}:{smtpPort}</TermLine>
                        <TermLine prefix="✓" color="text-emerald-400">{smtpUser}</TermLine>
                      </div>
                    ) : (
                      <TermLine prefix="⊘" color="text-yellow-500">
                        {isRTL ? 'تم التخطي — سيتم استخدام البريد الافتراضي' : 'Skipped — default email will be used'}
                      </TermLine>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══ Phase 5: Store Name ═══ */}
            {phase >= 5 && (
              <div className="space-y-2 mt-4">
                <div className="border-t border-white/5 my-3" />
                <TermLine prefix="[5/5]" color="text-cyan-400">
                  {isRTL ? '🏪 اسم الموقع / المتجر:' : '🏪 Site / Store Name:'}
                </TermLine>

                {phase === 5 ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-0">
                      <span className="text-emerald-400 mr-2 select-none">{'>'}</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={storeName}
                        onChange={e => setStoreName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRTL ? 'متجر أحمد' : 'Ahmed Store'}
                        className="flex-1 bg-transparent text-white text-lg outline-none caret-emerald-400 placeholder:text-gray-700 font-mono"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 ml-5">
                      <span className="text-gray-600 text-[11px]">
                        {isRTL ? 'اضغط Enter لبدء بناء الموقع 🚀' : 'Press Enter to start building site 🚀'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <TermLine prefix="✓" color="text-emerald-400">{storeName}</TermLine>
                )}
              </div>
            )}

            {/* ═══ Phase 6: Building ═══ */}
            {phase === 6 && (
              <div className="space-y-2 mt-4">
                <div className="border-t border-white/5 my-3" />
                <TermLine prefix="$" color="text-yellow-400">
                  {isRTL ? 'جارٍ بناء الموقع...' : 'Building site...'}
                </TermLine>
                <div className="mt-2">
                  {/* Progress bar */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (buildProgress.length / 8) * 100)}%` }}
                    />
                  </div>
                  {buildProgress.map((msg, i) => (
                    <TermLine key={i} prefix="→" color="text-gray-500">{msg}</TermLine>
                  ))}
                  {!error && buildProgress.length < 8 && <Cursor />}
                </div>
              </div>
            )}

            {/* ═══ Phase 7: Done ═══ */}
            {phase === 7 && result && (
              <div className="space-y-2 mt-4">
                <div className="border-t border-white/5 my-3" />
                <pre className="text-emerald-400 whitespace-pre-wrap text-xs select-none mt-2">
{`
 ╔═══════════════════════════════════════════╗
 ║                                           ║
 ║   ✅  ${isRTL ? 'تم بناء الموقع بنجاح!' : 'Site Built Successfully!'}          ║
 ║                                           ║
 ╚═══════════════════════════════════════════╝`}
                </pre>

                <div className="bg-[#161b22] rounded-xl p-5 border border-emerald-500/20 mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{isRTL ? 'اسم الموقع' : 'Site Name'}</span>
                    <span className="text-white font-mono text-sm">{result.site?.name}</span>
                  </div>
                  <div className="border-t border-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{isRTL ? 'الرابط' : 'URL'}</span>
                    <span className="text-emerald-400 font-mono text-sm">{result.site?.domain}</span>
                  </div>
                  <div className="border-t border-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{isRTL ? 'الخطة' : 'Plan'}</span>
                    <span className="text-cyan-400 font-mono text-sm capitalize">{result.site?.plan}</span>
                  </div>
                  <div className="border-t border-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{isRTL ? 'الحالة' : 'Status'}</span>
                    <span className="text-emerald-400 font-mono text-sm">● {isRTL ? 'نشط' : 'Active'}</span>
                  </div>
                  {result.subscription?.trial_ends_at && (
                    <>
                      <div className="border-t border-white/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">{isRTL ? 'تجريبي' : 'Trial'}</span>
                        <span className="text-yellow-400 font-mono text-sm">{isRTL ? '14 يوم مجاني' : '14 days free'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 font-mono"
                  >
                    {'>'} {isRTL ? 'الدخول للوحة التحكم' : 'Open Dashboard'}
                  </button>
                  <button
                    onClick={() => window.open(`https://${result.site?.domain}`, '_blank')}
                    className="flex-1 bg-white/5 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2 font-mono"
                  >
                    {'>'} {isRTL ? 'زيارة الموقع' : 'Visit Site'} ↗
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/my-dashboard')}
                    className="text-gray-500 hover:text-white text-xs transition-colors font-mono"
                  >
                    {'>'} {isRTL ? 'الذهاب لإدارة موقعي' : 'Go to My Dashboard'}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ Error Display ═══ */}
            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <TermLine prefix="✗" color="text-red-400">{error}</TermLine>
                {phase === 6 && (
                  <button
                    onClick={() => { setError(''); runBuild(); }}
                    className="mt-2 text-yellow-400 text-xs hover:text-yellow-300 font-mono"
                  >
                    {'>'} {isRTL ? 'إعادة المحاولة' : 'Retry'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        {phase < 6 && (
          <p className="text-center text-gray-700 text-[11px] mt-3 font-mono">
            {isRTL ? 'اضغط Enter للمتابعة بين الخطوات' : 'Press Enter to navigate between steps'}
          </p>
        )}
      </div>
    </div>
  );
}
