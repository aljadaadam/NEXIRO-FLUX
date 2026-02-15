'use client';

import { useState } from 'react';
import { MessageCircle, Mail, Phone, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { FAQ_DATA } from '@/lib/mockData';

export default function SupportPage() {
  const { currentTheme, buttonRadius } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const radius = buttonRadius === 'sharp' ? '6px' : buttonRadius === 'pill' ? '50px' : '12px';

  const contactMethods = [
    { icon: '💬', label: 'واتساب', desc: 'رد فوري 24/7', color: '#25d366' },
    { icon: '📧', label: 'البريد', desc: 'support@store.com', color: '#0ea5e9' },
    { icon: '📱', label: 'تيليجرام', desc: '@store_support', color: '#229ed9' },
  ];

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1020', marginBottom: 8 }}>
        💬 مركز الدعم
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 24 }}>
        نحن هنا لمساعدتك. اختر طريقة التواصل المناسبة
      </p>

      {/* Contact Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {contactMethods.map((m, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: '1.5rem',
            border: '1px solid #f1f5f9', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}>{m.icon}</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1020', marginBottom: 4 }}>{m.label}</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 14 }}>
          ❓ أسئلة شائعة
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ_DATA.map((faq, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 12,
              border: '1px solid #f1f5f9', overflow: 'hidden',
            }}>
              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{
                width: '100%', padding: '1rem 1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', textAlign: 'right' }}>{faq.q}</span>
                {expandedFaq === i ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
              </button>
              {expandedFaq === i && (
                <div style={{
                  padding: '0 1.25rem 1rem',
                  fontSize: '0.82rem', color: '#64748b', lineHeight: 1.8,
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Form */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '1.5rem',
        border: '1px solid #f1f5f9',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1020', marginBottom: 16 }}>
          📝 إرسال تذكرة دعم
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={ticketSubject} onChange={e => setTicketSubject(e.target.value)}
            placeholder="موضوع التذكرة"
            style={{
              padding: '0.75rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none',
            }}
          />
          <textarea
            value={ticketMessage} onChange={e => setTicketMessage(e.target.value)}
            rows={4} placeholder="اكتب رسالتك هنا..."
            style={{
              padding: '0.75rem 1rem', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Tajawal, sans-serif', outline: 'none', resize: 'vertical',
            }}
          />
          <button style={{
            padding: '0.75rem 2rem', borderRadius: radius,
            background: currentTheme.gradient, color: '#fff',
            border: 'none', fontSize: '0.88rem', fontWeight: 800,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            alignSelf: 'flex-start',
          }}>
            <Send size={16} /> إرسال التذكرة
          </button>
        </div>
      </div>
    </section>
  );
}
