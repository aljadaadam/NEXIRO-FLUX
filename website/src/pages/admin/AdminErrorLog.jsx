import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Trash2, Loader2, Search, ChevronDown, ChevronUp,
  RefreshCw, Bug, AlertCircle, Info, Globe, Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const levelConfig = {
  error: { labelAr: 'خطأ', labelEn: 'Error', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  warn:  { labelAr: 'تحذير', labelEn: 'Warning', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  info:  { labelAr: 'معلومة', labelEn: 'Info', icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function AdminErrorLog() {
  const { isRTL } = useLanguage();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getErrorLogs({ page, limit: 50, level: levelFilter, search });
      setErrors(data.rows || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch error logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, levelFilter, search]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const handleClear = async () => {
    if (!confirm(isRTL ? 'هل تريد مسح جميع سجلات الأخطاء؟' : 'Clear all error logs?')) return;
    setClearing(true);
    try {
      await api.clearErrorLogs();
      setErrors([]);
      setTotal(0);
      setPage(1);
    } catch (err) {
      console.error('Failed to clear:', err);
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Bug className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isRTL ? 'سجل الأخطاء' : 'Error Log'}
            </h1>
            <p className="text-xs text-gray-500">
              {isRTL ? `${total} سجل` : `${total} entries`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchErrors}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {total > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm"
            >
              {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {isRTL ? 'مسح الكل' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-gray-500`} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={isRTL ? 'بحث في الأخطاء...' : 'Search errors...'}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500/50`}
          />
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {[
            { value: '', labelAr: 'الكل', labelEn: 'All' },
            { value: 'error', labelAr: 'أخطاء', labelEn: 'Errors' },
            { value: 'warn', labelAr: 'تحذيرات', labelEn: 'Warnings' },
            { value: 'info', labelAr: 'معلومات', labelEn: 'Info' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => { setLevelFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                levelFilter === f.value
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isRTL ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Error List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        </div>
      ) : errors.length === 0 ? (
        <div className="text-center py-20">
          <Bug className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {isRTL ? 'لا توجد أخطاء مسجلة' : 'No errors logged'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map((err) => {
            const cfg = levelConfig[err.level] || levelConfig.error;
            const Icon = cfg.icon;
            const isExpanded = expandedId === err.id;

            return (
              <div
                key={err.id}
                className={`rounded-xl border ${cfg.border} bg-[#0d1221] overflow-hidden transition-all`}
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : err.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-mono">{err.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                      {err.source && <span className="text-gray-400">{err.source}</span>}
                      {err.request_method && (
                        <span>{err.request_method} {err.request_url}</span>
                      )}
                      {err.site_key && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {err.site_key}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(err.created_at)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-3">
                      {[
                        { label: isRTL ? 'المستوى' : 'Level', value: isRTL ? cfg.labelAr : cfg.labelEn },
                        { label: isRTL ? 'المصدر' : 'Source', value: err.source || '—' },
                        { label: 'IP', value: err.ip_address || '—' },
                        { label: isRTL ? 'المستخدم' : 'User ID', value: err.user_id || '—' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] rounded-lg p-2">
                          <p className="text-[10px] text-gray-600 uppercase">{item.label}</p>
                          <p className="text-xs text-gray-300 mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {err.stack && (
                      <div className="bg-black/30 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                          {err.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm disabled:opacity-30 hover:bg-white/10 transition-all"
          >
            {isRTL ? 'التالي' : 'Prev'}
          </button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm disabled:opacity-30 hover:bg-white/10 transition-all"
          >
            {isRTL ? 'السابق' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
