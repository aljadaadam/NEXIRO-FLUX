import { useState, useEffect } from 'react';
import {
  Settings, Save, Globe, Palette, Shield, Bell, CreditCard,
  Eye, EyeOff, CheckCircle, Upload, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function AdminSettings() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [siteInfo, setSiteInfo] = useState({
    name: '',
    domain: '',
    site_key: '',
  });

  const [customization, setCustomization] = useState({
    primary_color: '#7c3aed',
    secondary_color: '#06b6d4',
    dark_mode: true,
    show_banner: true,
    button_radius: '12',
    header_style: 'default',
    font_family: 'Inter',
    theme_id: 'default',
  });

  const [subscription, setSubscription] = useState({
    plan: '',
    status: '',
    billing_cycle: '',
    expires_at: '',
  });

  const [showKeys, setShowKeys] = useState({});

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [siteRes, customRes] = await Promise.allSettled([
        api.getMySite(),
        api.getCustomization(),
      ]);
      if (siteRes.status === 'fulfilled') {
        const s = siteRes.value;
        setSiteInfo({
          name: s.site?.name || '',
          domain: s.site?.domain || '',
          site_key: s.site?.site_key || '',
        });
        if (s.subscription) {
          setSubscription({
            plan: s.subscription.plan || '',
            status: s.subscription.status || '',
            billing_cycle: s.subscription.billing_cycle || '',
            expires_at: s.subscription.expires_at || '',
          });
        }
      }
      if (customRes.status === 'fulfilled') {
        const c = customRes.value?.customization || customRes.value || {};
        setCustomization(prev => ({
          ...prev,
          primary_color: c.primary_color || prev.primary_color,
          secondary_color: c.secondary_color || prev.secondary_color,
          dark_mode: c.dark_mode ?? prev.dark_mode,
          show_banner: c.show_banner ?? prev.show_banner,
          button_radius: c.button_radius || prev.button_radius,
          header_style: c.header_style || prev.header_style,
          font_family: c.font_family || prev.font_family,
          theme_id: c.theme_id || prev.theme_id,
        }));
      }
    } catch (err) {
      setError(err?.error || 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'general') {
        await api.updateSiteSettings({ name: siteInfo.name, domain: siteInfo.domain });
      } else if (activeTab === 'appearance') {
        await api.updateCustomization(customization);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err?.error || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', labelAr: 'عام', labelEn: 'General', icon: Settings },
    { id: 'appearance', labelAr: 'المظهر', labelEn: 'Appearance', icon: Palette },
    { id: 'subscription', labelAr: 'الاشتراك', labelEn: 'Subscription', icon: CreditCard },
    { id: 'security', labelAr: 'الأمان', labelEn: 'Security', icon: Shield },
  ];

  const InputField = ({ label, value, onChange, type = 'text', placeholder, secret, disabled }) => (
    <div>
      <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <input
          type={secret && !showKeys[label] ? 'password' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 transition-all disabled:opacity-50"
        />
        {secret && (
          <button
            onClick={() => setShowKeys(p => ({ ...p, [label]: !p[label] }))}
            className="absolute top-1/2 -translate-y-1/2 right-3 text-dark-500 hover:text-white transition-all"
          >
            {showKeys[label] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-dark-300 text-sm group-hover:text-white transition-all">{label}</span>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-6 rounded-full bg-white/10 peer-checked:bg-primary-500 transition-all" />
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all peer-checked:translate-x-4" />
      </div>
    </label>
  );

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
        <button onClick={loadSettings} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm transition-all">
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
            {isRTL ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'إعدادات المنصة والتكوينات — بيانات حية' : 'Platform settings — live data'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-primary-500 hover:bg-primary-400 text-white'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? (isRTL ? 'تم الحفظ!' : 'Saved!') : saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isRTL ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#111827] rounded-2xl border border-white/5 p-6">
          {/* General */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-400" />
                {isRTL ? 'الإعدادات العامة' : 'General Settings'}
              </h3>
              <InputField label={isRTL ? 'اسم الموقع' : 'Site Name'} value={siteInfo.name} onChange={v => setSiteInfo(s => ({ ...s, name: v }))} />
              <InputField label={isRTL ? 'النطاق' : 'Domain'} value={siteInfo.domain} onChange={v => setSiteInfo(s => ({ ...s, domain: v }))} />
              <InputField label={isRTL ? 'مفتاح الموقع' : 'Site Key'} value={siteInfo.site_key} onChange={() => {}} disabled />
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-400" />
                {isRTL ? 'المظهر والتخصيص' : 'Appearance & Customization'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'اللون الأساسي' : 'Primary Color'}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customization.primary_color}
                      onChange={e => setCustomization(c => ({ ...c, primary_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border-2 border-white/10 cursor-pointer"
                    />
                    <input
                      value={customization.primary_color}
                      onChange={e => setCustomization(c => ({ ...c, primary_color: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'اللون الثانوي' : 'Secondary Color'}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customization.secondary_color}
                      onChange={e => setCustomization(c => ({ ...c, secondary_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border-2 border-white/10 cursor-pointer"
                    />
                    <input
                      value={customization.secondary_color}
                      onChange={e => setCustomization(c => ({ ...c, secondary_color: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'الخط' : 'Font Family'}</label>
                  <select
                    value={customization.font_family}
                    onChange={e => setCustomization(c => ({ ...c, font_family: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 appearance-none"
                  >
                    {['Inter', 'Cairo', 'Tajawal', 'Poppins', 'Roboto'].map(f => (
                      <option key={f} value={f} className="bg-dark-900">{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'نمط الهيدر' : 'Header Style'}</label>
                  <select
                    value={customization.header_style}
                    onChange={e => setCustomization(c => ({ ...c, header_style: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 appearance-none"
                  >
                    {['default', 'centered', 'minimal'].map(s => (
                      <option key={s} value={s} className="bg-dark-900 capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <InputField
                label={isRTL ? 'حجم الزوايا (px)' : 'Button Radius (px)'}
                value={customization.button_radius}
                onChange={v => setCustomization(c => ({ ...c, button_radius: v }))}
                type="number"
              />
              <div className="space-y-3 pt-3 border-t border-white/5">
                <Toggle label={isRTL ? 'الوضع الداكن' : 'Dark Mode'} checked={customization.dark_mode} onChange={v => setCustomization(c => ({ ...c, dark_mode: v }))} />
                <Toggle label={isRTL ? 'إظهار البانر' : 'Show Banner'} checked={customization.show_banner} onChange={v => setCustomization(c => ({ ...c, show_banner: v }))} />
              </div>
            </div>
          )}

          {/* Subscription */}
          {activeTab === 'subscription' && (
            <div className="space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-400" />
                {isRTL ? 'الاشتراك' : 'Subscription'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الخطة' : 'Plan'}</p>
                  <p className="text-white text-sm font-bold capitalize">{subscription.plan || '-'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الحالة' : 'Status'}</p>
                  <p className={`text-sm font-bold capitalize ${subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {subscription.status || '-'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'دورة الفوترة' : 'Billing Cycle'}</p>
                  <p className="text-white text-sm font-bold capitalize">{subscription.billing_cycle || '-'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'تاريخ الانتهاء' : 'Expires'}</p>
                  <p className="text-white text-sm font-bold">
                    {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-400" />
                {isRTL ? 'الأمان' : 'Security'}
              </h3>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">{isRTL ? 'JWT Authentication نشط' : 'JWT Authentication Active'}</span>
                </div>
                <p className="text-dark-400 text-xs">{isRTL ? 'جميع طلبات API محمية بمصادقة JWT' : 'All API requests are protected with JWT authentication'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-dark-500 text-[11px] mb-2">{isRTL ? 'معلومات الأمان' : 'Security Info'}</p>
                <div className="space-y-2 text-xs text-dark-300">
                  <p>• {isRTL ? 'التشفير: bcrypt لكلمات المرور' : 'Encryption: bcrypt for passwords'}</p>
                  <p>• {isRTL ? 'المصادقة: JWT + Bearer Token' : 'Auth: JWT + Bearer Token'}</p>
                  <p>• {isRTL ? 'الصلاحيات: نظام أذونات متعدد المستويات' : 'Permissions: Multi-level permission system'}</p>
                  <p>• {isRTL ? 'CORS: محدد للنطاقات المسموحة' : 'CORS: Restricted to allowed origins'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
