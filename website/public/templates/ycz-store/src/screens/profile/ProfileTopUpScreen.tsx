"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
import LoadingButton from "../../components/LoadingButton";
import MessageCardModal from "../../components/MessageCardModal";

type GatewayKey = "bank" | "usdt" | "binance" | "paypal";

const GATEWAYS: Array<{ key: GatewayKey; title: string; subtitle: string; iconSrc?: string }> = [
  { key: "bank", title: "تحويل بنكي", subtitle: "شحن عبر التحويل البنكي", iconSrc: "/images/bank.png" },
  { key: "usdt", title: "USDT", subtitle: "شحن عبر USDT" },
  { key: "binance", title: "Binance", subtitle: "شحن عبر بايننس", iconSrc: "/images/binance.jpg" },
  { key: "paypal", title: "PayPal", subtitle: "شحن عبر بايبال", iconSrc: "/images/paybal.png" },
];

function gatewayTitle(key: GatewayKey): string {
  return GATEWAYS.find((g) => g.key === key)?.title ?? key;
}

function parseAmount(raw: string): number {
  const n = Number(String(raw).replace(/,/g, ".").trim());
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

type InvoicePaymentStatus = "NOT_PAID" | "IN_PROGRESS" | "PAID" | "REJECTED";

type InvoiceResponse = {
  ok: true;
  data: {
    id: string;
    gateway: "BANK" | "USDT" | "BINANCE" | "PAYPAL";
    status: "CREATED" | "AWAITING_PAYMENT" | "RECEIPT_UPLOADED" | "COMPLETED" | "REJECTED";
    paymentStatus: InvoicePaymentStatus;
    statusKey?: InvoicePaymentStatus;
    statusLabel?: string;
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
};

type InvoiceError = { ok: false; error?: { message?: string } };
type InvoicesListResponse = { ok: true; data: InvoiceResponse["data"][] };

const GATEWAY_LABELS: Record<InvoiceResponse["data"]["gateway"], string> = {
  BANK: "تحويل بنكي",
  USDT: "USDT",
  BINANCE: "Binance",
  PAYPAL: "PayPal",
};

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ar-SD-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getAuthHeader(): Record<string, string> {
  try {
    const t = localStorage.getItem("auth_token");
    return t ? { authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

export default function ProfileTopUpScreen() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      setIsAuthed(Boolean(localStorage.getItem("auth_token")));
    } catch {
      setIsAuthed(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthed) return;

    async function loadInvoices() {
      setInvoicesLoading(true);
      setInvoicesError(null);
      try {
        const res = await fetch("/api/topup/invoices/all", {
          headers: {
            accept: "application/json",
            ...getAuthHeader(),
          },
        });

        const json = (await res.json()) as InvoicesListResponse | InvoiceError;
        if (!res.ok || !json || (json as any).ok !== true) {
          setInvoicesError((json as InvoiceError)?.error?.message || "تعذر تحميل المعاملات");
          return;
        }

        setInvoices((json as InvoicesListResponse).data || []);
      } catch {
        setInvoicesError("تعذر تحميل المعاملات");
      } finally {
        setInvoicesLoading(false);
      }
    }

    loadInvoices();
  }, [isAuthed]);

  const [selected, setSelected] = useState<GatewayKey>("bank");
  const [amountRaw, setAmountRaw] = useState("10");
  const [pending, setPending] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceResponse["data"] | null>(null);
  const [invoices, setInvoices] = useState<InvoiceResponse["data"][]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDetails, setModalDetails] = useState<string | undefined>(undefined);

  function openModal(variant: "success" | "error" | "info", title: string, details?: string) {
    setModalVariant(variant);
    setModalTitle(title);
    setModalDetails(details);
    setModalOpen(true);
  }

  async function handleCreateInvoice() {
    if (pending) return;

    const amount = parseAmount(amountRaw);
    if (!amount || amount <= 0) {
      openModal("error", "أدخل مبلغ صحيح", "مثال: 10");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/topup/invoices", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ gateway: selected, amount }),
      });

      const json = (await res.json()) as InvoiceResponse | InvoiceError;
      if (!res.ok || !json || (json as any).ok !== true) {
        const msg = (json as InvoiceError)?.error?.message || "تعذر إنشاء الفاتورة";
        openModal("error", "فشل إنشاء الفاتورة", msg);
        return;
      }

      const created = (json as InvoiceResponse).data;
      setInvoice(created);
      // Payment flow is handled in the external payment page.

      // Open payment page after successful invoice creation
      if (created.paymentLink && typeof window !== "undefined") {
        let link = created.paymentLink;
        try {
          const url = new URL(created.paymentLink);
          url.searchParams.set("returnTo", window.location.href);
          link = url.toString();
        } catch {
          // ignore
        }
        // Reuse the same window/tab per invoice to avoid Chrome opening duplicates.
        window.open(link, `pay_${created.reference}`);
      }

      setInvoices((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to create invoice:", err);
      openModal("error", "تعذر إنشاء الفاتورة", "حاول مرة أخرى");
    } finally {
      setPending(false);
    }
  }

  if (!isAuthed) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
          <section className="card profileDash-card" style={{ direction: "rtl", textAlign: "right" }}>
            <div className="profileDash-title">شحن الرصيد</div>
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              يجب تسجيل الدخول أولاً لشحن الرصيد.
            </div>
            <div className="profileSection-actions">
              <Link className="profileDetails-linkBtn" href="/profile">
                الذهاب لتسجيل الدخول
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
        <div style={{ direction: "rtl", textAlign: "right", maxWidth: 920, margin: "0 auto 0.9rem" }}>
          <Link className="profileDetails-linkBtn walletBackBtn" href="/profile">
            رجوع
          </Link>
        </div>

        <section className="topUpHero" style={{ direction: "rtl", textAlign: "right" }}>
          <div className="topUpHero-title">إضافة الرصيد</div>
          <div className="topUpHero-sub">اختر بوابة الدفع، ثم أنشئ الدفع وسيتم إكمال العملية عبر صفحة دفع خارجية</div>
        </section>

        <section className="topUpGateways" style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem" }}>
          <div className="topUpGateways-title">بوابات الدفع</div>
          <div className="topUpGateways-grid" role="tablist" aria-label="بوابات الدفع">
            {GATEWAYS.map((g) => (
              <button
                key={g.key}
                type="button"
                className={selected === g.key ? "topUpGateway topUpGateway--active" : "topUpGateway"}
                style={{
                  position: "relative",
                  background: "transparent",
                  boxShadow: "none",
                  border: selected === g.key ? "1px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.5)",
                }}
                onClick={() => {
                  setSelected(g.key);
                  setInvoice(null);
                }}
              >
                {selected === g.key ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "0.4rem",
                      left: "0.4rem",
                      width: "1.1rem",
                      height: "1.1rem",
                      borderRadius: "999px",
                      background: "rgba(16, 185, 129, 0.9)",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                    aria-label="محدد"
                  >
                    ✓
                  </span>
                ) : null}
                <div className="topUpGateway-head">
                  {g.iconSrc ? (
                    <img className="topUpGateway-icon" src={g.iconSrc} alt={g.title} />
                  ) : (
                    <div className="topUpGateway-iconFallback">{g.title.slice(0, 1)}</div>
                  )}
                  <div className="topUpGateway-name">{g.title}</div>
                </div>
                <div className="topUpGateway-sub">{g.subtitle}</div>
              </button>
            ))}
          </div>
        </section>

        <section
          className="topUpHero"
          style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem", boxShadow: "none", border: "none", background: "transparent" }}
        >
          <div className="topUpPay-title">المبلغ</div>

          <div
            className="topUpPay-actions"
            style={{
              marginTop: "0.75rem",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: "0.75rem",
              alignItems: "end",
            }}
          >
            <div style={{ display: "grid", gap: "0.35rem", gridColumn: "1 / 2" }}>
              <label className="profileLabel">إدخال مبلغ</label>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <input
                  className="profileInput"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(e.target.value)}
                  inputMode="decimal"
                  placeholder="10"
                  style={{ flex: 1 }}
                />
                <div className="topUpHero-currency">$</div>
              </div>
            </div>

            <LoadingButton
              className="auth-btn auth-btnPrimary"
              type="button"
              loading={pending}
              style={{ justifySelf: "start", paddingInline: "1.75rem" }}
              onClick={handleCreateInvoice}
            >
              إنشاء الدفع
            </LoadingButton>
          </div>
        </section>

        <section
          className="card profileDash-card"
          style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem", boxShadow: "none" }}
        >
          <div className="profileDash-title">المعاملات</div>
          {invoicesLoading ? (
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              جاري تحميل المعاملات...
            </div>
          ) : invoicesError ? (
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem", color: "#dc2626" }}>
              {invoicesError}
            </div>
          ) : invoices.filter((item) => /^\d{6}$/.test(item.reference)).length === 0 ? (
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              لا توجد معاملات بعد.
            </div>
          ) : (
            <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem", fontSize: "0.8rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.34)",
                  background: "rgba(245, 245, 245, 0.32)",
                  borderRadius: "12px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>الحالة</span>
                  <span style={{ width: 1, height: 16, background: "#e5e7eb" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>التاريخ</span>
                  <span style={{ width: 1, height: 16, background: "#e5e7eb" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>البوابة</span>
                  <span style={{ width: 1, height: 16, background: "#e5e7eb" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>المبلغ</span>
                  <span style={{ width: 1, height: 16, background: "#e5e7eb" }} />
                </div>
                <div>رقم الفاتورة</div>
              </div>
              {invoices.filter((item) => /^\d{6}$/.test(item.reference)).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  style={{
                    padding: "0.5rem 0",
                    border: "1px solid rgba(255, 255, 255, 0.24)",
                    borderRadius: "0.75rem",
                    display: "grid",
                    gap: "0.25rem",
                    color: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0 0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{item.statusLabel ?? "—"}</span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{formatDateTime(item.createdAt)}</span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{GATEWAY_LABELS[item.gateway] ?? "—"}</span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          color:
                            item.statusKey === "PAID"
                              ? "#22c55e"
                              : item.statusKey === "IN_PROGRESS"
                              ? "#facc15"
                              : "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        {typeof item.amount === "number" ? item.amount.toFixed(2) : "—"} {item.currency ?? ""}
                      </span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div>{item.reference}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <MessageCardModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        details={modalDetails}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
