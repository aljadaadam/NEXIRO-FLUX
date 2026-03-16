import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ShoppingCart, 
  Users, Package, Wallet, Shield, Headphones, Zap, Star,
  CreditCard, TrendingUp, Globe, CheckCircle,
  ShoppingBag, BarChart3, Sparkles, ArrowUpRight, BadgeCheck, Clock, Gift, CalendarCheck,
  Heart, Eye, UserPlus, MessageCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates } from '../../data/templates';
import api from '../../services/api';
import ReservationModal from '../common/ReservationModal';

export default function SmmStoreDemo() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [showReservation, setShowReservation] = useState(false);

  // Fetch real price from database
  const staticT = staticTemplates.find(tp => tp.id === 'smm-store');
  const [basePrice, setBasePrice] = useState(staticT?.price?.monthly || 14.9);
  const [yearlyPrice, setYearlyPrice] = useState(staticT?.price?.yearly || 149);
  const [lifetimePrice, setLifetimePrice] = useState(staticT?.price?.lifetime || 499.9);

  useEffect(() => {
    api.getPublicProducts()
      .then(res => {
        const apiByName = new Map((res.products || []).map(p => [p.name?.trim(), p]));
        const live = staticT ? apiByName.get(staticT.name?.trim()) : null;
        if (live) {
          const p = parseFloat(live.price);
          if (p > 0) setBasePrice(p);
          const py = live.price_yearly != null ? parseFloat(live.price_yearly) : (p > 0 ? p * 10 : null);
          const pl = live.price_lifetime != null ? parseFloat(live.price_lifetime) : (p > 0 ? p * 25 : null);
          if (py > 0) setYearlyPrice(py);
          if (pl > 0) setLifetimePrice(pl);
        }
      })
      .catch(() => {});
  }, []);

  const prices = {
    monthly: { price: basePrice, suffix: isRTL ? '/شهر' : '/mo', label: isRTL ? 'شهري' : 'Monthly', save: null },
    yearly: { price: yearlyPrice, suffix: isRTL ? '/سنة' : '/yr', label: isRTL ? 'سنوي' : 'Yearly', save: isRTL ? 'وفّر 17%' : 'Save 17%' },
    lifetime: { price: lifetimePrice, suffix: '', label: isRTL ? 'مدى الحياة' : 'Lifetime', save: isRTL ? 'أفضل قيمة' : 'Best Value' },
  };

  const features = [
    { icon: UserPlus, label: isRTL ? 'خدمات متابعين لجميع المنصات' : 'Followers for All Platforms' },
    { icon: Heart, label: isRTL ? 'إعجابات وتفاعلات' : 'Likes & Engagement' },
    { icon: Eye, label: isRTL ? 'مشاهدات ومرات ظهور' : 'Views & Impressions' },
    { icon: MessageCircle, label: isRTL ? 'تعليقات ومشاركات' : 'Comments & Shares' },
    { icon: Wallet, label: isRTL ? 'محفظة إلكترونية' : 'E-Wallet System' },
    { icon: CreditCard, label: isRTL ? 'بوابات دفع متعددة' : 'Multiple Payment Gateways' },
    { icon: Users, label: isRTL ? 'إدارة مستخدمين' : 'User Management' },
    { icon: BarChart3, label: isRTL ? 'لوحة تحكم إدارية' : 'Admin Dashboard' },
    { icon: Globe, label: isRTL ? 'دعم كامل RTL' : 'Full RTL Support' },
    { icon: Zap, label: isRTL ? 'API متكامل لمزودي الخدمة' : 'Full Provider API Integration' },
  ];

  const platforms = [
    { name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
    { name: 'TikTok', icon: '🎵', color: 'from-gray-800 to-pink-500' },
    { name: 'YouTube', icon: '▶️', color: 'from-red-500 to-red-600' },
    { name: 'Twitter / X', icon: '𝕏', color: 'from-gray-700 to-gray-900' },
    { name: 'Facebook', icon: '📘', color: 'from-blue-500 to-blue-600' },
    { name: 'Telegram', icon: '✈️', color: 'from-sky-400 to-blue-500' },
    { name: 'Snapchat', icon: '👻', color: 'from-yellow-400 to-yellow-500' },
    { name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-800' },
  ];

  return (
    <>
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 text-dark-500 hover:text-dark-800 mb-8 transition-colors group tpl-entrance tpl-d1"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          {isRTL ? 'العودة للقوالب' : 'Back to Templates'}
        </Link>

        {/* Hero Section */}
        <div className="mb-12 tpl-entrance tpl-d2">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold border border-pink-200">
              📱 {isRTL ? 'جديد' : 'New'}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold border border-primary-200">
              Next.js 15
            </span>
            <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-bold border border-violet-200">
              {isRTL ? '📊 SMM Panel' : '📊 SMM Panel'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-dark-800 mb-3">
            {isRTL ? 'متجر خدمات سوشيال ميديا' : 'SMM Services Store'}
          </h1>
          <p className="text-dark-500 text-lg max-w-2xl">
            {isRTL 
              ? 'قالب متجر SMM احترافي لبيع خدمات المتابعين والإعجابات والمشاهدات على جميع منصات التواصل الاجتماعي — مع لوحة تحكم شاملة و API متكامل.'
              : 'Professional SMM store template for selling followers, likes & views on all social media platforms — with full admin dashboard & API integration.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* Live Demo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tpl-entrance tpl-d3">
              {/* Store Demo Card */}
              <a
                href="/demo/smm-store"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-pink-500 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-pink-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح المتجر' : 'Browse Store'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'جرّب المتجر بالكامل — تصفح الخدمات، اطلب متابعين وإعجابات' : 'Experience the full store — browse services, order followers & likes'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>

              {/* Dashboard Demo Card */}
              <a
                href="/demo/smm-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-violet-500 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-violet-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح لوحة التحكم' : 'Browse Dashboard'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'لوحة إدارية شاملة — خدمات، طلبات، مزودين، إحصائيات' : 'Full admin panel — services, orders, providers, analytics'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-violet-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>
            </div>

            {/* Supported Platforms */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d4">
              <h3 className="text-xl font-bold text-dark-800 mb-2">
                {isRTL ? 'المنصات المدعومة' : 'Supported Platforms'}
              </h3>
              <p className="text-dark-500 text-sm mb-6">
                {isRTL ? 'خدمات متابعين وإعجابات ومشاهدات لجميع منصات التواصل' : 'Followers, likes & views for all social media platforms'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {platforms.map((platform, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-pink-300 transition-all group">
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-dark-600 text-sm font-medium group-hover:text-dark-800 transition-colors">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d5">
              <h3 className="text-xl font-bold text-dark-800 mb-2">
                {isRTL ? 'ماذا يتضمن القالب؟' : "What's Included?"}
              </h3>
              <p className="text-dark-500 text-sm mb-6">
                {isRTL ? 'كل ما تحتاجه لإطلاق متجر خدمات سوشيال ميديا الخاص بك' : 'Everything you need to launch your SMM services store'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🏠', name: isRTL ? 'الصفحة الرئيسية' : 'Home Page' },
                  { icon: '📱', name: isRTL ? 'كتالوج الخدمات' : 'Services Catalog' },
                  { icon: '📋', name: isRTL ? 'سجل الطلبات' : 'Orders History' },
                  { icon: '👤', name: isRTL ? 'الملف الشخصي' : 'Profile Page' },
                  { icon: '💰', name: isRTL ? 'شحن المحفظة' : 'Wallet Top-up' },
                  { icon: '🔐', name: isRTL ? 'تسجيل دخول / تسجيل' : 'Login / Register' },
                  { icon: '📝', name: isRTL ? 'المدونة' : 'Blog' },
                  { icon: '❓', name: isRTL ? 'الأسئلة الشائعة' : 'FAQ' },
                  { icon: '📊', name: isRTL ? 'لوحة التحكم' : 'Admin Dashboard' },
                  { icon: '📦', name: isRTL ? 'إدارة المنتجات' : 'Product Management' },
                  { icon: '👥', name: isRTL ? 'إدارة المستخدمين' : 'User Management' },
                  { icon: '🔌', name: isRTL ? 'إدارة مزودي الخدمة' : 'Source Providers' },
                  { icon: '💬', name: isRTL ? 'الدردشة المباشرة' : 'Live Chat' },
                  { icon: '📢', name: isRTL ? 'الإعلانات والبث' : 'Announcements & Broadcast' },
                  { icon: '🎨', name: isRTL ? 'تخصيص المتجر' : 'Store Customization' },
                  { icon: '⚙️', name: isRTL ? 'إعدادات الدفع' : 'Payment Settings' },
                ].map((page, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-lg">{page.icon}</span>
                    <span className="text-dark-600 text-sm">{page.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d6">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'التقنيات المستخدمة' : 'Tech Stack'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST API', 'RTL Support'].map(tech => (
                  <span key={tech} className="px-4 py-2 rounded-xl bg-gray-50 text-dark-600 text-sm font-medium border border-gray-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d7">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'وصف القالب' : 'Template Description'}
              </h3>
              <p className="text-dark-500 leading-relaxed text-lg">
                {isRTL 
                  ? 'قالب متجر SMM احترافي متكامل مبني بتقنية Next.js 15 مع TypeScript. مصمم لبيع خدمات السوشيال ميديا مثل المتابعين والإعجابات والمشاهدات لجميع المنصات (إنستغرام، تيك توك، يوتيوب، تويتر، فيسبوك، تليجرام، سناب شات، لينكدإن). يتضمن لوحة تحكم إدارية متقدمة، نظام ربط API مع مزودي الخدمة (مثل DHRU)، محفظة إلكترونية، بوابات دفع متعددة، ودردشة مباشرة.'
                  : 'A complete professional SMM store template built with Next.js 15 and TypeScript. Designed for selling social media services like followers, likes & views on all platforms (Instagram, TikTok, YouTube, Twitter, Facebook, Telegram, Snapchat, LinkedIn). Includes advanced admin dashboard, provider API integration (e.g. DHRU), e-wallet, multiple payment gateways, and live chat.'
                }
              </p>
            </div>
          </div>

          {/* Sidebar - Purchase Panel */}
          <div className="lg:col-span-1 tpl-entrance tpl-d4">
            <div className="sticky top-28 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                {/* Price Display */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-display font-black text-dark-800 mb-1">
                    ${prices[billingCycle].price}
                  </div>
                  <p className="text-dark-500 text-sm">
                    {prices[billingCycle].label}
                    {billingCycle === 'lifetime' && (isRTL ? ' — دفعة واحدة' : ' — one-time')}
                    {billingCycle !== 'lifetime' && prices[billingCycle].suffix}
                  </p>
                </div>

                {/* Billing Toggle */}
                <div className="space-y-2 mb-6">
                  {Object.entries(prices).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setBillingCycle(key)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        billingCycle === key
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === key ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                        }`}>
                          {billingCycle === key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-dark-700 font-medium text-sm">{data.label}</span>
                        {data.save && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
                            {data.save}
                          </span>
                        )}
                      </div>
                      <span className="font-display font-bold text-dark-800 text-sm">
                        ${data.price}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => navigate(`/buy?template=smm-store&plan=${billingCycle}`)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-bold text-base transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {isRTL ? 'اشترِ الآن' : 'Buy Now'} — ${prices[billingCycle].price}
                  </div>
                </button>

                {/* Reservation Button */}
                <button
                  onClick={() => setShowReservation(true)}
                  className="w-full py-3 rounded-xl border-2 border-pink-500 hover:border-pink-600 text-pink-600 hover:text-pink-700 font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 mt-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    {isRTL ? 'احجز الآن' : 'Book Now'}
                  </div>
                </button>

                {/* Trust Badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-dark-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {isRTL ? 'دفع آمن' : 'Secure'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {isRTL ? 'تسليم فوري' : 'Instant'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    {isRTL ? 'تحديثات مجانية' : 'Free Updates'}
                  </span>
                </div>
              </div>

              {/* What You Get */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-pink-500" />
                  {isRTL ? 'يشمل الباقة' : 'Package Includes'}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    isRTL ? 'استضافة سحابية مُدارة' : 'Managed Cloud Hosting',
                    isRTL ? 'إعداد تلقائي فوري' : 'Instant Auto Setup',
                    isRTL ? 'تحديثات مجانية مستمرة' : 'Continuous Free Updates',
                    isRTL ? 'دعم فني على مدار الساعة' : '24/7 Technical Support',
                    isRTL ? 'لوحة تحكم إدارية' : 'Admin Dashboard',
                    isRTL ? 'شهادة SSL مجانية' : 'Free SSL Certificate',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-dark-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
                </h3>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-dark-600">
                        <Icon className="w-4 h-4 text-pink-500 flex-shrink-0" />
                        <span className="text-sm">{feature.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Rating */}
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-500 text-sm">
                  {isRTL ? '4.8 من 5 — 89 تقييم' : '4.8 out of 5 — 89 reviews'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Reservation Modal */}
    <ReservationModal
      isOpen={showReservation}
      onClose={() => setShowReservation(false)}
      templateId="smm-store"
      templateName={isRTL ? staticT?.name : staticT?.nameEn}
    />
    </>
  );
}
