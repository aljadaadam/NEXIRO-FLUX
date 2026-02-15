"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle, RefreshCw, Save, CreditCard, Landmark, Bitcoin,
  Wallet, CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp,
} from "lucide-react";

/* ─── Types ─── */

interface PaymentSettings {
  bank: { name: string; beneficiary: string; iban: string; note: string; usdRate: string };
  usdt: { network: string; address: string; memo: string };
  binance: { payId: string; receiver: string; note: string };
}

interface TopupInvoice {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  transactionNumber: string | null;
  details: Record<string, unknown> | null;
  receipt: { name: string; mime: string | null; uploadedAt: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Helpers ─── */

const gatewayLabels: Record<string, string> = {
  BANK: "تحويل بنكي",
  USDT: "USDT",
  BINANCE: "Binance",
  PAYPAL: "PayPal",
};

const statusLabels: Record<string, string> = {
  CREATED: "جديدة",
  AWAITING_PAYMENT: "بانتظار الدفع",
  RECEIPT_UPLOADED: "إيصال مرفوع",
  COMPLETED: "مكتملة",
  REJECTED: "مرفوضة",
};

const statusColors: Record<string, string> = {
  CREATED: "#94a3b8",
  AWAITING_PAYMENT: "#f59e0b",
  RECEIPT_UPLOADED: "#3b82f6",
  COMPLETED: "#22c55e",
  REJECTED: "#ef4444",
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Component ─── */

export default function AdminPaymentGatewaysScreen() {
  const getAdminKey = () => localStorage.getItem("admin_key") ?? "";

  /* ── Settings state ── */
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  /* ── Invoices state ── */
  const [invoices, setInvoices] = useState<TopupInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("RECEIPT_UPLOADED");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  /* ── Section collapse ── */
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [invoicesOpen, setInvoicesOpen] = useState(true);

  /* ── Fetch settings ── */
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل إعدادات الدفع");
      setSettings(json.data);
    } catch (e: any) {
      setSettingsError(e.message);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  /* ── Save settings ── */
  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل حفظ الإعدادات");
      setSaveMsg("تم حفظ الإعدادات بنجاح");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Fetch invoices ── */
  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/topup-invoices?${params.toString()}`, {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل الفواتير");
      setInvoices(json.data);
    } catch (e: any) {
      setInvoicesError(e.message);
    } finally {
      setInvoicesLoading(false);
    }
  }, [statusFilter]);

  /* ── Approve invoice ── */
  const approveInvoice = async (id: string) => {
    if (!confirm("هل أنت متأكد من الموافقة على هذه الفاتورة؟")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/topup-invoices/${id}/approve`, {
        method: "POST",
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشلت الموافقة");
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "COMPLETED" } : inv))
      );
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Reject invoice ── */
  const rejectInvoice = async (id: string) => {
    if (!confirm("هل أنت متأكد من رفض هذه الفاتورة؟")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/topup-invoices/${id}/reject`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ reason: rejectReason || undefined }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل الرفض");
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "REJECTED" } : inv))
      );
      setRejectReason("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  /* ── Field updater ── */
  const updateField = (
    gateway: "bank" | "usdt" | "binance",
    field: string,
    value: string
  ) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [gateway]: { ...prev[gateway], [field]: value },
      };
    });
  };

  /* ── Render ── */

  if (settingsLoading && invoicesLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ═══════════════════════ Payment Settings Section ═══════════════════════ */}
      <div className="admin-table-wrap">
        <div
          className="admin-table-header"
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setSettingsOpen((v) => !v)}
        >
          <h3>
            <CreditCard size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} />
            إعدادات بوابات الدفع
          </h3>
          <span>{settingsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
        </div>

        {settingsOpen && (
          <div style={{ padding: "1.2rem" }}>
            {settingsError ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
                <p>{settingsError}</p>
                <button className="admin-btn admin-btn-primary" onClick={fetchSettings}>
                  إعادة المحاولة
                </button>
              </div>
            ) : settings ? (
              <>
                {/* ── Bank ── */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem", color: "#e2e8f0" }}>
                    <Landmark size={16} /> التحويل البنكي
                  </h4>
                  <div className="settings-grid">
                    <div className="admin-form-group">
                      <label>اسم البنك</label>
                      <input
                        className="admin-input"
                        value={settings.bank.name}
                        onChange={(e) => updateField("bank", "name", e.target.value)}
                        placeholder="مثال: بنك الخرطوم"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>اسم المستفيد</label>
                      <input
                        className="admin-input"
                        value={settings.bank.beneficiary}
                        onChange={(e) => updateField("bank", "beneficiary", e.target.value)}
                        placeholder="اسم صاحب الحساب"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>رقم الآيبان / الحساب</label>
                      <input
                        className="admin-input"
                        value={settings.bank.iban}
                        onChange={(e) => updateField("bank", "iban", e.target.value)}
                        placeholder="SA00 0000 0000 0000"
                        dir="ltr"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>ملاحظة التحويل</label>
                      <input
                        className="admin-input"
                        value={settings.bank.note}
                        onChange={(e) => updateField("bank", "note", e.target.value)}
                        placeholder="ضع رقم الفاتورة في ملاحظة التحويل"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>سعر الدولار (SDG)</label>
                      <input
                        className="admin-input"
                        type="number"
                        value={settings.bank.usdRate}
                        onChange={(e) => updateField("bank", "usdRate", e.target.value)}
                        placeholder="3650"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* ── USDT ── */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem", color: "#e2e8f0" }}>
                    <Bitcoin size={16} /> USDT
                  </h4>
                  <div className="settings-grid">
                    <div className="admin-form-group">
                      <label>الشبكة</label>
                      <input
                        className="admin-input"
                        value={settings.usdt.network}
                        onChange={(e) => updateField("usdt", "network", e.target.value)}
                        placeholder="BSC (BEP-20)"
                        dir="ltr"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>عنوان المحفظة</label>
                      <input
                        className="admin-input"
                        value={settings.usdt.address}
                        onChange={(e) => updateField("usdt", "address", e.target.value)}
                        placeholder="0x..."
                        dir="ltr"
                        style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Memo (اختياري)</label>
                      <input
                        className="admin-input"
                        value={settings.usdt.memo}
                        onChange={(e) => updateField("usdt", "memo", e.target.value)}
                        placeholder="غير مطلوب"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Binance ── */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem", color: "#e2e8f0" }}>
                    <Wallet size={16} /> Binance
                  </h4>
                  <div className="settings-grid">
                    <div className="admin-form-group">
                      <label>Binance Pay ID</label>
                      <input
                        className="admin-input"
                        value={settings.binance.payId}
                        onChange={(e) => updateField("binance", "payId", e.target.value)}
                        placeholder="123456789"
                        dir="ltr"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>اسم المستقبل</label>
                      <input
                        className="admin-input"
                        value={settings.binance.receiver}
                        onChange={(e) => updateField("binance", "receiver", e.target.value)}
                        placeholder="COMFORT ZONE"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>ملاحظة</label>
                      <input
                        className="admin-input"
                        value={settings.binance.note}
                        onChange={(e) => updateField("binance", "note", e.target.value)}
                        placeholder="ضع رقم الفاتورة في الملاحظة"
                      />
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.5rem" }}>
                  <button
                    className="admin-btn admin-btn-primary admin-btn-lg"
                    onClick={saveSettings}
                    disabled={saving}
                  >
                    <Save size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} />
                    {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </button>
                  {saveMsg && (
                    <span style={{
                      fontSize: "0.85rem",
                      color: saveMsg.includes("بنجاح") ? "#22c55e" : "#ef4444",
                    }}>
                      {saveMsg}
                    </span>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* ═══════════════════════ Pending Invoices Section ═══════════════════════ */}
      <div className="admin-table-wrap">
        <div
          className="admin-table-header"
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setInvoicesOpen((v) => !v)}
        >
          <h3>
            <Clock size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} />
            فواتير الشحن
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {invoices.filter((i) => i.status === "RECEIPT_UPLOADED").length > 0 && (
              <span style={{
                background: "#3b82f6",
                color: "#fff",
                padding: "0.15rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}>
                {invoices.filter((i) => i.status === "RECEIPT_UPLOADED").length} بانتظار الموافقة
              </span>
            )}
            {invoicesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {invoicesOpen && (
          <div>
            {/* Filters */}
            <div style={{ padding: "0.8rem 1.2rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">الكل</option>
                <option value="AWAITING_PAYMENT">بانتظار الدفع</option>
                <option value="RECEIPT_UPLOADED">إيصال مرفوع</option>
                <option value="COMPLETED">مكتملة</option>
                <option value="REJECTED">مرفوضة</option>
              </select>
              <button className="admin-btn admin-btn-sm" onClick={fetchInvoices}>
                <RefreshCw size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تحديث
              </button>
            </div>

            {invoicesLoading ? (
              <div className="admin-loading" style={{ padding: "2rem" }}>
                <div className="admin-spinner" />
              </div>
            ) : invoicesError ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
                <p>{invoicesError}</p>
                <button className="admin-btn admin-btn-primary" onClick={fetchInvoices}>
                  إعادة المحاولة
                </button>
              </div>
            ) : invoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.35)" }}>
                لا توجد فواتير
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>المرجع</th>
                      <th>المستخدم</th>
                      <th>البوابة</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                      <th>رقم المعاملة</th>
                      <th>التاريخ</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <>
                        <tr key={inv.id}>
                          <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                            {inv.reference}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{inv.userName || "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                              {inv.userEmail}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: "0.15rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              background: "rgba(255,255,255,0.06)",
                            }}>
                              {gatewayLabels[inv.gateway] ?? inv.gateway}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: "#4ade80" }}>
                            ${inv.amount.toFixed(2)}
                          </td>
                          <td>
                            <span style={{
                              padding: "0.15rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: statusColors[inv.status] ?? "#94a3b8",
                              background: `${statusColors[inv.status] ?? "#94a3b8"}18`,
                            }}>
                              {statusLabels[inv.status] ?? inv.status}
                            </span>
                          </td>
                          <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                            {inv.transactionNumber || "—"}
                          </td>
                          <td style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
                            {formatDate(inv.createdAt)}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                              {/* Details toggle */}
                              <button
                                className="admin-btn admin-btn-sm"
                                onClick={() =>
                                  setExpandedInvoice((prev) =>
                                    prev === inv.id ? null : inv.id
                                  )
                                }
                                title="تفاصيل"
                              >
                                <Eye size={13} />
                              </button>

                              {/* Approve */}
                              {(inv.status === "RECEIPT_UPLOADED" || inv.status === "AWAITING_PAYMENT") && (
                                <button
                                  className="admin-btn admin-btn-sm admin-btn-success"
                                  onClick={() => approveInvoice(inv.id)}
                                  disabled={actionLoading === inv.id}
                                  title="موافقة"
                                >
                                  <CheckCircle size={13} />
                                </button>
                              )}

                              {/* Reject */}
                              {inv.status !== "COMPLETED" && inv.status !== "REJECTED" && (
                                <button
                                  className="admin-btn admin-btn-sm admin-btn-danger"
                                  onClick={() => rejectInvoice(inv.id)}
                                  disabled={actionLoading === inv.id}
                                  title="رفض"
                                >
                                  <XCircle size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {expandedInvoice === inv.id && (
                          <tr key={`${inv.id}-details`}>
                            <td colSpan={8} style={{ padding: 0 }}>
                              <div style={{
                                background: "rgba(255,255,255,0.03)",
                                padding: "1rem 1.2rem",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                              }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.8rem" }}>
                                  <div>
                                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>معرف الفاتورة</span>
                                    <div style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{inv.id}</div>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>معرف المستخدم</span>
                                    <div style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{inv.userId}</div>
                                  </div>
                                  {inv.receipt && (
                                    <div>
                                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>الإيصال</span>
                                      <div style={{ fontSize: "0.82rem" }}>
                                        {inv.receipt.name}
                                        {inv.receipt.uploadedAt && (
                                          <span style={{ marginRight: "0.5rem", color: "rgba(255,255,255,0.4)" }}>
                                            ({formatDate(inv.receipt.uploadedAt)})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {inv.details && (
                                    <div style={{ gridColumn: "1 / -1" }}>
                                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>تفاصيل الدفع</span>
                                      <pre style={{
                                        margin: "0.3rem 0 0",
                                        padding: "0.6rem",
                                        background: "rgba(0,0,0,0.3)",
                                        borderRadius: "8px",
                                        fontSize: "0.78rem",
                                        color: "rgba(255,255,255,0.7)",
                                        overflowX: "auto",
                                        direction: "ltr",
                                        textAlign: "left",
                                      }}>
                                        {JSON.stringify(inv.details, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>

                                {/* Reject reason input (only shown for non-completed/non-rejected) */}
                                {inv.status !== "COMPLETED" && inv.status !== "REJECTED" && (
                                  <div style={{ marginTop: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <input
                                      className="admin-input"
                                      placeholder="سبب الرفض (اختياري)..."
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      style={{ maxWidth: 300 }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 0.8rem;
        }
      `}</style>
    </div>
  );
}
