import SEO from '../components/SEO';
import TemplatesGallery from '../components/home/TemplatesGallery';

export default function TemplatesPage() {
  return (
    <div className="pt-24">
      <SEO
        title="Website Templates & Online Store Themes"
        titleAr="قوالب المواقع والمتاجر الإلكترونية"
        description="Browse our collection of stunning, professional website templates and online store themes. Customizable, fast, and SEO-optimized. Start building your dream website today."
        descriptionAr="تصفح مجموعتنا من قوالب المواقع والمتاجر الإلكترونية الاحترافية المذهلة. قابلة للتخصيص، سريعة، ومحسّنة لمحركات البحث. ابدأ ببناء موقع أحلامك اليوم."
        keywords="website templates, online store themes, e-commerce templates, professional website design, responsive templates, store builder templates"
        keywordsAr="قوالب مواقع, ثيمات متاجر إلكترونية, قوالب تجارة إلكترونية, تصميم مواقع احترافية, قوالب متجاوبة, قوالب بناء متاجر"
        canonicalPath="/templates"
      />
      <TemplatesGallery />
    </div>
  );
}
