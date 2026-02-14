import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Landmark, Bitcoin, Wallet, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, Save, X, Loader2, Globe, ChevronDown,
  Star, StarOff, AlertCircle, CheckCircle2, Search
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

// ─── أنواع البوابات ───
const gatewayTypes = [
  {
    value: 'paypal',
    labelAr: 'باي بال',
    labelEn: 'PayPal',
    icon: Wallet,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    configFields: [
      { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email', type: 'email', required: true },
      { key: 'client_id', labelAr: 'Client ID', labelEn: 'Client ID', type: 'text' },
      { key: 'secret', labelAr: 'Secret Key', labelEn: 'Secret Key', type: 'password' },
      { key: 'mode', labelAr: 'الوضع', labelEn: 'Mode', type: 'select', options: ['sandbox', 'live'] },
    ],
  },
  {
    value: 'bank_transfer',
    labelAr: 'تحويل بنكي',
    labelEn: 'Bank Transfer',
    icon: Landmark,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    configFields: [
      { key: 'bank_name', labelAr: 'اسم البنك', labelEn: 'Bank Name', type: 'text', required: true },
      { key: 'account_holder', labelAr: 'صاحب الحساب', labelEn: 'Account Holder', type: 'text', required: true },
      { key: 'iban', labelAr: 'رقم IBAN', labelEn: 'IBAN', type: 'text', required: true },
      { key: 'swift', labelAr: 'رمز SWIFT', labelEn: 'SWIFT Code', type: 'text' },
      { key: 'account_number', labelAr: 'رقم الحساب', labelEn: 'Account Number', type: 'text' },
      { key: 'currency', labelAr: 'العملة', labelEn: 'Currency', type: 'text' },
    ],
    hasCountryFilter: true,
  },
  {
    value: 'usdt',
    labelAr: 'USDT',
    labelEn: 'USDT',
    icon: Bitcoin,
    color: 'from-green-500 to-teal-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    configFields: [
      { key: 'wallet_address', labelAr: 'عنوان المحفظة', labelEn: 'Wallet Address', type: 'text', required: true },
      { key: 'network', labelAr: 'الشبكة', labelEn: 'Network', type: 'select', options: ['TRC20', 'ERC20', 'BEP20'], required: true },
    ],
  },
  {
    value: 'binance',
    labelAr: 'بينانس',
    labelEn: 'Binance',
    icon: CreditCard,
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    configFields: [
      { key: 'binance_id', labelAr: 'Binance Pay ID', labelEn: 'Binance Pay ID', type: 'text', required: true },
      { key: 'binance_email', labelAr: 'إيميل بينانس', labelEn: 'Binance Email', type: 'email' },
      { key: 'api_key', labelAr: 'API Key', labelEn: 'API Key', type: 'password' },
      { key: 'api_secret', labelAr: 'API Secret', labelEn: 'API Secret', type: 'password' },
    ],
  },
];

// ─── قائمة الدول ───
const countryList = [
  { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar' },
  { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman' },
  { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan' },
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt' },
  { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon' },
  { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria' },
  { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine' },
  { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen' },
  { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya' },
  { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan' },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia' },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria' },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco' },
  { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey' },
  { code: 'US', nameAr: 'أمريكا', nameEn: 'United States' },
  { code: 'GB', nameAr: 'بريطانيا', nameEn: 'United Kingdom' },
  { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany' },
  { code: 'FR', nameAr: 'فرنسا', nameEn: 'France' },
];

// ─── نموذج فارغ ───
const emptyForm = {
  type: 'paypal',
  name: '',
  name_en: '',
  is_enabled: true,
  is_default: false,
  config: {},
  countries: [],
  display_order: 0,
};

export default function AdminPaymentGateways() {
  const { isRTL } = useLanguage();
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Fetch ───
  const fetchGateways = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPaymentGateways();
      setGateways(data.gateways || []);
    } catch (err) {
      console.error('Failed to fetch gateways:', err);
      setMessage({ type: 'error', text: isRTL ? 'فشل في جلب البوابات' : 'Failed to load gateways' });
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  // ─── Show message ───
  const flash = (type, textAr, textEn) => {
    setMessage({ type, text: isRTL ? textAr : textEn });
    setTimeout(() => setMessage(null), 4000);
  };

  // ─── Open form ───
  const openCreate = (type = 'paypal') => {
    setEditingId(null);
    setForm({ ...emptyForm, type });
    setShowForm(true);
  };

  const openEdit = (gw) => {
    setEditingId(gw.id);
    setForm({
      type: gw.type,
      name: gw.name || '',
      name_en: gw.name_en || '',
      is_enabled: !!gw.is_enabled,
      is_default: !!gw.is_default,
      config: gw.config || {},
      countries: gw.countries || [],
      display_order: gw.display_order || 0,
    });
    setShowForm(true);
  };

  // ─── Save ───
  const handleSave = async () => {
    if (!form.name.trim()) {
      flash('error', 'يرجى إدخال اسم البوابة', 'Please enter gateway name');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.updatePaymentGateway(editingId, form);
        flash('success', 'تم تحديث البوابة بنجاح', 'Gateway updated');
      } else {
        await api.createPaymentGateway(form);
        flash('success', 'تم إنشاء البوابة بنجاح', 'Gateway created');
      }
      setShowForm(false);
      await fetchGateways();
    } catch (err) {
      console.error('Save error:', err);
      flash('error', 'فشل في حفظ البوابة', 'Failed to save gateway');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle ───
  const handleToggle = async (id) => {
    try {
      await api.togglePaymentGateway(id);
      await fetchGateways();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // ─── Delete ───
  const handleDelete = async (id) => {
    try {
      await api.deletePaymentGateway(id);
      setDeleteConfirm(null);
      flash('success', 'تم حذف البوابة', 'Gateway deleted');
      await fetchGateways();
    } catch (err) {
      console.error('Delete error:', err);
      flash('error', 'فشل في حذف البوابة', 'Failed to delete gateway');
    }
  };

  // ─── Type info helper ───
  const getTypeInfo = (type) => gatewayTypes.find(t => t.value === type) || gatewayTypes[0];

  // ─── Config field update ───
  const updateConfig = (key, value) => {
    setForm(f => ({ ...f, config: { ...f.config, [key]: value } }));
  };

  // ─── Country toggle ───
  const toggleCountry = (code) => {
    setForm(f => {
      const c = f.countries || [];
      return { ...f, countries: c.includes(code) ? c.filter(x => x !== code) : [...c, code] };
    });
  };

  // ─── Filter ───
  const filtered = gateways.filter(gw => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (gw.name || '').toLowerCase().includes(q) || (gw.type || '').includes(q);
  });

  // Group by type
  const grouped = gatewayTypes.map(t => ({
    ...t,
    items: filtered.filter(gw => gw.type === t.value),
  }));

  const currentTypeInfo = getTypeInfo(form.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            {isRTL ? 'بوابات الدفع' : 'Payment Gateways'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'إدارة وتخصيص بوابات الدفع المتاحة لعملائك' : 'Manage and customize payment gateways for your clients'}
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة بوابة' : 'Add Gateway'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md">
        <Search className="w-4 h-4 text-dark-500" />
        <input
          type="text"
          placeholder={isRTL ? 'بحث في البوابات...' : 'Search gateways...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white placeholder:text-dark-500 w-full"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Quick add cards */}
          {gateways.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gatewayTypes.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => openCreate(t.value)}
                    className={`group relative overflow-hidden rounded-2xl border ${t.border} ${t.bg} p-6 text-center hover:scale-[1.02] transition-all`}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{isRTL ? t.labelAr : t.labelEn}</h3>
                    <p className="text-dark-400 text-xs">{isRTL ? 'اضغط للإضافة' : 'Click to add'}</p>
                    <Plus className="absolute top-3 end-3 w-5 h-5 text-dark-600 group-hover:text-white transition-colors" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Grouped gateways */}
          {grouped.filter(g => g.items.length > 0).map(group => {
            const Icon = group.icon;
            return (
              <div key={group.value} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${group.bg.replace('bg-', 'text-').replace('/10', '')}`} />
                  <h2 className="text-lg font-bold text-white">{isRTL ? group.labelAr : group.labelEn}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-dark-400 text-xs">{group.items.length}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.items.map(gw => (
                    <div key={gw.id} className={`relative rounded-2xl border ${gw.is_enabled ? group.border : 'border-white/5'} ${gw.is_enabled ? group.bg : 'bg-white/[0.02]'} p-5 transition-all`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center ${!gw.is_enabled ? 'opacity-40' : ''}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-bold ${gw.is_enabled ? 'text-white' : 'text-dark-500'}`}>{gw.name}</h3>
                            {gw.name_en && <p className="text-dark-500 text-xs">{gw.name_en}</p>}
                          </div>
                          {gw.is_default ? (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold border border-yellow-500/20 flex items-center gap-1">
                              <Star className="w-3 h-3" /> {isRTL ? 'افتراضي' : 'Default'}
                            </span>
                          ) : null}
                        </div>
                        <button
                          onClick={() => handleToggle(gw.id)}
                          className="transition-colors"
                          title={gw.is_enabled ? (isRTL ? 'تعطيل' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
                        >
                          {gw.is_enabled
                            ? <ToggleRight className="w-8 h-8 text-emerald-400" />
                            : <ToggleLeft className="w-8 h-8 text-dark-600" />
                          }
                        </button>
                      </div>

                      {/* Config summary */}
                      <div className="space-y-1 mb-4">
                        {gw.config && Object.entries(gw.config).map(([k, v]) => {
                          if (!v || k.includes('secret') || k.includes('api_')) return null;
                          return (
                            <div key={k} className="flex items-center gap-2 text-xs">
                              <span className="text-dark-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                              <span className="text-dark-300 font-mono text-[11px]">{String(v).length > 30 ? String(v).slice(0, 30) + '...' : String(v)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Countries */}
                      {gw.type === 'bank_transfer' && gw.countries && gw.countries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          <Globe className="w-3.5 h-3.5 text-dark-500 mt-0.5" />
                          {gw.countries.map(c => {
                            const country = countryList.find(x => x.code === c);
                            return (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-white/5 text-dark-400 text-[10px] font-medium">
                                {country ? (isRTL ? country.nameAr : country.nameEn) : c}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <button
                          onClick={() => openEdit(gw)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> {isRTL ? 'تعديل' : 'Edit'}
                        </button>
                        {deleteConfirm === gw.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(gw.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                            >
                              {isRTL ? 'تأكيد الحذف' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-white transition-all"
                            >
                              {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(gw.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {isRTL ? 'حذف' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ─── Modal Form ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-[#0d1221] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {(() => { const I = currentTypeInfo.icon; return <I className="w-5 h-5" />; })()}
                {editingId
                  ? (isRTL ? 'تعديل بوابة الدفع' : 'Edit Payment Gateway')
                  : (isRTL ? 'إضافة بوابة دفع جديدة' : 'Add Payment Gateway')
                }
              </h2>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">{isRTL ? 'نوع البوابة' : 'Gateway Type'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gatewayTypes.map(t => {
                    const Icon = t.icon;
                    const active = form.type === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setForm(f => ({ ...f, type: t.value, config: {}, countries: [] }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-xs font-medium ${
                          active
                            ? `${t.border} ${t.bg} text-white`
                            : 'border-white/5 bg-white/[0.02] text-dark-400 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {isRTL ? t.labelAr : t.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'} *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={isRTL ? 'مثال: باي بال' : 'e.g. PayPal'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                  <input
                    type="text"
                    value={form.name_en}
                    onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                    placeholder="e.g. PayPal"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Config fields */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3 flex items-center gap-2">
                  {isRTL ? 'إعدادات البوابة' : 'Gateway Configuration'}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${currentTypeInfo.bg} ${currentTypeInfo.border} border`}>
                    {isRTL ? currentTypeInfo.labelAr : currentTypeInfo.labelEn}
                  </span>
                </label>
                <div className="space-y-3 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                  {currentTypeInfo.configFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs text-dark-400 mb-1">
                        {isRTL ? field.labelAr : field.labelEn}
                        {field.required && <span className="text-red-400 ms-1">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={form.config[field.key] || ''}
                            onChange={e => updateConfig(field.key, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary-500/50 appearance-none transition-colors"
                          >
                            <option value="" className="bg-dark-900">{isRTL ? '— اختر —' : '— Select —'}</option>
                            {field.options.map(o => (
                              <option key={o} value={o} className="bg-dark-900">{o}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-dark-500 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={form.config[field.key] || ''}
                          onChange={e => updateConfig(field.key, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
                          dir={field.type === 'email' || field.type === 'password' ? 'ltr' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Country filter (bank_transfer only) */}
              {currentTypeInfo.hasCountryFilter && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {isRTL ? 'الدول المتاحة (يظهر فقط في هذه الدول)' : 'Available Countries (only visible in these countries)'}
                  </label>
                  <p className="text-dark-500 text-xs mb-3">
                    {isRTL ? 'اتركها فارغة لعرض البنك في جميع الدول' : 'Leave empty to show this bank in all countries'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {countryList.map(c => {
                      const selected = (form.countries || []).includes(c.code);
                      return (
                        <button
                          key={c.code}
                          onClick={() => toggleCountry(c.code)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            selected
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border-white/5 bg-white/[0.02] text-dark-400 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-base">{getFlagEmoji(c.code)}</span>
                          {isRTL ? c.nameAr : c.nameEn}
                          {selected && <CheckCircle2 className="w-3.5 h-3.5 ms-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Options row */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_enabled}
                    onChange={e => setForm(f => ({ ...f, is_enabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/30"
                  />
                  <span className="text-sm text-dark-300">{isRTL ? 'مفعّلة' : 'Enabled'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/30"
                  />
                  <span className="text-sm text-dark-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    {isRTL ? 'افتراضية' : 'Default'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-dark-400">{isRTL ? 'الترتيب:' : 'Order:'}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? (isRTL ? 'حفظ التغييرات' : 'Save Changes') : (isRTL ? 'إنشاء البوابة' : 'Create Gateway')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: country code → flag emoji ───
function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
