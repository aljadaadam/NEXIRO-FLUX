'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, HelpCircle, User, Menu, X, ChevronRight, Wallet, LogIn, Gamepad2, Star, Monitor, Tv } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';

export default function Header() {
  const { currentTheme, storeName, logoPreview, t, isRTL } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const [profile, setProfile] = useState<{ name: string; email: string; balance: number } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('_sidebar_profile');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    if (!token) { setProfile(null); localStorage.removeItem('_sidebar_profile'); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await storeApi.getProfile();
        const c = res?.customer || res;
        if (!cancelled) {
          const p = { name: c.name || c.username || '', email: c.email || '', balance: Number(c.wallet_balance ?? c.balance ?? 0) };
          setProfile(p);
          try { localStorage.setItem('_sidebar_profile', JSON.stringify(p)); } catch {}
        }
      } catch { if (!cancelled) { setProfile(null); localStorage.removeItem('_sidebar_profile'); } }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const token = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await storeApi.getProfile();
        const c = res?.customer || res;
        if (!cancelled) {
          const p = { name: c.name || c.username || '', email: c.email || '', balance: Number(c.wallet_balance ?? c.balance ?? 0) };
          setProfile(p);
          try { localStorage.setItem('_sidebar_profile', JSON.stringify(p)); } catch {}
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [menuOpen]);

  const navItems = [
    { id: '/', label: t('الرئيسية'), icon: Home },
    { id: '/services', label: t('التفعيلات'), icon: Monitor },
    { id: '/services?cat=games', label: t('ألعاب'), icon: Gamepad2 },
    { id: '/orders', label: t('حسابي'), icon: User },
    { id: '/services?cat=special', label: t('عروض خاصة'), icon: Star },
    { id: '/about', label: t('من نحن'), icon: HelpCircle },
    { id: '/reviews', label: t('آراء العملاء'), icon: Tv },
  ];

  const isLoggedIn = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));

  const orderSections = [
    {
      title: t('تصفح'),
      items: [
        { id: '/', label: t('الرئيسية'), icon: Home },
        { id: '/services', label: t('التفعيلات'), icon: Monitor },
        { id: '/services?cat=games', label: t('ألعاب'), icon: Gamepad2 },
        { id: '/services?cat=special', label: t('عروض خاصة'), icon: Star },
      ]
    },
    {
      title: t('حسابي'),
      items: [
        { id: '/orders', label: t('طلباتي'), icon: ShoppingCart },
        { id: '/profile', label: t('حسابي'), icon: User },
      ]
    },
    {
      title: t('المتجر'),
      items: [
        { id: '/about', label: t('من نحن'), icon: HelpCircle },
        { id: '/reviews', label: t('آراء العملاء'), icon: Tv },
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
          {/* Left side: Auth buttons (desktop) + hamburger (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="store-mobile-toggle" onClick={() => setMenuOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
              <Menu size={22} />
            </button>
            {!isLoggedIn ? (
              <div className="store-header-nav" style={{ display: 'flex', gap: 8 }}>
                <Link href="/profile" style={{
                  padding: '0.4rem 1.2rem', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${currentTheme.primary}`,
                  color: currentTheme.primary, fontSize: '0.82rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {t('تسجيل الدخول')}
                </Link>
                <Link href="/profile?tab=register" style={{
                  padding: '0.4rem 1.2rem', borderRadius: 8,
                  background: currentTheme.primary, border: 'none',
                  color: '#000', fontSize: '0.82rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {t('إنشاء حساب')}
                </Link>
              </div>
            ) : (
              <Link href="/profile" className="store-header-nav" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.35rem 0.8rem', borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600,
              }}>
                <User size={16} />
                {profile?.name || t('حسابي')}
              </Link>
            )}
          </div>

          {/* Center: Nav links (desktop) */}
          <nav className="store-header-nav" style={{ display: 'flex', gap: '0.15rem' }}>
            {navItems.map(item => {
              const isActive = pathname === item.id || (item.id !== '/' && pathname.startsWith(item.id.split('?')[0]));
              return (
                <Link key={item.id} href={item.id} style={{
                  padding: '0.45rem 0.75rem', borderRadius: 8,
                  fontSize: '0.82rem', fontWeight: 600,
                  background: isActive ? `${currentTheme.primary}18` : 'transparent',
                  color: isActive ? currentTheme.primary : 'var(--text-secondary)',
                  transition: 'all 0.3s',
                }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Logo + Store name */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'inherit' }}>{storeName}</span>
            {logoPreview ? (
              <img src={logoPreview} alt="logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: currentTheme.gradient,
                display: 'grid', placeItems: 'center',
                fontSize: '1.1rem', fontWeight: 800, color: '#fff',
              }}>
                A
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* ─── Mobile Side Drawer ─── */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', animation: 'nf-fade-in 0.2s ease',
          }} />
          <div style={{
            position: 'absolute', top: 0, [isRTL ? 'right' : 'left']: 0,
            width: 300, maxWidth: '82vw', height: '100%',
            background: 'var(--bg-page)',
            borderLeft: isRTL ? 'none' : '1px solid var(--border-light)',
            borderRight: isRTL ? '1px solid var(--border-light)' : 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column',
            animation: isRTL ? 'nf-slide-right 0.25s ease' : 'nf-slide-left 0.25s ease',
            overflowY: 'auto',
          }}>
            {/* User Section */}
            <div style={{
              padding: '1.25rem 1.2rem',
              background: `linear-gradient(135deg, ${currentTheme.primary}18, ${currentTheme.primary}08)`,
              borderBottom: '1px solid var(--border-light)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button onClick={() => setMenuOpen(false)} style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  <X size={14} />
                </button>
              </div>
              {isLoggedIn && profile ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: currentTheme.gradient,
                      display: 'grid', placeItems: 'center',
                      boxShadow: `0 4px 12px ${currentTheme.primary}30`, flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        {(profile.name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
                    </div>
                  </div>
                  <Link href="/profile?tab=wallet" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0.55rem 0.8rem', borderRadius: 10,
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)', textDecoration: 'none',
                  }}>
                    <Wallet size={16} color={currentTheme.primary} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('الرصيد')}:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: profile.balance > 0 ? '#10b981' : '#f87171', marginInlineStart: 'auto' }}>
                      SDG {profile.balance.toLocaleString()}
                    </span>
                  </Link>
                </>
              ) : isLoggedIn && !profile ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-muted)', animation: 'nf-pulse 1.5s ease infinite' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '60%', height: 14, borderRadius: 6, background: 'var(--bg-muted)', marginBottom: 6, animation: 'nf-pulse 1.5s ease infinite' }} />
                      <div style={{ width: '80%', height: 10, borderRadius: 4, background: 'var(--bg-muted)', animation: 'nf-pulse 1.5s ease infinite' }} />
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.75rem 1rem', borderRadius: 12,
                  background: currentTheme.gradient, color: '#000',
                  textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem',
                  boxShadow: `0 4px 14px ${currentTheme.primary}40`,
                }}>
                  <LogIn size={18} />
                  {t('تسجيل الدخول')}
                </Link>
              )}
            </div>

            {/* Nav Sections */}
            <div style={{ flex: 1, padding: '0.5rem 0' }}>
              {orderSections.map((section, si) => (
                <div key={si}>
                  <div style={{ padding: '0.7rem 1.2rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {section.title}
                  </div>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.id;
                    return (
                      <Link key={item.id} href={item.id} onClick={() => setMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0.7rem 1.2rem', marginInline: '0.5rem', marginBottom: 2, borderRadius: 10,
                        background: isActive ? `${currentTheme.primary}12` : 'transparent',
                        color: isActive ? currentTheme.primary : 'var(--text-primary)',
                        textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
                        border: isActive ? `1px solid ${currentTheme.primary}25` : '1px solid transparent',
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: isActive ? `${currentTheme.primary}18` : 'var(--bg-card)',
                          display: 'grid', placeItems: 'center',
                          border: !isActive ? '1px solid var(--border-light)' : 'none', flexShrink: 0,
                        }}>
                          <Icon size={16} />
                        </div>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        <ChevronRight size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      </Link>
                    );
                  })}
                  {si < orderSections.length - 1 && (
                    <div style={{ height: 1, background: 'var(--border-light)', margin: '0.4rem 1.2rem' }} />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: currentTheme.gradient, display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>A</div>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{storeName}</span>
              </Link>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5, fontWeight: 500 }}>⚡ NEXIRO FLUX</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
