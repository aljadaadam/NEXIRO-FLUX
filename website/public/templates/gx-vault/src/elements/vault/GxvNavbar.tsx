'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Search, User, ShoppingCart, Menu, X, LogIn } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';

export default function GxvNavbar() {
  const { currentTheme, storeName, logoPreview } = useGxvTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('auth_token'));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'الألعاب', href: '/services' },
    { label: 'طلباتي', href: '/orders' },
    { label: 'الدعم', href: '/support' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(5,5,16,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <a href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', color: '#fff',
        }}>
          {logoPreview ? (
            <img src={logoPreview} alt={storeName} style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
              boxShadow: currentTheme.glow,
            }}>
              <Gamepad2 size={20} color="#fff" />
            </div>
          )}
          <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.5px' }}>
            {storeName}
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="gxv-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} style={{
              color: '#b8b8cc', textDecoration: 'none', fontSize: '0.9rem',
              fontWeight: 500, transition: 'color 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = currentTheme.primary)}
            onMouseLeave={e => (e.currentTarget.style.color = '#b8b8cc')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#b8b8cc', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = currentTheme.surface;
            e.currentTarget.style.color = currentTheme.primary;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#b8b8cc';
          }}>
            <Search size={16} />
          </button>

          {isLoggedIn ? (
            <a href="/profile" style={{
              width: 38, height: 38, borderRadius: 10,
              background: currentTheme.surface,
              border: `1px solid ${currentTheme.primary}33`,
              color: currentTheme.primary, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              textDecoration: 'none',
            }}>
              <User size={16} />
            </a>
          ) : (
            <a href="/profile" style={{
              padding: '8px 18px', borderRadius: 10,
              background: currentTheme.gradient,
              color: '#fff', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: currentTheme.glow,
            }}>
              <LogIn size={14} />
              <span className="gxv-hide-small">دخول</span>
            </a>
          )}

          {/* Mobile menu toggle */}
          <button className="gxv-hide-desktop" onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#b8b8cc', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 70, left: 0, right: 0, bottom: 0,
          background: 'rgba(5,5,16,0.96)',
          backdropFilter: 'blur(20px)',
          zIndex: 99, padding: '24px',
          animation: 'gxvFadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(link => (
              <a key={link.href} href={link.href} style={{
                color: '#e8e8ff', textDecoration: 'none',
                padding: '14px 16px', borderRadius: 12,
                fontSize: '1rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = currentTheme.surface;
                e.currentTarget.style.borderColor = `${currentTheme.primary}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
              onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
