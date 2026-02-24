'use client';

import { useHxTheme } from '@/providers/HxThemeProvider';
import { FileText } from 'lucide-react';

export default function HxTermsPage() {
  const { currentTheme, darkMode, t } = useHxTheme();
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const sections = [
    { title: 'القبول بالشروط', content: 'باستخدام هذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام الموقع.' },
    { title: 'المنتجات والأسعار', content: 'نحرص على عرض معلومات دقيقة عن منتجاتنا وأسعارها. نحتفظ بالحق في تعديل الأسعار دون إشعار مسبق. الأسعار المعروضة تشمل السعر الأساسي وقد تُضاف رسوم التوصيل حسب المنطقة.' },
    { title: 'الطلب والدفع', content: 'بإتمام عملية الشراء، فإنك تقر بأنك مخول بالدفع بالطريقة المختارة. تأكيد الطلب يعني قبول الأسعار ورسوم التوصيل المعروضة. نحتفظ بحق رفض أي طلب لأي سبب.' },
    { title: 'التوصيل', content: 'نقوم بتوصيل المنتجات إلى المناطق المدعومة فقط. مواعيد التوصيل المذكورة تقديرية وقد تختلف حسب الظروف. نحن غير مسؤولين عن التأخيرات الناتجة عن شركات الشحن.' },
    { title: 'الإلغاء', content: 'يمكنك إلغاء الطلب قبل شحنه. بعد الشحن، يرجى مراجعة سياسة الاسترجاع لمعرفة الخيارات المتاحة.' },
    { title: 'المسؤولية', content: 'نقدم منتجاتنا كما هي. نحن غير مسؤولين عن أي أضرار ناتجة عن سوء الاستخدام أو عدم اتباع التعليمات المرفقة مع المنتج.' },
  ];

  return (
    <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <FileText size={28} style={{ color: currentTheme.primary }} />
          <h1 style={{ fontSize: 26, fontWeight: 900, color: text }}>{t('الشروط والأحكام')}</h1>
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
