'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats(data))
      .catch(() => setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'المنتجات', value: stats?.totalProducts || 0, icon: Package, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20' },
    { label: 'الطلبات', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString()} SDG`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { label: 'العملاء', value: stats?.totalCustomers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">مرحباً بك 👋</h1>
        <p className="text-navy-400 text-sm mt-1">نظرة عامة على متجرك</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl bg-navy-900/60 border ${card.border} animate-fadeInUp`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{card.value}</p>
              <p className="text-navy-400 text-sm mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick tips */}
      <div className="bg-navy-900/60 border border-navy-700/50 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">بدء سريع</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-navy-300 text-sm">
            <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-xs font-bold shrink-0">1</div>
            <span>أضف منتجاتك من صفحة <b className="text-gold-500">المنتجات</b></span>
          </div>
          <div className="flex items-center gap-3 text-navy-300 text-sm">
            <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-xs font-bold shrink-0">2</div>
            <span>نظّم أقسامك من صفحة <b className="text-gold-500">الأقسام</b></span>
          </div>
          <div className="flex items-center gap-3 text-navy-300 text-sm">
            <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-xs font-bold shrink-0">3</div>
            <span>ارفع صور المنتجات لجذب العملاء</span>
          </div>
        </div>
      </div>
    </div>
  );
}
