import type { ReactNode } from "react";

type ContactLink = {
  title: string;
  subtitle: string;
  href?: string;
  icon: ReactNode;
  tone?: "accent" | "success" | "neutral";
};

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function getWhatsAppHref(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  if (!raw) return undefined;

  const digits = digitsOnly(raw);
  if (!digits) return undefined;

  const text = encodeURIComponent("مرحبًا، أحتاج مساعدة بخصوص طلب/خدمة.");
  return `https://wa.me/${digits}?text=${text}`;
}

export default function SupportContactMethods() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com";

  const telegram = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM; // e.g. https://t.me/yourUser

  const contacts: ContactLink[] = [
    {
      title: "واتساب",
      subtitle: "الأسرع للرد والمتابعة",
      href: getWhatsAppHref(),
      tone: "success",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 12a8 8 0 0 1-12.2 6.8L4 20l1.3-3.8A8 8 0 1 1 20 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 9.3c.2-.5.5-.6.9-.6h.7c.2 0 .4.1.5.3l.8 1.7c.1.2.1.5 0 .7l-.5.7c-.1.2-.1.4 0 .6.5.9 1.4 1.7 2.3 2.3.2.1.4.1.6 0l.7-.5c.2-.1.5-.1.7 0l1.7.8c.2.1.3.3.3.5v.7c0 .4-.1.7-.6.9-.7.3-1.6.3-2.6 0-1.5-.5-3.2-1.7-4.6-3.1-1.4-1.4-2.6-3.1-3.1-4.6-.3-1-.3-1.9 0-2.6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "البريد الإلكتروني",
      subtitle: supportEmail,
      href: `mailto:${supportEmail}?subject=${encodeURIComponent("طلب دعم")}`,
      tone: "accent",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="m5.5 7.5 5.7 4.1a1.4 1.4 0 0 0 1.6 0l5.7-4.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "تيليجرام",
      subtitle: "قناة/حساب الدعم (اختياري)",
      href: telegram,
      tone: "neutral",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 5 3.8 11.7c-.9.3-.8 1.6.1 1.9l4.8 1.7 1.8 5.3c.3.9 1.5 1 2 .2l2.6-3.9 4.8 3.5c.7.5 1.7.1 1.9-.8L22 6.2c.2-1-.9-1.7-1.9-1.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m8.8 15.3 7.9-7.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="card" style={{ padding: "1.25rem" }}>
      <div className="support-sectionTitle">طرق التواصل</div>
      <div className="small" style={{ marginTop: ".25rem" }}>
        اختر القناة المناسبة أو استخدم نموذج التذكرة.
      </div>

      <div className="support-contactGrid" style={{ marginTop: "0.95rem" }}>
        {contacts.map((c) => {
          const disabled = !c.href;

          const content = (
            <>
              <div className={`support-contactIcon tone-${c.tone ?? "neutral"}`}>
                {c.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="support-contactTitle">{c.title}</div>
                <div className="support-contactSubtitle">{c.subtitle}</div>
              </div>
              <div className="support-contactArrow" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 7l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </>
          );

          if (disabled) {
            return (
              <div
                key={c.title}
                className="support-contactCard is-disabled"
                aria-disabled
                role="link"
              >
                {content}
              </div>
            );
          }

          return (
            <a
              key={c.title}
              className="support-contactCard"
              href={c.href}
              target="_blank"
              rel="noreferrer"
            >
              {content}
            </a>
          );
        })}
      </div>

      <div
        className="support-note"
        style={{ marginTop: "1rem" }}
        role="note"
      >
        إذا كانت روابط التواصل غير مفعّلة: عرّف المتغيرات
        <span style={{ opacity: 0.9 }}> NEXT_PUBLIC_SUPPORT_WHATSAPP / NEXT_PUBLIC_SUPPORT_EMAIL </span>
        في بيئة التشغيل.
      </div>
    </section>
  );
}
