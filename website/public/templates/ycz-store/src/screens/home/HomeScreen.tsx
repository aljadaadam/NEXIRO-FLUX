import Footer from "./components/Footer";
import Header from "./components/Header";
import FeaturedProducts from "./components/FeaturedProducts";
import Hero from "./components/Hero";
import HowToOrderSteps from "./components/HowToOrderSteps";
import AboutUsSection from "./components/AboutUsSection";

export default function HomeScreen() {
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main
        className="container"
        style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}
      >
        <Hero />

        <FeaturedProducts />

        <HowToOrderSteps />

        <AboutUsSection />
      </main>
      <Footer />
    </div>
  );
}
