'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxProduct } from '@/lib/hxTypes';
import { HxColorTheme } from '@/lib/hxThemes';
import { Plus, Edit3, Trash2, Search, Package, Save, X, Image as ImageIcon, Star, Eye, EyeOff } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; formatPrice: (n: number) => string; buttonRadius: string; }

export default function HxProductsPage({ theme, darkMode, t, formatPrice, buttonRadius }: Props) {
  const [products, setProducts] = useState<HxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<HxProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', image: '', is_featured: false, is_active: true });

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await hxAdminApi.getProducts();
      setProducts(data.products || []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', stock: '', category: '', image: '', is_featured: false, is_active: true });
    setShowForm(true);
  };

  const openEdit = (p: HxProduct) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      stock: String(p.stock ?? ''), category: p.category || '', image: p.image || '',
      is_featured: !!p.is_featured, is_active: p.is_active !== false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 };
      if (editProduct) {
        await hxAdminApi.updateProduct(editProduct.id, payload);
      } else {
        await hxAdminApi.createProduct(payload);
      }
      setShowForm(false);
      loadProducts();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('هل أنت متأكد من الحذف؟'))) return;
    try {
      await hxAdminApi.deleteProduct(id);
      loadProducts();
    } catch {}
  };

  const filtered = products.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>📦 {t('إدارة المنتجات')}</h2>
        <button onClick={openNew} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> {t('إضافة منتج')}
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: subtext }} />
        <input className="hx-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('بحث في المنتجات...')} style={{ paddingRight: 40 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="hx-animate-shimmer hx-skeleton" style={{ height: 60, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t('المنتج'), t('التصنيف'), t('السعر'), t('المخزون'), t('مميز'), t('الحالة'), t('إجراءات')].map((h, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: 'start', fontWeight: 700, color: subtext, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: `${theme.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} style={{ color: theme.primary }} />}
                        </div>
                        <span style={{ fontWeight: 600, color: text, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: subtext, whiteSpace: 'nowrap' }}>{p.category || '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: text, whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</td>
                    <td style={{ padding: '10px 14px', color: (p.stock ?? 0) <= 5 ? '#ef4444' : text, fontWeight: 600 }}>{p.stock ?? '∞'}</td>
                    <td style={{ padding: '10px 14px' }}>{p.is_featured ? <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: p.is_active !== false ? '#10b98115' : '#ef444415', color: p.is_active !== false ? '#10b981' : '#ef4444' }}>
                        {p.is_active !== false ? t('نشط') : t('معطل')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ background: `${theme.primary}12`, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: theme.primary }}><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: '#ef444412', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('لا توجد منتجات')}</div>}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="hx-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hx-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: text }}>{editProduct ? t('تعديل المنتج') : t('إضافة منتج جديد')}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('اسم المنتج')}</label>
                  <input className="hx-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('الوصف')}</label>
                  <textarea className="hx-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('السعر')}</label>
                    <input className="hx-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('المخزون')}</label>
                    <input className="hx-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('التصنيف')}</label>
                  <input className="hx-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('رابط الصورة')}</label>
                  <input className="hx-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                    {t('منتج مميز')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: text, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                    {t('نشط')}
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={handleSave} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Save size={16} /> {t('حفظ')}
                </button>
                <button onClick={() => setShowForm(false)} className="hx-btn-primary" style={{ background: darkMode ? '#334155' : '#e2e8f0', color: text, borderRadius: Number(buttonRadius) }}>
                  {t('إلغاء')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
