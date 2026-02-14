import { useState, useEffect } from 'react';
import {
  Layers, Search, Plus, Edit3, Trash2, Eye, EyeOff,
  Save, X, Star, ExternalLink, Check, Loader2, RefreshCw,
  ShoppingCart, AlertTriangle, Globe, Palette
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates, categories } from '../../data/templates';
import api from '../../services/api';

const statusColors = {
  'active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'coming-soon': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'draft': 'bg-dark-500/10 text-dark-400 border-dark-500/20',
  'disabled': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabelsMap = {
  'active': { ar: 'نشط', en: 'Active' },
  'coming-soon': { ar: 'قريباً', en: 'Coming Soon' },
  'draft': { ar: 'مسودة', en: 'Draft' },
  'disabled': { ar: 'معطّل', en: 'Disabled' },
};

export default function AdminTemplates() {
  const { isRTL } = useLanguage();
  const [templates, setTemplates] = useState(staticTemplates);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving] = useState(false);

  // Try to get live data from API, merge with static templates
  useEffect(() => {
    api.getPublicProducts()
      .then(res => {
        if (res.products?.length > 0) {
          const apiProducts = res.products;
          const apiByName = new Map(apiProducts.map(p => [p.name?.trim(), p]));
          const matchedApiNames = new Set();

          const merged = staticTemplates.map(st => {
            const live = apiByName.get(st.name?.trim());
            if (live) {
              matchedApiNames.add(live.name?.trim());
              const price = parseFloat(live.price);
              return {
                ...st,
                name: live.name || st.name,
                description: live.description || st.description,
                price: price
                  ? { monthly: price, yearly: price * 10, lifetime: price * 25 }
                  : st.price,
                image: live.image || st.image,
                status: live.status || (st.comingSoon ? 'coming-soon' : 'active'),
                _apiId: live.id,
              };
            }
            return { ...st, status: st.comingSoon ? 'coming-soon' : 'active' };
          });

          // Add API products not matched to static templates
          apiProducts.forEach(p => {
            if (!matchedApiNames.has(p.name?.trim())) {
              const price = parseFloat(p.price) || 0;
              merged.push({
                id: p.id,
                name: p.name,
                nameEn: p.name,
                description: p.description || '',
                descriptionEn: p.description || '',
                category: p.category || 'digital-services',
                image: p.image || 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80',
                price: { monthly: price, yearly: price * 10, lifetime: price * 25 },
                features: [], featuresEn: [],
                color: 'from-purple-500 to-indigo-600',
                status: p.status || 'active',
              });
            }
          });

          setTemplates(merged);
        } else {
          setTemplates(staticTemplates.map(st => ({
            ...st,
            status: st.comingSoon ? 'coming-soon' : 'active',
          })));
        }
      })
      .catch(() => {
        setTemplates(staticTemplates.map(st => ({
          ...st,
          status: st.comingSoon ? 'coming-soon' : 'active',
        })));
      });
  }, []);

  const filtered = templates.filter(t => {
    const name = (isRTL ? t.name : t.nameEn) || t.name || '';
    const desc = (isRTL ? t.description : t.descriptionEn) || t.description || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase());
    const status = t.status || (t.comingSoon ? 'coming-soon' : 'active');
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const startEdit = (template) => {
    setEditingId(template.id);
    setEditForm({ ...template });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.updateProduct(editingId, {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price?.monthly || editForm.price,
        image: editForm.image,
      });
      // Update locally
      setTemplates(prev => prev.map(t =>
        t.id === editingId ? { ...t, ...editForm } : t
      ));
      setEditingId(null);
      setEditForm({});
    } catch {
      // If API fails, still update locally
      setTemplates(prev => prev.map(t =>
        t.id === editingId ? { ...t, ...editForm } : t
      ));
      setEditingId(null);
      setEditForm({});
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (template) => {
    const currentStatus = template.status || (template.comingSoon ? 'coming-soon' : 'active');
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    setTemplates(prev => prev.map(t =>
      t.id === template.id ? { ...t, status: newStatus, comingSoon: newStatus === 'coming-soon' } : t
    ));
    // Try API update silently
    api.updateProduct(template.id, { status: newStatus }).catch(() => {});
  };

  const activeCount = templates.filter(t => (t.status || (t.comingSoon ? 'coming-soon' : 'active')) === 'active').length;
  const comingSoonCount = templates.filter(t => t.comingSoon || t.status === 'coming-soon').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'إدارة القوالب' : 'Templates Management'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL
              ? `${templates.length} قالب — ${activeCount} نشط — ${comingSoonCount} قريباً`
              : `${templates.length} templates — ${activeCount} active — ${comingSoonCount} coming soon`}
          </p>
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
            placeholder={isRTL ? 'ابحث عن قالب...' : 'Search templates...'}
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-dark-500 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'coming-soon', 'disabled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                  : 'bg-[#111827] text-dark-400 border border-white/5 hover:text-white'
              }`}
            >
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusLabelsMap[status]?.ar : statusLabelsMap[status]?.en) || status}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((template) => {
          const status = template.status || (template.comingSoon ? 'coming-soon' : 'active');
          const isEditing = editingId === template.id;
          const name = isRTL ? template.name : (template.nameEn || template.name);
          const desc = isRTL ? template.description : (template.descriptionEn || template.description);
          const price = template.price?.monthly || 0;

          return (
            <div
              key={template.id}
              className={`group bg-[#111827] rounded-2xl border overflow-hidden transition-all hover:border-white/10 ${
                isEditing ? 'border-primary-500/30 ring-1 ring-primary-500/20' : 'border-white/5'
              }`}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={template.image}
                  alt={name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${template.comingSoon ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                {/* Status Badge */}
                <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[status] || statusColors['active']}`}>
                    {isRTL ? statusLabelsMap[status]?.ar : statusLabelsMap[status]?.en}
                  </span>
                </div>

                {/* Popular Badge */}
                {template.popular && (
                  <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                      ⭐ {isRTL ? 'مميز' : 'Popular'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-dark-500 mb-1 block">{isRTL ? 'الاسم' : 'Name'}</label>
                      <input
                        value={editForm.name || ''}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-primary-500/30 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-dark-500 mb-1 block">{isRTL ? 'الاسم (EN)' : 'Name (EN)'}</label>
                      <input
                        value={editForm.nameEn || ''}
                        onChange={e => setEditForm(f => ({ ...f, nameEn: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-primary-500/30 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-dark-500 mb-1 block">{isRTL ? 'السعر الشهري' : 'Monthly Price'}</label>
                      <input
                        type="number"
                        value={editForm.price?.monthly || ''}
                        onChange={e => setEditForm(f => ({
                          ...f,
                          price: { ...f.price, monthly: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-primary-500/30 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-dark-500 mb-1 block">{isRTL ? 'رابط الصورة' : 'Image URL'}</label>
                      <input
                        value={editForm.image || ''}
                        onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-primary-500/30 text-sm text-white outline-none"
                      />
                      {editForm.image && (
                        <img src={editForm.image} alt="preview" className="mt-2 h-20 w-full object-cover rounded-lg border border-white/5" />
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={saveEdit} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-all">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {isRTL ? 'حفظ' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all">
                        <X className="w-3.5 h-3.5" />
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-bold text-sm mb-1.5">{name}</h3>
                    <p className="text-dark-400 text-xs leading-relaxed line-clamp-2 mb-3">{desc}</p>

                    {/* Category */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Palette className="w-3 h-3 text-dark-500" />
                      <span className="text-dark-500 text-[11px] capitalize">{template.category?.replace('-', ' ')}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-xl font-display font-black text-white">${price}</span>
                      <span className="text-dark-500 text-xs">{isRTL ? '/شهر' : '/mo'}</span>
                      {template.price?.lifetime && (
                        <span className="text-dark-600 text-[10px] ms-2">${template.price.lifetime} {isRTL ? 'مدى الحياة' : 'lifetime'}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <button onClick={() => startEdit(template)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/5 text-xs transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                        {isRTL ? 'تعديل' : 'Edit'}
                      </button>
                      <button onClick={() => toggleStatus(template)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                        status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-dark-500 hover:text-emerald-400'
                      }`}>
                        {status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطّل' : 'Off')}
                      </button>
                      {template.hasLiveDemo && (
                        <a href={template.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-dark-400 hover:text-cyan-400 text-xs transition-all ms-auto">
                          <Globe className="w-3.5 h-3.5" />
                          {isRTL ? 'معاينة' : 'Demo'}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-sm">{isRTL ? 'لا توجد قوالب مطابقة' : 'No matching templates'}</p>
        </div>
      )}
    </div>
  );
}
