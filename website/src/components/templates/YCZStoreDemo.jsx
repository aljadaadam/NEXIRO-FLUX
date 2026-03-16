import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ShoppingCart, 
  Users, Package, Wallet, Shield, Headphones, Zap, Star,
  CreditCard, TrendingUp, Globe, CheckCircle,
  ShoppingBag, BarChart3, Sparkles, ArrowUpRight, BadgeCheck, Clock, Gift, CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates } from '../../data/templates';
import api from '../../services/api';
import ReservationModal from '../common/ReservationModal';

export default function YCZStoreDemo() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [showReservation, setShowReservation] = useState(false);

  // Fetch real price from database
  const staticT = staticTemplates.find(tp => tp.id === 'digital-services-store');
  const [basePrice, setBasePrice] = useState(staticT?.price?.monthly || 39);
  const [yearlyPrice, setYearlyPrice] = useState(staticT?.price?.yearly || 390);
  const [lifetimePrice, setLifetimePrice] = useState(staticT?.price?.lifetime || 975);

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
    yearly: { price: yearlyPrice, suffix: isRTL ? '/سنة' : '/yr', label: isRTL ? 'سنوي' : 'Yearly', save: isRTL ? 'وفّر 25%' : 'Save 25%' },
    lifetime: { price: lifetimePrice, suffix: '', label: isRTL ? 'مدى الحياة' : 'Lifetime', save: isRTL ? 'أفضل قيمة' : 'Best Value' },
  };

  const features = [
    { icon: ShoppingCart, label: isRTL ? 'نظام طلبات متكامل' : 'Full Order System' },
    { icon: Wallet, label: isRTL ? 'محفظة إلكترونية' : 'E-Wallet System' },
    { icon: CreditCard, label: isRTL ? 'بوابات دفع متعددة' : 'Multiple Payment Gateways' },
    { icon: Users, label: isRTL ? 'إدارة مستخدمين' : 'User Management' },
    { icon: Package, label: isRTL ? 'كتالوج منتجات' : 'Product Catalog' },
    { icon: Shield, label: isRTL ? 'نظام تحقق هوية' : 'Identity Verification' },
    { icon: BarChart3, label: isRTL ? 'لوحة تحكم إدارية' : 'Admin Dashboard' },
    { icon: Headphones, label: isRTL ? 'نظام تذاكر دعم' : 'Support Ticket System' },
    { icon: Globe, label: isRTL ? 'دعم كامل RTL' : 'Full RTL Support' },
    { icon: Zap, label: isRTL ? 'أداء فائق السرعة' : 'Blazing Fast Performance' },
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
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
              {isRTL ? '⭐ جديد' : '⭐ New'}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold border border-primary-200">
              Next.js 15
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold border border-yellow-200">
              {isRTL ? '🔥 الأكثر مبيعاً' : '🔥 Best Seller'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-dark-800 mb-3">
            {isRTL ? 'متجر خدمات رقمية' : 'Digital Services Store'}
          </h1>
          <p className="text-dark-500 text-lg max-w-2xl">
            {isRTL 
              ? 'قالب متجر إلكتروني احترافي متكامل مبني بتقنية Next.js 15 — مصمم خصيصاً للمتاجر العربية مع لوحة تحكم كاملة.'
              : 'A complete professional e-commerce template built with Next.js 15 — designed for Arabic stores with full admin dashboard.'
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
                href="/demo/ycz-store"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح المتجر' : 'Browse Store'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'جرّب المتجر بالكامل كما يراه الزبون — تصفح، طلبات، محفظة' : 'Experience the full store as a customer — browse, order, wallet'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>

              {/* Dashboard Demo Card */}
              <a
                href="/demo/ycz-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-blue-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح لوحة التحكم' : 'Browse Dashboard'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'لوحة إدارية كاملة — منتجات، طلبات، مستخدمين، إحصائيات' : 'Full admin panel — products, orders, users, analytics'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-blue-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>
            </div>

            {/* What's Included */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d4">
              <h3 className="text-xl font-bold text-dark-800 mb-2">
                {isRTL ? 'ماذا يتضمن القالب؟' : "What's Included?"}
              </h3>
              <p className="text-dark-500 text-sm mb-6">
                {isRTL ? 'كل ما تحتاجه لإطلاق متجرك الرقمي الاحترافي' : 'Everything you need to launch your professional digital store'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🏠', name: isRTL ? 'الصفحة الرئيسية' : 'Home Page' },
                  { icon: '🛍️', name: isRTL ? 'كتالوج الخدمات' : 'Services Catalog' },
                  { icon: '📋', name: isRTL ? 'سجل الطلبات' : 'Orders History' },
                  { icon: '👤', name: isRTL ? 'الملف الشخصي' : 'Profile Page' },
                  { icon: '💰', name: isRTL ? 'شحن المحفظة' : 'Wallet Top-up' },
                  { icon: '💳', name: isRTL ? 'صفحة الدفع' : 'Payment Page' },
                  { icon: '🎫', name: isRTL ? 'تذاكر الدعم' : 'Support Tickets' },
                  { icon: '📊', name: isRTL ? 'لوحة التحكم' : 'Admin Dashboard' },
                  { icon: '📦', name: isRTL ? 'إدارة المنتجات' : 'Product Management' },
                  { icon: '👥', name: isRTL ? 'إدارة المستخدمين' : 'User Management' },
                  { icon: '📢', name: isRTL ? 'الإعلانات' : 'Announcements' },
                  { icon: '⚙️', name: isRTL ? 'إعدادات الدفع' : 'Payment Settings' },
                ].map((page, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-lg">{page.icon}</span>
                    <span className="text-dark-600 text-sm font-medium">{page.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d5">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'التقنيات المستخدمة' : 'Tech Stack'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'NextAuth.js', 'CSS Custom'].map(tech => (
                  <span key={tech} className="px-4 py-2 rounded-xl bg-gray-50 text-dark-600 text-sm font-medium border border-gray-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d6">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'وصف القالب' : 'Template Description'}
              </h3>
              <p className="text-dark-500 leading-relaxed text-lg">
                {isRTL 
                  ? 'قالب متجر إلكتروني احترافي متكامل مبني بتقنية Next.js 15 مع TypeScript. مصمم خصيصاً للمتاجر العربية مع دعم كامل للـ RTL. يتضمن نظام طلبات، محفظة إلكترونية، بوابات دفع متعددة (Binance, PayPal, تحويل بنكي)، لوحة تحكم إدارية متقدمة، ونظام دعم فني بالتذاكر.'
                  : 'A complete professional e-commerce template built with Next.js 15 and TypeScript. Designed specifically for Arabic stores with full RTL support. Includes order system, e-wallet, multiple payment gateways (Binance, PayPal, Bank Transfer), advanced admin dashboard, and support ticket system.'
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
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === key ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
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
                  onClick={() => navigate(`/buy?template=digital-services-store&plan=${billingCycle}`)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold text-base transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {isRTL ? 'اشترِ الآن' : 'Buy Now'} — ${prices[billingCycle].price}
                  </div>
                </button>

                {/* Reservation Button */}
                <button
                  onClick={() => setShowReservation(true)}
                  className="w-full py-3 rounded-xl border-2 border-primary-500 hover:border-primary-600 text-primary-600 hover:text-primary-700 font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 mt-3"
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
                  <BadgeCheck className="w-4 h-4 text-primary-500" />
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
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
                </h3>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-dark-600">
                        <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
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
                  {isRTL ? '4.9 من 5 — 127 تقييم' : '4.9 out of 5 — 127 reviews'}
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
      templateId="digital-services-store"
      templateName={isRTL ? staticT?.name : staticT?.nameEn}
    />
    </>
  );
}
