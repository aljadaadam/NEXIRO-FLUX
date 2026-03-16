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
  const { t, isRTL } = useLanguage();
  const ref = useRef();
  const visible = useInView(ref);
  const navigate = useNavigate();

  const planSlugs = ['monthly', 'yearly', 'lifetime'];

  const plans = [
    {
      name: isRTL ? 'شهري' : 'Monthly',
      description: isRTL ? 'مرونة كاملة بدون التزام طويل' : 'Full flexibility with no long commitment',
      startPrice: 14.9,
      suffix: isRTL ? '/شهر' : '/mo',
      features: isRTL
        ? ['قالب واحد', 'SSL مجاني', 'نطاق فرعي مجاني', 'دعم بالبريد', '5GB تخزين', 'تحديثات مستمرة', 'تصميم متجاوب', 'حماية أساسية']
        : ['1 Template', 'Free SSL', 'Free Subdomain', 'Email Support', '5GB Storage', 'Continuous Updates', 'Responsive Design', 'Basic Protection'],
      popular: false,
      color: 'bg-white',
      textColor: 'text-dark-800',
      descColor: 'text-dark-400',
      priceColor: 'text-dark-800',
      borderColor: 'border-gray-200',
      buttonColor: 'bg-gray-100 hover:bg-gray-200 text-dark-700',
      billingCycle: 'monthly',
    },
    {
      name: isRTL ? 'سنوي' : 'Yearly',
      description: isRTL ? 'وفّر حتى 25% مع الاشتراك السنوي' : 'Save up to 25% with yearly subscription',
      startPrice: 149,
      suffix: isRTL ? '/سنة' : '/yr',
      saveBadge: isRTL ? 'وفّر 25%' : 'Save 25%',
      features: isRTL
        ? ['قالب واحد', 'SSL مجاني', 'نطاق مخصص', 'دعم أولوي 24/7', '50GB تخزين', 'تحديثات مستمرة', 'تحليلات متقدمة', 'بدون إعلانات', 'نسخ احتياطية يومية', 'تحسين SEO']
        : ['1 Template', 'Free SSL', 'Custom Domain', 'Priority 24/7 Support', '50GB Storage', 'Continuous Updates', 'Advanced Analytics', 'No Ads', 'Daily Backups', 'SEO Optimization'],
      popular: true,
      color: 'bg-primary-500',
      textColor: 'text-white',
      descColor: 'text-primary-100',
      priceColor: 'text-white',
      borderColor: 'border-primary-400',
      buttonColor: 'bg-white text-primary-600 hover:bg-gray-50',
      billingCycle: 'yearly',
    },
    {
      name: isRTL ? 'مدى الحياة' : 'Lifetime',
      description: isRTL ? 'ادفع مرة واحدة واستمتع للأبد' : 'Pay once and enjoy forever',
      startPrice: 372.5,
      suffix: '',
      features: isRTL
        ? ['قالب واحد', 'SSL مجاني', 'نطاق مخصص', 'دعم أولوي مدى الحياة', 'تخزين غير محدود', 'تحديثات مدى الحياة', 'تحليلات متقدمة', 'بدون إعلانات', 'API كامل', 'نسخ احتياطية يومية', 'CDN عالمي', 'حماية DDoS']
        : ['1 Template', 'Free SSL', 'Custom Domain', 'Lifetime Priority Support', 'Unlimited Storage', 'Lifetime Updates', 'Advanced Analytics', 'No Ads', 'Full API', 'Daily Backups', 'Global CDN', 'DDoS Protection'],
      popular: false,
      color: 'bg-white',
      textColor: 'text-dark-800',
      descColor: 'text-dark-400',
      priceColor: 'text-dark-800',
      borderColor: 'border-gray-200',
      buttonColor: 'bg-gray-100 hover:bg-gray-200 text-dark-700',
      billingCycle: 'lifetime',
    },
  ];

  return (
    <section id="pricing" className="section-padding relative bg-gray-50" ref={ref}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6">
            <span className="gradient-text">{t('pricing.title')}</span>
          </h2>
          <p className="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-2 sm:px-0">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${plan.popular ? 'md:-translate-y-4 md:scale-105 z-10' : ''}`}
              style={{ transitionDelay: `${(i + 2) * 150}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 py-2 bg-primary-600 text-center text-sm font-bold text-white flex items-center justify-center gap-2 rounded-t-3xl">
                  <Sparkles className="w-4 h-4" />
                  {t('pricing.popular')}
                </div>
              )}

              {/* Save badge */}
              {plan.saveBadge && !plan.popular && (
                <div className="absolute top-0 left-0 right-0 py-2 bg-emerald-500 text-center text-sm font-bold text-white rounded-t-3xl">
                  {plan.saveBadge}
                </div>
              )}

              <div className={`h-full p-8 ${plan.popular || plan.saveBadge ? 'pt-14' : ''} ${plan.color} border ${plan.borderColor} rounded-3xl`}>
                <h3 className={`text-2xl font-bold ${plan.textColor} mb-2`}>{plan.name}</h3>
                <p className={`${plan.descColor} text-sm mb-6`}>{plan.description}</p>

                <div className="mb-2">
                  <span className={`${plan.descColor} text-xs font-medium`}>{isRTL ? 'يبدأ من' : 'Starts from'}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`text-5xl font-display font-black ${plan.priceColor}`}>${plan.startPrice}</span>
                  {plan.suffix && <span className={`${plan.descColor} text-sm`}>{plan.suffix}</span>}
                  {!plan.suffix && <span className={`${plan.descColor} text-sm`}>{isRTL ? 'دفعة واحدة' : 'one-time'}</span>}
                </div>

                <button
                  onClick={() => navigate(`/templates?billing=${plan.billingCycle}`)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm ${plan.buttonColor} transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-8`}
                >
                  {isRTL ? 'اختر قالبك' : 'Choose Your Template'}
                </button>

                <div>
                  <p className={`text-xs font-semibold ${plan.descColor} uppercase tracking-wider mb-4`}>
                    {t('pricing.features')}
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className={`flex items-center gap-3 text-sm ${plan.popular ? 'text-primary-100' : 'text-dark-500'}`}>
                        <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-primary-500'}`} />
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
