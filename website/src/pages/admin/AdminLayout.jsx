import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Users, Megaphone, Settings, LogOut,
  Sparkles, Menu, X, ChevronLeft, Bell, Search, User, CreditCard, Landmark, Key
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, labelAr: 'نظرة عامة', labelEn: 'Overview', exact: true },
  { to: '/admin/templates', icon: Layers, labelAr: 'القوالب', labelEn: 'Templates' },
  { to: '/admin/users', icon: Users, labelAr: 'المستخدمين', labelEn: 'Users' },
  { to: '/admin/announcements', icon: Megaphone, labelAr: 'الإعلانات', labelEn: 'Announcements' },
  { to: '/admin/payments', icon: CreditCard, labelAr: 'المدفوعات', labelEn: 'Payments' },
  { to: '/admin/purchase-codes', icon: Key, labelAr: 'أكواد الشراء', labelEn: 'Purchase Codes' },
  { to: '/admin/payment-gateways', icon: Landmark, labelAr: 'بوابات الدفع', labelEn: 'Payment Gateways' },
  { to: '/admin/settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
];

export default function AdminLayout() {
  const { isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-72 bg-[#0d1221] border-${isRTL ? 'l' : 'r'} border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">
              <span className="text-white">NEXIRO</span>
              <span className="text-primary-400">-</span>
              <span className="text-accent-400">FLUX</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-dark-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] uppercase tracking-widest text-dark-600 font-bold">
            {isRTL ? 'القائمة الرئيسية' : 'Main Menu'}
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-500/10 text-primary-400 shadow-sm shadow-primary-500/5'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{isRTL ? item.labelAr : item.labelEn}</span>
                {active && <div className={`w-1.5 h-1.5 rounded-full bg-primary-400 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-[#0d1221]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-dark-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 w-64">
              <Search className="w-4 h-4 text-dark-500" />
              <input
                type="text"
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-dark-500 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {/* Avatar */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white leading-none">{user?.name || (isRTL ? 'المدير' : 'Admin')}</p>
                <p className="text-[11px] text-dark-500 leading-none mt-0.5">{user?.email || 'admin@nexiro.com'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
