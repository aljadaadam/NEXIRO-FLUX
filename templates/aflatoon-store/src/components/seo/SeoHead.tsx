'use client';

import { useEffect } from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

/**
 * Client-side SEO component — updates <head> meta tags dynamically.
 * Use for 'use client' pages to set per-page SEO.
 */
export default function SeoHead({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og-image.png',
  ogType = 'website',
  noIndex = false,
}: SeoHeadProps) {
  useEffect(() => {
    if (!title) return;

    // Update document title
    document.title = `${title} | متجر خدمات رقمية`;

    // Helper to set/create meta tag
    function setMeta(attr: string, key: string, content: string) {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    }

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:type', ogType);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    if (canonical) {
      setMeta('property', 'og:url', canonical);
      // Set canonical link
      let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.rel = 'canonical';
        document.head.appendChild(linkEl);
      }
      linkEl.href = canonical;
    }

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);

    // Robots
    if (noIndex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    }
  }, [title, description, keywords, canonical, ogImage, ogType, noIndex]);

  return null;
}
