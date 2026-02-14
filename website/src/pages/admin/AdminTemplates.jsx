import { useState } from 'react';
import {
  Layers, Search, Plus, Edit3, Trash2, Eye, EyeOff, Image as ImageIcon,
  Save, X, Star, ExternalLink, Check, AlertTriangle, GripVertical, Upload,
  ShoppingCart
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Local editable template data (simulated — would come from API)
const initialTemplates = [
  {
    id: 'digital-services-store',
    name: 'متجر خدمات رقمية',
    nameEn: 'Digital Services Store',
    category: 'digital-services',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80',
    price: { monthly: 39, yearly: 349, lifetime: 899 },
    status: 'active',
    sales: 127,
    popular: true,
    hasLiveDemo: true,
    comingSoon: false,
  },
  {
    id: 'ecommerce-pro',
    name: 'متجر إلكتروني احترافي',
    nameEn: 'E-Commerce Pro',
    category: 'e-commerce',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    price: { monthly: 29, yearly: 249, lifetime: 599 },
    status: 'coming-soon',
    sales: 0,
    popular: false,
    hasLiveDemo: false,
    comingSoon: true,
  },
  {
    id: 'restaurant-starter',
    name: 'موقع مطعم فاخر',
    nameEn: 'Restaurant Starter',
    category: 'restaurant',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    price: { monthly: 19, yearly: 159, lifetime: 399 },
    status: 'coming-soon',
    sales: 0,
    popular: false,
    hasLiveDemo: false,
    comingSoon: true,
  },
  {
    id: 'portfolio-creative',
    name: 'بورتفوليو إبداعي',
    nameEn: 'Creative Portfolio',
    category: 'portfolio',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    price: { monthly: 14, yearly: 119, lifetime: 299 },
    status: 'coming-soon',
    sales: 0,
    popular: false,
    hasLiveDemo: false,
    comingSoon: true,
  },
  {
    id: 'saas-dashboard',
    name: 'لوحة تحكم SaaS',
    nameEn: 'SaaS Dashboard',
    category: 'dashboard',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    price: { monthly: 39, yearly: 349, lifetime: 799 },
    status: 'coming-soon',
    sales: 0,
    popular: false,
    hasLiveDemo: false,
    comingSoon: true,
  },
  {
    id: 'landing-starter',
    name: 'صفحة هبوط تسويقية',
    nameEn: 'Marketing Landing',
    category: 'landing',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
    price: { monthly: 9, yearly: 79, lifetime: 199 },
    status: 'coming-soon',
    sales: 0,
    popular: false,
    hasLiveDemo: false,
    comingSoon: true,
  },
  {
    id: 'medical-clinic',
    name: 'عيادة طبية',
    nameEn: 'Medical Clinic',
    category: 'medical',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    price: { monthly: 34, yearly: 299, lifetime: 699 },
    status: 'coming-soon',
    sales: 0,
    popular: false,
    hasLiveDemo: false,
    comingSoon: true,
  },
];

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
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.includes(search) || t.nameEn.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
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

  const saveEdit = () => {
    setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, ...editForm } : t));
    setEditingId(null);
    setEditForm({});
  };

  const toggleStatus = (id) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newStatus = t.status === 'active' ? 'disabled' : 'active';
      return { ...t, status: newStatus, comingSoon: newStatus === 'coming-soon' };
    }));
  };

  const togglePopular = (id) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, popular: !t.popular } : t));
  };

  const activeCount = templates.filter(t => t.status === 'active').length;
  const totalSales = templates.reduce((sum, t) => sum + t.sales, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'إدارة القوالب' : 'Templates Management'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? `${templates.length} قالب — ${activeCount} نشط — ${totalSales} مبيعة` : `${templates.length} templates — ${activeCount} active — ${totalSales} sold`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة قالب' : 'Add Template'}
        </button>
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
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusLabels[status].ar : statusLabels[status].en)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(template => (
          <div key={template.id} className={`bg-[#111827] rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all ${editingId === template.id ? 'ring-2 ring-primary-500/50' : ''}`}>
            {editingId === template.id ? (
              /* Edit Mode */
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{isRTL ? 'تعديل القالب' : 'Edit Template'}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={saveEdit} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'رابط الصورة' : 'Image URL'}</label>
                  <div className="flex gap-2">
                    <input
                      value={editForm.image || ''}
                      onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                      placeholder="https://..."
                    />
                    <button className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-dark-400 hover:text-white transition-all">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  {editForm.image && (
                    <img src={editForm.image} alt="" className="w-full h-24 object-cover rounded-lg mt-2 border border-white/5" />
                  )}
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'الاسم (عربي)' : 'Name (AR)'}</label>
                    <input
                      value={editForm.name || ''}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'}</label>
                    <input
                      value={editForm.nameEn || ''}
                      onChange={e => setEditForm(f => ({ ...f, nameEn: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>

                {/* Prices */}
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'الأسعار ($)' : 'Prices ($)'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['monthly', 'yearly', 'lifetime'].map(key => (
                      <div key={key}>
                        <span className="block text-[10px] text-dark-600 mb-1 capitalize">{key}</span>
                        <input
                          type="number"
                          value={editForm.price?.[key] || ''}
                          onChange={e => setEditForm(f => ({ ...f, price: { ...f.price, [key]: Number(e.target.value) } }))}
                          className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value, comingSoon: e.target.value === 'coming-soon' }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 appearance-none"
                  >
                    <option value="active" className="bg-dark-900">{isRTL ? 'نشط' : 'Active'}</option>
                    <option value="coming-soon" className="bg-dark-900">{isRTL ? 'قريباً' : 'Coming Soon'}</option>
                    <option value="draft" className="bg-dark-900">{isRTL ? 'مسودة' : 'Draft'}</option>
                    <option value="disabled" className="bg-dark-900">{isRTL ? 'معطّل' : 'Disabled'}</option>
                  </select>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img src={template.image} alt={template.nameEn} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[template.status]}`}>
                      {isRTL ? statusLabels[template.status].ar : statusLabels[template.status].en}
                    </span>
                    {template.popular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        ⭐ {isRTL ? 'مميز' : 'Popular'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">{isRTL ? template.name : template.nameEn}</h3>
                      <p className="text-dark-500 text-[11px] mt-0.5">{template.id}</p>
                    </div>
                    <p className="text-primary-400 font-bold text-sm">${template.price.monthly}<span className="text-dark-500 text-xs">/mo</span></p>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-4 text-xs">
                    <span className="text-dark-400 flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {template.sales} {isRTL ? 'مبيعة' : 'sold'}
                    </span>
                    {template.hasLiveDemo && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {isRTL ? 'ديمو حي' : 'Live Demo'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-500/10 text-primary-400 text-xs font-medium hover:bg-primary-500/20 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => togglePopular(template.id)}
                      className={`p-2 rounded-xl transition-all ${template.popular ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-dark-500 hover:text-yellow-400'}`}
                      title={isRTL ? 'تمييز' : 'Toggle Popular'}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleStatus(template.id)}
                      className={`p-2 rounded-xl transition-all ${template.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-dark-500 hover:text-emerald-400'}`}
                      title={isRTL ? 'تفعيل/تعطيل' : 'Toggle Active'}
                    >
                      {template.status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    {template.hasLiveDemo && (
                      <a
                        href={`/template/${template.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white/5 text-dark-500 hover:text-white transition-all"
                        title={isRTL ? 'معاينة' : 'Preview'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-sm">{isRTL ? 'لا توجد نتائج' : 'No results found'}</p>
        </div>
      )}
    </div>
  );
}
