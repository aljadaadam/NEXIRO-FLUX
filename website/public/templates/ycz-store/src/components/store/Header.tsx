'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Zap } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Header() {
  const { currentTheme, storeName, logoPreview, headerStyle } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { id: '/', label: 'الرئيسية' },
    { id: '/services', label: 'الخدمات' },
    { id: '/orders', label: 'طلباتي' },
    { id: '/support', label: 'الدعم' },
  ];

  return (
    <header style={{
      position: headerStyle === 'sticky' ? 'sticky' : 'relative',
      top: 0, zIndex: 50,
      background: headerStyle === 'transparent' ? 'transparent' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
      padding: '0 1.5rem',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoPreview ? (
            <img src={logoPreview} alt="logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
            }}>
              <Zap size={18} color="#fff" />
            </div>
          )}
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0b1020' }}>{storeName}</span>
        </Link>

        {/* Nav */}
        <nav className="store-header-nav" style={{ display: 'flex', gap: 4 }}>
          {navItems.map(item => (
            <Link key={item.id} href={item.id} style={{
              padding: '0.45rem 1rem', borderRadius: 10,
              fontSize: '0.85rem', fontWeight: 600,
              color: pathname === item.id ? currentTheme.primary : '#64748b',
              background: pathname === item.id ? `${currentTheme.primary}12` : 'transparent',
              transition: 'all 0.2s',
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="store-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            width: 38, height: 38, borderRadius: 10,
            border: '1px solid #f1f5f9', background: '#fff',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}>
            <Search size={16} color="#64748b" />
          </button>
          <button style={{
            width: 38, height: 38, borderRadius: 10,
            border: '1px solid #f1f5f9', background: '#fff',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            position: 'relative',
          }}>
            <ShoppingBag size={16} color="#64748b" />
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 16, height: 16, borderRadius: '50%',
              background: currentTheme.primary, color: '#fff',
              fontSize: '0.6rem', fontWeight: 800,
              display: 'grid', placeItems: 'center',
            }}>2</span>
          </button>
          <Link href="/profile" style={{
            width: 38, height: 38, borderRadius: 10,
            background: currentTheme.gradient,
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>
            <User size={16} color="#fff" />
          </Link>
        </div>
      </div>
    </header>
  );
}
