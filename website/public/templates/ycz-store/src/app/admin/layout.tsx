'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import Sidebar from '@/components/admin/Sidebar';
import DashHeader from '@/components/admin/DashHeader';

// ─── Admin Mobile Bottom Nav ───
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Zap, Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

function AdminMobileNav({ currentPage, setCurrentPage, theme }: {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  theme: import('@/lib/themes').ColorTheme;
}) {
  const items = [
    { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'products', icon: Package, label: 'المنتجات' },
    { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
    { id: 'users', icon: Users, label: 'المستخدمين' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <nav className="dash-bottom-nav" style={{
      display: 'none',
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      padding: '0.5rem 0 0.6rem',
      flexDirection: 'row',
    }}>
      <div className="dash-bottom-nav-inner" style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 2,
        width: '100%',
      }}>
        {items.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, cursor: 'pointer', background: 'none', border: 'none',
              color: active ? theme.primary : '#94a3b8',
              fontFamily: 'Tajawal, sans-serif', position: 'relative',
              flex: 1, minWidth: 0,
            }}>
              {active && (
                <div style={{
                  position: 'absolute', top: -8,
                  width: 20, height: 3, borderRadius: 2,
                  background: theme.primary,
                }} />
              )}
              <Icon size={20} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.1 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── صفحات الإدارة ───
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import OrdersAdminPage from './pages/OrdersAdminPage';
import UsersAdminPage from './pages/UsersAdminPage';
import PaymentsPage from './pages/PaymentsPage';
import ExternalSourcesPage from './pages/ExternalSourcesPage';
import CustomizePage from './pages/CustomizePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SettingsAdminPage from './pages/SettingsAdminPage';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f1f5f9', fontFamily: 'Tajawal, sans-serif' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#7c5cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentTheme, logoPreview, storeName } = useTheme();

  const [currentPage, setCurrentPage] = useState('overview');
  const [overviewReload, setOverviewReload] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [slugVerified, setSlugVerified] = useState<boolean | null>(null); // null = checking
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking

  // Admin login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ─── Extract stable primitive values from searchParams (avoid object reference changes) ───
  const urlKey = searchParams.get('key') || '';
  const isDemoParam = searchParams.get('demo') === '1';

  // ─── Stable demo mode check ───
  const isDemo = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (isDemoParam) return true;
    return sessionStorage.getItem('demo_mode') === '1';
  }, [isDemoParam]);

  // Store demo flag in sessionStorage (inside useEffect, not during render)
  useEffect(() => {
    if (isDemo && typeof window !== 'undefined') {
      sessionStorage.setItem('demo_mode', '1');
    }
  }, [isDemo]);

  // ─── التحقق من مفتاح لوحة الأدمن (admin_slug) ───
  useEffect(() => {
    if (isDemo) {
      setSlugVerified(true);
      return;
    }

    async function verifySlug() {
      const storedSlug = sessionStorage.getItem('admin_slug');
      const slugToCheck = urlKey || storedSlug;

      if (!slugToCheck) {
        setSlugVerified(false);
        return;
      }

      try {
        const res = await fetch(`/api/customization/verify-slug/${slugToCheck}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            sessionStorage.setItem('admin_slug', slugToCheck);
            setSlugVerified(true);
            return;
          }
        }
      } catch { /* ignore */ }

      // URL slug is invalid — try stored slug if different
      if (storedSlug && storedSlug !== urlKey) {
        try {
          const res = await fetch(`/api/customization/verify-slug/${storedSlug}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.valid) {
              setSlugVerified(true);
              return;
            }
          }
        } catch { /* ignore */ }
      }

      sessionStorage.removeItem('admin_slug');
      setSlugVerified(false);
    }

    verifySlug();
  }, [isDemo, urlKey]); // ← primitive string, stable reference

  // Check admin JWT auth — if no token, show login form (not redirect)
  useEffect(() => {
    if (isDemo) { setAuthed(true); return; }
    if (slugVerified === false) return;
    if (slugVerified === null) return;
    const key = localStorage.getItem('admin_key');
    setAuthed(!!key);
  }, [isDemo, slugVerified]);

  // Lock body scroll when mobile drawer is open (must be before conditional returns to respect Rules of Hooks)
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Admin login handler
  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('البريد الإلكتروني وكلمة المرور مطلوبان');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'حدث خطأ أثناء تسجيل الدخول');
        setLoginLoading(false);
        return;
      }
      if (data.user?.role !== 'admin') {
        setLoginError('هذا الحساب ليس حساب مدير');
        setLoginLoading(false);
        return;
      }
      localStorage.setItem('admin_key', data.token);
      if (data.admin_slug) {
        sessionStorage.setItem('admin_slug', data.admin_slug);
      }
      setAuthed(true);
      setLoginLoading(false);
    } catch {
      setLoginError('لا يمكن الاتصال بالخادم');
      setLoginLoading(false);
    }
  }

  // ─── Show loading while checking slug ───
  if (slugVerified === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f1f5f9', fontFamily: 'Tajawal, sans-serif' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#7c5cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Show 404 if slug not verified ───
  if (slugVerified === false) {
    return (
      <div dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', fontFamily: 'Tajawal, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#cbd5e1', marginBottom: 8 }}>404</h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: 24 }}>الصفحة غير موجودة</p>
          <a href="/" style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>العودة للرئيسية</a>
        </div>
      </div>
    );
  }

  // ─── Show admin login form if not authenticated ───
  if (authed === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #0b1020 0%, #1a1040 100%)', fontFamily: 'Tajawal, sans-serif' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #374151', borderTopColor: '#7c5cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authed === false) {
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
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
              display: 'grid', placeItems: 'center',
              boxShadow: `0 8px 32px ${currentTheme.primary}40`,
            }}>
              {logoPreview ? (
                <img src={logoPreview} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain' }} />
              ) : (
                <Zap size={32} color="#fff" />
              )}
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
              {storeName || 'لوحة التحكم'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>سجّل الدخول للوصول إلى لوحة الإدارة</p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '2rem',
          }}>
            {loginError && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 12, marginBottom: 20,
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171', fontSize: '0.82rem', fontWeight: 600,
              }}>
                {loginError}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com" dir="ltr"
                  style={{
                    width: '100%', padding: '0.8rem 1rem', paddingRight: 42,
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.88rem',
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type={loginShowPass ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••" dir="ltr"
                  style={{
                    width: '100%', padding: '0.8rem 2.8rem 0.8rem 1rem', paddingRight: 42,
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.88rem',
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button type="button" onClick={() => setLoginShowPass(!loginShowPass)} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4,
                }}>
                  {loginShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loginLoading} style={{
              width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
              background: loginLoading ? '#5a41c9' : `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
              color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              cursor: loginLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 20px ${currentTheme.primary}40`,
              opacity: loginLoading ? 0.8 : 1,
            }}>
              {loginLoading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogIn size={18} />}
              {loginLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handlePageChange = (id: string) => {
    // إذا ضغط المستخدم على نفس الصفحة الحالية، لا تتجاهل الحدث
    // (مهم خصوصاً لصفحة النظر العام: نجلب بيانات جديدة من القاعدة عند كل فتح)
    if (id === currentPage) {
      if (id === 'overview') {
        setOverviewReload((v) => v + 1);
      }
      setMobileDrawerOpen(false);
      return;
    }

    setCurrentPage(id);
    setMobileDrawerOpen(false);
  };

  const pages: Record<string, React.ReactNode> = {
    overview: <OverviewPage key={`overview-${overviewReload}`} theme={currentTheme} />,
    products: <ProductsPage theme={currentTheme} />,
    orders: <OrdersAdminPage theme={currentTheme} />,
    users: <UsersAdminPage theme={currentTheme} />,
    payments: <PaymentsPage />,
    sources: <ExternalSourcesPage />,
    customize: <CustomizePage />,
    announcements: <AnnouncementsPage />,
    settings: <SettingsAdminPage theme={currentTheme} />,
  };

  return (
    <div dir="rtl" className={mobileDrawerOpen ? 'dash-drawer-open' : ''} style={{
      fontFamily: 'Tajawal, Cairo, sans-serif',
      background: '#f1f5f9', minHeight: '100vh', color: '#0b1020',
    }}>
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div onClick={() => setMobileDrawerOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 45,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        }} />
      )}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
        theme={currentTheme}
        logoPreview={logoPreview}
        storeName={storeName}
      />

      <div className="dash-main-content" style={{
        marginRight: collapsed ? 70 : 260,
        transition: 'margin-right 0.3s',
        minHeight: '100vh', paddingBottom: '1rem',
      }}>
        <DashHeader
          collapsed={collapsed}
          onMenuToggle={() => setMobileDrawerOpen((prev) => !prev)}
          theme={currentTheme}
          logoPreview={logoPreview}
        />
        <main style={{ padding: '1rem' }}>
          {pages[currentPage]}
        </main>
      </div>

      <AdminMobileNav currentPage={currentPage} setCurrentPage={handlePageChange} theme={currentTheme} />
    </div>
  );
}
