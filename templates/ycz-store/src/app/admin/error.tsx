'use client';

import { useEffect } from 'react';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  const { t, isRTL } = useAdminLang();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{
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
        background: '#fff',
        borderRadius: 16,
        padding: '2rem',
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #fee2e2',
      }}>
        <h2 style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>
          {t('حدث خطأ')}
        </h2>
        <pre dir="ltr" style={{
          background: '#fef2f2',
          padding: '1rem',
          borderRadius: 8,
          fontSize: '0.75rem',
          color: '#991b1b',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          marginBottom: 16,
          border: '1px solid #fecaca',
        }}>
          {error.message}
          {error.stack && '\n\n' + error.stack}
        </pre>
        <button
          onClick={reset}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 10,
            background: '#7c5cff',
            color: '#fff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
          }}
        >
          {t('إعادة المحاولة')}
        </button>
      </div>
    </div>
  );
}
