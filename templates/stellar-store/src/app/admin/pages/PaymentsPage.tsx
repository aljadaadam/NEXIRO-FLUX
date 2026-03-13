'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { Payment } from '@/lib/types';
import { Search, CreditCard, Eye, X, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  awaiting_receipt: 'bg-blue-500/15 text-blue-400',
  processing: 'bg-blue-500/15 text-blue-400',
  rejected: 'bg-red-500/15 text-red-400',
  failed: 'bg-red-500/15 text-red-400',
  refunded: 'bg-purple-500/15 text-purple-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

const statusLabels: Record<string, string> = {
  completed: 'مكتمل',
  approved: 'موافق',
  pending: 'قيد الانتظار',
  awaiting_receipt: 'بانتظار الإيصال',
  processing: 'جاري المعالجة',
  rejected: 'مرفوض',
  failed: 'فشل',
  refunded: 'مسترد',
  cancelled: 'ملغي',
};

const statusOptions = ['pending', 'awaiting_receipt', 'completed', 'failed', 'refunded', 'cancelled'];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getPayments(1, 200);
      setPayments(Array.isArray(data) ? data : data?.payments || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = payments.filter(p => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return p.customer_name?.toLowerCase().includes(s) ||
      p.customer_email?.toLowerCase().includes(s) ||
      p.reference?.toLowerCase().includes(s);
  });

  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    setUpdatingId(paymentId);
    try {
      await adminApi.updatePaymentStatus(paymentId, newStatus);
      load();
    } catch { /* empty */ }
    setUpdatingId(null);
  };

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
          <CreditCard className="w-7 h-7 text-gold-500" />
          المدفوعات
        </h1>
        <p className="text-navy-400 text-sm mt-1">{filtered.length} عملية دفع</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو المرجع..."
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
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">لا توجد مدفوعات</p>
        </div>
      ) : (
        <div className="bg-navy-900/60 border border-navy-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700/50">
                  {['#', 'العميل', 'المبلغ', 'النوع', 'الحالة', 'التاريخ', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-start text-xs font-bold text-navy-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-navy-700/30 hover:bg-gold-500/5 transition-colors">
                    <td className="px-4 py-3 text-navy-400">{p.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{p.customer_name || p.customer_email || '—'}</td>
                    <td className="px-4 py-3 font-bold text-gold-500">{(p.amount || 0).toLocaleString()} <span className="text-navy-500 text-xs">SDG</span></td>
                    <td className="px-4 py-3 text-navy-300">{p.type || p.payment_method || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          disabled={updatingId === p.id}
                          className={`appearance-none pl-6 pr-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer border-none outline-none ${statusColors[p.status] || 'bg-navy-700/30 text-navy-300'}`}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
                        </select>
                        <ChevronDown className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy-400 text-xs whitespace-nowrap">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('ar') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center hover:bg-gold-500/20 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment detail modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setSelectedPayment(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy-700/50 sticky top-0 bg-navy-900 z-10">
              <h3 className="text-lg font-black text-white">تفاصيل الدفعة</h3>
              <button onClick={() => setSelectedPayment(null)} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { l: 'رقم العملية', v: String(selectedPayment.id) },
                { l: 'العميل', v: selectedPayment.customer_name || '—' },
                { l: 'البريد', v: selectedPayment.customer_email || '—' },
                { l: 'المبلغ', v: `${(selectedPayment.amount || 0).toLocaleString()} SDG` },
                { l: 'النوع', v: selectedPayment.type || '—' },
                { l: 'طريقة الدفع', v: selectedPayment.payment_method || '—' },
                { l: 'المرجع', v: selectedPayment.reference || '—' },
                { l: 'الحالة', v: statusLabels[selectedPayment.status] || selectedPayment.status },
                { l: 'التاريخ', v: selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString('ar') : '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-navy-700/30">
                  <span className="text-sm font-bold text-navy-400">{item.l}</span>
                  <span className="text-sm text-white max-w-[60%] text-left break-all">{item.v}</span>
                </div>
              ))}

              {selectedPayment.receipt_url && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-navy-400 mb-2">إيصال الدفع</p>
                  <img src={selectedPayment.receipt_url} alt="receipt" className="w-full rounded-xl border border-navy-700/50" />
                </div>
              )}
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-3 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
