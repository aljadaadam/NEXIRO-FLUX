'use client';

import GxvNavbar from '@/elements/vault/GxvNavbar';
import GxvFooter from '@/elements/vault/GxvFooter';
import GxvMobileNav from '@/elements/vault/GxvMobileNav';

export default function GxvStoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Background mesh */}
      <div className="gxv-bg-mesh" />

      <GxvNavbar />

      <main style={{ paddingTop: 70, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {children}
      </main>

      <GxvFooter />
      <GxvMobileNav />
    </>
  );
}
