"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, PlusCircle, Link as LinkIcon, ShoppingCart,
  Users, Megaphone, Lock, LogOut, Menu, Bell, CreditCard, CheckCircle,
} from "lucide-react";
import "../../app/admin.css";

const menuItems = [
  { label: "لوحة التحكم", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "المنتجات", href: "/admin/products", icon: <Package size={18} /> },
  { label: "إضافة منتج", href: "/admin/add-product", icon: <PlusCircle size={18} /> },
  { label: "المصادر", href: "/admin/providers", icon: <LinkIcon size={18} /> },
  { label: "الطلبات", href: "/admin/orders", icon: <ShoppingCart size={18} /> },
  { label: "بوابات الدفع", href: "/admin/payment-gateways", icon: <CreditCard size={18} /> },
  { label: "المستخدمون", href: "/admin/users", icon: <Users size={18} /> },
  { label: "الإعلانات", href: "/admin/announcements", icon: <Megaphone size={18} /> },
];

const introLines = [
  "مرحبًا بك",
  "في مركز القيادة",
  "حيث تبدأ السيطرة الكاملة",
  "⚡",
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} س`;
  const days = Math.floor(hrs / 24);
  return `${days} ي`;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  /* ── Typewriter intro state ── */
  const [introPhase, setIntroPhase] = useState<"typing" | "done">("typing");
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  /* ── Notification state ── */
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifCounts, setNotifCounts] = useState<{ topups: number; orders: number; verifications: number }>({
    topups: 0,
    orders: 0,
    verifications: 0,
  });
  const [notifItems, setNotifItems] = useState<
    Array<{ type: string; id: string; title: string; subtitle: string; time: string }>
  >([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const key = localStorage.getItem("admin_key");
    if (!key) return;
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { "x-admin-key": key },
      });
      const json = await res.json();
      if (json.ok) {
        setNotifTotal(json.data.total);
        setNotifCounts(json.data.counts);
        setNotifItems(json.data.items);
      }
    } catch {}
  }, []);

  // Poll notifications every 30s
  useEffect(() => {
    if (!adminKey) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [adminKey, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (adminKey !== null || !checked) return; // only run on login screen
    if (introPhase === "done") return;

    if (currentLine >= introLines.length) {
      // All lines typed — pause then show form
      const t = setTimeout(() => setIntroPhase("done"), 700);
      return () => clearTimeout(t);
    }

    const line = introLines[currentLine];
    if (currentChar <= line.length) {
      const t = setTimeout(() => {
        setDisplayedLines((prev) => {
          const copy = [...prev];
          copy[currentLine] = line.slice(0, currentChar);
          return copy;
        });
        setCurrentChar((c) => c + 1);
      }, 55);
      return () => clearTimeout(t);
    } else {
      // Line done — pause then go to next
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [adminKey, checked, introPhase, currentLine, currentChar]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_key");
    if (!stored) {
      setAdminKey(null);
    } else {
      setAdminKey(stored);
    }
    setChecked(true);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!json.ok) {
        setLoginError(json.error?.message ?? "فشل تسجيل الدخول");
        return;
      }
      localStorage.setItem("admin_key", json.data.adminKey);
      setAdminKey(json.data.adminKey);
    } catch {
      setLoginError("تعذر الاتصال بالخادم");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!checked) {
    return (
      <div className="admin-login-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      </div>
    );
  }

  if (adminKey === null) {
    return (
      <div className="admin-login-page">
        {/* ── Typewriter Intro ── */}
        <div className={`admin-intro ${introPhase === "done" ? "admin-intro-hide" : ""}`}>
          <div className="admin-intro-lines">
            {displayedLines.map((txt, i) => (
              <span
                key={i}
                className={`admin-intro-line ${
                  i === introLines.length - 1 ? "admin-intro-accent" : ""
                }`}
              >
                {txt}
                {i === currentLine && introPhase === "typing" && (
                  <span className="admin-intro-cursor">|</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── Login Form ── */}
        <form
          className={`admin-login-card ${
            introPhase === "done" ? "admin-login-reveal" : "admin-login-hidden"
          }`}
          onSubmit={handleLogin}
        >
          <h1><Lock size={22} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.4rem" }} /> لوحة التحكم</h1>
          <p>أدخل بيانات الأدمن للمتابعة</p>
          {loginError && (
            <div style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "0.6rem 1rem", borderRadius: 10, fontSize: "0.9rem" }}>
              {loginError}
            </div>
          )}
          <input
            type="text"
            name="username"
            placeholder="اسم المستخدم"
            className="admin-input"
            autoFocus
            required
          />
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            className="admin-input"
            required
          />
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loginLoading}>
            {loginLoading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <span className="admin-logo">YCZ</span>
          <span className="admin-logo-sub">لوحة التحكم</span>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-item logout"
            onClick={() => {
              localStorage.removeItem("admin_key");
              setAdminKey(null);
            }}
          >
            <span className="admin-nav-icon"><LogOut size={18} /></span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={22} />
          </button>
          <h2 className="admin-header-title">
            {menuItems.find((m) =>
              m.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(m.href)
            )?.label ?? "لوحة التحكم"}
          </h2>

          {/* ── Notification Bell ── */}
          <div className="admin-notif-wrapper" ref={notifRef}>
            <button
              className="admin-notif-bell"
              onClick={() => {
                setNotifOpen((v) => !v);
                if (!notifOpen) fetchNotifications();
              }}
              title="الإشعارات"
            >
              <Bell size={20} />
              {notifTotal > 0 && (
                <span className="admin-notif-badge">{notifTotal > 99 ? "99+" : notifTotal}</span>
              )}
            </button>

            {notifOpen && (
              <div className="admin-notif-dropdown">
                <div className="admin-notif-header">
                  <span>الإشعارات</span>
                  <span className="admin-notif-count">{notifTotal}</span>
                </div>

                {/* Category pills */}
                {notifTotal > 0 && (
                  <div className="admin-notif-pills">
                    {notifCounts.topups > 0 && (
                      <span className="admin-notif-pill topup"><CreditCard size={12} /> دفع ({notifCounts.topups})</span>
                    )}
                    {notifCounts.orders > 0 && (
                      <span className="admin-notif-pill order"><ShoppingCart size={12} /> طلبات ({notifCounts.orders})</span>
                    )}
                    {notifCounts.verifications > 0 && (
                      <span className="admin-notif-pill verify"><CheckCircle size={12} /> توثيق ({notifCounts.verifications})</span>
                    )}
                  </div>
                )}

                {/* Items list */}
                <div className="admin-notif-list">
                  {notifItems.length === 0 ? (
                    <div className="admin-notif-empty">لا توجد إشعارات</div>
                  ) : (
                    notifItems.map((item, i) => (
                      <button
                        key={`${item.type}-${item.id}-${i}`}
                        className="admin-notif-item"
                        onClick={() => {
                          setNotifOpen(false);
                          if (item.type === "topup") router.push("/admin/payment-gateways");
                          else if (item.type === "order") router.push("/admin/orders");
                          else if (item.type === "verification") router.push("/admin/users");
                        }}
                      >
                        <span className="admin-notif-item-icon">
                          {item.type === "topup" ? <CreditCard size={16} /> : item.type === "order" ? <ShoppingCart size={16} /> : <CheckCircle size={16} />}
                        </span>
                        <div className="admin-notif-item-body">
                          <span className="admin-notif-item-title">{item.title}</span>
                          <span className="admin-notif-item-sub">{item.subtitle}</span>
                        </div>
                        <span className="admin-notif-item-time">
                          {timeAgo(item.time)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="admin-header-badge">مدير</div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
