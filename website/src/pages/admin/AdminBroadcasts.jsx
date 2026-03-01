import { useState, useEffect, useCallback } from 'react';
import {
  Send, Loader2, CheckCircle2, XCircle, Mail, Users, User, Trash2,
  Plus, X, Inbox, Clock, ChevronDown, Megaphone, Search, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const recipientTypeConfig = {
  all_users:   { labelAr: 'جميع مستخدمي المنصة', labelEn: 'All Platform Users', icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  individual:  { labelAr: 'مستلم محدد',           labelEn: 'Specific Recipients', icon: User,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  custom_list: { labelAr: 'قائمة مخصصة',          labelEn: 'Custom Email List',   icon: Mail,  color: 'text-amber-400',   bg: 'bg-amber-500/10' },
};

const statusConfig = {
  sending:   { labelAr: 'جاري الإرسال', labelEn: 'Sending',   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  completed: { labelAr: 'مكتمل',        labelEn: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  failed:    { labelAr: 'فشل',          labelEn: 'Failed',    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
};

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
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') fetchBroadcasts();
    if (tab === 'compose') fetchRecipients();
  }, [tab, fetchBroadcasts, fetchRecipients]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError(isRTL ? 'العنوان والرسالة مطلوبان' : 'Subject and message are required');
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
      };
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Recipients info for all types */}
          {(recipientType === 'all_users' || recipientType === 'all_reservations') && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/5 border border-primary-500/10 text-xs text-dark-400">
              <Users className="w-3.5 h-3.5 text-primary-400" />
              {isRTL
                ? `سيتم الإرسال إلى ${availableRecipients.length} مستخدم`
                : `Will send to ${availableRecipients.length} users`}
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
              {isRTL ? 'نص الرسالة' : 'Message'} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={isRTL ? 'محتوى الإعلان...' : 'Broadcast content...'}
              className={`${inputClass} resize-none h-40`}
            />
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-dark-500 text-xs">
              {(recipientType === 'all_users' || recipientType === 'all_reservations')
                ? (isRTL ? `سيصل إلى ${availableRecipients.length} مستلم` : `Will reach ${availableRecipients.length} recipients`)
                : (isRTL ? `${selectedRecipients.length} مستلم محدد` : `${selectedRecipients.length} recipients selected`)}
            </p>
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
                const typeConfig = recipientTypeConfig[b.recipient_type] || recipientTypeConfig.all_reservations;
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
