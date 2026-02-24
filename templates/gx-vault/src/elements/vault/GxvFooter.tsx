'use client';

import { Gamepad2, Heart, Shield, Zap } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';

export default function GxvFooter() {
  const { currentTheme, storeName } = useGxvTheme();
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'linear-gradient(180deg, transparent 0%, rgba(5,5,16,0.95) 30%)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      padding: '60px 24px 100px',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40, marginBottom: 40,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: currentTheme.gradient,
                display: 'grid', placeItems: 'center',
              }}>
                <Gamepad2 size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{storeName}</span>
            </div>
            <p style={{ color: '#666688', fontSize: '0.85rem', lineHeight: 1.7 }}>
              منصة موثوقة لشحن ألعابك المفضلة بأسرع وقت وأفضل الأسعار.
              شحن فوري وآمن على مدار الساعة.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#b8b8cc', fontSize: '0.85rem', fontWeight: 700, marginBottom: 16 }}>روابط سريعة</h4>
            {[
              { label: 'الرئيسية', href: '/' },
              { label: 'الألعاب', href: '/services' },
              { label: 'طلباتي', href: '/orders' },
              { label: 'حسابي', href: '/profile' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                display: 'block', color: '#666688', textDecoration: 'none',
                fontSize: '0.85rem', marginBottom: 10,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = currentTheme.primary)}
              onMouseLeave={e => (e.currentTarget.style.color = '#666688')}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Features */}
          <div>
            <h4 style={{ color: '#b8b8cc', fontSize: '0.85rem', fontWeight: 700, marginBottom: 16 }}>لماذا نحن؟</h4>
            {[
              { icon: <Zap size={14} />, text: 'شحن فوري خلال ثوانٍ' },
              { icon: <Shield size={14} />, text: 'معاملات آمنة ومشفرة' },
              { icon: <Heart size={14} />, text: 'دعم فني على مدار الساعة' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#666688', fontSize: '0.85rem', marginBottom: 10,
              }}>
                <span style={{ color: currentTheme.primary }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: '#555577', fontSize: '0.8rem' }}>
            © {year} {storeName}. جميع الحقوق محفوظة.
          </p>
          <p style={{ color: '#444466', fontSize: '0.75rem' }}>
            Powered by NEXIRO
          </p>
        </div>
      </div>
    </footer>
  );
}
