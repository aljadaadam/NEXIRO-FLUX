import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, Star, Zap, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { stats } from '../../data/templates';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-grid" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-primary-500/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">{t('hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-tight mb-8 animate-slide-up">
            <span className="text-white block">{t('hero.title1')}</span>
            <span className="gradient-text block">{t('hero.title2')}</span>
            <span className="text-dark-400 block text-4xl sm:text-5xl md:text-6xl mt-2">{t('hero.title3')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-dark-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="btn-primary group gap-2 text-lg w-full sm:w-auto">
              {t('hero.cta')}
              <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link to="/templates" className="btn-secondary gap-2 text-lg w-full sm:w-auto">
              <Play className="w-5 h-5" />
              {t('hero.ctaSecondary')}
            </Link>
          </div>

          {/* Trust Bar */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-dark-400 text-sm">{t('hero.trustedBy')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.8s' }}>
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 text-center card-hover">
              <div className="text-3xl md:text-4xl font-display font-black gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-dark-400 text-sm font-medium">
                {isRTL ? stat.label : stat.labelEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />
    </section>
  );
}
