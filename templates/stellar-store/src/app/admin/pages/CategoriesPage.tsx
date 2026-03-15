'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Pencil, Trash2, X, Check, Loader2, Package } from 'lucide-react';
import { adminApi, mapBackendProduct } from '@/lib/api';
import type { Product, Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const data = await adminApi.getProducts();
      const list = Array.isArray(data) ? data : data?.products || [];
      const products = list.map((p: Record<string, unknown>) => mapBackendProduct(p));
      // Extract categories from products
      const catMap: Record<string, number> = {};
      products.forEach((p: Product) => {
        const cat = p.group_name || p.category || 'بدون تصنيف';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      setCategories(Object.entries(catMap).map(([name, count]) => ({ name, count })));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingName(null);
      return;
    }
    setSaving(true);
    try {
      await adminApi.renameGroup(oldName, newName.trim());
      await loadCategories();
      setEditingName(null);
    } catch {
      alert('فشل تغيير اسم القسم');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${name}"؟ سيتم إزالة القسم من جميع المنتجات.`)) return;
    setDeleting(name);
    try {
      await adminApi.deleteGroup(name);
      await loadCategories();
    } catch {
      alert('فشل حذف القسم');
    } finally {
      setDeleting(null);
    }
  };

  const colors = [
    { bg: 'bg-gold-500/10', border: 'border-gold-500/20', icon: 'text-gold-500' },
    { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400' },
    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400' },
    { bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: 'text-rose-400' },
    { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <FolderOpen className="w-7 h-7 text-gold-500" />
          الأقسام
        </h1>
        <p className="text-navy-400 text-sm mt-1">{categories.length} قسم — اضغط على أيقونة التعديل لتغيير اسم القسم</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">لا توجد أقسام بعد</p>
          <p className="text-navy-500 text-sm mt-2">أضف منتجات وحدد أقسامها من صفحة المنتجات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const color = colors[i % colors.length];
            const isEditing = editingName === cat.name;

            return (
              <div
                key={cat.name}
                className={`p-5 rounded-2xl bg-navy-900/60 border ${color.border} animate-fadeInUp transition-all`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center`}>
                    <FolderOpen className={`w-6 h-6 ${color.icon}`} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingName(cat.name); setNewName(cat.name); }}
                      className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.name)}
                      disabled={deleting === cat.name}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      {deleting === cat.name ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-navy-800/60 border border-navy-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500/50"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(cat.name); if (e.key === 'Escape') setEditingName(null); }}
                    />
                    <button
                      onClick={() => handleRename(cat.name)}
                      disabled={saving}
                      className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingName(null)}
                      className="w-9 h-9 rounded-lg bg-navy-800 text-navy-400 flex items-center justify-center hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-navy-400 text-sm">
                      <Package className="w-4 h-4" />
                      <span>{cat.count} منتج</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
