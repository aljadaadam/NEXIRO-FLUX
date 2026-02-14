import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { t, isRTL } = useLanguage();
  const ref = useRef();
  const visible = useInView(ref);
  const navigate = useNavigate();

  const planSlugs = ['starter', 'professional', 'enterprise'];

  const plans = [
    {
      name: isRTL ? 'المبتدئ' : 'Starter',
      description: isRTL ? 'مثالي للمشاريع الصغيرة' : 'Perfect for small projects',
      price: { monthly: 9, yearly: 79, lifetime: 199 },
      features: isRTL
        ? ['قالب واحد', 'دعم بالبريد', 'SSL مجاني', 'نطاق فرعي مجاني', '5GB تخزين']
        : ['1 Template', 'Email Support', 'Free SSL', 'Free Subdomain', '5GB Storage'],
      popular: false,
      color: 'from-dark-700 to-dark-800',
      buttonColor: 'bg-white/10 hover:bg-white/20 text-white',
    },
    {
      name: isRTL ? 'الاحترافي' : 'Professional',
      description: isRTL ? 'الأكثر شعبية للأعمال المتنامية' : 'Most popular for growing businesses',
      price: { monthly: 29, yearly: 249, lifetime: 599 },
      features: isRTL
        ? ['3 قوالب', 'دعم أولوي 24/7', 'SSL مجاني', 'نطاق مخصص', '50GB تخزين', 'تحليلات متقدمة', 'بدون إعلانات']
        : ['3 Templates', 'Priority 24/7 Support', 'Free SSL', 'Custom Domain', '50GB Storage', 'Advanced Analytics', 'No Ads'],
      popular: true,
      color: 'from-primary-600 to-primary-700',
      buttonColor: 'bg-white text-primary-600 hover:bg-dark-100',
    },
    {
      name: isRTL ? 'المؤسسي' : 'Enterprise',
      description: isRTL ? 'للشركات والمؤسسات الكبيرة' : 'For large companies and enterprises',
      price: { monthly: 79, yearly: 699, lifetime: 1599 },
      features: isRTL
        ? ['قوالب غير محدودة', 'مدير حساب مخصص', 'SSL مجاني', 'نطاقات متعددة', 'تخزين غير محدود', 'API كامل', 'White Label', 'SLA مضمون']
        : ['Unlimited Templates', 'Dedicated Account Manager', 'Free SSL', 'Multiple Domains', 'Unlimited Storage', 'Full API', 'White Label', 'Guaranteed SLA'],
      popular: false,
      color: 'from-dark-700 to-dark-800',
      buttonColor: 'bg-white/10 hover:bg-white/20 text-white',
    },
  ];

  const getPrice = (plan) => {
    return plan.price[billingCycle];
  };

  const getPriceLabel = () => {
    if (billingCycle === 'monthly') return t('pricing.perMonth');
    if (billingCycle === 'yearly') return t('pricing.perYear');
    return t('pricing.oneTime');
  };

  return (
    <section id="pricing" className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 bg-mesh opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6">
            <span className="gradient-text">{t('pricing.title')}</span>
          </h2>
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl glass">
            {['monthly', 'yearly', 'lifetime'].map(cycle => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  billingCycle === cycle
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {t(`pricing.${cycle}`)}
                {cycle === 'yearly' && billingCycle !== 'yearly' && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-green-500 text-[10px] font-bold text-white">
                    {t('pricing.save')} 30%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${plan.popular ? 'md:-translate-y-4 scale-105 z-10' : ''}`}
              style={{ transitionDelay: `${(i + 2) * 150}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-center text-sm font-bold text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('pricing.popular')}
                </div>
              )}

              <div className={`h-full p-8 ${plan.popular ? 'pt-14' : ''} bg-gradient-to-b ${plan.color} border ${plan.popular ? 'border-primary-500/30' : 'border-white/5'} rounded-3xl`}>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-dark-400 text-sm mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-display font-black text-white">${getPrice(plan)}</span>
                  <span className="text-dark-400 text-sm">{getPriceLabel()}</span>
                </div>

                <button
                  onClick={() => navigate(`/templates?plan=${planSlugs[i]}&billing=${billingCycle}`)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm ${plan.buttonColor} transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-8`}
                >
                  {t('pricing.choosePlan')}
                </button>

                <div>
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-4">
                    {t('pricing.features')}
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-dark-300">
                        <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-primary-400' : 'text-green-400'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
