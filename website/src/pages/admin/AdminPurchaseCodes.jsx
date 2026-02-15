import { useState, useEffect, useCallback } from 'react';
import {
  Key, Plus, Copy, Trash2, Search, RefreshCw, CheckCircle2,
  XCircle, Clock, Hash, Calendar, Layers, Loader2, Download,
  ToggleLeft, ToggleRight, Eye, EyeOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const discountLabels = {
  full:       { ar: 'مجاني بالكامل', en: 'Full Access',       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  percentage: { ar: 'خصم نسبة %',    en: 'Percentage Off',    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  fixed:      { ar: 'خصم مبلغ ثابت',  en: 'Fixed Discount',    color: 'text-purple-400',  bg: 'bg-purple-500/10' },
};

const cycleLabels = {
  monthly:  { ar: 'شهري',  en: 'Monthly' },
  yearly:   { ar: 'سنوي',  en: 'Yearly' },
  lifetime: { ar: 'مدى الحياة', en: 'Lifetime' },
};

export default function AdminPurchaseCodes() {
  const { isRTL } = useLanguage();
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [createdResult, setCreatedResult] = useState(null); // {type:'single'|'batch', codes:[...]}

  // Create form
  const [form, setForm] = useState({
    code: '',
    template_id: '',
    billing_cycle: 'monthly',
    discount_type: 'full',
    discount_value: 0,
    max_uses: 1,
    expires_at: '',
    note: '',
  });

  // Batch form
  const [batchForm, setBatchForm] = useState({
    count: 5,
    prefix: 'NX',
    template_id: '',
    billing_cycle: 'monthly',
    discount_type: 'full',
    discount_value: 0,
    max_uses: 1,
    expires_at: '',
    note: '',
  });

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPurchaseCodes({ search: searchQuery || undefined });
      setCodes(data.codes || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await api.createPurchaseCode({
        ...form,
        code: form.code || undefined,
        template_id: form.template_id || null,
        expires_at: form.expires_at || null,
        note: form.note || null,
      });
      setShowCreate(false);
      setForm({ code: '', template_id: '', billing_cycle: 'monthly', discount_type: 'full', discount_value: 0, max_uses: 1, expires_at: '', note: '' });
      setCreatedResult({ type: 'single', codes: [result.code] });
      fetchCodes();
    } catch (err) {
      alert(err.error || 'Failed to create code');
    } finally {
      setCreating(false);
    }
  };

  const handleBatchCreate = async () => {
    setCreating(true);
    try {
      const result = await api.createPurchaseCodesBatch({
        ...batchForm,
        template_id: batchForm.template_id || null,
        expires_at: batchForm.expires_at || null,
        note: batchForm.note || null,
      });
      setShowBatch(false);
      setBatchForm({ count: 5, prefix: 'NX', template_id: '', billing_cycle: 'monthly', discount_type: 'full', discount_value: 0, max_uses: 1, expires_at: '', note: '' });
      setCreatedResult({ type: 'batch', codes: result.codes || [] });
      fetchCodes();
    } catch (err) {
      alert(err.error || 'Failed to create batch');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (code) => {
    try {
      await api.updatePurchaseCode(code.id, { is_active: code.is_active ? 0 : 1 });
      fetchCodes();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الكود؟' : 'Are you sure you want to delete this code?')) return;
    try {
      await api.deletePurchaseCode(id);
      fetchCodes();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCodes = () => {
    const text = codes.map(c => `${c.code} | ${c.discount_type} | ${c.billing_cycle} | Uses: ${c.used_count}/${c.max_uses} | ${c.is_active ? 'Active' : 'Disabled'}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `purchase-codes-${Date.now()}.txt`;
    a.click();
  };

  const filteredCodes = codes.filter(c =>
    !searchQuery || c.code?.toLowerCase().includes(searchQuery.toLowerCase()) || c.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Key className="w-7 h-7 text-primary-400" />
            {isRTL ? 'أكواد الشراء' : 'Purchase Codes'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL ? 'إنشاء وإدارة أكواد الشراء للزبائن' : 'Create and manage purchase codes for customers'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBatch(true)}
            className="px-4 py-2.5 bg-white/5 text-white rounded-xl text-sm hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            {isRTL ? 'إنشاء دفعة' : 'Batch Create'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isRTL ? 'كود جديد' : 'New Code'}
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: isRTL ? 'الإجمالي' : 'Total', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Hash },
            { label: isRTL ? 'نشط' : 'Active', value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
            { label: isRTL ? 'مستخدَم' : 'Used', value: stats.total_uses, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
            { label: isRTL ? 'منتهي' : 'Expired', value: Number(stats.expired || 0) + Number(stats.fully_used || 0), color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
          ].map((s, i) => (
            <div key={i} className="bg-dark-800/50 rounded-2xl p-4 border border-white/5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{s.value || 0}</div>
              <div className="text-dark-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Search & Actions ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث عن كود...' : 'Search codes...'}
            className="w-full bg-dark-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-dark-500 focus:border-primary-500/30 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCodes} className="p-2.5 bg-dark-800/50 border border-white/5 rounded-xl hover:bg-white/5 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-dark-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCodes} className="p-2.5 bg-dark-800/50 border border-white/5 rounded-xl hover:bg-white/5 transition-colors" title="Export">
            <Download className="w-4 h-4 text-dark-400" />
          </button>
        </div>
      </div>

      {/* ─── Codes List ─── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-20">
          <Key className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">{isRTL ? 'لا توجد أكواد بعد' : 'No codes yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCodes.map(code => {
            const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
            const isFullyUsed = code.max_uses > 0 && code.used_count >= code.max_uses;
            const disc = discountLabels[code.discount_type] || discountLabels.full;
            const cycle = cycleLabels[code.billing_cycle] || cycleLabels.monthly;
            const usedByList = code.used_by ? (typeof code.used_by === 'string' ? JSON.parse(code.used_by) : code.used_by) : [];

            return (
              <div key={code.id} className={`bg-dark-800/50 rounded-2xl border transition-all ${!code.is_active || isExpired || isFullyUsed ? 'border-red-500/10 opacity-60' : 'border-white/5 hover:border-white/10'}`}>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Code */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-mono font-bold text-white tracking-wider">{code.code}</span>
                      <button onClick={() => copyCode(code.code)} className="text-dark-400 hover:text-white transition-colors">
                        {copiedId === code.code ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-lg ${disc.bg} ${disc.color}`}>
                        {isRTL ? disc.ar : disc.en}
                        {code.discount_type !== 'full' && ` (${code.discount_value}${code.discount_type === 'percentage' ? '%' : '$'})`}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 text-gray-400">
                        {isRTL ? cycle.ar : cycle.en}
                      </span>
                      {code.template_id && (
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                          {code.template_id}
                        </span>
                      )}
                      {isExpired && <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400">{isRTL ? 'منتهي' : 'Expired'}</span>}
                      {isFullyUsed && <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400">{isRTL ? 'مستنفد' : 'Fully Used'}</span>}
                    </div>
                    {code.note && <p className="text-dark-500 text-xs mt-1.5 truncate">{code.note}</p>}
                  </div>

                  {/* Usage count */}
                  <div className="text-center px-4">
                    <div className="text-lg font-bold text-white">{code.used_count}<span className="text-dark-500 text-sm">/{code.max_uses || '∞'}</span></div>
                    <div className="text-dark-500 text-[10px]">{isRTL ? 'استخدام' : 'uses'}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === code.id ? null : code.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-dark-400 hover:text-white"
                      title="Details"
                    >
                      {expandedId === code.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggle(code)}
                      className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${code.is_active ? 'text-emerald-400' : 'text-dark-500'}`}
                      title={code.is_active ? 'Disable' : 'Enable'}
                    >
                      {code.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-dark-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === code.id && (
                  <div className="border-t border-white/5 px-4 py-3 bg-dark-900/30 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-dark-500">{isRTL ? 'تاريخ الإنشاء' : 'Created'}</span>
                      <span className="text-gray-400">{new Date(code.created_at).toLocaleString()}</span>
                    </div>
                    {code.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-dark-500">{isRTL ? 'تاريخ الانتهاء' : 'Expires'}</span>
                        <span className={isExpired ? 'text-red-400' : 'text-gray-400'}>{new Date(code.expires_at).toLocaleString()}</span>
                      </div>
                    )}
                    {code.created_by && (
                      <div className="flex justify-between">
                        <span className="text-dark-500">{isRTL ? 'أنشأه' : 'Created by'}</span>
                        <span className="text-gray-400">{code.created_by}</span>
                      </div>
                    )}
                    {usedByList.length > 0 && (
                      <div>
                        <span className="text-dark-500 block mb-1">{isRTL ? 'استُخدم بواسطة:' : 'Used by:'}</span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {usedByList.map((u, i) => (
                            <div key={i} className="flex justify-between bg-white/5 px-2 py-1 rounded">
                              <span className="text-gray-400">{u.email}</span>
                              <span className="text-dark-500">{u.used_at ? new Date(u.used_at).toLocaleDateString() : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create Single Code Modal ─── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-dark-800 rounded-2xl border border-white/10 w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-primary-400" />
              {isRTL ? 'إنشاء كود شراء' : 'Create Purchase Code'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'الكود (اتركه فارغاً للتوليد تلقائياً)' : 'Code (leave empty to auto-generate)'}</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  placeholder="NX-XXXX-XXXX-XXXX"
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono tracking-wider placeholder:text-dark-600 focus:border-primary-500/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'نوع الخصم' : 'Discount Type'}</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm({...form, discount_type: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:border-primary-500/30 outline-none"
                  >
                    <option value="full">{isRTL ? 'مجاني بالكامل' : 'Full Access (Free)'}</option>
                    <option value="percentage">{isRTL ? 'خصم نسبة %' : 'Percentage Off'}</option>
                    <option value="fixed">{isRTL ? 'خصم مبلغ ثابت' : 'Fixed Discount'}</option>
                  </select>
                </div>
                {form.discount_type !== 'full' && (
                  <div>
                    <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'قيمة الخصم' : 'Discount Value'}</label>
                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={e => setForm({...form, discount_value: Number(e.target.value)})}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary-500/30 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'دورة الفوترة' : 'Billing Cycle'}</label>
                  <select
                    value={form.billing_cycle}
                    onChange={e => setForm({...form, billing_cycle: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:border-primary-500/30 outline-none"
                  >
                    <option value="monthly">{isRTL ? 'شهري' : 'Monthly'}</option>
                    <option value="yearly">{isRTL ? 'سنوي' : 'Yearly'}</option>
                    <option value="lifetime">{isRTL ? 'مدى الحياة' : 'Lifetime'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'عدد مرات الاستخدام' : 'Max Uses'}</label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={e => setForm({...form, max_uses: Number(e.target.value)})}
                    min={0}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary-500/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'القالب (اتركه فارغاً للجميع)' : 'Template (empty = all)'}</label>
                  <input
                    type="text"
                    value={form.template_id}
                    onChange={e => setForm({...form, template_id: e.target.value})}
                    placeholder="digital-services-store"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-dark-600 focus:border-primary-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'تاريخ الانتهاء' : 'Expires At'}</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={e => setForm({...form, expires_at: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary-500/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'ملاحظة' : 'Note'}</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm({...form, note: e.target.value})}
                  placeholder={isRTL ? 'ملاحظة داخلية...' : 'Internal note...'}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-dark-600 focus:border-primary-500/30 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-white/5 text-white rounded-xl text-sm hover:bg-white/10 transition-colors">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isRTL ? 'إنشاء' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Batch Create Modal ─── */}
      {showBatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBatch(false)}>
          <div className="bg-dark-800 rounded-2xl border border-white/10 w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-400" />
              {isRTL ? 'إنشاء أكواد متعددة' : 'Batch Create Codes'}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'العدد' : 'Count'}</label>
                  <input
                    type="number"
                    value={batchForm.count}
                    onChange={e => setBatchForm({...batchForm, count: Number(e.target.value)})}
                    min={1}
                    max={100}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'البادئة' : 'Prefix'}</label>
                  <input
                    type="text"
                    value={batchForm.prefix}
                    onChange={e => setBatchForm({...batchForm, prefix: e.target.value.toUpperCase()})}
                    placeholder="NX"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono placeholder:text-dark-600 focus:border-primary-500/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'نوع الخصم' : 'Discount Type'}</label>
                  <select
                    value={batchForm.discount_type}
                    onChange={e => setBatchForm({...batchForm, discount_type: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:border-primary-500/30 outline-none"
                  >
                    <option value="full">{isRTL ? 'مجاني بالكامل' : 'Full Access'}</option>
                    <option value="percentage">{isRTL ? 'خصم نسبة %' : 'Percentage Off'}</option>
                    <option value="fixed">{isRTL ? 'خصم مبلغ ثابت' : 'Fixed Discount'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'دورة الفوترة' : 'Billing Cycle'}</label>
                  <select
                    value={batchForm.billing_cycle}
                    onChange={e => setBatchForm({...batchForm, billing_cycle: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:border-primary-500/30 outline-none"
                  >
                    <option value="monthly">{isRTL ? 'شهري' : 'Monthly'}</option>
                    <option value="yearly">{isRTL ? 'سنوي' : 'Yearly'}</option>
                    <option value="lifetime">{isRTL ? 'مدى الحياة' : 'Lifetime'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'عدد مرات الاستخدام' : 'Max Uses'}</label>
                  <input
                    type="number"
                    value={batchForm.max_uses}
                    onChange={e => setBatchForm({...batchForm, max_uses: Number(e.target.value)})}
                    min={0}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'تاريخ الانتهاء' : 'Expires At'}</label>
                  <input
                    type="datetime-local"
                    value={batchForm.expires_at}
                    onChange={e => setBatchForm({...batchForm, expires_at: e.target.value})}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary-500/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-dark-400 text-xs mb-1 block">{isRTL ? 'ملاحظة' : 'Note'}</label>
                <input
                  type="text"
                  value={batchForm.note}
                  onChange={e => setBatchForm({...batchForm, note: e.target.value})}
                  placeholder={isRTL ? 'ملاحظة داخلية...' : 'Internal note...'}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-dark-600 focus:border-primary-500/30 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowBatch(false)} className="flex-1 py-2.5 bg-white/5 text-white rounded-xl text-sm hover:bg-white/10 transition-colors">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleBatchCreate} disabled={creating} className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                {isRTL ? `إنشاء ${batchForm.count} كود` : `Create ${batchForm.count} Codes`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Success Modal — show generated codes ─── */}
      {createdResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isRTL ? 'تم الإنشاء بنجاح!' : 'Created Successfully!'}
              </h3>
              <p className="text-dark-400 text-sm mt-1">
                {createdResult.type === 'batch'
                  ? (isRTL ? `تم إنشاء ${createdResult.codes.length} كود` : `${createdResult.codes.length} codes generated`)
                  : (isRTL ? 'الكود جاهز للاستخدام' : 'Code is ready to use')}
              </p>
            </div>

            {/* Codes List */}
            <div className="space-y-3 mb-6">
              {createdResult.codes.map((c, i) => (
                <div key={c.id || i} className="bg-dark-900 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <code className="text-lg font-mono font-bold text-primary-400 tracking-wider select-all">
                      {c.code}
                    </code>
                    <div className="flex items-center gap-2 mt-1 text-xs text-dark-400">
                      <span className={`${discountLabels[c.discount_type]?.color || 'text-white'}`}>
                        {discountLabels[c.discount_type]?.[isRTL ? 'ar' : 'en'] || c.discount_type}
                      </span>
                      <span>•</span>
                      <span>{cycleLabels[c.billing_cycle]?.[isRTL ? 'ar' : 'en'] || c.billing_cycle}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      setCopiedId(`result-${c.id || i}`);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                    title={isRTL ? 'نسخ' : 'Copy'}
                  >
                    {copiedId === `result-${c.id || i}`
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Copy className="w-5 h-5 text-dark-400" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Copy All — for batch */}
            {createdResult.codes.length > 1 && (
              <button
                onClick={() => {
                  const allCodes = createdResult.codes.map(c => c.code).join('\n');
                  navigator.clipboard.writeText(allCodes);
                  setCopiedId('result-all');
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="w-full py-2.5 mb-3 bg-white/5 text-white rounded-xl text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                {copiedId === 'result-all'
                  ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {isRTL ? 'تم النسخ!' : 'Copied!'}</>
                  : <><Copy className="w-4 h-4" /> {isRTL ? 'نسخ الكل' : 'Copy All'}</>}
              </button>
            )}

            {/* Done */}
            <button
              onClick={() => setCreatedResult(null)}
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
            >
              {isRTL ? 'تم' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
