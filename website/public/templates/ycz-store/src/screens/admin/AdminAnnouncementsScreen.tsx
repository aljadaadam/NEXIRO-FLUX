"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Mail, CheckCircle, Ban, Users, Megaphone,
  Send, XCircle, AlertTriangle, Loader,
} from "lucide-react";

interface DailyStatus {
  dailyLimit: number;
  sentToday: number;
  remaining: number;
  totalUsers: number;
}

interface SendResult {
  total: number;
  sent: number;
  failed: number;
  errors?: string[];
  dailySentAfter: number;
  dailyRemaining: number;
}

function getAdminKey(): string {
  return localStorage.getItem("admin_key") ?? "";
}

export default function AdminAnnouncementsScreen() {
  const [status, setStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [mode, setMode] = useState<"all" | "single">("all");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/announcements/status", {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (json.ok) setStatus(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSend = async () => {
    if (!title.trim()) return setError("العنوان مطلوب");
    if (!message.trim()) return setError("نص الرسالة مطلوب");
    if (mode === "single" && !email.trim()) return setError("البريد الإلكتروني مطلوب");

    const recipientCount = mode === "all" ? (status?.totalUsers ?? 0) : 1;
    const confirmMsg =
      mode === "all"
        ? `سيتم إرسال الإعلان إلى جميع المستخدمين (${recipientCount}). هل تريد المتابعة؟`
        : `سيتم إرسال الإعلان إلى ${email}. هل تريد المتابعة؟`;

    if (!confirm(confirmMsg)) return;

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const payload: Record<string, unknown> = { title: title.trim(), message: message.trim(), mode };
      if (mode === "single") payload.email = email.trim();
      if (ctaLabel.trim()) payload.ctaLabel = ctaLabel.trim();
      if (ctaUrl.trim()) payload.ctaUrl = ctaUrl.trim();

      const res = await fetch("/api/admin/announcements/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) {
        setError(json.error?.message ?? "فشل الإرسال");
        return;
      }

      setResult(json.data);
      // Refresh status
      fetchStatus();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* ── Daily Status ── */}
      {status && (
        <div className="dash-panel" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-panel-header">
            <h3><BarChart3 size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> حالة الإرسال اليومي</h3>
          </div>
          <div className="dash-panel-body">
            <div className="dash-grid-3">
              <div className="dash-balance-card">
                <div className="dash-balance-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}><Mail size={18} /></div>
                <div className="dash-balance-info">
                  <span className="dash-balance-label">تم الإرسال اليوم</span>
                  <span className="dash-balance-value">{status.sentToday}</span>
                </div>
              </div>
              <div className="dash-balance-card">
                <div className="dash-balance-icon" style={{ background: status.remaining > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: status.remaining > 0 ? "#4ade80" : "#f87171" }}>
                  {status.remaining > 0 ? <CheckCircle size={18} /> : <Ban size={18} />}
                </div>
                <div className="dash-balance-info">
                  <span className="dash-balance-label">المتبقي</span>
                  <span className="dash-balance-value" style={{ color: status.remaining > 0 ? "#4ade80" : "#f87171" }}>{status.remaining}</span>
                </div>
              </div>
              <div className="dash-balance-card">
                <div className="dash-balance-icon" style={{ background: "rgba(124,92,255,0.15)", color: "#a78bfa" }}><Users size={18} /></div>
                <div className="dash-balance-info">
                  <span className="dash-balance-label">إجمالي المستخدمين</span>
                  <span className="dash-balance-value">{status.totalUsers}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <div className="dash-bar-track" style={{ height: 8 }}>
                <div
                  className="dash-bar-fill"
                  style={{
                    width: `${Math.min((status.sentToday / status.dailyLimit) * 100, 100)}%`,
                    background: status.remaining > 0 ? "#a78bfa" : "#f87171",
                    height: 8,
                  }}
                />
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "0.35rem", textAlign: "center" }}>
                {status.sentToday} / {status.dailyLimit} الحد اليومي
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Result ── */}
      {result && (
        <div style={{
          background: result.failed === 0 ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)",
          border: `1px solid ${result.failed === 0 ? "rgba(34,197,94,0.3)" : "rgba(251,191,36,0.3)"}`,
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
        }}>
          <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: result.failed === 0 ? "#4ade80" : "#fbbf24" }}>
            {result.failed === 0 ? <><CheckCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> تم الإرسال بنجاح</> : <><AlertTriangle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> اكتمل مع أخطاء</>}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)" }}>
            تم الإرسال: <strong>{result.sent}</strong> • فشل: <strong>{result.failed}</strong> • المتبقي اليوم: <strong>{result.dailyRemaining}</strong>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#f87171" }}>
              {result.errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12,
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          color: "#f87171",
          fontSize: "0.9rem",
        }}>
                    <XCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> {error}
        </div>
      )}

      {/* ── Form ── */}
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h3><Megaphone size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> إرسال إعلان</h3>
        </div>
        <div className="dash-panel-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Mode Toggle */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
              نوع الإرسال
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className={`admin-btn ${mode === "all" ? "admin-btn-primary" : ""}`}
                onClick={() => setMode("all")}
                style={{ flex: 1 }}
              >
                                <Send size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> جماعي (جميع المستخدمين)
              </button>
              <button
                className={`admin-btn ${mode === "single" ? "admin-btn-primary" : ""}`}
                onClick={() => setMode("single")}
                style={{ flex: 1 }}
              >
                                <Mail size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> فردي (مستخدم واحد)
              </button>
            </div>
          </div>

          {/* Single Email */}
          {mode === "single" && (
            <div>
              <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
                البريد الإلكتروني للمستلم
              </label>
              <input
                type="email"
                className="admin-input"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
              عنوان الإعلان *
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="مثال: تحديث جديد على المنصة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
              نص الرسالة *
            </label>
            <textarea
              className="admin-input"
              rows={6}
              placeholder="اكتب نص الإعلان هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ resize: "vertical", minHeight: 120 }}
            />
          </div>

          {/* CTA (optional) */}
          <div className="dash-grid-2">
            <div>
              <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
                نص الزر (اختياري)
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="مثال: عرض التفاصيل"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "0.4rem", display: "block" }}>
                رابط الزر (اختياري)
              </label>
              <input
                type="url"
                className="admin-input"
                placeholder="https://..."
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Preview Info */}
          <div style={{
            background: "rgba(124,92,255,0.08)",
            border: "1px solid rgba(124,92,255,0.2)",
            borderRadius: 12,
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.6)",
          }}>
            {mode === "all" ? (
              <><Send size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> سيتم إرسال هذا الإعلان إلى <strong style={{ color: "#a78bfa" }}>{status?.totalUsers ?? "—"}</strong> مستخدم</>
            ) : (
              <><Mail size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> سيتم إرسال هذا الإعلان إلى <strong style={{ color: "#a78bfa" }}>{email || "—"}</strong></>
            )}
          </div>

          {/* Send Button */}
          <button
            className="admin-btn admin-btn-primary admin-btn-lg"
            onClick={handleSend}
            disabled={sending || (status?.remaining ?? 0) <= 0}
            style={{ fontWeight: 700 }}
          >
            {sending ? (
              <span><Loader size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> جاري الإرسال...</span>
            ) : (status?.remaining ?? 0) <= 0 ? (
              <span><Ban size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تم الوصول للحد اليومي</span>
            ) : (
              <span><Send size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> إرسال الإعلان</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
