'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, HelpCircle, Bell, User, Zap } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Header() {
  const { currentTheme, storeName, logoPreview, buttonRadius } = useTheme();
  const pathname = usePathname();
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const navItems = [
    { id: '/', label: 'الرئيسية', icon: Home },
    { id: '/services', label: 'الخدمات', icon: Package },
    { id: '/orders', label: 'طلباتي', icon: ShoppingCart },
    { id: '/support', label: 'الدعم', icon: HelpCircle },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        {/* Mobile: notification icon */}
        <button className="store-mobile-toggle" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#0b1020', padding: 4, position: 'relative' }}>
          <Bell size={20} />
          <div style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
        </button>

        {/* Nav */}
        <nav className="store-header-nav" style={{ display: 'flex', gap: '0.25rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.id;
            return (
              <Link key={item.id} href={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 1rem', borderRadius: btnR,
                border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                fontFamily: 'Tajawal, sans-serif',
                background: isActive ? currentTheme.primary : 'transparent',
                color: isActive ? '#fff' : '#64748b',
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
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', fontFamily: 'Tajawal, sans-serif' }}>{storeName}</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" style={{
          width: 38, height: 38, borderRadius: '50%',
          border: pathname === '/profile' ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
          background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
          <User size={16} color="#64748b" />
        </Link>
      </div>
    </header>
  );
}
