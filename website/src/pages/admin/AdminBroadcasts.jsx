import { useState, useEffect, useCallback } from 'react';
import {
  Send, Loader2, CheckCircle2, XCircle, Mail, Users, User, Trash2,
  Plus, X, Inbox, Clock, ChevronDown, Megaphone, Search, AlertTriangle,
  Image, FileText, Eye, EyeOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const recipientTypeConfig = {
  all_users:         { labelAr: 'جميع مستخدمي المنصة',  labelEn: 'All Platform Users',      icon: Users, color: 'text-primary-400',  bg: 'bg-primary-500/10' },
  subscribers:       { labelAr: 'مشتركو القوالب',        labelEn: 'Template Subscribers',    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  non_subscribers:   { labelAr: 'غير المشتركين',        labelEn: 'Non Subscribers',         icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  individual:        { labelAr: 'مستلم محدد',            labelEn: 'Specific Recipients',     icon: User,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  custom_list:       { labelAr: 'قائمة مخصصة',           labelEn: 'Custom Email List',       icon: Mail,  color: 'text-amber-400',   bg: 'bg-amber-500/10' },
};

const statusConfig = {
  sending:   { labelAr: 'جاري الإرسال', labelEn: 'Sending',   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  completed: { labelAr: 'مكتمل',        labelEn: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  failed:    { labelAr: 'فشل',          labelEn: 'Failed',    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
};

/* ── YCZ HeroBanner CSS Animations ── */
const heroBannerCSS = `
@keyframes heroFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.05)}}
@keyframes heroOrb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-30px,20px) scale(1.1)}66%{transform:translate(15px,-10px) scale(.95)}}
@keyframes heroOrb2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-15px) scale(1.08)}66%{transform:translate(-10px,10px) scale(.92)}}
@keyframes heroTagSlide{0%{opacity:0;transform:translateX(-10px)}100%{opacity:1;transform:translateX(0)}}
@keyframes heroPulse{0%,100%{transform:scale(1);box-shadow:0 4px 16px rgba(0,0,0,0.1)}50%{transform:scale(1.05);box-shadow:0 6px 24px rgba(0,0,0,0.15)}}
.adm-hero-orb-1{animation:heroOrb1 8s ease-in-out infinite}
.adm-hero-orb-2{animation:heroOrb2 10s ease-in-out infinite}
.adm-hero-particle{animation:heroFloat 6s ease-in-out infinite}
.adm-hero-tag{animation:heroTagSlide .6s cubic-bezier(.16,1,.3,1) .15s backwards}
.adm-hero-icon{animation:heroPulse 3s ease-in-out infinite}
.adm-hero-img{animation:heroFloat 4s ease-in-out infinite}
`;

export default function AdminBroadcasts() {
  const { isRTL } = useLanguage();
  const [tab, setTab] = useState('compose'); // compose | history
  const [broadcasts, setBroadcasts] = useState([]);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Compose form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all_users');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [segments, setSegments] = useState({ subscribers: 0, non_subscribers: 0 });

  // Banner promo
  const [templateType, setTemplateType] = useState('text'); // text | banner_promo
  const [bannerTemplates, setBannerTemplates] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getBroadcasts();
      setBroadcasts(data.broadcasts || []);
    } catch (err) {
      console.error('Failed to fetch broadcasts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecipients = useCallback(async () => {
    try {
      const data = await api.getAvailableRecipients();
      setAvailableRecipients(data.recipients || []);
      if (data.segments) setSegments(data.segments);
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
    }
  }, []);

  const fetchBannerTemplates = useCallback(async () => {
    setLoadingBanners(true);
    try {
      const data = await api.getBannerTemplates();
      setBannerTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch banner templates:', err);
    } finally {
      setLoadingBanners(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') fetchBroadcasts();
    if (tab === 'compose') {
      fetchRecipients();
      fetchBannerTemplates();
    }
  }, [tab, fetchBroadcasts, fetchRecipients, fetchBannerTemplates]);

  const handleSend = async () => {
    if (!subject.trim()) {
      setError(isRTL ? 'العنوان مطلوب' : 'Subject is required');
      return;
    }

    if (templateType === 'text' && !message.trim()) {
      setError(isRTL ? 'نص الرسالة مطلوب' : 'Message is required');
      return;
    }

    if (templateType === 'banner_promo' && !selectedBanner) {
      setError(isRTL ? 'اختر بنر للترويج' : 'Select a banner to promote');
      return;
    }

    if ((recipientType === 'individual' || recipientType === 'custom_list') && selectedRecipients.length === 0) {
      setError(isRTL ? 'يجب اختيار مستلم واحد على الأقل' : 'Select at least one recipient');
      return;
    }

    setSending(true);
    setError('');
    try {
      const payload = {
        subject: subject.trim(),
        message: message.trim(),
        recipient_type: recipientType,
        template_type: templateType,
      };
      if (templateType === 'banner_promo' && selectedBanner) {
        payload.banner_template_id = selectedBanner.id;
      }
      if (recipientType !== 'all_reservations') {
        payload.recipients = selectedRecipients;
      }
      const res = await api.sendBroadcast(payload);
      setSuccess(isRTL ? res.message : res.messageEn || 'Broadcast sent successfully');
      setTimeout(() => setSuccess(''), 5000);
      // Reset form
      setSubject('');
      setMessage('');
      setSelectedRecipients([]);
      setSelectedBanner(null);
      setTemplateType('text');
    } catch (err) {
      setError(err.error || err.errorEn || (isRTL ? 'فشل الإرسال' : 'Send failed'));
      setTimeout(() => setError(''), 5000);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm(isRTL ? 'حذف هذا الإعلان؟' : 'Delete this broadcast?')) return;
    try {
      await api.deleteBroadcast(id);
      await fetchBroadcasts();
    } catch (err) {
      console.error(err);
    }
  };

  const addCustomRecipient = () => {
    if (!customEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customEmail.trim())) {
      setError(isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (selectedRecipients.some(r => r.email === customEmail.trim())) return;
    setSelectedRecipients([...selectedRecipients, {
      email: customEmail.trim(),
      name: customName.trim() || customEmail.trim().split('@')[0],
    }]);
    setCustomEmail('');
    setCustomName('');
  };

  const toggleRecipient = (recipient) => {
    const exists = selectedRecipients.some(r => r.email === recipient.email);
    if (exists) {
      setSelectedRecipients(selectedRecipients.filter(r => r.email !== recipient.email));
    } else {
      setSelectedRecipients([...selectedRecipients, { email: recipient.email, name: recipient.name }]);
    }
  };

  const removeRecipient = (email) => {
    setSelectedRecipients(selectedRecipients.filter(r => r.email !== email));
  };

  const filteredAvailable = availableRecipients.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.email.toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q);
  });

  const inputClass = "w-full bg-[#0d1221] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 transition-colors";

  return (
    <div className="space-y-6">
      {/* Inject HeroBanner animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: heroBannerCSS }} />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-primary-400" />
          {isRTL ? 'الإعلانات البريدية' : 'Email Broadcasts'}
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {isRTL ? 'أرسل إعلانات جماعية أو فردية عبر البريد الإلكتروني' : 'Send bulk or individual email announcements'}
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />{success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <XCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('compose')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'compose'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
              : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          {isRTL ? 'إرسال إعلان' : 'Compose'}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'history'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
              : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          {isRTL ? 'السجل' : 'History'}
        </button>
      </div>

      {/* ═══ Compose Tab ═══ */}
      {tab === 'compose' && (
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-6 space-y-5">
          {/* Recipient Type */}
          <div>
            <label className="block text-xs text-dark-400 mb-2">
              {isRTL ? 'نوع المستلمين' : 'Recipient Type'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(recipientTypeConfig).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => { setRecipientType(key); setSelectedRecipients([]); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      recipientType === key
                        ? `${cfg.bg} ${cfg.color} border-current`
                        : 'bg-white/[0.02] text-dark-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {isRTL ? cfg.labelAr : cfg.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipients info for bulk types */}
          {recipientType === 'all_users' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/5 border border-primary-500/10 text-xs text-dark-400">
              <Users className="w-3.5 h-3.5 text-primary-400" />
              {isRTL
                ? `سيتم الإرسال إلى ${availableRecipients.length} مستخدم`
                : `Will send to ${availableRecipients.length} users`}
            </div>
          )}
          {recipientType === 'subscribers' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-dark-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {isRTL
                ? `سيتم الإرسال إلى ${segments.subscribers} مشترك في القوالب`
                : `Will send to ${segments.subscribers} template subscribers`}
            </div>
          )}
          {recipientType === 'non_subscribers' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10 text-xs text-dark-400">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              {isRTL
                ? `سيتم الإرسال إلى ${segments.non_subscribers} غير مشترك`
                : `Will send to ${segments.non_subscribers} non-subscribers`}
            </div>
          )}

          {/* Individual recipient picker */}
          {recipientType === 'individual' && (
            <div className="space-y-3">
              <label className="block text-xs text-dark-400">
                {isRTL ? 'اختر المستلمين' : 'Select Recipients'}
              </label>

              {/* Selected badges */}
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedRecipients.map(r => (
                    <span key={r.email} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs border border-primary-500/20">
                      {r.name} ({r.email})
                      <button onClick={() => removeRecipient(r.email)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search & Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowRecipientPicker(!showRecipientPicker)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0d1221] border border-white/10 text-sm text-dark-400 hover:border-primary-500/30 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {isRTL ? 'اختر من القائمة...' : 'Pick from list...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRecipientPicker ? 'rotate-180' : ''}`} />
                </button>

                {showRecipientPicker && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-[#0d1221] border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                    <div className="p-2 border-b border-white/5">
                      <div className="relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '10px' }} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder={isRTL ? 'بحث...' : 'Search...'}
                          className="w-full bg-white/5 border-none rounded-lg py-2 text-xs text-white placeholder:text-dark-500 outline-none"
                          style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '30px', [isRTL ? 'paddingLeft' : 'paddingRight']: '10px' }}
                          autoFocus
                        />
                      </div>
                    </div>
                    {filteredAvailable.length === 0 ? (
                      <div className="p-4 text-center text-dark-500 text-xs">{isRTL ? 'لا نتائج' : 'No results'}</div>
                    ) : (
                      filteredAvailable.map(r => {
                        const isSelected = selectedRecipients.some(s => s.email === r.email);
                        return (
                          <button
                            key={r.email}
                            onClick={() => toggleRecipient(r)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-start text-xs hover:bg-white/5 transition-colors ${
                              isSelected ? 'bg-primary-500/5' : ''
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-primary-500 border-primary-500' : 'border-white/20'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium truncate">{r.name}</p>
                              <p className="text-dark-500 truncate">{r.email}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom list */}
          {recipientType === 'custom_list' && (
            <div className="space-y-3">
              <label className="block text-xs text-dark-400">
                {isRTL ? 'أضف إيميلات يدوياً' : 'Add Emails Manually'}
              </label>

              {/* Selected badges */}
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedRecipients.map(r => (
                    <span key={r.email} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
                      {r.name} ({r.email})
                      <button onClick={() => removeRecipient(r.email)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add email form */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-dark-500 mb-1">{isRTL ? 'البريد' : 'Email'} *</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    placeholder="email@example.com"
                    className={inputClass}
                    onKeyDown={e => e.key === 'Enter' && addCustomRecipient()}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-dark-500 mb-1">{isRTL ? 'الاسم (اختياري)' : 'Name (optional)'}</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder={isRTL ? 'الاسم' : 'Name'}
                    className={inputClass}
                    onKeyDown={e => e.key === 'Enter' && addCustomRecipient()}
                  />
                </div>
                <button
                  onClick={addCustomRecipient}
                  className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Template Type */}
          <div>
            <label className="block text-xs text-dark-400 mb-2">
              {isRTL ? 'نوع القالب' : 'Template Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setTemplateType('text'); setSelectedBanner(null); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  templateType === 'text'
                    ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                    : 'bg-white/[0.02] text-dark-400 border-white/5 hover:border-white/10'
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {isRTL ? 'رسالة نصية' : 'Text Message'}
              </button>
              <button
                onClick={() => setTemplateType('banner_promo')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  templateType === 'banner_promo'
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                    : 'bg-white/[0.02] text-dark-400 border-white/5 hover:border-white/10'
                }`}
              >
                <Image className="w-4 h-4 flex-shrink-0" />
                {isRTL ? 'ترويج بنر' : 'Banner Promo'}
              </button>
            </div>
          </div>

          {/* Banner Picker */}
          {templateType === 'banner_promo' && (
            <div>
              <label className="block text-xs text-dark-400 mb-2">
                {isRTL ? 'اختر البنر' : 'Select Banner'} <span className="text-red-400">*</span>
              </label>
              {loadingBanners ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                </div>
              ) : bannerTemplates.length === 0 ? (
                <div className="text-center py-8 text-dark-500 text-xs">
                  {isRTL ? 'لا توجد قوالب بنرات' : 'No banner templates available'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bannerTemplates.map(banner => {
                    const isSelected = selectedBanner?.id === banner.id;
                    const gradient = banner.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    const badges = banner.badges || [];
                    const isBottom = banner.imagePosition === 'bottom';
                    const hasImage = !!banner.image_url;
                    /* particles — same as YCZ HeroBanner */
                    const particles = [
                      { size: 6, top: '15%', right: '20%', delay: '0s', dur: '7s', op: 0.08 },
                      { size: 4, top: '60%', right: '80%', delay: '2s', dur: '8s', op: 0.06 },
                      { size: 8, top: '70%', right: '50%', delay: '0.5s', dur: '9s', op: 0.07 },
                      { size: 5, top: '5%', right: '60%', delay: '1.5s', dur: '6.5s', op: 0.06 },
                    ];
                    return (
                      <button
                        key={banner.id}
                        onClick={() => {
                          setSelectedBanner(banner);
                          if (!subject.trim() || selectedBanner) setSubject(banner.name || '');
                        }}
                        className={`relative overflow-hidden text-start transition-all ${isSelected ? 'ring-2 ring-violet-500/60 ring-offset-2 ring-offset-[#0b0f19]' : 'hover:scale-[1.02]'}`}
                        style={{ borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}
                      >
                        {/* === Real YCZ HeroBanner === */}
                        <div className="relative overflow-hidden" style={{ background: gradient, direction: 'rtl', minHeight: 170, borderRadius: 20 }}>
                          {/* Animated mesh background - same layers as ycz */}
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {/* bg_image overlay */}
                            {banner.bg_image && (
                              <div className="absolute inset-0" style={{ backgroundImage: `url(${banner.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
                            )}
                            {/* Animated gradient orb 1 */}
                            <div className="adm-hero-orb-1" style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', top: '-20%', right: '-10%', filter: 'blur(40px)' }} />
                            {/* Animated gradient orb 2 */}
                            <div className="adm-hero-orb-2" style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', bottom: '-15%', left: '-5%', filter: 'blur(30px)' }} />
                            {/* Floating particles */}
                            {particles.map((p, i) => (
                              <div key={i} className="adm-hero-particle" style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: `rgba(255,255,255,${p.op})`, top: p.top, right: p.right, animationDelay: p.delay, animationDuration: p.dur }} />
                            ))}
                            {/* Grid pattern overlay */}
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                          </div>

                          {/* Content — flex row-reverse like ycz desktop */}
                          <div className={`relative z-10 flex ${isBottom ? 'flex-col items-stretch' : 'flex-row-reverse items-center'} gap-4`} style={{ padding: isBottom ? '1.2rem 1.5rem 0.5rem' : '1.5rem' }}>
                            {/* Product image with glow ring + float animation */}
                            {hasImage && (
                              <div className={`flex-shrink-0 flex items-center justify-center ${isBottom ? 'self-center mt-1' : ''}`} style={{ flex: isBottom ? undefined : '0 0 auto', minWidth: 0 }}>
                                <div className="relative adm-hero-img">
                                  <div className="absolute -inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', filter: 'blur(12px)' }} />
                                  <img
                                    src={banner.image_url}
                                    alt={banner.name}
                                    className="relative object-contain"
                                    style={{
                                      width: isBottom ? 110 : 100,
                                      height: isBottom ? 95 : 100,
                                      borderRadius: isBottom ? '20px 20px 0 0' : 20,
                                      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Icon bubble fallback with pulse animation */}
                            {!hasImage && banner.icon && (
                              <div className="adm-hero-icon flex-shrink-0 flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.8rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                                {banner.icon}
                              </div>
                            )}
                            {/* Text content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Glassmorphism tag with slide animation */}
                              {banner.title && (
                                <div className="adm-hero-tag inline-block mb-2" style={{ borderRadius: 20, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', padding: '4px 14px', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                                  {banner.title}
                                </div>
                              )}
                              <h4 className="m-0" style={{ fontWeight: 800, color: '#fff', fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                {banner.subtitle || banner.name}
                              </h4>
                              {banner.description && (
                                <p className="m-0 mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', lineHeight: 1.5 }}>
                                  {banner.description}
                                </p>
                              )}
                              {/* Badges with glassmorphism */}
                              {badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {badges.map((b, i) => (
                                    <span key={i} style={{ borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)', padding: '3px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Price bar */}
                        <div className="flex items-center justify-between px-4 py-2" style={{ background: '#0d1117', borderRadius: '0 0 20px 20px' }}>
                          <p className="text-white text-[11px] font-medium truncate m-0">{banner.name}</p>
                          <span className="text-emerald-400 text-[11px] font-bold ms-2">${banner.price}</span>
                        </div>
                        {/* Selected check */}
                        {isSelected && (
                          <div className="absolute top-3 end-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shadow-lg" style={{ border: '2px solid rgba(255,255,255,0.3)' }}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">
              {isRTL ? 'عنوان الإعلان' : 'Subject'} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={isRTL ? 'عنوان البريد الإلكتروني...' : 'Email subject...'}
              className={inputClass}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">
              {templateType === 'banner_promo'
                ? (isRTL ? 'رسالة إضافية (اختياري)' : 'Custom Message (optional)')
                : (isRTL ? 'نص الرسالة' : 'Message')} {templateType === 'text' && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={templateType === 'banner_promo'
                ? (isRTL ? 'أضف رسالة مخصصة تظهر فوق بطاقة البنر...' : 'Add a custom message above the banner card...')
                : (isRTL ? 'محتوى الإعلان...' : 'Broadcast content...')}
              className={`${inputClass} resize-none ${templateType === 'banner_promo' ? 'h-24' : 'h-40'}`}
            />
          </div>

          {/* Preview Toggle + Send Button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-dark-500 text-xs">
              {recipientType === 'all_users'
                ? (isRTL ? `سيصل إلى ${availableRecipients.length} مستلم` : `Will reach ${availableRecipients.length} recipients`)
                : recipientType === 'subscribers'
                ? (isRTL ? `سيصل إلى ${segments.subscribers} مشترك` : `Will reach ${segments.subscribers} subscribers`)
                : recipientType === 'non_subscribers'
                ? (isRTL ? `سيصل إلى ${segments.non_subscribers} غير مشترك` : `Will reach ${segments.non_subscribers} non-subscribers`)
                : (isRTL ? `${selectedRecipients.length} مستلم محدد` : `${selectedRecipients.length} recipients selected`)}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  showPreview
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    : 'bg-white/5 text-dark-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isRTL ? 'معاينة' : 'Preview'}
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isRTL ? 'إرسال الإعلان' : 'Send Broadcast'}
              </button>
            </div>
          </div>

          {/* ═══ Email Preview ═══ */}
          {showPreview && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3.5 h-3.5 text-dark-400" />
                <span className="text-xs text-dark-400">{isRTL ? 'معاينة البريد الإلكتروني' : 'Email Preview'}</span>
              </div>
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0b0f19]">
                {/* Email header bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#111827] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-dark-500 text-[10px] truncate m-0">{subject || (isRTL ? 'عنوان البريد' : 'Email Subject')}</p>
                  </div>
                </div>

                {/* Email body */}
                <div className="p-6" style={{ background: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)' }}>
                  {/* Gradient Header — YCZ-style pattern overlay */}
                  <div
                    className="relative rounded-t-xl p-6 text-center overflow-hidden"
                    style={{
                      background: templateType === 'banner_promo' && selectedBanner?.gradient
                        ? selectedBanner.gradient
                        : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                    }}
                  >
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{templateType === 'banner_promo' ? '🎨' : '📢'}</div>
                      <h3 className="text-white text-lg font-bold m-0" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        {templateType === 'banner_promo'
                          ? (selectedBanner?.name || (isRTL ? 'بانر جديد متاح الآن!' : 'New Banner Available!'))
                          : (subject || (isRTL ? 'عنوان الإعلان' : 'Broadcast Title'))}
                      </h3>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="bg-[#161b22] rounded-b-xl p-5 border border-white/5 border-t-0">
                    <p className="text-dark-400 text-sm mb-3 m-0">
                      {isRTL ? 'مرحباً [اسم المستلم],' : 'Hello [Recipient Name],'}
                    </p>

                    {/* Custom message */}
                    {message.trim() && (
                      <div className="text-dark-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                        {message}
                      </div>
                    )}

                    {/* Banner Preview Card — Real YCZ HeroBanner */}
                    {templateType === 'banner_promo' && selectedBanner && (() => {
                      const gradient = selectedBanner.gradient || 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
                      const badges = selectedBanner.badges || [];
                      const isBottom = selectedBanner.imagePosition === 'bottom';
                      const hasImage = !!selectedBanner.image_url;
                      const particles = [
                        { size: 6, top: '15%', right: '20%', delay: '0s', dur: '7s', op: 0.08 },
                        { size: 4, top: '60%', right: '80%', delay: '2s', dur: '8s', op: 0.06 },
                        { size: 8, top: '70%', right: '50%', delay: '0.5s', dur: '9s', op: 0.07 },
                      ];
                      return (
                        <div className="overflow-hidden my-4" style={{ borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}>
                          <div className="relative overflow-hidden" style={{ background: gradient, direction: 'rtl', minHeight: 160, borderRadius: '20px 20px 0 0' }}>
                            {/* Animated mesh background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              {selectedBanner.bg_image && (
                                <div className="absolute inset-0" style={{ backgroundImage: `url(${selectedBanner.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
                              )}
                              <div className="adm-hero-orb-1" style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', top: '-20%', right: '-10%', filter: 'blur(40px)' }} />
                              <div className="adm-hero-orb-2" style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', bottom: '-15%', left: '-5%', filter: 'blur(30px)' }} />
                              {particles.map((p, i) => (
                                <div key={i} className="adm-hero-particle" style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: `rgba(255,255,255,${p.op})`, top: p.top, right: p.right, animationDelay: p.delay, animationDuration: p.dur }} />
                              ))}
                              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>
                            {/* Content */}
                            <div className={`relative z-10 flex ${isBottom ? 'flex-col items-stretch' : 'flex-row-reverse items-center'} gap-4`} style={{ padding: isBottom ? '1.5rem 1.5rem 0.5rem' : '1.5rem' }}>
                              {hasImage && (
                                <div className={`flex-shrink-0 flex items-center justify-center ${isBottom ? 'self-center mt-1' : ''}`} style={{ flex: isBottom ? undefined : '0 0 auto', minWidth: 0 }}>
                                  <div className="relative adm-hero-img">
                                    <div className="absolute -inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', filter: 'blur(12px)' }} />
                                    <img
                                      src={selectedBanner.image_url}
                                      alt={selectedBanner.name}
                                      className="relative object-contain"
                                      style={{ width: isBottom ? 120 : 110, height: isBottom ? 100 : 110, borderRadius: isBottom ? '20px 20px 0 0' : 20, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
                                    />
                                  </div>
                                </div>
                              )}
                              {!hasImage && selectedBanner.icon && (
                                <div className="adm-hero-icon flex-shrink-0 flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.8rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                                  {selectedBanner.icon}
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {selectedBanner.title && (
                                  <div className="adm-hero-tag inline-block mb-2" style={{ borderRadius: 20, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', padding: '4px 14px', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                                    {selectedBanner.title}
                                  </div>
                                )}
                                <h4 className="m-0" style={{ fontWeight: 800, color: '#fff', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                  {selectedBanner.subtitle || selectedBanner.name}
                                </h4>
                                {selectedBanner.description && (
                                  <p className="m-0 mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', lineHeight: 1.5 }}>{selectedBanner.description}</p>
                                )}
                                {badges.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {badges.map((b, i) => (
                                      <span key={i} style={{ borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)', padding: '3px 10px', fontSize: '0.62rem', fontWeight: 700, color: '#fff' }}>
                                        {b}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {selectedBanner.price > 0 && (
                            <div className="flex items-center justify-center px-4 py-2.5" style={{ background: '#0d1117', borderRadius: '0 0 20px 20px' }}>
                              <span className="inline-block px-6 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-sm font-bold">
                                ${Number(selectedBanner.price).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Text-only placeholder */}
                    {templateType === 'text' && !message.trim() && (
                      <div className="text-dark-500 text-sm italic">
                        {isRTL ? 'نص الرسالة سيظهر هنا...' : 'Message content will appear here...'}
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="text-center mt-5">
                      <span className="inline-block px-6 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}>
                        {templateType === 'banner_promo'
                          ? (isRTL ? 'تصفح متجر البانرات' : 'Browse Banner Store')
                          : (isRTL ? 'زيارة المنصة' : 'Visit Platform')}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/5 mt-5 pt-4">
                      <p className="text-dark-500 text-[10px] text-center m-0">
                        {isRTL ? 'تم إرسال هذا الإعلان من فريق NEXIRO-FLUX' : 'This announcement was sent by NEXIRO-FLUX team'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ History Tab ═══ */}
      {tab === 'history' && (
        <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-dark-400">
              <Inbox className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{isRTL ? 'لا توجد إعلانات سابقة' : 'No broadcasts yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {broadcasts.map(b => {
                const st = statusConfig[b.status] || statusConfig.completed;
                const typeConfig = recipientTypeConfig[b.recipient_type] || recipientTypeConfig.all_users;
                return (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center flex-shrink-0`}>
                      <Mail className={`w-5 h-5 ${st.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white text-sm font-medium truncate">{b.subject}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-dark-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {b.sent_count}/{b.recipient_count} {isRTL ? 'تم الإرسال' : 'sent'}
                        </span>
                        {b.failed_count > 0 && (
                          <span className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            {b.failed_count} {isRTL ? 'فشل' : 'failed'}
                          </span>
                        )}
                        <span>{isRTL ? typeConfig.labelAr : typeConfig.labelEn}</span>
                        <span>{b.created_at ? new Date(b.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border}`}>
                        {isRTL ? st.labelAr : st.labelEn}
                      </span>
                      <button
                        onClick={() => handleDeleteBroadcast(b.id)}
                        className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
