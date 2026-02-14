import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { t, isRTL } = useLanguage();
  const { register, googleLogin, error: authError, setError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const displayError = localError || authError;
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setLocalError('');
      setError(null);
      try {
        const data = await googleLogin({ access_token: tokenResponse.access_token });
        navigate('/admin');
      } catch (err) {
        setLocalError(err.error || (isRTL ? 'فشل التسجيل عبر Google' : 'Google registration failed'));
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setLocalError(isRTL ? 'فشل التسجيل عبر Google' : 'Google registration failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!form.name || !form.email || !form.password) {
      setLocalError(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setLocalError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setLocalError(err.error || (isRTL ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Error Message */}
        {displayError && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{displayError}</p>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold">
              <span className="text-white">NEXIRO</span>
              <span className="text-primary-400">-</span>
              <span className="gradient-text">FLUX</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-black text-white mb-2">
            {t('auth.createAccount')}
          </h1>
          <p className="text-dark-400">{isRTL ? 'ابدأ رحلتك الرقمية الآن' : 'Start your digital journey now'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">{t('auth.name')}</label>
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 right-4 rtl:right-4 ltr:left-4 w-5 h-5 text-dark-500" />
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-12 py-3.5 rounded-xl bg-dark-800/50 border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 right-4 rtl:right-4 ltr:left-4 w-5 h-5 text-dark-500" />
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-12 py-3.5 rounded-xl bg-dark-800/50 border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 right-4 rtl:right-4 ltr:left-4 w-5 h-5 text-dark-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                className="w-full px-12 py-3.5 rounded-xl bg-dark-800/50 border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 left-4 rtl:left-4 ltr:right-4 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 right-4 rtl:right-4 ltr:left-4 w-5 h-5 text-dark-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                className="w-full px-12 py-3.5 rounded-xl bg-dark-800/50 border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRTL ? 'جارٍ الإنشاء...' : 'Creating account...'}
              </>
            ) : (
              t('auth.registerBtn')
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-transparent text-dark-500 text-sm">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={() => handleGoogleRegister()}
              disabled={googleLoading || loading}
              className="flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/10 transition-all text-sm font-medium text-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              )}
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/10 transition-all text-sm font-medium text-dark-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-dark-400 text-sm">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              {t('auth.loginBtn')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
