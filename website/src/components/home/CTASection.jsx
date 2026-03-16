import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import ReservationModal from '../common/ReservationModal';

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function CTASection() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const ref = useRef();
  const visible = useInView(ref);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [showReservation, setShowReservation] = useState(false);

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className={`relative p-12 md:p-20 text-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 transition-all duration-700 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">14 {isRTL ? 'يوم تجربة مجانية' : 'days free trial'}</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {t('cta.subtitle')}
            </p>

            {isAuthenticated ? (
              <Link to="/templates" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-600 bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg gap-2 group">
                {t('cta.button')}
                <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button onClick={() => setShowReservation(true)} className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-600 bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg gap-2 group">
                {t('cta.button')}
                <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
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
