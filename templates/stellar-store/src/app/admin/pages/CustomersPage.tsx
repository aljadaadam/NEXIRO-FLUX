'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '@/lib/api';
import { Search, Users, Eye, X, Ban, CheckCircle, Wallet, RefreshCw, Loader2, UserPlus, ShieldCheck, ShieldOff, Mail, Phone, Globe, Clock, TrendingUp, ArrowUpRight, DollarSign } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  wallet_balance?: number;
  status?: string;
  is_blocked?: boolean;
  joined?: string;
  created_at?: string;
  last_login_at?: string;
}

// ─── Animated Counter ───
function AnimatedCounter({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getCustomers(1, 200, searchTerm || undefined);
      setCustomers(Array.isArray(data) ? data : data?.customers || []);
    } catch { /* empty */ }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async (id: number, blocked: boolean) => {
    const msg = blocked ? 'هل أنت متأكد من حظر هذا العميل؟' : 'هل أنت متأكد من إلغاء حظر هذا العميل؟';
    if (!confirm(msg)) return;
    try {
      await adminApi.toggleBlockCustomer(id, blocked);
      load();
    } catch { /* empty */ }
  };

  const handleWalletUpdate = async () => {
    if (!selected || !walletAmount) return;
    try {
      await adminApi.updateCustomerWallet(selected.id, parseFloat(walletAmount), walletReason || undefined);
      setWalletAmount('');
      setWalletReason('');
      load();
      try {
        const d = await adminApi.getCustomerById(selected.id);
        setSelected(d.customer || d);
      } catch { /* empty */ }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'فشل تعديل المحفظة');
    }
  };

  const isBlocked = (c: Customer) => c.is_blocked || c.status === 'blocked';

  const filtered = customers.filter(c => {
    if (filter === 'active') return !isBlocked(c);
    if (filter === 'blocked') return isBlocked(c);
    return true;
  });

  const totalActive = customers.filter(c => !isBlocked(c)).length;
  const totalBlocked = customers.filter(c => isBlocked(c)).length;
  const totalWallet = customers.reduce((sum, c) => sum + (c.wallet_balance || 0), 0);
  const recentCount = customers.filter(c => {
    const d = c.last_login_at || c.joined || c.created_at;
    if (!d) return false;
    return (Date.now() - new Date(d).getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
          <p className="text-navy-400 text-sm mt-4">جاري تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'إجمالي العملاء', value: customers.length, icon: Users, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20', change: '+12%' },
    { label: 'العملاء النشطين', value: totalActive, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', change: '+8%' },
    { label: 'إجمالي المحافظ', value: totalWallet, isCurrency: true, icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', change: '+24%' },
    { label: 'نشط هذا الأسبوع', value: recentCount || customers.length, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', change: '+5%' },
  ];

  const getInitials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0]).join('');
  const avatarColors = ['from-gold-500 to-gold-600', 'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 'from-amber-500 to-amber-600'];

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center animate-float">
            <Users className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">العملاء</h1>
            <p className="text-navy-400 text-sm">إدارة عملاء متجرك</p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-navy-900/60 border border-navy-700/50 rounded-xl text-navy-300 hover:text-white hover:border-gold-500/30 transition-all text-sm font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden p-5 rounded-2xl bg-navy-900/70 border ${card.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fadeInUp`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ring-1 ring-white/5`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-400/10 text-emerald-400 text-xs font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-black text-white animate-countUp" style={{ animationDelay: `${i * 0.15 + 0.2}s` }}>
                {card.isCurrency ? (
                  <><AnimatedCounter end={card.value} duration={1800} /> <span className="text-sm text-navy-500">SDG</span></>
                ) : (
                  <AnimatedCounter end={card.value} />
                )}
              </p>
              <p className="text-navy-400 text-sm mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Search & Filter ─── */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <div className="relative flex-1">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full px-4 py-3 pr-12 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm transition-all"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: 'الكل', count: customers.length },
            { key: 'active' as const, label: 'نشط', count: totalActive },
            { key: 'blocked' as const, label: 'محظور', count: totalBlocked },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                filter === f.key
                  ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                  : 'bg-navy-900/60 text-navy-400 border border-navy-700/50 hover:border-gold-500/30 hover:text-white'
              }`}
            >
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filter === f.key ? 'bg-navy-950/20' : 'bg-navy-800'}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Customers Grid (Cards, not table) ─── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fadeIn">
          <Users className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">{searchTerm ? 'لا توجد نتائج' : 'لا يوجد عملاء'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const blocked = isBlocked(c);
            const colorIdx = c.id % avatarColors.length;
            return (
              <div
                key={c.id}
                className={`group relative bg-navy-900/70 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fadeInUp ${
                  blocked ? 'border-red-500/20 hover:shadow-red-500/5' : 'border-navy-700/40 hover:border-gold-500/30 hover:shadow-gold-500/5'
                }`}
                style={{ animationDelay: `${i * 0.06 + 0.5}s` }}
              >
                {/* Status badge */}
                <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  blocked ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20' : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                }`}>
                  {blocked ? 'محظور' : 'نشط'}
                </div>

                {/* Top gradient strip */}
                <div className={`h-1 w-full bg-gradient-to-l ${blocked ? 'from-red-500 to-red-600' : `${avatarColors[colorIdx].replace('from-', 'from-').replace('to-', 'to-')}`}`} />

                <div className="p-5">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-lg font-black shadow-lg shrink-0`}>
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-base truncate">{c.name}</h3>
                      <p className="text-navy-400 text-xs truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" /> {c.email}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-navy-500 text-xs flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> المحفظة</span>
                      <span className="text-gold-500 font-black text-sm">{(c.wallet_balance || 0).toLocaleString()} <span className="text-navy-500 text-[10px]">SDG</span></span>
                    </div>
                    {c.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-navy-500 text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> الهاتف</span>
                        <span className="text-navy-300 text-xs font-medium" dir="ltr">{c.phone}</span>
                      </div>
                    )}
                    {c.country && (
                      <div className="flex items-center justify-between">
                        <span className="text-navy-500 text-xs flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> الدولة</span>
                        <span className="text-navy-300 text-xs">{c.country}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-navy-500 text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> آخر دخول</span>
                      <span className="text-navy-400 text-xs">
                        {c.last_login_at ? new Date(c.last_login_at).toLocaleDateString('ar') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-navy-700/30">
                    <button
                      onClick={() => setSelected(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-bold hover:bg-gold-500/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> التفاصيل
                    </button>
                    <button
                      onClick={() => handleBlock(c.id, !blocked)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        blocked
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {blocked ? <><ShieldCheck className="w-3.5 h-3.5" /> إلغاء الحظر</> : <><ShieldOff className="w-3.5 h-3.5" /> حظر</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Customer Detail Modal ─── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-navy-700/50 sticky top-0 bg-navy-900 z-10">
              <button onClick={() => setSelected(null)} className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[selected.id % avatarColors.length]} flex items-center justify-center text-white text-xl font-black shadow-xl`}>
                  {getInitials(selected.name)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selected.name}</h3>
                  <p className="text-navy-400 text-sm">{selected.email}</p>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    isBlocked(selected) ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {isBlocked(selected) ? 'محظور' : 'نشط'}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet balance highlight */}
            <div className="mx-5 mt-5 p-4 rounded-xl bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gold-500" />
                  </div>
                  <span className="text-navy-300 text-sm">رصيد المحفظة</span>
                </div>
                <span className="text-2xl font-black text-gold-500">{(selected.wallet_balance || 0).toLocaleString()} <span className="text-sm text-navy-500">SDG</span></span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-0">
              {[
                { l: 'الهاتف', v: selected.phone || '—', icon: Phone },
                { l: 'الدولة', v: selected.country || '—', icon: Globe },
                { l: 'تاريخ التسجيل', v: (selected.joined || selected.created_at) ? new Date(selected.joined || selected.created_at!).toLocaleDateString('ar') : '—', icon: UserPlus },
                { l: 'آخر دخول', v: selected.last_login_at ? new Date(selected.last_login_at).toLocaleString('ar') : '—', icon: Clock },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-navy-700/20">
                    <span className="text-sm text-navy-400 flex items-center gap-2"><Icon className="w-4 h-4 text-navy-500" /> {item.l}</span>
                    <span className="text-sm text-white font-medium">{item.v}</span>
                  </div>
                );
              })}
            </div>

            {/* Wallet adjustment */}
            <div className="mx-5 mb-5 p-4 bg-navy-800/60 rounded-xl border border-navy-700/30">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold-500" />
                تعديل المحفظة
              </h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={walletAmount}
                    onChange={e => setWalletAmount(e.target.value)}
                    placeholder="المبلغ (+ أو -)"
                    className="flex-1 px-3 py-2.5 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white text-sm placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
                  />
                  <input
                    value={walletReason}
                    onChange={e => setWalletReason(e.target.value)}
                    placeholder="السبب (اختياري)"
                    className="flex-1 px-3 py-2.5 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white text-sm placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
                  />
                </div>
                <button
                  onClick={handleWalletUpdate}
                  disabled={!walletAmount}
                  className="w-full py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  تطبيق التعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
