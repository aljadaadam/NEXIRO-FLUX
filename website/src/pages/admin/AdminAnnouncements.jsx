import { useState } from 'react';
import {
  Megaphone, Plus, Send, Trash2, Edit3, Save, X, Clock,
  Users, Eye, Pin, Bell, CheckCircle, AlertCircle, Info, Zap,
  Globe, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const typeConfig = {
  info: { labelAr: 'معلومات', labelEn: 'Info', icon: Info, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  success: { labelAr: 'نجاح', labelEn: 'Success', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  warning: { labelAr: 'تحذير', labelEn: 'Warning', icon: AlertCircle, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  promo: { labelAr: 'عرض', labelEn: 'Promo', icon: Zap, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  update: { labelAr: 'تحديث', labelEn: 'Update', icon: Bell, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
};

const audienceConfig = {
  all: { labelAr: 'جميع المستخدمين', labelEn: 'All Users' },
  buyers: { labelAr: 'المشترين فقط', labelEn: 'Buyers Only' },
  'non-buyers': { labelAr: 'غير المشترين', labelEn: 'Non-Buyers' },
};

const initialAnnouncements = [
  {
    id: 1,
    titleAr: 'عرض خاص: خصم 30% على جميع القوالب!',
    titleEn: 'Special Offer: 30% Off All Templates!',
    contentAr: 'احتفالاً بإطلاق منصة NEXIRO-FLUX، نقدم خصم 30% على جميع القوالب لفترة محدودة. استخدم كود LAUNCH30 عند الشراء.',
    contentEn: 'Celebrating the launch of NEXIRO-FLUX, we offer 30% off all templates for a limited time. Use code LAUNCH30 at checkout.',
    type: 'promo',
    audience: 'all',
    pinned: true,
    published: true,
    views: 1840,
    date: '2026-02-10',
  },
  {
    id: 2,
    titleAr: 'تحديث جديد: قالب المتجر الرقمي v2.5',
    titleEn: 'New Update: Digital Services Store v2.5',
    contentAr: 'تم إضافة ميزات جديدة تشمل: نظام إشعارات متقدم، تحسينات الأداء، ودعم بوابة دفع جديدة.',
    contentEn: 'New features added: advanced notification system, performance improvements, and new payment gateway support.',
    type: 'update',
    audience: 'buyers',
    pinned: false,
    published: true,
    views: 523,
    date: '2026-02-08',
  },
  {
    id: 3,
    titleAr: 'صيانة مجدولة — الأحد القادم',
    titleEn: 'Scheduled Maintenance — Next Sunday',
    contentAr: 'سيتم إجراء صيانة دورية يوم الأحد من الساعة 2-4 صباحاً. قد تتأثر بعض الخدمات مؤقتاً.',
    contentEn: 'Routine maintenance will be performed on Sunday from 2-4 AM. Some services may be temporarily affected.',
    type: 'warning',
    audience: 'all',
    pinned: false,
    published: true,
    views: 342,
    date: '2026-02-05',
  },
];

const emptyAnnouncement = {
  titleAr: '',
  titleEn: '',
  contentAr: '',
  contentEn: '',
  type: 'info',
  audience: 'all',
  pinned: false,
  published: false,
};

export default function AdminAnnouncements() {
  const { isRTL } = useLanguage();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyAnnouncement });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyAnnouncement });
    setShowForm(true);
  };

  const openEdit = (ann) => {
    setEditingId(ann.id);
    setForm({ ...ann });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyAnnouncement });
  };

  const handleSave = () => {
    if (editingId) {
      setAnnouncements(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setAnnouncements(prev => [{
        ...form,
        id: Date.now(),
        views: 0,
        date: new Date().toISOString().split('T')[0],
      }, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const togglePin = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const togglePublish = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, published: !a.published } : a));
  };

  const publishedCount = announcements.filter(a => a.published).length;
  const totalViews = announcements.reduce((s, a) => s + a.views, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'الإعلانات' : 'Announcements'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL
              ? `${announcements.length} إعلان — ${publishedCount} منشور — ${totalViews.toLocaleString()} مشاهدة`
              : `${announcements.length} announcements — ${publishedCount} published — ${totalViews.toLocaleString()} views`
            }
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          {isRTL ? 'إعلان جديد' : 'New Announcement'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-[#111827] rounded-2xl border border-primary-500/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary-400" />
              {editingId ? (isRTL ? 'تعديل الإعلان' : 'Edit Announcement') : (isRTL ? 'إعلان جديد' : 'New Announcement')}
            </h3>
            <button onClick={closeForm} className="text-dark-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'العنوان (عربي)' : 'Title (AR)'}</label>
              <input
                value={form.titleAr}
                onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                placeholder={isRTL ? 'العنوان بالعربي...' : 'Arabic title...'}
              />
            </div>
            <div>
              <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label>
              <input
                value={form.titleEn}
                onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                placeholder="English title..."
              />
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'المحتوى (عربي)' : 'Content (AR)'}</label>
              <textarea
                rows={3}
                value={form.contentAr}
                onChange={e => setForm(f => ({ ...f, contentAr: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 resize-none"
                placeholder={isRTL ? 'محتوى الإعلان...' : 'Arabic content...'}
              />
            </div>
            <div>
              <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'المحتوى (إنجليزي)' : 'Content (EN)'}</label>
              <textarea
                rows={3}
                value={form.contentEn}
                onChange={e => setForm(f => ({ ...f, contentEn: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 resize-none"
                placeholder="English content..."
              />
            </div>
          </div>

          {/* Type + Audience + Options */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'النوع' : 'Type'}</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 appearance-none"
              >
                {Object.entries(typeConfig).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-dark-900">{isRTL ? cfg.labelAr : cfg.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-dark-500 mb-1.5">{isRTL ? 'الجمهور' : 'Audience'}</label>
              <select
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 appearance-none"
              >
                {Object.entries(audienceConfig).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-dark-900">{isRTL ? cfg.labelAr : cfg.labelEn}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="sr-only peer" />
                <div className="w-8 h-5 rounded-full bg-white/10 peer-checked:bg-primary-500 transition-all relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-3" />
                <span className="text-dark-400 text-xs">{isRTL ? 'تثبيت' : 'Pin'}</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={!form.titleAr && !form.titleEn}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
              >
                <Send className="w-4 h-4" />
                {editingId ? (isRTL ? 'حفظ التعديل' : 'Save Changes') : (isRTL ? 'نشر الإعلان' : 'Publish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(ann => {
          const typeInfo = typeConfig[ann.type] || typeConfig.info;
          const TypeIcon = typeInfo.icon;
          return (
            <div key={ann.id} className={`bg-[#111827] rounded-2xl border overflow-hidden transition-all hover:border-white/10 ${ann.pinned ? 'border-primary-500/20' : 'border-white/5'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeInfo.color}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {ann.pinned && (
                          <Pin className="w-3.5 h-3.5 text-primary-400 fill-primary-400" />
                        )}
                        <h3 className="font-bold text-white text-sm">{isRTL ? ann.titleAr : ann.titleEn}</h3>
                      </div>
                      <p className="text-dark-400 text-xs leading-relaxed line-clamp-2">{isRTL ? ann.contentAr : ann.contentEn}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="flex items-center gap-1 text-dark-500 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {ann.date}
                        </span>
                        <span className="flex items-center gap-1 text-dark-500 text-[11px]">
                          <Eye className="w-3 h-3" />
                          {ann.views.toLocaleString()} {isRTL ? 'مشاهدة' : 'views'}
                        </span>
                        <span className="flex items-center gap-1 text-dark-500 text-[11px]">
                          <Users className="w-3 h-3" />
                          {isRTL ? audienceConfig[ann.audience].labelAr : audienceConfig[ann.audience].labelEn}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ann.published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-dark-500/10 text-dark-400 border-dark-500/20'
                        }`}>
                          {ann.published ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePin(ann.id)}
                      className={`p-1.5 rounded-lg transition-all ${ann.pinned ? 'text-primary-400 bg-primary-500/10' : 'text-dark-500 hover:text-primary-400 hover:bg-white/5'}`}
                      title={isRTL ? 'تثبيت' : 'Pin'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => togglePublish(ann.id)}
                      className={`p-1.5 rounded-lg transition-all ${ann.published ? 'text-emerald-400 bg-emerald-500/10' : 'text-dark-500 hover:text-emerald-400 hover:bg-white/5'}`}
                      title={ann.published ? (isRTL ? 'إخفاء' : 'Unpublish') : (isRTL ? 'نشر' : 'Publish')}
                    >
                      {ann.published ? <Eye className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(ann)}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-white/5 transition-all"
                      title={isRTL ? 'تعديل' : 'Edit'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                      title={isRTL ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-sm">{isRTL ? 'لا توجد إعلانات بعد' : 'No announcements yet'}</p>
        </div>
      )}
    </div>
  );
}
