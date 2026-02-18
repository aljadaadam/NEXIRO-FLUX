'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Car, MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { currentTheme, darkMode, storeName, t, isRTL } = useTheme();
  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#060610' : '#f8f8fc';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <footer className="car-footer" style={{ background: bg, color: textColor, padding: '60px 24px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* About */}
          <div className="anim-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: currentTheme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={22} color="#fff" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 900 }}>{storeName}</span>
            </div>
            <p style={{ color: mutedColor, lineHeight: 1.8, fontSize: 14 }}>
              {t('نقدم لك أفضل السيارات الجديدة والمستعملة بأسعار منافسة وضمان شامل')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="anim-fade-up anim-delay-2">
            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>{t('روابط سريعة')}</h4>
            {[
              { label: t('الرئيسية'), href: '/' },
              { label: t('السيارات'), href: '/cars' },
              { label: t('الفروع'), href: '/branches' },
              { label: t('تواصل معنا'), href: '/contact' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{ display: 'block', color: mutedColor, padding: '8px 0', fontSize: 14, transition: 'color 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.color = accent)}
                onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}>
                {item.label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="anim-fade-up anim-delay-4">
            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>{t('تواصل معنا')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: mutedColor, fontSize: 14 }}>
                <Phone size={16} color={accent} />
                <span dir="ltr">+966 11 234 5678</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: mutedColor, fontSize: 14 }}>
                <Mail size={16} color={accent} />
                <span>info@autozone.sa</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: mutedColor, fontSize: 14 }}>
                <MapPin size={16} color={accent} />
                <span>{t('الرياض — طريق الملك فهد')}</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="anim-fade-up anim-delay-6">
            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>{t('تابعنا')}</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Instagram, MessageCircle].map((Icon, i) => (
                <div key={i} style={{ width: 44, height: 44, borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <Icon size={20} color="#fff" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, paddingTop: 20, textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <a href="/privacy" style={{ color: mutedColor, fontSize: 13, transition: 'color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.color = accent)}
              onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}>
              {t('سياسة الخصوصية')}
            </a>
            <a href="/terms" style={{ color: mutedColor, fontSize: 13, transition: 'color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.color = accent)}
              onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}>
              {t('الشروط والأحكام')}
            </a>
          </div>
          <p style={{ color: mutedColor, fontSize: 12 }}>
            © {new Date().getFullYear()} {storeName}. {t('جميع الحقوق محفوظة — قالب من')}{' '}
            <a href="https://www.nexiroflux.com/" target="_blank" rel="noopener noreferrer"
              style={{ color: mutedColor, textDecoration: 'underline', transition: 'color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.color = accent)}
              onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}>
              NEXIRO-FLUX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
