'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Car, MapPin, Phone, Menu, X, Sun, Moon, Globe } from 'lucide-react';

export default function Header() {
  const { currentTheme, darkMode, setDarkMode, storeName, logoPreview, t, isRTL, language } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const bg = darkMode ? (scrolled ? 'rgba(10,10,18,0.92)' : 'rgba(10,10,18,0.6)') : (scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)');
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const accent = currentTheme.accent || '#e94560';

  const navItems = [
    { label: t('الرئيسية'), href: '/' },
    { label: t('السيارات'), href: '/cars' },
    { label: t('الفروع'), href: '/branches' },
    { label: t('تواصل معنا'), href: '/contact' },
  ];

  return (
    <>
      <header className={`car-header ${scrolled ? 'scrolled' : ''}`} style={{ background: bg, borderBottom: scrolled ? `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            {logoPreview ? (
              <img src={logoPreview} alt={storeName} style={{ height: 42, borderRadius: 10 }} />
            ) : (
              <div style={{ width: 46, height: 46, borderRadius: 14, background: currentTheme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={24} color="#fff" />
              </div>
            )}
            <span style={{ fontSize: 22, fontWeight: 900, color: textColor, letterSpacing: -0.5 }}>{storeName}</span>
          </a>

          {/* Desktop Nav */}
          <nav className="car-header-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="car-header-nav-link" style={{ color: textColor }}>
                {item.label}
                <span style={{ position: 'absolute', bottom: 0, left: '50%', width: 0, height: 2, background: accent, transition: 'all 0.3s', transform: 'translateX(-50%)' }} />
              </a>
            ))}

            {/* Dark Mode Toggle */}
            <button onClick={() => setDarkMode(!darkMode)} style={{ padding: 10, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: textColor, display: 'flex', alignItems: 'center', marginInlineStart: 8, transition: 'all 0.3s' }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* CTA */}
            <a href="/cars" className="car-btn-primary" style={{ background: accent, borderRadius: 14, padding: '10px 24px', fontSize: 14, marginInlineStart: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} />
              {t('احجز الآن')}
            </a>
          </nav>

          {/* Mobile Toggle */}
          <button className="car-header-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} style={{ padding: 10, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: textColor, display: 'flex' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: darkMode ? '#0a0a12' : '#fff', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, padding: 20, animation: 'fadeInDown 0.3s ease-out' }}>
            {navItems.map(item => (
              <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 0', color: textColor, fontSize: 16, fontWeight: 600, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                {item.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ flex: 1, padding: 12, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                {darkMode ? t('فاتح') : t('داكن')}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
