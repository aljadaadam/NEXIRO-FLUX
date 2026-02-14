export default function Footer() {
  const muted = "rgba(11, 16, 32, 0.78)";

  return (
    <footer
      style={{
        padding: "1.75rem 0 2.5rem",
        background: "#ffffff",
        color: "#0b1020",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        overflow: "hidden",
        boxShadow: "0 -18px 40px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            alignItems: "start",
            textAlign: "center",
          }}
        >
          <section aria-label="نحن نقبل">
            <div style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>نحن نقبل</div>
            <div
              style={{
                display: "flex",
                gap: "0.65rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <img
                src="/images/binance.jpg"
                alt="Binance"
                style={{
                  width: 84,
                  height: 34,
                  objectFit: "contain",
                  borderRadius: 9999,
                  border: "1px solid rgba(11, 16, 32, 0.14)",
                  background: "#fff",
                  padding: "0.25rem 0.5rem",
                }}
              />

              <img
                src="/images/paybal.png"
                alt="Paybal"
                style={{
                  width: 84,
                  height: 34,
                  objectFit: "contain",
                  borderRadius: 9999,
                  border: "1px solid rgba(11, 16, 32, 0.14)",
                  background: "#fff",
                  padding: "0.25rem 0.5rem",
                }}
              />

              <img
                src="/images/bank.png"
                alt="Bank"
                style={{
                  width: 84,
                  height: 34,
                  objectFit: "contain",
                  borderRadius: 9999,
                  border: "1px solid rgba(11, 16, 32, 0.14)",
                  background: "#fff",
                  padding: "0.25rem 0.5rem",
                }}
              />
            </div>
          </section>

          <section aria-label="روابط مهمة">
            <div style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>روابط مهمة</div>
            <div style={{ display: "grid", gap: "0.5rem", justifyItems: "center" }}>
              <a href="#" style={{ color: muted, fontSize: "0.95rem" }}>
                من نحن
              </a>
              <a href="#" style={{ color: muted, fontSize: "0.95rem" }}>
                سياسة الخصوصية
              </a>
              <a href="#" style={{ color: muted, fontSize: "0.95rem" }}>
                الأحكام والشروط
              </a>
              <a href="#" style={{ color: muted, fontSize: "0.95rem" }}>
                الدعم
              </a>
            </div>
          </section>

          <section aria-label="وسائل التواصل">
            <div style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>وسائل التواصل</div>
            <div
              style={{
                display: "flex",
                gap: "0.65rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <a
                href="#"
                aria-label="Facebook"
                title="Facebook"
                style={{
                  width: 44,
                  height: 34,
                  borderRadius: 9999,
                  border: "1px solid rgba(11, 16, 32, 0.14)",
                  display: "grid",
                  placeItems: "center",
                  color: "#0b1020",
                  background: "#ffffff",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/images/facebook.jpg"
                  alt="Facebook"
                  style={{ width: 26, height: 26, objectFit: "cover", borderRadius: 9999 }}
                />
              </a>

              <a
                href="https://api.whatsapp.com/send/?phone=249129316161"
                aria-label="WhatsApp"
                title="WhatsApp"
                style={{
                  width: 44,
                  height: 34,
                  borderRadius: 9999,
                  border: "1px solid rgba(11, 16, 32, 0.14)",
                  display: "grid",
                  placeItems: "center",
                  color: "#0b1020",
                  background: "#ffffff",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/images/whatSapp.jpg"
                  alt="WhatsApp"
                  style={{ width: 26, height: 26, objectFit: "cover", borderRadius: 9999 }}
                />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                title="Instagram"
                style={{
                  width: 44,
                  height: 34,
                  borderRadius: 9999,
                  border: "1px solid rgba(11, 16, 32, 0.14)",
                  display: "grid",
                  placeItems: "center",
                  color: "#0b1020",
                  background: "#ffffff",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/images/insta.jpg"
                  alt="Instagram"
                  style={{ width: 26, height: 26, objectFit: "cover", borderRadius: 9999 }}
                />
              </a>
            </div>
          </section>
        </div>

        <div
          aria-hidden
          style={{
            borderTop: "2px dashed rgba(11, 16, 32, 0.32)",
            marginTop: "1.25rem",
            paddingTop: "1rem",
          }}
        />

        <div style={{ fontSize: "0.95rem", color: muted, textAlign: "center" }}>
          حقوق الملكية © {new Date().getFullYear()} YCZ — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
