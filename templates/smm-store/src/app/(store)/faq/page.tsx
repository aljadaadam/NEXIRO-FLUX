'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Headphones, Book, Shield, Zap } from 'lucide-react';

const faqData = [
  { q: 'ما هي خدمات SMM؟', qEn: 'What are SMM services?', a: 'خدمات SMM (Social Media Marketing) تشمل زيادة المتابعين والإعجابات والمشاهدات والتعليقات على منصات التواصل الاجتماعي المختلفة.', aEn: 'SMM (Social Media Marketing) services include increasing followers, likes, views, and comments on various social media platforms.' },
  { q: 'كم يستغرق تنفيذ الطلب؟', qEn: 'How long does order delivery take?', a: 'يختلف وقت التنفيذ حسب نوع الخدمة. معظم الخدمات تبدأ خلال دقائق وتكتمل خلال ساعات قليلة.', aEn: 'Delivery time varies by service type. Most services start within minutes and complete within a few hours.' },
  { q: 'هل الخدمات آمنة؟', qEn: 'Are the services safe?', a: 'نعم، نستخدم أساليب آمنة ومتوافقة مع سياسات المنصات لضمان أمان حسابك.', aEn: 'Yes, we use safe methods compatible with platform policies to ensure your account safety.' },
  { q: 'ما طرق الدفع المتاحة؟', qEn: 'What payment methods are available?', a: 'ندعم عدة طرق دفع منها PayPal، التحويل البنكي، USDT، وغيرها من البوابات الإلكترونية.', aEn: 'We support multiple payment methods including PayPal, bank transfer, USDT, and other electronic gateways.' },
  { q: 'هل يمكنني استرجاع أموالي؟', qEn: 'Can I get a refund?', a: 'نعم، في حالة عدم تنفيذ الطلب أو وجود مشكلة، يمكنك التواصل مع الدعم لاسترجاع المبلغ.', aEn: 'Yes, if the order is not fulfilled or there is an issue, you can contact support for a refund.' },
  { q: 'هل تدعمون جميع المنصات؟', qEn: 'Do you support all platforms?', a: 'ندعم أغلب المنصات الرئيسية: إنستغرام، تيك توك، يوتيوب، تويتر/X، فيسبوك، تلغرام، سناب شات، وغيرها.', aEn: 'We support most major platforms: Instagram, TikTok, YouTube, Twitter/X, Facebook, Telegram, Snapchat, and more.' },
];

export default function FAQPage() {
  const { currentTheme, darkMode, t, isRTL } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: currentTheme.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: currentTheme.glow,
        }}>
          <HelpCircle size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: text, marginBottom: 12 }}>
          {t('الأسئلة الشائعة')}
        </h1>
        <p style={{ fontSize: 16, color: subtext, maxWidth: 500, margin: '0 auto' }}>
          {t('إجابات لأكثر الأسئلة شيوعاً حول خدماتنا')}
        </p>
      </div>

      {/* FAQ list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
        {faqData.map((faq, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: 16,
            border: `1px solid ${openIndex === i ? currentTheme.primary + '40' : border}`,
            overflow: 'hidden', transition: 'all 0.3s',
          }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%', padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer',
                color: text, fontSize: 15, fontWeight: 600, textAlign: 'start',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${currentTheme.primary}12`, color: currentTheme.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                {isRTL ? faq.q : faq.qEn}
              </span>
              <ChevronDown size={18} style={{
                color: subtext, transition: 'transform 0.3s',
                transform: openIndex === i ? 'rotate(180deg)' : 'none',
              }} />
            </button>
            {openIndex === i && (
              <div style={{
                padding: '0 20px 18px 58px', color: subtext,
                fontSize: 14, lineHeight: 1.8, animation: 'fadeIn 0.3s ease',
              }}>
                {isRTL ? faq.a : faq.aEn}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact section */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text, marginBottom: 12 }}>
          {t('لا تزال لديك أسئلة؟')}
        </h2>
        <p style={{ color: subtext, marginBottom: 24 }}>{t('تواصل معنا وسنرد عليك في أقرب وقت')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { icon: MessageCircle, label: t('الدردشة المباشرة'), desc: t('متوفرة 24/7'), color: '#10b981' },
          { icon: Mail, label: t('البريد الإلكتروني'), desc: 'support@smm.com', color: '#3b82f6' },
          { icon: Headphones, label: t('الدعم الفني'), desc: t('فريق متخصص'), color: '#f59e0b' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} style={{
              background: cardBg, borderRadius: 16, padding: 24,
              border: `1px solid ${border}`, textAlign: 'center',
              transition: 'all 0.3s', cursor: 'pointer',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = item.color;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = border;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${item.color}12`, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Icon size={22} />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 4 }}>{item.label}</h4>
              <p style={{ fontSize: 12, color: subtext }}>{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
