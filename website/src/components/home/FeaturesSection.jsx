import { useRef, useState, useEffect } from 'react';
import { Zap, Palette, Headphones, Shield, Search, Smartphone } from 'lucide-react';
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

export default function FeaturesSection() {
  const { t } = useLanguage();
  const ref = useRef();
  const visible = useInView(ref);

  const features = [
    {
      icon: Zap,
      title: t('features.speed'),
      desc: t('features.speedDesc'),
      color: 'from-yellow-400 to-orange-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      icon: Palette,
      title: t('features.design'),
      desc: t('features.designDesc'),
      color: 'from-pink-400 to-purple-500',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
    },
    {
      icon: Headphones,
      title: t('features.support'),
      desc: t('features.supportDesc'),
      color: 'from-green-400 to-emerald-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      icon: Shield,
      title: t('features.security'),
      desc: t('features.securityDesc'),
      color: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: Search,
      title: t('features.seo'),
      desc: t('features.seoDesc'),
      color: 'from-cyan-400 to-teal-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      icon: Smartphone,
      title: t('features.mobile'),
      desc: t('features.mobileDesc'),
      color: 'from-violet-400 to-purple-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
  ];

  return (
    <section id="features" className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 bg-dark-900/50" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6">
            <span className="text-white">{t('features.title')}</span>
          </h2>
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`group relative glass p-8 card-hover transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 2) * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                    <Icon className={`w-7 h-7 absolute`} style={{ color: feature.color.includes('yellow') ? '#facc15' : feature.color.includes('pink') ? '#f472b6' : feature.color.includes('green') ? '#4ade80' : feature.color.includes('blue') ? '#60a5fa' : feature.color.includes('cyan') ? '#22d3ee' : '#a78bfa' }} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-dark-400 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
