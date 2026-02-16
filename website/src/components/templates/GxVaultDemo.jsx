import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ShoppingCart, Gamepad2,
  Users, Package, Shield, Headphones, Zap, Star,
  CreditCard, Globe, CheckCircle,
  BarChart3, Sparkles, ArrowUpRight, BadgeCheck, Clock, Gift, Palette
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates } from '../../data/templates';
import api from '../../services/api';

export default function GxVaultDemo() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');

  const staticT = staticTemplates.find(tp => tp.id === 'game-topup-store');
  const [basePrice, setBasePrice] = useState(staticT?.price?.monthly || 39);

  useEffect(() => {
    api.getPublicProducts()
      .then(res => {
        const apiByName = new Map((res.products || []).map(p => [p.name?.trim(), p]));
        const live = staticT ? apiByName.get(staticT.name?.trim()) : null;
        if (live) {
          const p = parseFloat(live.price);
          if (p > 0) setBasePrice(p);
        }
      })
      .catch(() => {});
  }, []);

  const prices = {
    monthly: { price: basePrice, suffix: isRTL ? '/شهر' : '/mo', label: isRTL ? 'شهري' : 'Monthly', save: null },
    yearly: { price: Math.round(basePrice * 10), suffix: isRTL ? '/سنة' : '/yr', label: isRTL ? 'سنوي' : 'Yearly', save: isRTL ? 'وفّر 25%' : 'Save 25%' },
    lifetime: { price: Math.round(basePrice * 25), suffix: '', label: isRTL ? 'مدى الحياة' : 'Lifetime', save: isRTL ? 'أفضل قيمة' : 'Best Value' },
  };

  const features = [
    { icon: Gamepad2, label: isRTL ? 'شحن جميع الألعاب الشهيرة' : 'All Popular Games Top-Up' },
    { icon: CreditCard, label: isRTL ? 'بوابات دفع متعددة' : 'Multiple Payment Gateways' },
    { icon: Users, label: isRTL ? 'إدارة مستخدمين' : 'User Management' },
    { icon: Package, label: isRTL ? 'كتالوج منتجات ديناميكي' : 'Dynamic Product Catalog' },
    { icon: Palette, label: isRTL ? '6 ثيمات نيون مخصصة' : '6 Custom Neon Themes' },
    { icon: Shield, label: isRTL ? 'نظام أمان متقدم' : 'Advanced Security' },
    { icon: BarChart3, label: isRTL ? 'لوحة تحكم مخصصة للألعاب' : 'Custom Gaming Dashboard' },
    { icon: Headphones, label: isRTL ? 'نظام دعم فني' : 'Support System' },
    { icon: Globe, label: isRTL ? 'دعم كامل RTL' : 'Full RTL Support' },
    { icon: Zap, label: isRTL ? 'أداء فائق السرعة' : 'Blazing Fast Performance' },
  ];

  const games = [
    { icon: '🎯', name: 'PUBG Mobile', color: '#f59e0b' },
    { icon: '⚡', name: 'Fortnite', color: '#3b82f6' },
    { icon: '🔥', name: 'Free Fire', color: '#ef4444' },
    { icon: '💀', name: 'Call of Duty', color: '#22c55e' },
    { icon: '🧱', name: 'Roblox', color: '#ec4899' },
    { icon: '🎮', name: 'Valorant', color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          {isRTL ? 'العودة للقوالب' : 'Back to Templates'}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20">
              🎮 {isRTL ? 'جديد' : 'New'}
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
              Next.js 15
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              {isRTL ? '🔥 تصميم سايبر' : '🔥 Cyber Design'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3">
            {isRTL ? 'متجر شحن ألعاب' : 'Game Top-Up Store'}
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl">
            {isRTL
              ? 'قالب شحن ألعاب احترافي بتصميم سايبر جيمنج مبني بـ Next.js 15 — يدعم PUBG وفورتنايت وفري فاير وكول اوف ديوتي مع لوحة تحكم مخصصة.'
              : 'Professional game top-up template with cyber-gaming design built with Next.js 15 — supports PUBG, Fortnite, Free Fire & CoD with custom dashboard.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Supported Games */}
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                {isRTL ? '🎮 الألعاب المدعومة' : '🎮 Supported Games'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {games.map((game, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border border-white/5"
                    style={{ background: `${game.color}08` }}
                  >
                    <span className="text-2xl">{game.icon}</span>
                    <span className="text-white text-sm font-bold">{game.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Demo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Store Demo Card */}
              <a
                href="/demo/gxv-store"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-violet-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-500 group-hover:text-violet-400 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {isRTL ? 'تصفّح المتجر' : 'Browse Store'}
                  </h3>
                  <p className="text-dark-400 text-sm">
                    {isRTL ? 'جرّب متجر شحن الألعاب بالكامل — تصفح، اختر لعبتك، اشحن' : 'Experience the full game store — browse, select your game, top-up'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-violet-400 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>

              {/* Dashboard Demo Card */}
              <a
                href="/demo/gxv-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-dark-500 group-hover:text-cyan-400 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {isRTL ? 'تصفّح لوحة التحكم' : 'Browse Dashboard'}
                  </h3>
                  <p className="text-dark-400 text-sm">
                    {isRTL ? 'لوحة تحكم سايبر مخصصة — إحصائيات، منتجات، طلبات، مصادر' : 'Custom cyber dashboard — stats, products, orders, sources'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 text-xs font-medium">{isRTL ? 'ديمو حي' : 'Live Demo'}</span>
                  </div>
                </div>
              </a>
            </div>

            {/* What's Included */}
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-2">
                {isRTL ? 'ماذا يتضمن القالب؟' : "What's Included?"}
              </h3>
              <p className="text-dark-400 text-sm mb-6">
                {isRTL ? 'كل ما تحتاجه لإطلاق متجر شحن ألعاب احترافي' : 'Everything you need to launch a professional game top-up store'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🏠', name: isRTL ? 'صفحة رئيسية بتصميم سايبر' : 'Cyber-styled Home Page' },
                  { icon: '🎮', name: isRTL ? 'صفحة الألعاب والشحن' : 'Games & Top-Up Page' },
                  { icon: '📋', name: isRTL ? 'سجل الطلبات' : 'Orders History' },
                  { icon: '👤', name: isRTL ? 'الملف الشخصي' : 'Profile Page' },
                  { icon: '🎫', name: isRTL ? 'صفحة الدعم' : 'Support Page' },
                  { icon: '📊', name: isRTL ? 'لوحة تحكم مخصصة' : 'Custom Dashboard' },
                  { icon: '📦', name: isRTL ? 'إدارة المنتجات' : 'Product Management' },
                  { icon: '👥', name: isRTL ? 'إدارة المستخدمين' : 'User Management' },
                  { icon: '💳', name: isRTL ? 'بوابات الدفع' : 'Payment Gateways' },
                  { icon: '🔗', name: isRTL ? 'مصادر خارجية' : 'External Sources' },
                  { icon: '📢', name: isRTL ? 'الإعلانات' : 'Announcements' },
                  { icon: '🎨', name: isRTL ? 'تخصيص الواجهة' : 'UI Customization' },
                ].map((page, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/5">
                    <span className="text-lg">{page.icon}</span>
                    <span className="text-dark-300 text-sm">{page.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                {isRTL ? 'التقنيات المستخدمة' : 'Tech Stack'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'TypeScript', 'CSS Inline (Zero CSS Files)', 'Lucide Icons', 'Custom Themes Engine'].map(tech => (
                  <span key={tech} className="px-4 py-2 rounded-xl bg-dark-800 text-dark-300 text-sm font-medium border border-white/5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                {isRTL ? 'وصف القالب' : 'Template Description'}
              </h3>
              <p className="text-dark-300 leading-relaxed text-lg">
                {isRTL
                  ? 'قالب متجر شحن ألعاب احترافي بتصميم سايبر جيمنج مبني بـ Next.js 15 و TypeScript. يدعم شحن جميع الألعاب الشهيرة مثل PUBG وفورتنايت وفري فاير وكول اوف ديوتي وروبلوكس وفالورانت. يتميز بلوحة تحكم مخصصة بالكامل مع 6 ثيمات نيون وتأثيرات بصرية متقدمة. يتضمن بوابات دفع متعددة ونظام مصادر خارجية.'
                  : 'Professional game top-up store template with cyber-gaming design built with Next.js 15 and TypeScript. Supports all popular games like PUBG, Fortnite, Free Fire, CoD, Roblox, and Valorant. Features a fully custom dashboard with 6 neon themes and advanced visual effects. Includes multiple payment gateways and external sources system.'
                }
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Pricing Card */}
              <div className="glass p-6 rounded-2xl border border-white/10">
                <div className="text-center mb-6">
                  <div className="text-5xl font-display font-black text-white mb-1">
                    ${prices[billingCycle].price}
                  </div>
                  <p className="text-dark-400 text-sm">
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
                          ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/5'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === key ? 'border-violet-500 bg-violet-500' : 'border-dark-500'
                        }`}>
                          {billingCycle === key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-white font-medium text-sm">{data.label}</span>
                        {data.save && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                            {data.save}
                          </span>
                        )}
                      </div>
                      <span className="font-display font-bold text-white text-sm">
                        ${data.price}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/buy?template=game-topup-store&plan=${billingCycle}`)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white font-bold text-base transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {isRTL ? 'اشترِ الآن' : 'Buy Now'} — ${prices[billingCycle].price}
                  </div>
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-dark-500 text-xs">
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
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-violet-400" />
                  {isRTL ? 'يشمل الباقة' : 'Package Includes'}
                </h3>
                <ul className="space-y-2.5">
                  {[
                    isRTL ? 'استضافة سحابية مُدارة' : 'Managed Cloud Hosting',
                    isRTL ? 'إعداد تلقائي فوري' : 'Instant Auto Setup',
                    isRTL ? 'تحديثات مجانية مستمرة' : 'Continuous Free Updates',
                    isRTL ? 'دعم فني على مدار الساعة' : '24/7 Technical Support',
                    isRTL ? 'لوحة تحكم مخصصة للألعاب' : 'Custom Gaming Dashboard',
                    isRTL ? 'شهادة SSL مجانية' : 'Free SSL Certificate',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-dark-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
                </h3>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-dark-300">
                        <Icon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                        <span className="text-sm">{feature.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Rating */}
              <div className="glass p-5 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-400 text-sm">
                  {isRTL ? '4.8 من 5 — 63 تقييم' : '4.8 out of 5 — 63 reviews'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
