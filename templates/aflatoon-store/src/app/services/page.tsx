'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { Search, ShoppingCart, Loader2 } from 'lucide-react';

const fallbackProducts = [
  { id: 1, name: 'تفعيل ويندوز 11 برو', category: 'تفعيلات', price: 25000, image: '/images/windows.png' },
  { id: 2, name: 'تفعيل أوفيس 365', category: 'تفعيلات', price: 35000, image: '/images/office.png' },
  { id: 3, name: 'تفعيل كاسبرسكي', category: 'تفعيلات', price: 20000, image: '/images/default-product.svg' },
  { id: 4, name: 'شحن PUBG 660 UC', category: 'ألعاب', price: 18000, image: '/images/pubg.jpg' },
  { id: 5, name: 'شحن فري فاير 1080 جوهرة', category: 'ألعاب', price: 15000, image: '/images/freefire.jpg' },
  { id: 6, name: 'بطاقة PlayStation $10', category: 'ألعاب', price: 22000, image: '/images/playstation.jpg' },
  { id: 7, name: 'اشتراك beIN شهري', category: 'beIN Sports', price: 45000, image: '/images/bein.jpg' },
  { id: 8, name: 'اشتراك beIN سنوي', category: 'beIN Sports', price: 380000, image: '/images/bein.jpg' },
  { id: 9, name: 'ستارلينك اليمن', category: 'ستارلينك', price: 380000, image: '/images/starlink-default.png' },
  { id: 10, name: 'ستارلينك نيجيريا', category: 'ستارلينك', price: 150000, image: '/images/starlink-default.png' },
  { id: 11, name: 'نتفلكس شهر', category: 'اشتراكات', price: 12000, image: '/images/netflix.jpg' },
  { id: 12, name: 'سبوتيفاي بريميوم', category: 'اشتراكات', price: 8000, image: '/images/spotify.jpg' },
];

interface DisplayProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function ServicesPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<DisplayProduct[]>(fallbackProducts);
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [loading, setLoading] = useState(true);

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
          const cats = ['الكل', ...Array.from(new Set(mapped.map((p: DisplayProduct) => p.category).filter(Boolean)))];
          setCategories(cats as string[]);
        } else {
          const cats = ['الكل', ...Array.from(new Set(fallbackProducts.map(p => p.category)))];
          setCategories(cats);
        }
      })
      .catch(() => {
        const cats = ['الكل', ...Array.from(new Set(fallbackProducts.map(p => p.category)))];
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === 'الكل' || p.category === activeCategory;
    const matchSearch = p.name.includes(search);
    return matchCategory && matchSearch;
  });

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              <span className="text-gold-gradient">التصنيفات</span>
            </h1>
            <p className="text-navy-400">تصفح جميع المنتجات والخدمات المتاحة</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                    : 'bg-navy-900/60 text-navy-300 border border-navy-700/50 hover:border-gold-500/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, idx) => (
              <div
                key={product.id}
                className="group rounded-2xl bg-navy-900/60 border border-navy-700/40 hover:border-gold-500/30 transition-all hover:-translate-y-1 overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Image area */}
                <div className="h-40 bg-gradient-to-b from-navy-800/60 to-navy-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image || '/images/default-product.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <span className="text-xs text-gold-500 font-medium bg-gold-500/10 px-2 py-1 rounded-lg">
                    {product.category}
                  </span>
                  <h3 className="text-white font-bold mt-3 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gold-500 font-black text-lg">{product.price.toLocaleString()} <span className="text-xs text-navy-500">SDG</span></span>
                    <button className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-navy-400 text-lg">لا توجد منتجات مطابقة</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
