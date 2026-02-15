import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Plus, Search, Loader2, CheckCircle2, Clock, AlertCircle,
  XCircle, Send, X, User, ArrowLeft, ChevronRight, Inbox
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const statusConfig = {
  open:     { labelAr: 'مفتوح',   labelEn: 'Open',      color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  replied:  { labelAr: 'تم الرد', labelEn: 'Replied',    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  closed:   { labelAr: 'مغلق',   labelEn: 'Closed',     color: 'text-dark-400',   bg: 'bg-dark-500/10',   border: 'border-dark-500/20' },
  resolved: { labelAr: 'محلول',   labelEn: 'Resolved',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const priorityConfig = {
  low:    { labelAr: 'منخفض', labelEn: 'Low',    color: 'text-dark-400' },
  medium: { labelAr: 'متوسط', labelEn: 'Medium', color: 'text-yellow-400' },
  high:   { labelAr: 'عالي',  labelEn: 'High',   color: 'text-red-400' },
};

export default function AdminTickets() {
  const { isRTL } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Ticket detail view
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Create ticket
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTickets();
      setTickets(data.tickets || data || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setMessagesLoading(true);
    setReplyText('');
    try {
      const data = await api.getTicketMessages(ticket.id);
      setMessages(data.messages || data || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await api.replyToTicket(selectedTicket.id, replyText.trim());
      setReplyText('');
      // Refresh messages
      const data = await api.getTicketMessages(selectedTicket.id);
      setMessages(data.messages || data || []);
      setSuccess(isRTL ? 'تم إرسال الرد' : 'Reply sent');
      setTimeout(() => setSuccess(''), 3000);
      fetchTickets(); // refresh list to update status
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل إرسال الرد' : 'Failed to send reply'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.subject || !createForm.message) { setError(isRTL ? 'الموضوع والرسالة مطلوبان' : 'Subject and message are required'); return; }
    setCreating(true);
    setError('');
    try {
      await api.createTicket(createForm);
      setShowCreate(false);
      setCreateForm({ subject: '', message: '', priority: 'medium' });
      await fetchTickets();
      setSuccess(isRTL ? 'تم إنشاء التذكرة' : 'Ticket created');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || (isRTL ? 'فشل الإنشاء' : 'Creation failed'));
    } finally {
      setCreating(false);
    }
  };

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (t.subject || '').toLowerCase().includes(q) || (t.customer_name || t.user_name || '').toLowerCase().includes(q) || String(t.id).includes(q);
    }
    return true;
  });

  const openCount = tickets.filter(t => t.status === 'open').length;
  const repliedCount = tickets.filter(t => t.status === 'replied').length;

  const inputClass = "w-full bg-[#0d1221] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30";

  // ═══ Ticket Detail View ═══
  if (selectedTicket) {
    const st = statusConfig[selectedTicket.status] || statusConfig.open;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isRTL ? 'العودة للتذاكر' : 'Back to Tickets'}
        </button>

        <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
              <div className="flex items-center gap-3 text-xs text-dark-400">
                <span>#{selectedTicket.id}</span>
                <span>{selectedTicket.customer_name || selectedTicket.user_name || (isRTL ? 'غير محدد' : 'N/A')}</span>
                <span>{selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : ''}</span>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border}`}>
              {isRTL ? st.labelAr : st.labelEn}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[50vh] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-dark-500 text-sm">{isRTL ? 'لا توجد رسائل' : 'No messages'}</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className={`p-5 ${msg.is_admin || msg.sender_type === 'admin' ? 'bg-primary-500/[0.03]' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${msg.is_admin || msg.sender_type === 'admin' ? 'bg-primary-500/10' : 'bg-dark-800'}`}>
                        <User className={`w-3.5 h-3.5 ${msg.is_admin || msg.sender_type === 'admin' ? 'text-primary-400' : 'text-dark-400'}`} />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {msg.is_admin || msg.sender_type === 'admin' ? (isRTL ? 'المدير' : 'Admin') : (msg.sender_name || (isRTL ? 'العميل' : 'Customer'))}
                      </span>
                      <span className="text-dark-600 text-[11px] ml-auto">
                        {msg.created_at ? new Date(msg.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : ''}
                      </span>
                    </div>
                    <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message || msg.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reply Box */}
          {selectedTicket.status !== 'closed' && (
            <div className="p-4 border-t border-white/5">
              {success && <p className="text-emerald-400 text-xs mb-2">{success}</p>}
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <div className="flex items-end gap-3">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isRTL ? 'اكتب ردك...' : 'Type your reply...'}
                  className="flex-1 bg-[#0d1221] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30 resize-none h-20"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                />
                <button onClick={handleReply} disabled={sending || !replyText.trim()}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50 h-fit">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isRTL ? 'إرسال' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ Tickets List View ═══
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{isRTL ? 'تذاكر الدعم' : 'Support Tickets'}</h1>
          <p className="text-dark-400 text-sm mt-1">{isRTL ? 'إدارة تذاكر الدعم الفني' : 'Manage support tickets'}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          {isRTL ? 'تذكرة جديدة' : 'New Ticket'}
        </button>
      </div>

      {/* Messages */}
      {success && <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"><CheckCircle2 className="w-5 h-5" />{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-primary-500/10 w-fit mb-3"><MessageSquare className="w-5 h-5 text-primary-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : tickets.length}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'إجمالي التذاكر' : 'Total Tickets'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 w-fit mb-3"><Clock className="w-5 h-5 text-yellow-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : openCount}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'مفتوحة' : 'Open'}</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 w-fit mb-3"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
          <p className="text-2xl font-bold text-white">{loading ? <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" /> : repliedCount}</p>
          <p className="text-dark-400 text-xs mt-1">{isRTL ? 'تم الرد' : 'Replied'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
          <input type="text" placeholder={isRTL ? 'بحث في التذاكر...' : 'Search tickets...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/30"
            style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', [isRTL ? 'paddingLeft' : 'paddingRight']: '12px' }}
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'open', 'replied', 'closed'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-white/5 text-dark-400 border border-white/5 hover:text-white'}`}>
              {status === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusConfig[status]?.labelAr : statusConfig[status]?.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-400">
            <Inbox className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{isRTL ? 'لا توجد تذاكر' : 'No tickets found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(ticket => {
              const st = statusConfig[ticket.status] || statusConfig.open;
              const pr = priorityConfig[ticket.priority] || priorityConfig.medium;
              return (
                <button key={ticket.id} onClick={() => openTicket(ticket)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-start">
                  <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center flex-shrink-0`}>
                    <MessageSquare className={`w-5 h-5 ${st.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-medium truncate">{ticket.subject}</p>
                      <span className={`text-[10px] ${pr.color}`}>● {isRTL ? pr.labelAr : pr.labelEn}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-dark-500">
                      <span>#{ticket.id}</span>
                      <span>{ticket.customer_name || ticket.user_name || ''}</span>
                      <span>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : ''}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color} border ${st.border} flex-shrink-0`}>
                    {isRTL ? st.labelAr : st.labelEn}
                  </span>
                  <ChevronRight className="w-4 h-4 text-dark-600 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCreate(false)}>
          <div className="bg-[#111827] rounded-2xl border border-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">{isRTL ? 'تذكرة جديدة' : 'New Ticket'}</h2>
              <button onClick={() => setShowCreate(false)} className="text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الموضوع' : 'Subject'}</label>
                <input className={inputClass} value={createForm.subject} onChange={e => setCreateForm({...createForm, subject: e.target.value})} placeholder={isRTL ? 'موضوع التذكرة' : 'Ticket subject'} />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الأولوية' : 'Priority'}</label>
                <select className={inputClass} value={createForm.priority} onChange={e => setCreateForm({...createForm, priority: e.target.value})}>
                  <option value="low">{isRTL ? 'منخفض' : 'Low'}</option>
                  <option value="medium">{isRTL ? 'متوسط' : 'Medium'}</option>
                  <option value="high">{isRTL ? 'عالي' : 'High'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">{isRTL ? 'الرسالة' : 'Message'}</label>
                <textarea className={`${inputClass} resize-none h-28`} value={createForm.message} onChange={e => setCreateForm({...createForm, message: e.target.value})} placeholder={isRTL ? 'اكتب رسالتك...' : 'Write your message...'} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-dark-400 hover:text-white transition-colors">{isRTL ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleCreate} disabled={creating} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isRTL ? 'إنشاء التذكرة' : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
