'use client';

import { useState } from 'react';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { Search, ShoppingCart, User, Menu, X, Package, ChevronDown, Globe } from 'lucide-react';

export default function HxHeader() {
  const { currentTheme, darkMode, storeName, logoPreview, t, isRTL, cartCount, buttonRadius, currencies, activeCurrency, setActiveCurrency } = useHxTheme();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const bg = darkMode ? '#0f172a' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const border = darkMode ? '#1e293b' : '#f1f5f9';

  const navLinks = [
    { label: t('الرئيسية'), href: '/' },
    { label: t('المنتجات'), href: '/products' },
    { label: t('طلباتي'), href: '/orders' },
    { label: t('الدعم'), href: '/support' },
  ];

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: bg,
        borderBottom: `1px solid ${border}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s',
      }}>
        {/* Top Bar */}
        <div style={{
          background: currentTheme.gradient,
          padding: '6px 0',
          fontSize: 12,
          color: '#fff',
          textAlign: 'center',
          fontWeight: 500,
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🚚 {t('خدمة توصيل سريعة')} | 📞 {t('دعم فني متواصل')}</span>
            {/* Currency Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  padding: '3px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'inherit',
                }}
              >
                <Globe size={12} />
                {activeCurrency.code} ({activeCurrency.symbol})
                <ChevronDown size={12} />
              </button>
              {showCurrency && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  [isRTL ? 'left' : 'right']: 0,
                  marginTop: 4,
                  background: darkMode ? '#1e293b' : '#fff',
                  borderRadius: 10,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  minWidth: 180,
                  zIndex: 100,
                }}>
                  {currencies.map(cur => (
                    <button
                      key={cur.code}
                      onClick={() => { setActiveCurrency(cur.code); setShowCurrency(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        background: cur.code === activeCurrency.code ? (darkMode ? '#334155' : '#f1f5f9') : 'transparent',
                        color: text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: cur.code === activeCurrency.code ? 700 : 400,
                        textAlign: isRTL ? 'right' : 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span>{cur.name}</span>
                      <span style={{ color: '#64748b' }}>{cur.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            {logoPreview ? (
              <img src={logoPreview} alt={storeName} style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: currentTheme.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 15px ${currentTheme.primary}40`,
              }}>
                <Package size={22} color="#fff" />
              </div>
            )}
            <span style={{ fontSize: 20, fontWeight: 800, color: text, letterSpacing: -0.5 }}>{storeName}</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hx-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 18px',
                  borderRadius: Number(buttonRadius),
                  color: text,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = darkMode ? '#1e293b' : '#f1f5f9'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Cart Button */}
            <a
              href="/cart"
              style={{
                position: 'relative',
                width: 40, height: 40, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: darkMode ? '#1e293b' : '#f1f5f9',
                color: text,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, [isRTL ? 'left' : 'right']: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: currentTheme.primary,
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </a>

            {/* Profile */}
            <a
              href="/profile"
              style={{
                width: 40, height: 40, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: darkMode ? '#1e293b' : '#f1f5f9',
                color: text,
                textDecoration: 'none',
              }}
            >
              <User size={20} />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              className="hx-show-mobile"
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{
                display: 'none',
                width: 40, height: 40, borderRadius: 10,
                alignItems: 'center', justifyContent: 'center',
                background: darkMode ? '#1e293b' : '#f1f5f9',
                color: text,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div style={{
            padding: '12px 20px 20px',
            borderTop: `1px solid ${border}`,
            background: bg,
          }} className="hx-animate-fade">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: 10,
                  color: text,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
