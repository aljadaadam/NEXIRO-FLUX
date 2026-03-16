import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Check, ExternalLink, Monitor, Tablet, Smartphone, ChevronLeft, Loader2, CalendarCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { templates as staticTemplates } from '../data/templates';
import api from '../services/api';
import ReservationModal from '../components/common/ReservationModal';
import YCZStoreDemo from '../components/templates/YCZStoreDemo';
import GxVaultDemo from '../components/templates/GxVaultDemo';
import HxToolsDemo from '../components/templates/HxToolsDemo';
import CarStoreDemo from '../components/templates/CarStoreDemo';
import SmmStoreDemo from '../components/templates/SmmStoreDemo';
import StellarStoreDemo from '../components/templates/StellarStoreDemo';

// Map of template IDs to their custom demo components
const customDemos = {
  'digital-services-store': YCZStoreDemo,
  'game-topup-store': GxVaultDemo,
  'hardware-tools-store': HxToolsDemo,
  'car-dealership-store': CarStoreDemo,
  'smm-store': SmmStoreDemo,
  'stellar-store': StellarStoreDemo,
};

export default function TemplatePreviewPage() {
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [template, setTemplate] = useState(() => staticTemplates.find(tp => tp.id === id));
  const [loading, setLoading] = useState(true);
  const [showReservation, setShowReservation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.getPublicProducts()
      .then(res => {
        if (cancelled) return;
        const staticT = staticTemplates.find(tp => tp.id === id);
        // Match API product by name (DB has no slug field)
        const apiByName = new Map((res.products || []).map(p => [p.name?.trim(), p]));
        const live = staticT ? apiByName.get(staticT.name?.trim()) : null;
        if (live && staticT) {
          const price = parseFloat(live.price);
          const py = live.price_yearly != null ? parseFloat(live.price_yearly) : (price ? price * 10 : null);
          const pl = live.price_lifetime != null ? parseFloat(live.price_lifetime) : (price ? price * 25 : null);
          setTemplate({
            ...staticT,
            _apiId: live.id,
            name: live.name || staticT.name,
            description: live.description || staticT.description,
            price: price ? { monthly: price, yearly: py, lifetime: pl } : staticT.price,
            image: live.image || staticT.image,
          });
        } else if (live) {
          const price = parseFloat(live.price) || 0;
          const py = live.price_yearly != null ? parseFloat(live.price_yearly) : price * 10;
          const pl = live.price_lifetime != null ? parseFloat(live.price_lifetime) : price * 25;
          setTemplate({
            id: live.id, name: live.name, nameEn: live.name,
            description: live.description || '', descriptionEn: live.description || '',
            image: live.image || '', features: [], featuresEn: [],
            price: { monthly: price, yearly: py, lifetime: pl },
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // If this template has a custom demo component, render it
  const CustomDemo = customDemos[id];
  if (CustomDemo) {
    return <CustomDemo />;
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-dark-800 mb-4">
            {isRTL ? 'القالب غير موجود' : 'Template not found'}
          </h2>
          <Link to="/templates" className="btn-primary">
            {t('preview.backToTemplates')}
          </Link>
        </div>
      </div>
    );
  }

  const prices = {
    monthly: { price: template.price.monthly, label: t('preview.monthly'), suffix: isRTL ? '/شهر' : '/mo' },
    yearly: { price: template.price.yearly, label: t('preview.yearly'), suffix: isRTL ? '/سنة' : '/yr' },
    lifetime: { price: template.price.lifetime, label: t('preview.lifetime'), suffix: isRTL ? ' دفعة واحدة' : ' one-time' },
  };

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'max-w-2xl',
    mobile: 'max-w-sm',
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-800 mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          {t('preview.backToTemplates')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Preview Area - Left/Right based on RTL */}
          <div className="lg:col-span-2">
            {/* Device Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-dark-800">
                {isRTL ? template.name : template.nameEn}
              </h1>
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl flex-shrink-0">
                {[
                  { key: 'desktop', icon: Monitor },
                  { key: 'tablet', icon: Tablet },
                  { key: 'mobile', icon: Smartphone },
                ].map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPreviewDevice(key)}
                    className={`p-2 rounded-lg transition-all ${
                      previewDevice === key
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-400 hover:text-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-white border border-gray-200 p-2 rounded-2xl shadow-sm">
              <div className={`mx-auto transition-all duration-500 ${deviceWidths[previewDevice]}`}>
                <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: previewDevice === 'mobile' ? '9/16' : previewDevice === 'tablet' ? '3/4' : '16/9' }}>
                  <img
                    src={template.image}
                    alt={isRTL ? template.name : template.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-white/90 backdrop-blur-sm px-8 py-4 text-center rounded-2xl border border-gray-200">
                      <ExternalLink className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                      <p className="text-dark-800 font-bold">{t('preview.livePreview')}</p>
                      <p className="text-dark-400 text-sm mt-1">
                        {isRTL ? 'المعاينة الحية ستكون متاحة قريباً' : 'Live preview coming soon'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-dark-800 mb-4">{t('preview.description')}</h3>
              <p className="text-dark-500 leading-relaxed text-lg">
                {isRTL ? template.description : template.descriptionEn}
              </p>
            </div>
          </div>

          {/* Sidebar - Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-dark-800 mb-6">{t('preview.choosePlan')}</h3>

                {/* Billing Toggle */}
                <div className="space-y-3 mb-6">
                  {Object.entries(prices).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setBillingCycle(key)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        billingCycle === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          billingCycle === key ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                        }`} />
                        <span className="text-dark-700 font-medium">{data.label}</span>
                      </div>
                      <span className="font-display font-bold text-dark-800">
                        ${data.price}<span className="text-dark-400 text-sm">{data.suffix}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/buy?template=${template.id}&plan=${billingCycle}`)}
                  className="btn-primary w-full text-base"
                >
                  {t('preview.buyNow')} — ${prices[billingCycle].price}
                </button>

                {/* Reserve Button */}
                <button
                  onClick={() => setShowReservation(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-primary-500 text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium mt-3"
                >
                  <CalendarCheck className="w-4 h-4" />
                  {isRTL ? 'احجز الآن — نتواصل معك' : 'Book Now — We\'ll Contact You'}
                </button>
              </div>

              {/* Features */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-dark-800 mb-4">{t('preview.keyFeatures')}</h3>
                <ul className="space-y-3">
                  {(isRTL ? template.features : template.featuresEn).map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-dark-500">
                      <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
        templateId={template.id}
        templateName={isRTL ? template.name : template.nameEn}
        plan={billingCycle}
      />
    </div>
  );
}
