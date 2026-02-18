import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, Shield, AlertTriangle, Scale, Clock, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

export default function TermsPage() {
  const { isRTL } = useLanguage();

  const sections = [
    {
      icon: FileText,
      titleAr: 'مقدمة',
      titleEn: 'Introduction',
      contentAr: 'مرحباً بك في منصة NEXIRO-FLUX. باستخدامك لخدماتنا فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام المنصة أو شراء أي قالب أو خدمة.',
      contentEn: 'Welcome to NEXIRO-FLUX. By using our services, you agree to be bound by these Terms and Conditions. Please read them carefully before using the platform or purchasing any template or service.',
    },
    {
      icon: Scale,
      titleAr: 'تعريف الخدمة',
      titleEn: 'Service Definition',
      contentAr: 'NEXIRO-FLUX هي منصة SaaS لبناء وإدارة المواقع الإلكترونية. نوفر قوالب جاهزة، استضافة، لوحة تحكم، ونطاق فرعي مجاني. الخدمة تشمل الدعم الفني والتحديثات المستمرة خلال فترة الاشتراك النشط.',
      contentEn: 'NEXIRO-FLUX is a SaaS platform for building and managing websites. We provide ready-made templates, hosting, dashboard, and free subdomain. The service includes technical support and continuous updates during the active subscription period.',
    },
    {
      icon: Shield,
      titleAr: 'حقوق الملكية الفكرية',
      titleEn: 'Intellectual Property',
      contentAr: 'جميع القوالب والتصاميم والأكواد المصدرية هي ملكية حصرية لـ NEXIRO-FLUX. عند شراء قالب، تحصل على ترخيص استخدام غير حصري وغير قابل للنقل. لا يحق لك إعادة بيع القالب أو توزيعه أو تعديله لغرض البيع.',
      contentEn: 'All templates, designs, and source codes are the exclusive property of NEXIRO-FLUX. When purchasing a template, you receive a non-exclusive, non-transferable usage license. You may not resell, distribute, or modify the template for resale purposes.',
    },
    {
      icon: AlertTriangle,
      titleAr: 'الاستخدام المقبول',
      titleEn: 'Acceptable Use',
      contentAr: 'يُحظر استخدام المنصة لأي أغراض غير قانونية أو ضارة، بما في ذلك: المحتوى المخالف للقانون، الاحتيال، انتهاك حقوق الآخرين، نشر البرمجيات الخبيثة، أو أي نشاط يضر بالمنصة أو مستخدميها الآخرين.',
      contentEn: 'Using the platform for any illegal or harmful purposes is prohibited, including: illegal content, fraud, infringing others\' rights, distributing malware, or any activity that harms the platform or its other users.',
    },
    {
      icon: Clock,
      titleAr: 'الاشتراكات والتجديد',
      titleEn: 'Subscriptions & Renewal',
      contentAr: 'الاشتراكات الشهرية والسنوية تتجدد تلقائياً ما لم يتم إلغاؤها قبل تاريخ التجديد. اشتراكات "مدى الحياة" تمنحك وصولاً دائماً طالما أن المنصة تعمل. نحتفظ بالحق في تعديل الأسعار مع إشعار مسبق بـ 30 يوماً.',
      contentEn: 'Monthly and yearly subscriptions auto-renew unless canceled before the renewal date. "Lifetime" subscriptions grant permanent access as long as the platform operates. We reserve the right to modify prices with 30 days prior notice.',
    },
    {
      icon: Globe,
      titleAr: 'إنهاء الخدمة',
      titleEn: 'Service Termination',
      contentAr: 'نحتفظ بالحق في تعليق أو إنهاء حسابك في حال انتهاك هذه الشروط. عند الإنهاء، ستفقد الوصول لجميع البيانات والمواقع المرتبطة بحسابك. ننصحك بأخذ نسخة احتياطية من بياناتك بشكل دوري.',
      contentEn: 'We reserve the right to suspend or terminate your account if these terms are violated. Upon termination, you will lose access to all data and sites associated with your account. We recommend regularly backing up your data.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO
        title="Terms of Service"
        titleAr="الشروط والأحكام"
        description="Read NEXIRO-FLUX terms of service. Learn about our policies, user rights, and service agreements."
        descriptionAr="اقرأ شروط وأحكام NEXIRO-FLUX. تعرّف على سياساتنا وحقوق المستخدمين واتفاقيات الخدمة."
        canonicalPath="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-3">
            {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
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
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-400" />
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
              ? 'لأي استفسارات حول هذه الشروط، تواصل معنا على:'
              : 'For any questions about these terms, contact us at:'}
          </p>
          <a href="mailto:legal@nexiro-flux.com" className="text-primary-400 hover:text-primary-300 font-medium text-sm mt-1 inline-block">
            legal@nexiro-flux.com
          </a>
        </div>
      </div>
    </div>
  );
}
