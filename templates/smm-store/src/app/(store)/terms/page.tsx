'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { FileText, Shield, AlertTriangle, CreditCard, XCircle, Scale, Globe } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: 'مقدمة',
    titleEn: 'Introduction',
    text: 'باستخدامك لهذا الموقع وخدماته، فإنك توافق على شروط الاستخدام هذه. يُرجى قراءتها بعناية قبل استخدام أي من خدماتنا.',
    textEn: 'By using this website and its services, you agree to these Terms of Service. Please read them carefully before using any of our services.',
  },
  {
    icon: Shield,
    title: 'استخدام الخدمات',
    titleEn: 'Use of Services',
    text: 'يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام خدماتنا. أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يُحظر استخدام الخدمات لأي غرض غير قانوني أو مخالف لسياسات المنصات.',
    textEn: 'You must be 18 years or older to use our services. You are responsible for maintaining account confidentiality. Services must not be used for illegal purposes or violating platform policies.',
  },
  {
    icon: CreditCard,
    title: 'الدفع والأسعار',
    titleEn: 'Payments & Pricing',
    text: 'الأسعار قابلة للتغيير دون إشعار مسبق. جميع المدفوعات غير قابلة للاسترداد إلا في حالات عدم التنفيذ الكامل للخدمة. يتم محاسبتك حسب سعر الخدمة وقت الشراء.',
    textEn: 'Prices are subject to change without notice. All payments are non-refundable except in cases of complete non-delivery. You will be charged at the service price at the time of purchase.',
  },
  {
    icon: AlertTriangle,
    title: 'إخلاء المسؤولية',
    titleEn: 'Disclaimer',
    text: 'نحن لا نضمن نتائج محددة من خدماتنا. لا نتحمل مسؤولية أي إجراءات تتخذها المنصات ضد حسابك. الخدمات مقدمة "كما هي" بدون ضمانات.',
    textEn: 'We do not guarantee specific results from our services. We are not liable for any actions platforms take against your account. Services are provided "as is" without warranties.',
  },
  {
    icon: XCircle,
    title: 'الإلغاء والاسترجاع',
    titleEn: 'Cancellation & Refunds',
    text: 'يمكنك طلب الإلغاء قبل بدء تنفيذ الطلب. بعد بدء التنفيذ، لا يمكن إلغاء الطلب. في حالة عدم التنفيذ، يُسترد المبلغ تلقائياً إلى رصيد المحفظة.',
    textEn: 'You can request cancellation before order processing begins. After processing starts, orders cannot be cancelled. In case of non-delivery, the amount is automatically refunded to your wallet.',
  },
  {
    icon: Scale,
    title: 'القانون المعمول به',
    titleEn: 'Governing Law',
    text: 'تخضع هذه الشروط وتُفسر وفقاً للقوانين السارية في بلد الخدمة. أي نزاعات تنشأ عن هذه الشروط تُحل عبر التحكيم.',
    textEn: 'These terms are governed by and construed in accordance with the laws of the service country. Any disputes arising from these terms shall be resolved through arbitration.',
  },
  {
    icon: Globe,
    title: 'تعديل الشروط',
    titleEn: 'Modification of Terms',
    text: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ستُنشر التعديلات على هذه الصفحة وسيتم إخطارك. استمرارك في استخدام الخدمة يعني موافقتك على الشروط المعدلة.',
    textEn: 'We reserve the right to modify these terms at any time. Changes will be posted on this page and you will be notified. Continued use of the service constitutes acceptance of modified terms.',
  },
];

export default function TermsPage() {
  const { currentTheme, darkMode, t, isRTL } = useTheme();

  const cardBg = darkMode ? '#141830' : '#fff';
  const text_ = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: currentTheme.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: currentTheme.glow,
        }}>
          <FileText size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: text_, marginBottom: 8 }}>
          {t('شروط الاستخدام')}
        </h1>
        <p style={{ fontSize: 14, color: subtext }}>{t('آخر تحديث')}: {new Date().toLocaleDateString(isRTL ? 'ar' : 'en')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: cardBg, borderRadius: 16, padding: 24,
              border: `1px solid ${border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${currentTheme.primary}12`, color: currentTheme.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: text_ }}>
                  {isRTL ? s.title : s.titleEn}
                </h2>
              </div>
              <p style={{ fontSize: 14, color: subtext, lineHeight: 1.9 }}>
                {isRTL ? s.text : s.textEn}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
