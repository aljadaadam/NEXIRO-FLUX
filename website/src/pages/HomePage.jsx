import HeroSection from '../components/home/HeroSection';
import TemplatesGallery from '../components/home/TemplatesGallery';
import FeaturesSection from '../components/home/FeaturesSection';
import TutorialsSection from '../components/home/TutorialsSection';
import PricingSection from '../components/home/PricingSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  return (
    <>
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
