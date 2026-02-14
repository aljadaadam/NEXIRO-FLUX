"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "../../home/components/Footer";
import Header from "../../home/components/Header";
import ProfileBanner from "../ui/ProfileBanner";
import ProfileNavCard from "../ui/ProfileNavCard";

function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / durationMs);
      const next = Math.round(elapsed * target);
      setValue(next);
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function useCountUpFloat(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / durationMs);
      const next = elapsed * target;
      setValue(next);
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

/* ── Change Password Modal ── */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentPassword) { setError("أدخل كلمة المرور الحالية"); return; }
    if (!newPassword) { setError("أدخل كلمة المرور الجديدة"); return; }
    if (newPassword.length < 6) { setError("كلمة المرور الجديدة قصيرة — الحد الأدنى 6 أحرف"); return; }
    if (newPassword !== confirmPassword) { setError("كلمة المرور الجديدة غير متطابقة"); return; }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        accept: "application/json",
      };
      try {
        const t = localStorage.getItem("auth_token");
        if (t) headers.authorization = `Bearer ${t}`;
      } catch { /* ignore */ }

      const res = await fetch("/api/profile/me/password", {
        method: "POST",
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message || "تعذر تغيير كلمة المرور");
        return;
      }
      setSuccess(true);
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  const S = changePasswordStyles;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✅</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#4ade80", margin: "0 0 0.5rem" }}>
              تم تغيير كلمة المرور
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
              تم تحديث كلمة المرور بنجاح
            </p>
            <button type="button" onClick={onClose} style={S.btn}>حسناً</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "1.4rem" }}>🔒</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", margin: 0 }}>تغيير كلمة المرور</h3>
            </div>

            {error && (
              <div style={S.errorBox}>{error}</div>
            )}

            <label style={S.label}>كلمة المرور الحالية</label>
            <div style={S.inputWrap}>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={S.input}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={S.eyeBtn}>
                {showCurrent ? "🙈" : "👁️"}
              </button>
            </div>

            <label style={S.label}>كلمة المرور الجديدة</label>
            <div style={S.inputWrap}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={S.input}
                placeholder="6 أحرف على الأقل"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} style={S.eyeBtn}>
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>

            <label style={S.label}>تأكيد كلمة المرور الجديدة</label>
            <div style={S.inputWrap}>
              <input
                type={showNew ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={S.input}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                autoComplete="new-password"
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" disabled={loading} style={{ ...S.btn, flex: 1, opacity: loading ? 0.6 : 1 }}>
                {loading ? "⏳ جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
              <button type="button" onClick={onClose} style={S.cancelBtn}>إلغاء</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const changePasswordStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "1rem",
  },
  modal: {
    background: "linear-gradient(145deg, #1a1f35, #141828)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "1.5rem",
    width: "100%",
    maxWidth: 420,
    direction: "rtl",
  },
  label: {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "0.35rem",
    marginTop: "0.75rem",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.85rem",
    paddingLeft: "2.5rem",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
  },
  eyeBtn: {
    position: "absolute",
    left: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.25rem",
  },
  errorBox: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 10,
    padding: "0.6rem 0.85rem",
    color: "#f87171",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.7rem 1.25rem",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.7rem 1rem",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
};

/* ── Stat Card ── */
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div style={{
      padding: "1rem",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      background: `linear-gradient(135deg, ${color}08, ${color}03)`,
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      transition: "transform 150ms ease, border-color 150ms ease",
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: "grid",
        placeItems: "center",
        fontSize: "1.2rem",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginTop: "0.1rem" }}>{value}</div>
      </div>
    </div>
  );
}

export default function ProfileDashboardSection(props: {
  email?: string;
  onLogout: () => void;
}) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    completedOrders: 0,
  });

  const [walletStats, setWalletStats] = useState({
    totalCharged: 0,
    currentBalance: 0,
    pendingBalance: 0,
    currency: "USD",
  });

  const [showChangePassword, setShowChangePassword] = useState(false);

  const animated = useMemo(
    () => ({
      totalOrders: stats.totalOrders,
      pendingOrders: stats.pendingOrders,
      failedOrders: stats.failedOrders,
      completedOrders: stats.completedOrders,
    }),
    [stats]
  );

  const totalOrders = useCountUp(animated.totalOrders);
  const pendingOrders = useCountUp(animated.pendingOrders);
  const failedOrders = useCountUp(animated.failedOrders);
  const completedOrders = useCountUp(animated.completedOrders);

  const animatedWallet = useMemo(
    () => ({
      totalCharged: walletStats.totalCharged,
      currentBalance: walletStats.currentBalance,
      pendingBalance: walletStats.pendingBalance,
    }),
    [walletStats]
  );

  const totalCharged = useCountUpFloat(animatedWallet.totalCharged);
  const currentBalance = useCountUpFloat(animatedWallet.currentBalance);
  const pendingBalance = useCountUpFloat(animatedWallet.pendingBalance);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const headers: Record<string, string> = { accept: "application/json" };
        if (typeof window !== "undefined") {
          try {
            const t = localStorage.getItem("auth_token");
            if (t) headers.authorization = `Bearer ${t}`;
          } catch {
            // ignore
          }
        }

        const [walletRes, ordersRes, invoicesRes] = await Promise.all([
          fetch("/api/wallet/me", { headers }),
          fetch("/api/orders/me", { headers }),
          fetch("/api/topup/invoices/all", { headers }),
        ]);

        const walletJson = await walletRes.json().catch(() => null);
        const ordersJson = await ordersRes.json().catch(() => null);
        const invoicesJson = await invoicesRes.json().catch(() => null);

        const orders = Array.isArray(ordersJson?.data) ? ordersJson.data : [];
        const totalOrdersCount = orders.length;
        const pendingOrdersCount = orders.filter((o: any) => o?.status === 1 || o?.status === 2).length;
        const completedOrdersCount = orders.filter((o: any) => o?.status === 3).length;
        const failedOrdersCount = orders.filter((o: any) => o?.status === 4).length;

        const pendingBalanceValue =
          orders
            .filter((o: any) => o?.status === 1 || o?.status === 2)
            .map((o: any) => (typeof o?.totalPriceCents === "number" ? o.totalPriceCents : 0))
            .reduce((sum: number, cents: number) => sum + cents, 0) / 100;

        const invoices = Array.isArray(invoicesJson?.data) ? invoicesJson.data : [];
        const totalChargedValue = invoices
          .filter((i: any) => typeof i?.amount === "number")
          .reduce((sum: number, i: any) => sum + i.amount, 0);

        const walletBalanceCents = typeof walletJson?.data?.balanceCents === "number" ? walletJson.data.balanceCents : 0;
        const walletCurrency = typeof walletJson?.data?.currency === "string" ? walletJson.data.currency : undefined;
        const invoicesCurrency = invoices.find((i: any) => typeof i?.currency === "string")?.currency;
        const currency = walletCurrency ?? invoicesCurrency ?? "USD";

        const currentBalanceValue = walletBalanceCents / 100;

        if (cancelled) return;

        setStats({
          totalOrders: totalOrdersCount,
          pendingOrders: pendingOrdersCount,
          failedOrders: failedOrdersCount,
          completedOrders: completedOrdersCount,
        });

        setWalletStats({
          totalCharged: totalChargedValue,
          currentBalance: currentBalanceValue,
          pendingBalance: pendingBalanceValue,
          currency,
        });
      } catch {
        if (cancelled) return;

        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          failedOrders: 0,
          completedOrders: 0,
        });

        setWalletStats({
          totalCharged: 0,
          currentBalance: 0,
          pendingBalance: 0,
          currency: "USD",
        });
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
        {/* Banner reserved for ads/images */}
        <ProfileBanner />

        {/* Welcome card with avatar + logout + change password */}
        <section className="card profileTitle-card" style={{ direction: "rtl", textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {/* Avatar circle */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "grid",
              placeItems: "center",
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#fff",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.15)",
            }}>
              {(props.email ?? "U")[0].toUpperCase()}
            </div>

            <div style={{ flex: "1 1 auto", minWidth: 200 }}>
              <div className="profileDash-title" style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)" }}>مرحباً بك 👋</div>
              <div className="profileDash-subtitle" style={{ marginTop: "0.15rem", fontSize: "0.95rem" }}>
                {props.email ?? "COMFORT ZONE"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                style={{
                  border: "1px solid rgba(124,92,255,0.3)",
                  background: "rgba(124,92,255,0.1)",
                  color: "#a78bfa",
                  padding: "0.5rem 0.85rem",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  transition: "all 150ms ease",
                }}
              >
                🔒 تغيير كلمة المرور
              </button>
              <button className="profileDash-logout" type="button" onClick={props.onLogout}>
                تسجيل خروج
              </button>
            </div>
          </div>
        </section>

        {/* Navigation cards */}
        <section className="profileDash-card profileDashOptions-plain" style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem" }}>
          <div className="profileDash-grid" aria-label="خيارات الملف الشخصي">
            <ProfileNavCard
              href="/profile/details"
              title="تفاصيل الشخصية"
              iconSrc="/images/ProfileScreen/Personal%20details.png"
            />
            <ProfileNavCard
              href="/profile/wallet"
              title="محفظة الرصيد"
              iconSrc="/images/ProfileScreen/Balance%20wallet.png"
            />
            <ProfileNavCard
              href="/profile/top-up"
              title="شحن رصيد"
              iconSrc="/images/ProfileScreen/Top-up%20balance.png"
            />
          </div>
        </section>

        {/* Order stats */}
        <section className="card profileDash-card" style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📦</span>
            <span className="profileDash-title" style={{ fontSize: "1.15rem" }}>إحصائيات الطلبات</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.6rem",
            }}
          >
            <StatCard label="إجمالي الطلبات" value={totalOrders} icon="📋" color="#60a5fa" />
            <StatCard label="الطلبات المعلقة" value={pendingOrders} icon="⏳" color="#fbbf24" />
            <StatCard label="الطلبات الفاشلة" value={failedOrders} icon="❌" color="#f87171" />
            <StatCard label="الطلبات المكتملة" value={completedOrders} icon="✅" color="#4ade80" />
          </div>
        </section>

        {/* Wallet stats */}
        <section className="card profileDash-card" style={{ direction: "rtl", textAlign: "right", marginTop: "0.9rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "1.2rem" }}>💰</span>
            <span className="profileDash-title" style={{ fontSize: "1.15rem" }}>إحصائيات الرصيد</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.6rem",
            }}
          >
            <StatCard
              label="إجمالي الرصيد المشحون"
              value={`${totalCharged.toFixed(2)} ${walletStats.currency}`}
              icon="💳"
              color="#60a5fa"
            />
            <StatCard
              label="الرصيد الحالي"
              value={`${currentBalance.toFixed(2)} ${walletStats.currency}`}
              icon="💵"
              color="#4ade80"
            />
            <StatCard
              label="الرصيد المعلق في الأوردرات"
              value={`${pendingBalance.toFixed(2)} ${walletStats.currency}`}
              icon="🔄"
              color="#fbbf24"
            />
          </div>
        </section>
      </main>

      <Footer />

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
