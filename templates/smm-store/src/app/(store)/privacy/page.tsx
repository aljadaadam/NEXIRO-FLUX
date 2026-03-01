'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Lock, Eye, Database, Share2, Cookie, UserCheck, Mail } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: 'المعلومات التي نجمعها',
    titleEn: 'Information We Collect',
    text: 'نجمع المعلومات التي تقدمها مباشرة عند التسجيل، مثل البريد الإلكتروني واسم المستخدم. كما نجمع بيانات الاستخدام تلقائياً مثل عنوان IP ونوع المتصفح ونظام التشغيل.',
    textEn: 'We collect information you provide directly when registering, such as email and username. We also automatically collect usage data like IP address, browser type, and operating system.',
  },
  {
    icon: Database,
    title: 'كيف نستخدم بياناتك',
    titleEn: 'How We Use Your Data',
    text: 'نستخدم بياناتك لتقديم الخدمات ومعالجة الطلبات، التواصل معك بخصوص حسابك، تحسين خدماتنا وتجربة المستخدم، حمايتك من الاحتيال والأنشطة غير المصرح بها.',
    textEn: 'We use your data to provide services and process orders, communicate with you about your account, improve our services and user experience, and protect against fraud and unauthorized activities.',
  },
  {
    icon: Share2,
    title: 'مشاركة البيانات',
    titleEn: 'Data Sharing',
    text: 'لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك بياناتك مع مزودي خدمات الدفع لمعالجة المعاملات المالية فقط.',
    textEn: 'We do not sell or rent your personal data to third parties. We may share your data with payment service providers only to process financial transactions.',
  },
  {
    icon: Lock,
    title: 'أمان البيانات',
    titleEn: 'Data Security',
    text: 'نستخدم تقنيات تشفير متقدمة لحماية بياناتك. جميع الاتصالات مشفرة عبر SSL/TLS. نقوم بمراجعات أمنية دورية لضمان سلامة معلوماتك.',
    textEn: 'We use advanced encryption technologies to protect your data. All communications are encrypted via SSL/TLS. We conduct periodic security reviews to ensure information safety.',
  },
  {
    icon: Cookie,
    title: 'ملفات تعريف الارتباط',
    titleEn: 'Cookies',
    text: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك ضبط إعدادات المتصفح لرفض الكوكيز ولكن بعض ميزات الموقع قد لا تعمل بشكل صحيح.',
    textEn: 'We use cookies to improve your experience. You can adjust your browser settings to reject cookies, but some website features may not work properly.',
  },
  {
    icon: UserCheck,
    title: 'حقوقك',
    titleEn: 'Your Rights',
    text: 'يحق لك الوصول إلى بياناتك، تصحيحها، أو حذفها في أي وقت. يمكنك طلب نسخة من بياناتك أو إلغاء الاشتراك في الرسائل التسويقية.',
    textEn: 'You have the right to access, correct, or delete your data at any time. You can request a copy of your data or unsubscribe from marketing communications.',
  },
  {
    icon: Mail,
    title: 'اتصل بنا',
    titleEn: 'Contact Us',
    text: 'لأي استفسارات حول سياسة الخصوصية، يُرجى التواصل معنا عبر البريد الإلكتروني أو نظام الدعم الفني المتاح على مدار الساعة.',
    textEn: 'For any inquiries about our privacy policy, please contact us via email or our 24/7 support system.',
  },
];

export default function PrivacyPage() {
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
          <Lock size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: text_, marginBottom: 8 }}>
          {t('سياسة الخصوصية')}
        </h1>
        <p style={{ fontSize: 14, color: subtext }}>{t('آخر تحديث')}: {new Date().toLocaleDateString(isRTL ? 'ar' : 'en')}</p>
      </div>

      {/* Key points banner */}
      <div style={{
        background: `${currentTheme.primary}08`, borderRadius: 16, padding: 20,
        border: `1px solid ${currentTheme.primary}20`, marginBottom: 28,
        display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center',
      }}>
        {[
          { label: t('تشفير SSL'), icon: '🔒' },
          { label: t('بدون بيع بيانات'), icon: '🚫' },
          { label: t('حذف في أي وقت'), icon: '🗑️' },
        ].map((p, i) => (
          <span key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: currentTheme.primary,
          }}>
            <span>{p.icon}</span> {p.label}
          </span>
        ))}
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
