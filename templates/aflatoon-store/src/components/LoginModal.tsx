'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

type Tab = 'login' | 'register' | 'forgot';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'login', label: 'دخول' },
    { key: 'register', label: 'تسجيل جديد' },
    { key: 'forgot', label: 'نسيان كلمة السر' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-navy-900/95 backdrop-blur-2xl border border-navy-700/60 shadow-2xl shadow-black/40 animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-navy-400 hover:text-white transition-colors rounded-lg hover:bg-navy-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="pt-6 pb-4 text-center">
          <h2 className="text-xl font-black text-white">
            تسجيل الدخول / <span className="text-gold-gradient">إنشاء حساب</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === t.key
                  ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                  : 'bg-navy-800/60 text-navy-300 hover:text-white border border-navy-600/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="px-6 pb-8 space-y-4">
          {tab === 'login' && (
            <>
              <div className="relative">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full px-4 py-3.5 pr-12 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور"
                  className="w-full px-12 py-3.5 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button className="w-full py-3.5 text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20 mt-2">
                دخول
              </button>
            </>
          )}

          {tab === 'register' && (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  className="w-full px-4 py-3.5 pr-12 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full px-4 py-3.5 pr-12 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور"
                  className="w-full px-12 py-3.5 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button className="w-full py-3.5 text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20 mt-2">
                إنشاء حساب
              </button>
            </>
          )}

          {tab === 'forgot' && (
            <>
              <p className="text-navy-400 text-sm text-center mb-2">
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full px-4 py-3.5 pr-12 text-right bg-navy-800/50 border border-navy-600/50 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              </div>
              <button className="w-full py-3.5 text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20 mt-2">
                إرسال رابط الاستعادة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
