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
      // Security: clear the token from URL immediately to prevent leaking in history/logs/Referer
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.pathname + url.search);
      }

      // Validate token with backend before storing
      (async () => {
        try {
          const verifyRes = await fetch('/api/customization', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          if (!verifyRes.ok) {
            // Invalid token — redirect to profile
            router.replace('/profile');
            return;
          }
          // Token is valid — store it
          localStorage.setItem('admin_key', token);

          const data = await verifyRes.json();
          const slug = searchParams.get('slug') || data.admin_slug || data.customization?.admin_slug || '';

          if (slug) {
            sessionStorage.setItem('admin_slug', slug);
            router.replace(`/admin?key=${slug}`);
          } else {
            router.replace('/admin');
          }
        } catch {
          // Network error — redirect to profile
          router.replace('/profile');
        }
      })();
    } else {
      // No token -> redirect to profile page (login/register handled there)
      router.replace('/profile');
    }
  }, [searchParams, router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'linear-gradient(135deg, #0b1020 0%, #1a1040 100%)',
      fontFamily: 'inherit',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #7c5cff, #6d4de6)',
          display: 'grid', placeItems: 'center',
        }}>
          <Zap size={28} color="#fff" />
        </div>
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
