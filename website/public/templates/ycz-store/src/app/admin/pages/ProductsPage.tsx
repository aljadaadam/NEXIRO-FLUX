'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Star, Unlink, Link2 } from 'lucide-react';
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
  const [updating, setUpdating] = useState(false);

  // Source & product linking state
  const [editSourceConnected, setEditSourceConnected] = useState(true);
  const [editLinkedProductId, setEditLinkedProductId] = useState<number | null>(null);
  const [linkSearch, setLinkSearch] = useState('');
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const [editOriginalSourceId, setEditOriginalSourceId] = useState<number | null>(null);

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
      });
      setShowAdd(false);
      setNewName(''); setNewArabicName(''); setNewPrice(''); setNewDesc('');
      setNewServiceType('SERVER'); setNewGroup(''); setNewCustomGroup('');
      loadProducts();
    } catch { /* ignore */ }
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
      loadProducts();
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  }

  async function handleToggleFeatured(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await adminApi.toggleFeatured(id);
      await loadProducts();
    } catch (err) {
      console.error('toggleFeatured error:', err);
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

      {/* Products Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'إجمالي المنتجات', value: stats.total, bg: '#f8fafc', color: '#0b1020' },
          { label: 'منتجات نشطة', value: stats.active, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'خدمات IMEI', value: stats.imei, bg: '#eff6ff', color: '#2563eb' },
          { label: 'أدوات سوفتوير', value: stats.server, bg: '#f5f3ff', color: '#7c3aed' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '0.75rem 0.9rem' }}>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: item.color, background: item.bg, display: 'inline-block', padding: '0.1rem 0.55rem', borderRadius: 8 }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', fontFamily: 'Tajawal, sans-serif' }}>
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', fontFamily: 'Tajawal, sans-serif' }}>
          <option value="all">كل الأنواع</option>
          <option value="SERVER">SERVER</option>
          <option value="IMEI">IMEI</option>
          <option value="REMOTE">REMOTE</option>
        </select>

        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', fontFamily: 'Tajawal, sans-serif', minWidth: 180 }}>
          <option value="all">كل القروبات</option>
          {groupsForDropdown.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #f1f5f9', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['المنتج', 'السعر', 'النوع', 'القروب', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{
                    padding: '0.85rem 1rem', textAlign: 'right',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    borderBottom: '1px solid #f1f5f9',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.25rem' }}>{p.icon}</span>
                      <div>
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{displayName(p)}</p>
                        {secondaryName(p) && <p style={{ fontSize: '0.68rem', color: '#64748b' }}>{secondaryName(p)}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>${String(p.price).replace('$', '')}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                      background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 600, color: '#64748b',
                    }}>{String(p.service_type || 'SERVER').toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', color: '#64748b' }}>{p.group_name || '—'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {(() => {
                      const raw = String(p.status || 'active').toLowerCase();
                      const isActive = raw === 'active' || raw === 'نشط';
                      return <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: isActive ? '#dcfce7' : '#fee2e2', fontSize: '0.72rem', fontWeight: 700, color: isActive ? '#16a34a' : '#dc2626' }}>{isActive ? 'نشط' : 'غير نشط'}</span>;
                    })()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="button" onClick={(e) => handleToggleFeatured(e, p.id)} title={p.is_featured ? 'إلغاء التمييز' : 'تمييز المنتج'} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: p.is_featured ? '#fef3c7' : '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Star size={13} color={p.is_featured ? '#f59e0b' : '#cbd5e1'} fill={p.is_featured ? '#f59e0b' : 'none'} /></button>
                      <button type="button" onClick={(e) => handleToggleNamePriority(e, p)} title={`أولوية الاسم: ${(p.name_priority || 'ar') === 'ar' ? 'عربي' : 'إنجليزي'}`} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: (p.name_priority || 'ar') === 'ar' ? '#f0fdf4' : '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '0.6rem', fontWeight: 800, color: (p.name_priority || 'ar') === 'ar' ? '#16a34a' : '#2563eb' }}>{(p.name_priority || 'ar') === 'ar' ? 'ع' : 'En'}</button>
                      <button type="button" onClick={() => openEdit(p)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={13} color="#3b82f6" /></button>
                      <button type="button" onClick={() => handleDelete(p.id)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={13} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
