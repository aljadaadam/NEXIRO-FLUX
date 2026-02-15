import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe, Settings, ExternalLink, CreditCard, Clock, CheckCircle2,
  AlertTriangle, LayoutDashboard, Sparkles, Mail, Palette, Key,
  ChevronRight, LogOut, RefreshCw, Loader2, Store, Shield, Zap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MyDashboardPage() {
  const { isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // 'store' | 'smtp' | null
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [form, setForm] = useState({
    store_name: '',
    domain_slug: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
  });

  useEffect(() => {
    fetchSite();
  }, []);

  const fetchSite = async () => {
    setLoading(true);
    try {
      const data = await api.getMySite();
      setSiteData(data);

      let settings = data.site?.settings || {};
      setForm({
        store_name: data.site?.name || '',
        domain_slug: data.site?.domain?.replace('.nexiroflux.com', '') || '',
        smtp_host: settings.smtp?.host || '',
        smtp_port: settings.smtp?.port || '587',
        smtp_user: settings.smtp?.user || '',
        smtp_pass: settings.smtp?.pass || '',
        smtp_from: settings.smtp?.from || '',
      });
    } catch (err) {
      console.error('Failed to fetch site:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = section === 'store'
        ? { store_name: form.store_name, domain_slug: form.domain_slug }
        : { smtp_host: form.smtp_host, smtp_port: form.smtp_port, smtp_user: form.smtp_user, smtp_pass: form.smtp_pass, smtp_from: form.smtp_from };

      await api.updateSiteSettings(payload);
      setSaveMessage(isRTL ? 'تم الحفظ بنجاح ✓' : 'Saved successfully ✓');
      setEditing(null);
      fetchSite();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage(err.error || (isRTL ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          <p className="text-dark-400 text-sm">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const site = siteData?.site;
  const subscription = siteData?.subscription;
  const settings = site?.settings || {};

  const isTrialExpired = subscription?.status === 'trial' && subscription?.trial_ends_at && new Date(subscription.trial_ends_at) < new Date();
  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  // ─── حالة: لا يوجد موقع بعد (مستخدم جديد لم يشترِ قالب) ───
  if (!site) {
    return (
      <div className="min-h-screen bg-[#0a0e1a]" dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="bg-[#0d1221]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-sm">
                <span className="text-white">NEXIRO</span>
                <span className="text-primary-400">-</span>
                <span className="text-accent-400">FLUX</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-end">
                <p className="text-sm text-white font-medium">{user?.name}</p>
                <p className="text-[11px] text-dark-500">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-dark-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-[#111827] rounded-3xl border border-white/5 p-10 sm:p-14">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-3">
              {isRTL ? 'مرحباً بك في NEXIRO-FLUX! 👋' : 'Welcome to NEXIRO-FLUX! 👋'}
            </h1>
            <p className="text-dark-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              {isRTL 
                ? 'لم تقم بشراء قالب بعد. اختر قالبًا لتبدأ في إنشاء متجرك الإلكتروني واحصل على لوحة تحكم خاصة بك.'
                : "You haven't purchased a template yet. Choose a template to start building your online store and get your own admin dashboard."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                to="/templates" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isRTL ? 'تصفح القوالب' : 'Browse Templates'}
              </Link>
              <Link 
                to="/pricing" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 border border-white/10 transition-all text-sm"
              >
                <CreditCard className="w-4 h-4" />
                {isRTL ? 'الأسعار والخطط' : 'Pricing & Plans'}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-[#0d1221]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">
              <span className="text-white">NEXIRO</span>
              <span className="text-primary-400">-</span>
              <span className="text-accent-400">FLUX</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-sm text-white font-medium">{user?.name}</p>
              <p className="text-[11px] text-dark-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-dark-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'إدارة موقعي' : 'My Dashboard'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'إدارة إعدادات موقعك واشتراكك' : 'Manage your site settings and subscription'}
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`px-4 py-3 rounded-xl text-sm ${saveMessage.includes('✓') || saveMessage.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {saveMessage}
          </div>
        )}

        {/* Trial Warning */}
        {subscription?.status === 'trial' && !isTrialExpired && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-medium">
                {isRTL ? `فترة تجريبية — متبقي ${trialDaysLeft} يوم` : `Trial Period — ${trialDaysLeft} days remaining`}
              </p>
              <p className="text-dark-400 text-xs mt-0.5">
                {isRTL ? 'قم بالترقية للاستمرار بعد انتهاء الفترة التجريبية' : 'Upgrade to continue after trial ends'}
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 text-xs font-bold hover:bg-yellow-500/20 transition-all">
              {isRTL ? 'ترقية' : 'Upgrade'}
            </button>
          </div>
        )}

        {isTrialExpired && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/5 border border-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">{isRTL ? 'انتهت الفترة التجريبية' : 'Trial Expired'}</p>
              <p className="text-dark-400 text-xs mt-0.5">{isRTL ? 'قم بالترقية لاستعادة الوصول لموقعك' : 'Upgrade to restore access to your site'}</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
              {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { labelAr: 'حالة الموقع', labelEn: 'Site Status', value: site?.status === 'active' ? (isRTL ? 'نشط ✓' : 'Active ✓') : (isRTL ? 'معلق' : 'Suspended'), icon: Globe, color: site?.status === 'active' ? 'text-emerald-400' : 'text-red-400', bg: site?.status === 'active' ? 'bg-emerald-500/10' : 'bg-red-500/10' },
            { labelAr: 'القالب', labelEn: 'Template', value: site?.template_id?.replace(/-/g, ' ') || '—', icon: LayoutDashboard, color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { labelAr: 'الخطة', labelEn: 'Plan', value: site?.plan || 'trial', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { labelAr: 'الدومين', labelEn: 'Domain', value: site?.domain || '—', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-[#111827] rounded-2xl border border-white/5 p-5">
                <div className={`p-2.5 rounded-xl ${card.bg} w-fit mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-white font-bold text-lg capitalize">{card.value}</p>
                <p className="text-dark-400 text-xs mt-0.5">{isRTL ? card.labelAr : card.labelEn}</p>
              </div>
            );
          })}
        </div>

        {/* ═══ Store Settings ═══ */}
        <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-primary-400" />
              <h2 className="text-white font-bold">{isRTL ? 'إعدادات المتجر' : 'Store Settings'}</h2>
            </div>
            {editing !== 'store' ? (
              <button onClick={() => setEditing('store')} className="text-primary-400 text-xs font-medium hover:underline">
                {isRTL ? 'تعديل' : 'Edit'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(null)} className="text-dark-400 text-xs hover:text-white">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleSave('store')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3, h-3 animate-spin" /> : (isRTL ? 'حفظ' : 'Save')}
                </button>
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'اسم المتجر' : 'Store Name'}</label>
                {editing === 'store' ? (
                  <input value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30" />
                ) : (
                  <p className="text-white text-sm font-medium py-2.5">{site?.name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'النطاق' : 'Domain'}</label>
                {editing === 'store' ? (
                  <div className="flex items-center">
                    <input value={form.domain_slug} onChange={e => setForm(f => ({ ...f, domain_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="flex-1 bg-white/5 border border-white/10 rounded-s-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30" dir="ltr" />
                    <span className="bg-white/10 border border-white/10 border-s-0 rounded-e-xl px-3 py-2.5 text-dark-400 text-sm">.nexiroflux.com</span>
                  </div>
                ) : (
                  <p className="text-primary-400 text-sm font-mono py-2.5">{site?.domain || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Email / SMTP Settings ═══ */}
        <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h2 className="text-white font-bold">{isRTL ? 'إعدادات البريد (SMTP)' : 'Email Settings (SMTP)'}</h2>
            </div>
            {editing !== 'smtp' ? (
              <button onClick={() => setEditing('smtp')} className="text-primary-400 text-xs font-medium hover:underline">
                {isRTL ? 'تعديل' : 'Edit'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(null)} className="text-dark-400 text-xs hover:text-white">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleSave('smtp')}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : (isRTL ? 'حفظ' : 'Save')}
                </button>
              </div>
            )}
          </div>
          <div className="p-6">
            {editing === 'smtp' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'سيرفر SMTP' : 'SMTP Host'}</label>
                    <input value={form.smtp_host} onChange={e => setForm(f => ({ ...f, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30 placeholder:text-dark-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'المنفذ' : 'Port'}</label>
                    <input value={form.smtp_port} onChange={e => setForm(f => ({ ...f, smtp_port: e.target.value }))} placeholder="587" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30 placeholder:text-dark-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'اسم المستخدم' : 'Username'}</label>
                  <input value={form.smtp_user} onChange={e => setForm(f => ({ ...f, smtp_user: e.target.value }))} placeholder="noreply@store.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30 placeholder:text-dark-500" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'كلمة مرور SMTP' : 'SMTP Password'}</label>
                  <input type="password" value={form.smtp_pass} onChange={e => setForm(f => ({ ...f, smtp_pass: e.target.value }))} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30 placeholder:text-dark-500" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'البريد المرسل' : 'From Email'}</label>
                  <input type="email" value={form.smtp_from} onChange={e => setForm(f => ({ ...f, smtp_from: e.target.value }))} placeholder="noreply@store.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500/30 placeholder:text-dark-500" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-dark-400 mb-1">{isRTL ? 'سيرفر SMTP' : 'SMTP Host'}</p>
                  <p className="text-white text-sm">{settings.smtp?.host || <span className="text-dark-500">{isRTL ? 'غير مُعد' : 'Not configured'}</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">{isRTL ? 'المنفذ' : 'Port'}</p>
                  <p className="text-white text-sm">{settings.smtp?.port || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">{isRTL ? 'المستخدم' : 'Username'}</p>
                  <p className="text-white text-sm">{settings.smtp?.user || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">{isRTL ? 'البريد المرسل' : 'From'}</p>
                  <p className="text-white text-sm">{settings.smtp?.from || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Quick Links ═══ */}
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
          <h2 className="text-white font-bold mb-4">{isRTL ? 'روابط سريعة' : 'Quick Links'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { labelAr: 'لوحة تحكم المتجر', labelEn: 'Store Dashboard', icon: LayoutDashboard, href: '/admin', color: 'text-primary-400', bg: 'bg-primary-500/5 hover:bg-primary-500/10' },
              { labelAr: 'تخصيص المظهر', labelEn: 'Customize Appearance', icon: Palette, href: '/admin/settings', color: 'text-pink-400', bg: 'bg-pink-500/5 hover:bg-pink-500/10' },
              { labelAr: 'زيارة المتجر', labelEn: 'Visit Store', icon: ExternalLink, href: site?.domain ? `https://${site.domain}` : '#', color: 'text-cyan-400', bg: 'bg-cyan-500/5 hover:bg-cyan-500/10', external: true },
            ].map((link, i) => {
              const Icon = link.icon;
              if (link.external) {
                return (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 px-4 py-3 rounded-xl ${link.bg} border border-white/5 transition-all`}>
                    <Icon className={`w-5 h-5 ${link.color}`} />
                    <span className="text-white text-sm font-medium">{isRTL ? link.labelAr : link.labelEn}</span>
                    <ChevronRight className={`w-4 h-4 text-dark-500 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />
                  </a>
                );
              }
              return (
                <Link key={i} to={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${link.bg} border border-white/5 transition-all`}>
                  <Icon className={`w-5 h-5 ${link.color}`} />
                  <span className="text-white text-sm font-medium">{isRTL ? link.labelAr : link.labelEn}</span>
                  <ChevronRight className={`w-4 h-4 text-dark-500 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Subscription Info */}
        {subscription && (
          <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-white font-bold">{isRTL ? 'الاشتراك' : 'Subscription'}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-dark-400 mb-1">{isRTL ? 'الحالة' : 'Status'}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                  subscription.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  subscription.status === 'trial' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {subscription.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                  {subscription.status === 'trial' && <Clock className="w-3 h-3" />}
                  {subscription.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-dark-400 mb-1">{isRTL ? 'دورة الفوترة' : 'Billing Cycle'}</p>
                <p className="text-white text-sm font-medium capitalize">{subscription.billing_cycle}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 mb-1">{isRTL ? 'السعر' : 'Price'}</p>
                <p className="text-white text-sm font-bold">${subscription.price}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
