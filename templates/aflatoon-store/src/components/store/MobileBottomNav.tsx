'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, User, Gamepad2 } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function MobileBottomNav() {
  const { currentTheme, t } = useTheme();
  const pathname = usePathname();

  const items = [
    { id: '/', label: t('الرئيسية'), icon: Home },
    { id: '/services', label: t('التفعيلات'), icon: Package },
    { id: '/services?cat=games', label: t('ألعاب'), icon: Gamepad2 },
    { id: '/orders', label: t('طلباتي'), icon: ShoppingCart },
    { id: '/profile', label: t('حسابي'), icon: User },
  ];

  return (
    <div className="store-mobile-nav" style={{
      display: 'none', flexDirection: 'row',
      background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--nav-border)',
      padding: '0.5rem 0', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
    }}>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.id || (item.id !== '/' && pathname.startsWith(item.id.split('?')[0]));
        return (
          <Link key={item.id} href={item.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '0.3rem 0', textDecoration: 'none',
            color: isActive ? currentTheme.primary : 'var(--text-muted)',
            fontSize: '0.62rem', fontWeight: isActive ? 700 : 500,
            borderTop: isActive ? `2px solid ${currentTheme.primary}` : '2px solid transparent',
            transition: 'all 0.2s',
          }}>
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
