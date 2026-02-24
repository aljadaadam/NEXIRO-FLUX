import SEO from '../components/common/SEO';
import HeroSection from '../components/home/HeroSection';
import TemplatesGallery from '../components/home/TemplatesGallery';
import FeaturesSection from '../components/home/FeaturesSection';
import TutorialsSection from '../components/home/TutorialsSection';
import PricingSection from '../components/home/PricingSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'NEXIRO-FLUX',
    description: 'منصة رائدة لبناء المتاجر والمواقع الإلكترونية الاحترافية',
    url: 'https://nexiroflux.com',
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'NEXIRO-FLUX',
      applicationCategory: 'WebApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        offerCount: '4',
      },
    },
  };

  return (
    <>
      <SEO
        title="Launch Your Professional Website in Minutes"
        titleAr="أطلق موقعك الاحترافي في دقائق"
        description="NEXIRO-FLUX — the leading platform to build professional online stores and websites. Ready-made templates, integrated dashboard, unbeatable prices. Start free today."
        descriptionAr="NEXIRO-FLUX — المنصة الرائدة لبناء المتاجر والمواقع الإلكترونية الاحترافية. قوالب جاهزة، لوحة تحكم متكاملة، أسعار لا تُقاوم. ابدأ مجاناً اليوم."
        keywords="online store builder, create website, e-commerce platform, website templates, NEXIRO-FLUX, build online store, professional templates, sell online, digital store, web design"
        keywordsAr="إنشاء متجر إلكتروني, بناء موقع, منصة تجارة إلكترونية, قوالب مواقع, NEXIRO-FLUX, متجر أونلاين, قوالب احترافية, بيع أونلاين, متجر رقمي, تصميم مواقع"
        canonicalPath="/"
        schema={homeSchema}
      />
      <HeroSection />
      <TemplatesGallery />
      <FeaturesSection />
      <TutorialsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
