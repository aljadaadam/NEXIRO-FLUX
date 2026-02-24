'use client';

import { useHxTheme } from '@/providers/HxThemeProvider';
import { Package, Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';

export default function HxFooter() {
  const { currentTheme, darkMode, storeName, t, isRTL, buttonRadius } = useHxTheme();
  const bg = darkMode ? '#0f172a' : '#111827';
  const text = '#94a3b8';

  return (
    <footer style={{ background: bg, color: text, paddingTop: 60, marginTop: 40 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, paddingBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: currentTheme.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={22} color="#fff" />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{storeName}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: text, maxWidth: 300 }}>
              {t('أدوات الصيانة والسوفتوير')} - {t('أفضل أدوات الصيانة')} {t('خدمة توصيل سريعة')}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {[Facebook, Instagram, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: text, textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = currentTheme.primary; (e.target as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.target as HTMLElement).style.color = text; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t('روابط سريعة')}</h3>
            {[
              { label: t('الرئيسية'), href: '/' },
              { label: t('المنتجات'), href: '/products' },
              { label: t('طلباتي'), href: '/orders' },
              { label: t('حسابي'), href: '/profile' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                display: 'block', color: text, textDecoration: 'none', fontSize: 14,
                padding: '6px 0', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = currentTheme.primary}
              onMouseLeave={e => (e.target as HTMLElement).style.color = text}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t('قانوني')}</h3>
            {[
              { label: t('سياسة الخصوصية'), href: '/privacy' },
              { label: t('الشروط والأحكام'), href: '/terms' },
              { label: t('سياسة الاسترجاع'), href: '/refund' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                display: 'block', color: text, textDecoration: 'none', fontSize: 14,
                padding: '6px 0', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = currentTheme.primary}
              onMouseLeave={e => (e.target as HTMLElement).style.color = text}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t('تواصل معنا')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} style={{ color: currentTheme.primary }} />
                <span style={{ fontSize: 14 }}>support@hxtools.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} style={{ color: currentTheme.primary }} />
                <span style={{ fontSize: 14 }}>+966 50 000 0000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} style={{ color: currentTheme.primary }} />
                <span style={{ fontSize: 14 }}>{t('توصيل لجميع الدول العربية')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: text }}>{t('طرق الدفع')}:</span>
            {['💳', '🏦', '₿', '💵'].map((icon, i) => (
              <span key={i} style={{
                padding: '4px 10px', background: 'rgba(255,255,255,0.08)',
                borderRadius: 6, fontSize: 16,
              }}>{icon}</span>
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            © 2026 {storeName}. {t('جميع الحقوق محفوظة')}.
          </span>
        </div>
      </div>
    </footer>
  );
}
