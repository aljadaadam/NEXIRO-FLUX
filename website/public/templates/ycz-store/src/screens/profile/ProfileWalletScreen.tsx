"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
type MovementType = "credit" | "debit" | "pending" | "rejected";

type WalletMovement = {
  id: string;
  reference?: string;
  title?: string;
  type: MovementType;
  statusKey?: "NOT_PAID" | "IN_PROGRESS" | "PAID" | "REJECTED";
  statusLabel?: string;
  amount: number;
  currency: string;
  createdAt: string;
};

type MovementsResponse = { ok: true; data: WalletMovement[] };
type MovementsError = { ok: false; error?: { message?: string } };

type WalletMeResponse = { ok: true; data: { balanceCents: number; currency: string } };

type OrdersMeItem = {
  id: string;
  status: number;
  statusLabel?: string;
  createdAt: string;
  serviceName?: string;
  groupName?: string;
  totalPriceCents?: number;
};

type OrdersMeResponse = { ok: true; data: OrdersMeItem[] };

function getAuthHeader(): Record<string, string> {
  try {
    const t = localStorage.getItem("auth_token");
    return t ? { authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

function formatAmount(amount: number, currency: string): string {
  const n = Math.round(amount * 100) / 100;
  const value = n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return currency === "USD" ? `$${value}` : `${value} ${currency}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ar-SD-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ProfileWalletScreen() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [transactions, setTransactions] = useState<WalletMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const isAuthed = useMemo(() => {
    try {
      return Boolean(localStorage.getItem("auth_token"));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    async function loadMovements() {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          accept: "application/json",
          ...getAuthHeader(),
        };

        const [walletRes, topupRes, ordersRes] = await Promise.all([
          fetch("/api/wallet/me", { headers }),
          fetch("/api/topup/movements", { headers }),
          fetch("/api/orders/me", { headers }),
        ]);

        const walletJson = (await walletRes.json().catch(() => null)) as WalletMeResponse | MovementsError | null;
        const topupJson = (await topupRes.json().catch(() => null)) as MovementsResponse | MovementsError | null;
        const ordersJson = (await ordersRes.json().catch(() => null)) as OrdersMeResponse | MovementsError | null;

        if (!walletRes.ok || !walletJson || (walletJson as any).ok !== true) {
          setError((walletJson as MovementsError)?.error?.message || "تعذر تحميل الرصيد");
          return;
        }

        const walletData = (walletJson as WalletMeResponse).data;
        const currencyValue = (walletData?.currency ?? "USD").trim() || "USD";
        const balanceValue = (typeof walletData?.balanceCents === "number" ? walletData.balanceCents : 0) / 100;
        setCurrency(currencyValue);
        setBalance(Math.round(balanceValue * 100) / 100);

        const topupMovements =
          topupRes.ok && topupJson && (topupJson as any).ok === true ? (topupJson as MovementsResponse).data || [] : [];

        const orderRows =
          ordersRes.ok && ordersJson && (ordersJson as any).ok === true ? (ordersJson as OrdersMeResponse).data || [] : [];

        const orderMovements: WalletMovement[] = orderRows
          .filter((o) => typeof o?.totalPriceCents === "number")
          .map((o) => ({
            id: `order_${o.id}`,
            reference: o.id,
            title: o.serviceName || o.groupName || "طلب خدمة",
            type: "debit" as const,
            statusLabel: o.statusLabel ?? "—",
            amount: Math.round(((o.totalPriceCents ?? 0) / 100) * 100) / 100,
            currency: currencyValue,
            createdAt: o.createdAt,
          }));

        const merged = topupMovements
          .map((m) => ({ ...m, currency: m.currency || currencyValue }))
          .concat(orderMovements)
          .sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
          });

        setTransactions(merged);
        setLastUpdatedAt(new Date().toISOString());
      } catch {
        setError("تعذر تحميل الرصيد");
      } finally {
        setLoading(false);
      }
    }

    loadMovements();
  }, [isAuthed]);

  if (!isAuthed) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
          <section className="card profileDash-card" style={{ direction: "rtl", textAlign: "right" }}>
            <div className="profileDash-title">محفظة الرصيد</div>
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              يجب تسجيل الدخول أولاً لعرض الرصيد.
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
        <section className="walletHero" style={{ direction: "rtl", textAlign: "right" }}>
          <div className="walletHero-title">رصيدك الحالي</div>
          <div className="walletHero-sub">آخر تحديث: {lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "—"}</div>

          <div className="walletHero-balance" aria-label="Current balance">
            {formatAmount(balance, currency)}
          </div>
        </section>

        <section className="profileDash-card walletTxCard" style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem" }}>
          <div className="walletTx-head">
            <div className="walletTx-title">تحركات رصيدك</div>
            <Link className="profileDetails-linkBtn walletBackBtn" href="/profile">
              رجوع
            </Link>
          </div>

          {loading ? (
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              جاري تحميل التحركات...
            </div>
          ) : error ? (
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem", color: "#dc2626" }}>
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              لا توجد عمليات حتى الآن.
            </div>
          ) : (
            <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
                  <span>الوصف</span>
                  <span style={{ width: 1, height: 16, background: "#e5e7eb" }} />
                </div>
                <div>المبلغ</div>
              </div>

              {transactions.map((tx, index) => (
                <div
                  key={`${tx.id}-${index}`}
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
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0 0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{tx.statusLabel ?? "—"}</span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{formatDateTime(tx.createdAt)}</span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{tx.title ?? tx.reference ?? "تحرك رصيد"}</span>
                      <span style={{ width: 1, height: 16, background: "rgba(255, 255, 255, 0.45)" }} />
                    </div>
                    <div>
                      <span
                        style={{
                          color: tx.type === "credit" ? "#22c55e" : tx.type === "pending" ? "#facc15" : "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        {tx.type === "credit" ? "+" : tx.type === "debit" ? "-" : ""}
                        {formatAmount(tx.amount, tx.currency || currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
