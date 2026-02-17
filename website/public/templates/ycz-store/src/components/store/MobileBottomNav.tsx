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
      zIndex: 50,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.5rem 0 0.6rem',
    }}>
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.id;
        return (
          <Link key={item.id} href={item.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, cursor: 'pointer', background: 'none', border: 'none',
            color: active ? currentTheme.primary : '#94a3b8',
            position: 'relative',
          }}>
            {active && (
              <div style={{
                position: 'absolute', top: -8,
                width: 20, height: 3, borderRadius: 2,
                background: currentTheme.primary,
              }} />
            )}
            <Icon size={20} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
