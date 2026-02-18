import { useRef, useState, useEffect } from 'react';
import { BookOpen, ShoppingCart, Palette, Globe, TrendingUp, Settings, ArrowRight, ArrowLeft } from 'lucide-react';
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

export default function TutorialsSection() {
  const { t, isRTL } = useLanguage();
  const ref = useRef();
  const visible = useInView(ref);

  const tutorials = [
    {
      icon: ShoppingCart,
      title: t('tutorials.items.ecommerce.title'),
      desc: t('tutorials.items.ecommerce.desc'),
      tags: t('tutorials.items.ecommerce.tags'),
      color: 'from-emerald-400 to-green-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconColor: '#34d399',
      readTime: t('tutorials.items.ecommerce.readTime'),
    },
    {
      icon: TrendingUp,
      title: t('tutorials.items.seo.title'),
      desc: t('tutorials.items.seo.desc'),
      tags: t('tutorials.items.seo.tags'),
      color: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconColor: '#60a5fa',
      readTime: t('tutorials.items.seo.readTime'),
    },
    {
      icon: Palette,
      title: t('tutorials.items.design.title'),
      desc: t('tutorials.items.design.desc'),
      tags: t('tutorials.items.design.tags'),
      color: 'from-pink-400 to-rose-500',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      iconColor: '#f472b6',
      readTime: t('tutorials.items.design.readTime'),
    },
    {
      icon: Globe,
      title: t('tutorials.items.domain.title'),
      desc: t('tutorials.items.domain.desc'),
      tags: t('tutorials.items.domain.tags'),
      color: 'from-cyan-400 to-teal-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      iconColor: '#22d3ee',
      readTime: t('tutorials.items.domain.readTime'),
    },
    {
      icon: Settings,
      title: t('tutorials.items.manage.title'),
      desc: t('tutorials.items.manage.desc'),
      tags: t('tutorials.items.manage.tags'),
      color: 'from-violet-400 to-purple-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      iconColor: '#a78bfa',
      readTime: t('tutorials.items.manage.readTime'),
    },
    {
      icon: BookOpen,
      title: t('tutorials.items.marketing.title'),
      desc: t('tutorials.items.marketing.desc'),
      tags: t('tutorials.items.marketing.tags'),
      color: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconColor: '#fbbf24',
      readTime: t('tutorials.items.marketing.readTime'),
    },
  ];

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="tutorials" className="section-padding relative overflow-hidden" ref={ref}>
      {/* Background decorations */}
      <div className="absolute inset-0 bg-dark-900/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            {t('tutorials.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6">
            <span className="text-white">{t('tutorials.title')}</span>
          </h2>
          <p className="text-dark-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('tutorials.subtitle')}
          </p>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tutorials.map((tutorial, i) => {
            const Icon = tutorial.icon;
            return (
              <article
                key={i}
                className={`group relative glass p-8 card-hover transition-all duration-700 cursor-pointer ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 2) * 120}ms` }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl ${tutorial.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Top Row: Icon + Read Time */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${tutorial.bg} border ${tutorial.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-7 h-7" style={{ color: tutorial.iconColor }} />
                    </div>
                    <span className="text-xs text-dark-400 bg-dark-800/50 px-3 py-1 rounded-full">
                      {tutorial.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors leading-tight">
                    {tutorial.title}
                  </h3>

                  {/* Description */}
                  <p className="text-dark-400 leading-relaxed text-sm mb-5">
                    {tutorial.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {(tutorial.tags || '').split(',').map((tag, j) => (
                      <span
                        key={j}
                        className={`text-xs px-2.5 py-1 rounded-full ${tutorial.bg} ${tutorial.border} border text-dark-200`}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Read More */}
                  <div className="flex items-center gap-2 text-primary-400 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>{t('tutorials.readMore')}</span>
                    <Arrow className="w-4 h-4" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* SEO Rich Content Block */}
        <div className={`glass p-8 md:p-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '900ms' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {t('tutorials.seoTitle')}
            </h3>
            <p className="text-dark-300 text-base md:text-lg leading-relaxed mb-4">
              {t('tutorials.seoText1')}
            </p>
            <p className="text-dark-400 text-sm md:text-base leading-relaxed">
              {t('tutorials.seoText2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
