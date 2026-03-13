'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

const fallbackProducts = [
  { id: 0, name: 'ستارلينك', category: 'ستارلينك', price: 380000, image: '/images/starlink-default.png' },
  { id: 1, name: 'تفعيل ويندوز 11 برو', category: 'تفعيلات', price: 25000, image: '/images/windows.png' },
  { id: 2, name: 'شحن PUBG 660 UC', category: 'ألعاب', price: 18000, image: '/images/pubg.jpg' },
  { id: 3, name: 'اشتراك beIN شهري', category: 'beIN Sports', price: 45000, image: '/images/bein.jpg' },
  { id: 4, name: 'تفعيل أوفيس 365', category: 'تفعيلات', price: 35000, image: '/images/office.png' },
  { id: 5, name: 'نتفلكس شهر', category: 'اشتراكات', price: 12000, image: '/images/netflix.jpg' },
  { id: 6, name: 'بطاقة PlayStation $10', category: 'ألعاب', price: 22000, image: '/images/playstation.jpg' },
  { id: 7, name: 'سبوتيفاي بريميوم', category: 'اشتراكات', price: 8000, image: '/images/spotify.jpg' },
  { id: 8, name: 'شحن فري فاير 1080 جوهرة', category: 'ألعاب', price: 15000, image: '/images/freefire.jpg' },
];

interface FeaturedProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function FeaturedSection() {
  const [products, setProducts] = useState<FeaturedProduct[]>(fallbackProducts);

  useEffect(() => {
    fetch('/api/products/public')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p: Record<string, unknown>) => ({
            id: p.id as number,
            name: (p.arabic_name || p.name) as string,
            category: (p.group_name || p.category || '') as string,
            price: (p.final_price || p.price) as number,
            image: (p.image || '/images/default-product.svg') as string,
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

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
              className="group rounded-2xl bg-navy-900/60 border border-navy-700/40 hover:border-gold-500/30 transition-all hover:-translate-y-1 overflow-hidden animate-fadeInUp"
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
