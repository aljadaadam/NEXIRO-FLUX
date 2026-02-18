'use client';
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>خطأ في لوحة التحكم</h2>
        <p style={{ color: '#999', marginBottom: 20 }}>{error.message}</p>
        <button onClick={reset} style={{ padding: '12px 28px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>حاول مرة أخرى</button>
      </div>
    </div>
  );
}
