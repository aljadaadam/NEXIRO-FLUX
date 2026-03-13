import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import MobileBottomNav from '@/components/store/MobileBottomNav';
import ChatWidget from '@/components/store/ChatWidget';
import FlashPopup from '@/components/store/FlashPopup';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="store-main" style={{ minHeight: '70vh' }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <ChatWidget />
      <FlashPopup />
    </div>
  );
}
