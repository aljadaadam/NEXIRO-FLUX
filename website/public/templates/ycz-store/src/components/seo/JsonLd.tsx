'use client';

import { useEffect } from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Injects JSON-LD structured data into <head> for SEO.
 * Supports single schema or array of schemas.
 */
export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const id = 'jsonld-seo';
    // Remove old script if exists
    const old = document.getElementById(id);
    if (old) old.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [data]);

  return null;
}
