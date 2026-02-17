import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className={`relative glass p-12 md:p-20 text-center overflow-hidden transition-all duration-700 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-500/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">14 {isRTL ? 'يوم تجربة مجانية' : 'days free trial'}</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {t('cta.subtitle')}
            </p>

            <Link to={isAuthenticated ? '/templates' : '/register'} className="btn-primary text-lg gap-2 group">
              {t('cta.button')}
              <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
