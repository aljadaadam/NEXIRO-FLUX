'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Menu, X, Sun, Moon, Globe, ShoppingBag, User, Home, Layers, FileText, Headphones, Wallet } from 'lucide-react';

export default function Header() {
  const { currentTheme, darkMode, setDarkMode, language, setLanguage, isRTL, t, storeName, logoPreview, showBanner } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: t('الرئيسية'), href: '/', icon: <Home size={18} /> },
    { label: t('الخدمات'), href: '/services', icon: <Layers size={18} /> },
    { label: t('الطلبات'), href: '/orders', icon: <ShoppingBag size={18} /> },
    { label: t('المدونة'), href: '/blog', icon: <FileText size={18} /> },
    { label: t('الدعم'), href: '/support', icon: <Headphones size={18} /> },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: scrolled ? '8px 0' : '12px 0',
          background: scrolled
            ? (darkMode ? 'rgba(5, 10, 24, 0.9)' : 'rgba(255, 255, 255, 0.95)')
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? `1px solid ${darkMode ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0,0,0,0.06)'}` : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled ? (darkMode ? '0 4px 30px rgba(0,0,0,0.3)' : '0 2px 20px rgba(0,0,0,0.06)') : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {logoPreview ? (
              <img src={logoPreview} alt={storeName} style={{ height: 36, width: 36, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: currentTheme.gradient,
                display: 'grid', placeItems: 'center',
                fontSize: '1.1rem', fontWeight: 900, color: '#fff',
                boxShadow: currentTheme.glow,
              }}>
                ⚡
              </div>
            )}
            <span style={{
              fontSize: '1.2rem', fontWeight: 800,
              background: currentTheme.gradient,
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {storeName}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="store-header-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 12,
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem', fontWeight: 600,
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
                  (e.target as HTMLElement).style.color = currentTheme.primary;
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
              title={language === 'ar' ? 'English' : 'عربي'}
            >
              <Globe size={18} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <a
              href={isLoggedIn ? '/profile' : '/login'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 12,
                background: currentTheme.gradient,
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                textDecoration: 'none',
                boxShadow: `0 4px 20px ${currentTheme.primary}40`,
                transition: 'all 0.3s ease',
              }}
            >
              {isLoggedIn ? <Wallet size={16} /> : <User size={16} />}
              <span className="dash-profile-text">{isLoggedIn ? t('المحفظة') : t('تسجيل الدخول')}</span>
            </a>

            {/* Mobile menu button */}
            <button
              className="store-mobile-toggle"
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{
                display: 'none', width: 38, height: 38, borderRadius: 12,
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: 'none', cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="store-mobile-nav"
        style={{
          display: 'none',
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 9999,
          background: darkMode ? 'rgba(5, 10, 24, 0.95)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${darkMode ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0,0,0,0.06)'}`,
          padding: '8px 0',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 500, margin: '0 auto' }}>
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 12px', borderRadius: 12,
                color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s ease',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: showBanner ? 70 : 60 }} />
    </>
  );
}
