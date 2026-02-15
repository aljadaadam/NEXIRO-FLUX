"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle, Users, RefreshCw, Wallet, Ban, Trash2,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  whatsapp: string | null;
  country: string | null;
  verificationStatus: string;
  balanceCents: number;
  currency: string;
  banned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  _count: { orders: number; topUpInvoices: number };
}

const verificationLabels: Record<string, string> = {
  UNVERIFIED: "غير موثق",
  PENDING: "قيد المراجعة",
  VERIFIED: "موثق",
};

const verificationBadge: Record<string, string> = {
  UNVERIFIED: "badge-unverified",
  PENDING: "badge-pending",
  VERIFIED: "badge-verified",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceNote, setBalanceNote] = useState("");
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  const getAdminKey = () => localStorage.getItem("admin_key") ?? "";

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (verificationFilter) params.set("verification", verificationFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل المستخدمين");
      setUsers(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [verificationFilter]);

  const updateVerification = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verification`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ verificationStatus: status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل التحديث");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verificationStatus: status } : u))
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  const adjustBalance = async () => {
    if (!selectedUser || !balanceAmount) return;
    setUpdatingBalance(true);
    try {
      const amountCents = Math.round(parseFloat(balanceAmount) * 100);
      const res = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ amountCents, note: balanceNote || undefined }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تعديل الرصيد");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, balanceCents: u.balanceCents + amountCents }
            : u
        )
      );
      setSelectedUser(null);
      setBalanceAmount("");
      setBalanceNote("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingBalance(false);
    }
  };

  const toggleBan = async (user: User) => {
    const newBanned = !user.banned;
    const confirmed = confirm(
      newBanned
        ? `هل تريد حظر "${user.fullName || user.email}"؟`
        : `هل تريد إلغاء حظر "${user.fullName || user.email}"؟`
    );
    if (!confirmed) return;

    setBanningUserId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ banned: newBanned }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل التحديث");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, banned: newBanned, bannedAt: newBanned ? new Date().toISOString() : null, banReason: newBanned ? "حظر بواسطة الأدمن" : null }
            : u
        )
      );
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBanningUserId(null);
    }
  };

  const deleteUser = async () => {
    if (!confirmDeleteUser) return;
    setDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${confirmDeleteUser.id}/delete`, {
        method: "DELETE",
        headers: {
          "x-admin-key": getAdminKey(),
        },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل الحذف");
      setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUser.id));
      setConfirmDeleteUser(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeletingUser(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(s) ||
      (u.fullName ?? "").toLowerCase().includes(s) ||
      (u.whatsapp ?? "").includes(s) ||
      u.id.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
        <p>{error}</p>
        <button className="admin-btn admin-btn-primary" onClick={fetchUsers}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3><Users size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> المستخدمون ({filtered.length})</h3>
          <div className="admin-table-filters">
            <input
              className="admin-input"
              placeholder="بحث بالاسم أو الايميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <select
              className="admin-select"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="">الكل</option>
              <option value="UNVERIFIED">غير موثق</option>
              <option value="PENDING">قيد المراجعة</option>
              <option value="VERIFIED">موثق</option>
            </select>
            <button className="admin-btn admin-btn-sm" onClick={fetchUsers}>
              <RefreshCw size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تحديث
            </button>
          </div>
        </div>

        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>واتساب</th>
                <th>الدولة</th>
                <th>الرصيد</th>
                <th>الطلبات</th>
                <th>التحقق</th>
                <th>تاريخ التسجيل</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.35)" }}>
                    لا يوجد مستخدمون
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {u.fullName || "—"}
                        {u.banned && (
                          <span style={{
                            display: "inline-block",
                            marginRight: "0.4rem",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            background: "rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}>
                            محظور
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                        {u.email}
                      </div>
                    </td>
                    <td>{u.whatsapp || "—"}</td>
                    <td>{u.country || "—"}</td>
                    <td style={{ fontWeight: 600, color: "#4ade80" }}>
                      {formatCents(u.balanceCents)}
                    </td>
                    <td>{u._count.orders}</td>
                    <td>
                      <select
                        className="admin-select"
                        value={u.verificationStatus}
                        onChange={(e) => updateVerification(u.id, e.target.value)}
                        style={{ fontSize: "0.82rem" }}
                      >
                        <option value="UNVERIFIED">غير موثق</option>
                        <option value="PENDING">قيد المراجعة</option>
                        <option value="VERIFIED">موثق</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-primary"
                          onClick={() => {
                            setSelectedUser(u);
                            setBalanceAmount("");
                            setBalanceNote("");
                          }}
                        >
                          <Wallet size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> رصيد
                        </button>
                        <button
                          className={`admin-btn admin-btn-sm ${u.banned ? "" : "admin-btn-danger"}`}
                          style={u.banned ? { background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" } : { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                          onClick={() => toggleBan(u)}
                          disabled={banningUserId === u.id}
                        >
                          <Ban size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} />
                          {banningUserId === u.id ? "..." : u.banned ? "إلغاء الحظر" : "حظر"}
                        </button>
                        <button
                          className="admin-btn admin-btn-sm"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                          onClick={() => setConfirmDeleteUser(u)}
                        >
                          <Trash2 size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3><Wallet size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> تعديل الرصيد</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
              {selectedUser.fullName || selectedUser.email}
              <br />
              الرصيد الحالي: <strong style={{ color: "#4ade80" }}>{formatCents(selectedUser.balanceCents)}</strong>
            </p>

            <div className="admin-form-group">
              <label>المبلغ (بالدولار) — موجب للإضافة، سالب للخصم</label>
              <input
                className="admin-input"
                type="number"
                step="0.01"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="مثال: 10.00 أو -5.50"
              />
            </div>

            <div className="admin-form-group">
              <label>ملاحظة (اختياري)</label>
              <input
                className="admin-input"
                value={balanceNote}
                onChange={(e) => setBalanceNote(e.target.value)}
                placeholder="سبب التعديل..."
              />
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={adjustBalance}
                disabled={updatingBalance || !balanceAmount}
              >
                {updatingBalance ? "جاري التنفيذ..." : "تأكيد"}
              </button>
              <button className="admin-btn" onClick={() => setSelectedUser(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDeleteUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3><Trash2 size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem", color: "#ef4444" }} /> تأكيد الحذف</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", margin: "0.5rem 0 1rem" }}>
              هل أنت متأكد من حذف المستخدم{" "}
              <strong style={{ color: "#fff" }}>{confirmDeleteUser.fullName || confirmDeleteUser.email}</strong>؟
              <br />
              <span style={{ color: "#ef4444", fontSize: "0.82rem" }}>
                سيتم حذف جميع بياناته بشكل نهائي ولا يمكن التراجع.
              </span>
            </p>

            <div className="admin-modal-actions">
              <button
                className="admin-btn"
                style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                onClick={deleteUser}
                disabled={deletingUser}
              >
                {deletingUser ? "جاري الحذف..." : "حذف نهائي"}
              </button>
              <button className="admin-btn" onClick={() => setConfirmDeleteUser(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
