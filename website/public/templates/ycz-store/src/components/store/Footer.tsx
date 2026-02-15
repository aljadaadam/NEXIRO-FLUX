'use client';

import { Zap } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Footer() {
  const { currentTheme, storeName } = useTheme();

  return (
    <footer style={{
      background: '#0b1020', color: '#94a3b8', padding: '3rem 1.5rem 1.5rem',
      marginTop: '3rem',
    }}>
      <div className="store-footer-grid" style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40,
        marginBottom: '2rem',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{storeName}</span>
          </div>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.8, maxWidth: 280 }}>
            منصة موثوقة لخدمات الهواتف الذكية والخدمات الرقمية. نقدم أفضل الأسعار مع دعم فني متواصل.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>روابط سريعة</h4>
          {['الرئيسية', 'الخدمات', 'طلباتي', 'الدعم'].map(link => (
            <p key={link} style={{ fontSize: '0.82rem', marginBottom: 8, cursor: 'pointer' }}>{link}</p>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>خدماتنا</h4>
          {['فتح شبكات', 'كريدت و تفعيلات', 'فحص IMEI', 'شحن ألعاب'].map(link => (
            <p key={link} style={{ fontSize: '0.82rem', marginBottom: 8, cursor: 'pointer' }}>{link}</p>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>تواصل معنا</h4>
          <p style={{ fontSize: '0.82rem', marginBottom: 8 }}>📧 support@store.com</p>
          <p style={{ fontSize: '0.82rem', marginBottom: 8 }}>💬 واتساب 24/7</p>
          <p style={{ fontSize: '0.82rem', marginBottom: 8 }}>📱 تيليجرام</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {['💬', '📘', '🐦', '📸'].map((icon, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                display: 'grid', placeItems: 'center',
                fontSize: '0.85rem', cursor: 'pointer',
              }}>{icon}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Icons */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '1.25rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <p style={{ fontSize: '0.75rem' }}>© 2025 {storeName} — جميع الحقوق محفوظة</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {['🟡 Binance', '🔵 PayPal', '💳 Visa', '💚 USDT'].map((badge, i) => (
            <span key={i} style={{
              padding: '0.25rem 0.6rem', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              fontSize: '0.65rem', fontWeight: 600,
            }}>{badge}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
