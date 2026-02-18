import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import MobileBottomNav from '@/components/store/MobileBottomNav';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ paddingBottom: 80 }}>{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
