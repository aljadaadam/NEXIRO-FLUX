'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import { Search, RefreshCw, Eye, X, ChevronDown, ShoppingCart, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  processing: 'bg-blue-500/15 text-blue-400',
  cancelled: 'bg-red-500/15 text-red-400',
  failed: 'bg-red-500/15 text-red-400',
  partial: 'bg-orange-500/15 text-orange-400',
};

const statusLabels: Record<string, string> = {
  completed: 'مكتمل',
  pending: 'قيد الانتظار',
  processing: 'جاري التنفيذ',
  cancelled: 'ملغي',
  failed: 'فشل',
  partial: 'جزئي',
};

const statusOptions = ['pending', 'processing', 'completed', 'cancelled', 'failed', 'partial'];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await adminApi.getOrders(1, 200, filterStatus || undefined);
      setOrders(Array.isArray(data) ? data : data?.orders || []);
    } catch { /* empty */ }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter(o => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return o.order_number?.toLowerCase().includes(s) ||
      o.product_name?.toLowerCase().includes(s) ||
      o.customer_name?.toLowerCase().includes(s);
  });

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus });
      loadOrders();
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
          <ShoppingCart className="w-7 h-7 text-gold-500" />
          الطلبات
        </h1>
        <p className="text-navy-400 text-sm mt-1">{filtered.length} طلب</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالرقم أو المنتج أو العميل..."
            className="w-full px-4 py-3 pr-12 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setLoading(true); }}
          className="px-4 py-3 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm min-w-[140px]"
        >
          <option value="">كل الحالات</option>
          {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
        </select>
        <button
          onClick={() => { setLoading(true); loadOrders(); }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-navy-900/60 border border-navy-700/50 rounded-xl text-navy-300 hover:text-white hover:border-gold-500/30 transition-all text-sm font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-navy-700 mx-auto mb-4" />
          <p className="text-navy-400 text-lg font-bold">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="bg-navy-900/60 border border-navy-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700/50">
                  {['الطلب', 'المنتج', 'العميل', 'الكمية', 'المبلغ', 'الحالة', 'التاريخ', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-start text-xs font-bold text-navy-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-navy-700/30 hover:bg-gold-500/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-gold-500 whitespace-nowrap">{order.order_number}</td>
                    <td className="px-4 py-3 text-white max-w-[180px] truncate">{order.product_name}</td>
                    <td className="px-4 py-3 text-navy-300 whitespace-nowrap">{order.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-white">{order.quantity}</td>
                    <td className="px-4 py-3 font-bold text-white">{(order.total_price || 0).toLocaleString()} <span className="text-navy-500 text-xs">SDG</span></td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`appearance-none pl-6 pr-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer border-none outline-none ${statusColors[order.status] || 'bg-navy-700/30 text-navy-300'}`}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
                        </select>
                        <ChevronDown className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy-400 text-xs whitespace-nowrap">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
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

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy-700/50 sticky top-0 bg-navy-900 z-10">
              <h3 className="text-lg font-black text-white">تفاصيل الطلب</h3>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'رقم الطلب', value: selectedOrder.order_number },
                { label: 'المنتج', value: selectedOrder.product_name },
                { label: 'العميل', value: selectedOrder.customer_name || '—' },
                { label: 'البريد', value: selectedOrder.customer_email || '—' },
                { label: 'الكمية', value: String(selectedOrder.quantity) },
                { label: 'المبلغ', value: `${(selectedOrder.total_price || 0).toLocaleString()} SDG` },
                { label: 'طريقة الدفع', value: selectedOrder.payment_method || '—' },
                { label: 'الحالة', value: statusLabels[selectedOrder.status] || selectedOrder.status },
                { label: 'الملاحظات', value: selectedOrder.notes || '—' },
                { label: 'الرابط/المعرف', value: selectedOrder.imei || '—' },
                { label: 'رد السيرفر', value: selectedOrder.server_response || selectedOrder.response || '—' },
                { label: 'التاريخ', value: selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('ar') : '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-navy-700/30">
                  <span className="text-sm font-bold text-navy-400">{item.label}</span>
                  <span className="text-sm text-white max-w-[60%] text-left break-all">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedOrder(null)}
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
