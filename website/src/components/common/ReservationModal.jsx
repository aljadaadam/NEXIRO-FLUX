import { useState } from 'react';
import { X, Send, Loader2, CheckCircle2, CalendarCheck, User, Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates } from '../../data/templates';
import api from '../../services/api';

export default function ReservationModal({ isOpen, onClose, templateId, templateName, plan }) {
  const { isRTL } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasTemplate = !!templateId;

  if (!isOpen) return null;

  const getTemplateName = () => {
    if (templateName) return templateName;
    const tpl = staticTemplates.find(t => t.id === selectedTemplate);
    return tpl ? (isRTL ? tpl.name : tpl.nameEn) : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalTemplateId = templateId || selectedTemplate;
    const finalTemplateName = getTemplateName();

    if (!form.name.trim() || !form.email.trim() || !finalTemplateId) {
      setError(isRTL ? 'الاسم والبريد الإلكتروني والقالب مطلوبين' : 'Name, email and template are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.createReservation({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        template_id: finalTemplateId,
        template_name: finalTemplateName,
        plan: plan || 'monthly',
        message: form.message.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(isRTL ? (err.error || 'حدث خطأ') : (err.errorEn || err.error || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', email: '', phone: '', message: '' });
    setSelectedTemplate(templateId || '');
    setError('');
    setSuccess(false);
    onClose();
  };

  const inputClass = "w-full bg-[#0d1221] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-[#111827] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/10">
              <CalendarCheck className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isRTL ? 'احجز الآن' : 'Book Now'}
              </h2>
              <p className="text-xs text-dark-400">
                {isRTL ? 'سنتواصل معك لإكمال عملية الشراء' : 'We will contact you to complete the purchase'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-dark-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isRTL ? 'تم الحجز بنجاح!' : 'Reservation Successful!'}
            </h3>
            <p className="text-dark-400 text-sm mb-6">
              {isRTL
                ? 'شكراً لك! سنتواصل معك في أقرب وقت لإكمال عملية الشراء'
                : 'Thank you! We will contact you soon to complete the purchase'}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
            >
              {isRTL ? 'حسناً' : 'OK'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Template info */}
            {hasTemplate ? (
              <div className="px-3 py-2 rounded-lg bg-primary-500/5 border border-primary-500/10 text-xs">
                <span className="text-dark-400">{isRTL ? 'القالب: ' : 'Template: '}</span>
                <span className="text-primary-400 font-medium">{templateName}</span>
              </div>
            ) : (
              <div>
                <label className="flex items-center gap-1.5 text-xs text-dark-400 mb-1.5">
                  <ChevronDown className="w-3.5 h-3.5" />
                  {isRTL ? 'اختر القالب' : 'Select Template'} <span className="text-red-400">*</span>
                </label>
                <select
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  required
                >
                  <option value="" disabled>{isRTL ? '-- اختر القالب --' : '-- Select Template --'}</option>
                  {staticTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {isRTL ? tpl.name : tpl.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-dark-400 mb-1.5">
                <User className="w-3.5 h-3.5" />
                {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                required
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-dark-400 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-dark-400 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                <span className="text-dark-600 text-[10px]">({isRTL ? 'اختياري' : 'optional'})</span>
              </label>
              <input
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder={isRTL ? 'رقم الهاتف أو واتساب' : 'Phone or WhatsApp number'}
              />
            </div>

            {/* Message */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-dark-400 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {isRTL ? 'ملاحظات' : 'Notes'}
                <span className="text-dark-600 text-[10px]">({isRTL ? 'اختياري' : 'optional'})</span>
              </label>
              <textarea
                className={`${inputClass} resize-none h-20`}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder={isRTL ? 'أي استفسارات أو ملاحظات...' : 'Any questions or notes...'}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-sm text-dark-400 hover:text-white transition-colors"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isRTL ? 'تأكيد الحجز' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
