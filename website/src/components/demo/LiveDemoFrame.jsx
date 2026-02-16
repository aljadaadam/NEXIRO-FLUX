import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Demo store URL — override with VITE_DEMO_STORE_URL env var if needed
const DEMO_STORE_URL = import.meta.env.VITE_DEMO_STORE_URL || 'https://demo.nexiroflux.com';

const DEVICES = [
  { id: 'desktop', icon: '🖥️', label: 'Desktop', width: '100%' },
  { id: 'tablet', icon: '📱', label: 'Tablet', width: '768px' },
  { id: 'mobile', icon: '📲', label: 'Mobile', width: '375px' },
];

export default function LiveDemoFrame({
  path = '/',
  title = 'Live Demo',
  storeName = 'Store',
  storeUrl = DEMO_STORE_URL,
  comingSoon = false,
}) {
  const [device, setDevice] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  const currentDevice = DEVICES.find(d => d.id === device);
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
        <div style={barStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate(-1)} style={backBtnStyle}>← رجوع</button>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'Tajawal, sans-serif' }}>{title}</span>
          </div>
        </div>
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
      background: device === 'desktop' ? '#fff' : '#0f172a', overflow: 'hidden',
      transition: 'background 0.3s',
    }}>
      {/* ── Control Bar ── */}
      <div style={barStyle}>
        {/* Left: Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)} style={backBtnStyle}>← رجوع</button>
          <div style={{ width: 1, height: 20, background: '#1e293b' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'Tajawal, sans-serif' }}>{title}</span>
          <span style={{
            fontSize: '0.58rem', fontWeight: 700, color: '#7c5cff',
            background: 'rgba(124,92,255,0.15)', padding: '2px 7px', borderRadius: 4,
            letterSpacing: '0.5px',
          }}>LIVE</span>
        </div>

        {/* Center: Device Selector */}
        <div style={{ display: 'flex', gap: 2, background: '#1e293b', padding: 3, borderRadius: 8 }}>
          {DEVICES.map(d => (
            <button key={d.id} onClick={() => setDevice(d.id)} title={d.label} style={{
              background: device === d.id ? '#7c5cff' : 'transparent',
              border: 'none', color: device === d.id ? '#fff' : '#64748b', cursor: 'pointer',
              padding: '4px 10px', borderRadius: 6, fontSize: '0.82rem',
              transition: 'all 0.15s',
            }}>{d.icon}</button>
          ))}
        </div>

        {/* Right: URL display */}
        <div style={{
          fontSize: '0.68rem', color: '#475569', fontFamily: 'monospace', direction: 'ltr',
          background: '#1e293b', padding: '4px 10px', borderRadius: 6,
          maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          🔒 {iframeUrl}
        </div>
      </div>

      {/* ── Iframe Container ── */}
      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center',
        padding: device === 'desktop' ? 0 : 20,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}>
        <div style={{
          width: currentDevice.width, maxWidth: '100%', height: '100%',
          background: '#fff',
          borderRadius: device === 'desktop' ? 0 : 16,
          overflow: 'hidden',
          boxShadow: device === 'desktop' ? 'none' : '0 25px 50px rgba(0,0,0,0.25)',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}>
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
                <div style={{
                  fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', direction: 'ltr',
                  background: '#f8fafc', padding: '8px 14px', borderRadius: 8, marginBottom: 20,
                }}>
                  {iframeUrl}
                </div>
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
    </div>
  );
}

/* ─── Shared Styles ─── */
const barStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0 16px', height: 46, background: '#0f172a',
  borderBottom: '1px solid #1e293b', flexShrink: 0, zIndex: 100,
};

const backBtnStyle = {
  background: '#1e293b', border: 'none', color: '#94a3b8', cursor: 'pointer',
  padding: '5px 12px', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'Tajawal, sans-serif',
  transition: 'all 0.15s',
};
