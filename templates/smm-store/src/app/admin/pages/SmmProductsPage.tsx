'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, mapBackendProduct } from '@/lib/api';
import type { Product } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { Plus, Search, Edit2, Trash2, Star, X, Package, Filter, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  formatPrice?: (n: number) => string;
  buttonRadius?: string;
}

export default function SmmProductsPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', arabic_name: '', price: '', group_name: '', desc: '', stock: '999', minQuantity: '1', maxQuantity: '100' });
  const [saving, setSaving] = useState(false);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const loadProducts = useCallback(async () => {
    try {
      const data = await adminApi.getProducts();
      const raw = Array.isArray(data) ? data : data?.products || [];
      setProducts(raw.map((p: Record<string, unknown>) => mapBackendProduct(p) as unknown as Product));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const groups = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.arabic_name || '').includes(searchTerm);
    const matchGroup = !filterGroup || p.category === filterGroup;
    return matchSearch && matchGroup;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', arabic_name: '', price: '', group_name: '', desc: '', stock: '999', minQuantity: '1', maxQuantity: '100' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, arabic_name: p.arabic_name || '', price: p.price?.replace('$', '') || '',
      group_name: p.category || '', desc: p.desc || '', stock: String(p.stock || 999),
      minQuantity: String(p.minQuantity || 1), maxQuantity: String(p.maxQuantity || 100),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        name: form.name, arabic_name: form.arabic_name || form.name,
        price: parseFloat(form.price), group_name: form.group_name,
        description: form.desc, stock: parseInt(form.stock),
        minqnt: parseInt(form.minQuantity), maxqnt: parseInt(form.maxQuantity),
      };
      if (editProduct) {
        await adminApi.updateProduct(editProduct.id, data);
      } else {
        await adminApi.createProduct(data);
      }
      setShowModal(false);
      loadProducts();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من الحذف؟'))) return;
    try { await adminApi.deleteProduct(id); loadProducts(); } catch {}
  };

  const handleToggleFeatured = async (id: number) => {
    try { await adminApi.toggleFeatured(id); loadProducts(); } catch {}
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ height: 180, borderRadius: 16, background: `linear-gradient(90deg, ${cardBg}, ${darkMode ? '#1e2642' : '#f1f5f9'}, ${cardBg})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>📦 {t('إدارة المنتجات')} ({filtered.length})</h2>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', borderRadius: Number(buttonRadius), border: 'none',
          background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          <Plus size={16} /> {t('إضافة منتج')}
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: subtext }} />
          <input
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('بحث في المنتجات...')}
            style={{ width: '100%', height: 40, paddingRight: 36, paddingLeft: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}
          />
        </div>
        {groups.length > 1 && (
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: subtext }} />
            <select
              value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
              style={{ height: 40, paddingRight: 32, paddingLeft: 14, border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none', appearance: 'none', minWidth: 160 }}
            >
              <option value="">{t('كل المجموعات')}</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Products table */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: subtext }}>
            <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>{t('لا توجد منتجات')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['#', t('المنتج'), t('المجموعة'), t('السعر'), t('المخزون'), t('مميز'), t('إجراءات')].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${theme.primary}05`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', color: subtext }}>{p.id}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{p.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: text, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          {p.source_name && <div style={{ fontSize: 11, color: subtext }}>{p.source_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, background: `${theme.primary}10`, color: theme.primary, fontSize: 11, fontWeight: 600 }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: text }}>{p.price}</td>
                    <td style={{ padding: '12px 14px', color: (p.stock || 0) < 10 ? '#ef4444' : subtext }}>{p.stock}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => handleToggleFeatured(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.is_featured ? '#f59e0b' : subtext }}>
                        {p.is_featured ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: theme.primary }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '90%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto',
            background: cardBg, borderRadius: 20, padding: 28, zIndex: 101,
            border: `1px solid ${border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editProduct ? t('تعديل منتج') : t('إضافة منتج')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name', label: 'اسم المنتج (EN)', type: 'text' },
                { key: 'arabic_name', label: 'الاسم بالعربي', type: 'text' },
                { key: 'price', label: 'السعر ($)', type: 'number' },
                { key: 'group_name', label: 'المجموعة', type: 'text' },
                { key: 'desc', label: 'الوصف', type: 'text' },
                { key: 'stock', label: 'المخزون', type: 'number' },
                { key: 'minQuantity', label: 'الحد الأدنى', type: 'number' },
                { key: 'maxQuantity', label: 'الحد الأقصى', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t(field.label)}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: Number(buttonRadius),
                  background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>
                  {saving ? '...' : (editProduct ? t('تحديث') : t('إضافة'))}
                </button>
                <button onClick={() => setShowModal(false)} style={{
                  padding: '12px 24px', border: `1px solid ${border}`, borderRadius: Number(buttonRadius),
                  background: 'transparent', color: text, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}>
                  {t('إلغاء')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
