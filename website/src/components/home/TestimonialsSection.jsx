import { useState, useRef, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { testimonials } from '../../data/templates';

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const { t, isRTL } = useLanguage();
  const ref = useRef();
  const visible = useInView(ref);

  const next = () => setActive(prev => (prev + 1) % testimonials.length);
  const prev = () => setActive(prev => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 bg-dark-900/50" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6">
            <span className="text-white">{t('testimonials.title')}</span>
          </h2>
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative glass p-8 md:p-12">
            {/* Quote icon */}
            <Quote className="absolute top-6 right-6 w-12 h-12 text-primary-500/20" />

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[active].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-base sm:text-xl md:text-2xl text-white leading-relaxed mb-6 sm:mb-8 font-medium min-h-[80px] sm:min-h-[100px]">
                "{isRTL ? testimonials[active].text : testimonials[active].textEn}"
              </p>

              {/* Author */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={testimonials[active].avatar}
                    alt={isRTL ? testimonials[active].name : testimonials[active].nameEn}
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-primary-500/30 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base sm:text-lg">
                      {isRTL ? testimonials[active].name : testimonials[active].nameEn}
                    </h4>
                    <p className="text-dark-400 text-xs sm:text-sm">
                      {isRTL ? testimonials[active].role : testimonials[active].roleEn}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={prev}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'w-8 bg-primary-500' : 'w-2 bg-dark-600 hover:bg-dark-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
