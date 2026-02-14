"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingButton from "../../../components/LoadingButton";

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function buildMailto(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const to = params.to.trim();
  const subject = encodeURIComponent(params.subject);
  const body = encodeURIComponent(params.body);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ready"; mailto: string; summary: string };

export default function SupportTicketForm() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [topic, setTopic] = useState<
    "order" | "payment" | "topup" | "account" | "other"
  >("order");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("auth_email");
      if (savedEmail && !email) setEmail(savedEmail);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topicLabel = useMemo(() => {
    switch (topic) {
      case "order":
        return "مشكلة في الطلب";
      case "payment":
        return "مشكلة في الدفع";
      case "topup":
        return "شحن/رصيد";
      case "account":
        return "الحساب";
      default:
        return "أخرى";
    }
  }, [topic]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setSubmitState({ status: "idle" });

    try {
      const cleanedName = fullName.trim();
      const cleanedEmail = email.trim();
      const cleanedOrder = orderNo.trim();
      const cleanedMessage = message.trim();

      if (cleanedMessage.length < 8) {
        setSubmitState({ status: "error", message: "اكتب تفاصيل أكثر (على الأقل 8 أحرف)." });
        return;
      }

      if (!isValidEmail(cleanedEmail)) {
        setSubmitState({ status: "error", message: "أدخل بريد إلكتروني صحيح." });
        return;
      }

      const subjectParts = ["YCZ دعم", topicLabel];
      if (cleanedOrder) subjectParts.push(`#${cleanedOrder}`);

      const summaryLines = [
        `الاسم: ${cleanedName || "-"}`,
        `البريد: ${cleanedEmail}`,
        `رقم الطلب: ${cleanedOrder || "-"}`,
        `الموضوع: ${topicLabel}`,
      ];

      const body = `${summaryLines.join("\n")}\n\n---\n${cleanedMessage}\n`;

      const mailto = buildMailto({
        to: supportEmail,
        subject: subjectParts.join(" | "),
        body,
      });

      setSubmitState({
        status: "ready",
        mailto,
        summary: summaryLines.join(" · "),
      });

      // Open the user's email client.
      window.location.href = mailto;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card" style={{ padding: "1.25rem" }}>
      <div className="support-sectionTitle">فتح تذكرة دعم</div>
      <div className="small" style={{ marginTop: ".25rem" }}>
        اترك تفاصيل المشكلة وسنرد عليك عبر البريد.
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: "0.95rem" }}>
        <div className="profileForm-grid">
          <div className="profileField">
            <label className="profileLabel">الاسم (اختياري)</label>
            <input
              className="profileInput"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اسمك"
              autoComplete="name"
            />
          </div>

          <div className="profileField">
            <label className="profileLabel">البريد الإلكتروني</label>
            <input
              className="profileInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className="profileField">
            <label className="profileLabel">رقم الطلب (اختياري)</label>
            <input
              className="profileInput"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="مثال: 12345"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div className="profileField">
            <label className="profileLabel">نوع المشكلة</label>
            <select
              className="profileInput"
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
            >
              <option value="order">مشكلة في الطلب</option>
              <option value="payment">مشكلة في الدفع</option>
              <option value="topup">شحن/رصيد</option>
              <option value="account">الحساب</option>
              <option value="other">أخرى</option>
            </select>
          </div>
        </div>

        <div className="profileField" style={{ marginTop: "0.9rem" }}>
          <label className="profileLabel">تفاصيل المشكلة</label>
          <textarea
            className="profileInput"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب كل التفاصيل (ما الذي حدث؟ متى؟ ما الذي تتوقعه؟)"
            rows={6}
            style={{ resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {submitState.status === "error" && (
          <div className="support-error" style={{ marginTop: "0.9rem" }}>
            {submitState.message}
          </div>
        )}

        {submitState.status === "ready" && (
          <div className="support-success" style={{ marginTop: "0.9rem" }}>
            تم تجهيز الرسالة: {submitState.summary}
            <div style={{ marginTop: "0.55rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <a className="btn" href={submitState.mailto} style={{ background: "#6a1b64" }}>
                فتح البريد مرة أخرى
              </a>
              <button
                type="button"
                className="btn secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(submitState.mailto);
                  } catch {
                    // ignore
                  }
                }}
              >
                نسخ رابط الرسالة
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <LoadingButton
            type="submit"
            loading={submitting}
            className="btn"
            style={{ background: "#6a1b64" }}
          >
            إرسال
          </LoadingButton>
          <div className="small" style={{ alignSelf: "center" }}>
            ملاحظة: سيتم فتح تطبيق البريد لإرسال الرسالة.
          </div>
        </div>
      </form>
    </section>
  );
}
