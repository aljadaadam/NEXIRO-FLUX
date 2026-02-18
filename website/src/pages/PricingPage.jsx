import SEO from '../components/SEO';
import PricingSection from '../components/home/PricingSection';

export default function PricingPage() {
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'NEXIRO-FLUX Pricing',
    description: 'Affordable pricing plans for building professional online stores',
    mainEntity: {
      '@type': 'Product',
      name: 'NEXIRO-FLUX Platform',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: '199',
        offerCount: '4',
      },
    },
  };

  return (
    <div className="pt-24">
      <SEO
        title="Pricing Plans - Affordable Website Builder"
        titleAr="خطط الأسعار - بناء مواقع بأسعار لا تُقاوم"
        description="Choose from our affordable pricing plans. Monthly, yearly, or lifetime options. No hidden fees, cancel anytime. Build your professional online store today."
        descriptionAr="اختر من بين خطط أسعارنا المميزة. خيارات شهرية، سنوية، أو مدى الحياة. بدون رسوم مخفية، إلغاء في أي وقت. ابنِ متجرك الإلكتروني الاحترافي اليوم."
        keywords="pricing, website builder cost, online store pricing, affordable e-commerce, cheap website builder, store plans"
        keywordsAr="أسعار, تكلفة بناء مواقع, أسعار متجر إلكتروني, تجارة إلكترونية بأسعار معقولة, خطط متاجر"
        canonicalPath="/pricing"
        schema={pricingSchema}
      />
      <PricingSection />
    </div>
  );
}
