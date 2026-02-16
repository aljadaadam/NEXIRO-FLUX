'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Gamepad2 } from 'lucide-react';

function GxvLoginHandler() {
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
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #050510 0%, #0a0a2e 40%, #150530 100%)',
      fontFamily: 'Tajawal, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        top: '-10%', right: '-5%', filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        bottom: '-5%', left: '-5%', filter: 'blur(50px)',
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 40px rgba(139,92,246,0.4)',
        }}>
          <Gamepad2 size={36} color="#fff" />
        </div>
        <h2 style={{
          color: '#fff', fontSize: '1.5rem', fontWeight: 800,
          marginBottom: 8, letterSpacing: '0.5px',
        }}>
          جاري تسجيل الدخول...
        </h2>
        <p style={{ color: '#8888aa', fontSize: '0.9rem' }}>يرجى الانتظار</p>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(139,92,246,0.2)',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          margin: '24px auto 0',
          animation: 'gxvSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes gxvSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function GxvLoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#050510', color: '#8888aa',
      }}>
        جاري التحميل...
      </div>
    }>
      <GxvLoginHandler />
    </Suspense>
  );
}
