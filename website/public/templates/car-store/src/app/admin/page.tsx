'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import Sidebar from '@/components/admin/Sidebar';
import DashHeader from '@/components/admin/DashHeader';
import OverviewPage from './pages/OverviewPage';
import CarsAdminPage from './pages/CarsAdminPage';
import OrdersAdminPage from './pages/OrdersAdminPage';
import CustomersPage from './pages/CustomersPage';
import BranchesAdminPage from './pages/BranchesAdminPage';
import CustomizePage from './pages/CustomizePage';
import SettingsPage from './pages/SettingsPage';
import { Car, Eye, EyeOff, LogIn } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminPage() {
  const { currentTheme, darkMode, storeName, t } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0a0a12' : '#f5f5fa';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    const key = localStorage.getItem('admin_key');
    if (key) {
      setIsLoggedIn(true);
    }
    // Check for ?key= slug in URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('key');
    if (slug) sessionStorage.setItem('admin_slug', slug);
    // Demo mode auto-login
    if (params.get('demo') === '1') {
      sessionStorage.setItem('demo_mode', '1');
      localStorage.setItem('admin_key', 'demo-admin-token');
      setIsLoggedIn(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const slug = sessionStorage.getItem('admin_slug') || '';
      const res = await adminApi.login({ username: loginForm.username, password: loginForm.password, slug });
      if (res.token) {
        localStorage.setItem('admin_key', res.token);
        setIsLoggedIn(true);
      }
    } catch (err: unknown) {
      setLoginError(t('خطأ في اسم المستخدم أو كلمة المرور'));
    }
  };

  if (checking) return null;

  // ── Login Screen ──
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: darkMode ? 'linear-gradient(135deg, #0a0a12, #12122a)' : 'linear-gradient(135deg, #f0f4ff, #e8eeff)',
        padding: 24,
      }}>
        <div className="anim-scale-in" style={{
          maxWidth: 420, width: '100%', padding: 40, borderRadius: 28,
          background: cardBg, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: currentTheme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Car size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: textColor }}>{t('لوحة التحكم')}</h2>
            <p style={{ color: mutedColor, fontSize: 14, marginTop: 6 }}>{storeName}</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              className="car-form-input" placeholder={t('اسم المستخدم')}
              value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}
            />
            <div style={{ position: 'relative' }}>
              <input
                className="car-form-input" placeholder={t('كلمة المرور')}
                type={showPass ? 'text' : 'password'}
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, paddingLeft: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', color: mutedColor, padding: 0, marginTop: -8,
              }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{loginError}</p>}
            <button type="submit" className="car-btn-primary" style={{
              width: '100%', background: accent, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <LogIn size={18} />
              {t('تسجيل الدخول')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  const pageTitles: Record<string, string> = {
    overview: t('نظرة عامة'),
    cars: t('إدارة السيارات'),
    orders: t('الطلبات'),
    customers: t('العملاء'),
    branches: t('إدارة الفروع'),
    customize: t('التخصيص'),
    settings: t('الإعدادات'),
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage />;
      case 'cars': return <CarsAdminPage />;
      case 'orders': return <OrdersAdminPage />;
      case 'customers': return <CustomersPage />;
      case 'branches': return <BranchesAdminPage />;
      case 'customize': return <CustomizePage />;
      case 'settings': return <SettingsPage />;
      default: return <OverviewPage />;
    }
  };

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      <Sidebar activePage={activePage} onNavigate={p => { setActivePage(p); setSidebarOpen(false); }} open={sidebarOpen} />
      <div className="dash-main">
        <DashHeader title={pageTitles[activePage] || ''} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {renderPage()}
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 899,
        }} />
      )}
    </div>
  );
}
