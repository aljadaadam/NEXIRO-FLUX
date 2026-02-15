'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { Product } from '@/lib/types';

export default function ProductsPage({ theme }: { theme: ColorTheme }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

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

  async function handleAddProduct() {
    if (!newName || !newPrice) return;
    setSaving(true);
    try {
      await adminApi.createProduct({
        name: newName,
        price: newPrice.startsWith('$') ? newPrice : `$${newPrice}`,
        category: newCategory || 'عام',
        stock: parseInt(newStock) || 0,
        desc: newDesc,
        icon: '📦',
        status: 'نشط',
      });
      setShowAdd(false);
      setNewName(''); setNewPrice(''); setNewCategory(''); setNewStock(''); setNewDesc('');
      loadProducts(); // refresh
    } catch { /* show error */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>📦 المنتجات</h2>
        <div style={{ display: 'flex', gap: 8 }}>
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
            <input placeholder="السعر ($)" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <input placeholder="التصنيف" value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
            <input placeholder="المخزون" value={newStock} onChange={e => setNewStock(e.target.value)} style={{
              padding: '0.65rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }} />
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
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #f1f5f9', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['المنتج', 'السعر', 'التصنيف', 'المخزون', 'الحالة', 'إجراءات'].map(h => (
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
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{p.name}</p>
                        <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{p.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{p.price}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                      background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 600, color: '#64748b',
                    }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155' }}>{p.stock}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                      background: '#dcfce7', fontSize: '0.72rem', fontWeight: 700, color: '#16a34a',
                    }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit size={13} color="#3b82f6" /></button>
                      <button onClick={() => handleDelete(p.id)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={13} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
