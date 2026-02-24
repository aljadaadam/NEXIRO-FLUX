'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Home, Car, MapPin, Phone, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const { currentTheme, darkMode, t } = useTheme();
  const pathname = usePathname();
  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? 'rgba(10,10,18,0.95)' : 'rgba(255,255,255,0.95)';
  const textColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  const items = [
    { icon: Home, label: t('الرئيسية'), href: '/' },
    { icon: Car, label: t('السيارات'), href: '/cars' },
    { icon: MapPin, label: t('الفروع'), href: '/branches' },
    { icon: Phone, label: t('تواصل'), href: '/contact' },
  ];

  return (
    <nav className="car-mobile-nav" style={{ background: bg, backdropFilter: 'blur(20px)', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
      {items.map(item => {
        const active = pathname === item.href;
        return (
          <a key={item.href} href={item.href} className={`car-mobile-nav-item ${active ? 'active' : ''}`} style={{ color: active ? accent : textColor }}>
            <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
