'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Package, FolderOpen, Settings, LogIn, Eye, EyeOff, Loader2, Menu, X, LogOut, ChevronRight, ShoppingCart, Users, CreditCard, Bell } from 'lucide-react';
import { adminApi } from '@/lib/api';

import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersAdminPage from './pages/OrdersAdminPage';
import CustomersPage from './pages/CustomersPage';
import PaymentsPage from './pages/PaymentsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SettingsAdminPage from './pages/SettingsAdminPage';

// ─── Sidebar ───
function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }: {
  currentPage: string; setCurrentPage: (p: string) => void;
  collapsed: boolean; setCollapsed: (c: boolean) => void;
}) {
  const items = [
    { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'products', icon: Package, label: 'المنتجات' },
    { id: 'categories', icon: FolderOpen, label: 'الأقسام' },
    { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
    { id: 'customers', icon: Users, label: 'العملاء' },
    { id: 'payments', icon: CreditCard, label: 'المدفوعات' },
    { id: 'announcements', icon: Bell, label: 'الإعلانات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <aside className={`hidden md:flex flex-col bg-navy-900 border-l border-navy-700/50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-700/50">
        {!collapsed && <span className="text-gold-500 font-black text-lg">لوحة التحكم</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white transition-colors">
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {items.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                active ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-navy-700/50">
        <button
          onClick={() => { localStorage.removeItem('admin_key'); window.location.reload(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Nav ───
function MobileNav({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (p: string) => void }) {
  const items = [
    { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
    { id: 'products', icon: Package, label: 'المنتجات' },
    { id: 'categories', icon: FolderOpen, label: 'الأقسام' },
    { id: 'customers', icon: Users, label: 'العملاء' },
    { id: 'payments', icon: CreditCard, label: 'المدفوعات' },
    { id: 'announcements', icon: Bell, label: 'الإعلانات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-md border-t border-navy-700/50 px-2 py-2">
      <div className="flex overflow-x-auto gap-1 scrollbar-hide">
        {items.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all shrink-0 ${
                active ? 'text-gold-500' : 'text-navy-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Mobile Drawer Sidebar ───
function MobileDrawer({ isOpen, onClose, currentPage, setCurrentPage }: {
  isOpen: boolean; onClose: () => void;
  currentPage: string; setCurrentPage: (p: string) => void;
}) {
  const items = [
    { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'products', icon: Package, label: 'المنتجات' },
    { id: 'categories', icon: FolderOpen, label: 'الأقسام' },
    { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
    { id: 'customers', icon: Users, label: 'العملاء' },
    { id: 'payments', icon: CreditCard, label: 'المدفوعات' },
    { id: 'announcements', icon: Bell, label: 'الإعلانات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50" dir="rtl">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-[260px] bg-navy-900 border-l border-navy-700/50 flex flex-col animate-fadeInUp">
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-700/50">
          <span className="text-gold-500 font-black text-lg">لوحة التحكم</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {items.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  active ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-navy-700/50">
          <button
            onClick={() => { localStorage.removeItem('admin_key'); window.location.reload(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─── Header ───
function DashHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-navy-700/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <button onClick={onMenuClick} className="md:hidden w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-navy-400">
        <Menu className="w-5 h-5" />
      </button>
      <h2 className="text-white font-bold text-lg">متجر ستيلار</h2>
      <a href="/" target="_blank" className="text-xs text-gold-500 bg-gold-500/10 px-3 py-1.5 rounded-lg font-bold hover:bg-gold-500/20 transition-all">
        زيارة المتجر ←
      </a>
    </header>
  );
}

// ─── Login Screen ───
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.login(email, password);
      if (res.token) {
        localStorage.setItem('admin_key', res.token);
        window.location.reload();
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-2xl font-black text-white">لوحة التحكم</h1>
          <p className="text-navy-400 mt-1">متجر ستيلار</p>
        </div>

        <form onSubmit={handleLogin} className="bg-navy-900/60 border border-navy-700/50 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Layout Inner ───
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const isDemoParam = searchParams.get('demo') === '1';
  const isDemo = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (isDemoParam) return true;
    return sessionStorage.getItem('demo_mode') === '1';
  }, [isDemoParam]);

  useEffect(() => {
    if (isDemo && typeof window !== 'undefined') {
      sessionStorage.setItem('demo_mode', '1');
    }
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) { setAuthed(true); return; }
    const key = localStorage.getItem('admin_key');
    if (!key) { setAuthed(false); return; }
    // Validate token server-side
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${key}` } })
      .then(r => {
        if (r.ok) { setAuthed(true); }
        else { localStorage.removeItem('admin_key'); setAuthed(false); }
      })
      .catch(() => { setAuthed(true); }); // offline fallback
  }, [isDemo]);

  // Loading
  if (authed === null) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  // Not authed → login
  if (!authed) {
    return <LoginScreen />;
  }

  const pages: Record<string, React.ReactNode> = {
    overview: <OverviewPage />,
    products: <ProductsPage />,
    categories: <CategoriesPage />,
    orders: <OrdersAdminPage />,
    customers: <CustomersPage />,
    payments: <PaymentsPage />,
    announcements: <AnnouncementsPage />,
    settings: <SettingsAdminPage />,
  };

  return (
    <div className="min-h-screen bg-navy-950 flex" dir="rtl">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {pages[currentPage] || pages.overview}
        </main>
        <MobileNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    }>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
