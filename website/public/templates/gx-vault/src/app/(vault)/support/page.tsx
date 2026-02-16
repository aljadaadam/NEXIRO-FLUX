'use client';

import { useState } from 'react';
import { MessageCircle, Send, HelpCircle, Mail, Clock } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { GXV_FAQ } from '@/engine/gxvData';

export default function GxvSupportPage() {
  const { currentTheme, storeName } = useGxvTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 24px 80px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
        🛟 الدعم الفني
      </h1>
      <p style={{ color: '#666688', fontSize: '0.9rem', marginBottom: 32 }}>
        نحن هنا لمساعدتك على مدار الساعة
      </p>

      {/* Contact cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {[
          { icon: <MessageCircle size={22} />, title: 'محادثة مباشرة', desc: 'تحدث معنا الآن', color: currentTheme.primary },
          { icon: <Mail size={22} />, title: 'البريد الإلكتروني', desc: 'support@gxvault.com', color: '#3b82f6' },
          { icon: <Clock size={22} />, title: 'أوقات الدعم', desc: '24/7 على مدار الساعة', color: '#22c55e' },
        ].map((card, i) => (
          <div key={i} className="gxv-card-hover" style={{
            padding: '24px 20px', borderRadius: 16,
            background: 'rgba(15,15,35,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${card.color}15`,
              display: 'grid', placeItems: 'center',
              margin: '0 auto 14px', color: card.color,
            }}>
              {card.icon}
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8e8ff', marginBottom: 4 }}>{card.title}</h3>
            <p style={{ color: '#666688', fontSize: '0.82rem' }}>{card.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 20 }}>
        ❓ الأسئلة الشائعة
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GXV_FAQ.map((faq, i) => (
          <div key={i} style={{
            borderRadius: 14, background: 'rgba(15,15,35,0.6)',
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
          }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
              width: '100%', padding: '16px 20px', background: 'transparent',
              border: 'none', color: '#e8e8ff', fontSize: '0.92rem', fontWeight: 600,
              cursor: 'pointer', textAlign: 'right',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {faq.q}
              <HelpCircle size={16} style={{ color: openFaq === i ? currentTheme.primary : '#555577', transition: 'color 0.2s' }} />
            </button>
            {openFaq === i && (
              <div style={{
                padding: '0 20px 16px', color: '#8888aa',
                fontSize: '0.85rem', lineHeight: 1.7,
                animation: 'gxvFadeIn 0.2s ease-out',
              }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
