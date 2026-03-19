'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut } from 'lucide-react';

const navLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'التفعيلات', href: '/services' },
  { label: 'ستارلينك', href: '/services?cat=starlink' },
  { label: 'شحن المحفظة', href: '/profile?tab=wallet' },
  { label: 'ألعاب', href: '/services?cat=games' },
  { label: 'حسابي', href: '/profile' },
  { label: 'عروض خاصة', href: '/services?cat=offers' },
  { label: 'من نحن', href: '/about' },
  { label: 'آراء العملاء', href: '/reviews' },
];

export default function Header({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customer, setCustomer] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check auth
    const stored = localStorage.getItem('customer');
    if (stored) {
      try { setCustomer(JSON.parse(stored)); } catch { /* ignore */ }
    }

    // Listen for auth changes
    const onStorage = () => {
      const s = localStorage.getItem('customer');
      try { setCustomer(s ? JSON.parse(s) : null); } catch { setCustomer(null); }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-change', onStorage);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-change', onStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer');
    setCustomer(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-950/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-navy-700/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-gold-500 text-xs font-bold bg-gold-500/10 border border-gold-500/30 rounded px-1.5 py-0.5">STORE</span>
            <span className="text-xl font-black text-white">
              متجر <span className="text-gold-gradient">ستيلار</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="px-3 py-2 text-sm text-navy-200 hover:text-gold-500 transition-colors rounded-lg hover:bg-navy-800/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {customer ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-sm text-navy-200 hover:text-gold-500 transition-colors">
                  <User className="w-4 h-4" />
                  {customer.name}
                </Link>
                <button onClick={handleLogout} className="p-2 text-navy-400 hover:text-red-400 transition-colors" title="تسجيل خروج">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={onLoginClick} className="px-4 py-2 text-sm text-navy-200 hover:text-white transition-colors">
                  تسجيل الدخول
                </button>
                <button onClick={onLoginClick} className="px-5 py-2 text-sm font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-lg hover:from-gold-400 hover:to-gold-300 transition-all shadow-md shadow-gold-500/20">
                  إنشاء حساب
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-navy-200 hover:text-gold-500 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy-900/98 backdrop-blur-xl border-t border-navy-700/50 animate-fadeIn">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-navy-200 hover:text-gold-500 hover:bg-navy-800/50 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-navy-700/50">
              {customer ? (
                <div className="flex gap-3">
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-sm text-center text-gold-500 border border-gold-500/30 rounded-xl">
                    {customer.name}
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="py-3 px-4 text-sm text-red-400 border border-red-500/30 rounded-xl">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="flex-1 py-3 text-sm text-navy-200 border border-navy-600 rounded-xl hover:border-gold-500/50 transition-colors">
                    تسجيل الدخول
                  </button>
                  <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="flex-1 py-3 text-sm font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl">
                    إنشاء حساب
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
