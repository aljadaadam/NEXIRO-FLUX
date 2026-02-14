import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
import ServicesHero from "./components/ServicesHero";
import ServicesProducts from "./components/ServicesProducts";

export default function ServicesScreen() {
  const banners = [
    "/images/servicesScreen/banner.png",
  ];

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="container services-container" style={{ flex: "1 0 auto" }}>
        <ServicesHero banners={banners} />

        <ServicesProducts />
      </main>
      <Footer />
    </div>
  );
}
