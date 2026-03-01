'use client';

import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ParticlesBackground from '@/components/store/ParticlesBackground';
import ChatWidget from '@/components/store/ChatWidget';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ParticlesBackground />
      <Header />
      <main className="store-main" style={{ position: 'relative', zIndex: 1, minHeight: '80vh' }}>
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
