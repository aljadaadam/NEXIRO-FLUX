import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck, Search, Loader2, CheckCircle2, Clock, Phone, Mail,
  User, XCircle, Trash2, X, ExternalLink, Inbox, MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const statusConfig = {
  pending:   { labelAr: 'بانتظار',   labelEn: 'Pending',    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  contacted: { labelAr: 'تم التواصل', labelEn: 'Contacted',  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  completed: { labelAr: 'مكتمل',      labelEn: 'Completed',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  cancelled: { labelAr: 'ملغي',       labelEn: 'Cancelled',  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
};

const planLabels = {
  monthly:  { ar: 'شهري', en: 'Monthly' },
  yearly:   { ar: 'سنوي', en: 'Yearly' },
  lifetime: { ar: 'مدى الحياة', en: 'Lifetime' },
};

export default function AdminReservations() {
  const { isRTL } = useLanguage();
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Detail view
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getReservations({ status: filterStatus !== 'all' ? filterStatus : undefined });
      setReservations(data.reservations || []);
      setStats(data.stats || { total: 0, pending: 0, contacted: 0, completed: 0 });
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    setError('');
    try {
      await api.updateReservationStatus(id, newStatus, adminNotes || undefined);
      setSuccess(isRTL ? 'تم تحديث الحالة' : 'Status updated');
      setTimeout(() => setSuccess(''), 3000);
      await fetchReservations();
      if (selectedReservation?.id === id) {
        const updated = (await api.getReservations()).reservations?.find(r => r.id === id);
        if (updated) setSelectedReservation(updated);
      }
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل التحديث' : 'Update failed'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isRTL ? 'هل تريد حذف هذا الحجز؟' : 'Delete this reservation?')) return;
    try {
      await api.deleteReservation(id);
      setSuccess(isRTL ? 'تم الحذف' : 'Deleted');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedReservation(null);
      await fetchReservations();
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل الحذف' : 'Delete failed'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const filtered = reservations.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (r.name || '').toLowerCase().includes(q) ||
             (r.email || '').toLowerCase().includes(q) ||
             (r.phone || '').toLowerCase().includes(q) ||
             (r.template_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const inputClass = "w-full bg-[#0d1221] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30";

  // ═══ Detail View ═══
  if (selectedReservation) {
    const r = selectedReservation;
    const st = statusConfig[r.status] || statusConfig.pending;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedReservation(null)} className="flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors">
          <XCircle className="w-4 h-4" />
          {isRTL ? 'العودة للحجوزات' : 'Back to Reservations'}
        </button>

        {success && <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"><CheckCircle2 className="w-5 h-5" />{success}</div>}
        {error && <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><XCircle className="w-5 h-5" />{error}</div>}

        <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary-400" />
                {isRTL ? 'تفاصيل الحجز' : 'Reservation Details'}
              </h2>
              <p className="text-dark-500 text-xs">#{r.id} — {r.created_at ? new Date(r.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : ''}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border}`}>
              {isRTL ? st.labelAr : st.labelEn}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-dark-500 text-xs mb-1"><User className="w-3.5 h-3.5" />{isRTL ? 'الاسم' : 'Name'}</div>
              <p className="text-white text-sm font-medium">{r.name}</p>
            </div>
            {/* Email */}
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-dark-500 text-xs mb-1"><Mail className="w-3.5 h-3.5" />{isRTL ? 'البريد' : 'Email'}</div>
              <a href={`mailto:${r.email}`} className="text-primary-400 text-sm hover:underline">{r.email}</a>
            </div>
            {/* Phone */}
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-dark-500 text-xs mb-1"><Phone className="w-3.5 h-3.5" />{isRTL ? 'الهاتف' : 'Phone'}</div>
              {r.phone ? (
                <a href={`tel:${r.phone}`} className="text-white text-sm hover:text-primary-400 transition-colors">{r.phone}</a>
              ) : (
                <span className="text-dark-600 text-sm">{isRTL ? 'غير متوفر' : 'N/A'}</span>
              )}
            </div>
            {/* Template */}
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-dark-500 text-xs mb-1"><ExternalLink className="w-3.5 h-3.5" />{isRTL ? 'القالب' : 'Template'}</div>
              <p className="text-white text-sm font-medium">{r.template_name}</p>
              <p className="text-dark-500 text-xs mt-0.5">{isRTL ? (planLabels[r.plan]?.ar || r.plan) : (planLabels[r.plan]?.en || r.plan)}</p>
            </div>
          </div>

          {/* Message */}
          {r.message && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-dark-500 text-xs mb-1"><MessageSquare className="w-3.5 h-3.5" />{isRTL ? 'رسالة العميل' : 'Customer Message'}</div>
              <p className="text-dark-300 text-sm whitespace-pre-wrap">{r.message}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div className="mt-4">
            <label className="block text-xs text-dark-400 mb-1.5">{isRTL ? 'ملاحظات الأدمن' : 'Admin Notes'}</label>
            <textarea
              className={`${inputClass} resize-none h-20`}
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
            />
          </div>

          {/* Status Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {r.status !== 'contacted' && (
              <button
                onClick={() => handleUpdateStatus(r.id, 'contacted')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                {isRTL ? 'تم التواصل' : 'Mark Contacted'}
              </button>
            )}
            {r.status !== 'completed' && (
              <button
                onClick={() => handleUpdateStatus(r.id, 'completed')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isRTL ? 'مكتمل' : 'Mark Completed'}
              </button>
            )}
            {r.status !== 'cancelled' && (
              <button
                onClick={() => handleUpdateStatus(r.id, 'cancelled')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            )}
            <button
              onClick={() => handleDelete(r.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-dark-400 text-sm font-medium hover:text-red-400 hover:border-red-500/20 transition-colors ms-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isRTL ? 'حذف' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ List View ═══
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <CalendarCheck className="w-6 h-6 text-primary-400" />
          {isRTL ? 'الحجوزات' : 'Reservations'}
        </h1>
        <p className="text-dark-400 text-sm mt-1">{isRTL ? 'طلبات الحجز من الزوار — تواصل معهم لإكمال الشراء' : 'Visitor booking requests — contact them to complete the purchase'}</p>
      </div>

      {/* Messages */}
      {success && <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"><CheckCircle2 className="w-5 h-5" />{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-primary-500/10 w-fit mb-3"><CalendarCheck className="w-5 h-5 text-primary-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : stats.total}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'إجمالي الحجوزات' : 'Total'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 w-fit mb-3"><Clock className="w-5 h-5 text-yellow-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : stats.pending}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'بانتظار' : 'Pending'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 w-fit mb-3"><Phone className="w-5 h-5 text-blue-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : stats.contacted}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'تم التواصل' : 'Contacted'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 w-fit mb-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : stats.completed}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'مكتمل' : 'Completed'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input type="text" placeholder={isRTL ? 'بحث بالاسم، البريد، الهاتف...' : 'Search by name, email, phone...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30"
            style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', [isRTL ? 'paddingLeft' : 'paddingRight']: '12px' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'pending', 'contacted', 'completed', 'cancelled'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'}`}>
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusConfig[status]?.labelAr : statusConfig[status]?.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-400">
            <Inbox className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{isRTL ? 'لا توجد حجوزات' : 'No reservations found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(reservation => {
              const st = statusConfig[reservation.status] || statusConfig.pending;
              return (
                <button key={reservation.id} onClick={() => { setSelectedReservation(reservation); setAdminNotes(reservation.admin_notes || ''); }}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-start">
                  <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center flex-shrink-0`}>
                    <CalendarCheck className={`w-5 h-5 ${st.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-medium truncate">{reservation.name}</p>
                      <span className="text-primary-400/60 text-xs truncate">{reservation.template_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-dark-500 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{reservation.email}</span>
                      {reservation.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{reservation.phone}</span>}
                      <span>{reservation.created_at ? new Date(reservation.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : ''}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border} flex-shrink-0`}>
                    {isRTL ? st.labelAr : st.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
