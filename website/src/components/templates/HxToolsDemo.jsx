import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ShoppingCart, Wrench,
  Users, Package, Shield, Headphones, Zap, Star,
  CreditCard, Globe, CheckCircle,
  BarChart3, Sparkles, ArrowUpRight, BadgeCheck, Clock, Gift, Palette,
  Truck, MapPin, DollarSign, CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates } from '../../data/templates';
import api from '../../services/api';
import ReservationModal from '../common/ReservationModal';

export default function HxToolsDemo() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [showReservation, setShowReservation] = useState(false);

  const staticT = staticTemplates.find(tp => tp.id === 'hardware-tools-store');
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
    { icon: Wrench, label: isRTL ? 'بيع دونجلات وبوكسات وأدوات JTAG' : 'Dongles, Boxes & JTAG Tools Sales' },
    { icon: Truck, label: isRTL ? 'خدمة توصيل بالمناطق والدول' : 'Regional & Country Delivery Service' },
    { icon: DollarSign, label: isRTL ? 'عملات متعددة مع أسعار صرف' : 'Multi-Currency with Exchange Rates' },
    { icon: CreditCard, label: isRTL ? 'بوابات دفع متعددة' : 'Multiple Payment Gateways' },
    { icon: Package, label: isRTL ? 'كتالوج منتجات ديناميكي' : 'Dynamic Product Catalog' },
    { icon: Palette, label: isRTL ? '6 ثيمات احترافية' : '6 Professional Themes' },
    { icon: BarChart3, label: isRTL ? 'لوحة تحكم إدارية شاملة' : 'Full Admin Dashboard' },
    { icon: MapPin, label: isRTL ? 'إدارة مناطق التوصيل' : 'Delivery Zones Management' },
    { icon: Globe, label: isRTL ? 'دعم كامل RTL' : 'Full RTL Support' },
    { icon: Zap, label: isRTL ? 'أداء فائق السرعة' : 'Blazing Fast Performance' },
  ];

  const productCategories = [
    { icon: '🔑', name: isRTL ? 'دونجلات' : 'Dongles', color: '#3b82f6' },
    { icon: '📦', name: isRTL ? 'بوكسات' : 'Boxes', color: '#8b5cf6' },
    { icon: '⚡', name: isRTL ? 'JTAG' : 'JTAG Tools', color: '#f59e0b' },
    { icon: '🔥', name: isRTL ? 'أدوات لحام' : 'Soldering Tools', color: '#ef4444' },
    { icon: '🎯', name: isRTL ? 'رقائق BGA' : 'BGA Chips', color: '#10b981' },
    { icon: '📊', name: isRTL ? 'أجهزة قياس' : 'Measuring Devices', color: '#06b6d4' },
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
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200">
              🔧 {isRTL ? 'جديد' : 'New'}
            </span>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-bold border border-teal-200">
              Next.js 15
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200">
              {isRTL ? '🚚 توصيل بالمناطق' : '🚚 Regional Delivery'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-dark-800 mb-3">
            {isRTL ? 'متجر أدوات صيانة' : 'Hardware Tools Store'}
          </h1>
          <p className="text-dark-500 text-lg max-w-2xl">
            {isRTL
              ? 'قالب متجر أدوات صيانة احترافي مبني بـ Next.js 15 — لبيع الدونجلات والبوكسات وأدوات JTAG واللحام والرقائق مع خدمة توصيل بالمناطق وعملات متعددة.'
              : 'Professional hardware tools store template built with Next.js 15 — for selling dongles, boxes, JTAG adapters, soldering tools & chips with regional delivery and multi-currency support.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Product Categories */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d3">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? '🔧 فئات المنتجات' : '🔧 Product Categories'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productCategories.map((cat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200"
                    style={{ background: `${cat.color}08` }}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-dark-800 text-sm font-bold">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Demo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tpl-entrance tpl-d4">
              {/* Store Demo Card */}
              <a
                href="/demo/hx-store"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-blue-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح المتجر' : 'Browse Store'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'جرّب متجر الأدوات بالكامل — تصفح المنتجات، أضف للسلة، واطلب' : 'Experience the full tools store — browse products, add to cart, place orders'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-blue-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>

              {/* Dashboard Demo Card */}
              <a
                href="/demo/hx-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:border-teal-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-teal-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-1">
                    {isRTL ? 'تصفّح لوحة التحكم' : 'Browse Dashboard'}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {isRTL ? 'لوحة تحكم شاملة — منتجات، طلبات، مناطق توصيل، عملات، تخصيص' : 'Full dashboard — products, orders, delivery zones, currencies, customization'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-teal-600 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
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
                {isRTL ? 'كل ما تحتاجه لإطلاق متجر أدوات صيانة احترافي' : 'Everything you need to launch a professional hardware tools store'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🏠', name: isRTL ? 'صفحة رئيسية مع بانرات إعلانية' : 'Home Page with Ad Banners' },
                  { icon: '🔧', name: isRTL ? 'صفحة المنتجات مع بحث وفلترة' : 'Products Page with Search & Filter' },
                  { icon: '🛒', name: isRTL ? 'سلة شراء متعددة الخطوات' : 'Multi-Step Cart & Checkout' },
                  { icon: '📋', name: isRTL ? 'سجل الطلبات' : 'Orders History' },
                  { icon: '👤', name: isRTL ? 'الملف الشخصي والتسجيل' : 'Profile & Registration' },
                  { icon: '📊', name: isRTL ? 'لوحة تحكم إدارية' : 'Admin Dashboard' },
                  { icon: '📦', name: isRTL ? 'إدارة المنتجات (CRUD)' : 'Product Management (CRUD)' },
                  { icon: '🚚', name: isRTL ? 'مناطق التوصيل والأقاليم' : 'Delivery Zones & Regions' },
                  { icon: '💱', name: isRTL ? 'إدارة العملات وأسعار الصرف' : 'Currency & Exchange Rate Management' },
                  { icon: '💳', name: isRTL ? 'بوابات الدفع' : 'Payment Gateways' },
                  { icon: '📢', name: isRTL ? 'الإعلانات' : 'Announcements' },
                  { icon: '🎨', name: isRTL ? 'تخصيص الواجهة والثيمات' : 'UI & Theme Customization' },
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
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <Truck className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? 'توصيل بالمناطق' : 'Regional Delivery'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'إدارة مناطق التوصيل لكل دولة مع أقاليم وتكاليف مختلفة' : 'Manage delivery zones per country with regions and different costs'}</p>
                </div>
                <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
                  <DollarSign className="w-8 h-8 text-teal-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? 'عملات متعددة' : 'Multi-Currency'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'عرض الأسعار بعملات مختلفة مع أسعار صرف قابلة للتحديث' : 'Display prices in different currencies with updatable exchange rates'}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <Users className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? 'تسجيل عملاء' : 'Customer Registration'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'نظام تسجيل ودخول بسيط للعملاء مع ملف شخصي' : 'Simple customer registration & login with profile management'}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Palette className="w-8 h-8 text-amber-400 mb-3" />
                  <h4 className="text-dark-800 font-bold text-sm mb-1">{isRTL ? '6 ثيمات ألوان' : '6 Color Themes'}</h4>
                  <p className="text-dark-500 text-xs">{isRTL ? 'تقنية-أزرق، كربون، أخضر كهربائي، قرمزي، بنفسجي ملكي، منتصف الليل' : 'Tech Blue, Carbon, Electric Green, Crimson, Royal Purple, Midnight'}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm tpl-entrance tpl-d7">
              <h3 className="text-xl font-bold text-dark-800 mb-4">
                {isRTL ? 'التقنيات المستخدمة' : 'Tech Stack'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'TypeScript', 'CSS-in-JS (Zero CSS Files)', 'Lucide Icons', 'Custom Themes Engine', 'Port 4002'].map(tech => (
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
                  ? 'قالب متجر أدوات صيانة احترافي مبني بـ Next.js 15 و TypeScript. مصمم خصيصاً لبيع المنتجات الملموسة مثل الدونجلات والبوكسات وأدوات JTAG واللحام والرقائق وأجهزة القياس. يتميز بنظام توصيل متقدم يدعم مناطق التوصيل لكل دولة مع أقاليم وتكاليف شحن مختلفة، ونظام عملات متعددة مع أسعار صرف قابلة للتحديث. يتضمن لوحة تحكم إدارية شاملة مع 10 صفحات إدارية و6 ثيمات ألوان احترافية.'
                  : 'Professional hardware maintenance tools store template built with Next.js 15 and TypeScript. Specifically designed for selling physical products like dongles, boxes, JTAG adapters, soldering equipment, chips, and measuring devices. Features an advanced delivery system supporting delivery zones per country with regions and different shipping costs, and a multi-currency system with updatable exchange rates. Includes a comprehensive admin dashboard with 10 admin pages and 6 professional color themes.'
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
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
                  onClick={() => navigate(`/buy?template=hardware-tools-store&plan=${billingCycle}`)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-400 hover:to-teal-400 text-white font-bold text-base transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {isRTL ? 'اشترِ الآن' : 'Buy Now'} — ${prices[billingCycle].price}
                  </div>
                </button>

                {/* Reservation Button */}
                <button
                  onClick={() => setShowReservation(true)}
                  className="w-full py-3 rounded-xl border-2 border-blue-500 hover:border-blue-600 text-blue-600 hover:text-blue-700 font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 mt-3"
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
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  {isRTL ? 'يشمل الباقة' : 'Package Includes'}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    isRTL ? 'استضافة سحابية مُدارة' : 'Managed Cloud Hosting',
                    isRTL ? 'إعداد تلقائي فوري' : 'Instant Auto Setup',
                    isRTL ? 'تحديثات مجانية مستمرة' : 'Continuous Free Updates',
                    isRTL ? 'دعم فني على مدار الساعة' : '24/7 Technical Support',
                    isRTL ? 'لوحة تحكم شاملة (10 صفحات)' : 'Full Dashboard (10 Pages)',
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
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
                </h3>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-dark-600">
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
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
                  {isRTL ? '4.9 من 5 — 47 تقييم' : '4.9 out of 5 — 47 reviews'}
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
      templateId="hardware-tools-store"
      templateName={isRTL ? staticT?.name : staticT?.nameEn}
    />
    </>
  );
}
