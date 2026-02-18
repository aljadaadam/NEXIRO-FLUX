'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html><body style={{ background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 28 }}>حدث خطأ</h2>
        <p style={{ color: '#999' }}>{error.message}</p>
        <button onClick={reset} style={{ marginTop: 20, padding: '12px 32px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 16 }}>حاول مرة أخرى</button>
      </div>
    </body></html>
  );
}
