'use client';

export default function HxAdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', padding: 40, maxWidth: 500 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>حدث خطأ</h2>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>{error.message}</p>
        {error.stack && (
          <pre style={{ color: '#64748b', fontSize: 11, textAlign: 'left', direction: 'ltr', background: '#1e293b', padding: 16, borderRadius: 12, overflow: 'auto', maxHeight: 200, marginBottom: 16 }}>
            {error.stack}
          </pre>
        )}
        <button onClick={reset} style={{
          padding: '10px 24px', borderRadius: 12, border: 'none',
          background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
