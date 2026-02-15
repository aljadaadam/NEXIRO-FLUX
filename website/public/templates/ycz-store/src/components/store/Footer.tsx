'use client';

import { useTheme } from '@/providers/ThemeProvider';

export default function Footer() {
  const { storeName } = useTheme();

  return (
    <footer className="store-footer" style={{ background: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '1.75rem 0 5.5rem', borderTop: '1px solid #f1f5f9', marginTop: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
        <div className="store-footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>نحن نقبل</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Binance', 'PayPal', 'Bank'].map(m => (
                <span key={m} style={{ padding: '0.3rem 0.75rem', borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{m}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>روابط مهمة</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['سياسة الخصوصية', 'الشروط والأحكام', 'سياسة الاسترجاع'].map(l => (
                <span key={l} style={{ fontSize: '0.78rem', color: '#64748b', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1020', marginBottom: 8 }}>تواصل معنا</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['📘', '📸', '💬'].map((s, i) => (
                <span key={i} style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: '1.1rem' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>© 2026 {storeName}. جميع الحقوق محفوظة — قالب من NEXIRO-FLUX</p>
        </div>
      </div>
    </footer>
  );
}
