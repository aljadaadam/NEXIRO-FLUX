'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Heart, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { currentTheme, darkMode, isRTL, t, storeName, socialLinks, footerText } = useTheme();

  const quickLinks = [
    { label: t('الرئيسية'), href: '/' },
    { label: t('الخدمات'), href: '/services' },
    { label: t('الطلبات'), href: '/orders' },
    { label: t('الدعم'), href: '/support' },
  ];

  const legalLinks = [
    { label: t('سياسة الخصوصية'), href: '/privacy' },
    { label: t('شروط الاستخدام'), href: '/terms' },
    { label: t('سياسة الاسترداد'), href: '/refund' },
  ];

  return (
    <footer
      className="store-footer"
      style={{
        background: darkMode
          ? 'linear-gradient(180deg, rgba(5, 10, 24, 0) 0%, rgba(5, 10, 24, 1) 30%)'
          : 'linear-gradient(180deg, rgba(248,250,252,0) 0%, #f1f5f9 30%)',
        padding: '60px 20px 30px',
        marginTop: 60,
        position: 'relative',
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: currentTheme.gradient, opacity: 0.3,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="store-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: currentTheme.gradient,
                display: 'grid', placeItems: 'center',
                fontSize: '1.2rem', color: '#fff',
                boxShadow: currentTheme.glow,
              }}>
                ⚡
              </div>
              <span style={{
                fontSize: '1.3rem', fontWeight: 800,
                background: currentTheme.gradient,
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {storeName}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 400 }}>
              {footerText || t('احصل على متابعين، لايكات، مشاهدات وتعليقات حقيقية لجميع منصات التواصل الاجتماعي بأسعار تنافسية وتسليم فوري')}
            </p>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener" style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'grid', placeItems: 'center',
                  color: '#25D366', transition: 'all 0.3s ease',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  <MessageCircle size={18} />
                </a>
              )}
              {socialLinks.telegram && (
                <a href={socialLinks.telegram} target="_blank" rel="noopener" style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'grid', placeItems: 'center',
                  color: '#0088cc', transition: 'all 0.3s ease',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>
              {t('روابط سريعة')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickLinks.map(link => (
                <a key={link.href} href={link.href} style={{
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                  transition: 'color 0.2s ease', textDecoration: 'none',
                }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = currentTheme.primary}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>
              {t('سياسة الخصوصية')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {legalLinks.map(link => (
                <a key={link.href} href={link.href} style={{
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                  transition: 'color 0.2s ease', textDecoration: 'none',
                }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = currentTheme.primary}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          paddingTop: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: '0.8rem',
        }}>
          <span>© {new Date().getFullYear()} {storeName}.</span>
          <span>{t('جميع الحقوق محفوظة')}</span>
          <Heart size={12} style={{ color: currentTheme.primary }} />
        </div>
      </div>
    </footer>
  );
}
