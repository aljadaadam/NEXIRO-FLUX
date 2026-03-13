'use client';

import { useRef, useEffect } from 'react';
import { Zap, Shield, Headphones } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'تسليم فوري',
    description: 'استلم المفتاح أو التفعيل خلال دقائق عبر البريد أو الواتساب.',
    color: 'text-gold-500',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/20',
  },
  {
    icon: Shield,
    title: 'دفع آمن',
    description: 'خيارات دفع متعددة مع حماية لبياناتك ومعاملاتك.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: Headphones,
    title: 'دعم 24/7',
    description: 'فريق دعم دائم لمساعدتك في التفعيل وأي استفسار.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
];

export default function FeaturesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
    let raf: number;
    const step = () => {
      pos += speed;
      if (pos >= el.scrollWidth - el.clientWidth) pos = 0;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const stop = () => cancelAnimationFrame(raf);
    const resume = () => { raf = requestAnimationFrame(step); };
    el.addEventListener('touchstart', stop);
    el.addEventListener('touchend', resume);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('touchstart', stop); el.removeEventListener('touchend', resume); };
  }, []);

  return (
    <section className="py-8 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile: horizontal scroll strip */}
        <div ref={scrollRef} className="md:hidden flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-xl bg-navy-900/60 border ${feature.border} min-w-[260px] shrink-0`}
              >
                <div className={`w-11 h-11 rounded-lg ${feature.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{feature.title}</h3>
                  <p className="text-navy-400 text-[11px] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-5 p-6 rounded-2xl bg-navy-900/60 border ${feature.border} hover:border-gold-500/30 transition-all group animate-fadeInUp`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-navy-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
