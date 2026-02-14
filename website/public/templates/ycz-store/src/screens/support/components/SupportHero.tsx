import Link from "next/link";

export default function SupportHero() {
  return (
    <section
      className="card support-hero"
      style={{
        padding: "1.4rem 1.25rem",
        background:
          "radial-gradient(1200px 500px at 80% 0%, rgba(124, 92, 255, 0.35), transparent 55%), radial-gradient(900px 400px at 10% 30%, rgba(34, 197, 94, 0.22), transparent 55%), rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="support-heroTop">
        <div>
          <div className="support-heroTitle">الدعم والمساعدة</div>
          <div className="support-heroSubtitle">
            تواصل معنا أو اترك رسالة وسنرد عليك بأسرع وقت ممكن.
          </div>

          <div className="support-chips" aria-label="معلومات سريعة">
            <span className="support-chip">رد سريع</span>
            <span className="support-chip">متابعة الطلبات</span>
            <span className="support-chip">دعم الدفع والشحن</span>
          </div>
        </div>

        <div className="support-heroActions">
          <Link className="btn" href="/orders" style={{ background: "#6a1b64" }}>
            فتح طلباتي
          </Link>
          <Link className="btn secondary" href="/services" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
            تصفح الخدمات
          </Link>
        </div>
      </div>

      <div className="support-heroHint">
        لتسريع الحل: اكتب رقم الطلب (إن وجد) + البريد + وصف المشكلة.
      </div>
    </section>
  );
}
