'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { storeApi } from '@/lib/api';

type Tab = 'login' | 'register' | 'forgot';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuth?: () => void;
  defaultTab?: Tab;
}

export default function LoginModal({ isOpen, onClose, onAuth, defaultTab }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Forgot field
  const [forgotEmail, setForgotEmail] = useState('');

  // OTP
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  // Escape key handler (using effect-free approach since modal only renders when open)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) onClose();
  };

  const clearFields = () => {
    setError(''); setSuccess('');
    setLoginEmail(''); setLoginPassword('');
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegPhone('');
    setForgotEmail(''); setOtpMode(false); setOtpCode('');
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true); setError('');
    try {
      const res = await storeApi.login({ email: loginEmail, password: loginPassword });
      if (res.otpRequired) {
        setOtpMode(true);
        setOtpEmail(loginEmail);
        setSuccess('تم إرسال رمز التحقق إلى بريدك');
      } else {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('customer', JSON.stringify(res.customer));
        setSuccess('تم تسجيل الدخول بنجاح');
        setTimeout(() => { onAuth?.(); onClose(); }, 600);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطأ في تسجيل الدخول');
    } finally { setLoading(false); }
  };

  const handleOtp = async () => {
    if (!otpCode) { setError('أدخل رمز التحقق'); return; }
    setLoading(true); setError('');
    try {
      const res = await storeApi.verifyOtp({ email: otpEmail, code: otpCode });
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('customer', JSON.stringify(res.customer));
      setSuccess('تم تسجيل الدخول بنجاح');
      setTimeout(() => { onAuth?.(); onClose(); }, 600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'رمز التحقق غير صحيح');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) { setError('يرجى ملء جميع الحقول المطلوبة'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    if (regPassword.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setLoading(true); setError('');
    try {
      const res = await storeApi.register({ name: regName, email: regEmail, password: regPassword, phone: regPhone || undefined });
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('customer', JSON.stringify(res.customer));
      setSuccess('تم إنشاء الحساب بنجاح!');
      setTimeout(() => { onAuth?.(); onClose(); }, 600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطأ في إنشاء الحساب');
    } finally { setLoading(false); }
  };

  const handleDemoLogin = () => {
    sessionStorage.setItem('demo_mode', '1');
    const demoCustomer = { id: 1, name: 'أحمد محمد', email: 'demo@stellar.store', phone: '+249912345678', wallet_balance: 500000, country: 'السودان', is_verified: true };
    localStorage.setItem('auth_token', 'demo-token-stellar');
    localStorage.setItem('customer', JSON.stringify(demoCustomer));
    setSuccess('تم الدخول بحساب تجريبي');
    setTimeout(() => { onAuth?.(); onClose(); }, 600);
  };

  const handleForgot = async () => {
    if (!forgotEmail) { setError('أدخل البريد الإلكتروني'); return; }
    setLoading(true); setError('');
    try {
      await storeApi.forgotPassword(forgotEmail);
      setSuccess('تم إرسال رابط الاستعادة إلى بريدك الإلكتروني');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطأ');
    } finally { setLoading(false); }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'login', label: 'دخول' },
    { key: 'register', label: 'تسجيل جديد' },
    { key: 'forgot', label: 'نسيان كلمة السر' },
  ];

  const inputClass = "w-full px-4 py-3.5 pr-12 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all";
  const passInputClass = "w-full px-12 py-3.5 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all";
  const btnClass = "w-full py-3.5 text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop" onClick={onClose} onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label="تسجيل الدخول">
      <div
        className="relative w-full max-w-md rounded-2xl bg-navy-900/95 backdrop-blur-2xl border border-navy-700/60 shadow-2xl shadow-black/40 animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 text-navy-400 hover:text-white transition-colors rounded-lg hover:bg-navy-800/50">
          <X className="w-5 h-5" />
        </button>

        <div className="pt-6 pb-4 text-center">
          <h2 className="text-xl font-black text-white">
            تسجيل الدخول / <span className="text-gold-gradient">إنشاء حساب</span>
          </h2>
        </div>

        {!otpMode && (
          <div className="flex gap-2 px-6 mb-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  tab === t.key
                    ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                    : 'bg-navy-800/60 text-navy-300 hover:text-white border border-navy-600/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="mx-6 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}

        <div className="px-6 pb-8 space-y-4">
          {/* OTP Mode */}
          {otpMode && (
            <>
              <p className="text-navy-400 text-sm text-center">أدخل رمز التحقق المرسل إلى بريدك</p>
              <div className="relative">
                <input type="text" placeholder="رمز التحقق" value={otpCode} onChange={e => setOtpCode(e.target.value)} className={inputClass} maxLength={6} />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <button onClick={handleOtp} disabled={loading} className={btnClass}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحقق'}
              </button>
              <button onClick={() => { setOtpMode(false); clearFields(); }} className="w-full text-sm text-navy-400 hover:text-gold-500 transition-colors">رجوع</button>
            </>
          )}

          {/* Login */}
          {!otpMode && tab === 'login' && (
            <>
              <div className="relative">
                <input type="email" placeholder="البريد الإلكتروني" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputClass} />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="كلمة المرور" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={passInputClass} />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleLogin} disabled={loading} className={btnClass}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
              </button>
              <div className="relative flex items-center my-2">
                <div className="flex-1 border-t border-navy-700/50"></div>
                <span className="px-3 text-navy-500 text-xs">أو</span>
                <div className="flex-1 border-t border-navy-700/50"></div>
              </div>
              <button onClick={handleDemoLogin} className="w-full py-3 text-sm font-bold text-gold-500 bg-gold-500/10 border border-gold-500/30 rounded-xl hover:bg-gold-500/20 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> جرّب بحساب تجريبي
              </button>
            </>
          )}

          {/* Register */}
          {!otpMode && tab === 'register' && (
            <>
              <div className="relative">
                <input type="text" placeholder="الاسم الكامل *" value={regName} onChange={e => setRegName(e.target.value)} className={inputClass} />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input type="email" placeholder="البريد الإلكتروني *" value={regEmail} onChange={e => setRegEmail(e.target.value)} className={inputClass} />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input type="tel" placeholder="رقم الهاتف (اختياري)" value={regPhone} onChange={e => setRegPhone(e.target.value)} className={inputClass} />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="كلمة المرور * (8 أحرف على الأقل)" value={regPassword} onChange={e => setRegPassword(e.target.value)} className={passInputClass} />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleRegister} disabled={loading} className={btnClass}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء حساب'}
              </button>
            </>
          )}

          {/* Forgot */}
          {!otpMode && tab === 'forgot' && (
            <>
              <p className="text-navy-400 text-sm text-center mb-2">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
              <div className="relative">
                <input type="email" placeholder="البريد الإلكتروني" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={inputClass} />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <button onClick={handleForgot} disabled={loading} className={btnClass}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال رابط الاستعادة'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
