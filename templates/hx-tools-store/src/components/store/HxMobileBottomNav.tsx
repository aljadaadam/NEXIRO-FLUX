'use client';

import { useHxTheme } from '@/providers/HxThemeProvider';
import { Home, Grid3X3, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function HxMobileBottomNav() {
  const { currentTheme, darkMode, t, cartCount } = useHxTheme();
  const pathname = usePathname();

  const bg = darkMode ? '#111827' : '#fff';
  const text = darkMode ? '#64748b' : '#94a3b8';

  const tabs = [
    { icon: Home, label: t('الرئيسية'), href: '/' },
    { icon: Grid3X3, label: t('المنتجات'), href: '/products' },
    { icon: ShoppingCart, label: t('سلة المشتريات'), href: '/cart', badge: cartCount },
    { icon: ShoppingBag, label: t('طلباتي'), href: '/orders' },
    { icon: User, label: t('حسابي'), href: '/profile' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 900,
      background: bg,
      borderTop: `1px solid ${darkMode ? '#1e293b' : '#f1f5f9'}`,
      display: 'none',
      padding: '6px 0 env(safe-area-inset-bottom, 6px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    }} className="hx-show-mobile">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <a
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 0',
              textDecoration: 'none',
              color: isActive ? currentTheme.primary : text,
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            <div style={{ position: 'relative' }}>
              <tab.icon size={20} />
              {tab.badge && tab.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#ef4444', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
            {isActive && (
              <div style={{
                position: 'absolute', top: 0,
                width: 20, height: 3,
                borderRadius: '0 0 3px 3px',
                background: currentTheme.primary,
              }} />
            )}
          </a>
        );
      })}
    </nav>
  );
}
