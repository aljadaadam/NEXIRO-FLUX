'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const { currentTheme, darkMode, t } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0a0a12' : '#fafafe';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ background: bg, color: textColor, minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }} className="anim-fade-up">
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, marginBottom: 12 }}>
            {t('تواصل معنا')}
          </h1>
          <p style={{ color: mutedColor, fontSize: 16 }}>
            {t('نسعد بتواصلكم معنا في أي وقت')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {/* Contact Info */}
          <div className="anim-fade-right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: Phone, label: t('الهاتف'), value: '+966 11 234 5678' },
                { icon: Mail, label: t('البريد الإلكتروني'), value: 'info@autozone.sa' },
                { icon: MapPin, label: t('العنوان'), value: t('الرياض — طريق الملك فهد') },
                { icon: Clock, label: t('ساعات العمل'), value: '٩ ص — ١٠ م' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: 20,
                  borderRadius: 20, background: cardBg,
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-6px)'; e.currentTarget.style.borderColor = `${accent}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; }}>
                  <div style={{ width: 50, height: 50, borderRadius: 16, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={22} color={accent} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: mutedColor, marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{item.value}</p>
                  </div>
                </div>
              ))}

              {/* WhatsApp */}
              <a href="https://wa.me/966112345678" target="_blank" className="car-btn-primary" style={{
                background: '#25d366', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 0', marginTop: 8,
              }}>
                <MessageCircle size={20} />
                {t('واتساب')}
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="anim-fade-left" style={{
            padding: 32, borderRadius: 24, background: cardBg,
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: 40 }} className="anim-scale-in">
                <Send size={40} color={accent} style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t('تم إرسال رسالتك')}</h3>
                <p style={{ color: mutedColor }}>{t('سنتواصل معك قريباً')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>{t('أرسل لنا رسالة')}</h3>
                <input className="car-form-input" placeholder={t('الاسم الكامل')} required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
                <input className="car-form-input" placeholder={t('البريد')} type="email"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
                <input className="car-form-input" placeholder={t('رقم الهاتف')} dir="ltr"
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
                <textarea className="car-form-input" placeholder={t('الرسالة')} rows={4} required
                  value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor, resize: 'vertical' }} />
                <button type="submit" className="car-btn-primary" style={{
                  width: '100%', background: accent, borderRadius: 14, marginTop: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <Send size={16} />
                  {t('إرسال الرسالة')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
