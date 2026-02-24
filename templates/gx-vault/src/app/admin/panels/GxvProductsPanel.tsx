'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit3, Trash2, Search, X, Save } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvProductsPanel() {
  const { currentTheme } = useGxvTheme();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    gxvAdminApi.getProducts().then(data => {
      setProducts(Array.isArray(data) ? data : data?.products || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const filtered = products.filter(p =>
    !search || String(p.name || p.arabic_name).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    await gxvAdminApi.deleteProduct(id);
    load();
  };

  const handleSave = async () => {
    if (editModal && (editModal.id as number) > 0) {
      await gxvAdminApi.updateProduct(editModal.id as number, form);
    } else {
      await gxvAdminApi.createProduct(form);
    }
    setEditModal(null);
    load();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
          <input type="text" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', maxWidth: 300, padding: '10px 36px 10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
            }}
          />
        </div>
        <button onClick={() => { setEditModal({ id: 0 }); setForm({ name: '', price: '', description: '' }); }} style={{
          padding: '10px 20px', borderRadius: 12, background: currentTheme.gradient,
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6, boxShadow: currentTheme.glow,
        }}>
          <Plus size={16} /> إضافة منتج
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((p, i) => (
            <div key={p.id as number} style={{
              padding: '14px 18px', borderRadius: 14,
              background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              animation: `gxvSlideUp ${0.15 + i * 0.03}s ease-out both`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                  {String(p.arabic_name || p.name)}
                </h4>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem', color: '#555577' }}>
                  <span>${Number(p.price || 0).toFixed(2)}</span>
                  <span>{String(p.group_name || '')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => {
                  setEditModal(p);
                  setForm({ name: String(p.name || ''), arabic_name: String(p.arabic_name || ''), price: String(p.price || ''), description: String(p.description || '') });
                }} style={{
                  width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.15)', color: '#3b82f6', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(p.id as number)} style={{
                  width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555577' }}>
              <Package size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p>لا توجد منتجات</p>
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16,
        }} onClick={() => setEditModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 480, borderRadius: 20, background: '#0f0f23',
            border: '1px solid rgba(255,255,255,0.08)', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                {(editModal.id as number) > 0 ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setEditModal(null)} style={{
                width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
              }}><X size={15} /></button>
            </div>

            {[
              { key: 'name', label: 'الاسم (EN)', placeholder: 'Product name' },
              { key: 'arabic_name', label: 'الاسم (AR)', placeholder: 'اسم المنتج' },
              { key: 'price', label: 'السعر', placeholder: '0.00' },
              { key: 'description', label: 'الوصف', placeholder: 'وصف المنتج' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4 }}>{field.label}</label>
                <input type="text" placeholder={field.placeholder} value={form[field.key] || ''}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                  }} />
              </div>
            ))}

            <button onClick={handleSave} style={{
              width: '100%', padding: '12px', borderRadius: 12, marginTop: 8,
              background: currentTheme.gradient, color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Save size={15} /> حفظ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
