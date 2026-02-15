"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle, ShoppingCart, RefreshCw, CheckCircle, XCircle,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: number | null;
  status: number;
  groupName: string;
  serviceName: string;
  serviceNameAr: string | null;
  unitPriceCents: number;
  quantity: number | null;
  totalPriceCents: number;
  eta: string | null;
  note: string | null;
  inputJson: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; email: string; fullName: string | null };
}

function inputFieldPairs(json: Record<string, unknown> | null | undefined): Array<{ label: string; value: string }> {
  if (!json || typeof json !== "object") return [];
  return Object.entries(json)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => ({ label: k, value: String(v) }));
}

const statusLabels: Record<number, string> = {
  1: "بانتظار",
  2: "قيد المعالجة",
  3: "مكتمل",
  4: "فشل",
  5: "ملغي",
};

const statusBadge: Record<number, string> = {
  1: "badge-waiting",
  2: "badge-processing",
  3: "badge-completed",
  4: "badge-failed",
  5: "badge-canceled",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ orderId: string; action: "complete" | "reject" } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionSaving, setActionSaving] = useState(false);

  const getAdminKey = () => localStorage.getItem("admin_key") ?? "";

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل الطلبات");
      setOrders(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId: string, newStatus: number, note?: string) => {
    setUpdatingId(orderId);
    try {
      const payload: Record<string, unknown> = { status: newStatus };
      if (note) payload.note = note;
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحديث الحالة");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, note: note ?? o.note } : o))
      );
    } catch (e: any) {
      alert(e.message);
      throw e;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdminAction = async () => {
    if (!actionModal) return;
    setActionSaving(true);
    const newStatus = actionModal.action === "complete" ? 3 : 4;
    try {
      await updateStatus(actionModal.orderId, newStatus, actionNote || undefined);
      setActionModal(null);
      setActionNote("");
    } catch {
      // modal stays open so user can retry
    } finally {
      setActionSaving(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (o.orderNumber?.toString() ?? "").includes(s) ||
      o.serviceName.toLowerCase().includes(s) ||
      (o.serviceNameAr ?? "").toLowerCase().includes(s) ||
      o.user.email.toLowerCase().includes(s) ||
      (o.user.fullName ?? "").toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>جاري تحميل الطلبات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
        <p>{error}</p>
        <button className="admin-btn admin-btn-primary" onClick={fetchOrders}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3><ShoppingCart size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> الطلبات ({filtered.length})</h3>
          <div className="admin-table-filters">
            <input
              className="admin-input"
              placeholder="بحث برقم الطلب أو الاسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">كل الحالات</option>
              <option value="1">بانتظار</option>
              <option value="2">قيد المعالجة</option>
              <option value="3">مكتمل</option>
              <option value="4">فشل</option>
              <option value="5">ملغي</option>
            </select>
            <button className="admin-btn admin-btn-sm" onClick={fetchOrders}>
              <RefreshCw size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تحديث
            </button>
          </div>
        </div>

        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المستخدم</th>
                <th>الخدمة</th>
                <th>الحقول</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>ملاحظة</th>
                <th>تحديث الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.35)" }}>
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const fields = inputFieldPairs(o.inputJson);
                  const isExpanded = expandedId === o.id;
                  return (
                  <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                    <td style={{ fontWeight: 700 }}>
                      {o.orderNumber ?? "—"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.user.fullName || "—"}</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                        {o.user.email}
                      </div>
                    </td>
                    <td>
                      <div>{o.serviceNameAr || o.serviceName}</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                        {o.groupName}
                      </div>
                    </td>
                    <td>
                      {fields.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {fields.slice(0, isExpanded ? fields.length : 2).map((f) => (
                            <div key={f.label} style={{ display: "flex", gap: "0.35rem", fontSize: "0.82rem", flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{f.label}:</span>
                              <span style={{ direction: "ltr", color: "rgba(255,255,255,0.85)", wordBreak: "break-all" }}>{f.value}</span>
                            </div>
                          ))}
                          {!isExpanded && fields.length > 2 && (
                            <span style={{ fontSize: "0.75rem", color: "#a78bfa", cursor: "pointer" }}
                              onClick={(e) => { e.stopPropagation(); setExpandedId(o.id); }}>
                              +{fields.length - 2} المزيد
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: "#4ade80" }}>
                      {formatCents(o.totalPriceCents)}
                    </td>
                    <td>
                      <span className={`admin-badge ${statusBadge[o.status] ?? ""}`}>
                        {statusLabels[o.status] ?? o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
                      {formatDate(o.createdAt)}
                    </td>
                    <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {o.note || "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
                        {/* Quick action buttons — visible when order is not yet final */}
                        {(o.status === 1 || o.status === 2) && (
                          <>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-success"
                              disabled={updatingId === o.id}
                              onClick={() => { setActionModal({ orderId: o.id, action: "complete" }); setActionNote(""); }}
                              title="إكمال الطلب يدوياً"
                            >
                              <CheckCircle size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> إكمال
                            </button>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              disabled={updatingId === o.id}
                              onClick={() => { setActionModal({ orderId: o.id, action: "reject" }); setActionNote(""); }}
                              title="رفض الطلب يدوياً"
                            >
                              <XCircle size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> رفض
                            </button>
                          </>
                        )}
                        <select
                          className="admin-select"
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => updateStatus(o.id, Number(e.target.value))}
                          style={{ fontSize: "0.82rem", minWidth: 100 }}
                        >
                          <option value={1}>بانتظار</option>
                          <option value={2}>قيد المعالجة</option>
                          <option value={3}>مكتمل</option>
                          <option value={4}>فشل</option>
                          <option value={5}>ملغي</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Admin Action Modal ─── */}
      {actionModal && (
        <div className="admin-modal-overlay" onClick={() => !actionSaving && setActionModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3>
              {actionModal.action === "complete" ? <><CheckCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> إكمال الطلب يدوياً</> : <><XCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> رفض الطلب يدوياً</>}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", margin: "0.5rem 0 0.3rem" }}>
              طلب #{orders.find((o) => o.id === actionModal.orderId)?.orderNumber ?? "—"}
              {" — "}
              {orders.find((o) => o.id === actionModal.orderId)?.serviceNameAr ||
                orders.find((o) => o.id === actionModal.orderId)?.serviceName}
            </p>
            {actionModal.action === "complete" && (
              <p style={{ color: "#4ade80", fontSize: "0.85rem", margin: "0.3rem 0 0.8rem" }}>
                سيتم إكمال الطلب وإيقاف المعالجة في المصدر.
              </p>
            )}
            {actionModal.action === "reject" && (
              <p style={{ color: "#f87171", fontSize: "0.85rem", margin: "0.3rem 0 0.8rem" }}>
                سيتم رفض الطلب واسترجاع المبلغ للمستخدم والمزود، وإيقاف المعالجة في المصدر.
              </p>
            )}
            <textarea
              className="admin-input"
              placeholder={actionModal.action === "complete" ? "ملاحظة / كود النتيجة (اختياري)..." : "سبب الرفض (اختياري)..."}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={3}
              style={{ width: "100%", resize: "vertical", marginBottom: "1rem" }}
            />
            <div className="admin-modal-actions">
              <button
                className={`admin-btn ${actionModal.action === "complete" ? "admin-btn-success" : "admin-btn-danger"}`}
                onClick={handleAdminAction}
                disabled={actionSaving}
              >
                {actionSaving
                  ? "جاري المعالجة..."
                  : actionModal.action === "complete"
                    ? <><CheckCircle size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تأكيد الإكمال</>
                    : <><XCircle size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تأكيد الرفض</>}
              </button>
              <button
                className="admin-btn"
                onClick={() => setActionModal(null)}
                disabled={actionSaving}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
