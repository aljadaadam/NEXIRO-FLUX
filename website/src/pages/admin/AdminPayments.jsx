import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, Clock, CheckCircle2,
  XCircle, AlertCircle, RefreshCw, Search, Filter, Eye,
  ArrowUpRight, ArrowDownRight, Wallet, Banknote, Loader2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const statusConfig = {
  pending:   { labelAr: 'قيد الانتظار', labelEn: 'Pending',   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock },
  completed: { labelAr: 'مكتمل',       labelEn: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  failed:    { labelAr: 'فشل',         labelEn: 'Failed',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
  refunded:  { labelAr: 'مسترد',       labelEn: 'Refunded',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: RefreshCw },
  cancelled: { labelAr: 'ملغي',        labelEn: 'Cancelled', color: 'text-dark-400',    bg: 'bg-dark-500/10',    border: 'border-dark-500/20',    icon: XCircle },
};

const methodConfig = {
  wallet:        { labelAr: 'المحفظة',       labelEn: 'Wallet',        icon: Wallet },
  binance:       { labelAr: 'بينانس',        labelEn: 'Binance',       icon: DollarSign },
  paypal:        { labelAr: 'باي بال',       labelEn: 'PayPal',        icon: CreditCard },
  bank_transfer: { labelAr: 'تحويل بنكي',    labelEn: 'Bank Transfer', icon: Banknote },
  e_wallet:      { labelAr: 'محفظة إلكترونية', labelEn: 'E-Wallet',     icon: Wallet },
  credit_card:   { labelAr: 'بطاقة ائتمان',   labelEn: 'Credit Card',  icon: CreditCard },
  crypto:        { labelAr: 'عملات رقمية',    labelEn: 'Crypto',        icon: DollarSign },
};

export default function AdminPayments() {
  const { isRTL } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPlatformPayments({ status: filterStatus !== 'all' ? filterStatus : undefined });
      setPayments(data.payments || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.updatePlatformPaymentStatus(id, newStatus);
      await fetchPayments();
    } catch (err) {
      console.error('Failed to update payment status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = payments.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (p.customer_name || '').toLowerCase().includes(q) ||
        (p.payment_method || '').toLowerCase().includes(q) ||
        (p.site_domain || '').toLowerCase().includes(q) ||
        (p.site_name || '').toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        String(p.amount).includes(q)
      );
    }
    return true;
  });

  const statCards = [
    {
      labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue',
      value: stats ? `$${Number(stats.totalRevenue || 0).toLocaleString()}` : '—',
      icon: DollarSign, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10'
    },
    {
      labelAr: 'إيرادات اليوم', labelEn: 'Today Revenue',
      value: stats ? `$${Number(stats.todayRevenue || 0).toLocaleString()}` : '—',
      icon: TrendingUp, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-500/10'
    },
    {
      labelAr: 'قيد الانتظار', labelEn: 'Pending',
      value: stats ? (stats.pending || 0) : '—',
      icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10'
    },
    {
      labelAr: 'إجمالي العمليات', labelEn: 'Total Transactions',
      value: stats ? (stats.total || 0) : '—',
      icon: CreditCard, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-500/10'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          {isRTL ? 'المدفوعات' : 'Payments'}
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {isRTL ? 'إدارة جميع عمليات الدفع وبوابات الدفع' : 'Manage all payments and payment gateways'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} style={{ stroke: 'url(#grad)' }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {statsLoading ? <span className="inline-block w-16 h-6 bg-white/5 rounded animate-pulse" /> : card.value}
              </p>
              <p className="text-dark-400 text-xs mt-1">{isRTL ? card.labelAr : card.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input
            type="text"
            placeholder={isRTL ? 'بحث في المدفوعات...' : 'Search payments...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30"
            style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', [isRTL ? 'paddingLeft' : 'paddingRight']: '12px' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'pending', 'completed', 'failed', 'refunded'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'
              }`}
            >
              {status === 'all'
                ? (isRTL ? 'الكل' : 'All')
                : (isRTL ? statusConfig[status]?.labelAr : statusConfig[status]?.labelEn)
              }
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-400">
            <CreditCard className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{isRTL ? 'لا توجد مدفوعات' : 'No payments found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">#</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'الموقع' : 'Site'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'الطريقة' : 'Method'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'النوع' : 'Type'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="text-start text-dark-500 font-medium px-5 py-3 text-xs uppercase tracking-wider">{isRTL ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(payment => {
                  const st = statusConfig[payment.status] || statusConfig.pending;
                  const method = methodConfig[payment.payment_method] || { labelAr: payment.payment_method, labelEn: payment.payment_method, icon: CreditCard };
                  const StatusIcon = st.icon;
                  const MethodIcon = method.icon;

                  return (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-dark-400 font-mono text-xs">#{payment.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-white text-sm truncate max-w-[150px]">{payment.site_name || payment.site_domain || '—'}</p>
                        <p className="text-dark-500 text-[11px] truncate max-w-[150px]">{payment.site_domain || ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white font-semibold">${parseFloat(payment.amount).toLocaleString()}</p>
                        <p className="text-dark-500 text-[11px]">{payment.currency || 'USD'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-3.5 h-3.5 text-dark-400" />
                          <span className="text-dark-300 text-xs">{isRTL ? method.labelAr : method.labelEn}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-dark-400 text-xs capitalize">{payment.type || 'purchase'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {isRTL ? st.labelAr : st.labelEn}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-dark-400 text-xs">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {payment.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateStatus(payment.id, 'completed')}
                              disabled={updatingId === payment.id}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                              title={isRTL ? 'قبول' : 'Approve'}
                            >
                              {updatingId === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(payment.id, 'failed')}
                              disabled={updatingId === payment.id}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                              title={isRTL ? 'رفض' : 'Reject'}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(payment.id, 'refunded')}
                            disabled={updatingId === payment.id}
                            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                            title={isRTL ? 'استرداد' : 'Refund'}
                          >
                            {updatingId === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
