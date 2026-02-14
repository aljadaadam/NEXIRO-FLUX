"use client";

import { useEffect, useMemo, useState } from "react";

type ServicesHeroProps = {
  banners: string[];
  intervalMs?: number;
};

export default function ServicesHero({ banners, intervalMs = 4500 }: ServicesHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSrc = useMemo(() => {
    if (!Array.isArray(banners) || banners.length === 0) return null;
    return banners[Math.max(0, Math.min(activeIndex, banners.length - 1))] ?? null;
  }, [activeIndex, banners]);

  useEffect(() => {
    if (!Array.isArray(banners) || banners.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [banners, intervalMs]);

  if (!activeSrc) return null;

  return (
    <section className="services-banner" aria-label="Banner">
      <img className="services-bannerImg" src={activeSrc} alt="" loading="lazy" />
    </section>
  );
}
