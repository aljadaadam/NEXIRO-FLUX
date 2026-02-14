"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

type GatewayType = "BANK" | "USDT" | "BINANCE" | "PAYPAL";
type InvoicePaymentStatus = "NOT_PAID" | "IN_PROGRESS" | "PAID" | "REJECTED";

type InvoiceData = {
  id: string;
  gateway: GatewayType;
  status: string;
  paymentStatus: InvoicePaymentStatus;
  amount: number;
  currency: string;
  reference: string;
  paymentLink: string;
  transactionNumber?: string;
  details?: any;
  receipt?: { name: string; mime?: string; uploadedAt: string };
  createdAt: string;
  updatedAt: string;
};

const PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  NOT_PAID: "غير مدفوعة",
  IN_PROGRESS: "قيد المراجعة",
  PAID: "مدفوعة",
  REJECTED: "مرفوضة",
};

const GATEWAY_TITLES: Record<GatewayType, string> = {
  BANK: "تحويل بنكي",
  USDT: "USDT",
  BINANCE: "Binance",
  PAYPAL: "PayPal",
};

const GATEWAY_ICONS: Record<GatewayType, string> = {
  BANK: "🏦",
  USDT: "💎",
  BINANCE: "🟡",
  PAYPAL: "💜",
};

const STATUS_COLORS: Record<InvoicePaymentStatus, { bg: string; text: string; dot: string }> = {
  NOT_PAID: { bg: "rgba(107,114,128,0.15)", text: "#9ca3af", dot: "#6b7280" },
  IN_PROGRESS: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", dot: "#f59e0b" },
  PAID: { bg: "rgba(34,197,94,0.15)", text: "#4ade80", dot: "#22c55e" },
  REJECTED: { bg: "rgba(239,68,68,0.15)", text: "#f87171", dot: "#ef4444" },
};

/* ── Shared wrapper with logo + copyright ── */
function PayShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={S.page}>
      {/* Decorative blurs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      {/* Logo */}
      <div style={S.logoWrap}>
        <span style={S.logoText}>YCZ</span>
        <span style={S.logoSub}>Servers</span>
      </div>

      {children}

      {/* Copyright */}
      <footer style={S.footer}>
        <span>© {new Date().getFullYear()} YCZ Servers — جميع الحقوق محفوظة</span>
      </footer>
    </div>
  );
}

export default function PaymentScreen({ reference }: { reference: string }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds remaining for USDT
  const [expired, setExpired] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/profile/top-up";

  const USDT_EXPIRY_MINUTES = 30;

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/topup/public/invoices/${encodeURIComponent(reference)}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          setError(json?.error?.message || "الفاتورة غير موجودة");
          return;
        }
        setInvoice(json.data);
        setUploadedReceiptName(json.data?.receipt?.name ?? null);

        /* Auto-complete detection for USDT */
        if (json.data?.paymentStatus === "PAID") {
          setShowSuccess(true);
        }
      } catch {
        setError("تعذر تحميل تفاصيل الفاتورة");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [reference]);

  /* ── USDT countdown timer: 30 minutes from invoice creation ── */
  useEffect(() => {
    if (!invoice || invoice.gateway !== "USDT") return;
    if (showSuccess || showFailure) return;
    if (invoice.paymentStatus === "PAID") return;

    const expiresAt = new Date(invoice.createdAt).getTime() + USDT_EXPIRY_MINUTES * 60 * 1000;

    function updateTimer() {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setExpired(true);
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [invoice?.gateway, invoice?.createdAt, invoice?.paymentStatus, showSuccess, showFailure]);

  /* ── USDT auto-poll: re-fetch invoice every 15s to detect on-chain confirmation ── */
  useEffect(() => {
    if (!invoice || invoice.gateway !== "USDT") return;
    if (showSuccess || showFailure || expired) return;
    if (invoice.paymentStatus === "PAID") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/topup/public/invoices/${encodeURIComponent(reference)}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (json?.ok && json.data) {
          setInvoice(json.data);
          if (json.data.paymentStatus === "PAID") {
            setShowSuccess(true);
            clearInterval(interval);
          }
          if (json.data.paymentStatus === "REJECTED") {
            setExpired(true);
            clearInterval(interval);
          }
        }
      } catch {
        // silent
      }
    }, 15_000);

    return () => clearInterval(interval);
  }, [invoice?.gateway, invoice?.paymentStatus, showSuccess, showFailure, expired, reference]);

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  }

  function handleReturnToSite() {
    try {
      if (typeof window !== "undefined") {
        if (window.opener && !window.opener.closed) {
          window.opener.location.replace(returnTo);
          window.opener.focus();
          window.close();
          return;
        }
        window.location.replace(returnTo);
      }
    } catch {
      // ignore
    }
  }

  async function handleUploadReceipt(file?: File) {
    if (!invoice || invoice.gateway !== "BANK" || !file) {
      if (!file) setError("يرجى اختيار ملف الإيصال أولاً");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/topup/public/invoices/${encodeURIComponent(invoice.reference)}/receipt`, {
        method: "POST",
        headers: { accept: "application/json" },
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message || "تعذر رفع الإيصال");
        return;
      }
      if (json?.data) setInvoice(json.data);
      if (json?.data?.receipt?.name) setUploadedReceiptName(json.data.receipt.name);
    } catch {
      setError("تعذر رفع الإيصال");
    } finally {
      setUploading(false);
    }
  }

  function handleFinishAndReturn() {
    if (!invoice) return;
    setClosing(true);
    setError(null);
    (async () => {
      try {
        if (invoice.gateway === "BANK") {
          const res = await fetch(`/api/topup/public/invoices/${encodeURIComponent(invoice.reference)}/confirm`, {
            method: "POST",
            headers: { accept: "application/json" },
          });
          const json = await res.json();
          if (!res.ok || !json?.ok) {
            if (Array.isArray(json?.error?.details)) {
              setFailureReason(json.error.details.join("\n"));
            } else {
              setFailureReason(json?.error?.details || json?.error?.message || "تعذر تأكيد الدفع");
            }
            setShowFailure(true);
            setClosing(false);
            return;
          }
        }
        setShowSuccess(true);
      } catch {
        setFailureReason("تعذر تأكيد الدفع");
        setShowFailure(true);
        setClosing(false);
      }
    })();
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <PayShell>
        <div style={S.centerCard}>
          <div style={S.spinner} />
          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "1rem", fontSize: "1.05rem" }}>جاري تحميل الفاتورة…</p>
        </div>
      </PayShell>
    );
  }

  /* ── Error ── */
  if (error && !invoice) {
    return (
      <PayShell>
        <div style={{ ...S.card, animation: "payFadeUp .5s ease both", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
          <h2 style={{ ...S.cardTitle, color: "#f87171" }}>خطأ</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>{error}</p>
        </div>
      </PayShell>
    );
  }

  if (!invoice) return null;

  /* ── Success ── */
  if (showSuccess) {
    const analysis = (invoice?.details as { receiptAnalysis?: any } | undefined)?.receiptAnalysis;
    const analysisMissing = uploadedReceiptName && !analysis;
    return (
      <PayShell>
        <div style={{ ...S.card, animation: "payFadeUp .5s ease both", textAlign: "center" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem", animation: "payPop .6s ease both" }}>✅</div>
          <h2 style={{ ...S.cardTitle, color: "#4ade80" }}>تم الدفع بنجاح</h2>
          {analysis && (
            <div style={{ margin: "0.75rem 0", display: "grid", gap: "0.35rem", color: "rgba(255,255,255,0.75)", fontSize: "0.95rem" }}>
              {typeof analysis.amount === "number" && <span>المبلغ: {analysis.amount} {analysis.currency ?? ""}</span>}
              {typeof analysis.transactionNumber === "string" && <span>رقم المعاملة: {analysis.transactionNumber}</span>}
              {typeof analysis.paidAt === "string" && <span>تاريخ الدفع: {analysis.paidAt}</span>}
            </div>
          )}
          {analysisMissing && (
            <p style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.9rem", marginTop: "0.5rem" }}>
              تعذر قراءة الإيصال تلقائياً. يرجى التأكد من وضوح الصورة.
            </p>
          )}
          <button type="button" onClick={handleReturnToSite} style={S.btnPrimary}>
            الرجوع إلى الموقع
          </button>
        </div>
      </PayShell>
    );
  }

  /* ── Expired (USDT timeout) ── */
  if (expired && invoice?.gateway === "USDT" && !showSuccess) {
    return (
      <PayShell>
        <style>{payAnimations}</style>
        <div style={{ ...S.card, animation: "payFadeUp .5s ease both", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⏰</div>
          <h2 style={{ ...S.cardTitle, color: "#f59e0b" }}>انتهت صلاحية الفاتورة</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.75rem", lineHeight: 1.7 }}>
            انتهت مهلة الدفع ({USDT_EXPIRY_MINUTES} دقيقة).
            <br />
            يرجى إنشاء فاتورة جديدة إذا كنت ترغب في الشحن.
          </p>
          <button type="button" onClick={handleReturnToSite} style={S.btnPrimary}>
            الرجوع إلى الموقع
          </button>
        </div>
      </PayShell>
    );
  }

  /* ── Failure ── */
  if (showFailure) {
    return (
      <PayShell>
        <div style={{ ...S.card, animation: "payFadeUp .5s ease both", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>❌</div>
          <h2 style={{ ...S.cardTitle, color: "#f87171" }}>فشل تأكيد الدفع</h2>
          {failureReason ? (
            <ul style={{ margin: "0.75rem 0", padding: 0, listStyle: "none", color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
              {failureReason.split("\n").map((r, i) => <li key={i} style={{ marginBottom: "0.3rem" }}>• {r}</li>)}
            </ul>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.6)" }}>لم يتم استيفاء الشروط المطلوبة</p>
          )}
          <button type="button" onClick={handleReturnToSite} style={S.btnPrimary}>
            الرجوع إلى الموقع
          </button>
        </div>
      </PayShell>
    );
  }

  /* ── Main payment view ── */
  const statusColor = STATUS_COLORS[invoice.paymentStatus];

  return (
    <PayShell>
      <style>{payAnimations}</style>

      {/* Header card */}
      <div style={{ ...S.card, animation: "payFadeUp .45s ease both", textAlign: "center", paddingBottom: "1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>{GATEWAY_ICONS[invoice.gateway]}</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>صفحة الدفع</h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
          أتمم الدفع وفقاً للتعليمات أدناه
        </p>

        {/* Amount badge */}
        <div style={S.amountBadge}>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>المبلغ المطلوب</span>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff" }}>
            ${invoice.amount.toFixed(2)}
          </span>
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>{invoice.currency}</span>
        </div>
      </div>

      {/* Invoice details */}
      <div style={{ ...S.card, animation: "payFadeUp .55s ease both .05s" }}>
        <h2 style={S.sectionTitle}>تفاصيل الفاتورة</h2>
        <div style={{ display: "grid", gap: "0.65rem" }}>
          <InfoRow label="رقم الفاتورة" value={invoice.reference} mono />
          <InfoRow label="بوابة الدفع" value={GATEWAY_TITLES[invoice.gateway]} />
          <div style={S.infoRow}>
            <span style={S.infoLabel}>حالة الدفع</span>
            <span style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              padding: "0.25rem 0.75rem",
              borderRadius: 20,
              background: statusColor.bg,
              color: statusColor.text,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor.dot, display: "inline-block" }} />
              {PAYMENT_STATUS_LABELS[invoice.paymentStatus] ?? "—"}
            </span>
          </div>
          {invoice.transactionNumber && <InfoRow label="رقم المعاملة" value={invoice.transactionNumber} mono />}
        </div>
      </div>

      {/* Gateway instructions */}
      {invoice.gateway === "BANK" && (
        <div style={{ ...S.card, animation: "payFadeUp .65s ease both .1s", borderColor: "rgba(96,165,250,0.25)" }}>
          <h2 style={{ ...S.sectionTitle, color: "#60a5fa" }}>🏦 تعليمات التحويل البنكي</h2>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            <InfoRow label="اسم البنك" value={invoice.details?.bankName ?? "—"} />
            <InfoRow label="رقم الحساب (IBAN)" value={invoice.details?.iban ?? "—"} mono />
            <InfoRow label="اسم المستفيد" value={invoice.details?.beneficiary ?? "—"} />
            {invoice.details?.note && <InfoRow label="ملاحظة" value={invoice.details.note} />}
            <InfoRow label="سعر الصرف" value={`1$ = ${invoice.details?.usdRate ?? 3650} SDG`} />
            <InfoRow label="المبلغ المطلوب" value={`${(invoice.amount * (invoice.details?.usdRate ?? 3650)).toLocaleString("en-US")} SDG`} highlight />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <p style={{ color: "#60a5fa", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem" }}>
              📎 رفع إشعار الدفع إلزامي قبل تأكيد الدفع
            </p>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUploadReceipt(f); }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleUploadReceipt(f); }}
              style={{
                ...S.dropzone,
                borderColor: dragOver ? "#60a5fa" : "rgba(255,255,255,0.15)",
                background: dragOver ? "rgba(96,165,250,0.08)" : "rgba(255,255,255,0.03)",
              }}
            >
              {uploading ? (
                <span style={{ color: "#60a5fa", fontWeight: 600 }}>⏳ جاري الرفع…</span>
              ) : uploadedReceiptName ? (
                <span style={{ color: "#4ade80", fontWeight: 600 }}>✅ {uploadedReceiptName}</span>
              ) : (
                <>
                  <span style={{ fontSize: "1.5rem" }}>📤</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>اضغط أو اسحب ملف الإيصال هنا</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {invoice.gateway === "USDT" && (
        <div style={{ ...S.card, animation: "payFadeUp .65s ease both .1s", borderColor: "rgba(34,197,94,0.25)" }}>
          <h2 style={{ ...S.sectionTitle, color: "#4ade80" }}>💎 الدفع عبر USDT — {invoice.details?.network ?? "BSC (BEP-20)"}</h2>

          {/* QR Code */}
          <div style={{ display: "flex", justifyContent: "center", margin: "0.75rem 0 1rem" }}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 12,
              display: "inline-block",
              boxShadow: "0 0 30px rgba(34,197,94,0.15)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/topup/public/invoices/${encodeURIComponent(invoice.reference)}/qrcode`}
                alt="USDT QR Code"
                width={220}
                height={220}
                style={{ display: "block", borderRadius: 8 }}
              />
            </div>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
            امسح الباركود أعلاه أو انسخ العنوان والمبلغ يدوياً
          </p>

          <div style={{ display: "grid", gap: "0.6rem" }}>
            <InfoRow label="الشبكة" value={invoice.details?.network ?? "BSC (BEP-20)"} />

            {/* Address with copy */}
            <div style={S.infoRow}>
              <span style={S.infoLabel}>العنوان</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.8rem",
                  wordBreak: "break-all",
                  maxWidth: 200,
                }}>
                  {invoice.details?.address ?? "—"}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(invoice.details?.address ?? "", "address")}
                  style={S.copyBtn}
                >
                  {copied === "address" ? "✅" : "📋"}
                </button>
              </div>
            </div>

            {/* Unique amount with copy */}
            {invoice.details?.expectedUsdt && (
              <div style={S.infoRow}>
                <span style={S.infoLabel}>المبلغ الدقيق</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{
                    fontWeight: 800,
                    color: "#4ade80",
                    fontFamily: "'Courier New', monospace",
                    fontSize: "1.1rem",
                  }}>
                    {invoice.details.expectedUsdt} USDT
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(invoice.details?.expectedUsdt ?? "", "amount")}
                    style={S.copyBtn}
                  >
                    {copied === "amount" ? "✅" : "📋"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Important notices */}
          <div style={{
            ...S.tipBox,
            borderColor: "rgba(250,204,21,0.2)",
            background: "rgba(250,204,21,0.05)",
            marginTop: "0.85rem",
          }}>
            <p style={{ margin: 0, color: "#fbbf24", fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.7 }}>
              ⚠️ يجب إرسال <strong>المبلغ الدقيق</strong> المذكور أعلاه (بالفاصلة العشرية).
              <br />
              أي مبلغ مختلف لن يتم التحقق منه تلقائياً.
            </p>
          </div>

          {/* Auto-check indicator + countdown */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: 12,
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ ...S.pulsingDot, background: "#4ade80" }} />
              <span style={{ color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
                جاري التحقق التلقائي من الدفع...
              </span>
            </div>
            {timeLeft !== null && timeLeft > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
                <span style={{ color: timeLeft < 300 ? "#f87171" : "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 600 }}>
                  ⏳ الوقت المتبقي: {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {invoice.gateway === "BINANCE" && (
        <div style={{ ...S.card, animation: "payFadeUp .65s ease both .1s", borderColor: "rgba(250,204,21,0.25)" }}>
          <h2 style={{ ...S.sectionTitle, color: "#facc15" }}>🟡 تعليمات الدفع عبر Binance</h2>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            <InfoRow label="Binance Pay ID" value={invoice.details?.binancePayId ?? "—"} mono />
            <InfoRow label="Receiver" value={invoice.details?.receiver ?? "—"} />
            <InfoRow label="Note" value={invoice.details?.note ?? "—"} />
          </div>
          <div style={S.tipBox}>
            <p style={{ margin: 0, color: "#facc15", fontWeight: 500, fontSize: "0.9rem" }}>
              استخدم Binance Pay لإرسال المبلغ إلى المستلم أعلاه.
            </p>
          </div>
        </div>
      )}

      {invoice.gateway === "PAYPAL" && (
        <div style={{ ...S.card, animation: "payFadeUp .65s ease both .1s", borderColor: "rgba(168,85,247,0.25)" }}>
          <h2 style={{ ...S.sectionTitle, color: "#c084fc" }}>💜 تعليمات الدفع عبر PayPal</h2>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            <InfoRow label="PayPal Account" value={invoice.details?.paypalAccount ?? "—"} />
            <InfoRow label="Note" value={invoice.details?.note ?? "—"} />
          </div>
          <div style={S.tipBox}>
            <p style={{ margin: 0, color: "#c084fc", fontWeight: 500, fontSize: "0.9rem" }}>
              أرسل المبلغ إلى حساب PayPal أعلاه مع إضافة رقم الفاتورة في الملاحظة.
            </p>
          </div>
        </div>
      )}

      {/* Action area */}
      <div style={{ ...S.card, animation: "payFadeUp .75s ease both .15s", textAlign: "center", background: "transparent", border: "none" }}>
        {error && <div style={{ marginBottom: "0.75rem", color: "#f87171", fontWeight: 600, fontSize: "0.9rem" }}>{error}</div>}

        {/* Show confirm button only for non-USDT gateways */}
        {invoice.gateway !== "USDT" && (
          <button
            type="button"
            onClick={handleFinishAndReturn}
            disabled={closing || (invoice.gateway === "BANK" && !uploadedReceiptName)}
            style={{
              ...S.btnPrimary,
              width: "100%",
              opacity: closing || (invoice.gateway === "BANK" && !uploadedReceiptName) ? 0.5 : 1,
              cursor: closing || (invoice.gateway === "BANK" && !uploadedReceiptName) ? "not-allowed" : "pointer",
            }}
          >
            {invoice.gateway === "BANK" && !uploadedReceiptName
              ? "📎 ارفع إشعار الدفع أولاً"
              : closing
              ? "⏳ جاري التأكيد…"
              : "✅ تأكيد الدفع"}
          </button>
        )}

        {/* USDT: show informational message instead of confirm button */}
        {invoice.gateway === "USDT" && (
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0.5rem 0" }}>
            سيتم إغلاق هذه الصفحة تلقائياً بعد التحقق من الدفع على الشبكة.
            <br />
            لا تغلق هذه النافذة حتى يتم التأكيد.
          </p>
        )}

        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>
          إذا لم تُغلق النافذة تلقائياً،{" "}
          <a href="/profile/top-up" style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>
            ارجع لصفحة الشحن
          </a>
        </p>
      </div>
    </PayShell>
  );
}

/* ── Info row component ── */
function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div style={S.infoRow}>
      <span style={S.infoLabel}>{label}</span>
      <span style={{
        fontWeight: 600,
        color: highlight ? "#60a5fa" : "#fff",
        fontFamily: mono ? "'Courier New', monospace" : "inherit",
        fontSize: "0.95rem",
        wordBreak: "break-all",
      }}>{value}</span>
    </div>
  );
}

/* ── Animations ── */
const payAnimations = `
@keyframes payFadeUp {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes payPop {
  0% { transform: scale(0.3); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes paySpin {
  to { transform: rotate(360deg); }
}
@keyframes payPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
`;

/* ── Styles object ── */
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a0e1a 0%, #0f172a 50%, #0c1222 100%)",
    direction: "rtl",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1.5rem 1rem 2rem",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-15%",
    right: "-10%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    animation: "payPulse 6s ease-in-out infinite",
  },
  blob2: {
    position: "absolute",
    bottom: "-10%",
    left: "-10%",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    animation: "payPulse 8s ease-in-out infinite 2s",
  },
  logoWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.4rem",
    marginBottom: "1.75rem",
    position: "relative",
    zIndex: 2,
  },
  logoText: {
    fontSize: "2rem",
    fontWeight: 900,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-1px",
  },
  logoSub: {
    fontSize: "0.95rem",
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
  },
  footer: {
    marginTop: "auto",
    paddingTop: "2rem",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: "1.5rem",
    marginBottom: "0.85rem",
    position: "relative",
    zIndex: 2,
    backdropFilter: "blur(12px)",
  },
  centerCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
    zIndex: 2,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#60a5fa",
    borderRadius: "50%",
    animation: "paySpin .8s linear infinite",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#fff",
    margin: 0,
  },
  sectionTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.85)",
    marginBottom: "0.85rem",
    paddingBottom: "0.6rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  amountBadge: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.15rem",
    padding: "1rem",
    borderRadius: 14,
    background: "rgba(96,165,250,0.08)",
    border: "1px solid rgba(96,165,250,0.18)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  infoLabel: {
    fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.9rem",
  },
  tipBox: {
    marginTop: "0.85rem",
    padding: "0.85rem 1rem",
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1.5rem",
    borderRadius: 14,
    border: "2px dashed rgba(255,255,255,0.15)",
    cursor: "pointer",
    transition: "all .2s ease",
    minHeight: 90,
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.85rem 1.5rem",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all .2s ease",
    marginTop: "0.75rem",
  },
  copyBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "0.25rem 0.45rem",
    cursor: "pointer",
    fontSize: "0.85rem",
    lineHeight: 1,
    transition: "all .15s ease",
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
    animation: "payPulse 1.5s ease-in-out infinite",
  },
};
