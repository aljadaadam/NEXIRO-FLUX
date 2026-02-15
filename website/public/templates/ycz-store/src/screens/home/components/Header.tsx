"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "/", label: "الرئيسية" },
      { href: "/services", label: "الخدمات" },
      { href: "/orders", label: "طلباتي" },
      { href: "/support", label: "الدعم" },
    ],
    [],
  );

  const isActivePath = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header className="siteHeader">
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", direction: "rtl", justifyContent: "space-between", gap: "1rem" }}
      >
        <div className="siteHeader-left">
          <button
            type="button"
            className="siteHeader-mobileToggle"
            aria-label="فتح القائمة"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <nav aria-label="تنقل الموقع" className="siteHeader-desktopNav">
            <Link
              href="/profile"
              aria-label="الملف الشخصي"
              title="الملف الشخصي"
              style={{
                cursor: "pointer",
                width: 38,
                height: 38,
                borderRadius: 9999,
                border: isActivePath("/profile") ? "2px solid #6a1b64" : "1px solid rgba(11, 16, 32, 0.16)",
                display: "grid",
                placeItems: "center",
                color: "#0b1020",
                background: "#ffffff",
                flex: "0 0 auto",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>

            {navItems.map((item) => {
              const isActive = isActivePath(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    color: "rgba(11, 16, 32, 0.78)",
                    borderBottom: isActive ? "2px solid #6a1b64" : "2px solid transparent",
                    paddingBottom: "0.3rem",
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link className="btn siteHeader-cta" href="/#start" style={{ background: "#6a1b64", padding: "0.4rem 1.1rem", lineHeight: 1.1 }}>
            ابدأ الآن
          </Link>
        </div>

        <Link
          href="/"
          aria-label="الصفحة الرئيسية"
          title="الرئيسية"
          style={{ flex: "0 0 auto" }}
        >
          <img
            src="/images/logoheder.png"
            alt={process.env.NEXT_PUBLIC_STORE_NAME ?? "المتجر"}
            style={{ height: 34, width: "auto", display: "block" }}
          />
        </Link>
      </div>

      <div
        id="mobile-nav"
        className={`mobileNavOverlay${mobileOpen ? " isOpen" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setMobileOpen(false);
        }}
      >
        <aside className="mobileNavPanel">
          <div className="mobileNavTop">
            <Link href="/" className="mobileNavBrand" onClick={() => setMobileOpen(false)}>
              <img src="/images/logoheder.png" alt={process.env.NEXT_PUBLIC_STORE_NAME ?? "المتجر"} style={{ height: 30, width: "auto", display: "block" }} />
            </Link>

            <button type="button" className="mobileNavClose" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mobileNavLinks" aria-label="روابط">
            <Link
              href="/profile"
              className={`mobileNavLink${isActivePath("/profile") ? " isActive" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              الملف الشخصي
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mobileNavLink${isActivePath(item.href) ? " isActive" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mobileNavBottom">
            <Link href="/#start" className="mobileNavCta" onClick={() => setMobileOpen(false)}>
              ابدأ الآن
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
