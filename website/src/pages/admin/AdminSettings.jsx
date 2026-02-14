import { useState } from 'react';
import {
  Settings, Save, Globe, Palette, Shield, Bell, CreditCard,
  Mail, Server, Key, Eye, EyeOff, CheckCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminSettings() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    siteName: 'NEXIRO-FLUX',
    siteDescription: 'منصة رائدة لبناء المواقع الإلكترونية الاحترافية',
    siteDescriptionEn: 'A leading platform for building professional websites',
    contactEmail: 'support@nexiro-flux.com',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
  });

  const [appearance, setAppearance] = useState({
    primaryColor: '#7c3aed',
    accentColor: '#06b6d4',
    darkMode: true,
    showBanner: true,
    bannerTextAr: '🚀 أطلق مشروعك الرقمي اليوم',
    bannerTextEn: '🚀 Launch your digital project today',
  });

  const [notifications, setNotifications] = useState({
    emailOnPurchase: true,
    emailOnRegistration: true,
    emailOnTicket: true,
    emailWeeklyReport: false,
    pushEnabled: false,
  });

  const [payment, setPayment] = useState({
    stripeKey: '',
    paypalEmail: '',
    bankTransfer: true,
    currency: 'USD',
    taxRate: 0,
  });

  const [showKeys, setShowKeys] = useState({});

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', labelAr: 'عام', labelEn: 'General', icon: Settings },
    { id: 'appearance', labelAr: 'المظهر', labelEn: 'Appearance', icon: Palette },
    { id: 'notifications', labelAr: 'الإشعارات', labelEn: 'Notifications', icon: Bell },
    { id: 'payment', labelAr: 'الدفع', labelEn: 'Payment', icon: CreditCard },
    { id: 'security', labelAr: 'الأمان', labelEn: 'Security', icon: Shield },
  ];

  const InputField = ({ label, value, onChange, type = 'text', placeholder, secret }) => (
    <div>
      <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <input
          type={secret && !showKeys[label] ? 'password' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 transition-all"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'إعدادات المنصة والتكوينات' : 'Platform settings and configurations'}
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-primary-500 hover:bg-primary-400 text-white'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? (isRTL ? 'تم الحفظ!' : 'Saved!') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
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
              <InputField label={isRTL ? 'اسم الموقع' : 'Site Name'} value={general.siteName} onChange={v => setGeneral(g => ({ ...g, siteName: v }))} />
              <InputField label={isRTL ? 'الوصف (عربي)' : 'Description (AR)'} value={general.siteDescription} onChange={v => setGeneral(g => ({ ...g, siteDescription: v }))} />
              <InputField label={isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'} value={general.siteDescriptionEn} onChange={v => setGeneral(g => ({ ...g, siteDescriptionEn: v }))} />
              <InputField label={isRTL ? 'إيميل التواصل' : 'Contact Email'} value={general.contactEmail} onChange={v => setGeneral(g => ({ ...g, contactEmail: v }))} type="email" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'رابط الشعار' : 'Logo URL'}</label>
                  <div className="flex gap-2">
                    <input
                      value={general.logoUrl}
                      onChange={e => setGeneral(g => ({ ...g, logoUrl: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                    <button className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-dark-400 hover:text-white transition-all">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'Favicon' : 'Favicon URL'}</label>
                  <div className="flex gap-2">
                    <input
                      value={general.faviconUrl}
                      onChange={e => setGeneral(g => ({ ...g, faviconUrl: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                    <button className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-dark-400 hover:text-white transition-all">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5">
                <Toggle
                  label={isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}
                  checked={general.maintenanceMode}
                  onChange={v => setGeneral(g => ({ ...g, maintenanceMode: v }))}
                />
              </div>
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
                      value={appearance.primaryColor}
                      onChange={e => setAppearance(a => ({ ...a, primaryColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border-2 border-white/10 cursor-pointer"
                    />
                    <input
                      value={appearance.primaryColor}
                      onChange={e => setAppearance(a => ({ ...a, primaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'لون التمييز' : 'Accent Color'}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={appearance.accentColor}
                      onChange={e => setAppearance(a => ({ ...a, accentColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border-2 border-white/10 cursor-pointer"
                    />
                    <input
                      value={appearance.accentColor}
                      onChange={e => setAppearance(a => ({ ...a, accentColor: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>
              </div>
              <InputField label={isRTL ? 'نص البانر (عربي)' : 'Banner Text (AR)'} value={appearance.bannerTextAr} onChange={v => setAppearance(a => ({ ...a, bannerTextAr: v }))} />
              <InputField label={isRTL ? 'نص البانر (إنجليزي)' : 'Banner Text (EN)'} value={appearance.bannerTextEn} onChange={v => setAppearance(a => ({ ...a, bannerTextEn: v }))} />
              <div className="space-y-3 pt-3 border-t border-white/5">
                <Toggle label={isRTL ? 'إظهار البانر' : 'Show Banner'} checked={appearance.showBanner} onChange={v => setAppearance(a => ({ ...a, showBanner: v }))} />
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-400" />
                {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </h3>
              <div className="space-y-4">
                <Toggle label={isRTL ? 'إيميل عند شراء جديد' : 'Email on new purchase'} checked={notifications.emailOnPurchase} onChange={v => setNotifications(n => ({ ...n, emailOnPurchase: v }))} />
                <Toggle label={isRTL ? 'إيميل عند تسجيل مستخدم' : 'Email on new registration'} checked={notifications.emailOnRegistration} onChange={v => setNotifications(n => ({ ...n, emailOnRegistration: v }))} />
                <Toggle label={isRTL ? 'إيميل عند تذكرة دعم' : 'Email on support ticket'} checked={notifications.emailOnTicket} onChange={v => setNotifications(n => ({ ...n, emailOnTicket: v }))} />
                <Toggle label={isRTL ? 'تقرير أسبوعي بالإيميل' : 'Weekly email report'} checked={notifications.emailWeeklyReport} onChange={v => setNotifications(n => ({ ...n, emailWeeklyReport: v }))} />
                <Toggle label={isRTL ? 'إشعارات Push' : 'Push Notifications'} checked={notifications.pushEnabled} onChange={v => setNotifications(n => ({ ...n, pushEnabled: v }))} />
              </div>
            </div>
          )}

          {/* Payment */}
          {activeTab === 'payment' && (
            <div className="space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-400" />
                {isRTL ? 'إعدادات الدفع' : 'Payment Settings'}
              </h3>
              <InputField label={isRTL ? 'مفتاح Stripe' : 'Stripe Secret Key'} value={payment.stripeKey} onChange={v => setPayment(p => ({ ...p, stripeKey: v }))} secret placeholder="sk_live_..." />
              <InputField label={isRTL ? 'إيميل PayPal' : 'PayPal Email'} value={payment.paypalEmail} onChange={v => setPayment(p => ({ ...p, paypalEmail: v }))} type="email" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-dark-500 mb-1.5 font-medium">{isRTL ? 'العملة' : 'Currency'}</label>
                  <select
                    value={payment.currency}
                    onChange={e => setPayment(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm text-white outline-none focus:border-primary-500/50 appearance-none"
                  >
                    {['USD', 'EUR', 'SAR', 'AED', 'KWD', 'BHD'].map(c => (
                      <option key={c} value={c} className="bg-dark-900">{c}</option>
                    ))}
                  </select>
                </div>
                <InputField label={isRTL ? 'نسبة الضريبة %' : 'Tax Rate %'} value={payment.taxRate} onChange={v => setPayment(p => ({ ...p, taxRate: Number(v) }))} type="number" />
              </div>
              <div className="pt-3 border-t border-white/5">
                <Toggle label={isRTL ? 'تفعيل التحويل البنكي' : 'Enable Bank Transfer'} checked={payment.bankTransfer} onChange={v => setPayment(p => ({ ...p, bankTransfer: v }))} />
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
                  <span className="text-emerald-400 text-sm font-medium">{isRTL ? 'شهادة SSL نشطة' : 'SSL Certificate Active'}</span>
                </div>
                <p className="text-dark-400 text-xs">{isRTL ? 'جميع الاتصالات مشفّرة ومحمية' : 'All connections are encrypted and secured'}</p>
              </div>
              <InputField label={isRTL ? 'JWT Secret Key' : 'JWT Secret Key'} value="••••••••••••••••••••" onChange={() => {}} secret />
              <InputField label={isRTL ? 'مفتاح التشفير' : 'Encryption Key'} value="••••••••••••••••••••" onChange={() => {}} secret />
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <h4 className="text-sm font-medium text-white">{isRTL ? 'سجل آخر الدخول' : 'Recent Login Activity'}</h4>
                {[
                  { ip: '192.168.1.x', time: isRTL ? 'اليوم 10:30 ص' : 'Today 10:30 AM', device: 'Chrome / Windows' },
                  { ip: '192.168.1.x', time: isRTL ? 'أمس 3:15 م' : 'Yesterday 3:15 PM', device: 'Safari / iPhone' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-dark-300 text-xs">{log.device}</p>
                      <p className="text-dark-600 text-[11px]">{log.ip}</p>
                    </div>
                    <span className="text-dark-500 text-[11px]">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
