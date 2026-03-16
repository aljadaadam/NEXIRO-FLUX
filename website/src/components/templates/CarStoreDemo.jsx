import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ShoppingCart, Car,
  Users, Package, Shield, Headphones, Zap, Star,
  CreditCard, Globe, CheckCircle,
  BarChart3, Sparkles, ArrowUpRight, BadgeCheck, Clock, Gift, Palette,
  MapPin, Fuel, Gauge, Settings2, CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates } from '../../data/templates';
import api from '../../services/api';
import ReservationModal from '../common/ReservationModal';

export default function CarStoreDemo() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [showReservation, setShowReservation] = useState(false);

  const staticT = staticTemplates.find(tp => tp.id === 'car-dealership-store');
  const [basePrice, setBasePrice] = useState(staticT?.price?.monthly || 39.9);
  const [yearlyPrice, setYearlyPrice] = useState(staticT?.price?.yearly || 399);
  const [lifetimePrice, setLifetimePrice] = useState(staticT?.price?.lifetime || 997.5);

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
    { icon: Car, label: isRTL ? 'عرض سيارات جديدة ومستعملة' : 'New & Used Car Listings' },
    { icon: Gauge, label: isRTL ? 'موديلات وأسعار ومواصفات كاملة' : 'Models, Prices & Full Specs' },
    { icon: MapPin, label: isRTL ? 'فروع ومواقع مع خرائط' : 'Branches & Locations with Maps' },
    { icon: CreditCard, label: isRTL ? 'نظام حجز سيارات' : 'Car Booking System' },
    { icon: Palette, label: isRTL ? '6 ثيمات سيارات احترافية' : '6 Car-Themed Color Palettes' },
    { icon: BarChart3, label: isRTL ? 'لوحة تحكم إدارية شاملة' : 'Full Admin Dashboard' },
    { icon: Sparkles, label: isRTL ? '20+ أنيميشن وتأثيرات متحركة' : '20+ Animations & Effects' },
    { icon: Globe, label: isRTL ? 'دعم كامل RTL عربي/إنجليزي' : 'Full RTL Arabic/English Support' },
    { icon: Settings2, label: isRTL ? 'تخصيص كامل من لوحة التحكم' : 'Full Customization from Dashboard' },
    { icon: Zap, label: isRTL ? 'أداء فائق السرعة' : 'Blazing Fast Performance' },
  ];

  const carBrands = [
    { icon: '🏎️', name: isRTL ? 'مرسيدس' : 'Mercedes', color: '#1a1a2e' },
    { icon: '🚗', name: isRTL ? 'بي إم دبليو' : 'BMW', color: '#0066b1' },
    { icon: '⚡', name: isRTL ? 'أودي' : 'Audi', color: '#bb0a30' },
    { icon: '🚙', name: isRTL ? 'تويوتا' : 'Toyota', color: '#eb0a1e' },
    { icon: '🏁', name: isRTL ? 'بورشه' : 'Porsche', color: '#a5332b' },
    { icon: '🛻', name: isRTL ? 'رينج روفر' : 'Range Rover', color: '#005a2b' },
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

        {/* Hero */}
        <div className="mb-12 tpl-entrance tpl-d2">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200">
              🚗 {isRTL ? 'جديد' : 'New'}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200">
              Next.js 15
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
              {isRTL ? '✨ 20+ أنيميشن' : '✨ 20+ Animations'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-dark-800 mb-3">
            {isRTL ? 'معرض سيارات' : 'Car Dealership Store'}
          </h1>
          <p className="text-dark-500 text-lg max-w-2xl">
            {isRTL
              ? 'قالب معرض سيارات احترافي مبني بـ Next.js 15 — لبيع السيارات الجديدة والمستعملة مع عرض الموديلات والأسعار والفروع، تصميم فريد مع 20+ أنيميشن وتأثيرات متحركة.'
              : 'Professional car dealership template built with Next.js 15 — for selling new & used cars with models, prices, branches, unique design with 20+ animations and dynamic effects.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Car Brands */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d3">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? '🏎️ الماركات المدعومة' : '🏎️ Supported Brands'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {carBrands.map((brand, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200"
                    style={{ background: `${brand.color}15` }}
                  >
                    <span className="text-2xl">{brand.icon}</span>
                    <span className="text-dark-800 text-sm font-bold">{brand.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Demo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tpl-entrance tpl-d4">
              {/* Store Demo Card */}
              <a
                href="/demo/car-store"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-red-500 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-red-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح المعرض' : 'Browse Showroom'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'جرّب معرض السيارات بالكامل — تصفح السيارات، احجز، واستعرض الفروع' : 'Experience the full showroom — browse cars, book, and explore branches'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>

              {/* Dashboard Demo Card */}
              <a
                href="/demo/car-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-amber-500 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-amber-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح لوحة التحكم' : 'Browse Dashboard'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'لوحة تحكم شاملة — سيارات، طلبات، فروع، عملاء، تخصيص' : 'Full dashboard — cars, orders, branches, customers, customization'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-amber-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>
            </div>

            {/* What's Included */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d5">
              <h3 className="text-xl font-bold text-dark-800 mb-2">
                {isRTL ? 'ماذا يتضمن القالب؟' : "What's Included?"}
              </h3>
              <p className="text-dark-500 text-sm mb-6">
                {isRTL ? 'كل ما تحتاجه لإطلاق معرض سيارات احترافي' : 'Everything you need to launch a professional car dealership'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🏠', name: isRTL ? 'صفحة رئيسية مع هيرو متحرك' : 'Home Page with Animated Hero' },
                  { icon: '🚗', name: isRTL ? 'كتالوج سيارات مع فلاتر وبحث' : 'Car Catalog with Filters & Search' },
                  { icon: '📍', name: isRTL ? 'صفحة الفروع والمواقع' : 'Branches & Locations Page' },
                  { icon: '📞', name: isRTL ? 'صفحة تواصل + واتساب' : 'Contact Page + WhatsApp' },
                  { icon: '📊', name: isRTL ? 'لوحة تحكم إدارية (7 صفحات)' : 'Admin Dashboard (7 Pages)' },
                  { icon: '🚙', name: isRTL ? 'إدارة السيارات (CRUD)' : 'Car Management (CRUD)' },
                  { icon: '📋', name: isRTL ? 'إدارة الطلبات والحجوزات' : 'Orders & Bookings Management' },
                  { icon: '👥', name: isRTL ? 'إدارة العملاء' : 'Customer Management' },
                  { icon: '📍', name: isRTL ? 'إدارة الفروع' : 'Branch Management' },
                  { icon: '🎨', name: isRTL ? 'تخصيص الواجهة والثيمات' : 'UI & Theme Customization' },
                  { icon: '⚙️', name: isRTL ? 'إعدادات المتجر' : 'Store Settings' },
                  { icon: '🔐', name: isRTL ? 'تسجيل دخول آمن' : 'Secure Login' },
                ].map((page, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-lg">{page.icon}</span>
                    <span className="text-dark-600 text-sm">{page.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unique Features */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d6">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? '✨ مميزات حصرية' : '✨ Exclusive Features'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <Car className="w-8 h-8 text-red-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? 'جديد ومستعمل' : 'New & Used'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'دعم عرض السيارات الجديدة والمستعملة مع فلترة حسب الحالة' : 'Support for new & used cars with condition-based filtering'}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Sparkles className="w-8 h-8 text-amber-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? '20+ أنيميشن' : '20+ Animations'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'تأثيرات متحركة فريدة: سبيد لاين، نيون، جلاسمورفيزم، ماركي' : 'Unique effects: speed lines, neon, glassmorphism, marquee'}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <MapPin className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? 'فروع ومواقع' : 'Branches & Maps'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'عرض الفرع الرئيسي والفروع مع روابط خرائط جوجل' : 'Main branch & sub-branches with Google Maps links'}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <Palette className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? '6 ثيمات سيارات' : '6 Car Themes'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'منتصف الليل، قرمزي، ملكي، كربون، ذهبي، زمردي' : 'Midnight, Crimson, Royal, Carbon, Gold, Emerald'}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d7">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'التقنيات المستخدمة' : 'Tech Stack'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'TypeScript', 'CSS-in-JS (Zero CSS Files)', 'Lucide Icons', 'Custom Themes Engine', '20+ CSS Animations', 'Port 4003'].map(tech => (
                  <span key={tech} className="px-4 py-2 rounded-xl bg-gray-50 text-dark-600 text-sm font-medium border border-gray-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d8">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'وصف القالب' : 'Template Description'}
              </h3>
              <p className="text-dark-500 leading-relaxed text-lg">
                {isRTL
                  ? 'قالب معرض سيارات احترافي مبني بـ Next.js 15 و TypeScript. مصمم خصيصاً لمعارض السيارات ووكالات بيع السيارات الجديدة والمستعملة. يتميز بتصميم فريد مع أكثر من 20 تأثير أنيميشن متحرك، هيرو مع جزيئات وخطوط سباق، ماركي ماركات، بطاقات سيارات مع تأثيرات هوفر، موديل حجز، وصفحة فروع مع روابط خرائط. يتضمن لوحة تحكم إدارية شاملة مع 7 صفحات و6 ثيمات ألوان مستوحاة من عالم السيارات.'
                  : 'Professional car dealership template built with Next.js 15 and TypeScript. Designed specifically for car showrooms and dealerships selling new and used cars. Features a unique design with 20+ animated effects, hero with particles and speed lines, brand marquee, car cards with hover effects, booking modal, and branches page with map links. Includes a comprehensive admin dashboard with 7 pages and 6 car-inspired color themes.'
                }
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 tpl-entrance tpl-d4">
            <div className="sticky top-28 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
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

                <div className="space-y-2 mb-6">
                  {Object.entries(prices).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setBillingCycle(key)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        billingCycle === key
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === key ? 'border-red-500 bg-red-500' : 'border-gray-300'
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

                <button
                  onClick={() => navigate(`/buy?template=car-dealership-store&plan=${billingCycle}`)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-bold text-base transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {isRTL ? 'اشترِ الآن' : 'Buy Now'} — ${prices[billingCycle].price}
                  </div>
                </button>

                {/* Reservation Button */}
                <button
                  onClick={() => setShowReservation(true)}
                  className="w-full py-3 rounded-xl border-2 border-red-500 hover:border-red-600 text-red-600 hover:text-red-700 font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 mt-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    {isRTL ? 'احجز الآن' : 'Book Now'}
                  </div>
                </button>

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

              {/* Package Includes */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-dark-800 mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-red-500" />
                  {isRTL ? 'يشمل الباقة' : 'Package Includes'}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    isRTL ? 'استضافة سحابية مُدارة' : 'Managed Cloud Hosting',
                    isRTL ? 'إعداد تلقائي فوري' : 'Instant Auto Setup',
                    isRTL ? 'تحديثات مجانية مستمرة' : 'Continuous Free Updates',
                    isRTL ? 'دعم فني على مدار الساعة' : '24/7 Technical Support',
                    isRTL ? 'لوحة تحكم شاملة (7 صفحات)' : 'Full Dashboard (7 Pages)',
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
                  <Sparkles className="w-4 h-4 text-red-500" />
                  {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
                </h3>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-dark-600">
                        <Icon className="w-4 h-4 text-red-500 flex-shrink-0" />
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
                  {isRTL ? '5.0 من 5 — جديد' : '5.0 out of 5 — New'}
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
      templateId="car-dealership-store"
      templateName={isRTL ? staticT?.name : staticT?.nameEn}
    />
    </>
  );
}
