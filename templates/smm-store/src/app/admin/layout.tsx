'use client';

import { useState, useEffect, ReactNode, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import SmmSidebar from '@/components/admin/SmmSidebar';
import SmmDashHeader from '@/components/admin/SmmDashHeader';
import SmmOverviewPage from './pages/SmmOverviewPage';
import SmmProductsPage from './pages/SmmProductsPage';
import SmmOrdersPage from './pages/SmmOrdersPage';
import SmmCustomersPage from './pages/SmmCustomersPage';
import SmmPaymentsPage from './pages/SmmPaymentsPage';
import SmmSourcesPage from './pages/SmmSourcesPage';
import SmmBlogAdminPage from './pages/SmmBlogAdminPage';
import SmmChatPage from './pages/SmmChatPage';
import SmmCustomizePage from './pages/SmmCustomizePage';
import SmmAnnouncementsPage from './pages/SmmAnnouncementsPage';
import SmmSettingsPage from './pages/SmmSettingsPage';
import { Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from 'lucide-react';

export default function SmmAdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0e1a' }}><div className="spinner" /></div>}>
      <SmmAdminLayoutInner>{children}</SmmAdminLayoutInner>
    </Suspense>
  );
}

function SmmAdminLayoutInner({ children }: { children: ReactNode }) {
  const { currentTheme, darkMode, setDarkMode, t, isRTL, formatPrice, buttonRadius } = useTheme();
  const searchParams = useSearchParams();

  // Auth states
  const [slugVerified, setSlugVerified] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Layout
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overviewReload, setOverviewReload] = useState(0);

  const bg = darkMode ? '#080c18' : '#f1f5f9';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#141830' : '#fff';
  const border = darkMode ? '#1e2642' : '#e2e8f0';

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Demo mode
      const demoParam = searchParams.get('demo');
      const sessionDemo = typeof window !== 'undefined' && sessionStorage.getItem('demo_mode');
      if (demoParam === '1' || sessionDemo === '1') {
        if (typeof window !== 'undefined') sessionStorage.setItem('demo_mode', '1');
        setDemoMode(true);
        setSlugVerified(true);
        setAuthed(true);
        setLoading(false);
        return;
      }

      // Slug verification
      const keyParam = searchParams.get('key');
      const sessionSlug = typeof window !== 'undefined' ? sessionStorage.getItem('admin_slug') : null;
      const slug = keyParam || sessionSlug;

      if (slug) {
        try {
          const res = await fetch(`/api/customization/verify-slug/${slug}`);
          if (res.ok) {
            if (typeof window !== 'undefined') sessionStorage.setItem('admin_slug', slug);
            setSlugVerified(true);
          }
        } catch {}
      }

      // JWT check
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;
      if (token) setAuthed(true);

      setLoading(false);
    };
    checkAuth();
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user?.role === 'admin') {
        localStorage.setItem('admin_key', data.token);
        setAuthed(true);
      } else {
        setLoginError(t('بيانات الدخول غير صحيحة أو ليس لديك صلاحية الوصول'));
      }
    } catch {
      setLoginError(t('خطأ في الاتصال بالسيرفر'));
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    setAuthed(false);
  };

  // Loading
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: bg }}>
        <div style={{ textAlign: 'center' }}>
          <Zap size={40} style={{ color: currentTheme.primary, animation: 'pulse 1.5s infinite' }} />
          <p style={{ color: subtext, marginTop: 12, fontSize: 14 }}>{t('جاري التحميل...')}</p>
        </div>
      </div>
    );
  }

  // 404 — slug not verified
  if (!slugVerified && !demoMode) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: text, marginBottom: 8 }}>404</h1>
          <p style={{ color: subtext, fontSize: 15 }}>{t('الصفحة غير موجودة')}</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!authed && !demoMode) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
        background: darkMode
          ? `radial-gradient(circle at 30% 30%, ${currentTheme.primary}08, transparent 60%), radial-gradient(circle at 70% 70%, ${currentTheme.accent}06, transparent 60%), ${bg}`
          : `linear-gradient(135deg, ${bg}, ${currentTheme.primary}08)`,
      }}>
        <div style={{ width: '100%', maxWidth: 420, padding: 20 }}>
          <div style={{
            background: cardBg, borderRadius: 24, padding: 36,
            border: `1px solid ${border}`,
            boxShadow: darkMode ? `0 20px 60px rgba(0,0,0,0.4), ${currentTheme.glow}` : '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: currentTheme.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#fff',
                boxShadow: currentTheme.glow,
              }}>
                <Zap size={32} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: text }}>{t('لوحة التحكم')}</h1>
              <p style={{ color: subtext, fontSize: 13, marginTop: 6 }}>SMM Admin Panel</p>
            </div>

            {loginError && (
              <div style={{
                padding: 12, borderRadius: 12, background: '#ef444412',
                color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 16, textAlign: 'center',
              }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 6, display: 'block' }}>{t('البريد الإلكتروني')}</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={{
                    width: '100%', height: 44, padding: '0 16px',
                    border: `1px solid ${border}`, borderRadius: 12,
                    background: darkMode ? '#0f1322' : '#f8fafc',
                    color: text, fontSize: 14, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = currentTheme.primary}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 6, display: 'block' }}>{t('كلمة المرور')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%', height: 44, padding: '0 44px 0 16px',
                      border: `1px solid ${border}`, borderRadius: 12,
                      background: darkMode ? '#0f1322' : '#f8fafc',
                      color: text, fontSize: 14, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = currentTheme.primary}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    [isRTL ? 'left' : 'right']: 14,
                    background: 'none', border: 'none', color: subtext, cursor: 'pointer',
                  }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loginLoading} style={{
                background: currentTheme.gradient,
                borderRadius: Number(buttonRadius), width: '100%', padding: '13px',
                fontSize: 15, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: currentTheme.glow, transition: 'all 0.3s',
                opacity: loginLoading ? 0.7 : 1,
              }}>
                <Lock size={16} /> {loginLoading ? t('جاري الدخول...') : t('تسجيل الدخول')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin pages map
  const pages: Record<string, ReactNode> = {
    overview: <SmmOverviewPage theme={currentTheme} darkMode={darkMode} t={t} reload={overviewReload} />,
    products: <SmmProductsPage theme={currentTheme} darkMode={darkMode} t={t} formatPrice={formatPrice} buttonRadius={buttonRadius} />,
    orders: <SmmOrdersPage theme={currentTheme} darkMode={darkMode} t={t} formatPrice={formatPrice} isRTL={isRTL} buttonRadius={buttonRadius} />,
    customers: <SmmCustomersPage theme={currentTheme} darkMode={darkMode} t={t} formatPrice={formatPrice} isRTL={isRTL} />,
    payments: <SmmPaymentsPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    sources: <SmmSourcesPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    blog: <SmmBlogAdminPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    chat: <SmmChatPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    customize: <SmmCustomizePage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    announcements: <SmmAnnouncementsPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    settings: <SmmSettingsPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page === 'overview') setOverviewReload(prev => prev + 1);
  };

  // Mobile bottom nav items
  const mobileNavItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('الرئيسية') },
    { id: 'products', icon: Package, label: t('المنتجات') },
    { id: 'orders', icon: ShoppingCart, label: t('الطلبات') },
    { id: 'customers', icon: Users, label: t('العملاء') },
    { id: 'settings', icon: Settings, label: t('الإعدادات') },
  ];

  return (
    <div style={{ background: bg, minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <SmmSidebar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        theme={currentTheme}
        darkMode={darkMode}
        isRTL={isRTL}
        t={t}
        onLogout={handleLogout}
      />

      <main
        style={{
          [isRTL ? 'marginRight' : 'marginLeft']: sidebarCollapsed ? 70 : 260,
          transition: 'margin 0.2s ease', minHeight: '100vh',
        }}
        className="smm-admin-main"
      >
        <SmmDashHeader
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          theme={currentTheme}
          darkMode={darkMode}
          t={t}
          onToggleDark={() => setDarkMode(!darkMode)}
        />

        <div style={{ padding: '24px 24px 100px' }}>
          {pages[currentPage] || pages.overview}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="smm-admin-mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: cardBg, borderTop: `1px solid ${border}`,
        display: 'none', justifyContent: 'space-around', padding: '8px 0',
      }}>
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => handlePageChange(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? currentTheme.primary : subtext, padding: '4px 8px',
            }}>
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
