import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Edit3, Trash2, Loader2, Eye, EyeOff,
  DollarSign, BarChart3, AlertCircle, CheckCircle2, X, Save, Tag
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function AdminProducts() {
  const { isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = { name: '', name_ar: '', description: '', description_ar: '', price: '', cost_price: '', sku: '', category: '', status: 'active', stock: '', image_url: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data.products || data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async () => {
    if (!form.name) { setError(isRTL ? 'اسم المنتج مطلوب' : 'Product name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, form);
        setSuccess(isRTL ? 'تم تحديث المنتج' : 'Product updated');
      } else {
        await api.createProduct(form);
        setSuccess(isRTL ? 'تم إضافة المنتج' : 'Product created');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingProduct(null);
      await fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await api.deleteProduct(id);
      await fetchProducts();
      setSuccess(isRTL ? 'تم حذف المنتج' : 'Product deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل الحذف' : 'Delete failed'));
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price || '',
      cost_price: product.cost_price || '',
      sku: product.sku || '',
      category: product.category || '',
      status: product.status || 'active',
      stock: product.stock ?? '',
      image_url: product.image_url || '',
    });
    setShowModal(true);
    setError('');
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
    setError('');
  };

  const filtered = products.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.name_ar || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalValue = products.reduce((s, p) => s + (parseFloat(p.price) || 0), 0);

  const statCards = [
    { labelAr: 'إجمالي المنتجات', labelEn: 'Total Products', value: totalProducts, icon: Package, bg: 'bg-primary-500/10', color: 'text-primary-400' },
    { labelAr: 'منتجات نشطة', labelEn: 'Active Products', value: activeProducts, icon: CheckCircle2, bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
    { labelAr: 'إجمالي القيمة', labelEn: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, bg: 'bg-amber-500/10', color: 'text-amber-400' },
    { labelAr: 'الأصناف', labelEn: 'Categories', value: new Set(products.map(p => p.category).filter(Boolean)).size, icon: Tag, bg: 'bg-cyan-500/10', color: 'text-cyan-400' },
  ];

  const inputClass = "w-full bg-[#0d1221] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{isRTL ? 'المنتجات' : 'Products'}</h1>
          <p className="text-dark-400 text-sm mt-1">{isRTL ? 'إدارة منتجات متجرك' : 'Manage your store products'}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          {isRTL ? 'منتج جديد' : 'New Product'}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />{success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-2xl border border-white/5 p-5">
              <div className={`p-2.5 rounded-xl ${card.bg} w-fit mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-12 h-6 bg-white/5 rounded animate-pulse" /> : card.value}</p>
              <p className="text-dark-400 text-xs mt-1">{isRTL ? card.labelAr : card.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input type="text" placeholder={isRTL ? 'بحث في المنتجات...' : 'Search products...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30"
            style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', [isRTL ? 'paddingLeft' : 'paddingRight']: '12px' }}
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'inactive', 'draft'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'}`}>
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : status === 'active' ? (isRTL ? 'نشط' : 'Active') : status === 'inactive' ? (isRTL ? 'معطل' : 'Inactive') : (isRTL ? 'مسودة' : 'Draft')}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-400">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{isRTL ? 'لا توجد منتجات' : 'No products found'}</p>
            <button onClick={openCreate} className="mt-3 text-primary-400 hover:text-primary-300 text-sm">{isRTL ? 'أضف منتج جديد' : 'Add new product'}</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">#</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'المنتج' : 'Product'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'السعر' : 'Price'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'الصنف' : 'Category'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'المخزون' : 'Stock'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-dark-400 font-mono text-xs">#{product.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-dark-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center"><Package className="w-5 h-5 text-dark-500" /></div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{isRTL ? (product.name_ar || product.name) : product.name}</p>
                          {product.sku && <p className="text-dark-500 text-[11px]">SKU: {product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white font-semibold">${parseFloat(product.price || 0).toFixed(2)}</td>
                    <td className="px-5 py-4 text-dark-400 text-xs">{product.category || '—'}</td>
                    <td className="px-5 py-4 text-dark-400 text-xs">{product.stock ?? '∞'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-dark-500/10 text-dark-400 border border-dark-500/20'}`}>
                        {product.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                          {deletingId === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <div className="bg-[#111827] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">{editingProduct ? (isRTL ? 'تعديل المنتج' : 'Edit Product') : (isRTL ? 'منتج جديد' : 'New Product')}</h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الاسم (EN)' : 'Name (EN)'}</label>
                  <input className={inputClass} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الاسم (AR)' : 'Name (AR)'}</label>
                  <input className={inputClass} value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} placeholder="اسم المنتج" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'السعر' : 'Price'}</label>
                  <input type="number" step="0.01" className={inputClass} value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'سعر التكلفة' : 'Cost Price'}</label>
                  <input type="number" step="0.01" className={inputClass} value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">SKU</label>
                  <input className={inputClass} value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="SKU-001" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الصنف' : 'Category'}</label>
                  <input className={inputClass} value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder={isRTL ? 'الصنف' : 'Category'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'المخزون' : 'Stock'}</label>
                  <input type="number" className={inputClass} value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="∞" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{isRTL ? 'معطل' : 'Inactive'}</option>
                    <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'رابط الصورة' : 'Image URL'}</label>
                <input className={inputClass} value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الوصف (EN)' : 'Description (EN)'}</label>
                <textarea className={`${inputClass} resize-none h-20`} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الوصف (AR)' : 'Description (AR)'}</label>
                <textarea className={`${inputClass} resize-none h-20`} value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} dir="rtl" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-dark-400 hover:text-white transition-colors">{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingProduct ? (isRTL ? 'حفظ التعديل' : 'Save Changes') : (isRTL ? 'إنشاء المنتج' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
