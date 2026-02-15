'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

function LoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('admin_key', token);
      router.replace('/admin');
    }
  }, [searchParams, router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'linear-gradient(135deg, #0b1020 0%, #1a1040 100%)',
      fontFamily: 'Tajawal, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #7c5cff, #6d4de6)',
          display: 'grid', placeItems: 'center',
        }}>
          <Zap size={28} color="#fff" />
        </div>
        <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>جاري تسجيل الدخول...</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>يرجى الانتظار</p>
        <div style={{
          width: 32, height: 32, border: '3px solid #374151', borderTopColor: '#7c5cff',
          borderRadius: '50%', margin: '20px auto 0',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#0b1020',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid #374151', borderTopColor: '#7c5cff',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginHandler />
    </Suspense>
  );
}
