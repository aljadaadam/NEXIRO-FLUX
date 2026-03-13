'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { Search, Users, Eye, X, Ban, CheckCircle, Wallet, RefreshCw, Loader2 } from 'lucide-react';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getCustomers(1, 200, searchTerm || undefined);
      setCustomers(Array.isArray(data) ? data : data?.customers || []);
    } catch { /* empty */ }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async (id: number, blocked: boolean) => {
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
    } catch { /* empty */ }
  };

  const isBlocked = (c: Customer) => c.is_blocked || c.status === 'blocked';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-gold-500" />
          العملاء
        </h1>
        <p className="text-navy-400 text-sm mt-1">{customers.length} عميل</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full px-4 py-3 pr-12 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-navy-900/60 border border-navy-700/50 rounded-xl text-navy-300 hover:text-white hover:border-gold-500/30 transition-all text-sm font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">لا يوجد عملاء</p>
        </div>
      ) : (
        <div className="bg-navy-900/60 border border-navy-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700/50">
                  {['#', 'الاسم', 'البريد', 'المحفظة', 'الحالة', 'التاريخ', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-start text-xs font-bold text-navy-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-navy-700/30 hover:bg-gold-500/5 transition-colors">
                    <td className="px-4 py-3 text-navy-400">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                    <td className="px-4 py-3 text-navy-300">{c.email}</td>
                    <td className="px-4 py-3 font-bold text-gold-500">{(c.wallet_balance || 0).toLocaleString()} <span className="text-navy-500 text-xs">SDG</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${isBlocked(c) ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {isBlocked(c) ? 'محظور' : 'نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-400 text-xs">
                      {(c.joined || c.created_at) ? new Date(c.joined || c.created_at!).toLocaleDateString('ar') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelected(c)}
                          className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center hover:bg-gold-500/20 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBlock(c.id, !isBlocked(c))}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isBlocked(c) ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {isBlocked(c) ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy-700/50 sticky top-0 bg-navy-900 z-10">
              <h3 className="text-lg font-black text-white">تفاصيل العميل</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { l: 'الاسم', v: selected.name },
                { l: 'البريد', v: selected.email },
                { l: 'الهاتف', v: selected.phone || '—' },
                { l: 'الدولة', v: selected.country || '—' },
                { l: 'المحفظة', v: `${(selected.wallet_balance || 0).toLocaleString()} SDG` },
                { l: 'الحالة', v: isBlocked(selected) ? 'محظور' : 'نشط' },
                { l: 'آخر دخول', v: selected.last_login_at ? new Date(selected.last_login_at).toLocaleString('ar') : '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-navy-700/30">
                  <span className="text-sm font-bold text-navy-400">{item.l}</span>
                  <span className="text-sm text-white">{item.v}</span>
                </div>
              ))}
            </div>

            {/* Wallet adjustment */}
            <div className="mx-5 mb-5 p-4 bg-navy-800/60 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold-500" />
                تعديل المحفظة
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={walletAmount}
                  onChange={e => setWalletAmount(e.target.value)}
                  placeholder="المبلغ (+ أو -)"
                  className="flex-1 px-3 py-2 bg-navy-900/60 border border-navy-700/50 rounded-lg text-white text-sm placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                />
                <input
                  value={walletReason}
                  onChange={e => setWalletReason(e.target.value)}
                  placeholder="السبب (اختياري)"
                  className="flex-1 px-3 py-2 bg-navy-900/60 border border-navy-700/50 rounded-lg text-white text-sm placeholder-navy-500 focus:outline-none focus:border-gold-500/50"
                />
                <button
                  onClick={handleWalletUpdate}
                  className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-lg hover:bg-gold-400 transition-all text-sm"
                >
                  تطبيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
