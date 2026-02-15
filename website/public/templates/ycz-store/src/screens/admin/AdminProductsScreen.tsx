"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Monitor, Smartphone, Unlock, Package, FolderOpen,
  ClipboardList, Gamepad2, AlertTriangle, Pencil, Trash2,
  Star, Camera, FileImage, Search,
} from "lucide-react";

interface ProductService {
  id: string;
  groupKey: string;
  serviceKey: string;
  serviceId: number;
  serviceType: string;
  serviceName: string;
  serviceNameAr: string | null;
  qnt: string;
  credit: string;
  time: string;
  info: string;
  featured: boolean;
  isGame: boolean;
  isManual: boolean;
  minQnt: string;
  maxQnt: string;
  server: string;
  imagePath?: string | null;
  group: { key: string; name: string; type: string };
}

interface GroupInfo {
  key: string;
  name: string;
  type: string;
  sortOrder: number;
  _count: { services: number };
  hasGameServices?: boolean;
  gameServicesCount?: number;
}

type GroupTypeFilter = "" | "SERVER" | "IMEI" | "GAMES";

interface EditState {
  serviceNameAr: string;
  credit: string;
  featured: boolean;
  isGame: boolean;
}

type ViewMode = "products" | "groups";

export default function AdminProductsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("products");

  /* ─── Products state ─── */
  const [products, setProducts] = useState<ProductService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ serviceNameAr: "", credit: "", featured: false, isGame: false });
  const [saving, setSaving] = useState(false);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Groups state ─── */
  const [allGroups, setAllGroups] = useState<GroupInfo[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [groupSaving, setGroupSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [groupTypeFilter, setGroupTypeFilter] = useState<GroupTypeFilter>("");

  const getAdminKey = () => localStorage.getItem("admin_key") ?? "";

  /* ─── Fetch products ─── */
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل المنتجات");
      setProducts(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Fetch groups ─── */
  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const res = await fetch("/api/admin/groups", {
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل تحميل القروبات");
      setAllGroups(json.data);
    } catch (e: any) {
      setGroupsError(e.message);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (viewMode === "groups") fetchGroups();
  }, [viewMode, fetchGroups]);

  const startEdit = (p: ProductService) => {
    setEditingId(p.id);
    setEditState({
      serviceNameAr: p.serviceNameAr ?? "",
      credit: p.credit,
      featured: p.featured,
      isGame: p.isGame,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify(editState),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل الحفظ");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, serviceNameAr: editState.serviceNameAr, credit: editState.credit, featured: editState.featured, isGame: editState.isGame }
            : p
        )
      );
      setEditingId(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        headers: { "x-admin-key": getAdminKey() },
        body: formData,
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل رفع الصورة");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, imagePath: json.data.imagePath } : p
        )
      );
      setImageModal(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  /* ─── Group management handlers ─── */
  const saveGroupName = async (key: string) => {
    setGroupSaving(true);
    try {
      const res = await fetch(`/api/admin/groups/${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": getAdminKey() },
        body: JSON.stringify({ name: editGroupName }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل الحفظ");
      setAllGroups((prev) => prev.map((g) => (g.key === key ? { ...g, name: editGroupName } : g)));
      setEditingGroupKey(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGroupSaving(false);
    }
  };

  const deleteGroup = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/groups/${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل الحذف");
      setAllGroups((prev) => prev.filter((g) => g.key !== key));
      setDeleteConfirm(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  /* ─── Filtered groups for display ─── */
  const filteredGroups = allGroups.filter((g) => {
    if (!groupTypeFilter) return true;
    if (groupTypeFilter === "GAMES") return g.hasGameServices;
    return g.type === groupTypeFilter;
  });

  const moveGroup = async (fromIdx: number, toIdx: number) => {
    // Work on the filtered list for reordering
    const reordered = [...filteredGroups];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Find the sort orders used by the non-filtered groups to avoid collisions
    const filteredKeys = new Set(reordered.map((g) => g.key));
    const nonFilteredOrders = allGroups
      .filter((g) => !filteredKeys.has(g.key))
      .map((g) => g.sortOrder);
    const maxNonFiltered = nonFilteredOrders.length > 0 ? Math.max(...nonFilteredOrders) : -1;
    // Assign sort orders starting after the max non-filtered to prevent collisions
    const baseOffset = maxNonFiltered + 1;
    const updatedKeys = new Map<string, number>();
    reordered.forEach((g, i) => updatedKeys.set(g.key, baseOffset + i));

    // Update allGroups with new sort orders for the moved items
    const updatedAll = allGroups.map((g) =>
      updatedKeys.has(g.key) ? { ...g, sortOrder: updatedKeys.get(g.key)! } : g
    );
    setAllGroups(updatedAll);

    try {
      const items = reordered.map((g, i) => ({ key: g.key, sortOrder: baseOffset + i }));
      const res = await fetch("/api/admin/groups/reorder", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-key": getAdminKey() },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل إعادة الترتيب");
    } catch (e: any) {
      alert(e.message);
      fetchGroups();
    }
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (toIdx: number) => {
    if (dragIdx !== null && dragIdx !== toIdx) moveGroup(dragIdx, toIdx);
    setDragIdx(null);
  };

  const toggleSource = async (productId: string, currentIsManual: boolean) => {
    const newIsManual = !currentIsManual;
    try {
      const res = await fetch(`/api/admin/products/${productId}/source`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ isManual: newIsManual }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "فشل التحديث");
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isManual: newIsManual } : p))
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  const groups = [...new Set(
    products
      .filter((p) => !typeFilter || (p.group?.type ?? "") === typeFilter)
      .map((p) => p.group?.name ?? p.groupKey)
  )];

  const filtered = products.filter((p) => {
    const matchType = !typeFilter || (p.group?.type ?? "") === typeFilter;
    const matchSearch =
      !search ||
      p.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      (p.serviceNameAr ?? "").includes(search) ||
      p.serviceKey.toLowerCase().includes(search.toLowerCase()) ||
      p.groupKey.toLowerCase().includes(search.toLowerCase());
    const matchGroup = !groupFilter || (p.group?.name ?? p.groupKey) === groupFilter;
    return matchType && matchSearch && matchGroup;
  });

  const typeLabel: Record<string, React.ReactNode> = {
    SERVER: <><Monitor size={14} style={{ display: "inline", verticalAlign: "middle" }} /> سيرفر</>,
    IMEI: <><Smartphone size={14} style={{ display: "inline", verticalAlign: "middle" }} /> IMEI</>,
    REMOTE: <><Unlock size={14} style={{ display: "inline", verticalAlign: "middle" }} /> ريموت</>,
  };

  return (
    <div>
      {/* ─── View mode tabs ─── */}
      <div className="admin-filter-bar">
        <button
          className={`admin-btn ${viewMode === "products" ? "admin-btn-primary" : ""}`}
          onClick={() => setViewMode("products")}
        >
          <Package size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.25rem" }} /> المنتجات
        </button>
        <button
          className={`admin-btn ${viewMode === "groups" ? "admin-btn-primary" : ""}`}
          onClick={() => setViewMode("groups")}
        >
          <FolderOpen size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.25rem" }} /> القروبات
        </button>
      </div>

      {/* ═══════════════════════ GROUPS VIEW ═══════════════════════ */}
      {viewMode === "groups" && (
        <>
          {/* ─── Group Type Filter Tabs ─── */}
          <div className="admin-filter-bar">
            {([
              { key: "" as GroupTypeFilter, label: "الكل", icon: <ClipboardList size={14} /> },
              { key: "SERVER" as GroupTypeFilter, label: "منتجات سيرفر", icon: <Monitor size={14} /> },
              { key: "IMEI" as GroupTypeFilter, label: "منتجات IMEI", icon: <Smartphone size={14} /> },
              { key: "GAMES" as GroupTypeFilter, label: "ألعاب", icon: <Gamepad2 size={14} /> },
            ]).map((tab) => {
              const count =
                tab.key === ""
                  ? allGroups.length
                  : tab.key === "GAMES"
                    ? allGroups.filter((g) => g.hasGameServices).length
                    : allGroups.filter((g) => g.type === tab.key).length;
              return (
                <button
                  key={tab.key}
                  className={`admin-btn ${groupTypeFilter === tab.key ? "admin-btn-primary" : ""}`}
                  style={{ fontSize: "0.9rem" }}
                  onClick={() => setGroupTypeFilter(tab.key)}
                >
                  {tab.icon} {tab.label}
                  <span style={{ marginRight: "0.3rem", opacity: 0.6, fontSize: "0.8rem" }}>({count})</span>
                </button>
              );
            })}
          </div>

          {groupsLoading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <span>جاري تحميل القروبات...</span>
            </div>
          ) : groupsError ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
              <button className="admin-btn admin-btn-primary" onClick={fetchGroups}>إعادة المحاولة</button>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3><FolderOpen size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> القروبات ({filteredGroups.length})</h3>
                <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
                  اسحب للترتيب — الأعلى يظهر أولاً في الموقع
                  {groupTypeFilter && " (الترتيب حسب النوع المحدد)"}
                </span>
              </div>
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>الاسم</th>
                      <th>المفتاح</th>
                      <th>النوع</th>
                      <th>المنتجات</th>
                      <th>الترتيب</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.35)" }}>
                          لا توجد قروبات {groupTypeFilter ? "من هذا النوع" : ""}
                        </td>
                      </tr>
                    ) : (
                      filteredGroups.map((g, idx) => (
                        <tr
                          key={g.key}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(idx)}
                          style={{
                            cursor: "grab",
                            opacity: dragIdx === idx ? 0.5 : 1,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <td style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                            <span style={{ cursor: "grab", fontSize: "1.1rem" }}>⠿</span>
                          </td>
                          <td>
                            {editingGroupKey === g.key ? (
                              <input
                                className="admin-input"
                                value={editGroupName}
                                onChange={(e) => setEditGroupName(e.target.value)}
                                style={{ width: "100%", maxWidth: 200 }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveGroupName(g.key);
                                  if (e.key === "Escape") setEditingGroupKey(null);
                                }}
                              />
                            ) : (
                              <span style={{ fontWeight: 600 }}>{g.name}</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                              {g.key}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-badge admin-badge-${g.type === "SERVER" ? "info" : g.type === "IMEI" ? "warning" : "success"}`}>
                              {typeLabel[g.type] ?? g.type}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {g._count.services}
                            {g.hasGameServices && (
                              <span style={{ fontSize: "0.75rem", color: "#a78bfa", display: "block" }}>
                                <Gamepad2 size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {g.gameServicesCount}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}>
                              <button
                                className="admin-btn admin-btn-sm"
                                disabled={idx === 0}
                                onClick={() => moveGroup(idx, idx - 1)}
                                title="نقل للأعلى"
                              >
                                ▲
                              </button>
                              <button
                                className="admin-btn admin-btn-sm"
                                disabled={idx === filteredGroups.length - 1}
                                onClick={() => moveGroup(idx, idx + 1)}
                                title="نقل للأسفل"
                              >
                                ▼
                              </button>
                            </div>
                          </td>
                          <td>
                            {editingGroupKey === g.key ? (
                              <div style={{ display: "flex", gap: "0.3rem" }}>
                                <button
                                  className="admin-btn admin-btn-sm admin-btn-success"
                                  onClick={() => saveGroupName(g.key)}
                                  disabled={groupSaving}
                                >
                                  {groupSaving ? "..." : "حفظ"}
                                </button>
                                <button className="admin-btn admin-btn-sm" onClick={() => setEditingGroupKey(null)}>
                                  إلغاء
                                </button>
                              </div>
                            ) : deleteConfirm === g.key ? (
                              <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                                <span style={{ fontSize: "0.8rem", color: "#f87171" }}>
                                  حذف {g._count.services} منتج؟
                                </span>
                                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteGroup(g.key)}>
                                  تأكيد
                                </button>
                                <button className="admin-btn admin-btn-sm" onClick={() => setDeleteConfirm(null)}>
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "0.3rem" }}>
                                <button
                                  className="admin-btn admin-btn-sm admin-btn-primary"
                                  onClick={() => {
                                    setEditingGroupKey(g.key);
                                    setEditGroupName(g.name);
                                  }}
                                >
                                  <Pencil size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تعديل
                                </button>
                                <button
                                  className="admin-btn admin-btn-sm admin-btn-danger"
                                  onClick={() => setDeleteConfirm(g.key)}
                                >
                                  <Trash2 size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> حذف
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════ PRODUCTS VIEW ═══════════════════════ */}
      {viewMode === "products" && (
        <>
          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <span>جاري تحميل المنتجات...</span>
            </div>
          ) : error ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><AlertTriangle size={32} /></div>
              <p>{error}</p>
            </div>
          ) : (
          <>
          {/* ─── Type Filter Tabs ─── */}
      <div className="admin-filter-bar">
        {[
          { key: "", label: "الكل", icon: <ClipboardList size={14} /> },
          { key: "SERVER", label: "منتجات سيرفر", icon: <Monitor size={14} /> },
          { key: "IMEI", label: "منتجات IMEI", icon: <Smartphone size={14} /> },
          { key: "REMOTE", label: "منتجات ريموت", icon: <Unlock size={14} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`admin-btn ${typeFilter === tab.key ? "admin-btn-primary" : ""}`}
            style={{ fontSize: "0.9rem" }}
            onClick={() => {
              setTypeFilter(tab.key);
              setGroupFilter("");
              setSearch("");
            }}
          >
            {tab.icon} {tab.label}
            {tab.key && (
              <span style={{ marginRight: "0.3rem", opacity: 0.6, fontSize: "0.8rem" }}>
                ({products.filter((p) => (p.group?.type ?? "") === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Group + Search Filters ─── */}
      <div className="admin-filter-bar">
        <select
          className="admin-select"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">كل القروبات ({groups.length})</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          className="admin-input"
          placeholder="🔍 بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(typeFilter || groupFilter || search) && (
          <button
            className="admin-btn admin-btn-sm"
            onClick={() => { setTypeFilter(""); setGroupFilter(""); setSearch(""); }}
          >
            ✕ مسح الفلاتر
          </button>
        )}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3><Package size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> المنتجات ({filtered.length})</h3>
        </div>

        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الاسم بالعربي</th>
                <th>المجموعة</th>
                <th>السعر</th>
                <th>المصدر</th>
                <th>الكمية</th>
                <th>مميز</th>
                <th>لعبة</th>
                <th>صورة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.35)" }}>
                    لا توجد منتجات
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.serviceName}</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>{p.serviceKey}</div>
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <input
                          className="admin-input"
                          value={editState.serviceNameAr}
                          onChange={(e) => setEditState({ ...editState, serviceNameAr: e.target.value })}
                          style={{ width: "100%", maxWidth: 150 }}
                        />
                      ) : (
                        p.serviceNameAr || <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                        {p.group?.name ?? p.groupKey}
                      </span>
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <input
                          className="admin-input"
                          value={editState.credit}
                          onChange={(e) => setEditState({ ...editState, credit: e.target.value })}
                          style={{ width: "100%", maxWidth: 90 }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, color: "#4ade80" }}>{p.credit}</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`admin-btn admin-btn-sm ${p.isManual ? "" : "admin-btn-success"}`}
                        onClick={() => toggleSource(p.id, p.isManual)}
                        title={p.isManual ? "منفصل عن المصدر — اضغط للربط" : "متصل بالمصدر — اضغط للفصل"}
                        style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                      >
                        {p.isManual ? "🔴 يدوي" : "🟢 متصل"}
                      </button>
                    </td>
                    <td>{p.qnt || "—"}</td>
                    <td>
                      {editingId === p.id ? (
                        <input
                          type="checkbox"
                          checked={editState.featured}
                          onChange={(e) => setEditState({ ...editState, featured: e.target.checked })}
                        />
                      ) : (
                        p.featured ? <Star size={16} color="#fbbf24" /> : "—"
                      )}
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <input
                          type="checkbox"
                          checked={editState.isGame}
                          onChange={(e) => setEditState({ ...editState, isGame: e.target.checked })}
                        />
                      ) : (
                        p.isGame ? <Gamepad2 size={16} color="#a78bfa" /> : "—"
                      )}
                    </td>
                    <td>
                      {p.imagePath ? (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                          }}
                          onClick={() => setImageModal(p.id)}
                        >
                          <img
                            src={p.imagePath}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <button
                          className="admin-btn admin-btn-sm"
                          onClick={() => setImageModal(p.id)}
                        >
                          <Camera size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> إضافة
                        </button>
                      )}
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-success"
                            onClick={saveEdit}
                            disabled={saving}
                          >
                            {saving ? "..." : "حفظ"}
                          </button>
                          <button
                            className="admin-btn admin-btn-sm"
                            onClick={cancelEdit}
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          className="admin-btn admin-btn-sm admin-btn-primary"
                          onClick={() => startEdit(p)}
                        >
                          <Pencil size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.2rem" }} /> تعديل
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Upload Modal */}
      {imageModal && (
        <div className="admin-modal-overlay" onClick={() => setImageModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3><Camera size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> إضافة صورة للمنتج</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
              {products.find((p) => p.id === imageModal)?.serviceName}
            </p>

            {products.find((p) => p.id === imageModal)?.imagePath && (
              <div style={{ marginBottom: "1rem" }}>
                <img
                  src={products.find((p) => p.id === imageModal)!.imagePath!}
                  alt=""
                  style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 12 }}
                />
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && imageModal) handleImageUpload(imageModal, f);
              }}
            />
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                                <FileImage size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3rem" }} /> اختيار صورة
              </button>
              <button className="admin-btn" onClick={() => setImageModal(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
          </>
          )}
        </>
      )}
    </div>
  );
}
