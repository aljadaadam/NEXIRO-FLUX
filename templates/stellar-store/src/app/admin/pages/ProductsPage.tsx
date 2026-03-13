'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, Upload, Loader2, ImageIcon, Package } from 'lucide-react';
import { adminApi, mapBackendProduct } from '@/lib/api';
import type { Product, ProductField } from '@/lib/types';

function ImageUploader({ currentImage, onImageChange }: { currentImage: string; onImageChange: (base64: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميغابايت');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageChange(base64);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-sm text-navy-300 font-bold mb-1.5 block">صورة المنتج</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-40 rounded-xl border-2 border-dashed border-navy-700/50 hover:border-gold-500/40 bg-navy-800/40 flex items-center justify-center cursor-pointer transition-all overflow-hidden group"
      >
        {preview && preview !== '/images/default-product.svg' ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-navy-500 mx-auto mb-2" />
                <p className="text-navy-500 text-xs">اضغط لرفع صورة</p>
                <p className="text-navy-600 text-[10px] mt-1">PNG, JPG, WEBP — أقصى 5MB</p>
              </>
            )}
          </div>
        )}
        {preview && preview !== '/images/default-product.svg' && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
    </div>
  );
}

// ─── Product Form Modal ───
function ProductModal({ product, onClose, onSave, categories }: {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  categories: string[];
}) {
  const [name, setName] = useState(product?.arabic_name || product?.name || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState(product?.group_name || product?.category || '');
  const [customCategory, setCustomCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(product?.image || '');
  const [qnt, setQnt] = useState(product?.qnt?.toString() || '0');
  const [status, setStatus] = useState(product?.status || 'active');
  const [customFields, setCustomFields] = useState<ProductField[]>(product?.custom_fields || []);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    setCustomFields([...customFields, { name: '', label: '', required: true, type: 'text' }]);
  };

  const updateField = (index: number, key: keyof ProductField, value: string | boolean) => {
    const updated = [...customFields];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[key] = value;
    if (key === 'label') {
      updated[index].name = (value as string).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\u0600-\u06FF]/g, '');
    }
    setCustomFields(updated);
  };

  const removeField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name,
        arabic_name: name,
        price: parseFloat(price),
        group_name: showNewCategory ? customCategory : category,
        category: showNewCategory ? customCategory : category,
        description,
        image,
        qnt: parseInt(qnt) || 0,
        status,
        custom_fields: customFields.filter(f => f.label.trim()),
      });
      onClose();
    } catch {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-700/50 sticky top-0 bg-navy-900 z-10">
          <h3 className="text-lg font-black text-white">
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ImageUploader currentImage={image} onImageChange={setImage} />

          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">اسم المنتج *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
              placeholder="مثال: تفعيل ويندوز 11"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-navy-300 font-bold mb-1.5 block">السعر (SDG) *</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                placeholder="25000"
                required
                min="0"
              />
            </div>
            <div>
              <label className="text-sm text-navy-300 font-bold mb-1.5 block">الكمية</label>
              <input
                type="number"
                value={qnt}
                onChange={e => setQnt(e.target.value)}
                className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">القسم</label>
            {!showNewCategory ? (
              <div className="space-y-2">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
                >
                  <option value="">اختر القسم</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="text-xs text-gold-500 hover:text-gold-400 font-bold"
                >
                  + إضافة قسم جديد
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="اسم القسم الجديد..."
                />
                <button
                  type="button"
                  onClick={() => { setShowNewCategory(false); setCustomCategory(''); }}
                  className="text-xs text-navy-400 hover:text-navy-300 font-bold"
                >
                  ← اختر من الأقسام الموجودة
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">الوصف</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 resize-none"
              rows={3}
              placeholder="وصف المنتج..."
            />
          </div>

          <div>
            <label className="text-sm text-navy-300 font-bold mb-1.5 block">الحالة</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-navy-300 font-bold">حقول مخصصة للعميل</label>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة حقل
              </button>
            </div>
            <p className="text-navy-500 text-[11px] mb-3">حقول يجب على العميل تعبئتها عند تقديم الطلب</p>
            {customFields.length > 0 && (
              <div className="space-y-3">
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-navy-800/40 border border-navy-700/30 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <input
                        value={field.label}
                        onChange={e => updateField(idx, 'label', e.target.value)}
                        className="w-full px-3 py-2 bg-navy-800/60 border border-navy-700/50 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
                        placeholder="اسم الحقل (مثال: Player ID)"
                      />
                      <div className="flex gap-2">
                        <select
                          value={field.type || 'text'}
                          onChange={e => updateField(idx, 'type', e.target.value)}
                          className="flex-1 px-3 py-2 bg-navy-800/60 border border-navy-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500/50"
                        >
                          <option value="text">نص</option>
                          <option value="email">بريد إلكتروني</option>
                          <option value="number">رقم</option>
                          <option value="tel">هاتف</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-navy-400 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required !== false}
                            onChange={e => updateField(idx, 'required', e.target.checked)}
                            className="accent-gold-500"
                          />
                          مطلوب
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="mt-1 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {saving ? 'جاري الحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-navy-800 text-navy-300 font-bold rounded-xl hover:bg-navy-700 transition-all">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Products Page ───
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadProducts = async () => {
    try {
      const data = await adminApi.getProducts();
      const mapped = Array.isArray(data) ? data.map((p: Record<string, unknown>) => mapBackendProduct(p)) : [];
      setProducts(mapped);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(p =>
    (p.name || '').includes(search) || (p.arabic_name || '').includes(search) || (p.category || '').includes(search)
  );

  // Extract unique categories from products
  const categories = [...new Set(products.map(p => p.group_name || p.category || '').filter(Boolean))];

  const handleSave = async (data: Record<string, unknown>) => {
    if (editProduct) {
      await adminApi.updateProduct(editProduct.id, data);
    } else {
      await adminApi.createProduct(data);
    }
    await loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setDeleting(id);
    try {
      await adminApi.deleteProduct(id);
      await loadProducts();
    } catch {
      alert('فشل حذف المنتج');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-gold-500" />
            المنتجات
          </h1>
          <p className="text-navy-400 text-sm mt-1">{products.length} منتج</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full px-4 py-3 pr-12 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">{search ? 'لا توجد نتائج' : 'لا توجد منتجات بعد'}</p>
          <p className="text-navy-500 text-sm mt-2">اضغط &quot;إضافة منتج&quot; للبدء</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, idx) => (
            <div
              key={product.id}
              className="bg-navy-900/60 border border-navy-700/40 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Image */}
              <div className="h-36 bg-gradient-to-b from-navy-800/60 to-navy-900 overflow-hidden relative">
                <img
                  src={product.image || '/images/default-product.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  product.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {product.status === 'active' ? 'نشط' : 'غير نشط'}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                {product.category && (
                  <span className="text-[10px] text-gold-500 font-bold bg-gold-500/10 px-2 py-0.5 rounded-md">
                    {product.category}
                  </span>
                )}
                <h3 className="text-white font-bold text-sm mt-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gold-500 font-black text-base">
                    {(product.price || 0).toLocaleString()} <span className="text-[10px] text-navy-500">SDG</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditProduct(product); setShowModal(true); }}
                      className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      {deleting === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
          categories={categories}
        />
      )}
    </div>
  );
}
