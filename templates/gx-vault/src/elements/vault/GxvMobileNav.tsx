'use client';

import { Home, Gamepad2, ShoppingBag, User, HelpCircle } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { usePathname } from 'next/navigation';

const GXV_NAV_ITEMS = [
  { id: 'home', label: 'الرئيسية', icon: Home, href: '/' },
  { id: 'games', label: 'الألعاب', icon: Gamepad2, href: '/services' },
  { id: 'orders', label: 'طلباتي', icon: ShoppingBag, href: '/orders' },
  { id: 'support', label: 'الدعم', icon: HelpCircle, href: '/support' },
  { id: 'profile', label: 'حسابي', icon: User, href: '/profile' },
];

export default function GxvMobileNav() {
  const { currentTheme } = useGxvTheme();
  const pathname = usePathname();

  return (
    <nav className="gxv-hide-desktop" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'rgba(8,8,20,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '6px 8px 10px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
      {GXV_NAV_ITEMS.map(item => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <a key={item.id} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, textDecoration: 'none', flex: 1,
            color: active ? currentTheme.primary : '#666688',
            transition: 'color 0.2s',
            position: 'relative',
          }}>
            {active && (
              <div style={{
                position: 'absolute', top: -6, width: 28, height: 3,
                borderRadius: 2,
                background: currentTheme.gradient,
                boxShadow: currentTheme.glow,
              }} />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 400 }}>
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
