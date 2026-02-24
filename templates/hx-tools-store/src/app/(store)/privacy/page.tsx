'use client';

import { useHxTheme } from '@/providers/HxThemeProvider';
import { Shield } from 'lucide-react';

export default function HxPrivacyPage() {
  const { currentTheme, darkMode, t } = useHxTheme();
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const sections = [
    { title: 'جمع المعلومات', content: 'نقوم بجمع المعلومات الشخصية التي تقدمها لنا عند التسجيل أو الشراء، مثل الاسم وعنوان البريد الإلكتروني ورقم الهاتف وعنوان التوصيل. كما نجمع معلومات تقنية مثل عنوان IP ونوع المتصفح.' },
    { title: 'استخدام المعلومات', content: 'نستخدم معلوماتك لمعالجة الطلبات وتوصيل المنتجات والتواصل معك بشأن طلباتك وتحسين خدماتنا. لن نشارك معلوماتك الشخصية مع أطراف ثالثة إلا لغرض إتمام عمليات التوصيل والدفع.' },
    { title: 'حماية المعلومات', content: 'نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح. نستخدم تشفير SSL لحماية بياناتك أثناء النقل.' },
    { title: 'ملفات تعريف الارتباط', content: 'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح وتذكر تفضيلاتك. يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك.' },
    { title: 'حقوقك', content: 'يحق لك الوصول إلى معلوماتك الشخصية وتحديثها أو حذفها في أي وقت. يمكنك التواصل معنا لممارسة هذه الحقوق عبر صفحة الدعم.' },
  ];

  return (
    <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Shield size={28} style={{ color: currentTheme.primary }} />
          <h1 style={{ fontSize: 26, fontWeight: 900, color: text }}>{t('سياسة الخصوصية')}</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: currentTheme.primary, marginBottom: 10 }}>{t(s.title)}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: subtext }}>{t(s.content)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
