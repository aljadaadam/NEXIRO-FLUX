"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Clock, Settings, CheckCircle, XCircle, Ban,
  AlertTriangle, Landmark, Gem, Coins, CreditCard, Key,
  Users, Package, DollarSign, BarChart3, TrendingUp,
  TrendingDown, Banknote, Building2, User, RefreshCw,
  ClipboardList, Upload,
} from "lucide-react";

/* ── Counting animation hook ── */
function useCountUp(target: number, duration = 1200, delay = 200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

/* ── Animated number component ── */
function AnimatedNumber({ value, prefix = "", suffix = "", isCents = false, isPercent = false, delay = 200 }: {
  value: number; prefix?: string; suffix?: string; isCents?: boolean; isPercent?: boolean; delay?: number;
}) {
  const animTarget = isPercent ? Math.round(value * 10) : value;
  const count = useCountUp(animTarget, 1200, delay);
  let display: string;
  if (isCents) display = `${prefix}$${(count / 100).toFixed(2)}${suffix}`;
  else if (isPercent) display = `${prefix}${(count / 10).toFixed(1)}${suffix}`;
  else display = `${prefix}${count.toLocaleString("en-US")}${suffix}`;
  return <>{display}</>;
}

interface StatsData {
  generatedAt: string;
  users: {
    total: number;
    createdLast24h: number;
    verification: Record<string, number>;
  };
  orders: {
    total: number;
    createdLast24h: number;
    byStatus: Record<string, number>;
    completedRevenueCents: number;
  };
  balances: {
    usersTotalBalanceCents: number;
    providersTotalBalanceCents: number;
  };
  topup: {
    invoicesByStatus: Record<string, number>;
    invoicesByGateway: Record<string, number>;
    amountByGateway: Record<string, number>;
    completedCount: number;
    completedAmountCents: number;
  };
  profit: {
    revenueCents: number;
    sourceCostCents: number;
    profitCents: number;
  };
}

const statusLabels: Record<string, string> = {
  "1": "بانتظار",
  "2": "قيد المعالجة",
  "3": "مكتمل",
  "4": "فشل",
  "5": "ملغي",
};

const statusIcons: Record<string, React.ReactNode> = {
  "1": <Clock size={14} />,
  "2": <Settings size={14} />,
  "3": <CheckCircle size={14} />,
  "4": <XCircle size={14} />,
  "5": <Ban size={14} />,
};

const statusColors: Record<string, string> = {
  "1": "#fbbf24",
  "2": "#60a5fa",
  "3": "#4ade80",
  "4": "#f87171",
  "5": "#94a3b8",
};

const verificationLabels: Record<string, string> = {
  UNVERIFIED: "غير موثق",
  PENDING: "قيد المراجعة",
  VERIFIED: "موثق",
};

const verificationIcons: Record<string, React.ReactNode> = {
  UNVERIFIED: <XCircle size={14} color="#f87171" />,
  PENDING: <Clock size={14} color="#fbbf24" />,
  VERIFIED: <CheckCircle size={14} color="#4ade80" />,
};

const verificationColors: Record<string, string> = {
  UNVERIFIED: "#f87171",
  PENDING: "#fbbf24",
  VERIFIED: "#4ade80",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const key = localStorage.getItem("admin_key") ?? "";
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-key": key },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل الإحصائيات");
      setStats(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
        <p>{error}</p>
        <button className="admin-btn admin-btn-primary" onClick={fetchStats}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const ordersTotal = stats.orders.total;
  const completedOrders = Number(stats.orders.byStatus["3"] ?? 0);
  const failedOrders = Number(stats.orders.byStatus["4"] ?? 0);
  const successRate = ordersTotal > 0 ? ((completedOrders / ordersTotal) * 100).toFixed(1) : "0";

  const topupTotal = Object.values(stats.topup.invoicesByGateway).reduce((a, b) => a + b, 0);

  const gatewayLabels: Record<string, string> = {
    BANK: "تحويل بنكي",
    USDT: "USDT",
    BINANCE: "Binance",
    PAYPAL: "PayPal",
    ADMIN: "شحن أدمن",
  };

  const gatewayIcons: Record<string, React.ReactNode> = {
    BANK: <Landmark size={14} />,
    USDT: <Gem size={14} />,
    BINANCE: <Coins size={14} />,
    PAYPAL: <CreditCard size={14} />,
    ADMIN: <Key size={14} />,
  };

  const topupStatusLabels: Record<string, string> = {
    CREATED: "منشأة",
    AWAITING_PAYMENT: "بانتظار الدفع",
    RECEIPT_UPLOADED: "إيصال مرفوع",
    COMPLETED: "مكتملة",
    REJECTED: "مرفوضة",
  };

  return (
    <div className="dash">
      {/* ── Hero Stats Row ── */}
      <div className="dash-hero">
        <div className="dash-hero-card purple">
          <div className="dash-hero-icon"><Users size={22} /></div>
          <div className="dash-hero-content">
            <span className="dash-hero-label">المستخدمون</span>
            <span className="dash-hero-value"><AnimatedNumber value={stats.users.total} delay={100} /></span>
            <span className="dash-hero-delta positive">+{stats.users.createdLast24h} اليوم</span>
          </div>
        </div>

        <div className="dash-hero-card blue">
          <div className="dash-hero-icon"><Package size={22} /></div>
          <div className="dash-hero-content">
            <span className="dash-hero-label">الطلبات</span>
            <span className="dash-hero-value"><AnimatedNumber value={stats.orders.total} delay={200} /></span>
            <span className="dash-hero-delta positive">+{stats.orders.createdLast24h} اليوم</span>
          </div>
        </div>

        <div className="dash-hero-card green">
          <div className="dash-hero-icon"><DollarSign size={22} /></div>
          <div className="dash-hero-content">
            <span className="dash-hero-label">الإيرادات</span>
            <span className="dash-hero-value"><AnimatedNumber value={stats.orders.completedRevenueCents} isCents delay={300} /></span>
            <span className="dash-hero-delta">{completedOrders} طلب مكتمل</span>
          </div>
        </div>

        <div className="dash-hero-card amber">
          <div className="dash-hero-icon"><BarChart3 size={22} /></div>
          <div className="dash-hero-content">
            <span className="dash-hero-label">نسبة النجاح</span>
            <span className="dash-hero-value"><AnimatedNumber value={parseFloat(successRate)} isPercent delay={400} suffix="%" /></span>
            <span className="dash-hero-delta">{failedOrders} طلب فاشل</span>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="dash-grid-2">
        {/* Orders by Status */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3><Package size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> الطلبات حسب الحالة</h3>
          </div>
          <div className="dash-panel-body">
            {Object.entries(stats.orders.byStatus).map(([status, count]) => {
              const pct = ordersTotal > 0 ? (count / ordersTotal) * 100 : 0;
              const color = statusColors[status] ?? "#94a3b8";
              return (
                <div className="dash-bar-row" key={status}>
                  <div className="dash-bar-label">
                    <span className="dash-bar-icon">{statusIcons[status] ?? <ClipboardList size={14} />}</span>
                    <span>{statusLabels[status] ?? status}</span>
                  </div>
                  <div className="dash-bar-track">
                    <div
                      className="dash-bar-fill"
                      style={{ width: `${Math.max(pct, 2)}%`, background: color }}
                    />
                  </div>
                  <div className="dash-bar-value" style={{ color }}>
                    {formatNumber(count)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balances */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3><CreditCard size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> الأرصدة</h3>
          </div>
          <div className="dash-panel-body">
            <div className="dash-balance-card">
              <div className="dash-balance-icon" style={{ background: "rgba(124,92,255,0.15)", color: "#a78bfa" }}><User size={18} /></div>
              <div className="dash-balance-info">
                <span className="dash-balance-label">رصيد المستخدمين الكلي</span>
                <span className="dash-balance-value"><AnimatedNumber value={stats.balances.usersTotalBalanceCents} isCents delay={350} /></span>
              </div>
            </div>
            <div className="dash-balance-card">
              <div className="dash-balance-icon" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}><Building2 size={18} /></div>
              <div className="dash-balance-info">
                <span className="dash-balance-label">رصيد المزودين الكلي</span>
                <span className="dash-balance-value"><AnimatedNumber value={stats.balances.providersTotalBalanceCents} isCents delay={450} /></span>
              </div>
            </div>

            {/* Verification breakdown */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", fontWeight: 600 }}>
                <Users size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> حالة التحقق
              </div>
              <div className="dash-verif-grid">
                {Object.entries(stats.users.verification).map(([status, count]) => (
                  <div className="dash-verif-item" key={status}>
                    <span className="dash-verif-dot">{verificationIcons[status] ?? <XCircle size={14} />}</span>
                    <span className="dash-verif-label">{verificationLabels[status] ?? status}</span>
                    <span className="dash-verif-count" style={{ color: verificationColors[status] ?? "#fff" }}>
                      {formatNumber(count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profit section ── */}
      <div className="dash-panel" style={{ marginTop: 0 }}>
        <div className="dash-panel-header">
          <h3><TrendingUp size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> الأرباح</h3>
        </div>
        <div className="dash-panel-body">
          <div className="dash-grid-3">
            <div className="dash-balance-card">
              <div className="dash-balance-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}><DollarSign size={18} /></div>
              <div className="dash-balance-info">
                <span className="dash-balance-label">إجمالي الإيرادات</span>
                <span className="dash-balance-value"><AnimatedNumber value={stats.profit.revenueCents} isCents delay={300} /></span>
              </div>
            </div>
            <div className="dash-balance-card">
              <div className="dash-balance-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}><Upload size={18} /></div>
              <div className="dash-balance-info">
                <span className="dash-balance-label">تكلفة المصدر</span>
                <span className="dash-balance-value"><AnimatedNumber value={stats.profit.sourceCostCents} isCents delay={400} /></span>
              </div>
            </div>
            <div className="dash-balance-card">
              <div className="dash-balance-icon" style={{ background: stats.profit.profitCents >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: stats.profit.profitCents >= 0 ? "#4ade80" : "#f87171" }}>
                {stats.profit.profitCents >= 0 ? <BarChart3 size={18} /> : <TrendingDown size={18} />}
              </div>
              <div className="dash-balance-info">
                <span className="dash-balance-label">صافي الربح</span>
                <span className="dash-balance-value" style={{ color: stats.profit.profitCents >= 0 ? "#4ade80" : "#f87171" }}>
                  <AnimatedNumber value={stats.profit.profitCents} isCents delay={500} />
                </span>
              </div>
            </div>
          </div>
          {stats.profit.revenueCents > 0 && (
            <div style={{ marginTop: "1rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              هامش الربح: {((stats.profit.profitCents / stats.profit.revenueCents) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* ── Top-up section ── */}
      <div className="dash-panel" style={{ marginTop: 0 }}>
        <div className="dash-panel-header">
          <h3><Banknote size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> شحن الرصيد</h3>
          <span className="dash-panel-badge">{formatNumber(stats.topup.completedCount)} مكتملة • {formatCents(stats.topup.completedAmountCents)}</span>
        </div>
        <div className="dash-panel-body">
          <div className="dash-grid-2">
            {/* By Gateway (completed only) */}
            <div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", fontWeight: 600 }}>
                حسب بوابة الدفع (المكتملة فقط)
              </div>
              {Object.entries(stats.topup.invoicesByGateway).map(([gw, count]) => {
                const pct = topupTotal > 0 ? (count / topupTotal) * 100 : 0;
                const amountCents = stats.topup.amountByGateway[gw] ?? 0;
                return (
                  <div className="dash-bar-row" key={gw}>
                    <div className="dash-bar-label">
                      <span className="dash-bar-icon">{gatewayIcons[gw] ?? <Landmark size={14} />}</span>
                      <span>{gatewayLabels[gw] ?? gw}</span>
                    </div>
                    <div className="dash-bar-track">
                      <div
                        className="dash-bar-fill"
                        style={{ width: `${Math.max(pct, 2)}%`, background: gw === "ADMIN" ? "#f59e0b" : "#a78bfa" }}
                      />
                    </div>
                    <div className="dash-bar-value">
                      {formatNumber(count)}
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginRight: "0.25rem" }}>
                        ({formatCents(amountCents)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* By Status */}
            <div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", fontWeight: 600 }}>
                حسب الحالة
              </div>
              {Object.entries(stats.topup.invoicesByStatus).map(([status, count]) => {
                const allInvoices = Object.values(stats.topup.invoicesByStatus).reduce((a, b) => a + b, 0);
                const pct = allInvoices > 0 ? (count / allInvoices) * 100 : 0;
                return (
                  <div className="dash-bar-row" key={status}>
                    <div className="dash-bar-label">
                      <span className="dash-bar-icon"><ClipboardList size={14} /></span>
                      <span>{topupStatusLabels[status] ?? status}</span>
                    </div>
                    <div className="dash-bar-track">
                      <div
                        className="dash-bar-fill"
                        style={{ width: `${Math.max(pct, 2)}%`, background: status === "COMPLETED" ? "#4ade80" : "#60a5fa" }}
                      />
                    </div>
                    <div className="dash-bar-value">{formatNumber(count)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="dash-footer">
        <span>آخر تحديث: {new Date(stats.generatedAt).toLocaleString("ar-EG")}</span>
        <button className="admin-btn admin-btn-sm" onClick={fetchStats}>
          <RefreshCw size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> تحديث
        </button>
      </div>
    </div>
  );
}
