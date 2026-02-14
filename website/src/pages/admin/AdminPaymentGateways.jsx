import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Landmark, Bitcoin, Wallet, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, Save, X, Loader2, Globe, ChevronDown,
  Star, AlertCircle, CheckCircle2, Eye, EyeOff, Copy, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

// ─── Gateway type definitions ───
const gatewayTypes = [
  {
    value: 'paypal',
    labelAr: 'باي بال',
    labelEn: 'PayPal',
    descAr: 'استقبل المدفوعات عبر PayPal',
    descEn: 'Receive payments via PayPal',
    icon: Wallet,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    textColor: 'text-blue-400',
    configFields: [
      { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
      { key: 'client_id', labelAr: 'Client ID', labelEn: 'Client ID', type: 'text', sensitive: true, placeholder: 'AaBbCc...' },
      { key: 'secret', labelAr: 'Secret Key', labelEn: 'Secret Key', type: 'password', sensitive: true, placeholder: '••••••••' },
      { key: 'mode', labelAr: 'الوضع', labelEn: 'Mode', type: 'select', options: ['sandbox', 'live'], required: true },
    ],
  },
  {
    value: 'bank_transfer',
    labelAr: 'تحويل بنكي',
    labelEn: 'Bank Transfer',
    descAr: 'استقبل التحويلات البنكية',
    descEn: 'Receive bank transfers',
    icon: Landmark,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    configFields: [
      { key: 'bank_name', labelAr: 'اسم البنك', labelEn: 'Bank Name', type: 'text', required: true, placeholder: 'Al Rajhi Bank' },
      { key: 'account_holder', labelAr: 'صاحب الحساب', labelEn: 'Account Holder', type: 'text', required: true, placeholder: 'John Doe' },
      { key: 'iban', labelAr: 'رقم IBAN', labelEn: 'IBAN Number', type: 'text', required: true, placeholder: 'SA0000000000000000000000' },
      { key: 'swift', labelAr: 'رمز SWIFT', labelEn: 'SWIFT Code', type: 'text', placeholder: 'RJHISARI' },
      { key: 'account_number', labelAr: 'رقم الحساب', labelEn: 'Account Number', type: 'text', placeholder: '1234567890' },
      { key: 'currency', labelAr: 'العملة', labelEn: 'Currency', type: 'text', placeholder: 'SAR' },
    ],
    hasCountryFilter: true,
  },
  {
    value: 'usdt',
    labelAr: 'USDT',
    labelEn: 'USDT (Tether)',
    descAr: 'استقبل العملات الرقمية USDT',
    descEn: 'Receive USDT cryptocurrency',
    icon: Bitcoin,
    color: 'from-green-500 to-teal-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    textColor: 'text-green-400',
    configFields: [
      { key: 'wallet_address', labelAr: 'عنوان المحفظة', labelEn: 'Wallet Address', type: 'text', required: true, placeholder: 'T9yD14Nj9j7x...' },
      { key: 'network', labelAr: 'الشبكة', labelEn: 'Network', type: 'select', options: ['TRC20', 'ERC20', 'BEP20'], required: true },
    ],
  },
  {
    value: 'binance',
    labelAr: 'بينانس باي',
    labelEn: 'Binance Pay',
    descAr: 'استقبل المدفوعات عبر Binance Pay',
    descEn: 'Receive payments via Binance Pay',
    icon: CreditCard,
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    textColor: 'text-yellow-400',
    configFields: [
      { key: 'binance_id', labelAr: 'Binance Pay ID', labelEn: 'Binance Pay ID', type: 'text', required: true, placeholder: '123456789' },
      { key: 'binance_email', labelAr: 'إيميل بينانس', labelEn: 'Binance Email', type: 'email', placeholder: 'your@email.com' },
      { key: 'api_key', labelAr: 'API Key', labelEn: 'API Key', type: 'password', sensitive: true, placeholder: '••••••••' },
      { key: 'api_secret', labelAr: 'API Secret', labelEn: 'API Secret', type: 'password', sensitive: true, placeholder: '••••••••' },
    ],
  },
];

// ─── Country list ───
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

export default function AdminPaymentGateways() {
  const { isRTL } = useLanguage();
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // { type: 'paypal', editId: null, data: {...} }
  const [showPasswords, setShowPasswords] = useState({});
  const [copied, setCopied] = useState(null);

  // ─── Fetch gateways ───
  const fetchGateways = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPaymentGateways();
      setGateways(data.gateways || []);
    } catch (err) {
      console.error('Failed to fetch gateways:', err);
      flash('error', 'فشل في جلب البوابات', 'Failed to load gateways');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);

  // ─── Flash message ───
  const flash = (type, textAr, textEn) => {
    setMessage({ type, text: isRTL ? textAr : textEn });
    setTimeout(() => setMessage(null), 4000);
  };

  // ─── Open modal for adding a specific gateway type ───
  const openAdd = (typeValue) => {
    const typeInfo = gatewayTypes.find(t => t.value === typeValue);
    setModal({
      type: typeValue,
      editId: null,
      data: {
        name: isRTL ? typeInfo.labelAr : typeInfo.labelEn,
        name_en: typeInfo.labelEn,
        is_enabled: true,
        is_default: false,
        config: typeValue === 'paypal' ? { mode: 'sandbox' } : {},
        countries: [],
        display_order: 0,
      },
    });
    setShowPasswords({});
  };

  // ─── Open modal for editing an existing gateway ───
  const openEdit = (gw) => {
    setModal({
      type: gw.type,
      editId: gw.id,
      data: {
        name: gw.name || '',
        name_en: gw.name_en || '',
        is_enabled: !!gw.is_enabled,
        is_default: !!gw.is_default,
        config: gw.config || {},
        countries: gw.countries || [],
        display_order: gw.display_order || 0,
      },
    });
    setShowPasswords({});
  };

  // ─── Update modal form data ───
  const updateData = (key, value) => {
    setModal(m => ({ ...m, data: { ...m.data, [key]: value } }));
  };
  const updateConfig = (key, value) => {
    setModal(m => ({ ...m, data: { ...m.data, config: { ...m.data.config, [key]: value } } }));
  };
  const toggleCountry = (code) => {
    setModal(m => {
      const c = m.data.countries || [];
      return { ...m, data: { ...m.data, countries: c.includes(code) ? c.filter(x => x !== code) : [...c, code] } };
    });
  };

  // ─── Save gateway ───
  const handleSave = async () => {
    if (!modal) return;
    const { type, editId, data } = modal;

    if (!data.name.trim()) {
      flash('error', 'يرجى إدخال اسم البوابة', 'Please enter gateway name');
      return;
    }

    // Validate required config fields
    const typeInfo = gatewayTypes.find(t => t.value === type);
    for (const field of typeInfo.configFields) {
      if (field.required && !data.config[field.key]) {
        flash('error', `يرجى ملء حقل: ${isRTL ? field.labelAr : field.labelEn}`, `Please fill: ${field.labelEn}`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { ...data, type };
      if (editId) {
        await api.updatePaymentGateway(editId, payload);
        flash('success', 'تم تحديث البوابة بنجاح ✓', 'Gateway updated successfully ✓');
      } else {
        await api.createPaymentGateway(payload);
        flash('success', 'تم إضافة البوابة بنجاح ✓', 'Gateway added successfully ✓');
      }
      setModal(null); // Close modal on success
      await fetchGateways(); // Refresh list from backend
    } catch (err) {
      console.error('Save error:', err);
      flash('error', 'فشل في حفظ البوابة', 'Failed to save gateway');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle enable/disable ───
  const handleToggle = async (id) => {
    try {
      await api.togglePaymentGateway(id);
      await fetchGateways();
    } catch (err) {
      console.error('Toggle error:', err);
      flash('error', 'فشل في تغيير الحالة', 'Failed to toggle');
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
      flash('error', 'فشل في حذف البوابة', 'Failed to delete');
    }
  };

  // ─── Copy to clipboard ───
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // ─── Get gateways of a specific type ───
  const getGatewaysOfType = (type) => gateways.filter(g => g.type === type);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          {isRTL ? 'بوابات الدفع' : 'Payment Gateways'}
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {isRTL ? 'أضف وأدر بوابات الدفع لاستقبال المدفوعات تلقائياً' : 'Add and manage payment gateways to receive payments automatically'}
        </p>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {/* ─── Gateway Type Sections ─── */}
      <div className="space-y-6">
        {gatewayTypes.map(typeInfo => {
          const Icon = typeInfo.icon;
          const items = getGatewaysOfType(typeInfo.value);
          const hasItems = items.length > 0;

          return (
            <div key={typeInfo.value} className={`rounded-2xl border ${typeInfo.border} overflow-hidden`}>
              {/* Section header */}
              <div className={`${typeInfo.bg} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{isRTL ? typeInfo.labelAr : typeInfo.labelEn}</h2>
                    <p className="text-dark-400 text-xs">{isRTL ? typeInfo.descAr : typeInfo.descEn}</p>
                  </div>
                  {hasItems && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${typeInfo.bg} ${typeInfo.textColor} border ${typeInfo.border}`}>
                      {items.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openAdd(typeInfo.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${typeInfo.border} ${typeInfo.bg} ${typeInfo.textColor} hover:brightness-125`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isRTL ? 'إضافة' : 'Add'}
                </button>
              </div>

              {/* Gateway items */}
              {hasItems ? (
                <div className="divide-y divide-white/5">
                  {items.map(gw => (
                    <GatewayRow
                      key={gw.id}
                      gw={gw}
                      typeInfo={typeInfo}
                      isRTL={isRTL}
                      onEdit={() => openEdit(gw)}
                      onToggle={() => handleToggle(gw.id)}
                      onDelete={() => handleDelete(gw.id)}
                      deleteConfirm={deleteConfirm}
                      setDeleteConfirm={setDeleteConfirm}
                      copyText={copyText}
                      copied={copied}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Icon className="w-8 h-8 text-dark-700 mx-auto mb-2" />
                  <p className="text-dark-500 text-sm">
                    {isRTL ? `لم تتم إضافة ${typeInfo.labelAr} بعد` : `No ${typeInfo.labelEn} gateway added yet`}
                  </p>
                  <button
                    onClick={() => openAdd(typeInfo.value)}
                    className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {isRTL ? '+ إضافة الآن' : '+ Add now'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Modal ─── */}
      {modal && (
        <GatewayModal
          modal={modal}
          isRTL={isRTL}
          saving={saving}
          showPasswords={showPasswords}
          setShowPasswords={setShowPasswords}
          onClose={() => setModal(null)}
          onSave={handleSave}
          updateData={updateData}
          updateConfig={updateConfig}
          toggleCountry={toggleCountry}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// ─── Gateway Row Component ───
// ═══════════════════════════════════════════════════════
function GatewayRow({ gw, typeInfo, isRTL, onEdit, onToggle, onDelete, deleteConfirm, setDeleteConfirm, copyText, copied }) {
  const Icon = typeInfo.icon;
  const visibleConfig = gw.config
    ? Object.entries(gw.config).filter(([k, v]) => v && !k.includes('secret') && !k.includes('api_key') && !k.includes('api_secret'))
    : [];

  return (
    <div className={`px-5 py-4 ${!gw.is_enabled ? 'opacity-50' : ''} transition-opacity`}>
      <div className="flex items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${typeInfo.color} flex items-center justify-center flex-shrink-0 ${!gw.is_enabled ? 'grayscale' : ''}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm truncate">{gw.name}</h3>
              {gw.is_default && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[10px] font-bold flex items-center gap-0.5 flex-shrink-0">
                  <Star className="w-2.5 h-2.5" /> {isRTL ? 'افتراضي' : 'Default'}
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${gw.is_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {gw.is_enabled ? (isRTL ? 'مفعّل' : 'Active') : (isRTL ? 'معطّل' : 'Disabled')}
              </span>
            </div>
            {/* Config summary */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              {visibleConfig.slice(0, 3).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => copyText(String(v), `${gw.id}-${k}`)}
                  className="flex items-center gap-1 text-[11px] text-dark-500 hover:text-dark-300 transition-colors group"
                  title={isRTL ? 'نسخ' : 'Copy'}
                >
                  <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
                  <span className="text-dark-400 font-mono">{String(v).length > 24 ? String(v).slice(0, 24) + '…' : String(v)}</span>
                  {copied === `${gw.id}-${k}`
                    ? <Check className="w-3 h-3 text-emerald-400" />
                    : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  }
                </button>
              ))}
              {/* Countries for bank */}
              {gw.type === 'bank_transfer' && gw.countries && gw.countries.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-dark-500">
                  <Globe className="w-3 h-3" />
                  {gw.countries.map(c => getFlagEmoji(c)).join(' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title={gw.is_enabled ? (isRTL ? 'تعطيل' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
          >
            {gw.is_enabled
              ? <ToggleRight className="w-6 h-6 text-emerald-400" />
              : <ToggleLeft className="w-6 h-6 text-dark-600" />
            }
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
            title={isRTL ? 'تعديل' : 'Edit'}
          >
            <Pencil className="w-4 h-4" />
          </button>
          {deleteConfirm === gw.id ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                {isRTL ? 'تأكيد' : 'Confirm'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-dark-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(gw.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-colors"
              title={isRTL ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// ─── Gateway Modal Component ───
// ═══════════════════════════════════════════════════════
function GatewayModal({ modal, isRTL, saving, showPasswords, setShowPasswords, onClose, onSave, updateData, updateConfig, toggleCountry }) {
  const typeInfo = gatewayTypes.find(t => t.value === modal.type);
  const Icon = typeInfo.icon;
  const isEdit = !!modal.editId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0d1221] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-white/5 ${typeInfo.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center`}>
              <Icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEdit
                  ? (isRTL ? `تعديل ${typeInfo.labelAr}` : `Edit ${typeInfo.labelEn}`)
                  : (isRTL ? `إضافة ${typeInfo.labelAr}` : `Add ${typeInfo.labelEn}`)
                }
              </h2>
              <p className="text-dark-400 text-[11px]">{isRTL ? typeInfo.descAr : typeInfo.descEn}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'} *</label>
              <input
                type="text"
                value={modal.data.name}
                onChange={e => updateData('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
              <input
                type="text"
                value={modal.data.name_en}
                onChange={e => updateData('name_en', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          {/* Config fields */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-2">
              {isRTL ? 'إعدادات البوابة' : 'Gateway Settings'}
            </label>
            <div className="space-y-2.5 bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
              {typeInfo.configFields.map(field => (
                <div key={field.key}>
                  <label className="block text-[11px] text-dark-500 mb-1">
                    {isRTL ? field.labelAr : field.labelEn}
                    {field.required && <span className="text-red-400 ms-0.5">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        value={modal.data.config[field.key] || ''}
                        onChange={e => updateConfig(field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary-500/50 appearance-none transition-colors"
                      >
                        <option value="" className="bg-dark-900">{isRTL ? '— اختر —' : '— Select —'}</option>
                        {field.options.map(o => (
                          <option key={o} value={o} className="bg-dark-900">{o}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-2.5 w-4 h-4 text-dark-500 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                        value={modal.data.config[field.key] || ''}
                        onChange={e => updateConfig(field.key, e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
                        dir={field.type === 'email' || field.type === 'password' ? 'ltr' : undefined}
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                          className="absolute top-1/2 -translate-y-1/2 end-2.5 text-dark-500 hover:text-dark-300 transition-colors"
                        >
                          {showPasswords[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Country filter - bank_transfer only */}
          {typeInfo.hasCountryFilter && (
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {isRTL ? 'الدول المتاحة' : 'Available Countries'}
              </label>
              <p className="text-dark-600 text-[11px] mb-2">
                {isRTL ? 'اتركها فارغة لعرض البوابة في جميع الدول' : 'Leave empty to show in all countries'}
              </p>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {countryList.map(c => {
                  const selected = (modal.data.countries || []).includes(c.code);
                  return (
                    <button
                      key={c.code}
                      onClick={() => toggleCountry(c.code)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        selected
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/5 bg-white/[0.02] text-dark-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-sm">{getFlagEmoji(c.code)}</span>
                      <span className="truncate">{isRTL ? c.nameAr : c.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modal.data.is_enabled}
                onChange={e => updateData('is_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/30"
              />
              <span className="text-sm text-dark-300">{isRTL ? 'مفعّلة' : 'Enabled'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modal.data.is_default}
                onChange={e => updateData('is_default', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/30"
              />
              <span className="text-sm text-dark-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                {isRTL ? 'افتراضية' : 'Default'}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-dark-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 bg-gradient-to-r ${typeInfo.color} hover:shadow-lg`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? (isRTL ? 'حفظ التغييرات' : 'Save Changes') : (isRTL ? 'إضافة البوابة' : 'Add Gateway')}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Helper: country code → flag emoji ───
function getFlagEmoji(countryCode) {
  const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
