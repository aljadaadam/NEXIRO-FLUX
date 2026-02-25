import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, X, Search, User, Clock, CheckCheck,
  ChevronRight, Circle, Archive, RefreshCw, Loader2, ArrowLeft, ArrowRight,
  Mail, MoreVertical
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Direct API helper (with auth) ───
async function chatApiAuth(endpoint, options = {}) {
  const token = localStorage.getItem('nf_token');
  const site = (() => { try { return JSON.parse(localStorage.getItem('nf_site')); } catch { return null; } })();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(site?.site_key ? { 'X-Site-Key': site.site_key } : {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { headers, ...options });
  return res.json();
}

export default function AdminChat() {
  const { isRTL } = useLanguage();
  const t = (ar, en) => isRTL ? ar : en;

  // ── State ──
  const [conversations, setConversations] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [selected, setSelected] = useState(null); // conversation_id
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollConvRef = useRef(null);
  const pollMsgRef = useRef(null);

  // ── Load Conversations ──
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApiAuth('/chat/');
      if (data.conversations) {
        setConversations(data.conversations);
        setTotalUnread(data.totalUnread || 0);
      }
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load Messages ──
  const loadMessages = useCallback(async (convId, clear = false) => {
    if (!convId) return;
    if (clear) setMsgsLoading(true);
    try {
      const data = await chatApiAuth(`/chat/${convId}/messages`);
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  // ── Poll for new messages in selected conv ──
  const pollNewMessages = useCallback(async () => {
    if (!selected) return;
    try {
      const lastId = messages.length ? Math.max(...messages.map(m => m.id)) : 0;
      const data = await chatApiAuth(`/chat/${selected}/messages?after=${lastId}`);
      if (data.messages?.length) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newOnes = data.messages.filter(m => !existingIds.has(m.id));
          return newOnes.length ? [...prev, ...newOnes] : prev;
        });
      }
    } catch {}
  }, [selected, messages]);

  // ── Effects ──
  useEffect(() => {
    loadConversations();
    pollConvRef.current = setInterval(loadConversations, 5000);
    return () => clearInterval(pollConvRef.current);
  }, [loadConversations]);

  useEffect(() => {
    if (selected) {
      loadMessages(selected, true);
      pollMsgRef.current = setInterval(pollNewMessages, 3000);
      return () => clearInterval(pollMsgRef.current);
    } else {
      setMessages([]);
    }
  }, [selected]);

  // Update poll callback when messages change
  useEffect(() => {
    if (selected && pollMsgRef.current) {
      clearInterval(pollMsgRef.current);
      pollMsgRef.current = setInterval(pollNewMessages, 3000);
    }
  }, [pollNewMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selected && !msgsLoading) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selected, msgsLoading]);

  // ── Send message ──
  async function handleSend(e) {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg || sending || !selected) return;
    setSending(true);
    setInput('');
    // Optimistic
    const tempMsg = { id: Date.now(), sender_type: 'admin', message: msg, created_at: new Date().toISOString(), _temp: true };
    setMessages(prev => [...prev, tempMsg]);
    try {
      await chatApiAuth(`/chat/${selected}/send`, {
        method: 'POST',
        body: JSON.stringify({ message: msg }),
      });
      // Refresh to get real message
      setTimeout(() => loadMessages(selected), 500);
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  }

  // ── Close conversation ──
  async function handleClose(convId) {
    try {
      await chatApiAuth(`/chat/${convId}/close`, { method: 'PATCH' });
      loadConversations();
      if (selected === convId) {
        setSelected(null);
        setMobileShowChat(false);
      }
    } catch {}
  }

  // ── Select conversation ──
  function selectConv(convId) {
    setSelected(convId);
    setMobileShowChat(true);
    // Update unread in local state
    setConversations(prev => prev.map(c => c.conversation_id === convId ? { ...c, unread_admin: 0 } : c));
  }

  // ── Key handler ──
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Filter conversations ──
  const filtered = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (c.customer_name || '').toLowerCase().includes(q) ||
           (c.customer_email || '').toLowerCase().includes(q) ||
           (c.last_message || '').toLowerCase().includes(q);
  });

  const selectedConv = conversations.find(c => c.conversation_id === selected);

  // ── Time format ──
  function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t('الآن', 'Now');
    if (diffMin < 60) return `${diffMin}${t('د', 'm')}`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}${t('س', 'h')}`;
    return d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  }

  function formatFullTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // ───────────────────────────────
  //  RENDER
  // ───────────────────────────────
  return (
    <div className="h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-400" />
            {t('المحادثات المباشرة', 'Live Chats')}
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {totalUnread}
              </span>
            )}
          </h1>
          <p className="text-dark-400 text-sm mt-1">{t('إدارة محادثات الزوار والرد عليهم', 'Manage and respond to visitor conversations')}</p>
        </div>
        <button onClick={loadConversations} className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-all" title={t('تحديث', 'Refresh')}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Layout */}
      <div className="flex rounded-2xl border border-white/5 overflow-hidden bg-[#0d1221]" style={{ height: 'calc(100% - 72px)' }}>

        {/* ─── Conversation List (Sidebar) ─── */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-${isRTL ? 'l' : 'r'} border-white/5 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
              <Search className="w-4 h-4 text-dark-500 flex-shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('بحث في المحادثات...', 'Search conversations...')}
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-dark-500 w-full"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-dark-500">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{t('لا توجد محادثات', 'No conversations')}</p>
              </div>
            ) : (
              filtered.map(conv => {
                const isActive = selected === conv.conversation_id;
                const hasUnread = conv.unread_admin > 0;
                return (
                  <button
                    key={conv.conversation_id}
                    onClick={() => selectConv(conv.conversation_id)}
                    className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-3.5 border-b border-white/[0.03] transition-all hover:bg-white/[0.03] ${isActive ? 'bg-primary-500/10 border-primary-500/20' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold ${hasUnread ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-dark-400'}`}>
                        {(conv.customer_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold truncate ${hasUnread ? 'text-white' : 'text-dark-200'}`}>
                            {conv.customer_name || t('زائر', 'Visitor')}
                          </span>
                          <span className="text-[11px] text-dark-500 flex-shrink-0">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${hasUnread ? 'text-dark-300 font-medium' : 'text-dark-500'}`}>
                            {conv.last_message || t('بدأ محادثة', 'Started a conversation')}
                          </p>
                          {hasUnread && (
                            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {conv.unread_admin > 9 ? '9+' : conv.unread_admin}
                            </span>
                          )}
                        </div>
                        {conv.customer_email && (
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3 text-dark-600" />
                            <span className="text-[10px] text-dark-600 truncate">{conv.customer_email}</span>
                          </div>
                        )}
                        {conv.status === 'closed' && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] bg-dark-700 text-dark-400">
                            <Archive className="w-2.5 h-2.5" /> {t('مغلقة', 'Closed')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Stats footer */}
          <div className="px-4 py-2.5 border-t border-white/5 text-[11px] text-dark-600 flex items-center justify-between">
            <span>{t(`${conversations.length} محادثة`, `${conversations.length} conversations`)}</span>
            <span className="flex items-center gap-1">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              {t('مباشر', 'Live')}
            </span>
          </div>
        </div>

        {/* ─── Chat Area ─── */}
        <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-dark-500">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm font-medium mb-1">{t('اختر محادثة', 'Select a conversation')}</p>
              <p className="text-xs text-dark-600">{t('اختر محادثة من القائمة للبدء', 'Pick a conversation from the list to start')}</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 bg-[#0d1221]">
                <button onClick={() => { setMobileShowChat(false); }} className="md:hidden p-1 text-dark-400 hover:text-white">
                  {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-primary-500/20 text-primary-400`}>
                  {(selectedConv?.customer_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{selectedConv?.customer_name || t('زائر', 'Visitor')}</h3>
                  <div className="flex items-center gap-2">
                    {selectedConv?.customer_email && <span className="text-[11px] text-dark-500 truncate">{selectedConv.customer_email}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedConv?.status === 'closed' ? 'bg-dark-700 text-dark-400' : 'bg-green-500/10 text-green-400'}`}>
                      {selectedConv?.status === 'closed' ? t('مغلقة', 'Closed') : t('نشطة', 'Active')}
                    </span>
                  </div>
                </div>
                {selectedConv?.status !== 'closed' && (
                  <button
                    onClick={() => handleClose(selected)}
                    className="px-3 py-1.5 rounded-lg text-xs text-dark-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all"
                    title={t('إغلاق المحادثة', 'Close conversation')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: 'linear-gradient(180deg, #0c0f1a 0%, #0e1225 100%)' }}>
                {msgsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-dark-500">
                    <p className="text-sm">{t('لا توجد رسائل بعد', 'No messages yet')}</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isAdmin = msg.sender_type === 'admin';
                      // Show date separator
                      const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString();
                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-white/5" />
                              <span className="text-[10px] text-dark-600 font-medium">
                                {new Date(msg.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <div className="flex-1 h-px bg-white/5" />
                            </div>
                          )}
                          <div className={`flex gap-2 ${isAdmin ? (isRTL ? 'flex-row-reverse' : 'flex-row') : (isRTL ? 'flex-row' : 'flex-row-reverse')}`} style={{ justifyContent: isAdmin ? 'flex-end' : 'flex-start', direction: isRTL ? 'rtl' : 'ltr' }}>
                            <div style={{ maxWidth: '70%' }}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                isAdmin
                                  ? 'bg-primary-500/90 text-white rounded-br-sm'
                                  : 'bg-white/[0.06] text-dark-100 border border-white/[0.06] rounded-bl-sm'
                              }`} style={{
                                borderRadius: isAdmin
                                  ? (isRTL ? '16px 16px 16px 4px' : '16px 16px 4px 16px')
                                  : (isRTL ? '16px 4px 16px 16px' : '4px 16px 16px 16px'),
                              }}>
                                {msg.message}
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${isAdmin ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
                                <span className="text-[10px] text-dark-600">{formatFullTime(msg.created_at)}</span>
                                {isAdmin && msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-400" /> : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              {selectedConv?.status !== 'closed' ? (
                <div className="px-4 py-3 border-t border-white/5 bg-[#0a0d18]">
                  <form onSubmit={handleSend} className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('اكتب ردك...', 'Type your reply...')}
                      rows={1}
                      className="flex-1 resize-none bg-white/5 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-dark-500 outline-none focus:border-primary-500/40 transition-colors"
                      style={{ maxHeight: 100, fontFamily: 'inherit' }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        input.trim()
                          ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                          : 'bg-white/5 text-dark-600 cursor-not-allowed'
                      }`}
                      style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-white/5 bg-[#0a0d18] text-center">
                  <p className="text-xs text-dark-500">{t('هذه المحادثة مغلقة', 'This conversation is closed')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
