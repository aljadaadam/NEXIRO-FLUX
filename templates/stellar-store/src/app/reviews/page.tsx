'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'أحمد محمد', text: 'خدمة ممتازة وتسليم فوري. اشتريت تفعيل ويندوز واستلمته خلال دقيقة!', rating: 5 },
  { name: 'سارة علي', text: 'أفضل متجر تفعيلات في السودان. الأسعار منافسة والدعم سريع جداً.', rating: 5 },
  { name: 'محمد يوسف', text: 'جربت خدمة ستارلينك واشتغلت بدون أي مشاكل. شكراً لفريق ستيلار!', rating: 5 },
  { name: 'فاطمة حسن', text: 'اشتراك beIN بأفضل سعر. أنصح الجميع بالتعامل معهم.', rating: 4 },
  { name: 'عمر أحمد', text: 'دعم فني ممتاز ورد سريع على واتساب. خدمة احترافية.', rating: 5 },
  { name: 'هدى عثمان', text: 'اشتريت بطاقات ألعاب لأولادي. كل شيء أصلي ومافي أي مشكلة.', rating: 4 },
];

export default function ReviewsPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            آراء <span className="text-gold-gradient">العملاء</span>
          </h1>
          <p className="text-navy-400 mb-10">ماذا يقول عملاؤنا عن خدماتنا</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-4 h-4 ${j < review.rating ? 'text-gold-500 fill-gold-500' : 'text-navy-600'}`}
                    />
                  ))}
                </div>
                <p className="text-navy-300 text-sm leading-relaxed mb-4">{review.text}</p>
                <p className="text-white font-bold text-sm">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onAuth={() => window.dispatchEvent(new Event('auth-change'))} />
    </>
  );
}
