'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, HelpCircle, User, Zap, Menu, X, ChevronRight, Wallet, LogIn } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';

export default function Header() {
  const { currentTheme, storeName, logoPreview, buttonRadius, t, isRTL } = useTheme();
  const pathname = usePathname();
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';
  const [menuOpen, setMenuOpen] = useState(false);

  // User profile state
  const [profile, setProfile] = useState<{ name: string; email: string; balance: number } | null>(null);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Fetch profile when menu opens
  useEffect(() => {
    if (!menuOpen) return;
    const token = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    if (!token) { setProfile(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await storeApi.getProfile();
        const c = res?.customer || res;
        if (!cancelled) {
          setProfile({
            name: c.name || c.username || '',
            email: c.email || '',
            balance: Number(c.wallet_balance ?? c.balance ?? 0),
          });
        }
      } catch { if (!cancelled) setProfile(null); }
    })();
    return () => { cancelled = true; };
  }, [menuOpen]);

  const navItems = [
    { id: '/', label: t('الرئيسية'), icon: Home },
    { id: '/services', label: t('الخدمات'), icon: Package },
    { id: '/orders', label: t('طلباتي'), icon: ShoppingCart },
    { id: '/support', label: t('الدعم'), icon: HelpCircle },
    { id: '/profile', label: t('حسابي'), icon: User },
  ];

  const isLoggedIn = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));

  // Sidebar sections (sd-unlocker style)
  const orderSections = [
    {
      title: t('تصفح الخدمات'),
      items: [
        { id: '/', label: t('الرئيسية'), icon: Home },
        { id: '/services', label: t('جميع الخدمات'), icon: Package },
      ]
    },
    {
      title: t('سجل الطلبات'),
      items: [
        { id: '/orders', label: t('طلباتي'), icon: ShoppingCart },
      ]
    },
    {
      title: t('الحساب'),
      items: [
        { id: '/profile', label: t('حسابي'), icon: User },
        { id: '/support', label: t('الدعم الفني'), icon: HelpCircle },
      ]
    },
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

      {/* ─── Mobile Side Drawer (sd-unlocker style) ─── */}
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
            width: 300, maxWidth: '82vw', height: '100%',
            background: 'var(--bg-page)',
            borderLeft: isRTL ? 'none' : '1px solid var(--border-light)',
            borderRight: isRTL ? '1px solid var(--border-light)' : 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column',
            animation: isRTL ? 'nf-slide-right 0.25s ease' : 'nf-slide-left 0.25s ease',
            overflowY: 'auto',
          }}>

            {/* ── User Account Section (Top) ── */}
            <div style={{
              padding: '1.25rem 1.2rem',
              background: `linear-gradient(135deg, ${currentTheme.primary}18, ${currentTheme.primary}08)`,
              borderBottom: '1px solid var(--border-light)',
            }}>
              {/* Close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button onClick={() => setMenuOpen(false)} style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}>
                  <X size={14} />
                </button>
              </div>

              {isLoggedIn && profile ? (
                <>
                  {/* Avatar + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: currentTheme.gradient,
                      display: 'grid', placeItems: 'center',
                      boxShadow: `0 4px 12px ${currentTheme.primary}30`,
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        {(profile.name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.email}
                      </div>
                    </div>
                  </div>

                  {/* Wallet Balance */}
                  <Link href="/profile?tab=wallet" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0.55rem 0.8rem', borderRadius: 10,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}>
                    <Wallet size={16} color={currentTheme.primary} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('الرصيد')}:</span>
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 800,
                      color: profile.balance > 0 ? '#10b981' : '#f87171',
                      marginInlineStart: 'auto',
                    }}>
                      ${profile.balance.toFixed(2)}
                    </span>
                  </Link>
                </>
              ) : (
                /* Not logged in */
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.75rem 1rem', borderRadius: 12,
                  background: currentTheme.gradient,
                  color: '#fff', textDecoration: 'none',
                  fontWeight: 700, fontSize: '0.88rem',
                  boxShadow: `0 4px 14px ${currentTheme.primary}40`,
                }}>
                  <LogIn size={18} />
                  {t('تسجيل الدخول')}
                </Link>
              )}
            </div>

            {/* ── Navigation Sections ── */}
            <div style={{ flex: 1, padding: '0.5rem 0' }}>
              {orderSections.map((section, si) => (
                <div key={si}>
                  {/* Section Header */}
                  <div style={{
                    padding: '0.7rem 1.2rem 0.35rem',
                    fontSize: '0.65rem', fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {section.title}
                  </div>

                  {/* Section Items */}
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.id || (item.id !== '/' && pathname.startsWith(item.id.split('?')[0]) && item.id.includes('?') === false);
                    return (
                      <Link key={item.id} href={item.id} onClick={() => setMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0.7rem 1.2rem',
                        marginInline: '0.5rem', marginBottom: 2, borderRadius: 10,
                        background: isActive ? `${currentTheme.primary}12` : 'transparent',
                        color: isActive ? currentTheme.primary : 'var(--text-primary)',
                        textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
                        transition: 'all 0.2s',
                        border: isActive ? `1px solid ${currentTheme.primary}25` : '1px solid transparent',
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: isActive ? `${currentTheme.primary}18` : 'var(--bg-card)',
                          display: 'grid', placeItems: 'center',
                          border: !isActive ? '1px solid var(--border-light)' : 'none',
                          flexShrink: 0,
                        }}>
                          <Icon size={16} />
                        </div>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        <ChevronRight size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      </Link>
                    );
                  })}

                  {/* Section Divider */}
                  {si < orderSections.length - 1 && (
                    <div style={{ height: 1, background: 'var(--border-light)', margin: '0.4rem 1.2rem' }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Drawer Footer with Logo ── */}
            <div style={{
              padding: '1rem 1.2rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: currentTheme.gradient, display: 'grid', placeItems: 'center' }}>
                    <Zap size={12} color="#fff" />
                  </div>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{storeName}</span>
              </Link>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5, fontWeight: 500 }}>
                ⚡ NEXIRO FLUX
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
