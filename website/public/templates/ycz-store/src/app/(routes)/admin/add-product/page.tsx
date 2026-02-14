"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

interface GroupInfo {
  key: string;
  name: string;
  type: string;
}

export default function AdminAddProductPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [groupKey, setGroupKey] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState("IMEI");
  const [serviceName, setServiceName] = useState("");
  const [serviceNameAr, setServiceNameAr] = useState("");
  const [serviceType, setServiceType] = useState("IMEI");
  const [credit, setCredit] = useState("");
  const [time, setTime] = useState("1-24 ساعة");
  const [info, setInfo] = useState("");

  const getAdminKey = () => localStorage.getItem("admin_key") ?? "";

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/groups", {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (json.ok) setGroups(json.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const body: Record<string, string> = {
        serviceName,
        serviceNameAr,
        serviceType,
        credit,
        time,
        info,
      };

      if (mode === "existing") {
        body.groupKey = groupKey;
      } else {
        body.newGroupName = newGroupName;
        body.newGroupType = newGroupType;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل الإنشاء");

      setSuccess(`تم إنشاء المنتج بنجاح: ${json.data.serviceName}`);
      // Reset form
      setServiceName("");
      setServiceNameAr("");
      setCredit("");
      setInfo("");
      // Refresh groups in case new one was created
      fetchGroups();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-form">
      <div className="admin-page-form-header">
        <h2 style={{ margin: 0 }}><PlusCircle size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> إضافة منتج يدوي</h2>
        <button
          className="admin-btn"
          onClick={() => router.push("/admin/products")}
        >
          ← العودة للمنتجات
        </button>
      </div>

      <div
        className="admin-card"
        style={{
          padding: "1rem 1.25rem",
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
          fontSize: "0.88rem",
          color: "var(--admin-muted)",
          lineHeight: 1.7,
        }}
      >
        <AlertTriangle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> المنتجات اليدوية لا يتم تنفيذها تلقائياً — الأدمن يستلم الطلبات ويحوّل حالتها يدوياً (إكمال / فشل).
      </div>

      {success && (
        <div
          style={{
            padding: "1rem",
            borderRadius: 10,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            fontSize: "0.9rem",
          }}
        >
          <CheckCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> {success}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            borderRadius: 10,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
            fontSize: "0.9rem",
          }}
        >
          <XCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> {error}
        </div>
      )}

      <form className="admin-card admin-form-card" onSubmit={handleSubmit}>
        {/* ── Group selection ── */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.95rem" }}>
            المجموعة
          </label>
          <div className="admin-form-row" style={{ marginBottom: "0.75rem" }}>
            <button
              type="button"
              className={`admin-btn ${mode === "existing" ? "admin-btn-primary" : ""}`}
              onClick={() => setMode("existing")}
              style={{ fontSize: "0.85rem" }}
            >
              مجموعة موجودة
            </button>
            <button
              type="button"
              className={`admin-btn ${mode === "new" ? "admin-btn-primary" : ""}`}
              onClick={() => setMode("new")}
              style={{ fontSize: "0.85rem" }}
            >
              مجموعة جديدة
            </button>
          </div>

          {mode === "existing" ? (
            <select
              className="admin-input"
              value={groupKey}
              onChange={(e) => setGroupKey(e.target.value)}
              required
              style={{ width: "100%" }}
            >
              <option value="">— اختر مجموعة —</option>
              {groups.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.name} ({g.type})
                </option>
              ))}
            </select>
          ) : (
            <div className="admin-form-row">
              <input
                className="admin-input"
                placeholder="اسم المجموعة الجديدة"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required={mode === "new"}
                style={{ flex: 2, minWidth: 0 }}
              />
              <select
                className="admin-input"
                value={newGroupType}
                onChange={(e) => setNewGroupType(e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              >
                <option value="IMEI">IMEI</option>
                <option value="SERVER">SERVER</option>
                <option value="REMOTE">REMOTE</option>
              </select>
            </div>
          )}
        </div>

        {/* ── Service details ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>
              اسم الخدمة (إنجليزي) *
            </label>
            <input
              className="admin-input"
              placeholder="مثال: iPhone iCloud Unlock"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>
              اسم الخدمة (عربي)
            </label>
            <input
              className="admin-input"
              placeholder="مثال: فتح قفل آيكلاود آيفون"
              value={serviceNameAr}
              onChange={(e) => setServiceNameAr(e.target.value)}
            />
          </div>

          <div className="admin-form-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                النوع
              </label>
              <select
                className="admin-input"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="IMEI">IMEI</option>
                <option value="SERVER">SERVER</option>
                <option value="REMOTE">REMOTE</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                السعر ($) *
              </label>
              <input
                className="admin-input"
                type="text"
                placeholder="مثال: 25.50"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>
              الوقت المتوقع
            </label>
            <input
              className="admin-input"
              placeholder="مثال: 1-24 ساعة"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>
              معلومات إضافية
            </label>
            <textarea
              className="admin-input"
              placeholder="ملاحظات عن الخدمة..."
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? "جاري الإنشاء..." : "إنشاء المنتج"}
          </button>
        </div>
      </form>
    </div>
  );
}
