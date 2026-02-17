'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import Sidebar from '@/components/admin/Sidebar';
import DashHeader from '@/components/admin/DashHeader';

// ─── Admin Mobile Bottom Nav ───
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from 'lucide-react';

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

  // ─── التحقق من مفتاح لوحة الأدمن (admin_slug) ───
  const isDemo = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('demo') === '1' ||
    sessionStorage.getItem('demo_mode') === '1'
  );
  if (isDemo && typeof window !== 'undefined') {
    sessionStorage.setItem('demo_mode', '1');
  }

  useEffect(() => {
    if (isDemo) {
      setSlugVerified(true);
      return;
    }

    async function verifySlug() {
      // 1. Check URL param ?key=xxx
      const urlKey = searchParams.get('key') || '';
      // 2. Check sessionStorage (already verified in this session)
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

      // URL slug is invalid
      if (storedSlug && storedSlug !== urlKey) {
        // Try stored slug if URL key failed
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
  }, [isDemo, searchParams]);

  // Check admin JWT auth
  useEffect(() => {
    if (isDemo) return;
    if (slugVerified === false) return; // will show 404
    const key = localStorage.getItem('admin_key');
    if (!key) {
      router.push('/login');
    }
  }, [router, isDemo, slugVerified]);

  // ─── Show 404 if slug not verified ───
  if (slugVerified === null) {
    // Loading state
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f1f5f9', fontFamily: 'Tajawal, sans-serif' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#7c5cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (slugVerified === false) {
    // Show 404 page — hide admin existence
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
