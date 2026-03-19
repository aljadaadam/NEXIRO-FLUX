'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FeaturedProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function FeaturedSection() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products/public')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = Array.isArray(data) ? data : data?.products || [];
        if (list.length > 0) {
          // Show only featured products; fallback to first 8 if none featured
          const mapped = list.map((p: Record<string, unknown>) => ({
            id: p.id as number,
            name: (p.arabic_name || p.name) as string,
            category: (p.group_name || p.category || '') as string,
            price: (p.final_price || p.price) as number,
            image: (p.image || '/images/default-product.svg') as string,
            is_featured: !!(p.is_featured),
          }));
          const featured = mapped.filter((p: FeaturedProduct & { is_featured: boolean }) => p.is_featured);
          setProducts(featured.length > 0 ? featured : mapped.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-gold-500 text-sm font-bold">عروض مختارة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              منتجات <span className="text-gold-gradient">مميزة</span>
            </h2>
            <p className="text-navy-400 text-lg">
              أفضل المنتجات والخدمات الرقمية بأسعار تنافسية
            </p>
          </div>
          <Link
            href="/services"
            className="hidden sm:inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 font-bold transition-colors group"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              onClick={() => router.push(`/services?cat=${encodeURIComponent(product.category)}`)}
              className="group rounded-2xl bg-navy-900/60 border border-navy-700/40 hover:border-gold-500/30 transition-all hover:-translate-y-1 overflow-hidden animate-fadeInUp cursor-pointer"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Image */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-b from-navy-800/60 to-navy-900 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || '/images/default-product.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Category badge */}
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] sm:text-xs text-gold-500 font-medium bg-navy-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gold-500/20">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <h4 className="text-white font-bold text-sm sm:text-base mb-2 line-clamp-1">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gold-500 font-black text-sm sm:text-lg">
                    {product.price.toLocaleString()}
                    <span className="text-[10px] sm:text-xs text-navy-500 mr-1">SDG</span>
                  </span>
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center justify-center">
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-950 px-6 py-3 rounded-xl font-bold transition-all"
          >
            عرض كل المنتجات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
