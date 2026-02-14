"use client";

import { useEffect, useMemo, useState } from "react";
import Select, { type StylesConfig } from "react-select";
import LoadingButton from "../../../components/LoadingButton";
import MessageCardModal from "../../../components/MessageCardModal";

type FeaturedApiItem = {
  groupKey: string;
  groupName: string;
  serviceKey: string;
  service: {
    SERVICETYPE?: string;
    SERVICENAME?: string;
    SERVICENAME_AR?: string;
    CREDIT?: string;
    TIME?: string;
    IS_GAME?: boolean;
    INFO?: string;
    MINQNT?: string;
    MAXQNT?: string;
    CUSTOM?: {
      customname?: string;
      custominfo?: string;
    };
    "Requires.Custom"?: Array<{
      fieldname?: string;
      description?: string;
      required?: string;
    }>;
  };
};

type OrderSuccess = {
  id: string;
  orderNumber?: number;
  status: number;
  statusLabel: string;
  totalPriceCents: number;
  userBalanceAfter?: number;
};

function formatOrderNumber(n: unknown): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const v = Math.max(0, Math.trunc(n));
  return String(v).padStart(6, "0");
}

function isRequiredFlag(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true" || v === "required";
}

function minMaxFromService(item: FeaturedApiItem): { min: number; max: number; allowQuantity: boolean } {
  const min = Math.max(1, Number.parseInt(String(item.service.MINQNT ?? "1"), 10) || 1);
  const maxRaw = Number.parseInt(String(item.service.MAXQNT ?? String(min)), 10);
  const max = Math.max(min, Number.isFinite(maxRaw) ? maxRaw : min);
  return { min, max, allowQuantity: max > 1 || min > 1 };
}

type CategoryKey = "soft" | "imei" | "games";

const CATEGORIES: Array<{ key: CategoryKey; title: string; icon: string }> = [
  { key: "soft", title: "ادوات سوفت", icon: "⚙" },
  { key: "imei", title: "خدمات IMEI", icon: "📶" },
  { key: "games", title: "شحن الألعاب", icon: "🎮" },
];

function getShortProductName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "منتج";
  return trimmed;
}

function getTextDir(text: string): "rtl" | "ltr" {
  const s = text.trim();
  if (!s) return "rtl";

  const arabicChar = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const latinChar = /[A-Za-z]/;

  for (const ch of s) {
    if (arabicChar.test(ch)) return "rtl";
    if (latinChar.test(ch)) return "ltr";
  }

  return "rtl";
}

const SERVICE_KEY_TO_AR_NAME: Record<string, string> = {
  // Sigma Plus
  "20040": "تفعيل Sigma Plus",
  "20041": "تفعيل Sigma Plus",
  "20042": "تفعيل Sigma Plus",

  // UnlockTool
  "17771": "تفعيل UnlockTool",
  "17772": "تفعيل UnlockTool",
  "17773": "تفعيل UnlockTool",
};

function getDisplayProductName(item: FeaturedApiItem): string {
  const ar = item.service.SERVICENAME_AR?.trim();
  if (ar) return ar;
  const en = item.service.SERVICENAME?.trim();
  if (en) return en;
  const mapped = SERVICE_KEY_TO_AR_NAME[item.serviceKey];
  if (mapped) return mapped;
  return "منتج";
}

function getProductImageSrc(item: FeaturedApiItem): string | null {
  const serviceKeyToImage: Record<string, string> = {
    "20040": "/images/products/sigma-plus.png",
    "20041": "/images/products/sigma-plus.png",
    "20042": "/images/products/sigma-plus.png",
    "17771": "/images/products/unlocktool.png",
    "17772": "/images/products/unlocktool.png",
    "17773": "/images/products/unlocktool.png",
  };

  return serviceKeyToImage[item.serviceKey] ?? null;
}

function normalizeFieldKey(key: string): string {
  return key.trim().replace(/\s+/g, " ");
}

function guessArabicFieldLabel(fieldKeyRaw: string, description?: string): string {
  const key = normalizeFieldKey(fieldKeyRaw);
  const k = key.toLowerCase();
  const d = (description ?? "").toLowerCase();

  if (k === "imei" || k.includes("imei")) return "رقم IMEI";
  if (k === "server") return "البيانات المطلوبة";

  // Common gaming/provider keys
  if (k === "playerid" || k === "player_id" || k === "player id") return "معرف اللاعب";
  if (k === "pubgucn" || k === "pubguc" || k === "pubg uc") return "عدد UC (PUBG)";

  if (k.includes("username") || k === "user" || d.includes("user") || d.includes("username")) return "اسم المستخدم";
  if (k.includes("password") || k === "pass" || d.includes("password")) return "كلمة المرور";
  if (k.includes("email") || d.includes("email")) return "البريد الإلكتروني";
  if (k.includes("phone") || k.includes("mobile") || d.includes("phone")) return "رقم الهاتف";
  if (k.includes("serial") || k.includes("sn") || d.includes("serial")) return "السيريال";
  if (k.includes("model") || d.includes("model")) return "الموديل";
  if (k.includes("network") || d.includes("network")) return "الشبكة";
  if (k.includes("country") || d.includes("country")) return "الدولة";
  if (k.includes("code") || d.includes("code")) return "الكود";
  if (k.includes("id") && !k.includes("imei")) return "المعرّف";

  // fallback
  return key || "حقل";
}

function getServerInputPlaceholder(item: FeaturedApiItem): string {
  const isGame = item.service.IS_GAME === true;
  const serviceName = `${item.service.SERVICENAME ?? ""} ${item.service.SERVICENAME_AR ?? ""}`.toLowerCase();
  const custom = Array.isArray(item.service["Requires.Custom"]) ? item.service["Requires.Custom"]! : [];
  const keys = custom
    .map((f) => (f.fieldname ?? "").trim().toLowerCase())
    .filter(Boolean);

  if (isGame || serviceName.includes("pubg") || keys.includes("playerid") || keys.includes("pubgucn") || keys.includes("pubguc")) {
    return "مثال: اكتب معرف اللاعب (Player ID) / رقم الحساب داخل اللعبة";
  }

  return "مثال: اكتب البيانات المطلوبة حسب الخدمة";
}

function formatMoneyFromCredit(creditRaw?: string, quantity: number = 1): { unit?: string; total?: string } {
  const unitNumber = creditRaw ? Number.parseFloat(creditRaw) : NaN;
  if (!Number.isFinite(unitNumber) || unitNumber <= 0) return {};
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const totalNumber = unitNumber * q;
  const unit = `$${unitNumber.toFixed(2)}`;
  const total = q === 1 ? unit : `$${totalNumber.toFixed(2)}`;
  return { unit, total };
}

function getImeiInputMeta(item: FeaturedApiItem): { label: string; placeholder: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] } {
  const name = `${item.service.SERVICENAME ?? ""} ${item.service.SERVICENAME_AR ?? ""} ${item.service.INFO ?? ""}`.toLowerCase();
  const customName = String(item.service.CUSTOM?.customname ?? "").trim().toLowerCase();

  const looksLikeSerial =
    customName === "sn" ||
    customName.includes("serial") ||
    name.includes(" serial") ||
    name.includes("sn") ||
    name.includes("imei/sn") ||
    name.includes("[imei/sn]") ||
    name.includes("imei / sn") ||
    name.includes("imei or sn");

  if (customName === "sn" || customName.includes("serial")) {
    return {
      label: "السيريال (SN)",
      placeholder: "مثال: سيريال الجهاز (SN)",
      inputMode: "text",
    };
  }

  if (looksLikeSerial) {
    return {
      label: "IMEI أو السيريال (SN)",
      placeholder: "اكتب IMEI أو Serial (SN)",
      inputMode: "text",
    };
  }

  return {
    label: "رقم IMEI",
    placeholder: "مثال: 353918116088888",
    inputMode: "numeric",
  };
}

function getCustomFieldKeys(item: FeaturedApiItem): string[] {
  const requiredFields = Array.isArray(item.service["Requires.Custom"]) ? item.service["Requires.Custom"]! : [];
  return requiredFields
    .map((f) => (f.fieldname ?? "").trim())
    .filter(Boolean);
}

function shouldShowServerInput(item: FeaturedApiItem): boolean {
  const serviceType = (item.service.SERVICETYPE ?? "").toUpperCase();
  if (serviceType !== "SERVER") return false;

  // Many game services come as SERVICETYPE=SERVER but actually require custom fields (e.g., playerId).
  // Showing both SERVER + Requires.Custom results in duplicated/confusing inputs.
  const customKeys = getCustomFieldKeys(item);
  return customKeys.length === 0;
}

function deriveServerFromCustom(item: FeaturedApiItem, custom: Record<string, string>): string {
  const keys = getCustomFieldKeys(item);
  for (const key of keys) {
    const v = String(custom[key] ?? "").trim();
    if (v) return v;
  }
  return "";
}

export default function ServicesProducts() {
  const [items, setItems] = useState<FeaturedApiItem[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("soft");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [orderOpen, setOrderOpen] = useState(false);
  const [orderItem, setOrderItem] = useState<FeaturedApiItem | null>(null);
  const [orderImei, setOrderImei] = useState("");
  const [orderServer, setOrderServer] = useState("");
  const [orderQty, setOrderQty] = useState(1);
  const [orderCustom, setOrderCustom] = useState<Record<string, string>>({});
  const [orderNote, setOrderNote] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderSuccess | null>(null);

  const directApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const endpoint = directApiBase ? `${directApiBase}/products/catalog` : "/api/products/catalog";

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 3500);

        const res = await fetch(endpoint, {
          cache: "no-store",
          signal: controller.signal,
        });

        window.clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as FeaturedApiItem[];
        if (!isMounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === "soft") {
      return items.filter(
        (i) => (i.service.SERVICETYPE ?? "").toUpperCase() === "SERVER" && i.service.IS_GAME !== true
      );
    }
    if (selectedCategory === "imei") {
      return items.filter((i) => (i.service.SERVICETYPE ?? "").toUpperCase() === "IMEI");
    }
    // games
    return items.filter((i) => i.service.IS_GAME === true);
  }, [items, selectedCategory]);

  const groups = useMemo(() => {
    // Merge groups by normalized name to avoid duplicates from different groupKeys
    const nameMap = new Map<string, string>(); // normalized name -> first groupKey
    const displayMap = new Map<string, string>(); // normalized name -> display name
    for (const item of categoryFilteredItems) {
      if (!item?.groupKey || !item?.groupName) continue;
      const normalized = (item.groupName || item.groupKey).trim().toLowerCase();
      if (!nameMap.has(normalized)) {
        nameMap.set(normalized, item.groupKey);
        displayMap.set(normalized, item.groupName || item.groupKey);
      }
    }
    return Array.from(nameMap.entries())
      .map(([norm, key]) => ({ key, name: displayMap.get(norm) || key, normalizedName: norm }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [categoryFilteredItems]);

  // Build a set of all groupKeys that belong to the selected group name (handles merged groups)
  const selectedGroupKeys = useMemo(() => {
    if (selectedGroupKey === "all") return null;
    const selectedGroup = groups.find((g) => g.key === selectedGroupKey);
    if (!selectedGroup) return null;
    const keys = new Set<string>();
    for (const item of categoryFilteredItems) {
      if ((item.groupName || item.groupKey).trim().toLowerCase() === selectedGroup.normalizedName) {
        keys.add(item.groupKey);
      }
    }
    return keys;
  }, [selectedGroupKey, groups, categoryFilteredItems]);

  const filteredItems = useMemo(() => {
    if (selectedGroupKey === "all" || !selectedGroupKeys) return categoryFilteredItems;
    return categoryFilteredItems.filter((i) => selectedGroupKeys.has(i.groupKey));
  }, [categoryFilteredItems, selectedGroupKey, selectedGroupKeys]);

  // Keep selection valid if the data changes
  useEffect(() => {
    if (selectedGroupKey === "all") return;
    if (groups.some((g) => g.key === selectedGroupKey)) return;
    setSelectedGroupKey("all");
  }, [groups, selectedGroupKey]);

  // Reset group selection when switching category
  useEffect(() => {
    setSelectedGroupKey("all");
  }, [selectedCategory]);

  type GroupOption = { value: string; label: string };

  const options = useMemo<GroupOption[]>(() => {
    return [{ value: "all", label: "كل المنتجات" }].concat(
      groups.map((g) => ({ value: g.key, label: g.name }))
    );
  }, [groups]);

  const selectedOption = useMemo<GroupOption>(() => {
    return options.find((o) => o.value === selectedGroupKey) ?? options[0]!;
  }, [options, selectedGroupKey]);

  const menuPortalTarget = typeof document === "undefined" ? null : document.body;

  function openOrderModal(item: FeaturedApiItem) {
    setOrderItem(item);
    setOrderOpen(true);
    setOrderError(null);
    setOrderImei("");
    setOrderServer("");
    setOrderNote("");
    setOrderCustom({});
    const mm = minMaxFromService(item);
    setOrderQty(mm.min);
  }

  async function submitOrder() {
    if (!orderItem) return;
    const token = typeof window === "undefined" ? null : localStorage.getItem("auth_token");
    if (!token) {
      setOrderError("يلزم تسجيل الدخول أولاً من صفحة الملف الشخصي.");
      return;
    }

    const serviceType = (orderItem.service.SERVICETYPE ?? "").toUpperCase();
    const { min, max, allowQuantity } = minMaxFromService(orderItem);

    if (serviceType === "IMEI" && !orderImei.trim()) {
      setOrderError(`${getImeiInputMeta(orderItem).label} مطلوب`);
      return;
    }
    const serverValue = orderServer.trim() || deriveServerFromCustom(orderItem, orderCustom);
    if (serviceType === "SERVER" && !serverValue) {
      setOrderError("البيانات المطلوبة مطلوبة");
      return;
    }
    if (allowQuantity && (orderQty < min || orderQty > max)) {
      setOrderError(`الكمية يجب أن تكون بين ${min} و ${max}`);
      return;
    }

    const requiredFields = Array.isArray(orderItem.service["Requires.Custom"]) ? orderItem.service["Requires.Custom"]! : [];
    for (const f of requiredFields) {
      const key = (f.fieldname ?? "").trim();
      if (!key) continue;
      if (!isRequiredFlag(f.required)) continue;
      if (!String(orderCustom[key] ?? "").trim()) {
        const labelAr = guessArabicFieldLabel(key, f.description);
        setOrderError(`الحقل مطلوب: ${labelAr}`);
        return;
      }
    }

    try {
      setOrderSubmitting(true);
      setOrderError(null);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupKey: orderItem.groupKey,
          serviceKey: orderItem.serviceKey,
          quantity: allowQuantity ? orderQty : 1,
          imei: orderImei.trim() || undefined,
          server: serverValue || undefined,
          customFields: orderCustom,
          note: orderNote.trim() || undefined,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data?.ok) {
        const msg = data?.error?.message || "تعذر إنشاء الطلب";
        setOrderError(msg);
        return;
      }

      setLastOrder(data.data as OrderSuccess);
      setOrderOpen(false);
      setSuccessOpen(true);
    } catch {
      setOrderError("تعذر الاتصال بالخادم");
    } finally {
      setOrderSubmitting(false);
    }
  }

  const selectStyles = useMemo<StylesConfig<GroupOption, false>>(() => {
    const blue = "rgba(37, 99, 235, 0.12)";
    const blueStrong = "rgba(37, 99, 235, 0.80)";

    const border = "rgba(17, 24, 39, 0.14)";
    const text = "rgba(17, 24, 39, 0.92)";
    const muted = "rgba(17, 24, 39, 0.60)";
    const menuBg = "#ffffff";
    const controlBg = "#ffffff";

    return {
      container: (base) => ({ ...base, width: "100%" }),
      control: (base, state) => ({
        ...base,
        minHeight: 44,
        backgroundColor: controlBg,
        borderColor: border,
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.06)",
        borderRadius: 14,
        cursor: "pointer",
        direction: "rtl",
      }),
      valueContainer: (base) => ({ ...base, padding: "0 10px" }),
      singleValue: (base) => ({ ...base, color: text }),
      placeholder: (base) => ({ ...base, color: muted }),
      input: (base) => ({ ...base, color: text }),
      indicatorsContainer: (base) => ({ ...base, paddingLeft: 6, paddingRight: 6 }),
      indicatorSeparator: (base) => ({ ...base, display: "none" }),
      dropdownIndicator: (base) => ({ ...base, display: "none" }),
      clearIndicator: (base) => ({ ...base, color: muted, "&:hover": { color: text } }),
      menu: (base) => ({
        ...base,
        backgroundColor: menuBg,
        border: `1px solid ${border}`,
        boxShadow: "0 18px 50px rgba(0, 0, 0, 0.18)",
        borderRadius: 14,
        overflow: "hidden",
        zIndex: 9999,
        direction: "rtl",
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      menuList: (base) => ({ ...base, padding: 0 }),
      option: (base, state) => ({
        ...base,
        cursor: "pointer",
        color: text,
        backgroundColor: state.isSelected
          ? "rgba(37, 99, 235, 0.16)"
          : state.isFocused
            ? blue
            : "transparent",
        ":active": { backgroundColor: "rgba(37, 99, 235, 0.22)" },
      }),
      noOptionsMessage: (base) => ({ ...base, color: muted }),
    };
  }, []);

  return (
    <section style={{ marginTop: "1rem" }}>
      <MessageCardModal
        open={successOpen}
        variant="success"
        title={(() => {
          const formatted = lastOrder ? formatOrderNumber(lastOrder.orderNumber) : null;
          if (formatted) return `تم إنشاء الطلب رقم: ${formatted}`;
          return "تم إنشاء الطلب";
        })()}
        details={undefined}
        onClose={() => {
          setSuccessOpen(false);
          setLastOrder(null);
        }}
        primaryActionLabel={orderItem ? "تقديم طلب آخر لنفس المنتج" : undefined}
        onPrimaryAction={() => {
          setSuccessOpen(false);
          if (orderItem) openOrderModal(orderItem);
        }}
      />

      {orderOpen && orderItem ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="تقديم الطلب">
          <button className="modal-backdrop" type="button" aria-label="Close" onClick={orderSubmitting ? undefined : () => setOrderOpen(false)} />
          <div className="modal-card">
            <div className="modal-title">تقديم طلب سريع</div>
            <div className="modal-sep" />
            <div className="modal-details">
              <div style={{ fontWeight: 600 }}>{getDisplayProductName(orderItem)}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>الوقت المتوقع: {orderItem.service.TIME?.trim() || "-"}</div>
              {(() => {
                const { allowQuantity } = minMaxFromService(orderItem);
                const qty = allowQuantity ? orderQty : 1;
                const money = formatMoneyFromCredit(orderItem.service.CREDIT, qty);
                if (!money.unit) return null;
                return (
                  <div style={{ opacity: 0.9, marginTop: 8 }}>
                    <div>السعر: {money.unit}</div>
                    {qty > 1 ? <div>الإجمالي: {money.total}</div> : null}
                  </div>
                );
              })()}
              <div style={{ opacity: 0.85, marginTop: 10, color: "rgba(17, 24, 39, 0.82)" }}>
                ملاحظة: سيتم خصم المبلغ من المحفظة عند تأكيد الطلب.
              </div>
            </div>

            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submitOrder();
              }}
            >
              {orderError ? <div className="modal-details" style={{ color: "#b91c1c" }}>{orderError}</div> : null}

              {(() => {
                const serviceType = (orderItem.service.SERVICETYPE ?? "").toUpperCase();
                if (serviceType === "IMEI") {
                  const meta = getImeiInputMeta(orderItem);
                  return (
                    <>
                      <div className="modal-label">{meta.label}</div>
                      <input
                        className="modal-input"
                        inputMode={meta.inputMode}
                        placeholder={meta.placeholder}
                        value={orderImei}
                        onChange={(e) => setOrderImei(e.target.value)}
                        disabled={orderSubmitting}
                      />
                    </>
                  );
                }
                if (serviceType === "SERVER") {
                  if (!shouldShowServerInput(orderItem)) return null;
                  return (
                    <>
                      <div className="modal-label">البيانات المطلوبة</div>
                      <input
                        className="modal-input"
                        placeholder={getServerInputPlaceholder(orderItem)}
                        value={orderServer}
                        onChange={(e) => setOrderServer(e.target.value)}
                        disabled={orderSubmitting}
                      />
                    </>
                  );
                }
                return null;
              })()}

              {(() => {
                const { min, max, allowQuantity } = minMaxFromService(orderItem);
                if (!allowQuantity) return null;
                return (
                  <>
                    <div className="modal-label">الكمية</div>
                    <input
                      className="modal-input"
                      type="number"
                      min={min}
                      max={max}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Number(e.target.value))}
                      disabled={orderSubmitting}
                    />
                  </>
                );
              })()}

              {Array.isArray(orderItem.service["Requires.Custom"]) && orderItem.service["Requires.Custom"]!.length > 0 ? (
                <>
                  {orderItem.service["Requires.Custom"]!.map((f, idx) => {
                    const rawKey = (f.fieldname ?? "").trim();
                    const key = rawKey || `field_${idx}`;
                    const required = isRequiredFlag(f.required);
                    const labelAr = guessArabicFieldLabel(key, f.description);
                    return (
                      <div key={key}>
                        <div className="modal-label">
                          {labelAr}{required ? " *" : ""}
                          {rawKey ? <span style={{ opacity: 0.75, marginInlineStart: 8, fontWeight: 500 }}>({rawKey})</span> : null}
                        </div>
                        {f.description ? <div className="modal-details" style={{ marginTop: 4, opacity: 0.8 }}>{f.description}</div> : null}
                        <input
                          className="modal-input"
                          value={orderCustom[key] ?? ""}
                          onChange={(e) => setOrderCustom((prev) => ({ ...prev, [key]: e.target.value }))}
                          disabled={orderSubmitting}
                        />
                      </div>
                    );
                  })}
                </>
              ) : null}

              <div className="modal-label">ملاحظات (اختياري)</div>
              <input className="modal-input" value={orderNote} onChange={(e) => setOrderNote(e.target.value)} disabled={orderSubmitting} />

              <div className="modal-actions modal-actionsGrid">
                <LoadingButton className="modal-btn modal-btnPrimary" type="submit" loading={orderSubmitting}>
                  اطلب المنتج
                </LoadingButton>
                <button className="modal-btn modal-btnSecondary" type="button" onClick={() => setOrderOpen(false)} disabled={orderSubmitting}>
                  إغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="services-layout">
        <div className="services-main">
          <div className="services-filterBar">
            <div className="services-filterField">
              <Select
                instanceId="services-group-select"
                isRtl
                isSearchable
                isClearable={false}
                value={selectedOption}
                options={options}
                onChange={(opt) => setSelectedGroupKey((opt?.value as string) ?? "all")}
                styles={selectStyles}
                menuPortalTarget={menuPortalTarget}
                menuPosition="fixed"
                placeholder="اختر المجموعة"
                noOptionsMessage={() => "لا توجد نتائج"}
              />
            </div>
            <div className="services-filterLabel">فلترة حسب المجموعة</div>
          </div>

          <div className="services-productsGrid" aria-busy={isLoading ? "true" : "false"}>
            {filteredItems.map((item) => (
              <div
                key={`${item.groupKey}:${item.serviceKey}`}
                className="product-cardStack"
                role="button"
                tabIndex={0}
                onClick={() => openOrderModal(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openOrderModal(item);
                }}
              >
                <div className="card product-card services-productCard">
                  <div className="product-card-inner">
                    <div className="product-imageWrap">
                      <div className="product-imageArea">
                        {getProductImageSrc(item) ? (
                          <img
                            className="product-image"
                            src={getProductImageSrc(item) as string}
                            alt={getDisplayProductName(item)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="product-placeholder">Image</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-meta">
                  <div
                    className="product-name"
                    dir={getTextDir(getDisplayProductName(item))}
                    title={getDisplayProductName(item)}
                  >
                    {getShortProductName(getDisplayProductName(item))}
                  </div>

                  <div className="product-actions">
                    <div className="product-price" title="السعر">
                      {item.service.CREDIT ? `$${item.service.CREDIT}` : "-"}
                    </div>
                    <button
                      className="product-plus"
                      type="button"
                      aria-label="تقديم طلب"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOrderModal(item);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && hasError ? (
              <div className="services-productsState">
                <div className="services-productsStateTitle">تعذر تحميل المنتجات</div>
                <div className="services-productsStateHint">تأكد أن الباك شغال على منفذ 4000.</div>
              </div>
            ) : null}

            {!isLoading && !hasError && filteredItems.length === 0 ? (
              <div className="services-productsState">
                <div className="services-productsStateTitle">لا توجد منتجات لهذه المجموعة</div>
                <div className="services-productsStateHint">جرّب اختيار مجموعة أخرى أو اختر “كل المنتجات”.</div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="services-sidebar" aria-label="التصنيفات">
          <div className="services-sidebarTitle">التصنيفات</div>
          <div className="services-categories">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={isActive ? "services-catPill isActive" : "services-catPill"}
                >
                  <span className="services-catIcon" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <span className="services-catText">{cat.title}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
