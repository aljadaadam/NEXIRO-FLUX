import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, Star, Zap, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { stats } from '../../data/templates';
import ReservationModal from '../common/ReservationModal';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [showReservation, setShowReservation] = useState(false);

  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-mesh" />
      
      {/* Soft decorative circles */}
      <div className="absolute top-20 left-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary-100/40 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-primary-50/60 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content - Right side for RTL */}
          <div className={`${isRTL ? 'lg:order-1' : 'lg:order-1'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-50 border border-primary-200 mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-600">{t('hero.badge')}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-tight mb-6 sm:mb-8 animate-slide-up">
              <span className="text-dark-800 block">{t('hero.title1')}</span>
              <span className="gradient-text block">{t('hero.title2')}</span>
              <span className="text-dark-400 block text-2xl xs:text-3xl sm:text-4xl md:text-5xl mt-2">{t('hero.title3')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-dark-400 max-w-xl mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {isAuthenticated ? (
                <Link to="/templates" className="btn-primary group gap-2 text-lg w-full sm:w-auto">
                  {t('hero.cta')}
                  <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button onClick={() => setShowReservation(true)} className="btn-primary group gap-2 text-lg w-full sm:w-auto">
                  {t('hero.cta')}
                  <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <Link to="/templates" className="btn-secondary gap-2 text-lg w-full sm:w-auto">
                <Play className="w-5 h-5" />
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            {/* Trust Bar */}
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-dark-400 text-sm">{t('hero.trustedBy')}</p>
            </div>
          </div>

          {/* Stats Grid - Left side for RTL (acts as visual block) */}
          <div className={`${isRTL ? 'lg:order-2' : 'lg:order-2'} animate-slide-up`} style={{ animationDelay: '0.8s' }}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-5 sm:p-8 text-center rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-display font-black gradient-text mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-dark-400 text-sm font-medium">
                    {isRTL ? stat.label : stat.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ReservationModal
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
      />
    </section>
  );
}
