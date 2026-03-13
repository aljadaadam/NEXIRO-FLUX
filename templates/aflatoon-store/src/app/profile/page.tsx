'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { User, Package, Wallet, Settings, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">
            <span className="text-gold-gradient">حسابي</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="glass-card rounded-2xl p-6 h-fit space-y-2">
              {[
                { icon: User, label: 'معلوماتي', active: true },
                { icon: Package, label: 'طلباتي', active: false },
                { icon: Wallet, label: 'المحفظة', active: false },
                { icon: Settings, label: 'الإعدادات', active: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      item.active
                        ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                        : 'text-navy-400 hover:text-white hover:bg-navy-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-5 h-5" />
                تسجيل خروج
              </button>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">المعلومات الشخصية</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-navy-400 text-sm mb-2">الاسم</label>
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-navy-400 text-sm mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-navy-400 text-sm mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="+249..."
                    className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
                  />
                </div>
                <button className="px-8 py-3 bg-gradient-to-l from-gold-500 to-gold-400 text-navy-950 font-bold rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-md shadow-gold-500/20">
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
