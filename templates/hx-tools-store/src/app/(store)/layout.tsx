'use client';

import HxHeader from '@/components/store/HxHeader';
import HxFooter from '@/components/store/HxFooter';
import HxMobileBottomNav from '@/components/store/HxMobileBottomNav';

export default function HxStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HxHeader />
      <main style={{ flex: 1, paddingBottom: 70 }}>
        {children}
      </main>
      <HxFooter />
      <HxMobileBottomNav />
    </div>
  );
}
