"use client";

import { useEffect, useState, useCallback } from "react";
import { Link as LinkIcon, RefreshCw, CheckCircle, XCircle, Info } from "lucide-react";

interface ProviderInfo {
  id: string;
  key: string;
  name: string;
  balanceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
}

interface ProvidersData {
  providers: ProviderInfo[];
  products: { total: number; manual: number; synced: number };
  sdUnlocker: { connected: boolean; endpoint: string };
}

interface SyncResult {
  groups: { created: number; updated: number };
  services: { created: number; updated: number };
  totalGroups: number;
}

export default function AdminProvidersPage() {
  const [data, setData] = useState<ProvidersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const getAdminKey = () => localStorage.getItem("admin_key") ?? "";

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/providers", {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل التحميل");
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/providers/sync", {
        method: "POST",
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل المزامنة");
      setSyncResult(json.data);
      fetchProviders();
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#f87171" }}>
        <p>{error}</p>
        <button className="admin-btn admin-btn-primary" onClick={fetchProviders}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page-form" style={{ maxWidth: "none" }}>
      {/* ── Header ── */}
      <div className="admin-page-form-header">
        <h2 style={{ margin: 0 }}><LinkIcon size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> المصادر والمزودين</h2>
      </div>

      {/* ── SD Unlocker status card ── */}
      <div className="admin-card" style={{ padding: "1.25rem" }}>
        <div className="admin-source-header">
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem" }}>
              SD Unlocker
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: data?.sdUnlocker.connected ? "#22c55e" : "#ef4444",
                  marginRight: "0.5rem",
                  verticalAlign: "middle",
                }}
              />
            </h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--admin-muted)", wordBreak: "break-all" }}>
              {data?.sdUnlocker.connected ? "متصل" : "غير متصل"} — {data?.sdUnlocker.endpoint}
            </p>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSync}
            disabled={syncing || !data?.sdUnlocker.connected}
            style={{ whiteSpace: "nowrap" }}
          >
            {syncing ? "جاري المزامنة..." : <><RefreshCw size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> مزامنة المنتجات</>}
          </button>
        </div>

        {syncResult && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: 10,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              fontSize: "0.9rem",
            }}
          >
            <strong><CheckCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تمت المزامنة بنجاح</strong>
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <span>المجموعات: {syncResult.groups.created} جديد, {syncResult.groups.updated} محدث</span>
              <span>الخدمات: {syncResult.services.created} جديد, {syncResult.services.updated} محدث</span>
              <span>إجمالي المجموعات: {syncResult.totalGroups}</span>
            </div>
          </div>
        )}

        {syncError && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: 10,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
              fontSize: "0.9rem",
            }}
          >
            <XCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> {syncError}
          </div>
        )}
      </div>

      {/* ── Products summary ── */}
      <div className="dash-grid-3">
        <div className="admin-card admin-stat-card">
          <div className="admin-stat-num" style={{ color: "var(--admin-accent)" }}>
            {data?.products.total ?? 0}
          </div>
          <div className="admin-stat-label">
            إجمالي المنتجات
          </div>
        </div>
        <div className="admin-card admin-stat-card">
          <div className="admin-stat-num" style={{ color: "#22c55e" }}>
            {data?.products.synced ?? 0}
          </div>
          <div className="admin-stat-label">
            متصل بالمصدر
          </div>
        </div>
        <div className="admin-card admin-stat-card">
          <div className="admin-stat-num" style={{ color: "#f59e0b" }}>
            {data?.products.manual ?? 0}
          </div>
          <div className="admin-stat-label">
            يدوي (منفصل)
          </div>
        </div>
      </div>

      {/* ── Providers table ── */}
      <div className="admin-card" style={{ padding: "1.25rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>المزودون</h3>

        {!data?.providers.length ? (
          <p style={{ textAlign: "center", color: "var(--admin-muted)", padding: "2rem 0" }}>
            لا يوجد مزودون حتى الآن
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المفتاح</th>
                  <th>الاسم</th>
                  <th>الرصيد</th>
                  <th>الطلبات</th>
                  <th>تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {data.providers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code style={{ background: "rgba(var(--admin-accent-rgb, 99,102,241),0.1)", padding: "2px 8px", borderRadius: 6, fontSize: "0.85rem" }}>
                        {p.key}
                      </code>
                    </td>
                    <td>{p.name}</td>
                    <td style={{ fontFamily: "monospace" }}>${(p.balanceCents / 100).toFixed(2)}</td>
                    <td>{p._count.orders}</td>
                    <td style={{ fontSize: "0.85rem", color: "var(--admin-muted)" }}>
                      {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Info box ── */}
      <div
        className="admin-card"
        style={{
          padding: "1.25rem",
          background: "rgba(99,102,241,0.05)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}><Info size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> كيف تعمل المصادر؟</h4>
        <ul style={{ margin: 0, paddingRight: "1.2rem", lineHeight: 1.9, fontSize: "0.85rem", color: "var(--admin-muted)" }}>
          <li>المنتجات المتصلة بالمصدر يتم تنفيذ طلباتها تلقائياً عبر SD Unlocker.</li>
          <li>يمكن فصل أي منتج من المصدر من صفحة المنتجات — عندها الأدمن يستلم الطلبات يدويا.</li>
          <li>المنتجات اليدوية (التي يتم إنشاؤها من إضافة منتج) تكون منفصلة عن المصدر تلقائياً.</li>
          <li>زر المزامنة يحدث المنتجات من المصدر دون حذف المنتجات اليدوية أو تعديل إعداداتك.</li>
        </ul>
      </div>
    </div>
  );
}
