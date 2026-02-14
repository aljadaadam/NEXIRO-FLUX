import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
import SupportContactMethods from "./components/SupportContactMethods";
import SupportFaq from "./components/SupportFaq";
import SupportHero from "./components/SupportHero";
import SupportTicketForm from "./components/SupportTicketForm";

export default function SupportScreen() {
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
        <SupportHero />

        <div className="support-grid" style={{ marginTop: "1rem" }}>
          <SupportContactMethods />
          <SupportTicketForm />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <SupportFaq />
        </div>
      </main>
      <Footer />
    </div>
  );
}
