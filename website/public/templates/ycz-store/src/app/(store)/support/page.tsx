'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Send, ChevronDown } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { FAQ_DATA } from '@/lib/mockData';

export default function SupportPage() {
  const { currentTheme, buttonRadius, t } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  // ─── Contact info from settings ───
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  useEffect(() => {
    async function loadContact() {
      try {
        const res = await fetch(`/api/customization/store?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const c = data.customization || data;
          if (c.support_email) setSupportEmail(c.support_email);
          if (c.support_phone) setSupportPhone(c.support_phone);
        }
      } catch { /* silent */ }
    }
    loadContact();
  }, []);

  // Format phone for WhatsApp link (remove spaces, dashes, +)
  const waLink = supportPhone
    ? `https://wa.me/${supportPhone.replace(/[\s\-\+\(\)]/g, '')}`
    : '#';
  const mailLink = supportEmail ? `mailto:${supportEmail}` : '#';
  const phoneLink = supportPhone ? `tel:${supportPhone}` : '#';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Banner */}
      <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('مركز الدعم')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{t('نحن هنا لمساعدتك')}</p>
      </div>

      {/* Contact Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: '2rem' }}>
        {[
          { icon: <MessageSquare size={20} />, title: t('واتساب'), desc: supportPhone || '—', color: '#25d366', href: waLink },
          { icon: <Mail size={20} />, title: t('البريد'), desc: supportEmail || '—', color: '#3b82f6', href: mailLink },
          { icon: <Phone size={20} />, title: t('اتصل بنا'), desc: supportPhone || '—', color: '#8b5cf6', href: phoneLink },
        ].map((m, i) => (
          <a key={i} href={m.href} target={m.href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer"
            style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', textAlign: 'center', border: '1px solid #f1f5f9', cursor: m.desc !== '—' ? 'pointer' : 'default', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => { if (m.desc !== '—') (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            onClick={e => { if (m.desc === '—') e.preventDefault(); }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>{m.icon}</div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{m.title}</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', direction: 'ltr', lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal', margin: 0 }}>{m.desc}</p>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 12 }}>{t('الأسئلة الشائعة')}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '2rem' }}>
        {FAQ_DATA.map((faq, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0b1020', textAlign: 'right' }}>{t(faq.q)}</span>
              <ChevronDown size={16} color="#94a3b8" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7 }}>{t(faq.a)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Ticket Form */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>{t('إرسال تذكرة دعم')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder={t('الموضوع')} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
          <textarea placeholder={t('اكتب رسالتك هنا...')} rows={4} style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
          <button style={{ padding: '0.7rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Send size={16} /> {t('إرسال')}
          </button>
        </div>
      </div>
    </div>
  );
}
