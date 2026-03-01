'use client';

import { useEffect, useState } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  // Auto-retry for chunk loading errors (happens during rebuild)
  useEffect(() => {
    const isChunkError = error.message?.includes('Loading chunk') || error.message?.includes('ChunkLoadError');
    if (!isChunkError) return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); window.location.reload(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [error]);

  return (
    <div dir="rtl" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Tajawal, sans-serif',
      background: '#f8fafc',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', maxWidth: 400,
      }}>
        {/* Animated icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: '#f1f5f9',
          display: 'grid', placeItems: 'center',
          marginBottom: 20,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.801 10A10 10 0 1 1 17 3.335" />
            <path d="M22 2 12 12" style={{ animation: 'spin-arrow 2s ease-in-out infinite' }} />
          </svg>
        </div>

        <h2 style={{
          fontSize: '1.15rem', fontWeight: 800, color: '#334155',
          marginBottom: 8, lineHeight: 1.6,
        }}>
          يجري تحديث النظام
        </h2>
        <p style={{
          fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500,
          lineHeight: 1.7, marginBottom: 24,
        }}>
          يرجى الانتظار قليلاً ثم حاول مرة أخرى
        </p>

        {/* Countdown or retry button */}
        <button
          onClick={() => { window.location.reload(); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.7rem 2rem',
            borderRadius: 12,
            background: '#7c5cff',
            color: '#fff',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
            boxShadow: '0 4px 16px rgba(124,92,255,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.801 10A10 10 0 1 1 17 3.335" />
            <path d="M22 2v6h-6" />
          </svg>
          {countdown > 0 && countdown < 5 ? `إعادة المحاولة (${countdown})` : 'إعادة المحاولة'}
        </button>

        {/* Loading dots animation */}
        <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#cbd5e1',
              animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes spin-arrow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
