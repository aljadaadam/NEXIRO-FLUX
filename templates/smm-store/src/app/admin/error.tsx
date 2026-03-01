'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void; }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>حدث خطأ</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>{error.message}</p>
        <button onClick={reset} style={{
          padding: '10px 24px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          color: '#fff', fontWeight: 700, cursor: 'pointer',
        }}>
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
