'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';

export default function AboutPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-6">
            من <span className="text-gold-gradient">نحن</span>
          </h1>
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <p className="text-navy-300 text-lg leading-relaxed">
              <strong className="text-white">متجر الأفلاطون</strong> هو أكبر منصة تفعيلات رقمية في السودان، نوفر لك كل ما تحتاجه من تفعيلات ويندوز وأوفيس، اشتراكات بريميوم، خدمات beIN Sports، حلول ستارلينك، وبطاقات شحن الألعاب.
            </p>
            <p className="text-navy-300 text-lg leading-relaxed">
              نؤمن بأن التقنية حق للجميع، ولهذا نسعى لتقديم منتجات أصلية بأسعار تنافسية مع تسليم فوري وضمان كامل. فريقنا يعمل على مدار الساعة لضمان أفضل تجربة شراء ممكنة.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-navy-700/40">
              {[
                { label: 'عميل راضٍ', value: '5,000+' },
                { label: 'منتج رقمي', value: '300+' },
                { label: 'دعم متواصل', value: '24/7' },
                { label: 'سنوات خبرة', value: '3+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-gold-500">{stat.value}</div>
                  <div className="text-navy-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
