'use client';

import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { ArrowRight, FileText, AlertTriangle, Scale, ShieldCheck, Ban, Mail } from 'lucide-react';
import SeoHead from '@/components/seo/SeoHead';

export default function TermsPage() {
  const { currentTheme, storeName, t, isRTL } = useTheme();

  const sections = [
    {
      icon: <FileText size={20} />,
      title: 'قبول الشروط',
      content: isRTL
        ? 'باستخدامك لمنصة ' + storeName + ' فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام المنصة.'
        : 'By using ' + storeName + ' platform, you agree to comply with these terms and conditions. If you do not agree to any of these terms, please do not use the platform.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'حقوق الملكية الفكرية',
      content: 'جميع المحتويات والتصاميم والعلامات التجارية المعروضة على المنصة هي ملكية خاصة لأصحابها. يُحظر نسخ أو إعادة إنتاج أي محتوى بدون إذن مسبق.',
    },
    {
      icon: <Ban size={20} />,
      title: 'الاستخدام المحظور',
      content: 'يُحظر استخدام المنصة لأي أغراض غير قانونية أو ضارة، بما في ذلك: المحتوى المخالف للقانون، الاحتيال، انتهاك حقوق الآخرين، نشر البرمجيات الخبيثة، أو أي نشاط يضر بالمنصة أو مستخدميها.',
    },
    {
      icon: <Scale size={20} />,
      title: 'المسؤولية والضمانات',
      content: 'نسعى لتقديم خدمة عالية الجودة لكننا لا نضمن خلو المنصة من الأخطاء التقنية بشكل كامل. نحن غير مسؤولين عن أي أضرار ناتجة عن سوء استخدام المنصة أو انقطاع الخدمة المؤقت.',
    },
    {
      icon: <AlertTriangle size={20} />,
      title: 'تعديل الشروط',
      content: 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية قبل تطبيقها. استمرارك في استخدام المنصة يعني موافقتك على الشروط المعدّلة.',
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <SeoHead
        title="الشروط والأحكام"
        description="الشروط والأحكام الخاصة باستخدام المتجر. يُرجى قراءة الشروط بعناية قبل استخدام خدماتنا لفتح الشبكات وإزالة iCloud وأدوات السوفتوير."
        keywords="شروط وأحكام, terms and conditions, سياسة الاستخدام, قوانين المتجر"
        canonical="/terms"
      />
      {/* Back */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginBottom: 16 }}>
        <ArrowRight size={16} /> {t('العودة للرئيسية')}
      </Link>

      {/* Banner */}
      <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <Scale size={32} color="#fff" style={{ marginBottom: 8 }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('الشروط والأحكام')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{t('آخر تحديث: فبراير 2026')}</p>
      </div>

      {/* Intro */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          {isRTL
            ? <>مرحباً بك في {storeName}. يُرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام المنصة، حيث تُنظّم هذه الشروط العلاقة بينك وبين المنصة.</>
            : <>Welcome to {storeName}. Please read the following terms and conditions carefully before using the platform, as these terms govern the relationship between you and the platform.</>}
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sections.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${currentTheme.primary}15`, color: currentTheme.primary, display: 'grid', placeItems: 'center' }}>{s.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t(s.title)}</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{t(s.content)}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border-light)', marginTop: 16, textAlign: 'center' }}>
        <Mail size={20} color={currentTheme.primary} style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('لأي استفسارات حول الشروط والأحكام، تواصل معنا عبر صفحة الدعم.')}</p>
        <Link href="/support" style={{ color: currentTheme.primary, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>{t('مركز الدعم ←')}</Link>
      </div>
    </div>
  );
}
