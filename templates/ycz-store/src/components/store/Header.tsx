'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, HelpCircle, User, Zap, Menu, X } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Header() {
  const { currentTheme, storeName, logoPreview, buttonRadius, t, isRTL } = useTheme();
  const pathname = usePathname();
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navItems = [
    { id: '/', label: t('الرئيسية'), icon: Home },
    { id: '/services', label: t('الخدمات'), icon: Package },
    { id: '/orders', label: t('طلباتي'), icon: ShoppingCart },
    { id: '/support', label: t('الدعم'), icon: HelpCircle },
    { id: '/profile', label: t('حسابي'), icon: User },
  ];

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--nav-border)',
        boxShadow: 'var(--shadow-nav)',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Mobile: hamburger menu */}
          <button className="store-mobile-toggle" onClick={() => setMenuOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            <Menu size={22} />
          </button>

          {/* Nav */}
          <nav className="store-header-nav" style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.filter(i => i.id !== '/profile').map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.id;
              return (
                <Link key={item.id} href={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.5rem 1rem', borderRadius: btnR,
                  border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: 'inherit',
                  background: isActive ? currentTheme.primary : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.3s',
                }}>
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {logoPreview ? (
              <img src={logoPreview} alt="logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: currentTheme.gradient, display: 'grid', placeItems: 'center' }}>
                <Zap size={18} color="#fff" />
              </div>
            )}
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'inherit' }}>{storeName}</span>
          </Link>

          {/* Profile */}
          <Link href="/profile" style={{
            width: 38, height: 38, borderRadius: '50%',
            border: pathname === '/profile' ? `2px solid ${currentTheme.primary}` : '1px solid var(--border-default)',
            background: 'var(--bg-card)', display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>
            <User size={16} color="var(--text-secondary)" />
          </Link>
        </div>
      </header>

      {/* ─── Mobile Side Drawer ─── */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
          {/* Backdrop */}
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            animation: 'nf-fade-in 0.2s ease',
          }} />

          {/* Drawer */}
          <div style={{
            position: 'absolute', top: 0, [isRTL ? 'right' : 'left']: 0,
            width: 280, maxWidth: '80vw', height: '100%',
            background: 'var(--bg-main)',
            borderLeft: isRTL ? 'none' : '1px solid var(--border-light)',
            borderRight: isRTL ? '1px solid var(--border-light)' : 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column',
            animation: isRTL ? 'nf-slide-right 0.25s ease' : 'nf-slide-left 0.25s ease',
            overflowY: 'auto',
          }}>
            {/* Drawer Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.2rem',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: currentTheme.gradient, display: 'grid', placeItems: 'center' }}>
                    <Zap size={16} color="#fff" />
                  </div>
                )}
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{storeName}</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                color: 'var(--text-muted)',
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Drawer Nav */}
            <div style={{ flex: 1, padding: '0.75rem' }}>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.id;
                return (
                  <Link key={item.id} href={item.id} onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.85rem 1rem', borderRadius: 12,
                    marginBottom: 4,
                    background: isActive ? `${currentTheme.primary}15` : 'transparent',
                    color: isActive ? currentTheme.primary : 'var(--text-primary)',
                    textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem',
                    transition: 'all 0.2s',
                    border: isActive ? `1px solid ${currentTheme.primary}30` : '1px solid transparent',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: isActive ? `${currentTheme.primary}20` : 'var(--bg-card)',
                      display: 'grid', placeItems: 'center',
                      border: !isActive ? '1px solid var(--border-light)' : 'none',
                    }}>
                      <Icon size={18} />
                    </div>
                    {item.label}
                    {isActive && (
                      <div style={{
                        marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0,
                        width: 6, height: 6, borderRadius: '50%', background: currentTheme.primary,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: '1rem 1.2rem',
              borderTop: '1px solid var(--border-light)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ⚡ Powered by NEXIRO FLUX
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Drawer animations */}
      <style>{`
        @keyframes nf-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nf-slide-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes nf-slide-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
