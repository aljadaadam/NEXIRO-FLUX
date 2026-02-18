import { useParams, Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, Palette, Globe, TrendingUp, Settings, ArrowRight, ArrowLeft, Clock, Tag, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const tutorialSlugs = ['ecommerce', 'seo', 'design', 'domain', 'manage', 'marketing'];

const tutorialMeta = {
  ecommerce: { icon: ShoppingCart, iconColor: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: 'from-emerald-400 to-green-500' },
  seo:       { icon: TrendingUp,   iconColor: '#60a5fa', bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    color: 'from-blue-400 to-indigo-500' },
  design:    { icon: Palette,      iconColor: '#f472b6', bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    color: 'from-pink-400 to-rose-500' },
  domain:    { icon: Globe,        iconColor: '#22d3ee', bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    color: 'from-cyan-400 to-teal-500' },
  manage:    { icon: Settings,     iconColor: '#a78bfa', bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  color: 'from-violet-400 to-purple-500' },
  marketing: { icon: BookOpen,     iconColor: '#fbbf24', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   color: 'from-amber-400 to-orange-500' },
};

export default function TutorialPage() {
  const { slug } = useParams();
  const { t, isRTL } = useLanguage();

  const meta = tutorialMeta[slug];
  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-dark-400 mb-6">{isRTL ? 'الشرح غير موجود' : 'Tutorial not found'}</p>
          <Link to="/" className="text-primary-400 hover:text-primary-300">
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  const Icon = meta.icon;
  const title = t(`tutorials.items.${slug}.title`);
  const desc = t(`tutorials.items.${slug}.desc`);
  const tags = t(`tutorials.items.${slug}.tags`);
  const readTime = t(`tutorials.items.${slug}.readTime`);

  // Get full content sections
  const sections = [];
  for (let i = 1; i <= 8; i++) {
    const heading = t(`tutorialContent.${slug}.s${i}.heading`);
    const body = t(`tutorialContent.${slug}.s${i}.body`);
    if (heading && !heading.includes('tutorialContent.')) {
      sections.push({ heading, body });
    }
  }

  const tips = [];
  for (let i = 1; i <= 6; i++) {
    const tip = t(`tutorialContent.${slug}.tips.t${i}`);
    if (tip && !tip.includes('tutorialContent.')) {
      tips.push(tip);
    }
  }

  const conclusion = t(`tutorialContent.${slug}.conclusion`);

  // Navigation to other tutorials
  const currentIndex = tutorialSlugs.indexOf(slug);
  const prevSlug = currentIndex > 0 ? tutorialSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex < tutorialSlugs.length - 1 ? tutorialSlugs[currentIndex + 1] : null;

  const BackArrow = isRTL ? ChevronRight : ChevronLeft;
  const ForwardArrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-dark-950">
      <SEO
        title={title}
        description={desc}
        type="article"
        keywords={(tags || '').replace(/,/g, ', ')}
        canonicalPath={`/tutorials/${slug}`}
        article={{
          title,
          description: desc,
          datePublished: '2026-01-15',
          dateModified: '2026-02-18',
        }}
      />
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 to-dark-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* Back Link */}
          <Link to="/#tutorials" className="inline-flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors mb-8">
            <BackArrow className="w-4 h-4" />
            <span>{isRTL ? 'العودة للشروحات' : 'Back to Tutorials'}</span>
          </Link>

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl ${meta.bg} border ${meta.border} flex items-center justify-center mb-6`}>
            <Icon className="w-8 h-8" style={{ color: meta.iconColor }} />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-6 leading-tight">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{readTime}</span>
            </div>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Tag className="w-4 h-4" />
              <div className="flex flex-wrap gap-2">
                {(tags || '').split(',').map((tag, j) => (
                  <span key={j} className={`px-2.5 py-0.5 rounded-full text-xs ${meta.bg} ${meta.border} border text-dark-200`}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Intro */}
          <p className="text-dark-300 text-lg leading-relaxed">
            {desc}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <article className="space-y-12">
            {sections.map((section, i) => (
              <div key={i} className="glass p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${meta.bg} ${meta.border} border flex-shrink-0 mt-0.5`} style={{ color: meta.iconColor }}>
                    {i + 1}
                  </span>
                  {section.heading}
                </h2>
                <p className="text-dark-300 leading-relaxed text-base md:text-lg">
                  {section.body}
                </p>
              </div>
            ))}

            {/* Tips */}
            {tips.length > 0 && (
              <div className="glass p-6 md:p-8 border border-primary-500/20">
                <h2 className="text-xl md:text-2xl font-bold text-primary-300 mb-6">
                  {isRTL ? '💡 نصائح مهمة' : '💡 Pro Tips'}
                </h2>
                <ul className="space-y-4">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-dark-300 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conclusion */}
            {conclusion && !conclusion.includes('tutorialContent.') && (
              <div className="glass p-6 md:p-8 bg-gradient-to-br from-primary-500/5 to-transparent">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                  {isRTL ? '🎯 الخلاصة' : '🎯 Conclusion'}
                </h2>
                <p className="text-dark-300 leading-relaxed text-base md:text-lg">
                  {conclusion}
                </p>
              </div>
            )}
          </article>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-16 pt-8 border-t border-dark-800">
            {prevSlug ? (
              <Link
                to={`/tutorials/${prevSlug}`}
                className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors group"
              >
                <BackArrow className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <div className="text-xs text-dark-500">{isRTL ? 'السابق' : 'Previous'}</div>
                  <div className="text-sm font-medium">{t(`tutorials.items.${prevSlug}.title`)}</div>
                </div>
              </Link>
            ) : <div />}
            
            {nextSlug ? (
              <Link
                to={`/tutorials/${nextSlug}`}
                className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors group text-end"
              >
                <div>
                  <div className="text-xs text-dark-500">{isRTL ? 'التالي' : 'Next'}</div>
                  <div className="text-sm font-medium">{t(`tutorials.items.${nextSlug}.title`)}</div>
                </div>
                <ForwardArrow className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>

          {/* CTA */}
          <div className="mt-16 glass p-8 md:p-12 text-center bg-gradient-to-br from-primary-500/10 to-transparent border border-primary-500/20">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {isRTL ? 'جاهز تبدأ مشروعك؟' : 'Ready to Start Your Project?'}
            </h3>
            <p className="text-dark-300 text-lg mb-8 max-w-2xl mx-auto">
              {isRTL
                ? 'لا تنتظر أكثر! ابدأ ببناء متجرك الإلكتروني اليوم مع NEXIRO-FLUX واستفد من أفضل القوالب والأدوات.'
                : "Don't wait! Start building your online store today with NEXIRO-FLUX and leverage the best templates and tools."}
            </p>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:from-primary-400 hover:to-primary-500 transition-all shadow-lg shadow-primary-500/25"
            >
              {isRTL ? 'استعرض القوالب' : 'Browse Templates'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
