'use client';

import Link from 'next/link';
import { useTheme } from '@/providers/ThemeProvider';

export default function Footer() {
  const { storeName, t, socialLinks } = useTheme();

  const legalLinks = [
    { label: t('المدونة'), href: '/blog' },
    { label: t('سياسة الخصوصية'), href: '/privacy' },
    { label: t('الشروط والأحكام'), href: '/terms' },
    { label: t('سياسة الاسترجاع'), href: '/refund' },
  ];

  const allSocialItems = [
    { key: 'whatsapp', url: socialLinks?.whatsapp, color: '#25D366', label: 'WhatsApp', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { key: 'telegram', url: socialLinks?.telegram, color: '#0088cc', label: 'Telegram', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { key: 'facebook', url: socialLinks?.facebook, color: '#1877F2', label: 'Facebook', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  ];

  return (
    <footer className="store-footer" style={{ background: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '1.75rem 0 5.5rem', borderTop: '1px solid #f1f5f9', marginTop: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
        <div className="store-footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>{t('نحن نقبل')}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Binance', 'PayPal', 'Bank'].map(m => (
                <span key={m} style={{ padding: '0.3rem 0.75rem', borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{m}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>{t('روابط مهمة')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {legalLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{ fontSize: '0.78rem', color: '#64748b', cursor: 'pointer', textDecoration: 'none' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>{t('تواصل معنا')}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {allSocialItems.map(s => 
                s.url ? (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                     style={{ width: 36, height: 36, borderRadius: 10, background: s.color, display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'opacity .2s' }}
                     onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                     onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >{s.icon}</a>
                ) : (
                  <span key={s.key} aria-label={s.label}
                     style={{ width: 36, height: 36, borderRadius: 10, background: s.color, display: 'grid', placeItems: 'center', opacity: 0.5 }}
                  >{s.icon}</span>
                )
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            © 2026 {storeName}. {t('جميع الحقوق محفوظة — قالب من')}{' '}
            <a href="https://www.nexiroflux.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
              NEXIRO-FLUX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
