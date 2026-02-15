import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Search, Loader2, CheckCircle2, Clock, XCircle,
  Truck, Package, Eye, RefreshCw, DollarSign, TrendingUp, AlertCircle, X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const statusConfig = {
  pending:    { labelAr: 'قيد الانتظار', labelEn: 'Pending',    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock },
  processing: { labelAr: 'قيد المعالجة', labelEn: 'Processing', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: RefreshCw },
  completed:  { labelAr: 'مكتمل',       labelEn: 'Completed',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  shipped:    { labelAr: 'تم الشحن',   labelEn: 'Shipped',    color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    icon: Truck },
  cancelled:  { labelAr: 'ملغي',       labelEn: 'Cancelled',  color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
  refunded:   { labelAr: 'مسترد',       labelEn: 'Refunded',   color: 'text-dark-400',    bg: 'bg-dark-500/10',    border: 'border-dark-500/20',    icon: RefreshCw },
};

export default function AdminOrders() {
  const { isRTL } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.updateOrderStatus(id, newStatus);
      await fetchOrders();
      setSuccess(isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        String(o.id).includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        (o.product_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (parseFloat(o.total || o.amount) || 0), 0);

  const statCards = [
    { labelAr: 'إجمالي الطلبات', labelEn: 'Total Orders', value: totalOrders, icon: ShoppingCart, bg: 'bg-primary-500/10', color: 'text-primary-400' },
    { labelAr: 'قيد الانتظار', labelEn: 'Pending', value: pendingOrders, icon: Clock, bg: 'bg-yellow-500/10', color: 'text-yellow-400' },
    { labelAr: 'مكتملة', labelEn: 'Completed', value: completedOrders, icon: CheckCircle2, bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
    { labelAr: 'إجمالي الإيرادات', labelEn: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'bg-cyan-500/10', color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">{isRTL ? 'الطلبات' : 'Orders'}</h1>
        <p className="text-dark-400 text-sm mt-1">{isRTL ? 'إدارة طلبات المتجر' : 'Manage store orders'}</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />{success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-2xl border border-white/5 p-5">
              <div className={`p-2.5 rounded-xl ${card.bg} w-fit mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-12 h-6 bg-white/5 rounded animate-pulse" /> : card.value}</p>
              <p className="text-dark-400 text-xs mt-1">{isRTL ? card.labelAr : card.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input type="text" placeholder={isRTL ? 'بحث في الطلبات...' : 'Search orders...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30"
            style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', [isRTL ? 'paddingLeft' : 'paddingRight']: '12px' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'pending', 'processing', 'completed', 'shipped', 'cancelled'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'}`}>
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusConfig[status]?.labelAr : statusConfig[status]?.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-400">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">#</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'العميل' : 'Customer'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'المنتج' : 'Product'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(order => {
                  const st = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = st.icon;
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-dark-400 font-mono text-xs">#{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-white text-sm">{order.customer_name || (isRTL ? 'غير محدد' : 'N/A')}</p>
                        <p className="text-dark-500 text-[11px]">{order.customer_email || ''}</p>
                      </td>
                      <td className="px-5 py-4 text-dark-300 text-sm">{order.product_name || `#${order.product_id || '—'}`}</td>
                      <td className="px-5 py-4 text-white font-semibold">${parseFloat(order.total || order.amount || 0).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {isRTL ? st.labelAr : st.labelEn}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-dark-400 text-xs">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-all" title={isRTL ? 'عرض' : 'View'}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {order.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(order.id, 'processing')} disabled={updatingId === order.id}
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50" title={isRTL ? 'معالجة' : 'Process'}>
                                {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} disabled={updatingId === order.id}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50" title={isRTL ? 'إلغاء' : 'Cancel'}>
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {order.status === 'processing' && (
                            <button onClick={() => handleUpdateStatus(order.id, 'completed')} disabled={updatingId === order.id}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50" title={isRTL ? 'إكمال' : 'Complete'}>
                              {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#111827] rounded-2xl border border-white/10 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">{isRTL ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: isRTL ? 'العميل' : 'Customer', value: selectedOrder.customer_name || '—' },
                { label: isRTL ? 'البريد' : 'Email', value: selectedOrder.customer_email || '—' },
                { label: isRTL ? 'المنتج' : 'Product', value: selectedOrder.product_name || `#${selectedOrder.product_id || '—'}` },
                { label: isRTL ? 'الكمية' : 'Quantity', value: selectedOrder.quantity || 1 },
                { label: isRTL ? 'المبلغ' : 'Amount', value: `$${parseFloat(selectedOrder.total || selectedOrder.amount || 0).toFixed(2)}` },
                { label: isRTL ? 'الحالة' : 'Status', value: isRTL ? statusConfig[selectedOrder.status]?.labelAr : statusConfig[selectedOrder.status]?.labelEn },
                { label: isRTL ? 'التاريخ' : 'Date', value: selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '—' },
                { label: isRTL ? 'ملاحظات' : 'Notes', value: selectedOrder.notes || '—' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-dark-400 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
