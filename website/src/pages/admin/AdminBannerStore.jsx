import { useState, useEffect, useCallback } from 'react';
import {
  Image, DollarSign, ShoppingCart, CheckCircle2, Clock, TrendingUp,
  RefreshCw, Loader2, Eye, EyeOff, Trash2, Plus, Edit, Tag, Hash
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function AdminBannerStore() {
  const { isRTL } = useLanguage();
  const [templates, setTemplates] = useState([]);
  const [purchaseStats, setPurchaseStats] = useState({});
  const [summary, setSummary] = useState({ totalPurchases: 0, completedPurchases: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBannerTemplates();
      setTemplates(data.templates || []);
      setPurchaseStats(data.purchaseStats || {});
      setSummary(data.summary || { totalPurchases: 0, completedPurchases: 0, totalRevenue: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const t = (ar, en) => isRTL ? ar : en;

  const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-dark-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-dark-500 mt-1">{sub}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Image className="w-7 h-7 text-primary-400" />
            {t('متجر البنرات', 'Banner Store')}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {t('إدارة قوالب البنرات وإحصائيات الشراء', 'Manage banner templates and purchase statistics')}
          </p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 rounded-xl text-dark-300 text-sm flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" />
          {t('تحديث', 'Refresh')}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ShoppingCart}
          label={t('إجمالي الطلبات', 'Total Orders')}
          value={summary.totalPurchases}
          sub={t(`${summary.completedPurchases} مكتمل`, `${summary.completedPurchases} completed`)}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={DollarSign}
          label={t('إجمالي الإيرادات', 'Total Revenue')}
          value={`$${summary.totalRevenue.toFixed(2)}`}
          sub={t('من مبيعات البنرات', 'from banner sales')}
          color="bg-emerald-500/20"
        />
        <StatCard
          icon={Tag}
          label={t('القوالب المتاحة', 'Templates Available')}
          value={templates.filter(t => t.is_active).length}
          sub={t(`${templates.length} إجمالي`, `${templates.length} total`)}
          color="bg-purple-500/20"
        />
      </div>

      {/* Templates Table */}
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-dark-700/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            {t('إحصائيات القوالب', 'Template Statistics')}
          </h2>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{t('لا توجد قوالب بنرات بعد', 'No banner templates yet')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-start">#</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-start">{t('القالب', 'Template')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-start">{t('التصنيف', 'Category')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-center">{t('السعر', 'Price')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-center">{t('الحالة', 'Status')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-center">{t('مبيعات', 'Sales')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-center">{t('معلّقة', 'Pending')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-dark-400 text-center">{t('الإيرادات', 'Revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tmpl, idx) => {
                  const stats = purchaseStats[tmpl.id] || { total: 0, completed: 0, pending: 0, revenue: 0 };
                  return (
                    <tr key={tmpl.id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                      <td className="px-5 py-4 text-dark-500 text-sm">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-dark-600/50 flex items-center justify-center">
                            <Image className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{tmpl.name}</p>
                            <p className="text-dark-500 text-xs">ID: {tmpl.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-lg bg-dark-700/50 text-dark-300 text-xs font-medium">
                          {tmpl.category || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-sm font-bold ${tmpl.price > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {tmpl.price > 0 ? `$${Number(tmpl.price).toFixed(2)}` : t('مجاني', 'Free')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {tmpl.is_active ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                            <Eye className="w-3 h-3" /> {t('نشط', 'Active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-600/50 text-dark-400 text-xs font-semibold">
                            <EyeOff className="w-3 h-3" /> {t('متوقف', 'Inactive')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> {stats.completed}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {stats.pending > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-400">
                            <Clock className="w-4 h-4" /> {stats.pending}
                          </span>
                        ) : (
                          <span className="text-dark-500 text-sm">0</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-sm font-bold ${stats.revenue > 0 ? 'text-emerald-400' : 'text-dark-500'}`}>
                          ${stats.revenue.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary Row */}
              <tfoot>
                <tr className="bg-dark-700/30 border-t border-dark-600/50">
                  <td colSpan={5} className="px-5 py-4">
                    <span className="text-sm font-bold text-white">{t('الإجمالي', 'Total')}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-bold text-emerald-400">{summary.completedPurchases}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-bold text-amber-400">
                      {summary.totalPurchases - summary.completedPurchases}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-bold text-emerald-400">${summary.totalRevenue.toFixed(2)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
