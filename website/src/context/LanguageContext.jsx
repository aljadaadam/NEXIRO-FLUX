import { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext();

const translations = {
  ar: {
    nav: {
      home: 'الرئيسية',
      templates: 'القوالب',
      pricing: 'الأسعار',
      about: 'من نحن',
      login: 'تسجيل الدخول',
      register: 'سجّل مجاناً',
      demo: 'شاهد الديمو',
    },
    hero: {
      badge: '🚀 أطلق مشروعك الرقمي اليوم',
      title1: 'موقعك الاحترافي',
      title2: 'جاهز في دقائق',
      title3: 'ليس أيام.',
      subtitle: 'اختر قالبك، خصّصه بلمسة، وانطلق. NEXIRO-FLUX يحوّل فكرتك إلى واقع رقمي مذهل بدون كود، بدون تعقيد، بدون حدود.',
      cta: 'ابدأ مجاناً الآن',
      ctaSecondary: 'شاهد القوالب',
      trustedBy: 'موثوق من قبل أكثر من 2,500 عميل',
    },
    templates: {
      title: 'قوالب تأخذ الأنفاس',
      subtitle: 'كل قالب هو تحفة فنية رقمية. اختر، خصّص، وأطلق موقعك في دقائق.',
      preview: 'معاينة',
      buyNow: 'اشترِ الآن',
      features: 'المميزات',
      monthly: 'شهرياً',
      yearly: 'سنوياً',
      lifetime: 'مدى الحياة',
      startingFrom: 'يبدأ من',
      perMonth: '/شهر',
    },
    features: {
      title: 'لماذا NEXIRO-FLUX؟',
      subtitle: 'نحن لا نبني مواقع فقط — نحن نصنع تجارب رقمية استثنائية.',
      speed: 'سرعة فائقة',
      speedDesc: 'إطلاق موقعك خلال 5 دقائق. بدون كود، بدون انتظار.',
      design: 'تصاميم تحبس الأنفاس',
      designDesc: 'قوالب صمّمها خبراء UI/UX بمعايير عالمية.',
      support: 'دعم لا ينام',
      supportDesc: 'فريق دعم فني متاح 24/7 لمساعدتك في أي وقت.',
      security: 'أمان حديدي',
      securityDesc: 'SSL مجاني، حماية DDoS، ونسخ احتياطي يومي تلقائي.',
      seo: 'SEO متقدم',
      seoDesc: 'موقعك يتصدر نتائج البحث مع أدوات SEO المدمجة.',
      mobile: 'متجاوب 100%',
      mobileDesc: 'يعمل بشكل مثالي على كل الأجهزة والشاشات.',
    },
    pricing: {
      title: 'أسعار لا تُقاوم',
      subtitle: 'اختر الخطة المناسبة لك. بدون رسوم مخفية. إلغاء في أي وقت.',
      monthly: 'شهري',
      yearly: 'سنوي',
      lifetime: 'مدى الحياة',
      popular: 'الأكثر شعبية',
      save: 'وفّر',
      choosePlan: 'اختر هذه الخطة',
      perMonth: '/شهر',
      perYear: '/سنة',
      oneTime: 'دفعة واحدة',
      features: 'المميزات المشمولة:',
    },
    testimonials: {
      title: 'عملاؤنا يتحدثون',
      subtitle: 'لا تأخذ كلامنا فقط — اسمع ممن جرّبوا NEXIRO-FLUX.',
    },
    cta: {
      title: 'جاهز تبدأ رحلتك الرقمية؟',
      subtitle: 'انضم لآلاف العملاء السعداء. أول 14 يوم مجاناً، بدون بطاقة ائتمان.',
      button: 'ابدأ الآن مجاناً',
    },
    footer: {
      description: 'منصة رائدة لبناء المواقع الإلكترونية الاحترافية بأسهل وأسرع طريقة.',
      product: 'المنتج',
      company: 'الشركة',
      support: 'الدعم',
      legal: 'قانوني',
      rights: 'جميع الحقوق محفوظة',
    },
    preview: {
      backToTemplates: 'العودة للقوالب',
      livePreview: 'معاينة حية',
      description: 'وصف القالب',
      keyFeatures: 'المميزات الرئيسية',
      choosePlan: 'اختر خطتك',
      buyNow: 'اشترِ الآن',
      monthly: 'شهري',
      yearly: 'سنوي',
      lifetime: 'مدى الحياة',
    },
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      name: 'الاسم الكامل',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      loginBtn: 'دخول',
      registerBtn: 'سجّل الآن',
      orContinueWith: 'أو تابع بـ',
      welcomeBack: 'مرحباً بعودتك!',
      createAccount: 'أنشئ حسابك مجاناً',
    },
  },
  en: {
    nav: {
      home: 'Home',
      templates: 'Templates',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      register: 'Get Started Free',
      demo: 'View Demo',
    },
    hero: {
      badge: '🚀 Launch your digital project today',
      title1: 'Your Professional Website',
      title2: 'Ready in Minutes',
      title3: 'Not Days.',
      subtitle: 'Pick your template, customize it with a touch, and launch. NEXIRO-FLUX turns your idea into a stunning digital reality — no code, no complexity, no limits.',
      cta: 'Start Free Now',
      ctaSecondary: 'View Templates',
      trustedBy: 'Trusted by over 2,500 clients',
    },
    templates: {
      title: 'Breathtaking Templates',
      subtitle: 'Every template is a digital masterpiece. Choose, customize, and launch in minutes.',
      preview: 'Preview',
      buyNow: 'Buy Now',
      features: 'Features',
      monthly: 'Monthly',
      yearly: 'Yearly',
      lifetime: 'Lifetime',
      startingFrom: 'Starting from',
      perMonth: '/mo',
    },
    features: {
      title: 'Why NEXIRO-FLUX?',
      subtitle: "We don't just build websites — we craft exceptional digital experiences.",
      speed: 'Blazing Fast',
      speedDesc: 'Launch your website in 5 minutes. No code, no waiting.',
      design: 'Stunning Designs',
      designDesc: 'Templates crafted by UI/UX experts with global standards.',
      support: 'Always-On Support',
      supportDesc: '24/7 support team available to help you anytime.',
      security: 'Iron-Clad Security',
      securityDesc: 'Free SSL, DDoS protection, and automatic daily backups.',
      seo: 'Advanced SEO',
      seoDesc: 'Rank higher with built-in SEO tools.',
      mobile: '100% Responsive',
      mobileDesc: 'Works perfectly on all devices and screens.',
    },
    pricing: {
      title: 'Irresistible Pricing',
      subtitle: 'Choose the plan that fits you. No hidden fees. Cancel anytime.',
      monthly: 'Monthly',
      yearly: 'Yearly',
      lifetime: 'Lifetime',
      popular: 'Most Popular',
      save: 'Save',
      choosePlan: 'Choose This Plan',
      perMonth: '/mo',
      perYear: '/yr',
      oneTime: 'one-time',
      features: 'Included features:',
    },
    testimonials: {
      title: 'Our Clients Speak',
      subtitle: "Don't just take our word — hear from those who tried NEXIRO-FLUX.",
    },
    cta: {
      title: 'Ready to Start Your Digital Journey?',
      subtitle: 'Join thousands of happy clients. First 14 days free, no credit card required.',
      button: 'Start Free Now',
    },
    footer: {
      description: 'A leading platform for building professional websites the easiest and fastest way.',
      product: 'Product',
      company: 'Company',
      support: 'Support',
      legal: 'Legal',
      rights: 'All rights reserved',
    },
    preview: {
      backToTemplates: 'Back to Templates',
      livePreview: 'Live Preview',
      description: 'Template Description',
      keyFeatures: 'Key Features',
      choosePlan: 'Choose Your Plan',
      buyNow: 'Buy Now',
      monthly: 'Monthly',
      yearly: 'Yearly',
      lifetime: 'Lifetime',
    },
    auth: {
      login: 'Login',
      register: 'Create Account',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginBtn: 'Sign In',
      registerBtn: 'Register Now',
      orContinueWith: 'Or continue with',
      welcomeBack: 'Welcome Back!',
      createAccount: 'Create Your Free Account',
    },
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
    document.documentElement.dir = lang === 'ar' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang === 'ar' ? 'en' : 'ar';
  }, [lang]);

  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
