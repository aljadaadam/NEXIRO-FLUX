'use client';

export default function HxGlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>حدث خطأ غير متوقع</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>{error.message}</p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
