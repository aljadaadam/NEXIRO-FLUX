'use client';

export default function HeroSection({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <section className="relative min-h-[400px] sm:min-h-[520px] lg:min-h-[560px] flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-navy-950 via-navy-950/70 to-navy-950/40 sm:via-navy-950/80 sm:to-transparent z-10" />

      {/* Hero Image - Left side */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[55%]">
        <div className="relative w-full h-full">
          <img
            src="/images/hero-bg.jpg"
            alt="Stellar Store"
            className="w-full h-full object-cover"
          />
          {/* Gold overlay glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/40 to-transparent sm:from-navy-950 sm:via-navy-950/60" />
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />
        </div>
      </div>

      {/* Content - Right side */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-xl mr-auto lg:mr-0 lg:ml-auto">
          {/* Badge */}
          <div className="animate-fadeInUp">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold text-gold-500 bg-gold-500/10 border border-gold-500/20 mb-4 sm:mb-6">
              🇸🇩 أكبر منصة تفعيلات في السودان
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black leading-tight mb-3 sm:mb-6 animate-fadeInUp delay-100">
            <span className="text-white">امتلك برامجك</span>
            <br />
            <span className="text-white">الأصلية </span>
            <span className="text-gold-gradient">بضغطة زر</span>
          </h1>

          {/* Subtitle */}
          <p className="text-navy-300 text-sm sm:text-lg leading-relaxed mb-5 sm:mb-8 animate-fadeInUp delay-200">
            متجر ستيلار يوفر لك تفعيلات ويندوز، ألعاب، beIN، ستارلينك
            <br className="hidden sm:block" />
            واشتراكات بريميوم بأمان تام وتسليم فوري.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 animate-fadeInUp delay-300">
            <button
              onClick={onLoginClick}
              className="px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              ابدأ التسوق الآن
            </button>
            <a
              href="/about"
              className="px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base font-bold text-navy-200 border border-navy-600 rounded-xl hover:border-gold-500/50 hover:text-gold-500 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              تعرف علينا أكثر
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
