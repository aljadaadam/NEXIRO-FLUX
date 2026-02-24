'use client';

import { useHxTheme } from '@/providers/HxThemeProvider';
import { RotateCcw } from 'lucide-react';

export default function HxRefundPage() {
  const { currentTheme, darkMode, t } = useHxTheme();
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const sections = [
    { title: 'شروط الاسترجاع', content: 'يحق لك طلب استرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية مع جميع الملحقات والتغليف الأصلي.' },
    { title: 'المنتجات غير القابلة للاسترجاع', content: 'لا يمكن استرجاع المنتجات التي تم فتحها أو استخدامها أو تفعيلها، أو المنتجات التي تم تلفها بسبب سوء الاستخدام من قبل العميل.' },
    { title: 'إجراءات الاسترجاع', content: 'لطلب الاسترجاع، تواصل مع فريق الدعم عبر صفحة الدعم أو الواتساب. سيتم مراجعة طلبك خلال 1-3 أيام عمل وسنتواصل معك لترتيب عملية الإرجاع.' },
    { title: 'الاستبدال', content: 'في حالة وجود عيب في المنتج، نقوم باستبداله بمنتج جديد مجاناً. يتم شحن المنتج البديل خلال 3-5 أيام عمل من استلام المنتج المعيب.' },
    { title: 'استرداد المبلغ', content: 'بعد الموافقة على طلب الاسترجاع واستلام المنتج، سيتم استرداد المبلغ خلال 5-10 أيام عمل بنفس طريقة الدفع المستخدمة عند الشراء.' },
    { title: 'رسوم الشحن', content: 'في حالة الاسترجاع بسبب عيب في المنتج، نتحمل كافة رسوم الشحن. أما في حالة الاسترجاع لأسباب أخرى، يتحمل العميل رسوم شحن الإرجاع.' },
  ];

  return (
    <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <RotateCcw size={28} style={{ color: currentTheme.primary }} />
          <h1 style={{ fontSize: 26, fontWeight: 900, color: text }}>{t('سياسة الاسترجاع')}</h1>
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
