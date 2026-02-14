"use client";

import * as React from "react";
import Link from "next/link";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";

type OrdersApiRow = {
  id: string;
  orderNumber?: number | null;
  status: number;
  statusLabel: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED" | string;
  createdAt: string;
  updatedAt?: string;
  groupName?: string;
  serviceType?: string;
  serviceName?: string;
  totalPriceCents?: number;
  eta?: string;
  quantity?: number;
  customFields?: Record<string, unknown>;
};

type OrdersApiResponse =
  | { ok: true; data: OrdersApiRow[] }
  | { ok: false; error?: { message?: string } };

function formatOrderNumber(n: unknown): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return String(Math.max(0, Math.trunc(n))).padStart(6, "0");
}

function formatDateTime(value: string | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function statusLabelAr(key: string): string {
  switch (key) {
    case "WAITING":
      return "قيد الانتظار";
    case "PROCESSING":
      return "قيد المعالجة";
    case "COMPLETED":
      return "مكتمل";
    case "FAILED":
      return "فشل";
    case "CANCELED":
      return "ملغي";
    default:
      return key;
  }
}

function statusTone(key: string): "success" | "warning" | "error" | "muted" {
  switch (key) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
      return "warning";
    case "FAILED":
    case "CANCELED":
      return "error";
    default:
      return "muted";
  }
}

function moneyFromCents(cents: unknown): string {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return "—";
  const v = cents / 100;
  return new Intl.NumberFormat("ar", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + " USD";
}

function normalizeFieldKey(key: string): string {
  return key.trim().replace(/\s+/g, " ");
}

function isSensitiveKey(key: string): boolean {
  const k = key.trim().toLowerCase();
  return k.includes("password") || k === "pass" || k.includes("secret") || k.includes("token");
}

function fieldLabelAr(fieldKeyRaw: string): string {
  const key = normalizeFieldKey(fieldKeyRaw);
  const k = key.toLowerCase();

  // Common custom fields
  if (k === "imei" || k.includes("imei")) return "رقم IMEI";
  if (k === "server") return "البيانات المطلوبة";
  if (k === "playerid" || k === "player_id" || k === "player id" || k.includes("player")) return "رقم اللاعب";
  if (k.includes("username") || k === "user") return "اسم المستخدم";
  if (k.includes("email")) return "البريد الإلكتروني";
  if (k.includes("phone") || k.includes("mobile") || k.includes("whatsapp")) return "رقم الهاتف";
  if (k === "serial" || k === "sn" || k.includes("serial") || k.includes("s/n")) return "السيريال";
  if (k.includes("code")) return "الكود";
  if (k.includes("id") && !k.includes("imei") && !k.includes("player")) return "المعرّف";

  return key || "حقل";
}

function maskValue(value: unknown, key?: string): string {
  const s = String(value ?? "").trim();
  if (!s) return "—";
  if (key && isSensitiveKey(key)) return "***";
  // keep short values as-is; trim very long ones
  if (s.length <= 60) return s;
  return `${s.slice(0, 30)}…${s.slice(-10)}`;
}

function customFieldsPairs(customFields: Record<string, unknown> | undefined): Array<{ label: string; value: string }> {
  if (!customFields) return [];
  const entries: Array<{ label: string; value: string }> = [];

  for (const [rawKey, rawValue] of Object.entries(customFields)) {
    const key = normalizeFieldKey(rawKey);
    if (!key) continue;
    const value = maskValue(rawValue, key);
    if (value === "—") continue;
    entries.push({ label: fieldLabelAr(key), value });
  }

  // stable-ish ordering
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

function customFieldsShort(customFields: Record<string, unknown> | undefined): {
  items: Array<{ label: string; value: string }>;
  moreCount: number;
} {
  const pairs = customFieldsPairs(customFields);
  const items = pairs.slice(0, 2);
  return { items, moreCount: Math.max(0, pairs.length - items.length) };
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

export default function OrdersScreen() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<OrdersApiRow[]>([]);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<OrdersApiRow | null>(null);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("ALL");
  const [serviceType, setServiceType] = React.useState<string>("ALL");

  const token = typeof window === "undefined" ? null : localStorage.getItem("auth_token");

  const serviceTypes = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const t = (r.serviceType ?? "").trim();
      if (t) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  async function load() {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const url = new URL("/api/orders/me", window.location.origin);
      if (status !== "ALL") url.searchParams.set("status", status);
      if (serviceType !== "ALL") url.searchParams.set("serviceType", serviceType);

      const res = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = (await res.json()) as OrdersApiResponse;
      if (!res.ok || !data?.ok) {
        setRows([]);
        setError((data as any)?.error?.message || "تعذر تحميل الطلبات");
        return;
      }

      setRows(Array.isArray(data.data) ? data.data : []);
    } catch {
      setRows([]);
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, serviceType, token]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const orderNo = formatOrderNumber(r.orderNumber) ?? "";
      const fields = customFieldsPairs(r.customFields)
        .map((p) => `${p.label}: ${p.value}`)
        .join(" | ");
      const hay = [
        orderNo,
        r.id,
        r.serviceName ?? "",
        r.serviceType ?? "",
        statusLabelAr(r.statusLabel),
        fields,
      ]
        .join(" | ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  function openDetails(row: OrdersApiRow) {
    setSelected(row);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelected(null);
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
        <section className="card" style={{ padding: "1.25rem" }}>
          <div className="orders-head">
            <div>
              <div className="orders-title">طلباتي</div>
            </div>
            <button className="orders-refresh" type="button" onClick={() => void load()} disabled={loading || !token}>
              {loading ? "جاري التحديث..." : "تحديث"}
            </button>
          </div>

          {!token ? (
            <div className="orders-empty">
              <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>يلزم تسجيل الدخول لعرض الطلبات</div>
              <div className="small" style={{ marginTop: 6 }}>
                انتقل إلى الملف الشخصي لتسجيل الدخول.
              </div>
              <div style={{ marginTop: 14 }}>
                <Link className="orders-loginBtn" href="/profile">
                  الذهاب للملف الشخصي
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="orders-filters">
                <div className="orders-filter">
                  <div className="orders-filterLabel">بحث</div>
                  <input
                    className="orders-input"
                    placeholder="ابحث برقم الطلب، اسم المنتج، النوع..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="orders-filter">
                  <div className="orders-filterLabel">الحالة</div>
                  <select className="orders-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ALL">الكل</option>
                    <option value="1">قيد الانتظار</option>
                    <option value="2">قيد المعالجة</option>
                    <option value="3">مكتمل</option>
                    <option value="4">فشل</option>
                    <option value="5">ملغي</option>
                  </select>
                </div>

                <div className="orders-filter">
                  <div className="orders-filterLabel">النوع</div>
                  <select className="orders-input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                    <option value="ALL">الكل</option>
                    {serviceTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error ? <div className="orders-error">{error}</div> : null}

              <div className="orders-meta">
                <div>
                  الإجمالي: <span style={{ fontWeight: 1000 }}>{rows.length}</span>
                  {search.trim() ? (
                    <>
                      {" "}— النتائج: <span style={{ fontWeight: 1000 }}>{filtered.length}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="orders-empty">لا توجد طلبات مطابقة.</div>
              ) : (
                <div className="orders-table">
                  <div className="orders-row orders-rowHead">
                    <div>رقم الطلب</div>
                    <div>الخدمة</div>
                    <div>الحقول</div>
                    <div>الحالة</div>
                    <div>التاريخ</div>
                    <div>المبلغ</div>
                  </div>

                  {filtered.map((o) => {
                    const tone = statusTone(o.statusLabel);
                    const orderNo = formatOrderNumber(o.orderNumber);
                    const short = customFieldsShort(o.customFields);

                    return (
                      <button key={o.id} className="orders-row orders-rowBody" type="button" onClick={() => openDetails(o)}>
                        <div className="orders-cell">
                          <div className="orders-orderNo">{orderNo ?? "—"}</div>
                        </div>

                        <div className="orders-cell">
                          <div className="orders-serviceName">{o.serviceName ?? "—"}</div>
                        </div>

                        <div className="orders-cell orders-cell--fields">
                          {short.items.length ? (
                            <div className="orders-fieldsList" aria-label="الحقول المقدمة">
                              {short.items.map((p) => (
                                <div key={`${o.id}:${p.label}`} className="orders-fieldChip">
                                  <span className="orders-fieldChipLabel">{p.label}</span>
                                  <span className="orders-fieldChipValue">{p.value}</span>
                                </div>
                              ))}
                              {short.moreCount ? <div className="orders-fieldMore">+{short.moreCount}</div> : null}
                            </div>
                          ) : (
                            <div className="orders-subHint">—</div>
                          )}
                        </div>

                        <div className="orders-cell">
                          <span className={`orders-status orders-status--${tone}`}>{statusLabelAr(o.statusLabel)}</span>
                        </div>

                        <div className="orders-cell">
                          <div>{formatDateTime(o.createdAt)}</div>
                          <div className="orders-subHint">{o.eta ? `الوقت المتوقع: ${o.eta}` : ""}</div>
                        </div>

                        <div className="orders-cell orders-money">{moneyFromCents(o.totalPriceCents)}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {detailsOpen && selected ? (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="تفاصيل الطلب">
            <button className="modal-backdrop" type="button" aria-label="Close" onClick={closeDetails} />
            <div className="modal-card ordersDetail-card">
              {(() => {
                const orderNo = formatOrderNumber(selected.orderNumber);
                const tone = statusTone(selected.statusLabel);
                const pairs = customFieldsPairs(selected.customFields);

                return (
                  <>
                    <div className="ordersDetail-head">
                      <div>
                        <div className="modal-title">تفاصيل الطلب {orderNo ? `#${orderNo}` : ""}</div>
                        <div className="ordersDetail-sub">اضغط خارج النافذة للإغلاق</div>
                      </div>
                      <button className="ordersDetail-close" type="button" onClick={closeDetails} aria-label="Close">
                        ✕
                      </button>
                      <span className={`orders-status orders-status--${tone}`}>{statusLabelAr(selected.statusLabel)}</span>
                    </div>

                    <div className="modal-sep" />

                    <div className="ordersDetail-grid">
                      <div className="ordersDetail-label">رقم الطلب</div>
                      <div className="ordersDetail-value">{orderNo ?? "—"}</div>

                      <div className="ordersDetail-label">الخدمة</div>
                      <div className="ordersDetail-value">{selected.serviceName ?? "—"}</div>

                      <div className="ordersDetail-label">التاريخ</div>
                      <div className="ordersDetail-value">{formatDateTime(selected.createdAt)}</div>

                      <div className="ordersDetail-label">آخر تحديث</div>
                      <div className="ordersDetail-value">{formatDateTime(selected.updatedAt)}</div>

                      {typeof selected.quantity === "number" && Number.isFinite(selected.quantity) ? (
                        <>
                          <div className="ordersDetail-label">الكمية</div>
                          <div className="ordersDetail-value">{selected.quantity}</div>
                        </>
                      ) : null}

                      <div className="ordersDetail-label">المبلغ</div>
                      <div className="ordersDetail-value">{moneyFromCents(selected.totalPriceCents)}</div>

                      <div className="ordersDetail-label">الوقت المتوقع</div>
                      <div className="ordersDetail-value">{selected.eta ?? "—"}</div>
                    </div>

                    {pairs.length ? (
                      <>
                        <div className="ordersDetail-sectionTitle">الحقول المقدّمة</div>
                        <div className="ordersDetail-inputBox">
                          {pairs.map((p) => (
                            <div key={`${p.label}:${p.value}`}
                              style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", padding: "6px 0" }}
                            >
                              <div style={{ fontWeight: 1100 }}>{p.label}</div>
                              <div style={{ direction: "ltr", textAlign: "left" }}>{p.value}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}

                    <div className="modal-actions">
                      <button className="modal-btn modal-btnSecondary" type="button" onClick={closeDetails}>
                        إغلاق
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
