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
    tutorials: {
      badge: '📚 شروحات ودروس تعليمية',
      title: 'تعلّم وانطلق نحو النجاح',
      subtitle: 'دليلك الشامل لبناء متجرك الإلكتروني وإدارة أعمالك الرقمية باحترافية. شروحات مفصّلة خطوة بخطوة لتحقيق أفضل النتائج.',
      readMore: 'اقرأ المزيد',
      seoTitle: 'كل ما تحتاج لبناء متجرك الإلكتروني الناجح',
      seoText1: 'نوفّر لك شروحات شاملة حول إنشاء متجر إلكتروني احترافي، تصميم واجهة مستخدم جذابة، تحسين محركات البحث SEO، إدارة المنتجات والطلبات، وربط بوابات الدفع الإلكتروني. سواء كنت مبتدئاً أو محترفاً، ستجد كل ما تحتاجه لإطلاق مشروعك الرقمي الناجح.',
      seoText2: 'NEXIRO-FLUX يقدم لك أفضل حلول التجارة الإلكترونية مع قوالب جاهزة، لوحة تحكم متكاملة، ودعم فني على مدار الساعة. ابدأ بناء متجرك الإلكتروني اليوم واستفد من أحدث التقنيات في عالم التجارة الرقمية.',
      items: {
        ecommerce: {
          title: 'كيف تنشئ متجرك الإلكتروني من الصفر في 2026',
          desc: 'دليل شامل لإنشاء متجر إلكتروني احترافي خطوة بخطوة. تعلّم كيف تختار المنصة المناسبة، تضيف المنتجات، وتبدأ البيع أونلاين.',
          tags: 'متجر إلكتروني,التجارة الإلكترونية,بيع أونلاين',
          readTime: '8 دقائق قراءة',
        },
        seo: {
          title: 'أسرار تحسين محركات البحث SEO لمتجرك',
          desc: 'اكتشف أفضل استراتيجيات SEO لتصدّر نتائج بحث جوجل. تعلّم تحسين الكلمات المفتاحية، بناء الروابط، وتسريع موقعك.',
          tags: 'SEO,تحسين محركات البحث,جوجل',
          readTime: '6 دقائق قراءة',
        },
        design: {
          title: 'أفضل ممارسات تصميم واجهة المتجر الإلكتروني',
          desc: 'تعلّم كيف تصمم واجهة متجر جذابة تزيد المبيعات. نصائح احترافية في UI/UX وتجربة المستخدم.',
          tags: 'تصميم,UI/UX,واجهة المستخدم',
          readTime: '5 دقائق قراءة',
        },
        domain: {
          title: 'دليل اختيار اسم النطاق والاستضافة المثالية',
          desc: 'كيف تختار اسم نطاق مميز واستضافة موثوقة لمتجرك؟ مقارنة شاملة بين أفضل مقدمي الخدمات.',
          tags: 'نطاق,استضافة,دومين',
          readTime: '4 دقائق قراءة',
        },
        manage: {
          title: 'إدارة الطلبات والمخزون باحترافية',
          desc: 'تعلّم كيف تدير طلبات العملاء، تتبع الشحنات، وتنظم مخزون منتجاتك بكفاءة عالية من لوحة تحكم واحدة.',
          tags: 'إدارة الطلبات,المخزون,لوحة التحكم',
          readTime: '7 دقائق قراءة',
        },
        marketing: {
          title: 'استراتيجيات التسويق الرقمي لزيادة المبيعات',
          desc: 'اكتشف أقوى طرق التسويق الإلكتروني: إعلانات مدفوعة، تسويق بالمحتوى، إيميل ماركتنج، والتسويق عبر وسائل التواصل.',
          tags: 'تسويق رقمي,إعلانات,وسائل التواصل',
          readTime: '9 دقائق قراءة',
        },
      },
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
    tutorials: {
      badge: '📚 Tutorials & Guides',
      title: 'Learn & Grow Your Business',
      subtitle: 'Your complete guide to building an online store and managing your digital business like a pro. Step-by-step tutorials to achieve the best results.',
      readMore: 'Read More',
      seoTitle: 'Everything You Need to Build a Successful Online Store',
      seoText1: 'We provide comprehensive tutorials on creating a professional e-commerce store, designing attractive user interfaces, search engine optimization (SEO), product and order management, and integrating payment gateways. Whether you are a beginner or a professional, you will find everything you need to launch your successful digital project.',
      seoText2: 'NEXIRO-FLUX offers the best e-commerce solutions with ready-made templates, an integrated dashboard, and 24/7 technical support. Start building your online store today and leverage the latest technologies in the digital commerce world.',
      items: {
        ecommerce: {
          title: 'How to Create Your Online Store from Scratch in 2026',
          desc: 'A complete guide to building a professional online store step by step. Learn how to choose the right platform, add products, and start selling online.',
          tags: 'Online Store,E-commerce,Sell Online',
          readTime: '8 min read',
        },
        seo: {
          title: 'SEO Secrets to Boost Your Store Rankings',
          desc: 'Discover the best SEO strategies to rank on Google. Learn keyword optimization, link building, and website speed improvements.',
          tags: 'SEO,Search Engine,Google',
          readTime: '6 min read',
        },
        design: {
          title: 'Best Practices for E-commerce Store Design',
          desc: 'Learn how to design an attractive storefront that increases sales. Professional tips on UI/UX and user experience.',
          tags: 'Design,UI/UX,User Interface',
          readTime: '5 min read',
        },
        domain: {
          title: 'Guide to Choosing the Perfect Domain & Hosting',
          desc: 'How to pick a memorable domain name and reliable hosting for your store? A comprehensive comparison of top service providers.',
          tags: 'Domain,Hosting,Web',
          readTime: '4 min read',
        },
        manage: {
          title: 'Managing Orders & Inventory Like a Pro',
          desc: 'Learn how to handle customer orders, track shipments, and organize your product inventory efficiently from a single dashboard.',
          tags: 'Order Management,Inventory,Dashboard',
          readTime: '7 min read',
        },
        marketing: {
          title: 'Digital Marketing Strategies to Boost Sales',
          desc: 'Discover powerful marketing methods: paid ads, content marketing, email marketing, and social media marketing techniques.',
          tags: 'Digital Marketing,Ads,Social Media',
          readTime: '9 min read',
        },
      },
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
