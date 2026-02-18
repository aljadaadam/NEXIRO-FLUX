import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Eye, Database, Lock, Share2, UserCheck, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

export default function PrivacyPage() {
  const { isRTL } = useLanguage();

  const sections = [
    {
      icon: Eye,
      titleAr: 'ما البيانات التي نجمعها',
      titleEn: 'What Data We Collect',
      contentAr: 'نجمع البيانات التالية عند التسجيل واستخدام المنصة: الاسم الكامل، البريد الإلكتروني، كلمة المرور (مشفرة)، عنوان IP، بيانات المتصفح، وبيانات استخدام المنصة. لا نجمع بيانات بطاقات الائتمان مباشرة — تتم معالجتها عبر بوابات دفع آمنة.',
      contentEn: 'We collect the following data upon registration and platform use: full name, email address, password (encrypted), IP address, browser data, and platform usage data. We do not directly collect credit card data — it is processed through secure payment gateways.',
    },
    {
      icon: Database,
      titleAr: 'كيف نستخدم بياناتك',
      titleEn: 'How We Use Your Data',
      contentAr: 'نستخدم بياناتك لـ: إدارة حسابك وموقعك، معالجة المدفوعات، تقديم الدعم الفني، تحسين خدماتنا، إرسال إشعارات مهمة عن حسابك، والامتثال للمتطلبات القانونية. لن نبيع أو نؤجر بياناتك لأي طرف ثالث.',
      contentEn: 'We use your data to: manage your account and site, process payments, provide technical support, improve our services, send important notifications about your account, and comply with legal requirements. We will never sell or rent your data to any third party.',
    },
    {
      icon: Lock,
      titleAr: 'حماية البيانات',
      titleEn: 'Data Protection',
      contentAr: 'نستخدم تشفير SSL 256-bit لجميع الاتصالات. كلمات المرور مشفرة باستخدام bcrypt. قواعد البيانات محمية بجدران حماية متعددة الطبقات. نقوم بنسخ احتياطي يومي تلقائي لضمان سلامة بياناتك.',
      contentEn: 'We use 256-bit SSL encryption for all connections. Passwords are hashed using bcrypt. Databases are protected by multi-layer firewalls. We perform automatic daily backups to ensure your data safety.',
    },
    {
      icon: Share2,
      titleAr: 'مشاركة البيانات',
      titleEn: 'Data Sharing',
      contentAr: 'لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية: بموافقتك الصريحة، للامتثال لأمر قضائي أو طلب قانوني، لحماية حقوقنا أو سلامة مستخدمينا، أو مع مزودي خدمات موثوقين يساعدوننا في تشغيل المنصة (مثل بوابات الدفع).',
      contentEn: 'We do not share your personal data with third parties except in the following cases: with your explicit consent, to comply with a court order or legal request, to protect our rights or user safety, or with trusted service providers who help us operate the platform (such as payment gateways).',
    },
    {
      icon: UserCheck,
      titleAr: 'حقوقك',
      titleEn: 'Your Rights',
      contentAr: 'يحق لك: الوصول لبياناتك الشخصية وتحديثها في أي وقت، طلب حذف حسابك وبياناتك، تصدير بياناتك بصيغة قابلة للقراءة، إلغاء الاشتراك من الرسائل التسويقية، وتقديم شكوى لسلطة حماية البيانات المختصة.',
      contentEn: 'You have the right to: access and update your personal data at any time, request deletion of your account and data, export your data in a readable format, unsubscribe from marketing communications, and file a complaint with the relevant data protection authority.',
    },
    {
      icon: Bell,
      titleAr: 'ملفات تعريف الارتباط (Cookies)',
      titleEn: 'Cookies',
      contentAr: 'نستخدم ملفات تعريف الارتباط الأساسية لتشغيل المنصة وحفظ تفضيلاتك (مثل اللغة). نستخدم أيضاً ملفات تحليلية لفهم كيفية استخدام المنصة وتحسينها. يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.',
      contentEn: 'We use essential cookies to operate the platform and save your preferences (such as language). We also use analytical cookies to understand how the platform is used and improve it. You can manage cookie preferences from your browser settings.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO
        title="Privacy Policy"
        titleAr="سياسة الخصوصية"
        description="Learn how NEXIRO-FLUX protects your data. Our privacy policy explains what data we collect, how we use it, and how we keep it safe."
        descriptionAr="تعرّف كيف تحمي NEXIRO-FLUX بياناتك. سياسة الخصوصية توضح البيانات التي نجمعها وكيف نستخدمها ونحميها."
        canonicalPath="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-3">
            {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-dark-400 text-sm">
            {isRTL ? 'آخر تحديث: فبراير 2026' : 'Last updated: February 2026'}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{isRTL ? section.titleAr : section.titleEn}</h2>
                </div>
                <p className="text-dark-300 text-sm leading-relaxed">
                  {isRTL ? section.contentAr : section.contentEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-10 text-center bg-white/5 rounded-2xl border border-white/5 p-6">
          <p className="text-dark-400 text-sm">
            {isRTL
              ? 'لأي استفسارات حول سياسة الخصوصية، تواصل معنا على:'
              : 'For privacy-related questions, contact us at:'}
          </p>
          <a href="mailto:privacy@nexiro-flux.com" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm mt-1 inline-block">
            privacy@nexiro-flux.com
          </a>
        </div>
      </div>
    </div>
  );
}
