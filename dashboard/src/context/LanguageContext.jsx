// src/context/LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// اللغات المدعومة
const languages = {
  ar: {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦'
  },
  en: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    flag: '🇺🇸'
  }
};

// النصوص المترجمة
const translations = {
  ar: {
    // عام
    dashboard: 'لوحة التحكم',
    products: 'المنتجات',
    users: 'المستخدمون',
    analytics: 'التقارير',
    orders: 'الطلبات',
    sources: 'المصادر',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    profile: 'الملف الشخصي',
    help: 'المساعدة',
    
    // الوضع الداكن/فاتح
    switchToDark: 'تفعيل الوضع الداكن',
    switchToLight: 'تفعيل الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    
    // الهيدر
    searchPlaceholder: 'ابحث عن منتج، عميل، طلب...',
    new: 'جديد',
    notifications: 'الإشعارات',
    markAllAsRead: 'تعيين الكل كمقروء',
    viewAllNotifications: 'عرض جميع الإشعارات',
    noNotifications: 'لا توجد إشعارات جديدة',
    createNew: 'إنشاء جديد',
    newProduct: 'منتج جديد',
    addNewProduct: 'أضف منتجاً رقمياً جديداً',
    newCustomer: 'عميل جديد',
    addNewCustomer: 'أضف عميلاً جديداً',
    newCampaign: 'عرض ترويجي',
    createCampaign: 'أنشئ عرضاً ترويجياً',
    
    // إشعارات
    newOrder: 'طلب جديد',
    newReview: 'تقييم جديد',
    systemUpdate: 'تحديث النظام',
    newOrderMessage: 'تم تقديم طلب جديد #2026-001',
    newReviewMessage: 'أضاف عميل جديد تقييماً لمنتجك',
    systemUpdateMessage: 'التحديث 3.0.0 متوفر الآن',
    createdProduct: 'قام بإنشاء منتج جديد',
    updatedOrder: 'قامت بتحديث الطلب',
    receivedPayment: 'تم استلام دفعة ناجحة',
    addedReview: 'أضاف تقييماً جديداً',
    
    // توقيت
    sales: 'مبيعات',
    fiveMinutesAgo: 'منذ 5 دقائق',
    fifteenMinutesAgo: 'منذ 15 دقيقة',
    oneHourAgo: 'منذ ساعة',
    threeHoursAgo: 'منذ 3 ساعات',
    oneDayAgo: 'منذ يوم',
    
    // القائمة الجانبية
    brandName: 'نيكسيرو فلكس',
    brandSubtitle: 'لوحة الإدارة',
    adminPanel: 'لوحة الإدارة',
    allProducts: 'جميع المنتجات',
    categories: 'التصنيفات',
    features: 'المميزات',
    addons: 'الإضافات',
    allUsers: 'جميع العملاء',
    companies: 'الشركات',
    admins: 'المشرفين',
    blog: 'المدونة',
    pages: 'الصفحات',
    comments: 'التعليقات',
    offers: 'العروض',
    newsletters: 'النشرات',
    coupons: 'الكوبونات',
    general: 'عام',
    themeSettings: 'المظهر',
    payment: 'الدفع',
    notificationsSettings: 'الإشعارات',
    needHelp: 'تحتاج مساعدة؟',
    weAreHere: 'نحن هنا لمساعدتك',
    contactSupport: 'تواصل مع الدعم',
    admin: 'المشرف العام',
    
    // الداشبورد
    welcomeBack: 'مرحباً بعودتك',
    storeOverview: 'إليك نظرة عامة على أداء متجرك',
    totalRevenue: 'إجمالي الإيرادات',
    totalOrders: 'إجمالي الطلبات',
    activeUsers: 'المستخدمون النشطون',
    conversionRate: 'معدل التحويل',
    comparedToPreviousPeriod: 'مقارنة بالفترة الماضية',
    salesPerformance: 'أداء المبيعات',
    bestSellingProducts: 'المنتجات الأكثر مبيعاً',
    viewAll: 'عرض الكل',
    recentOrders: 'الطلبات الأخيرة',
    latestActivities: 'أحدث الأنشطة',
    systemPerformance: 'أداء النظام',
    allSystemsWorking: 'جميع الأنظمة تعمل بشكل مثالي',
    noTechnicalIssues: 'لا توجد مشكلات تقنية',
    status: 'الحالة',
    excellent: 'ممتازة',
    reviews: 'التقييمات',
    customerRating: 'متوسط تقييم العملاء',
    increaseFromLastMonth: 'زيادة عن الشهر الماضي',
    marketingCampaigns: 'حملات تسويقية',
    activeCampaigns: 'هناك 3 حملات نشطة حالياً',
    lastCampaignVisitors: 'آخر حملة حققت 2,340 زائراً',
    conversionRateTitle: 'نسبة تحويل',
    
    // تسجيل الدخول
    welcome: 'مرحباً بعودتك',
    manageDigitalServices: 'سجل دخولك لإدارة خدماتك الرقمية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signingIn: 'جاري تسجيل الدخول...',
    orSignInWith: 'أو سجل دخول بواسطة',
    noAccount: 'ليس لديك حساب؟',
    createNewAccount: 'أنشئ حساب جديد',
  },
  
  en: {
    // General
    dashboard: 'Dashboard',
    products: 'Products',
    users: 'Users',
    analytics: 'Analytics',
    orders: 'Orders',
    sources: 'Sources',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    profile: 'Profile',
    help: 'Help',
    
    // Dark/Light Mode
    switchToDark: 'Switch to Dark Mode',
    switchToLight: 'Switch to Light Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    
    // Header
    searchPlaceholder: 'Search for product, customer, order...',
    new: 'New',
    notifications: 'Notifications',
    markAllAsRead: 'Mark all as read',
    viewAllNotifications: 'View all notifications',
    noNotifications: 'No new notifications',
    createNew: 'Create New',
    newProduct: 'New Product',
    addNewProduct: 'Add new digital product',
    newCustomer: 'New Customer',
    addNewCustomer: 'Add new customer',
    newCampaign: 'Promotional Campaign',
    createCampaign: 'Create promotional campaign',
    
    // Notifications
    newOrder: 'New Order',
    newReview: 'New Review',
    systemUpdate: 'System Update',
    newOrderMessage: 'New order submitted #2026-001',
    newReviewMessage: 'A customer added a review to your product',
    systemUpdateMessage: 'Update 3.0.0 is now available',
    createdProduct: 'Created a new product',
    updatedOrder: 'Updated the order',
    receivedPayment: 'Received successful payment',
    addedReview: 'Added a new review',
    
    // Time
    sales: 'sales',
    fiveMinutesAgo: '5 minutes ago',
    fifteenMinutesAgo: '15 minutes ago',
    oneHourAgo: '1 hour ago',
    threeHoursAgo: '3 hours ago',
    oneDayAgo: '1 day ago',
    
    // Sidebar
    brandName: 'Nexiro Flux',
    brandSubtitle: 'Admin Panel',
    adminPanel: 'Admin Panel',
    allProducts: 'All Products',
    categories: 'Categories',
    features: 'Features',
    addons: 'Addons',
    allUsers: 'All Customers',
    companies: 'Companies',
    admins: 'Admins',
    blog: 'Blog',
    pages: 'Pages',
    comments: 'Comments',
    offers: 'Offers',
    newsletters: 'Newsletters',
    coupons: 'Coupons',
    general: 'General',
    themeSettings: 'Theme',
    payment: 'Payment',
    notificationsSettings: 'Notifications',
    needHelp: 'Need help?',
    weAreHere: 'We are here to help',
    contactSupport: 'Contact Support',
    admin: 'Admin',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    storeOverview: 'Here is an overview of your store performance',
    totalRevenue: 'Total Revenue',
    totalOrders: 'Total Orders',
    activeUsers: 'Active Users',
    conversionRate: 'Conversion Rate',
    comparedToPreviousPeriod: 'Compared to previous period',
    salesPerformance: 'Sales Performance',
    bestSellingProducts: 'Best Selling Products',
    viewAll: 'View All',
    recentOrders: 'Recent Orders',
    latestActivities: 'Latest Activities',
    systemPerformance: 'System Performance',
    allSystemsWorking: 'All systems are working perfectly',
    noTechnicalIssues: 'No technical issues',
    status: 'Status',
    excellent: 'Excellent',
    reviews: 'Reviews',
    customerRating: 'Average customer rating',
    increaseFromLastMonth: 'Increase from last month',
    marketingCampaigns: 'Marketing Campaigns',
    activeCampaigns: 'There are 3 active campaigns currently',
    lastCampaignVisitors: 'Last campaign achieved 2,340 visitors',
    conversionRateTitle: 'Conversion Rate',
    
    // Login
    welcome: 'Welcome Back',
    manageDigitalServices: 'Sign in to manage your digital services',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    orSignInWith: 'Or sign in with',
    noAccount: "Don't have an account?",
    createNewAccount: 'Create new account',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved && languages[saved] ? saved : 'ar';
  });
  
  const [dir, setDir] = useState(languages[language].dir);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // التحقق من تفضيلات النظام أولاً
    if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return savedTheme || 'light';
  });
  
  useEffect(() => {
    // تحديث اتجاه النص عند تغيير اللغة
    setDir(languages[language].dir);
    
    // حفظ التفضيلات
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
    
    // تحديث اتجاه الصفحة
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // تطبيق الوضع المظلم/فاتح
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // إضافة فئة إلى body
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    
  }, [language, dir, theme]);
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  const currentLanguage = languages[language];
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      dir, 
      currentLanguage, 
      theme,
      toggleLanguage, 
      toggleTheme,
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);