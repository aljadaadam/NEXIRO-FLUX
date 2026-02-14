import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart, Sparkles, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { templates as staticTemplates, categories } from '../../data/templates';
import api from '../../services/api';

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function TemplatesGallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [templates, setTemplates] = useState(staticTemplates);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();
  const ref = useRef();
  const visible = useInView(ref);

  useEffect(() => {
    let cancelled = false;
    api.getPublicProducts()
      .then(res => {
        if (!cancelled && res.products?.length > 0) {
          // Merge API products: override static data with live API data
          // Match by id (string or number) and also by name similarity
          const apiProducts = res.products;
          const apiMapById = new Map(apiProducts.map(p => [String(p.id), p]));
          
          const merged = staticTemplates.map(st => {
            // Try to match by id first
            let live = apiMapById.get(String(st.id));
            
            if (live) {
              return {
                ...st,
                name: live.name || st.name,
                description: live.description || st.description,
                price: live.price ? { monthly: live.price, yearly: live.price * 10, lifetime: live.price * 25 } : st.price,
                image: live.image || st.image,
                status: live.status,
                _apiId: live.id, // keep reference to API id
              };
            }
            return st;
          });
          
          // Add any API products that weren't matched to static templates
          const matchedApiIds = new Set(merged.filter(m => m._apiId).map(m => String(m._apiId)));
          apiProducts.forEach(p => {
            if (!matchedApiIds.has(String(p.id))) {
              merged.push({
                id: p.id,
                name: p.name,
                nameEn: p.name,
                description: p.description || '',
                descriptionEn: p.description || '',
                category: p.category || p.group_name || 'digital-services',
                image: p.image || 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80',
                price: { monthly: p.price || 0, yearly: (p.price || 0) * 10, lifetime: (p.price || 0) * 25 },
                features: [], featuresEn: [],
                color: 'from-purple-500 to-indigo-600',
                badge: p.status === 'active' ? null : '🔜 قريباً',
                comingSoon: p.status !== 'active' && p.status !== null,
              });
            }
          });
          setTemplates(merged);
        }
      })
      .catch((err) => { console.warn('Failed to load products from API, using static data:', err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = activeCategory === 'all' 
    ? templates 
    : templates.filter(tp => tp.category === activeCategory);

  return (
    <section id="templates" className="section-padding relative" ref={ref}>
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6">
            <span className="gradient-text">{t('templates.title')}</span>
          </h2>
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto">
            {t('templates.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className={`flex flex-wrap items-center justify-center gap-3 mb-12 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'glass text-dark-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {isRTL ? cat.name : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((template, i) => (
            <div
              key={template.id}
              className={`group glass-dark overflow-hidden card-hover transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(i + 3) * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-52">
                <img
                  src={template.image}
                  alt={isRTL ? template.name : template.nameEn}
                  className={`w-full h-full object-cover transition-transform duration-700 ${template.comingSoon ? 'grayscale opacity-60' : 'group-hover:scale-110'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
                
                {/* Badge */}
                {template.badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-sm text-xs font-bold text-white border ${template.comingSoon ? 'bg-amber-600/80 border-amber-400/30' : 'bg-dark-950/80 border-white/10'}`}>
                    {template.badge}
                  </div>
                )}

                {/* Coming Soon Overlay */}
                {template.comingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-950/40">
                    <span className="px-6 py-3 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-amber-300 text-lg font-bold">
                      {isRTL ? '🔜 قريباً' : '🔜 Coming Soon'}
                    </span>
                  </div>
                )}

                {/* Overlay Actions - only for available templates */}
                {!template.comingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Link
                      to={`/template/${template.id}`}
                      className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t('templates.preview')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                    {isRTL ? template.name : template.nameEn}
                  </h3>
                </div>
                <p className="text-dark-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {isRTL ? template.description : template.descriptionEn}
                </p>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <span className="text-xs text-dark-500">{t('templates.startingFrom')}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-display font-black text-white">${template.price.monthly}</span>
                      <span className="text-dark-500 text-sm">{t('templates.perMonth')}</span>
                    </div>
                  </div>
                  {template.comingSoon ? (
                    <span className="px-4 py-2 rounded-lg bg-dark-700/50 text-dark-400 text-sm font-bold cursor-not-allowed">
                      {isRTL ? 'قريباً' : 'Soon'}
                    </span>
                  ) : (
                    <Link
                      to={`/template/${template.id}`}
                      className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 text-sm font-bold hover:bg-primary-500 hover:text-white transition-all duration-300"
                    >
                      {t('templates.buyNow')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
