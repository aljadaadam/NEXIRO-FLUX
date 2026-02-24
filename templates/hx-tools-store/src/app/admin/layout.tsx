'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHxTheme } from '@/providers/HxThemeProvider';
import HxSidebar from '@/components/admin/HxSidebar';
import HxDashHeader from '@/components/admin/HxDashHeader';
import HxOverviewPage from './pages/HxOverviewPage';
import HxProductsPage from './pages/HxProductsPage';
import HxOrdersAdminPage from './pages/HxOrdersAdminPage';
import HxCustomersPage from './pages/HxCustomersPage';
import HxPaymentsPage from './pages/HxPaymentsPage';
import HxDeliveryZonesPage from './pages/HxDeliveryZonesPage';
import HxCurrenciesPage from './pages/HxCurrenciesPage';
import HxCustomizePage from './pages/HxCustomizePage';
import HxAnnouncementsPage from './pages/HxAnnouncementsPage';
import HxSettingsAdminPage from './pages/HxSettingsAdminPage';
import { Lock, Eye, EyeOff, Wrench } from 'lucide-react';
import { LayoutDashboard, Package, ShoppingCart, Users, CreditCard, MapPin, DollarSign, Palette, Bell, Settings } from 'lucide-react';

export default function HxAdminLayout({ children }: { children: ReactNode }) {
  const { currentTheme, darkMode, t, isRTL, formatPrice, buttonRadius } = useHxTheme();
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

  const bg = darkMode ? '#0f172a' : '#f1f5f9';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const border = darkMode ? '#334155' : '#e2e8f0';

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Demo mode
      const demoParam = searchParams.get('demo');
      const sessionDemo = typeof window !== 'undefined' && sessionStorage.getItem('hx_demo_mode');
      if (demoParam === '1' || sessionDemo === '1') {
        if (typeof window !== 'undefined') sessionStorage.setItem('hx_demo_mode', '1');
        setDemoMode(true);
        setSlugVerified(true);
        setAuthed(true);
        setLoading(false);
        return;
      }

      // Slug verification
      const keyParam = searchParams.get('key');
      const sessionSlug = typeof window !== 'undefined' ? sessionStorage.getItem('hx_admin_slug') : null;
      const slug = keyParam || sessionSlug;

      if (slug) {
        try {
          const res = await fetch(`/api/customization/verify-slug/${slug}`);
          if (res.ok) {
            if (typeof window !== 'undefined') sessionStorage.setItem('hx_admin_slug', slug);
            setSlugVerified(true);
          }
        } catch {}
      }

      // JWT check
      const token = typeof window !== 'undefined' ? localStorage.getItem('hx_admin_key') : null;
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
        localStorage.setItem('hx_admin_key', data.token);
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
    localStorage.removeItem('hx_admin_key');
    setAuthed(false);
  };

  // Loading
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: bg }}>
        <div style={{ textAlign: 'center' }}>
          <Wrench size={40} style={{ color: currentTheme.primary, animation: 'spin 2s linear infinite' }} />
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
        background: `linear-gradient(135deg, ${darkMode ? '#0f172a' : '#f1f5f9'}, ${currentTheme.primary}08)`,
      }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
          <div style={{ background: cardBg, borderRadius: 24, padding: 32, border: `1px solid ${border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', color: '#fff', fontSize: 28,
              }}>🔧</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: text }}>{t('لوحة التحكم')}</h1>
              <p style={{ color: subtext, fontSize: 13, marginTop: 4 }}>HX Tools Admin</p>
            </div>

            {loginError && (
              <div style={{ padding: 12, borderRadius: 10, background: '#ef444412', color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('البريد الإلكتروني')}</label>
                <input className="hx-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('كلمة المرور')}</label>
                <div style={{ position: 'relative' }}>
                  <input className="hx-input" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'left' : 'right']: 12, background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loginLoading} className="hx-btn-primary" style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                borderRadius: Number(buttonRadius), width: '100%', padding: '12px', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
    overview: <HxOverviewPage theme={currentTheme} darkMode={darkMode} t={t} reload={overviewReload} />,
    products: <HxProductsPage theme={currentTheme} darkMode={darkMode} t={t} formatPrice={formatPrice} buttonRadius={buttonRadius} />,
    orders: <HxOrdersAdminPage theme={currentTheme} darkMode={darkMode} t={t} formatPrice={formatPrice} isRTL={isRTL} buttonRadius={buttonRadius} />,
    customers: <HxCustomersPage theme={currentTheme} darkMode={darkMode} t={t} formatPrice={formatPrice} isRTL={isRTL} />,
    payments: <HxPaymentsPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    delivery: <HxDeliveryZonesPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    currencies: <HxCurrenciesPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    customize: <HxCustomizePage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    announcements: <HxAnnouncementsPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
    settings: <HxSettingsAdminPage theme={currentTheme} darkMode={darkMode} t={t} buttonRadius={buttonRadius} />,
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
      <HxSidebar
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

      <main style={{
        [isRTL ? 'marginRight' : 'marginLeft']: sidebarCollapsed ? 70 : 260,
        transition: 'margin 0.2s ease', minHeight: '100vh',
      }}
        className="hx-admin-main"
      >
        <HxDashHeader
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          theme={currentTheme}
          darkMode={darkMode}
          t={t}
        />

        <div style={{ padding: '24px 24px 100px' }}>
          {pages[currentPage] || pages.overview}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="hx-admin-mobile-nav" style={{
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
