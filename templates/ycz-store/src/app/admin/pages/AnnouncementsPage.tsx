'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Users, Sparkles, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

// ─── Email Templates ───
interface EmailTemplate {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  defaultSubjectAr: string;
  defaultSubjectEn: string;
  defaultMessageAr: string;
  defaultMessageEn: string;
  gradient: string;
  iconBg: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'discount',
    icon: '🏷️',
    titleAr: 'تخفيض أسعار',
    titleEn: 'Price Discount',
    descAr: 'أخبر زبائنك عن العروض والتخفيضات',
    descEn: 'Notify customers about deals & discounts',
    defaultSubjectAr: '🔥 عرض خاص — تخفيضات حصرية لك!',
    defaultSubjectEn: '🔥 Special Offer — Exclusive Discounts!',
    defaultMessageAr: 'مرحباً!\n\nيسعدنا إعلامك بأننا أطلقنا تخفيضات حصرية على مجموعة مختارة من خدماتنا!\n\n💰 خصومات تصل إلى 30%\n⏰ العرض لفترة محدودة\n\nلا تفوّت الفرصة — زُر متجرنا الآن واستفد من العرض!\n\nمع أطيب التحيات',
    defaultMessageEn: 'Hello!\n\nWe are excited to announce exclusive discounts on selected services!\n\n💰 Up to 30% off\n⏰ Limited time offer\n\nDon\'t miss out — visit our store now!\n\nBest regards',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    iconBg: '#fef3c7',
  },
  {
    id: 'new_product',
    icon: '🆕',
    titleAr: 'منتج جديد',
    titleEn: 'New Product',
    descAr: 'أعلن عن منتج أو خدمة جديدة',
    descEn: 'Announce a new product or service',
    defaultSubjectAr: '🆕 خدمة جديدة متاحة الآن!',
    defaultSubjectEn: '🆕 New Service Available Now!',
    defaultMessageAr: 'مرحباً!\n\nيسرنا إعلامك بإضافة خدمة جديدة إلى متجرنا:\n\n✨ [اسم الخدمة]\n📋 [وصف مختصر للخدمة]\n💵 السعر: [السعر]\n\nجرّبها الآن وكن من أوائل المستفيدين!\n\nمع أطيب التحيات',
    defaultMessageEn: 'Hello!\n\nWe\'re excited to announce a new service in our store:\n\n✨ [Service Name]\n📋 [Brief description]\n💵 Price: [Price]\n\nTry it now and be among the first!\n\nBest regards',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    iconBg: '#ede9fe',
  },
  {
    id: 'maintenance',
    icon: '🔧',
    titleAr: 'صيانة مجدولة',
    titleEn: 'Scheduled Maintenance',
    descAr: 'أبلغ الزبائن عن صيانة أو تحديث',
    descEn: 'Inform customers about maintenance',
    defaultSubjectAr: '🔧 إشعار صيانة مجدولة',
    defaultSubjectEn: '🔧 Scheduled Maintenance Notice',
    defaultMessageAr: 'مرحباً!\n\nنود إعلامك بأننا سنقوم بإجراء صيانة مجدولة:\n\n📅 التاريخ: [التاريخ]\n⏰ الوقت: [الوقت]\n⏱️ المدة المتوقعة: [المدة]\n\nقد تتأثر بعض الخدمات مؤقتاً خلال هذه الفترة.\n\nنعتذر عن أي إزعاج ونشكر تفهمكم.\n\nمع أطيب التحيات',
    defaultMessageEn: 'Hello!\n\nWe\'d like to inform you about scheduled maintenance:\n\n📅 Date: [Date]\n⏰ Time: [Time]\n⏱️ Duration: [Duration]\n\nSome services may be temporarily affected.\n\nWe apologize for any inconvenience.\n\nBest regards',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    iconBg: '#e0f2fe',
  },
  {
    id: 'thank_you',
    icon: '💖',
    titleAr: 'شكر وتقدير',
    titleEn: 'Thank You',
    descAr: 'اشكر زبائنك على ثقتهم',
    descEn: 'Thank your customers for their trust',
    defaultSubjectAr: '💖 شكراً لك — أنت مميز!',
    defaultSubjectEn: '💖 Thank You — You\'re Special!',
    defaultMessageAr: 'مرحباً!\n\nنود أن نشكرك من أعماق قلوبنا على ثقتك بنا ودعمك المتواصل.\n\n🌟 أنت جزء مهم من عائلتنا\n🎯 نسعى دائماً لتقديم الأفضل لك\n💪 رأيك يهمنا — لا تتردد في مشاركتنا\n\nشكراً لك!\n\nمع أطيب التحيات',
    defaultMessageEn: 'Hello!\n\nWe want to sincerely thank you for your trust and continued support.\n\n🌟 You\'re an important part of our family\n🎯 We always strive to give you the best\n💪 Your feedback matters — don\'t hesitate to share\n\nThank you!\n\nBest regards',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    iconBg: '#fce7f3',
  },
  {
    id: 'custom',
    icon: '✏️',
    titleAr: 'رسالة مخصصة',
    titleEn: 'Custom Message',
    descAr: 'اكتب رسالتك الخاصة من الصفر',
    descEn: 'Write your own message from scratch',
    defaultSubjectAr: '',
    defaultSubjectEn: '',
    defaultMessageAr: '',
    defaultMessageEn: '',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    iconBg: '#f1f5f9',
  },
];

export default function AnnouncementsPage({ isActive }: { isActive?: boolean } = {}) {
  const { t, isRTL, lang } = useAdminLang();
  const isEn = lang === 'en';

  // ─── State ───
  const [step, setStep] = useState<'templates' | 'compose' | 'sent'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentResult, setSentResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    if (isActive) loadRecipientCount();
  }, [isActive]);

  async function loadRecipientCount() {
    try {
      const res = await adminApi.getBroadcastRecipientCount();
      setRecipientCount(res?.count || 0);
    } catch { /* ignore */ }
    finally { setLoadingCount(false); }
  }

  function selectTemplate(tmpl: EmailTemplate) {
    setSelectedTemplate(tmpl);
    setSubject(isEn ? tmpl.defaultSubjectEn : tmpl.defaultSubjectAr);
    setMessage(isEn ? tmpl.defaultMessageEn : tmpl.defaultMessageAr);
    setError('');
    setSentResult(null);
    setStep('compose');
  }

  function goBack() {
    setStep('templates');
    setSelectedTemplate(null);
    setSubject('');
    setMessage('');
    setError('');
    setSentResult(null);
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError(t('العنوان والرسالة مطلوبان'));
      return;
    }
    if (recipientCount === 0) {
      setError(t('لا يوجد زبائن لإرسال البريد'));
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await adminApi.sendEmailBroadcast({
        subject: subject.trim(),
        message: message.trim(),
        recipient_type: 'all_customers',
      });
      setSentResult({ sent: res.sent || 0, failed: res.failed || 0, total: res.total || 0 });
      setStep('sent');
    } catch (err: any) {
      setError(err?.error || err?.message || t('حدث خطأ أثناء الإرسال'));
    } finally {
      setSending(false);
    }
  }

  // ─── Sent confirmation ───
  if (step === 'sent') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#dcfce7',
          display: 'grid', placeItems: 'center',
        }}>
          <CheckCircle size={40} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1020' }}>
          {t('تم الإرسال بنجاح! 🎉')}
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', lineHeight: 1.8 }}>
          {t('تم إرسال البريد إلى')} <strong style={{ color: '#16a34a' }}>{sentResult?.sent || 0}</strong> {t('زبون مشترك')}
          {(sentResult?.failed || 0) > 0 && (
            <span style={{ color: '#ef4444' }}> — {t('فشل')}: {sentResult?.failed}</span>
          )}
        </p>
        <button onClick={goBack} style={{
          padding: '0.7rem 2rem', borderRadius: 12,
          background: '#7c5cff', color: '#fff',
          border: 'none', fontSize: '0.88rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
        }}>
          {t('إرسال إعلان آخر')}
        </button>
      </div>
    );
  }

  // ─── Compose step ───
  if (step === 'compose' && selectedTemplate) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Back button */}
        <button onClick={goBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#7c5cff', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'inherit',
          marginBottom: 20, padding: 0,
        }}>
          {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {t('رجوع للقوالب')}
        </button>

        {/* Template header */}
        <div style={{
          background: selectedTemplate.gradient, borderRadius: 16,
          padding: '1.5rem 2rem', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            fontSize: '2rem', width: 56, height: 56, borderRadius: 14,
            display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.25)',
          }}>
            {selectedTemplate.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {isEn ? selectedTemplate.titleEn : selectedTemplate.titleAr}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
              {isEn ? selectedTemplate.descEn : selectedTemplate.descAr}
            </p>
          </div>
        </div>

        {/* Recipient info */}
        <div style={{
          background: '#f0fdf4', borderRadius: 12, padding: '0.85rem 1.2rem',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid #bbf7d0',
        }}>
          <Users size={18} color="#16a34a" />
          <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
            {t('سيتم الإرسال إلى')} <strong>{recipientCount}</strong> {t('زبون مسجل')}
          </span>
        </div>

        {/* Subject */}
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
          {t('عنوان البريد')} *
        </label>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder={t('عنوان البريد الإلكتروني...')}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
            border: '1.5px solid #e2e8f0', fontSize: '0.88rem',
            fontFamily: 'inherit', outline: 'none', marginBottom: 16,
            background: '#fff',
          }}
        />

        {/* Message */}
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
          {t('محتوى الرسالة')} *
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={10}
          placeholder={t('اكتب رسالتك هنا...')}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
            border: '1.5px solid #e2e8f0', fontSize: '0.85rem',
            fontFamily: 'inherit', outline: 'none', resize: 'vertical',
            lineHeight: 1.8, marginBottom: 12, background: '#fff',
          }}
        />
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 20 }}>
          {t('نصيحة: استخدم أسطر جديدة لتنسيق الرسالة')}
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', borderRadius: 10, padding: '0.7rem 1rem',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #fecaca',
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={{ fontSize: '0.82rem', color: '#991b1b' }}>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSend}
            disabled={sending || recipientCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.75rem 2rem', borderRadius: 12,
              background: sending ? '#a78bfa' : '#7c5cff', color: '#fff',
              border: 'none', fontSize: '0.88rem', fontWeight: 700,
              cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
              opacity: (sending || recipientCount === 0) ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {sending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            {sending ? t('جاري الإرسال...') : t('إرسال البريد')}
          </button>
          <button onClick={goBack} style={{
            padding: '0.75rem 1.5rem', borderRadius: 12,
            background: '#f1f5f9', color: '#64748b',
            border: 'none', fontSize: '0.85rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {t('إلغاء')}
          </button>
        </div>
      </div>
    );
  }

  // ─── Templates step (main view) ───
  return (
    <>
      {/* ─── Hero Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #2563eb 100%)',
        borderRadius: 20, padding: '2.5rem 2rem', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: -30, [isRTL ? 'left' : 'right']: -20,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, [isRTL ? 'right' : 'left']: 40,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', top: 20, [isRTL ? 'right' : 'left']: '50%',
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)',
              display: 'grid', placeItems: 'center',
            }}>
              <Mail size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                {t('📧 البريد الإعلاني')}
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0, marginTop: 2 }}>
                {t('أرسل إعلانات بريدية لزبائنك واكسب جمهورك')}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: 12,
              padding: '0.65rem 1.2rem', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Users size={16} color="#a5b4fc" />
              <span style={{ fontSize: '0.82rem', color: '#e0e7ff', fontWeight: 600 }}>
                {loadingCount ? '...' : recipientCount} {t('زبون مسجل')}
              </span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: 12,
              padding: '0.65rem 1.2rem', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Sparkles size={16} color="#fbbf24" />
              <span style={{ fontSize: '0.82rem', color: '#e0e7ff', fontWeight: 600 }}>
                {EMAIL_TEMPLATES.length} {t('قوالب جاهزة')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section Title ─── */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 4 }}>
          {t('اختر قالب الإعلان')}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {t('اختر قالباً جاهزاً وعدّل عليه، أو أنشئ رسالة مخصصة')}
        </p>
      </div>

      {/* ─── Template Cards Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {EMAIL_TEMPLATES.map(tmpl => (
          <div
            key={tmpl.id}
            onClick={() => selectTemplate(tmpl)}
            style={{
              background: '#fff', borderRadius: 16,
              border: '1.5px solid #f1f5f9',
              padding: '1.25rem', cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#c4b5fd';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(124,92,255,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            {/* Gradient strip on top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: tmpl.gradient,
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{
                fontSize: '1.6rem', width: 50, height: 50, borderRadius: 14,
                display: 'grid', placeItems: 'center',
                background: tmpl.iconBg,
              }}>
                {tmpl.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020', marginBottom: 3 }}>
                  {isEn ? tmpl.titleEn : tmpl.titleAr}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                  {isEn ? tmpl.descEn : tmpl.descAr}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              gap: 6, marginTop: 4,
            }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#7c5cff',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {t('استخدام')}
                {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
