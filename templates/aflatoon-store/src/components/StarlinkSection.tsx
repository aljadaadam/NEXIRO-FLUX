'use client';

import { Plus } from 'lucide-react';

const countries = [
  { name: 'اليمن', flag: '🇾🇪', price: '380,000' },
  { name: 'ملاوي', flag: '🇲🇼', price: '380,000' },
  { name: 'هايتي', flag: '🇭🇹', price: '309,000' },
  { name: 'نيجيريا', flag: '🇳🇬', price: '150,000' },
  { name: 'الأرجنتين', flag: '🇦🇷', price: '250,000' },
  { name: 'الدومينيكان', flag: '🇩🇴', price: '317,000' },
  { name: 'كينيا', flag: '🇰🇪', price: '280,000' },
  { name: 'اليونان', flag: '🇬🇷', price: '405,000' },
];

export default function StarlinkSection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-left mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            دعم <span className="text-gold-gradient">ستارلينك</span>
          </h2>
          <p className="text-navy-400 text-lg">
            دفع الفواتير والاشتراكات السكنية والتجارية والروام
          </p>
        </div>

        {/* Country Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.map((country, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden bg-navy-900/80 border border-navy-700/50 hover:border-gold-500/30 transition-all hover:-translate-y-1"
            >
              {/* Satellite dish image placeholder */}
              <div className="relative h-36 bg-gradient-to-b from-navy-800/50 to-navy-900 flex items-center justify-center overflow-hidden">
                <div className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity">📡</div>
                {/* Flag badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-2xl">{country.flag}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-base">{country.name}</h4>
                  <p className="text-navy-400 text-xs mt-0.5">
                    <span className="text-gold-500 font-bold">{country.price}</span>
                    <span className="mr-1 text-navy-500">SDG</span>
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
