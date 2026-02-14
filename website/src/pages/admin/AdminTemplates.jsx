import { useState, useEffect } from 'react';
import {
  Layers, Search, Plus, Edit3, Trash2, Eye, EyeOff,
  Save, X, Star, ExternalLink, Check, Loader2, RefreshCw,
  ShoppingCart, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const statusColors = {
  'active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'coming-soon': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'draft': 'bg-dark-500/10 text-dark-400 border-dark-500/20',
  'disabled': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels = {
  'active': { ar: 'نشط', en: 'Active' },
  'coming-soon': { ar: 'قريباً', en: 'Coming Soon' },
  'draft': { ar: 'مسودة', en: 'Draft' },
  'disabled': { ar: 'معطّل', en: 'Disabled' },
};

export default function AdminTemplates() {
  const { isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      setError(err?.error || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(t => {
    const name = t.name || t.nameEn || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase());
    const status = t.status || 'active';
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.updateProduct(editingId, editForm);
      await loadProducts();
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      alert(err?.error || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm(isRTL ? 'هل تريد حذف هذا المنتج؟' : 'Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      alert(err?.error || 'فشل الحذف');
    }
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'disabled' : 'active';
    try {
      await api.updateProduct(product.id, { ...product, status: newStatus });
      await loadProducts();
    } catch (err) {
      alert(err?.error || 'فشل التحديث');
    }
  };

  const activeCount = products.filter(t => (t.status || 'active') === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-dark-400 text-sm">{error}</p>
        <button onClick={loadProducts} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm transition-all">
          <RefreshCw className="w-4 h-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'إدارة المنتجات' : 'Products Management'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? `${products.length} منتج — ${activeCount} نشط` : `${products.length} products — ${activeCount} active`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadProducts} className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#111827] border border-white/5 flex-1">
          <Search className="w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-dark-500 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'disabled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                  : 'bg-[#111827] text-dark-400 border border-white/5 hover:text-white'
              }`}
            >
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusLabels[status]?.ar : statusLabels[status]?.en) || status}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">#</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المنتج' : 'Product'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'السعر' : 'Price'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'النوع' : 'Type'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المصدر' : 'Source'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, idx) => (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-dark-500 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3">
                    {editingId === product.id ? (
                      <input
                        value={editForm.name || ''}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-primary-500/30 text-sm text-white outline-none w-full"
                      />
                    ) : (
                      <div>
                        <p className="text-white font-medium text-xs">{product.name}</p>
                        {product.description && <p className="text-dark-500 text-[11px] mt-0.5 truncate max-w-[200px]">{product.description}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editForm.price || editForm.customPrice || ''}
                        onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value), customPrice: Number(e.target.value) }))}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-primary-500/30 text-sm text-white outline-none w-20"
                      />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {product.customPrice || product.price ? `$${product.customPrice || product.price}` : '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-dark-400 text-xs capitalize">{product.service_type || '-'}</td>
                  <td className="px-5 py-3 text-dark-400 text-xs">{product.source?.name || '-'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      {editingId === product.id ? (
                        <>
                          <button onClick={saveEdit} disabled={saving} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(product)} className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/5 transition-all">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleStatus(product)} className={`p-1.5 rounded-lg transition-all ${(product.status || 'active') === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-dark-500 hover:text-emerald-400'}`}>
                            {(product.status || 'active') === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-sm">{isRTL ? 'لا توجد منتجات' : 'No products found'}</p>
        </div>
      )}
    </div>
  );
}
