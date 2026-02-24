import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const SITE_URL = 'https://nexiroflux.com';
const SITE_NAME = 'NEXIRO-FLUX';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * SEO Component — يضيف meta tags و Open Graph و Twitter Cards و JSON-LD Schema
 * 
 * @param {string} title - عنوان الصفحة
 * @param {string} description - وصف الصفحة
 * @param {string} image - صورة Open Graph
 * @param {string} type - نوع الصفحة (website, article, product)
 * @param {object} schema - JSON-LD Schema إضافي
 * @param {string} keywords - كلمات مفتاحية
 * @param {boolean} noindex - منع الأرشفة
 * @param {string} canonicalPath - مسار Canonical مخصص
 */
export default function SEO({
  title,
  titleAr,
  description,
  descriptionAr,
  image,
  type = 'website',
  schema,
  keywords,
  keywordsAr,
  noindex = false,
  canonicalPath,
  article,
}) {
  const location = useLocation();
  const { lang, isRTL } = useLanguage();

  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${SITE_URL}${currentPath}`;

  const pageTitle = isRTL
    ? (titleAr || title ? `${titleAr || title} | ${SITE_NAME}` : `${SITE_NAME} | أطلق موقعك في دقائق`)
    : (title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Launch Your Website in Minutes`);

  const pageDescription = isRTL
    ? (descriptionAr || description || 'منصة NEXIRO-FLUX - احصل على موقع إلكتروني احترافي جاهز بنقرة واحدة. قوالب مذهلة، لوحة تحكم متكاملة، أسعار لا تُقاوم. أنشئ متجرك الإلكتروني اليوم.')
    : (description || 'NEXIRO-FLUX - Get a professional website ready in one click. Stunning templates, integrated dashboard, unbeatable prices. Build your online store today.');

  const pageKeywords = isRTL
    ? (keywordsAr || keywords || 'متجر إلكتروني, إنشاء متجر, قوالب مواقع, تصميم مواقع, التجارة الإلكترونية, NEXIRO-FLUX, بناء متجر أونلاين, قوالب احترافية, بيع أونلاين, منصة متاجر')
    : (keywords || 'online store, create store, website templates, web design, e-commerce, NEXIRO-FLUX, build online store, professional templates, sell online, store platform');

  const pageImage = image || DEFAULT_IMAGE;

  // Organization Schema — always present
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: isRTL
      ? 'منصة رائدة لبناء المواقع الإلكترونية والمتاجر الاحترافية بأسهل وأسرع طريقة'
      : 'A leading platform for building professional websites and online stores the easiest and fastest way',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: isRTL ? 'ar' : 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/templates?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // BreadcrumbList Schema
  const breadcrumbs = generateBreadcrumbs(currentPath, isRTL);
  const breadcrumbSchema = breadcrumbs.length > 1 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  } : null;

  // Article Schema for tutorials
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: pageImage,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: isRTL ? 'ar' : 'en',
    datePublished: article.datePublished || '2026-01-01',
    dateModified: article.dateModified || '2026-02-18',
  } : null;

  return (
    <Helmet>
      {/* Basic Meta */}
      <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Language Alternates */}
      <link rel="alternate" hrefLang="ar" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={isRTL ? 'ar_AR' : 'en_US'} />
      <meta property="og:locale:alternate" content={isRTL ? 'en_US' : 'ar_AR'} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#0a0a1a" />
      <meta name="author" content={SITE_NAME} />
      <meta name="generator" content="NEXIRO-FLUX Platform" />
      <meta name="application-name" content={SITE_NAME} />

      {/* Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

function generateBreadcrumbs(path, isRTL) {
  const segments = path.split('/').filter(Boolean);
  const crumbs = [{ name: isRTL ? 'الرئيسية' : 'Home', path: '/' }];

  const nameMap = {
    templates: isRTL ? 'القوالب' : 'Templates',
    pricing: isRTL ? 'الأسعار' : 'Pricing',
    tutorials: isRTL ? 'الشروحات' : 'Tutorials',
    login: isRTL ? 'تسجيل الدخول' : 'Login',
    register: isRTL ? 'إنشاء حساب' : 'Register',
    terms: isRTL ? 'الشروط والأحكام' : 'Terms',
    privacy: isRTL ? 'سياسة الخصوصية' : 'Privacy',
    refund: isRTL ? 'سياسة الاسترجاع' : 'Refund',
  };

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    crumbs.push({
      name: nameMap[segment] || segment,
      path: currentPath,
    });
  });

  return crumbs;
}
