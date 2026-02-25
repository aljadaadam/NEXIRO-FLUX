'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Star, Unlink, Link2, CheckSquare, AlertCircle, Check, Package, CheckCircle, Smartphone, Monitor, FolderOpen, RefreshCw, Type, Settings2, FileText, DollarSign, Gamepad2, Globe, ToggleLeft, Save, Database, ArrowRightLeft, ListOrdered, Plus as PlusIcon, Minus } from 'lucide-react';
import { adminApi, mapBackendProduct } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { Product } from '@/lib/types';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

export default function ProductsPage({ theme }: { theme: ColorTheme }) {
  const { t, isRTL } = useAdminLang();
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

  // New product — source connection
  const [newSourceId, setNewSourceId] = useState<number | null>(null);
  const [newLinkedProductId, setNewLinkedProductId] = useState<number | null>(null);
  const [newLinkSearch, setNewLinkSearch] = useState('');
  const [showNewLinkDropdown, setShowNewLinkDropdown] = useState(false);

  // New product — custom fields
  const [newCustomFields, setNewCustomFields] = useState<Array<{ key: string; label: string; placeholder: string; required: boolean }>>([]);

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
  const [editAllowsQnt, setEditAllowsQnt] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Source & product linking state
  const [editSourceConnected, setEditSourceConnected] = useState(true);
  const [editLinkedProductId, setEditLinkedProductId] = useState<number | null>(null);
  const [linkSearch, setLinkSearch] = useState('');
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const [editOriginalSourceId, setEditOriginalSourceId] = useState<number | null>(null);
  const [editSelectedSourceId, setEditSelectedSourceId] = useState<number | null>(null);
  const [sources, setSources] = useState<Array<{ id: number; name: string; url?: string; productsCount?: number }>>([]);
  const [editCustomFields, setEditCustomFields] = useState<Array<{ key: string; label: string; placeholder: string; required: boolean }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Groups management state
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [bulkDeletingGroups, setBulkDeletingGroups] = useState(false);
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    loadProducts();
    loadSources();
  }, []);

  async function loadProducts() {
    try {
      const res = await adminApi.getProducts();
      const raw = Array.isArray(res) ? res : (res?.products && Array.isArray(res.products) ? res.products : []);
      const mapped = raw.map((p: Record<string, unknown>) => mapBackendProduct(p)) as Product[];
      setProducts(mapped);
    } catch { /* keep fallback */ }
    finally { setLoading(false); }
  }

  async function loadSources() {
    try {
      const res = await adminApi.getSources();
      if (Array.isArray(res)) setSources(res);
      else if (res?.sources && Array.isArray(res.sources)) setSources(res.sources);
    } catch { /* ignore */ }
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
      const createData: Record<string, unknown> = {
        name: newName,
        arabic_name: newArabicName || null,
        price: Number.parseFloat(String(newPrice).replace(/[$,\s]/g, '')),
        description: newDesc,
        service_type: newServiceType,
        group_name: groupValue,
        status: 'active',
        is_game: newIsGame ? 1 : 0,
      };
      if (newSourceId) createData.source_id = newSourceId;
      if (newLinkedProductId) createData.linked_product_id = newLinkedProductId;
      if (newCustomFields.length > 0) {
        const fieldsArr = newCustomFields.filter(f => f.key.trim()).map(f => ({
          key: f.key.trim(),
          label: f.label.trim() || f.key.trim(),
          placeholder: f.placeholder.trim() || (isRTL ? `أدخل ${f.label.trim() || f.key.trim()}` : `Enter ${f.label.trim() || f.key.trim()}`),
          required: f.required ? '1' : '0',
        }));
        if (fieldsArr.length > 0) createData.requires_custom_json = fieldsArr;
      }
      await adminApi.createProduct(createData);
      setShowAdd(false);
      setNewName(''); setNewArabicName(''); setNewPrice(''); setNewDesc('');
      setNewServiceType('SERVER'); setNewGroup(''); setNewCustomGroup('');
      setNewIsGame(false); setNewSourceId(null); setNewLinkedProductId(null);
      setNewLinkSearch(''); setShowNewLinkDropdown(false); setNewCustomFields([]);
      showToast(t('تم إنشاء المنتج بنجاح'));
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل إنشاء المنتج');
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
    setEditAllowsQnt(!!product.allowsQuantity);
    setEditSourceConnected(!!product.source_id);
    setEditOriginalSourceId(product.source_id || null);
    setEditSelectedSourceId(product.source_id || null);
    setEditLinkedProductId(product.linked_product_id ?? null);
    setLinkSearch('');
    setShowLinkDropdown(false);
    // تحميل حقول المنتج - إذا موجودة استخدمها، وإلا جلب الافتراضية
    const existingFields = (product.customFields || []).map(f => ({
      key: f.key || '',
      label: f.label || '',
      placeholder: f.placeholder || '',
      required: f.required !== false,
    }));
    if (existingFields.length > 0) {
      setEditCustomFields(existingFields);
    } else {
      // حقول افتراضية حسب نوع الخدمة
      const sType = (product.service_type || 'SERVER').toUpperCase();
      if (sType === 'IMEI') {
        setEditCustomFields([{ key: 'imei', label: t('رقم IMEI'), placeholder: t('مثال: 356938035643809'), required: true }]);
      } else if (sType === 'SERVER') {
        setEditCustomFields([
          { key: 'username', label: t('اسم المستخدم'), placeholder: t('أدخل اسم المستخدم'), required: true },
          { key: 'password', label: t('كلمة المرور'), placeholder: t('أدخل كلمة المرور'), required: true },
        ]);
      } else {
        setEditCustomFields([{ key: 'info', label: t('معلومات'), placeholder: t('أدخل المعلومات المطلوبة'), required: true }]);
      }
    }
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
        stock: editAllowsQnt ? '1' : null,
      };

      // إدارة المصدر
      if (!editSourceConnected) {
        updateData.source_id = null; // فصل المنتج من المصدر
      } else if (editSelectedSourceId !== editOriginalSourceId) {
        updateData.source_id = editSelectedSourceId; // تغيير المصدر
      }

      // تحويل الاتصال لمنتج آخر
      updateData.linked_product_id = editLinkedProductId;

      // حفظ حقول المنتج المخصصة
      if (editCustomFields.length > 0) {
        // Build requires_custom_json from fields
        const fieldsArr = editCustomFields.filter(f => f.key.trim()).map(f => ({
          key: f.key.trim(),
          label: f.label.trim() || f.key.trim(),
          placeholder: f.placeholder.trim() || (isRTL ? `أدخل ${f.label.trim() || f.key.trim()}` : `Enter ${f.label.trim() || f.key.trim()}`),
          required: f.required ? '1' : '0',
        }));
        updateData.requires_custom_json = fieldsArr.length > 0 ? fieldsArr : null;
        // Check if first field is IMEI-type, build custom_json
        const firstField = fieldsArr[0];
        if (firstField && firstField.key.toLowerCase() === 'imei') {
          updateData.custom_json = { allow: '1', customname: firstField.label, custominfo: firstField.placeholder };
        }
      } else {
        updateData.requires_custom_json = null;
      }

      await adminApi.updateProduct(editId, updateData);
      closeEdit();
      showToast(t('تم تحديث المنتج بنجاح'));
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل تحديث المنتج');
      showToast(msg, 'error');
    }
    finally { setUpdating(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.'))) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      showToast(t('تم حذف المنتج'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل حذف المنتج');
      showToast(msg, 'error');
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(isRTL ? `هل أنت متأكد من حذف ${selectedIds.size} منتج؟ لا يمكن التراجع.` : `Are you sure you want to delete ${selectedIds.size} product(s)? This cannot be undone.`)) return;
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
      showToast(isRTL ? `تم حذف ${successCount} منتج، فشل ${failCount}` : `Deleted ${successCount} product(s), ${failCount} failed`, 'error');
    } else {
      showToast(isRTL ? `تم حذف ${successCount} منتج بنجاح` : `Successfully deleted ${successCount} product(s)`);
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
      alert(t('فشل تبديل حالة المنتج المميز — تأكد من أن الخادم يعمل'));
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
      showToast(res?.message || t('تم تغيير اسم القروب'));
      setRenamingGroup(null);
      setRenameValue('');
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل تغيير اسم القروب');
      showToast(msg, 'error');
    } finally {
      setGroupActionLoading(false);
    }
  }

  async function handleDeleteGroup(groupName: string, productCount: number) {
    if (!confirm(isRTL ? `هل أنت متأكد من حذف قروب "${groupName}" مع جميع منتجاتها (${productCount} منتج)؟\nلا يمكن التراجع.` : `Are you sure you want to delete group "${groupName}" with all its products (${productCount} product(s))?\nThis cannot be undone.`)) return;
    setGroupActionLoading(true);
    try {
      const res = await adminApi.deleteGroup(groupName);
      showToast(res?.message || t('تم حذف القروب'));
      setSelectedGroups(prev => { const n = new Set(prev); n.delete(groupName); return n; });
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('فشل حذف القروب');
      showToast(msg, 'error');
    } finally {
      setGroupActionLoading(false);
    }
  }

  async function handleBulkDeleteGroups() {
    if (selectedGroups.size === 0) return;
    const totalProducts = groupsData.filter(g => selectedGroups.has(g.name)).reduce((sum, g) => sum + g.count, 0);
    if (!confirm(isRTL ? `هل أنت متأكد من حذف ${selectedGroups.size} قروب مع جميع منتجاتها (${totalProducts} منتج)؟\nلا يمكن التراجع.` : `Are you sure you want to delete ${selectedGroups.size} group(s) with all their products (${totalProducts} product(s))?\nThis cannot be undone.`)) return;
    setBulkDeletingGroups(true);
    let successCount = 0;
    let failCount = 0;
    for (const name of selectedGroups) {
      try {
        await adminApi.deleteGroup(name);
        successCount++;
      } catch {
        failCount++;
      }
    }
    setSelectedGroups(new Set());
    if (failCount > 0) {
      showToast(isRTL ? `تم حذف ${successCount} قروب، فشل ${failCount}` : `Deleted ${successCount} group(s), ${failCount} failed`, 'error');
    } else {
      showToast(isRTL ? `تم حذف ${successCount} قروب بنجاح` : `Successfully deleted ${successCount} group(s)`);
    }
    await loadProducts();
    setBulkDeletingGroups(false);
  }

  // بيانات القروبات مع عدد المنتجات (حسب التصنيف المختار)
  const groupsData = useMemo(() => {
    const typeFiltered = filterType === 'all' ? products : products.filter(p => String(p.service_type || '').toUpperCase() === filterType);
    const map = new Map<string, number>();
    for (const p of typeFiltered) {
      const g = String(p.group_name || '').trim();
      if (g) map.set(g, (map.get(g) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products, filterType]);

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

  // المنتجات المتاحة للتحويل (حسب المصدر المختار + نفس نوع الخدمة)
  const linkableProducts = useMemo(() => {
    const editingProduct = products.find(p => p.id === editId);
    const editingType = editingProduct?.service_type?.toUpperCase() || editServiceType?.toUpperCase() || '';
    return products.filter(p => {
      if (p.id === editId) return false;
      // فلتر حسب المصدر المختار
      if (editSelectedSourceId && Number(p.source_id) !== editSelectedSourceId) return false;
      // فلتر حسب نوع الخدمة فقط إذا لم يتم تحديد مصدر
      if (!editSelectedSourceId && editingType && (p.service_type || '').toUpperCase() !== editingType) return false;
      return true;
    });
  }, [products, editId, editSelectedSourceId, editServiceType]);

  const filteredLinkable = useMemo(() => {
    if (!linkSearch.trim()) return linkableProducts;
    const q = linkSearch.toLowerCase();
    return linkableProducts.filter(p =>
      (p.arabic_name || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
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
    if (filterGroup !== 'all' && filterGroup !== '__manage_groups__' && !groupsForDropdown.includes(filterGroup)) {
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
    const groupMatch = filterGroup === 'all' || filterGroup === '__manage_groups__' || String(p.group_name || '').trim() === filterGroup;

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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}><Package size={22} color="#64748b" /> {t('المنتجات')}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.5rem 0.85rem', borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
          }}>
            <Search size={14} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('بحث...')}
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
            <Plus size={16} /> {t('إضافة منتج')}
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('منتج جديد')}</h3>
            <button onClick={() => setShowAdd(false)} style={{
              width: 28, height: 28, borderRadius: 6,
              border: 'none', background: '#f1f5f9',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>
              <X size={14} color="#64748b" />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <input placeholder={t('اسم المنتج')} value={newName} onChange={e => setNewName(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <input placeholder={t('اسم المنتج بالعربي')} value={newArabicName} onChange={e => setNewArabicName(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <input placeholder={t('السعر ($)')} value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{
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
              <option value="">{t('— اختر القروب —')}</option>
              {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
              <option value="__new__">{t('➕ قروب جديد...')}</option>
            </select>
            {newGroup === '__new__' && (
              <input placeholder={t('اسم القروب الجديد')} value={newCustomGroup} onChange={e => setNewCustomGroup(e.target.value)} style={{
                padding: '0.65rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none',
              }} />
            )}
          </div>
          <textarea rows={2} placeholder={t('وصف المنتج...')} value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{
            width: '100%', padding: '0.65rem 1rem', borderRadius: 10,
            border: '1px solid #e2e8f0', fontSize: '0.85rem',
            fontFamily: 'Tajawal, sans-serif', outline: 'none',
            resize: 'vertical', marginBottom: 14, boxSizing: 'border-box',
          }} />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: '0.8rem', fontWeight: 700, color: '#334155', fontFamily: 'Tajawal, sans-serif' }}>
            <input type="checkbox" checked={newIsGame} onChange={(e) => setNewIsGame(e.target.checked)} style={{ width: 16, height: 16 }} />
            {t('تصنيف كـ لعبة (isGame)')}
          </label>

          {/* ─── Source Connection ─── */}
          <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fce7f3', display: 'grid', placeItems: 'center' }}>
                <Link2 size={14} color="#db2777" />
              </div>
              <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('اتصال المصدر')}</p>
              {newSourceId && (
                <div style={{ ...(isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }), display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#16a34a' }}>
                    {t('متصل — يرسل تلقائياً')}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Source selector */}
              <div style={{ padding: '0.55rem 0.75rem', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Database size={10} /> {t('المصدر المرتبط')}
                </label>
                <select
                  value={String(newSourceId || '')}
                  onChange={e => {
                    const val = e.target.value;
                    setNewSourceId(val ? Number(val) : null);
                    setNewLinkedProductId(null);
                    setNewLinkSearch('');
                    setShowNewLinkDropdown(false);
                  }}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.74rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fafbfc', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="">{t('— بدون مصدر (مفصول) —')}</option>
                  {sources.map(s => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Linked product selector */}
              <div style={{ padding: '0.55rem 0.75rem', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw size={10} /> {t('المنتج المرتبط (تحويل الطلب)')}
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => { setShowNewLinkDropdown(!showNewLinkDropdown); setNewLinkSearch(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                      padding: '0.5rem 0.65rem', borderRadius: 8,
                      border: '1px solid ' + (showNewLinkDropdown ? '#93c5fd' : '#e2e8f0'),
                      background: '#fafbfc', cursor: 'pointer',
                      fontFamily: 'Tajawal, sans-serif', textAlign: isRTL ? 'right' : 'left',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {newLinkedProductId ? (
                      <>
                        <Link2 size={12} color="#2563eb" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e40af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(() => { const lp = products.find(p => p.id === newLinkedProductId); return lp ? (lp.arabic_name || lp.name) : `#${newLinkedProductId}`; })()}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} color="#94a3b8" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', flex: 1 }}>
                          {t('نفس المنتج')}
                        </span>
                      </>
                    )}
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', transform: showNewLinkDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▾</span>
                  </button>

                  {showNewLinkDropdown && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 50, marginTop: 3, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                      <div style={{ padding: '0.4rem 0.55rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.3rem 0.5rem', background: '#fff' }}>
                          <Search size={11} color="#94a3b8" />
                          <input
                            value={newLinkSearch}
                            onChange={e => setNewLinkSearch(e.target.value)}
                            autoFocus
                            placeholder={isRTL ? `ابحث في المنتجات...` : `Search products...`}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.68rem', fontFamily: 'Tajawal, sans-serif', background: 'transparent' }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNewLinkedProductId(null); setNewLinkSearch(''); setShowNewLinkDropdown(false); setNewCustomFields([]); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                          padding: '0.45rem 0.65rem',
                          background: !newLinkedProductId ? '#f0fdf4' : 'transparent',
                          border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                          fontFamily: 'Tajawal, sans-serif', textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        <CheckCircle size={11} color="#16a34a" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151', flex: 1 }}>{t('نفس المنتج')}</span>
                        <span style={{ fontSize: '0.55rem', color: '#16a34a', fontWeight: 700 }}>{t('✦ نفسه')}</span>
                      </button>
                      <div style={{ maxHeight: 200, overflow: 'auto' }}>
                        {(() => {
                          const q = newLinkSearch.toLowerCase();
                          const filtered = products.filter(p => {
                            if (newSourceId && Number(p.source_id) !== newSourceId) return false;
                            if (!newSourceId && newServiceType && (p.service_type || '').toUpperCase() !== newServiceType.toUpperCase()) return false;
                            if (q && !(p.arabic_name || '').toLowerCase().includes(q) && !(p.name || '').toLowerCase().includes(q) && !String(p.id).includes(q)) return false;
                            return true;
                          });
                          if (filtered.length === 0) return (
                            <div style={{ padding: '0.6rem', textAlign: 'center' }}>
                              <p style={{ fontSize: '0.66rem', color: '#94a3b8', margin: 0 }}>{t('لا توجد نتائج')}</p>
                            </div>
                          );
                          const grouped = new Map<string, typeof filtered>();
                          for (const p of filtered) {
                            const g = p.group_name || '';
                            if (!grouped.has(g)) grouped.set(g, []);
                            grouped.get(g)!.push(p);
                          }
                          return Array.from(grouped.entries()).map(([groupName, items]) => (
                            <div key={groupName}>
                              {groupName && (
                                <div style={{ padding: '0.3rem 0.65rem', fontSize: '0.6rem', fontWeight: 800, color: '#475569', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontFamily: 'Tajawal, sans-serif' }}>
                                  {groupName}
                                </div>
                              )}
                              {items.map(p => (
                                <button key={p.id} type="button" onClick={() => { setNewLinkedProductId(p.id); setNewLinkSearch(''); setShowNewLinkDropdown(false); const fields = (p.customFields || []).map(f => ({ key: f.key || '', label: f.label || '', placeholder: f.placeholder || '', required: f.required !== false })); if (fields.length > 0) { setNewCustomFields(fields); } else { const sType = (p.service_type || 'SERVER').toUpperCase(); if (sType === 'IMEI') setNewCustomFields([{ key: 'imei', label: t('رقم IMEI'), placeholder: t('مثال: 356938035643809'), required: true }]); else if (sType === 'SERVER') setNewCustomFields([{ key: 'username', label: t('اسم المستخدم'), placeholder: t('أدخل اسم المستخدم'), required: true }, { key: 'password', label: t('كلمة المرور'), placeholder: t('أدخل كلمة المرور'), required: true }]); else setNewCustomFields([{ key: 'info', label: t('معلومات'), placeholder: t('أدخل المعلومات المطلوبة'), required: true }]); } }} style={{
                                  display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                                  padding: '0.4rem 0.65rem',
                                  background: newLinkedProductId === p.id ? '#eff6ff' : 'transparent',
                                  border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                                  fontFamily: 'Tajawal, sans-serif', textAlign: isRTL ? 'right' : 'left',
                                  transition: 'background 0.1s',
                                }} onMouseOver={e => { if (newLinkedProductId !== p.id) e.currentTarget.style.background = '#f8fafc'; }} onMouseOut={e => { if (newLinkedProductId !== p.id) e.currentTarget.style.background = 'transparent'; }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#0b1020', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.arabic_name || p.name}</p>
                                  </div>
                                  <span style={{ fontSize: '0.56rem', color: '#64748b', flexShrink: 0 }}>
                                    {p.price ? `${p.price} USD` : `#${p.id}`}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Custom Fields ─── */}
          <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#e0f2fe', display: 'grid', placeItems: 'center' }}>
                <ListOrdered size={14} color="#0284c7" />
              </div>
              <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('حقول المنتج')}</p>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                {newCustomFields.length} {t('حقل')}
              </span>
              <p style={{ fontSize: '0.58rem', color: '#94a3b8', margin: 0, ...(isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }) }}>
                {t('الحقول التي يملأها العميل عند الطلب')}
              </p>
            </div>

            {newCustomFields.length > 0 && (
              <div style={{ borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 60px 36px', gap: 0, background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{t('المفتاح (Key)')}</div>
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{t('التسمية (Label)')}</div>
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{t('النص التوضيحي')}</div>
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>{t('مطلوب')}</div>
                  <div />
                </div>
                {newCustomFields.map((field, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 60px 36px', gap: 0, borderBottom: idx < newCustomFields.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                    <div style={{ padding: '0.3rem 0.4rem' }}>
                      <input value={field.key} onChange={e => { const arr = [...newCustomFields]; arr[idx] = { ...arr[idx], key: e.target.value }; setNewCustomFields(arr); }} placeholder="imei" style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.7rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: '#fafbfc', direction: 'ltr' }} />
                    </div>
                    <div style={{ padding: '0.3rem 0.4rem' }}>
                      <input value={field.label} onChange={e => { const arr = [...newCustomFields]; arr[idx] = { ...arr[idx], label: e.target.value }; setNewCustomFields(arr); }} placeholder={t('رقم IMEI')} style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.7rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fafbfc' }} />
                    </div>
                    <div style={{ padding: '0.3rem 0.4rem' }}>
                      <input value={field.placeholder} onChange={e => { const arr = [...newCustomFields]; arr[idx] = { ...arr[idx], placeholder: e.target.value }; setNewCustomFields(arr); }} placeholder={t('مثال: 356938035643809')} style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.7rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fafbfc' }} />
                    </div>
                    <div style={{ padding: '0.3rem 0.4rem', display: 'grid', placeItems: 'center' }}>
                      <input type="checkbox" checked={field.required} onChange={e => { const arr = [...newCustomFields]; arr[idx] = { ...arr[idx], required: e.target.checked }; setNewCustomFields(arr); }} style={{ width: 15, height: 15, accentColor: theme.primary, cursor: 'pointer' }} />
                    </div>
                    <div style={{ padding: '0.3rem 0.2rem', display: 'grid', placeItems: 'center' }}>
                      <button type="button" onClick={() => { const arr = [...newCustomFields]; arr.splice(idx, 1); setNewCustomFields(arr); }} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <Minus size={11} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" onClick={() => setNewCustomFields([...newCustomFields, { key: '', label: '', placeholder: '', required: true }])} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.75rem', borderRadius: 7, background: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s' }}>
                <Plus size={12} /> {t('إضافة حقل')}
              </button>
              {newCustomFields.length > 0 && (
                <button type="button" onClick={() => setNewCustomFields([])} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.75rem', borderRadius: 7, background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', ...(isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }) }}>
                  <Trash2 size={11} /> {t('مسح الكل')}
                </button>
              )}
            </div>

            {newCustomFields.length === 0 && (
              <div style={{ textAlign: 'center', padding: '0.8rem 0.5rem', color: '#94a3b8', fontSize: '0.68rem' }}>
                <p style={{ margin: 0, marginBottom: 2 }}>{t('لا توجد حقول مخصصة')}</p>
                <p style={{ margin: 0, fontSize: '0.58rem' }}>{t('أضف حقول ليملأها العميل عند الطلب')}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAddProduct} disabled={saving} style={{
              padding: '0.6rem 1.5rem', borderRadius: 10,
              background: theme.primary, color: '#fff',
              border: 'none', fontSize: '0.82rem', fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
              opacity: saving ? 0.7 : 1,
            }}>{saving ? t('جاري الحفظ...') : t('حفظ')}</button>
            <button onClick={() => setShowAdd(false)} style={{
              padding: '0.6rem 1.5rem', borderRadius: 10,
              background: '#f1f5f9', color: '#64748b',
              border: 'none', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>{t('إلغاء')}</button>
          </div>
        </div>
      )}


      {/* ─── Stats Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: t('إجمالي المنتجات'), value: stats.total, bg: '#f8fafc', color: '#0b1020', Icon: Package },
          { label: t('منتجات نشطة'), value: stats.active, bg: '#f0fdf4', color: '#16a34a', Icon: CheckCircle },
          { label: t('خدمات IMEI'), value: stats.imei, bg: '#eff6ff', color: '#2563eb', Icon: Smartphone },
          { label: t('أدوات سوفتوير'), value: stats.server, bg: '#f5f3ff', color: '#7c3aed', Icon: Monitor },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'grid', placeItems: 'center' }}><item.Icon size={18} color={item.color} /></div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2, lineHeight: 1 }}>{item.label}</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filters + Bulk Actions Bar ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.45rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif' }}>
            <option value="all">{t('كل الحالات')}</option>
            <option value="active">{t('نشط')}</option>
            <option value="inactive">{t('غير نشط')}</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.45rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif' }}>
            <option value="all">{t('كل الأنواع')}</option>
            <option value="SERVER">SERVER</option>
            <option value="IMEI">IMEI</option>
            <option value="REMOTE">REMOTE</option>
          </select>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} style={{ padding: '0.45rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: filterGroup === '__manage_groups__' ? '#eff6ff' : '#fff', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', minWidth: 160, fontWeight: filterGroup === '__manage_groups__' ? 700 : 400 }}>
            <option value="all">{t('كل القروبات')}</option>
            <option value="__manage_groups__">{isRTL ? `⊞ إدارة القروبات (${groupsData.length})` : `⊞ Manage Groups (${groupsData.length})`}</option>
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
            {bulkDeleting ? t('جاري الحذف...') : (isRTL ? `حذف المحدد (${selectedIds.size})` : `Delete Selected (${selectedIds.size})`)}
          </button>
        )}
      </div>

      {/* ─── Groups Management Table (when __manage_groups__ selected) ─── */}
      {filterGroup === '__manage_groups__' ? (
        <div style={{
          background: '#fff', borderRadius: 14,
          border: '1px solid #e2e8f0', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 6 }}><FolderOpen size={16} color="#64748b" /> {t('القروبات')} {filterType !== 'all' ? `(${filterType})` : ''}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedGroups.size > 0 && (
                <button type="button" onClick={handleBulkDeleteGroups} disabled={bulkDeletingGroups} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0.35rem 0.8rem', borderRadius: 7,
                  background: '#dc2626', color: '#fff',
                  border: 'none', fontSize: '0.72rem', fontWeight: 700,
                  cursor: bulkDeletingGroups ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
                  opacity: bulkDeletingGroups ? 0.7 : 1,
                }}>
                  <Trash2 size={12} />
                  {bulkDeletingGroups ? t('جاري الحذف...') : (isRTL ? `حذف المحدد (${selectedGroups.size})` : `Delete Selected (${selectedGroups.size})`)}
                </button>
              )}
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{groupsData.length} {t('قروب')}</span>
            </div>
          </div>

          {groupsData.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>{t('لا توجد قروبات')}{filterType !== 'all' ? (isRTL ? ` من نوع ${filterType}` : ` of type ${filterType}`) : ''}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.7rem 0.5rem 0.7rem 0.8rem', width: 40 }}>
                    <input type="checkbox" checked={groupsData.length > 0 && selectedGroups.size === groupsData.length} onChange={() => {
                      if (selectedGroups.size === groupsData.length) setSelectedGroups(new Set());
                      else setSelectedGroups(new Set(groupsData.map(g => g.name)));
                    }} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#dc2626' }} />
                  </th>
                  {['#', t('اسم القروب'), t('عدد المنتجات'), t('إجراءات')].map(h => (
                    <th key={h} style={{ padding: '0.7rem 0.8rem', textAlign: isRTL ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupsData.map((g, idx) => (
                  <tr key={g.name} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s', background: selectedGroups.has(g.name) ? '#fef2f2' : 'transparent' }}
                    onMouseEnter={e => { if (!selectedGroups.has(g.name)) e.currentTarget.style.background = '#fafbfd'; }}
                    onMouseLeave={e => { if (!selectedGroups.has(g.name)) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '0.65rem 0.5rem 0.65rem 0.8rem', width: 40 }}>
                      <input type="checkbox" checked={selectedGroups.has(g.name)} onChange={() => {
                        setSelectedGroups(prev => { const n = new Set(prev); if (n.has(g.name)) n.delete(g.name); else n.add(g.name); return n; });
                      }} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#dc2626' }} />
                    </td>
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
                        <button type="button" onClick={() => { setRenamingGroup(g.name); setRenameValue(g.name); }} disabled={groupActionLoading} title={t('تعديل الاسم')} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#f0f9ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Edit size={13} color="#0ea5e9" />
                        </button>
                        <button type="button" onClick={() => handleDeleteGroup(g.name, g.count)} disabled={groupActionLoading} title={t('حذف القروب ومنتجاتها')} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fef2f2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Trash2 size={13} color="#dc2626" />
                        </button>
                        <button type="button" onClick={() => setFilterGroup(g.name)} title={t('عرض المنتجات')} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#f0fdf4', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Search size={13} color="#16a34a" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{selectedGroups.size > 0 ? (isRTL ? `${selectedGroups.size} محدد من ` : `${selectedGroups.size} selected of `) : ''}{groupsData.length} {t('قروب')}{filterType !== 'all' ? (isRTL ? ` — تصفية: ${filterType}` : ` — Filter: ${filterType}`) : ''}</span>
          </div>
        </div>
      ) : (
      /* ─── Products Table ─── */
      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #e2e8f0', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>{t('لا توجد منتجات مطابقة للفلتر')}</p>
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
                {['#', t('المنتج'), t('السعر'), t('النوع'), t('المصدر'), t('الحالة'), t('إجراءات')].map(h => (
                  <th key={h} style={{
                    padding: '0.7rem 0.65rem', textAlign: isRTL ? 'right' : 'left',
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
                        <Link2 size={11} /> {p.source_name || (isRTL ? `مصدر #${p.source_id}` : `Source #${p.source_id}`)}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: 5, background: isActive ? '#dcfce7' : '#fee2e2', fontSize: '0.68rem', fontWeight: 700, color: isActive ? '#16a34a' : '#dc2626' }}>{isActive ? t('نشط') : t('غير نشط')}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <button type="button" onClick={(e) => handleToggleFeatured(e, p.id)} title={p.is_featured ? t('إلغاء التمييز') : t('تمييز المنتج')} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: p.is_featured ? '#fef3c7' : '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Star size={12} color={p.is_featured ? '#f59e0b' : '#cbd5e1'} fill={p.is_featured ? '#f59e0b' : 'none'} /></button>
                      <button type="button" onClick={(e) => handleToggleNamePriority(e, p)} title={isRTL ? `أولوية: ${(p.name_priority || 'ar') === 'ar' ? 'عربي' : 'En'}` : `Priority: ${(p.name_priority || 'ar') === 'ar' ? 'Arabic' : 'En'}`} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: (p.name_priority || 'ar') === 'ar' ? '#f0fdf4' : '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '0.58rem', fontWeight: 800, color: (p.name_priority || 'ar') === 'ar' ? '#16a34a' : '#2563eb' }}>{(p.name_priority || 'ar') === 'ar' ? 'ع' : 'En'}</button>
                      <button type="button" onClick={() => openEdit(p)} title={t('تعديل')} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={12} color="#3b82f6" /></button>
                      <button type="button" onClick={() => handleDelete(p.id)} title={t('حذف')} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={12} color="#dc2626" /></button>
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
            {selectedIds.size > 0 ? (isRTL ? `${selectedIds.size} محدد من ` : `${selectedIds.size} selected of `) : ''}{isRTL ? `عرض ${filtered.length} من ${products.length} منتج` : `Showing ${filtered.length} of ${products.length} products`}
          </span>
        </div>
      </div>
      )}

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={closeEdit}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '95%', maxWidth: 780, maxHeight: '92vh', overflow: 'auto', padding: 0, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#fafbfc', borderRadius: '16px 16px 0 0', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${theme.primary}15`, display: 'grid', placeItems: 'center' }}>
                  <Edit size={16} color={theme.primary} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1020', margin: 0 }}>{t('تعديل المنتج')}</h3>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0 }}>{t('تعديل بيانات وإعدادات المنتج')}</p>
                </div>
              </div>
              <button type="button" onClick={closeEdit} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')} onMouseOut={e => (e.currentTarget.style.background = '#fff')}>
                <X size={14} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ─── Section 1: معلومات أساسية ─── */}
            <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#dbeafe', display: 'grid', placeItems: 'center' }}>
                  <Type size={14} color="#2563eb" />
                </div>
                <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('معلومات أساسية')}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={10} /> {t('الاسم (إنجليزي)')}</label>
                  <input placeholder="Product Name" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Type size={10} /> {t('الاسم (عربي)')}</label>
                  <input placeholder={t('اسم المنتج')} value={editArabicName} onChange={(e) => setEditArabicName(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={10} /> {t('السعر')}</label>
                  <input placeholder="0.00" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', textAlign: 'center' }} onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>
            </div>

            {/* ─── Section 2: إعدادات المنتج ─── */}
            <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fef3c7', display: 'grid', placeItems: 'center' }}>
                  <Settings2 size={14} color="#d97706" />
                </div>
                <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('إعدادات المنتج')}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Package size={10} /> {t('النوع')}</label>
                  <select value={editServiceType} onChange={(e) => setEditServiceType(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="SERVER">SERVER</option>
                    <option value="IMEI">IMEI</option>
                    <option value="REMOTE">REMOTE</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><ToggleLeft size={10} /> {t('الحالة')}</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="active">{t('نشط')}</option>
                    <option value="inactive">{t('غير نشط')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={10} /> {t('أولوية اللغة')}</label>
                  <select value={editNamePriority} onChange={(e) => setEditNamePriority(e.target.value as 'ar' | 'en')} style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="ar">{t('عربي أولاً')}</option>
                    <option value="en">{t('English أولاً')}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', fontWeight: 700, color: '#334155', fontFamily: 'Tajawal, sans-serif', padding: '0.4rem 0.6rem', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', width: 'fit-content' }}>
                  <input type="checkbox" checked={editIsGame} onChange={(e) => setEditIsGame(e.target.checked)} style={{ width: 15, height: 15, accentColor: theme.primary }} />
                  <Gamepad2 size={13} color="#64748b" />
                  {t('تصنيف كـ لعبة')}
                </label>
                {editServiceType === 'SERVER' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', fontWeight: 700, color: '#334155', fontFamily: 'Tajawal, sans-serif', padding: '0.4rem 0.6rem', background: editAllowsQnt ? '#f0fdf4' : '#fff', borderRadius: 8, border: '1px solid ' + (editAllowsQnt ? '#bbf7d0' : '#e2e8f0'), cursor: 'pointer', width: 'fit-content', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={editAllowsQnt} onChange={(e) => setEditAllowsQnt(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#16a34a' }} />
                    <Package size={13} color={editAllowsQnt ? '#16a34a' : '#64748b'} />
                    {t('تفعيل QNT (الكمية)')}
                  </label>
                )}
              </div>
            </div>

            {/* ─── Section 3: القروب والوصف ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* القروب */}
              <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#e0e7ff', display: 'grid', placeItems: 'center' }}>
                    <FolderOpen size={14} color="#6366f1" />
                  </div>
                  <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('القروب')}</p>
                </div>
                <select value={editGroup === '__new__' ? '__new__' : editGroup} onChange={e => { setEditGroup(e.target.value); if (e.target.value !== '__new__') setEditCustomGroup(''); }} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box', cursor: 'pointer', marginBottom: editGroup === '__new__' ? 8 : 0 }}>
                  <option value="">{t('— بدون قروب —')}</option>
                  {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  <option value="__new__">{t('+ قروب جديد...')}</option>
                </select>
                {editGroup === '__new__' && (
                  <input placeholder={t('اسم القروب الجديد')} value={editCustomGroup} onChange={e => setEditCustomGroup(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                )}
              </div>

              {/* الوصف */}
              <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#dcfce7', display: 'grid', placeItems: 'center' }}>
                    <FileText size={14} color="#16a34a" />
                  </div>
                  <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('الوصف')}</p>
                </div>
                <textarea rows={3} placeholder={t('أضف وصف للمنتج...')} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.76rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            </div>

            {/* ─── Section 4: اتصال المصدر ─── */}
            <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fce7f3', display: 'grid', placeItems: 'center' }}>
                  <Link2 size={14} color="#db2777" />
                </div>
                <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('اتصال المصدر')}</p>
                {editOriginalSourceId && (
                  <div style={{ ...(isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }), display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: editSourceConnected ? '#16a34a' : '#dc2626' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: editSourceConnected ? '#16a34a' : '#dc2626' }}>
                      {editSourceConnected ? t('متصل — يرسل تلقائياً') : t('مفصول — الطلبات معلقة')}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                {/* اختيار المصدر */}
                <div style={{ padding: '0.55rem 0.75rem', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Database size={10} /> {t('المصدر المرتبط')}
                  </label>
                  <select
                    value={editSourceConnected ? String(editSelectedSourceId || '') : ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setEditSourceConnected(false);
                        setEditSelectedSourceId(null);
                        setEditLinkedProductId(null);
                      } else {
                        setEditSourceConnected(true);
                        setEditSelectedSourceId(Number(val));
                        // إذا تغير المصدر، أعد تعيين المنتج المرتبط
                        if (Number(val) !== editOriginalSourceId) {
                          setEditLinkedProductId(null);
                        }
                      }
                      setLinkSearch('');
                      setShowLinkDropdown(false);
                    }}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.74rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fafbfc', boxSizing: 'border-box', cursor: 'pointer' }}
                  >
                    <option value="">{t('— بدون مصدر (مفصول) —')}</option>
                    {sources.map(s => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}{editOriginalSourceId === s.id ? (isRTL ? ' ✦ الحالي' : ' ✦ Current') : ''}
                      </option>
                    ))}
                  </select>
                  {editSelectedSourceId && editSelectedSourceId !== editOriginalSourceId && (
                    <p style={{ fontSize: '0.6rem', color: '#d97706', marginTop: 4, margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ArrowRightLeft size={9} /> {t('سيتم نقل المنتج لمصدر جديد')}
                    </p>
                  )}
                </div>

                {/* تحويل لمنتج آخر */}
                <div style={{ padding: '0.55rem 0.75rem', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RefreshCw size={10} /> {t('المنتج المرتبط (تحويل الطلب)')}
                    </label>
                    <span style={{ fontSize: '0.58rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                      {editServiceType} · {linkableProducts.length} {t('منتج')}
                    </span>
                  </div>

                  {/* القائمة المنسدلة */}
                  <div style={{ position: 'relative' }}>
                    {/* رأس القائمة - يعرض المنتج المختار */}
                    <button
                      type="button"
                      onClick={() => { setShowLinkDropdown(!showLinkDropdown); setLinkSearch(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                        padding: '0.5rem 0.65rem', borderRadius: 8,
                        border: '1px solid ' + (showLinkDropdown ? '#93c5fd' : '#e2e8f0'),
                        background: '#fafbfc', cursor: 'pointer',
                        fontFamily: 'Tajawal, sans-serif', textAlign: isRTL ? 'right' : 'left',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      {editLinkedProductId ? (
                        <>
                          <Link2 size={12} color="#2563eb" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e40af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {(() => { const lp = products.find(p => p.id === editLinkedProductId); return lp ? (lp.arabic_name || lp.name) : `#${editLinkedProductId}`; })()}
                          </span>
                          <span style={{ fontSize: '0.55rem', color: '#64748b', background: '#e0e7ff', padding: '0.08rem 0.35rem', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
                            {(() => { const lp = products.find(p => p.id === editLinkedProductId); return lp?.price ? `${lp.price} USD` : `#${editLinkedProductId}`; })()}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={12} color="#16a34a" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {(() => { const ep = products.find(p => p.id === editId); return ep ? (ep.arabic_name || ep.name) : t('نفس المنتج'); })()}
                          </span>
                          <span style={{ fontSize: '0.55rem', color: '#16a34a', background: '#dcfce7', padding: '0.08rem 0.35rem', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
                            {(() => { const ep = products.find(p => p.id === editId); return ep?.price ? `${ep.price} USD` : ''; })()}
                          </span>
                        </>
                      )}
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginRight: 2, transform: showLinkDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▾</span>
                    </button>

                    {/* جسم القائمة المنسدلة */}
                    {showLinkDropdown && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 50, marginTop: 3, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                        {/* حقل البحث */}
                        <div style={{ padding: '0.4rem 0.55rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.3rem 0.5rem', background: '#fff' }}>
                            <Search size={11} color="#94a3b8" />
                            <input
                              value={linkSearch}
                              onChange={e => setLinkSearch(e.target.value)}
                              autoFocus
                              placeholder={isRTL ? `ابحث في منتجات ${editServiceType}...` : `Search ${editServiceType} products...`}
                              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.68rem', fontFamily: 'Tajawal, sans-serif', background: 'transparent' }}
                            />
                          </div>
                        </div>

                        {/* خيار "نفسه" - إعادة التعيين */}
                        <button
                          type="button"
                          onClick={() => { setEditLinkedProductId(null); setLinkSearch(''); setShowLinkDropdown(false); const ep = products.find(pp => pp.id === editId); if (ep) { const fields = (ep.customFields || []).map(f => ({ key: f.key || '', label: f.label || '', placeholder: f.placeholder || '', required: f.required !== false })); if (fields.length > 0) setEditCustomFields(fields); else { const sType = (ep.service_type || 'SERVER').toUpperCase(); if (sType === 'IMEI') setEditCustomFields([{ key: 'imei', label: t('رقم IMEI'), placeholder: t('مثال: 356938035643809'), required: true }]); else if (sType === 'SERVER') setEditCustomFields([{ key: 'username', label: t('اسم المستخدم'), placeholder: t('أدخل اسم المستخدم'), required: true }, { key: 'password', label: t('كلمة المرور'), placeholder: t('أدخل كلمة المرور'), required: true }]); else setEditCustomFields([{ key: 'info', label: t('معلومات'), placeholder: t('أدخل المعلومات المطلوبة'), required: true }]); } } }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                            padding: '0.45rem 0.65rem',
                            background: !editLinkedProductId ? '#f0fdf4' : 'transparent',
                            border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                            fontFamily: 'Tajawal, sans-serif', textAlign: isRTL ? 'right' : 'left',
                            transition: 'background 0.1s',
                          }}
                          onMouseOver={e => { if (editLinkedProductId) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseOut={e => { if (editLinkedProductId) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <CheckCircle size={11} color="#16a34a" />
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151', flex: 1 }}>
                            {(() => { const ep = products.find(p => p.id === editId); return ep ? (ep.arabic_name || ep.name) : t('نفس المنتج'); })()}
                          </span>
                          <span style={{ fontSize: '0.55rem', color: '#16a34a', fontWeight: 700 }}>{t('✦ نفسه')}</span>
                        </button>

                        {/* قائمة المنتجات */}
                        <div style={{ maxHeight: 200, overflow: 'auto' }}>
                          {filteredLinkable.length > 0 ? (
                            <>
                              {/* Group products by group_name */}
                              {(() => {
                                const grouped = new Map<string, typeof filteredLinkable>();
                                for (const p of filteredLinkable) {
                                  const g = p.group_name || '';
                                  if (!grouped.has(g)) grouped.set(g, []);
                                  grouped.get(g)!.push(p);
                                }
                                return Array.from(grouped.entries()).map(([groupName, items]) => (
                                  <div key={groupName}>
                                    {groupName && (
                                      <div style={{ padding: '0.3rem 0.65rem', fontSize: '0.6rem', fontWeight: 800, color: '#475569', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontFamily: 'Tajawal, sans-serif' }}>
                                        {groupName}
                                      </div>
                                    )}
                                    {items.map(p => (
                                      <button key={p.id} type="button" onClick={() => { setEditLinkedProductId(p.id); setLinkSearch(''); setShowLinkDropdown(false); const fields = (p.customFields || []).map(f => ({ key: f.key || '', label: f.label || '', placeholder: f.placeholder || '', required: f.required !== false })); if (fields.length > 0) { setEditCustomFields(fields); } else { const sType = (p.service_type || 'SERVER').toUpperCase(); if (sType === 'IMEI') setEditCustomFields([{ key: 'imei', label: t('رقم IMEI'), placeholder: t('مثال: 356938035643809'), required: true }]); else if (sType === 'SERVER') setEditCustomFields([{ key: 'username', label: t('اسم المستخدم'), placeholder: t('أدخل اسم المستخدم'), required: true }, { key: 'password', label: t('كلمة المرور'), placeholder: t('أدخل كلمة المرور'), required: true }]); else setEditCustomFields([{ key: 'info', label: t('معلومات'), placeholder: t('أدخل المعلومات المطلوبة'), required: true }]); } }} style={{
                                        display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                                        padding: '0.4rem 0.65rem',
                                        background: editLinkedProductId === p.id ? '#eff6ff' : 'transparent',
                                        border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                                        fontFamily: 'Tajawal, sans-serif', textAlign: isRTL ? 'right' : 'left',
                                        transition: 'background 0.1s',
                                      }} onMouseOver={e => { if (editLinkedProductId !== p.id) e.currentTarget.style.background = '#f8fafc'; }} onMouseOut={e => { if (editLinkedProductId !== p.id) e.currentTarget.style.background = 'transparent'; }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#0b1020', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.arabic_name || p.name}</p>
                                        </div>
                                        <span style={{ fontSize: '0.56rem', color: '#64748b', flexShrink: 0 }}>
                                          {p.price ? `${p.price} USD` : `#${p.id}`}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ));
                              })()}
                            </>
                          ) : linkSearch.trim() ? (
                            <div style={{ padding: '0.6rem', textAlign: 'center' }}>
                              <p style={{ fontSize: '0.66rem', color: '#94a3b8', margin: 0 }}>{isRTL ? `لا توجد نتائج في ${editServiceType}` : `No results in ${editServiceType}`}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* زر فصل/ربط سريع */}
              {editOriginalSourceId && (
                <button onClick={() => {
                  if (editSourceConnected) {
                    setEditSourceConnected(false);
                    setEditSelectedSourceId(null);
                    setEditLinkedProductId(null);
                  } else {
                    setEditSourceConnected(true);
                    setEditSelectedSourceId(editOriginalSourceId);
                  }
                }} type="button" style={{
                  display: 'flex', alignItems: 'center', gap: 5, width: '100%', justifyContent: 'center',
                  padding: '0.4rem 0.75rem', borderRadius: 8,
                  background: editSourceConnected ? '#fff5f5' : '#f0fdf4',
                  color: editSourceConnected ? '#dc2626' : '#16a34a',
                  border: '1px solid ' + (editSourceConnected ? '#fecaca' : '#bbf7d0'),
                  fontSize: '0.7rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {editSourceConnected ? <><Unlink size={12} /> {t('فصل المنتج من المصدر')}</> : <><Link2 size={12} /> {t('إعادة ربط بالمصدر الأصلي')}</>}
                </button>
              )}
            </div>

            {/* ─── Section 5: حقول المنتج ─── */}
            <div style={{ padding: '0.85rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#e0f2fe', display: 'grid', placeItems: 'center' }}>
                  <ListOrdered size={14} color="#0284c7" />
                </div>
                <p style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('حقول المنتج')}</p>
                <span style={{ fontSize: '0.58rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                  {editCustomFields.length} {t('حقل')}
                </span>
                <p style={{ fontSize: '0.58rem', color: '#94a3b8', margin: 0, ...(isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }) }}>
                  {t('الحقول التي يملأها العميل عند الطلب')}
                </p>
              </div>

              {/* جدول الحقول */}
              {editCustomFields.length > 0 && (
                <div style={{ borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 10 }}>
                  {/* رأس الجدول */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 60px 36px', gap: 0, background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{t('المفتاح (Key)')}</div>
                    <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{t('التسمية (Label)')}</div>
                    <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{t('النص التوضيحي')}</div>
                    <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>{t('مطلوب')}</div>
                    <div />
                  </div>
                  {/* صفوف الحقول */}
                  {editCustomFields.map((field, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 60px 36px', gap: 0, borderBottom: idx < editCustomFields.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                      <div style={{ padding: '0.3rem 0.4rem' }}>
                        <input
                          value={field.key}
                          onChange={e => { const arr = [...editCustomFields]; arr[idx] = { ...arr[idx], key: e.target.value }; setEditCustomFields(arr); }}
                          placeholder="imei"
                          style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.7rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: '#fafbfc', direction: 'ltr' }}
                          onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                      </div>
                      <div style={{ padding: '0.3rem 0.4rem' }}>
                        <input
                          value={field.label}
                          onChange={e => { const arr = [...editCustomFields]; arr[idx] = { ...arr[idx], label: e.target.value }; setEditCustomFields(arr); }}
                          placeholder={t('رقم IMEI')}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.7rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fafbfc' }}
                          onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                      </div>
                      <div style={{ padding: '0.3rem 0.4rem' }}>
                        <input
                          value={field.placeholder}
                          onChange={e => { const arr = [...editCustomFields]; arr[idx] = { ...arr[idx], placeholder: e.target.value }; setEditCustomFields(arr); }}
                          placeholder={t('مثال: 356938035643809')}
                          style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.7rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fafbfc' }}
                          onFocus={e => e.target.style.borderColor = '#93c5fd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                      </div>
                      <div style={{ padding: '0.3rem 0.4rem', display: 'grid', placeItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => { const arr = [...editCustomFields]; arr[idx] = { ...arr[idx], required: e.target.checked }; setEditCustomFields(arr); }}
                          style={{ width: 15, height: 15, accentColor: theme.primary, cursor: 'pointer' }}
                        />
                      </div>
                      <div style={{ padding: '0.3rem 0.2rem', display: 'grid', placeItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => { const arr = [...editCustomFields]; arr.splice(idx, 1); setEditCustomFields(arr); }}
                          style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fff5f5'}
                        >
                          <Minus size={11} color="#dc2626" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* زر إضافة حقل + زر جلب الافتراضي */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setEditCustomFields([...editCustomFields, { key: '', label: '', placeholder: '', required: true }])}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.75rem', borderRadius: 7, background: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#fff'}
                >
                  <Plus size={12} /> {t('إضافة حقل')}
                </button>

                {editCustomFields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEditCustomFields([])}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.75rem', borderRadius: 7, background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', ...(isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }), transition: 'all 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fff5f5'}
                  >
                    <Trash2 size={11} /> {t('مسح الكل')}
                  </button>
                )}
              </div>

              {editCustomFields.length === 0 && (
                <div style={{ textAlign: 'center', padding: '0.8rem 0.5rem', color: '#94a3b8', fontSize: '0.68rem' }}>
                  <p style={{ margin: 0, marginBottom: 2 }}>{t('لا توجد حقول مخصصة')}</p>
                  <p style={{ margin: 0, fontSize: '0.58rem' }}>{t('أضف حقول ليملأها العميل عند الطلب')}</p>
                </div>
              )}
            </div>

            </div>{/* end padding wrapper */}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#fafbfc', borderRadius: '0 0 16px 16px', position: 'sticky', bottom: 0, zIndex: 10 }}>
              <button type="button" onClick={handleUpdateProduct} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.5rem', borderRadius: 10, background: theme.primary, color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: updating ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: updating ? 0.7 : 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.15s' }}>
                <Save size={14} />
                {updating ? t('جاري الحفظ...') : t('حفظ التعديل')}
              </button>
              <button type="button" onClick={closeEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.5rem', borderRadius: 10, background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                <X size={14} />
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
