'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Pencil, Trash2, X, Check, Loader2, Package, Tag, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi, mapBackendProduct } from '@/lib/api';
import type { Product, Category, Coupon } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ─── Coupons State ───
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponDeleting, setCouponDeleting] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    min_order_amount: '',
    expires_at: '',
    is_active: true,
  });

  const loadCategories = async () => {
    try {
      const data = await adminApi.getProducts();
      const list = Array.isArray(data) ? data : data?.products || [];
      const products = list.map((p: Record<string, unknown>) => mapBackendProduct(p));
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

  const loadCoupons = async () => {
    try {
      const data = await adminApi.getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => { loadCategories(); loadCoupons(); }, []);

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

  // ─── Coupon Handlers ───
  const resetCouponForm = () => {
    setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', min_order_amount: '', expires_at: '', is_active: true });
    setEditingCoupon(null);
    setShowCouponForm(false);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
      is_active: !!coupon.is_active,
    });
    setShowCouponForm(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.discount_value) {
      alert('الكود وقيمة الخصم مطلوبان');
      return;
    }
    setCouponSaving(true);
    try {
      const payload = {
        code: couponForm.code.trim(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
        min_order_amount: couponForm.min_order_amount ? parseFloat(couponForm.min_order_amount) : null,
        expires_at: couponForm.expires_at || null,
        is_active: couponForm.is_active,
      };
      if (editingCoupon) {
        await adminApi.updateCoupon(editingCoupon.id, payload);
      } else {
        await adminApi.createCoupon(payload);
      }
      resetCouponForm();
      await loadCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل في حفظ كود الخصم';
      alert(msg);
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف كود الخصم؟')) return;
    setCouponDeleting(id);
    try {
      await adminApi.deleteCoupon(id);
      await loadCoupons();
    } catch {
      alert('فشل حذف كود الخصم');
    } finally {
      setCouponDeleting(null);
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await adminApi.updateCoupon(coupon.id, { is_active: !coupon.is_active });
      await loadCoupons();
    } catch {
      alert('فشل تحديث حالة القسيمة');
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
    <div className="p-4 sm:p-6 space-y-8">
      {/* ═══════ Categories Section ═══════ */}
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

      {/* ═══════ Coupons Section ═══════ */}
      <div className="border-t border-navy-800 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-gold-500" />
            أكواد الخصم
          </h2>
          <button
            onClick={() => { resetCouponForm(); setShowCouponForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة كود خصم
          </button>
        </div>

        {/* Coupon Form Modal */}
        {showCouponForm && (
          <div className="mb-6 p-5 rounded-2xl bg-navy-900/80 border border-gold-500/20 space-y-4 animate-fadeInUp">
            <h3 className="text-white font-bold text-lg">
              {editingCoupon ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-navy-400 text-sm mb-1">الكود</label>
                <input
                  value={couponForm.code}
                  onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="مثال: SAVE20"
                  className="w-full px-3 py-2.5 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50 uppercase tracking-wider"
                />
              </div>
              {/* Type */}
              <div>
                <label className="block text-navy-400 text-sm mb-1">نوع الخصم</label>
                <select
                  value={couponForm.discount_type}
                  onChange={e => setCouponForm(f => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-3 py-2.5 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (SDG)</option>
                </select>
              </div>
              {/* Value */}
              <div>
                <label className="block text-navy-400 text-sm mb-1">
                  {couponForm.discount_type === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم (SDG)'}
                </label>
                <input
                  type="number"
                  value={couponForm.discount_value}
                  onChange={e => setCouponForm(f => ({ ...f, discount_value: e.target.value }))}
                  placeholder={couponForm.discount_type === 'percentage' ? '10' : '5000'}
                  min="0"
                  max={couponForm.discount_type === 'percentage' ? '100' : undefined}
                  className="w-full px-3 py-2.5 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                />
              </div>
              {/* Max uses */}
              <div>
                <label className="block text-navy-400 text-sm mb-1">الحد الأقصى للاستخدام (اختياري)</label>
                <input
                  type="number"
                  value={couponForm.max_uses}
                  onChange={e => setCouponForm(f => ({ ...f, max_uses: e.target.value }))}
                  placeholder="بدون حد"
                  min="1"
                  className="w-full px-3 py-2.5 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                />
              </div>
              {/* Min order */}
              <div>
                <label className="block text-navy-400 text-sm mb-1">الحد الأدنى للطلب — SDG (اختياري)</label>
                <input
                  type="number"
                  value={couponForm.min_order_amount}
                  onChange={e => setCouponForm(f => ({ ...f, min_order_amount: e.target.value }))}
                  placeholder="بدون حد أدنى"
                  min="0"
                  className="w-full px-3 py-2.5 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                />
              </div>
              {/* Expires */}
              <div>
                <label className="block text-navy-400 text-sm mb-1">تاريخ الانتهاء (اختياري)</label>
                <input
                  type="datetime-local"
                  value={couponForm.expires_at}
                  onChange={e => setCouponForm(f => ({ ...f, expires_at: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-navy-800/60 border border-navy-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                />
              </div>
            </div>
            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button onClick={() => setCouponForm(f => ({ ...f, is_active: !f.is_active }))} className="text-navy-400 hover:text-white transition-colors">
                {couponForm.is_active ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
              <span className="text-sm text-navy-300">{couponForm.is_active ? 'مفعّل' : 'معطّل'}</span>
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveCoupon}
                disabled={couponSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 text-sm"
              >
                {couponSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingCoupon ? 'تحديث' : 'إضافة'}
              </button>
              <button
                onClick={resetCouponForm}
                className="px-5 py-2.5 bg-navy-800 text-navy-300 font-bold rounded-xl hover:text-white transition-all text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Coupons List */}
        {couponsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-navy-900/40 rounded-2xl border border-navy-800">
            <Tag className="w-12 h-12 text-navy-700 mx-auto mb-3" />
            <p className="text-navy-400 font-bold">لا توجد أكواد خصم</p>
            <p className="text-navy-500 text-sm mt-1">أنشئ كود خصم لتقديم عروض لعملائك</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon, i) => {
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
              const isExhausted = coupon.max_uses && coupon.used_count >= coupon.max_uses;
              const statusColor = !coupon.is_active ? 'text-navy-500' : isExpired || isExhausted ? 'text-red-400' : 'text-emerald-400';
              const statusLabel = !coupon.is_active ? 'معطّل' : isExpired ? 'منتهي' : isExhausted ? 'مستنفد' : 'نشط';

              return (
                <div
                  key={coupon.id}
                  className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800 hover:border-gold-500/20 transition-all animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="bg-gold-500/10 text-gold-500 px-3 py-1 rounded-lg font-mono font-bold text-sm tracking-wider">{coupon.code}</span>
                        <span className={`text-xs font-bold ${statusColor}`}>● {statusLabel}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400 mt-2">
                        <span>
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}% خصم`
                            : `${Number(coupon.discount_value).toLocaleString()} SDG خصم`}
                        </span>
                        <span>استُخدم {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''} مرة</span>
                        {coupon.min_order_amount && <span>حد أدنى: {Number(coupon.min_order_amount).toLocaleString()} SDG</span>}
                        {coupon.expires_at && <span>ينتهي: {new Date(coupon.expires_at).toLocaleDateString('ar')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleCoupon(coupon)}
                        className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-all"
                        title={coupon.is_active ? 'تعطيل' : 'تفعيل'}
                      >
                        {coupon.is_active
                          ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                          : <ToggleLeft className="w-4 h-4 text-navy-500" />}
                      </button>
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        disabled={couponDeleting === coupon.id}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        {couponDeleting === coupon.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
