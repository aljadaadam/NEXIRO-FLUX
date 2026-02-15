"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * /login?token=...
 *
 * This page is the entry-point after provisioning.
 * It reads the admin key from the URL and persists it in localStorage,
 * then redirects the site owner to the admin dashboard.
 */

function LoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("admin_key", token);
    }
    router.replace("/admin");
  }, [searchParams, router]);

  return null;
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.15)",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ opacity: 0.7, fontSize: 14 }}>جاري تسجيل الدخول...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      <Suspense fallback={null}>
        <LoginHandler />
      </Suspense>
    </div>
  );
}
