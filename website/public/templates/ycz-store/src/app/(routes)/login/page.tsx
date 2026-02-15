"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function LoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "no-token">("processing");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // No token — check if already logged in
      const existing = localStorage.getItem("admin_key");
      if (existing) {
        router.replace("/admin");
        return;
      }
      setStatus("no-token");
      // Redirect to /admin which has its own login form
      setTimeout(() => router.replace("/admin"), 2000);
      return;
    }

    // Store token and redirect to admin
    localStorage.setItem("admin_key", token);
    setStatus("success");
    setTimeout(() => router.replace("/admin"), 800);
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        direction: "rtl",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {status === "processing" && (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1.5rem",
              }}
            />
            <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>جاري تسجيل الدخول...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
            <p style={{ fontSize: "1.1rem", color: "#4ade80" }}>تم تسجيل الدخول بنجاح</p>
            <p style={{ fontSize: "0.9rem", opacity: 0.5, marginTop: "0.5rem" }}>
              جاري التحويل للوحة التحكم...
            </p>
          </>
        )}
        {status === "no-token" && (
          <>
            <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>جاري التحويل لصفحة الدخول...</p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
          }}
        >
          <p style={{ opacity: 0.5 }}>جاري التحميل...</p>
        </div>
      }
    >
      <LoginHandler />
    </Suspense>
  );
}
