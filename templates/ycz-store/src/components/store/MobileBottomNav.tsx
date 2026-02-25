'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, HelpCircle, User } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function MobileBottomNav() {
  const { currentTheme, t } = useTheme();
  const pathname = usePathname();

  const items = [
    { id: '/', icon: Home, label: t('الرئيسية') },
    { id: '/services', icon: Package, label: t('الخدمات') },
    { id: '/orders', icon: ShoppingCart, label: t('طلباتي') },
    { id: '/support', icon: HelpCircle, label: t('الدعم') },
    { id: '/profile', icon: User, label: t('حسابي') },
  ];

  return (
    <nav className="store-mobile-nav" style={{
      display: 'none',
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 9999,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--nav-border)',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.45rem 0 calc(0.5rem + env(safe-area-inset-bottom, 0px))',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
    }}>
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.id;
        return (
          <Link key={item.id} href={item.id} prefetch={true} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center',
            gap: 2, cursor: 'pointer', background: 'none', border: 'none',
            color: active ? currentTheme.primary : 'var(--text-muted)',
            position: 'relative',
            minWidth: 48, minHeight: 44,
            padding: '4px 8px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            textDecoration: 'none',
          }}>
            {active && (
              <div style={{
                position: 'absolute', top: -2,
                width: 20, height: 3, borderRadius: 2,
                background: currentTheme.primary,
              }} />
            )}
            <Icon size={20} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, lineHeight: 1 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
