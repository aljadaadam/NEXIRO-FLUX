'use client';

import { useState } from 'react';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { MessageCircle, Mail, Phone, Send, ChevronDown, ChevronUp, HelpCircle, Headphones, Clock } from 'lucide-react';

const hxFAQs = [
  { q: 'كيف يمكنني طلب منتج؟', a: 'يمكنك تصفح المنتجات واختيار المنتج المطلوب ثم إضافته للسلة وإتمام عملية الشراء بسهولة.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نوفر عدة طرق دفع تشمل التحويل البنكي، باي بال، USDT، والدفع عند الاستلام حسب منطقتك.' },
  { q: 'كم تستغرق عملية التوصيل؟', a: 'تختلف مدة التوصيل حسب البلد والمنطقة. عادة ما تستغرق من 3 إلى 14 يوم عمل.' },
  { q: 'هل يمكنني إرجاع المنتج؟', a: 'نعم، يمكنك طلب إرجاع المنتج خلال 7 أيام من الاستلام بشرط أن يكون بحالته الأصلية.' },
  { q: 'كيف يمكنني تتبع طلبي؟', a: 'بعد شحن طلبك ستحصل على رقم تتبع يمكنك استخدامه من صفحة طلباتي.' },
  { q: 'هل المنتجات أصلية؟', a: 'نعم، جميع منتجاتنا أصلية 100% ومضمونة ونقدم ضمان على جميع الأجهزة.' },
];

export default function HxSupportPage() {
  const { currentTheme, darkMode, t, isRTL, buttonRadius } = useHxTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* Hero */}
        <div style={{
          textAlign: 'center', padding: '40px 20px', marginBottom: 32,
          background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.secondary}15)`,
          borderRadius: 20,
        }}>
          <Headphones size={48} style={{ color: currentTheme.primary, marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, fontWeight: 900, color: text, marginBottom: 8 }}>{t('مركز الدعم والمساعدة')}</h1>
          <p style={{ color: subtext, fontSize: 15 }}>{t('نحن هنا لمساعدتك! تواصل معنا بأي وقت')}</p>
        </div>

        {/* Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: <Phone size={22} />, title: t('اتصل بنا'), detail: '+966 50 000 0000', sub: t('متاح من 9 صباحاً - 9 مساءً') },
            { icon: <Mail size={22} />, title: t('البريد الإلكتروني'), detail: 'support@hxtools.com', sub: t('الرد خلال 24 ساعة') },
            { icon: <MessageCircle size={22} />, title: t('واتساب'), detail: '+966 50 000 0000', sub: t('دعم فوري') },
          ].map((item, i) => (
            <div key={i} style={{
              background: cardBg, borderRadius: 16, padding: 24, textAlign: 'center',
              border: `1px solid ${border}`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${currentTheme.primary}15`, color: currentTheme.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>{item.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 4 }}>{item.title}</h3>
              <div style={{ fontSize: 14, fontWeight: 600, color: currentTheme.primary, marginBottom: 4 }}>{item.detail}</div>
              <div style={{ fontSize: 12, color: subtext, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Clock size={12} /> {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <HelpCircle size={22} style={{ color: currentTheme.primary }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>{t('الأسئلة الشائعة')}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hxFAQs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: cardBg, borderRadius: 14, border: `1px solid ${expandedFAQ === i ? currentTheme.primary + '60' : border}`,
                  overflow: 'hidden', transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                  style={{
                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: expandedFAQ === i ? currentTheme.primary : text }}>{t(faq.q)}</span>
                  {expandedFAQ === i ? <ChevronUp size={18} style={{ color: currentTheme.primary }} /> : <ChevronDown size={18} style={{ color: subtext }} />}
                </button>
                {expandedFAQ === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 13, color: subtext, lineHeight: 1.8 }}>{t(faq.a)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: text, marginBottom: 20 }}>✉️ {t('أرسل لنا رسالة')}</h2>

          {sent && (
            <div style={{ padding: 14, borderRadius: 12, background: '#10b98115', color: '#10b981', fontSize: 14, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
              ✅ {t('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً')}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <input className="hx-input" placeholder={t('الاسم')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="hx-input" type="email" placeholder={t('البريد الإلكتروني')} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <input className="hx-input" placeholder={t('الموضوع')} required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <textarea className="hx-input" rows={5} placeholder={t('رسالتك...')} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} />
            <button type="submit" className="hx-btn-primary" style={{ background: currentTheme.primary, borderRadius: Number(buttonRadius), alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Send size={16} /> {t('إرسال')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
