'use client';

import { Monitor, Gamepad2, Tv, Key } from 'lucide-react';

const categories = [
  {
    icon: Key,
    title: 'التفعيلات',
    description: 'تفعيلات ويندوز، أوفيس، برامج الحماية والمزيد',
    count: '120+ منتج',
    color: 'from-gold-500/20 to-gold-600/5',
    iconColor: 'text-gold-500',
    borderColor: 'border-gold-500/20 hover:border-gold-500/40',
  },
  {
    icon: Gamepad2,
    title: 'الألعاب',
    description: 'بطاقات شحن للألعاب وحسابات جاهزة',
    count: '85+ منتج',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
  },
  {
    icon: Tv,
    title: 'beIN Sports',
    description: 'اشتراكات بين سبورت بأسعار تنافسية',
    count: '15+ باقة',
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/20 hover:border-green-500/40',
  },
  {
    icon: Monitor,
    title: 'اشتراكات',
    description: 'نتفلكس، سبوتيفاي، يوتيوب بريميوم والمزيد',
    count: '50+ خدمة',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            تصفح <span className="text-gold-gradient">أقسامنا</span>
          </h2>
          <p className="text-navy-400 text-lg max-w-xl mx-auto">
            اختر من بين مجموعة واسعة من الخدمات والمنتجات الرقمية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <a
                key={i}
                href="/services"
                className={`group relative p-6 rounded-2xl bg-gradient-to-b ${cat.color} bg-navy-900/60 border ${cat.borderColor} transition-all hover:-translate-y-1`}
              >
                <div className="mb-4">
                  <Icon className={`w-10 h-10 ${cat.iconColor}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{cat.title}</h3>
                <p className="text-navy-400 text-sm mb-3">{cat.description}</p>
                <span className="text-xs text-navy-500 font-medium">{cat.count}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
