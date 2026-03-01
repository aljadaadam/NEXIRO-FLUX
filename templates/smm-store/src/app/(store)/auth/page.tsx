'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register' | 'otp';

export default function AuthPage() {
  const { currentTheme, darkMode, isRTL, t } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
  const [otpTarget, setOtpTarget] = useState('');

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await storeApi.login({ email: form.email, password: form.password });
        if ((res as Record<string, unknown>).requires_otp) {
          setOtpTarget(form.email);
          setMode('otp');
        } else {
          router.push('/');
          router.refresh();
        }
      } else if (mode === 'register') {
        const res = await storeApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
        if ((res as Record<string, unknown>).requires_otp) {
          setOtpTarget(form.email);
          setMode('otp');
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        await storeApi.verifyOtp({ email: otpTarget, code: form.otp });
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('حدث خطأ'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{
        width: 420, maxWidth: '100%',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: currentTheme.gradient,
            display: 'inline-grid', placeItems: 'center',
            boxShadow: `0 8px 32px ${currentTheme.primary}40`,
            marginBottom: 14,
          }}>
            <Zap size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
            {mode === 'login' ? t('تسجيل الدخول') : mode === 'register' ? t('إنشاء حساب') : t('رمز التحقق')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {mode === 'login' ? t('أدخل بياناتك للمتابعة') : mode === 'register' ? t('أنشئ حسابك الآن') : t('أدخل رمز التحقق المرسل')}
          </p>
        </div>

        <div className="neon-card" style={{ padding: '28px 24px' }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '0.82rem',
            }}>
              {error}
            </div>
          )}

          {mode === 'otp' ? (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 20 }}>
                {t('تم إرسال رمز التحقق إلى')} <strong>{otpTarget}</strong>
              </p>
              <InputField icon={<Lock size={18} />} placeholder={t('رمز التحقق')} value={form.otp} onChange={v => update('otp', v)} isRTL={isRTL} darkMode={darkMode} />
              <button
                onClick={handleAuth}
                disabled={loading}
                className="neon-btn"
                style={{ width: '100%', padding: '14px', background: currentTheme.gradient, color: '#fff', marginTop: 16 }}
              >
                {loading ? t('تحميل...') : t('تأكيد')}
              </button>
            </div>
          ) : (
            <div>
              {mode === 'register' && (
                <InputField icon={<User size={18} />} placeholder={t('الاسم')} value={form.name} onChange={v => update('name', v)} isRTL={isRTL} darkMode={darkMode} />
              )}
              <InputField icon={<Mail size={18} />} placeholder={t('البريد الإلكتروني')} type="email" value={form.email} onChange={v => update('email', v)} isRTL={isRTL} darkMode={darkMode} />
              <div style={{ position: 'relative' }}>
                <InputField icon={<Lock size={18} />} placeholder={t('كلمة المرور')} type={showPass ? 'text' : 'password'} value={form.password} onChange={v => update('password', v)} isRTL={isRTL} darkMode={darkMode} />
                <button
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    [isRTL ? 'left' : 'right']: 14,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'register' && (
                <InputField icon={<Phone size={18} />} placeholder={t('رقم الهاتف') + ' (' + t('اختياري') + ')'} value={form.phone} onChange={v => update('phone', v)} isRTL={isRTL} darkMode={darkMode} />
              )}

              <button
                onClick={handleAuth}
                disabled={loading}
                className="neon-btn"
                style={{ width: '100%', padding: '14px', background: currentTheme.gradient, color: '#fff', marginTop: 16 }}
              >
                {loading ? t('تحميل...') : mode === 'login' ? t('تسجيل الدخول') : t('إنشاء حساب')}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {mode === 'login' ? t('ليس لديك حساب؟') : t('لديك حساب بالفعل؟')}{' '}
                </span>
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: currentTheme.primary, fontWeight: 700, fontSize: '0.85rem',
                  }}
                >
                  {mode === 'login' ? t('إنشاء حساب') : t('تسجيل الدخول')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, placeholder, type = 'text', value, onChange, isRTL, darkMode }: {
  icon: React.ReactNode; placeholder: string; type?: string; value: string;
  onChange: (v: string) => void; isRTL: boolean; darkMode: boolean;
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [isRTL ? 'right' : 'left']: 14, color: 'var(--text-muted)',
      }}>
        {icon}
      </div>
      <input
        className="glass-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 44 }}
      />
    </div>
  );
}
