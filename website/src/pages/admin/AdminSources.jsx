import { useState, useEffect, useCallback } from 'react';
import {
  Globe, Plus, Search, Loader2, CheckCircle2, XCircle, RefreshCw,
  Edit3, Trash2, Link2, Unplug, ExternalLink, AlertCircle, X, Save, Zap, Settings2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const typeConfig = {
  woocommerce: { label: 'WooCommerce', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  shopify:     { label: 'Shopify',     color: 'text-green-400',  bg: 'bg-green-500/10' },
  api:         { label: 'API',         color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  csv:         { label: 'CSV',         color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  manual:      { label: 'Manual',      color: 'text-dark-300',   bg: 'bg-dark-500/10' },
};

export default function AdminSources() {
  const { isRTL } = useLanguage();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = { name: '', type: 'api', url: '', api_key: '', api_secret: '', sync_interval: '60', profit_margin: '0', status: 'active', config: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSources();
      setSources(data.sources || data || []);
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleSave = async () => {
    if (!form.name) { setError(isRTL ? 'اسم المصدر مطلوب' : 'Source name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.config) {
        try { payload.config = JSON.parse(payload.config); } catch { /* keep as string */ }
      }
      if (editingSource) {
        await api.updateSource(editingSource.id, payload);
        setSuccess(isRTL ? 'تم تحديث المصدر' : 'Source updated');
      } else {
        await api.createSource(payload);
        setSuccess(isRTL ? 'تم إضافة المصدر' : 'Source created');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingSource(null);
      await fetchSources();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المصدر؟' : 'Are you sure you want to delete this source?')) return;
    setDeletingId(id);
    try {
      await api.deleteSource(id);
      await fetchSources();
      setSuccess(isRTL ? 'تم حذف المصدر' : 'Source deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل الحذف' : 'Delete failed'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSync = async (id) => {
    setSyncingId(id);
    try {
      await api.request(`/sources/${id}/sync`, { method: 'POST' });
      setSuccess(isRTL ? 'تم بدء المزامنة' : 'Sync started');
      setTimeout(() => { setSuccess(''); fetchSources(); }, 2000);
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل المزامنة' : 'Sync failed'));
    } finally {
      setSyncingId(null);
    }
  };

  const openEdit = (source) => {
    setEditingSource(source);
    setForm({
      name: source.name || '',
      type: source.type || 'api',
      url: source.url || '',
      api_key: source.api_key || '',
      api_secret: source.api_secret || '',
      sync_interval: source.sync_interval || '60',
      profit_margin: source.profit_margin || '0',
      status: source.status || 'active',
      config: source.config ? (typeof source.config === 'string' ? source.config : JSON.stringify(source.config, null, 2)) : '',
    });
    setShowModal(true);
    setError('');
  };

  const openCreate = () => {
    setEditingSource(null);
    setForm(emptyForm);
    setShowModal(true);
    setError('');
  };

  const filtered = sources.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (s.name || '').toLowerCase().includes(q) || (s.type || '').toLowerCase().includes(q) || (s.url || '').toLowerCase().includes(q);
    }
    return true;
  });

  const activeSources = sources.filter(s => s.status === 'active').length;
  const totalProducts = sources.reduce((s, src) => s + (src.products_count || 0), 0);

  const inputClass = "w-full bg-[#0d1221] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{isRTL ? 'المصادر الخارجية' : 'External Sources'}</h1>
          <p className="text-dark-400 text-sm mt-1">{isRTL ? 'إدارة مصادر المنتجات الخارجية والمزامنة' : 'Manage external product sources and sync'}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          {isRTL ? 'مصدر جديد' : 'New Source'}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />{success}
        </div>
      )}
      {error && !showModal && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-primary-500/10 w-fit mb-3"><Globe className="w-5 h-5 text-primary-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : sources.length}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'إجمالي المصادر' : 'Total Sources'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 w-fit mb-3"><Link2 className="w-5 h-5 text-emerald-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : activeSources}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'مصادر نشطة' : 'Active Sources'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 w-fit mb-3"><Zap className="w-5 h-5 text-amber-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : totalProducts}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'منتجات مستوردة' : 'Imported Products'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
        <input type="text" placeholder={isRTL ? 'بحث في المصادر...' : 'Search sources...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#111827] border border-white/5 rounded-xl py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30"
          style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', [isRTL ? 'paddingLeft' : 'paddingRight']: '12px' }}
        />
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-dark-400 bg-[#111827] rounded-2xl border border-white/5">
          <Unplug className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">{isRTL ? 'لا توجد مصادر' : 'No sources found'}</p>
          <button onClick={openCreate} className="mt-3 text-primary-400 hover:text-primary-300 text-sm">{isRTL ? 'أضف مصدر جديد' : 'Add new source'}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(source => {
            const tc = typeConfig[source.type] || typeConfig.api;
            return (
              <div key={source.id} className="bg-[#111827] rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tc.bg}`}>
                      <Globe className={`w-4 h-4 ${tc.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{source.name}</p>
                      <p className={`text-xs ${tc.color}`}>{tc.label}</p>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${source.status === 'active' ? 'bg-emerald-400' : 'bg-dark-500'}`} />
                </div>

                {source.url && (
                  <p className="text-dark-500 text-xs mb-3 truncate flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {source.url}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-xs text-dark-400">
                  <span>{isRTL ? 'المنتجات' : 'Products'}: <span className="text-white">{source.products_count || 0}</span></span>
                  {source.profit_margin > 0 && (
                    <span>{isRTL ? 'الربح' : 'Profit'}: <span className="text-emerald-400">{source.profit_margin}%</span></span>
                  )}
                  {source.last_sync && (
                    <span>{isRTL ? 'آخر مزامنة' : 'Last sync'}: <span className="text-white">{new Date(source.last_sync).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span></span>
                  )}
                </div>

                <div className="flex items-center gap-1 pt-3 border-t border-white/5">
                  <button onClick={() => handleSync(source.id)} disabled={syncingId === source.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary-400 hover:bg-primary-500/10 transition-all disabled:opacity-50">
                    {syncingId === source.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {isRTL ? 'مزامنة' : 'Sync'}
                  </button>
                  <button onClick={() => openEdit(source)} className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(source.id)} disabled={deletingId === source.id}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 ml-auto">
                    {deletingId === source.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <div className="bg-[#111827] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">{editingSource ? (isRTL ? 'تعديل المصدر' : 'Edit Source') : (isRTL ? 'مصدر جديد' : 'New Source')}</h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'اسم المصدر' : 'Source Name'}</label>
                <input className={inputClass} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={isRTL ? 'مثال: متجر WooCommerce' : 'e.g. WooCommerce Store'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'النوع' : 'Type'}</label>
                  <select className={inputClass} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="api">API</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="shopify">Shopify</option>
                    <option value="csv">CSV</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{isRTL ? 'معطل' : 'Inactive'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'رابط المصدر' : 'Source URL'}</label>
                <input className={inputClass} value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">API Key</label>
                  <input className={inputClass} value={form.api_key} onChange={e => setForm({...form, api_key: e.target.value})} placeholder="ck_..." dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">API Secret</label>
                  <input type="password" className={inputClass} value={form.api_secret} onChange={e => setForm({...form, api_secret: e.target.value})} placeholder="cs_..." dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'فترة المزامنة (دقيقة)' : 'Sync Interval (min)'}</label>
                  <input type="number" className={inputClass} value={form.sync_interval} onChange={e => setForm({...form, sync_interval: e.target.value})} placeholder="60" />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'هامش الربح %' : 'Profit Margin %'}</label>
                  <input type="number" step="0.1" className={inputClass} value={form.profit_margin} onChange={e => setForm({...form, profit_margin: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'إعدادات إضافية (JSON)' : 'Extra Config (JSON)'}</label>
                <textarea className={`${inputClass} resize-none h-20 font-mono text-xs`} value={form.config} onChange={e => setForm({...form, config: e.target.value})} dir="ltr" placeholder='{"key": "value"}' />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-dark-400 hover:text-white transition-colors">{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingSource ? (isRTL ? 'حفظ التعديل' : 'Save Changes') : (isRTL ? 'إنشاء المصدر' : 'Create Source')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
