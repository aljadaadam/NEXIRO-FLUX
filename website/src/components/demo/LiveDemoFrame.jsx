import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Demo store URL — override with VITE_DEMO_STORE_URL env var if needed
const DEMO_STORE_URL = import.meta.env.VITE_DEMO_STORE_URL || 'https://demo.nexiroflux.com';

export default function LiveDemoFrame({
  path = '/',
  title = 'Live Demo',
  storeName = 'Store',
  storeUrl = DEMO_STORE_URL,
  comingSoon = false,
  templateLink = '/template/digital-services-store',
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  const iframeUrl = storeUrl ? `${storeUrl}${path}` : '';

  useEffect(() => {
    if (!storeUrl || comingSoon) return;
    timeoutRef.current = setTimeout(() => {
      if (loading) setError(true);
    }, 20000);
    return () => clearTimeout(timeoutRef.current);
  }, [storeUrl, loading, comingSoon]);

  /* ─── Coming Soon / No URL configured ─── */
  if (comingSoon || !storeUrl) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        background: '#0f172a', overflow: 'hidden',
      }}>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3.5rem', marginBottom: 16 }}>🚧</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 10, fontFamily: 'Tajawal, sans-serif' }}>
              {comingSoon ? 'قريباً' : 'لم يتم تكوين رابط الديمو'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', fontFamily: 'Tajawal, sans-serif', maxWidth: 420, lineHeight: 1.6 }}>
              {comingSoon
                ? `قالب ${storeName} قيد التطوير حالياً. ترقبوا إطلاقه قريباً!`
                : 'يرجى تعيين VITE_DEMO_STORE_URL في ملف .env لتشغيل المعاينة الحية'
              }
            </p>
            <button onClick={() => navigate(-1)} style={{
              marginTop: 28, padding: '0.75rem 2rem', borderRadius: 12,
              background: '#7c5cff', color: '#fff', border: 'none',
              fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>← العودة للقوالب</button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Live Iframe Demo ─── */
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#fff', overflow: 'hidden',
    }}>
      {/* ── Demo Banner ── */}
      <div style={{
        position: 'relative', zIndex: 100, flexShrink: 0,
        background: 'linear-gradient(90deg, #7c5cff, #6d4de6)',
        padding: '0.45rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', fontFamily: 'Tajawal, sans-serif' }}>
          📢 ديمو {title} — <Link to={templateLink} style={{ color: '#fff', textDecoration: 'underline' }}>اشترِ القالب الآن</Link>
        </span>
      </div>

      {/* ── Iframe Container ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Loading Overlay */}
        {loading && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#fff', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 42, height: 42, border: '3px solid #e2e8f0', borderTopColor: '#7c5cff',
                borderRadius: '50%', animation: 'demoSpin 0.8s linear infinite', margin: '0 auto 16px',
              }} />
              <p style={{ fontSize: '0.9rem', color: '#334155', fontFamily: 'Tajawal, sans-serif', fontWeight: 700 }}>
                جاري تحميل {storeName}...
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'Tajawal, sans-serif', marginTop: 6 }}>
                يتم تحميل النسخة الحقيقية من القالب
              </p>
            </div>
            <style>{`@keyframes demoSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#fff', zIndex: 10 }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', fontFamily: 'Tajawal, sans-serif', marginBottom: 8 }}>
                تعذر تحميل الديمو
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'Tajawal, sans-serif', marginBottom: 16, maxWidth: 340, lineHeight: 1.6 }}>
                تأكد من أن القالب يعمل على الخادم وأن الرابط صحيح
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => {
                  setError(false); setLoading(true);
                  if (iframeRef.current) iframeRef.current.src = iframeUrl;
                  timeoutRef.current = setTimeout(() => setError(true), 20000);
                }} style={{
                  padding: '0.6rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff',
                  border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                }}>🔄 إعادة المحاولة</button>
                <button onClick={() => navigate(-1)} style={{
                  padding: '0.6rem 1.5rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b',
                  border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                }}>← رجوع</button>
              </div>
            </div>
          </div>
        )}

        {/* The Real Template Iframe */}
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          onLoad={() => { setLoading(false); setError(false); clearTimeout(timeoutRef.current); }}
          onError={() => setError(true)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={title}
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
