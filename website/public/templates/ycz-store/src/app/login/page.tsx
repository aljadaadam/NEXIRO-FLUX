'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Zap, Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

function LoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTheme();

  const [mode, setMode] = useState<'auto' | 'form'>('auto'); // auto = token redirect, form = manual login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If ?token= exists → auto-login (from platform dashboard)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setMode('auto');
      localStorage.setItem('admin_key', token);

      (async () => {
        let slug = searchParams.get('slug') || '';

        if (!slug) {
          try {
            const res = await fetch('/api/customization', {
              headers: { Authorization: `Bearer ${token}` },
              cache: 'no-store',
            });
            if (res.ok) {
              const data = await res.json();
              slug = data.admin_slug || data.customization?.admin_slug || '';
            }
          } catch { /* ignore */ }
        }

        if (slug) {
          sessionStorage.setItem('admin_slug', slug);
          router.replace(`/admin?key=${slug}`);
        } else {
          router.replace('/admin');
        }
      })();
    } else {
      // No token → show login form
      setMode('form');
    }
  }, [searchParams, router]);

  // Handle manual login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(t('البريد الإلكتروني وكلمة المرور مطلوبان'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('حدث خطأ أثناء تسجيل الدخول'));
        setLoading(false);
        return;
      }
      // Check admin role
      if (data.user?.role !== 'admin') {
        setError(t('هذا الحساب ليس حساب مدير'));
        setLoading(false);
        return;
      }
      // Save token
      localStorage.setItem('admin_key', data.token);
      // Redirect with slug
      const slug = data.admin_slug || '';
      if (slug) {
        sessionStorage.setItem('admin_slug', slug);
        router.replace(`/admin?key=${slug}`);
      } else {
        router.replace('/admin');
      }
    } catch {
      setError(t('لا يمكن الاتصال بالخادم'));
      setLoading(false);
    }
  }

  // Auto-login mode → show spinner
  if (mode === 'auto') {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'linear-gradient(135deg, #0b1020 0%, #1a1040 100%)',
        fontFamily: 'inherit',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c5cff, #6d4de6)',
            display: 'grid', placeItems: 'center',
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{t('جاري تسجيل الدخول...')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{t('يرجى الانتظار')}</p>
          <div style={{
            width: 32, height: 32, border: '3px solid #374151', borderTopColor: '#7c5cff',
            borderRadius: '50%', margin: '20px auto 0',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Login form mode
  return (
    <div dir="rtl" style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'linear-gradient(135deg, #0b1020 0%, #1a1040 50%, #0f0a2a 100%)',
      fontFamily: 'Tajawal, sans-serif', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c5cff, #6d4de6)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 8px 32px rgba(124, 92, 255, 0.3)',
          }}>
            <Zap size={32} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>{t('لوحة التحكم')}</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('سجّل الدخول للوصول إلى لوحة الإدارة')}</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleLogin} style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '2rem',
        }}>
          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 12, marginBottom: 20,
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171', fontSize: '0.82rem', fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
              {t('البريد الإلكتروني')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
                style={{
                  width: '100%', padding: '0.8rem 1rem 0.8rem 1rem',
                  paddingRight: 42, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.88rem',
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124, 92, 255, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
              {t('كلمة المرور')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                style={{
                  width: '100%', padding: '0.8rem 2.8rem 0.8rem 1rem',
                  paddingRight: 42, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.88rem',
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124, 92, 255, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
              background: loading ? '#5a41c9' : 'linear-gradient(135deg, #7c5cff, #6d4de6)',
              color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(124, 92, 255, 0.3)',
              transition: 'all 0.2s',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? t('جاري الدخول...') : t('تسجيل الدخول')}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.7rem', marginTop: 24 }}>
          NEXIRO-FLUX
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#0b1020',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid #374151', borderTopColor: '#7c5cff',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginHandler />
    </Suspense>
  );
}
