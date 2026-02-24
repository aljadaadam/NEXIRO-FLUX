'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Star, Unlink, Link2, CheckSquare, AlertCircle, Layers, Check } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { Product } from '@/lib/types';

export default function ProductsPage({ theme }: { theme: ColorTheme }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newArabicName, setNewArabicName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newServiceType, setNewServiceType] = useState<'SERVER' | 'IMEI' | 'REMOTE'>('SERVER');
  const [newDesc, setNewDesc] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newCustomGroup, setNewCustomGroup] = useState('');
  const [newIsGame, setNewIsGame] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit product form state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editArabicName, setEditArabicName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editServiceType, setEditServiceType] = useState('SERVER');
  const [editIcon, setEditIcon] = useState('📦');
  const [editGroup, setEditGroup] = useState('');
  const [editCustomGroup, setEditCustomGroup] = useState('');
  const [editNamePriority, setEditNamePriority] = useState<'ar' | 'en'>('ar');
  const [editIsGame, setEditIsGame] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Source & product linking state
  const [editSourceConnected, setEditSourceConnected] = useState(true);
  const [editLinkedProductId, setEditLinkedProductId] = useState<number | null>(null);
  const [linkSearch, setLinkSearch] = useState('');
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const [editOriginalSourceId, setEditOriginalSourceId] = useState<number | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Groups management state
  const [showGroups, setShowGroups] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await adminApi.getProducts();
      if (Array.isArray(res)) setProducts(res);
      else if (res?.products && Array.isArray(res.products)) setProducts(res.products);
    } catch { /* keep fallback */ }
    finally { setLoading(false); }
  }

  // كل القروبات الموجودة
  const allGroups = useMemo(() => {
    return Array.from(new Set(products.map(p => String(p.group_name || '').trim()).filter(Boolean)));
  }, [products]);

  async function handleAddProduct() {
    if (!newName || !newPrice) return;
    const groupValue = newGroup === '__new__' ? newCustomGroup.trim() : newGroup;
    if (!groupValue) return;
    setSaving(true);
    try {
      await adminApi.createProduct({
        name: newName,
        arabic_name: newArabicName || null,
        price: Number.parseFloat(String(newPrice).replace(/[$,\s]/g, '')),
        description: newDesc,
        service_type: newServiceType,
        group_name: groupValue,
        status: 'active',
        is_game: newIsGame ? 1 : 0,
      });
      setShowAdd(false);
      setNewName(''); setNewArabicName(''); setNewPrice(''); setNewDesc('');
      setNewServiceType('SERVER'); setNewGroup(''); setNewCustomGroup('');
      setNewIsGame(false);
      showToast('تم إنشاء المنتج بنجاح');
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل إنشاء المنتج';
      showToast(msg, 'error');
    }
    finally { setSaving(false); }
  }

  function openEdit(product: Product) {
    setEditId(product.id);
    setEditName(product.name || '');
    setEditArabicName(product.arabic_name || '');
    setEditPrice(String(product.price || '').replace('$', '').trim());
    setEditDesc(product.desc || '');
    setEditStatus((product.status || 'active') === 'نشط' ? 'active' : String(product.status || 'active'));
    setEditServiceType(product.service_type || 'SERVER');
    setEditIcon(product.icon || '📦');
    const pg = String(product.group_name || '').trim();
    setEditGroup(pg);
    setEditCustomGroup('');
    setEditNamePriority(product.name_priority || 'ar');
    setEditIsGame(!!product.is_game);
    setEditSourceConnected(!!product.source_id);
    setEditOriginalSourceId(product.source_id || null);
    setEditLinkedProductId(product.linked_product_id ?? null);
    setLinkSearch('');
    setShowLinkDropdown(false);
    setShowEdit(true);
  }

  function closeEdit() {
    setShowEdit(false);
    setEditId(null);
  }

  async function handleUpdateProduct() {
    if (!editId || !editName || !editPrice) return;
    setUpdating(true);
    try {
      const groupValue = editGroup === '__new__' ? editCustomGroup.trim() : editGroup;
      const updateData: Record<string, unknown> = {
        name: editName,
        arabic_name: editArabicName || null,
        price: Number.parseFloat(String(editPrice).replace(/[$,\s]/g, '')),
        description: editDesc,
        status: editStatus,
        service_type: editServiceType,
        icon: editIcon,
        group_name: groupValue || null,
        name_priority: editNamePriority,
        is_game: editIsGame ? 1 : 0,
      };

      // فصل/إعادة اتصال المصدر
      if (!editSourceConnected && editOriginalSourceId) {
        updateData.source_id = null; // فصل المنتج من المصدر
      } else if (editSourceConnected && !editOriginalSourceId) {
        // لا شيء — الأصل ليس متصل
      }

      // تحويل الاتصال لمنتج آخر
      updateData.linked_product_id = editLinkedProductId;

      await adminApi.updateProduct(editId, updateData);
      closeEdit();
      showToast('تم تحديث المنتج بنجاح');
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تحديث المنتج';
      showToast(msg, 'error');
    }
    finally { setUpdating(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.')) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      showToast('تم حذف المنتج');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل حذف المنتج';
      showToast(msg, 'error');
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} منتج؟ لا يمكن التراجع.`)) return;
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedIds) {
      try {
        await adminApi.deleteProduct(id);
        successCount++;
      } catch {
        failCount++;
      }
    }
    setSelectedIds(new Set());
    if (failCount > 0) {
      showToast(`تم حذف ${successCount} منتج، فشل ${failCount}`, 'error');
    } else {
      showToast(`تم حذف ${successCount} منتج بنجاح`);
    }
    await loadProducts();
    setBulkDeleting(false);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function handleToggleFeatured(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic update — نغير اللون فوراً قبل ما يرجع الرد
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: p.is_featured ? 0 : 1 } : p));
    try {
      await adminApi.toggleFeatured(id);
    } catch (err) {
      console.error('toggleFeatured error:', err);
      // Rollback — نرجع الحالة الأصلية عند الفشل
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: p.is_featured ? 0 : 1 } : p));
      alert('فشل تبديل حالة المنتج المميز — تأكد من أن الخادم يعمل');
    }
  }

  async function handleToggleNamePriority(e: React.MouseEvent, p: Product) {
    e.preventDefault();
    e.stopPropagation();
    const newPriority = (p.name_priority || 'ar') === 'ar' ? 'en' : 'ar';
    try {
      await adminApi.updateProduct(p.id, { name_priority: newPriority });
      await loadProducts();
    } catch (err) {
      console.error('toggleNamePriority error:', err);
    }
  }

  // ─── Group Management Handlers ───
  async function handleRenameGroup(oldName: string) {
    if (!renameValue.trim() || renameValue.trim() === oldName) {
      setRenamingGroup(null);
      return;
    }
    setGroupActionLoading(true);
    try {
      const res = await adminApi.renameGroup(oldName, renameValue.trim());
      showToast(res?.message || 'تم تغيير اسم القروب');
      setRenamingGroup(null);
      setRenameValue('');
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تغيير اسم القروب';
      showToast(msg, 'error');
    } finally {
      setGroupActionLoading(false);
    }
  }

  async function handleDeleteGroup(groupName: string, productCount: number) {
    if (!confirm(`هل أنت متأكد من حذف قروب "${groupName}" مع جميع منتجاتها (${productCount} منتج)؟\nلا يمكن التراجع.`)) return;
    setGroupActionLoading(true);
    try {
      const res = await adminApi.deleteGroup(groupName);
      showToast(res?.message || 'تم حذف القروب');
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل حذف القروب';
      showToast(msg, 'error');
    } finally {
      setGroupActionLoading(false);
    }
  }

  // بيانات القروبات مع عدد المنتجات
  const groupsData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const g = String(p.group_name || '').trim();
      if (g) map.set(g, (map.get(g) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  // عرض الاسم حسب أولوية المنتج
  function displayName(p: Product) {
    const prio = p.name_priority || 'ar';
    if (prio === 'ar') return p.arabic_name || p.name;
    return p.name || p.arabic_name || '';
  }
  function secondaryName(p: Product) {
    const prio = p.name_priority || 'ar';
    if (prio === 'ar' && p.arabic_name) return p.name;
    if (prio === 'en' && p.name && p.arabic_name) return p.arabic_name;
    return null;
  }

  // المنتجات المتاحة للتحويل (باستثناء المنتج الحالي)
  const linkableProducts = useMemo(() => {
    return products.filter(p => p.id !== editId);
  }, [products, editId]);

  const filteredLinkable = useMemo(() => {
    if (!linkSearch.trim()) return linkableProducts.slice(0, 20);
    const q = linkSearch.toLowerCase();
    return linkableProducts.filter(p =>
      (p.arabic_name || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      String(p.id).includes(q)
    ).slice(0, 20);
  }, [linkableProducts, linkSearch]);

  const groupsForDropdown = useMemo(() => {
    const typeFiltered =
      filterType === 'all'
        ? products
        : products.filter((p) => String(p.service_type || '').toUpperCase() === filterType);

    return Array.from(
      new Set(typeFiltered.map((p) => String(p.group_name || '').trim()).filter(Boolean)),
    );
  }, [products, filterType]);

  useEffect(() => {
    if (filterGroup !== 'all' && !groupsForDropdown.includes(filterGroup)) {
      setFilterGroup('all');
    }
  }, [filterGroup, groupsForDropdown]);

  const stats = {
    total: products.length,
    active: products.filter((p) => String(p.status || '').toLowerCase() === 'active' || p.status === 'نشط').length,
    imei: products.filter((p) => String(p.service_type || '').toUpperCase() === 'IMEI').length,
    server: products.filter((p) => String(p.service_type || '').toUpperCase() === 'SERVER').length,
  };

  const filtered = products.filter(p => {
    const searchMatch =
      String(p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p.arabic_name || '').toLowerCase().includes(search.toLowerCase());

    const statusRaw = String(p.status || '').toLowerCase();
    const statusNormalized = statusRaw === 'نشط' ? 'active' : statusRaw;
    const statusMatch = filterStatus === 'all' || statusNormalized === filterStatus;

    const typeMatch = filterType === 'all' || String(p.service_type || '').toUpperCase() === filterType;
    const groupMatch = filterGroup === 'all' || String(p.group_name || '').trim() === filterGroup;

    return searchMatch && statusMatch && typeMatch && groupMatch;
  });

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 120, height: 24, borderRadius: 8, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 140, height: 36, borderRadius: 10, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 70, borderRadius: 14, background: '#fff', border: '1px solid #f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: 56, borderRadius: 10, background: '#fff', border: '1px solid #f1f5f9', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>📦 المنتجات</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.5rem 0.85rem', borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
          }}>
            <Search size={14} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              style={{ border: 'none', outline: 'none', width: 140, fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', background: 'transparent' }}
            />
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.6rem 1.25rem', borderRadius: 10,
            background: theme.primary, color: '#fff',
            border: 'none', fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}>
            <Plus size={16} /> إضافة منتج
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>منتج جديد</h3>
            <button onClick={() => setShowAdd(false)} style={{
              width: 28, height: 28, borderRadius: 6,
              border: 'none', background: '#f1f5f9',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>
              <X size={14} color="#64748b" />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <input placeholder="اسم المنتج" value={newName} onChange={e => setNewName(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <input placeholder="اسم المنتج بالعربي" value={newArabicName} onChange={e => setNewArabicName(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <input placeholder="السعر ($)" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <select value={newServiceType} onChange={e => setNewServiceType(e.target.value as 'SERVER' | 'IMEI' | 'REMOTE')} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff',
            }}>
              <option value="SERVER">SERVER</option>
              <option value="IMEI">IMEI</option>
              <option value="REMOTE">REMOTE</option>
            </select>
            <select value={newGroup} onChange={e => { setNewGroup(e.target.value); if (e.target.value !== '__new__') setNewCustomGroup(''); }} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff',
            }}>
              <option value="">— اختر القروب —</option>
              {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
              <option value="__new__">➕ قروب جديد...</option>
            </select>
            {newGroup === '__new__' && (
              <input placeholder="اسم القروب الجديد" value={newCustomGroup} onChange={e => setNewCustomGroup(e.target.value)} style={{
                padding: '0.65rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none',
              }} />
            )}
          </div>
          <textarea rows={2} placeholder="وصف المنتج..." value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{
            width: '100%', padding: '0.65rem 1rem', borderRadius: 10,
            border: '1px solid #e2e8f0', fontSize: '0.85rem',
            fontFamily: 'Tajawal, sans-serif', outline: 'none',
            resize: 'vertical', marginBottom: 14, boxSizing: 'border-box',
          }} />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: '0.8rem', fontWeight: 700, color: '#334155', fontFamily: 'Tajawal, sans-serif' }}>
            <input type="checkbox" checked={newIsGame} onChange={(e) => setNewIsGame(e.target.checked)} style={{ width: 16, height: 16 }} />
            تصنيف كـ لعبة (isGame)
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAddProduct} disabled={saving} style={{
              padding: '0.6rem 1.5rem', borderRadius: 10,
              background: theme.primary, color: '#fff',
              border: 'none', fontSize: '0.82rem', fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
              opacity: saving ? 0.7 : 1,
            }}>{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
            <button onClick={() => setShowAdd(false)} style={{
              padding: '0.6rem 1.5rem', borderRadius: 10,
              background: '#f1f5f9', color: '#64748b',
              border: 'none', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>إلغاء</button>
          </div>
        </div>
      )}


      {/* ─── Stats Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'إجمالي المنتجات', value: stats.total, bg: '#f8fafc', color: '#0b1020', icon: '📦' },
          { label: 'منتجات نشطة', value: stats.active, bg: '#f0fdf4', color: '#16a34a', icon: '✅' },
          { label: 'خدمات IMEI', value: stats.imei, bg: '#eff6ff', color: '#2563eb', icon: '📱' },
          { label: 'أدوات سوفتوير', value: stats.server, bg: '#f5f3ff', color: '#7c3aed', icon: '🖥️' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2, lineHeight: 1 }}>{item.label}</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Groups Management Toggle ─── */}
      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={() => setShowGroups(!showGroups)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.5rem 1rem', borderRadius: 10,
          background: showGroups ? theme.primary : '#f8fafc',
          color: showGroups ? '#fff' : '#64748b',
          border: '1px solid ' + (showGroups ? theme.primary : '#e2e8f0'),
          fontSize: '0.8rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          transition: 'all 0.2s',
        }}>
          <Layers size={15} />
          إدارة القروبات ({groupsData.length})
        </button>
      </div>

      {/* ─── Groups Management Table ─── */}
      {showGroups && (
        <div style={{
          background: '#fff', borderRadius: 14,
          border: '1px solid #e2e8f0', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 16,
        }}>
          <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0b1020' }}>📂 القروبات</h3>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{groupsData.length} قروب</span>
          </div>

          {groupsData.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد قروبات</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['#', 'اسم القروب', 'عدد المنتجات', 'إجراءات'].map(h => (
                    <th key={h} style={{ padding: '0.7rem 0.8rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupsData.map((g, idx) => (
                  <tr key={g.name} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbfd')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.65rem 0.8rem', fontSize: '0.7rem', color: '#94a3b8', width: 40 }}>{idx + 1}</td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      {renamingGroup === g.name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleRenameGroup(g.name); if (e.key === 'Escape') { setRenamingGroup(null); setRenameValue(''); } }}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', width: 220 }}
                          />
                          <button type="button" onClick={() => handleRenameGroup(g.name)} disabled={groupActionLoading} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#dcfce7', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                            <Check size={13} color="#16a34a" />
                          </button>
                          <button type="button" onClick={() => { setRenamingGroup(null); setRenameValue(''); }} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                            <X size={13} color="#64748b" />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0b1020' }}>{g.name}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: 5, background: '#eff6ff', fontSize: '0.72rem', fontWeight: 700, color: '#2563eb' }}>{g.count}</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" onClick={() => { setRenamingGroup(g.name); setRenameValue(g.name); }} disabled={groupActionLoading} title="تعديل الاسم" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#f0f9ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Edit size={13} color="#0ea5e9" />
                        </button>
                        <button type="button" onClick={() => handleDeleteGroup(g.name, g.count)} disabled={groupActionLoading} title="حذف القروب ومنتجاتها" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fef2f2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Trash2 size={13} color="#dc2626" />
                        </button>
                        <button type="button" onClick={() => { setFilterGroup(g.name); setShowGroups(false); }} title="عرض المنتجات" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#f0fdf4', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Search size={13} color="#16a34a" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── Filters + Bulk Actions Bar ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.45rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif' }}>
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.45rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif' }}>
            <option value="all">كل الأنواع</option>
            <option value="SERVER">SERVER</option>
            <option value="IMEI">IMEI</option>
            <option value="REMOTE">REMOTE</option>
          </select>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} style={{ padding: '0.45rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', minWidth: 160 }}>
            <option value="all">كل القروبات</option>
            {groupsForDropdown.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        {/* Bulk delete button */}
        {selectedIds.size > 0 && (
          <button type="button" onClick={handleBulkDelete} disabled={bulkDeleting} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.45rem 1rem', borderRadius: 8,
            background: '#dc2626', color: '#fff',
            border: 'none', fontSize: '0.78rem', fontWeight: 700,
            cursor: bulkDeleting ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
            opacity: bulkDeleting ? 0.7 : 1,
          }}>
            <Trash2 size={14} />
            {bulkDeleting ? 'جاري الحذف...' : `حذف المحدد (${selectedIds.size})`}
          </button>
        )}
      </div>

      {/* ─── Products Table ─── */}
      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #e2e8f0', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>لا توجد منتجات مطابقة للفلتر</p>
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.7rem 0.5rem 0.7rem 0.8rem', width: 40 }}>
                  <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: theme.primary }} />
                </th>
                {['#', 'المنتج', 'السعر', 'النوع', 'المصدر', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{
                    padding: '0.7rem 0.65rem', textAlign: 'right',
                    fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const isSelected = selectedIds.has(p.id);
                const statusRaw = String(p.status || 'active').toLowerCase();
                const isActive = statusRaw === 'active' || statusRaw === 'نشط';
                const typeColors: Record<string, {bg: string, color: string}> = {
                  IMEI: { bg: '#dbeafe', color: '#1d4ed8' },
                  SERVER: { bg: '#ede9fe', color: '#6d28d9' },
                  REMOTE: { bg: '#fef3c7', color: '#b45309' },
                };
                const sType = String(p.service_type || 'SERVER').toUpperCase();
                const tc = typeColors[sType] || { bg: '#f1f5f9', color: '#64748b' };

                return (
                <tr key={p.id} style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: isSelected ? '#f0f7ff' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <td style={{ padding: '0.65rem 0.5rem 0.65rem 0.8rem', width: 40 }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: theme.primary }} />
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, width: 40 }}>{idx + 1}</td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{p.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0b1020', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{displayName(p)}</p>
                        {secondaryName(p) && <p style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{secondaryName(p)}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#0b1020', whiteSpace: 'nowrap' }}>${String(p.price).replace('$', '')}</td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: 5,
                      background: tc.bg, fontSize: '0.68rem', fontWeight: 700, color: tc.color,
                    }}>{sType}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    {p.source_id ? (
                      <span title={`#${p.source_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '0.15rem 0.45rem', borderRadius: 5, background: '#ecfdf5', fontSize: '0.65rem', fontWeight: 700, color: '#059669', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🔗 {p.source_name || `مصدر #${p.source_id}`}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: 5, background: isActive ? '#dcfce7' : '#fee2e2', fontSize: '0.68rem', fontWeight: 700, color: isActive ? '#16a34a' : '#dc2626' }}>{isActive ? 'نشط' : 'غير نشط'}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <button type="button" onClick={(e) => handleToggleFeatured(e, p.id)} title={p.is_featured ? 'إلغاء التمييز' : 'تمييز المنتج'} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: p.is_featured ? '#fef3c7' : '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Star size={12} color={p.is_featured ? '#f59e0b' : '#cbd5e1'} fill={p.is_featured ? '#f59e0b' : 'none'} /></button>
                      <button type="button" onClick={(e) => handleToggleNamePriority(e, p)} title={`أولوية: ${(p.name_priority || 'ar') === 'ar' ? 'عربي' : 'En'}`} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: (p.name_priority || 'ar') === 'ar' ? '#f0fdf4' : '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '0.58rem', fontWeight: 800, color: (p.name_priority || 'ar') === 'ar' ? '#16a34a' : '#2563eb' }}>{(p.name_priority || 'ar') === 'ar' ? 'ع' : 'En'}</button>
                      <button type="button" onClick={() => openEdit(p)} title="تعديل" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={12} color="#3b82f6" /></button>
                      <button type="button" onClick={() => handleDelete(p.id)} title="حذف" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={12} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        {/* Table footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {selectedIds.size > 0 ? `${selectedIds.size} محدد من ` : ''}عرض {filtered.length} من {products.length} منتج
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.7rem 1.25rem', borderRadius: 10,
          background: toast.type === 'error' ? '#dc2626' : '#16a34a',
          color: '#fff', fontSize: '0.82rem', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          fontFamily: 'Tajawal, sans-serif',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckSquare size={16} />}
          {toast.message}
        </div>
      )}
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

      {/* Edit Product Modal */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={closeEdit}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: '95%', maxWidth: 820, maxHeight: '92vh', overflow: 'auto', padding: '1rem 1.15rem', border: '1px solid #e2e8f0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0b1020' }}>✏️ تعديل المنتج</h3>
              <button type="button" onClick={closeEdit} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={12} color="#64748b" />
              </button>
            </div>

            {/* ─── معلومات أساسية ─── */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>معلومات أساسية</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <input placeholder="الاسم (إنجليزي)" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              <input placeholder="الاسم (عربي)" value={editArabicName} onChange={(e) => setEditArabicName(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              <input placeholder="السعر ($)" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* ─── إعدادات ─── */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>إعدادات</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              <select value={editServiceType} onChange={(e) => setEditServiceType(e.target.value)} style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="SERVER">SERVER</option>
                <option value="IMEI">IMEI</option>
                <option value="REMOTE">REMOTE</option>
              </select>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
              <input placeholder="أيقونة" value={editIcon} onChange={(e) => setEditIcon(e.target.value)} style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
              <select value={editNamePriority} onChange={(e) => setEditNamePriority(e.target.value as 'ar' | 'en')} style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="ar">🔤 عربي أولاً</option>
                <option value="en">🔤 English أولاً</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.76rem', fontWeight: 800, color: '#334155', fontFamily: 'Tajawal, sans-serif' }}>
              <input type="checkbox" checked={editIsGame} onChange={(e) => setEditIsGame(e.target.checked)} style={{ width: 16, height: 16 }} />
              تصنيف كـ لعبة (isGame)
            </label>

            {/* ─── القروب ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: editGroup === '__new__' ? '1fr 1fr' : '1fr', gap: 8, marginBottom: 10 }}>
              <select value={editGroup === '__new__' ? '__new__' : editGroup} onChange={e => { setEditGroup(e.target.value); if (e.target.value !== '__new__') setEditCustomGroup(''); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">— بدون قروب —</option>
                {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="__new__">➕ قروب جديد...</option>
              </select>
              {editGroup === '__new__' && (
                <input placeholder="اسم القروب الجديد" value={editCustomGroup} onChange={e => setEditCustomGroup(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>

            {/* ─── الوصف ─── */}
            <textarea rows={2} placeholder="وصف المنتج" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical', marginBottom: 10 }} />

            {/* ─── إعدادات الاتصال بالمصدر ─── */}
            <div style={{ padding: '0.75rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: 10 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>🔗 اتصال المصدر</p>

              {editOriginalSourceId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0b1020' }}>
                      {editSourceConnected ? '✅ متصل' : '❌ مفصول'}
                    </p>
                    <p style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                      {editSourceConnected ? 'يرسل الطلبات تلقائياً' : 'الطلبات تبقى معلقة'}
                    </p>
                  </div>
                  <button onClick={() => setEditSourceConnected(!editSourceConnected)} type="button" style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.3rem 0.65rem', borderRadius: 6,
                    background: editSourceConnected ? '#fee2e2' : '#dcfce7',
                    color: editSourceConnected ? '#dc2626' : '#16a34a',
                    border: 'none', fontSize: '0.68rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  }}>
                    {editSourceConnected ? <><Unlink size={11} /> فصل</> : <><Link2 size={11} /> ربط</>}
                  </button>
                </div>
              )}

              {/* تحويل لمنتج آخر */}
              <div style={{ padding: '0.45rem 0.65rem', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0b1020' }}>🔄 تحويل لمنتج آخر</p>
                  {editLinkedProductId && (
                    <button onClick={() => setEditLinkedProductId(null)} type="button" style={{ padding: '0.15rem 0.45rem', borderRadius: 4, border: 'none', background: '#fee2e2', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 700, color: '#dc2626', fontFamily: 'Tajawal, sans-serif' }}>
                      إلغاء التحويل
                    </button>
                  )}
                </div>

                {editLinkedProductId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.55rem', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe', marginBottom: 6 }}>
                    <Link2 size={11} color="#2563eb" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e40af', flex: 1 }}>
                      {(() => { const lp = products.find(p => p.id === editLinkedProductId); return lp ? (lp.arabic_name || lp.name) + ` (#${lp.id})` : `#${editLinkedProductId}`; })()}
                    </span>
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.35rem 0.55rem', background: '#fff' }}>
                    <Search size={11} color="#94a3b8" />
                    <input
                      value={linkSearch}
                      onChange={e => { setLinkSearch(e.target.value); setShowLinkDropdown(true); }}
                      onFocus={() => setShowLinkDropdown(true)}
                      placeholder="ابحث عن منتج..."
                      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.7rem', fontFamily: 'Tajawal, sans-serif', background: 'transparent' }}
                    />
                  </div>

                  {showLinkDropdown && filteredLinkable.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 50, marginTop: 3, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: 180, overflow: 'auto' }}>
                      {filteredLinkable.map(p => (
                        <button key={p.id} type="button" onClick={() => { setEditLinkedProductId(p.id); setLinkSearch(''); setShowLinkDropdown(false); }} style={{
                          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                          padding: '0.4rem 0.65rem', background: editLinkedProductId === p.id ? '#eff6ff' : 'transparent',
                          border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                          fontFamily: 'Tajawal, sans-serif', textAlign: 'right',
                        }}>
                          <span style={{ fontSize: '0.85rem' }}>{p.icon}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0b1020' }}>{p.arabic_name || p.name}</p>
                            {p.arabic_name && <p style={{ fontSize: '0.58rem', color: '#94a3b8' }}>{p.name}</p>}
                          </div>
                          <span style={{ fontSize: '0.6rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: 3 }}>#{p.id}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
              <button type="button" onClick={handleUpdateProduct} disabled={updating} style={{ padding: '0.5rem 1.3rem', borderRadius: 8, background: theme.primary, color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: updating ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: updating ? 0.7 : 1 }}>
                {updating ? 'جاري الحفظ...' : 'حفظ التعديل'}
              </button>
              <button type="button" onClick={closeEdit} style={{ padding: '0.5rem 1.3rem', borderRadius: 8, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
