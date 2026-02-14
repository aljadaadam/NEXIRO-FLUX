"use client";

import { useEffect, useMemo, useState } from "react";

type BannersResponse = {
  files: string[];
};

export default function Hero() {
  const [banners, setBanners] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/banners", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as BannersResponse;
        if (!isMounted) return;
        setBanners(Array.isArray(data.files) ? data.files : []);
      } catch {
        // ignore
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeSrc = useMemo(() => {
    if (banners.length === 0) return null;
    return banners[Math.max(0, Math.min(activeIndex, banners.length - 1))] ?? null;
  }, [activeIndex, banners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [banners.length]);

  if (!activeSrc) return null;

  return (
    <section aria-label="Banner">
      <img
        src={activeSrc}
        alt=""
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
        }}
      />
    </section>
  );
}
