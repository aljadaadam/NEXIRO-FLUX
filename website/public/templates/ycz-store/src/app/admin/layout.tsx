'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { currentTheme, logoPreview, storeName } = useTheme();

  const [currentPage, setCurrentPage] = useState('overview');
  const [overviewReload, setOverviewReload] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

  // Check admin auth (skip in demo mode)
  const isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  useEffect(() => {
    if (isDemo) return;
    const key = localStorage.getItem('admin_key');
    if (!key) {
      router.push('/login');
    }
  }, [router, isDemo]);

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
