'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X, Clock, User, ChevronLeft, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ChatConversation, ChatMsg } from '@/lib/types';

export default function ChatAdminPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMsgId = useRef(0);
  const pollConvRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollMsgRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ─── جلب المحادثات ─── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await adminApi.getChatConversations() as { conversations?: ChatConversation[]; totalUnread?: number };
      setConversations(res?.conversations || []);
      setTotalUnread(res?.totalUnread || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadConversations();
    pollConvRef.current = setInterval(loadConversations, 5000);
    return () => { if (pollConvRef.current) clearInterval(pollConvRef.current); };
  }, [loadConversations]);

  /* ─── جلب رسائل محادثة ─── */
  const loadMessages = useCallback(async (convId: string, isPolling = false) => {
    if (!isPolling) { setMsgLoading(true); lastMsgId.current = 0; }
    try {
      const afterId = isPolling ? lastMsgId.current : 0;
      const res = await adminApi.getChatMessages(convId, afterId) as { messages?: ChatMsg[] };
      const msgs = res?.messages || [];
      if (isPolling && afterId > 0) {
        if (msgs.length) {
          setMessages(prev => {
            const real = prev.filter(m => m.id > 0);
            const ids = new Set(real.map(m => m.id));
            const fresh = msgs.filter(m => !ids.has(m.id));
            return fresh.length ? [...real, ...fresh] : real.length !== prev.length ? real : prev;
          });
        }
      } else {
        setMessages(msgs);
      }
      if (msgs.length) lastMsgId.current = msgs[msgs.length - 1].id;
      setTimeout(scrollBottom, 80);
    } catch { /* silent */ }
    finally { setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (pollMsgRef.current) clearInterval(pollMsgRef.current);
    if (selectedConv) {
      loadMessages(selectedConv);
      pollMsgRef.current = setInterval(() => loadMessages(selectedConv, true), 3000);
    }
    return () => { if (pollMsgRef.current) clearInterval(pollMsgRef.current); };
  }, [selectedConv, loadMessages]);

  const scrollBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  /* ─── إرسال رد ─── */
  const sendReply = async () => {
    if (!reply.trim() || !selectedConv || sending) return;
    const msg = reply.trim();
    setReply('');
    setSending(true);
    // إضافة مؤقتة
    const temp: ChatMsg = { id: -Date.now(), conversation_id: selectedConv, sender_type: 'admin', message: msg, is_read: false, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    setTimeout(scrollBottom, 60);
    try {
      await adminApi.sendChatReply(selectedConv, msg);
      setTimeout(() => loadMessages(selectedConv, true), 500);
      loadConversations();
    } catch { /* keep temp */ }
    finally { setSending(false); }
  };

  /* ─── إغلاق محادثة ─── */
  const closeConv = async (convId: string) => {
    try {
      await adminApi.closeChatConversation(convId);
      loadConversations();
      if (selectedConv === convId) { setSelectedConv(null); setMessages([]); }
    } catch { /* silent */ }
  };

  const formatTime = (d: string) => {
    try {
      const dt = new Date(d);
      const now = new Date();
      const same = dt.toDateString() === now.toDateString();
      if (same) return dt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      return dt.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const selectedConvData = conversations.find(c => c.conversation_id === selectedConv);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: 500 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
          💬 الدردشة المباشرة
          {totalUnread > 0 && (
            <span style={{ padding: '2px 10px', borderRadius: 10, background: '#ef4444', color: '#fff', fontSize: '.72rem', fontWeight: 700 }}>{totalUnread}</span>
          )}
        </h2>
        <button onClick={loadConversations} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0, overflow: 'hidden' }}>

        {/* ─── قائمة المحادثات ─── */}
        <div style={{
          width: selectedConv ? 280 : '100%', maxWidth: selectedConv ? 280 : '100%',
          background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
          transition: 'width .2s',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '.8rem', fontWeight: 700, color: '#64748b' }}>
            المحادثات ({conversations.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && [1, 2, 3].map(i => (
              <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #fafbfc' }}>
                <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, width: '60%', marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 10, background: '#f8fafc', borderRadius: 4, width: '80%', animation: 'pulse 1.5s infinite' }} />
              </div>
            ))}
            {!loading && conversations.length === 0 && (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <MessageCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 10px', opacity: .3 }} />
                <p style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: 600 }}>لا توجد محادثات</p>
                <p style={{ fontSize: '.7rem', color: '#cbd5e1' }}>ستظهر هنا عندما يبدأ زبون محادثة</p>
              </div>
            )}
            {conversations.map(conv => (
              <div key={conv.conversation_id}
                onClick={() => { setSelectedConv(conv.conversation_id); setTimeout(() => inputRef.current?.focus(), 200); }}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid #fafbfc', cursor: 'pointer',
                  background: selectedConv === conv.conversation_id ? '#f8f6ff' : 'transparent',
                  borderRight: selectedConv === conv.conversation_id ? '3px solid #7c5cff' : '3px solid transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (selectedConv !== conv.conversation_id) (e.currentTarget as HTMLElement).style.background = '#fafbfc'; }}
                onMouseLeave={e => { if (selectedConv !== conv.conversation_id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: conv.unread_admin > 0 ? '#7c5cff' : '#f1f5f9', color: conv.unread_admin > 0 ? '#fff' : '#94a3b8', display: 'grid', placeItems: 'center', fontSize: '.75rem', fontWeight: 700, flexShrink: 0 }}>
                    {conv.customer_name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#0b1020' }}>{conv.customer_name || 'زائر'}</span>
                      {conv.unread_admin > 0 && (
                        <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: '.62rem', fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 5px' }}>{conv.unread_admin}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 40 }}>
                  {conv.last_message || 'بدون رسائل'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '.62rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {formatTime(conv.last_message_at || conv.created_at)}
                  </span>
                  <span style={{
                    padding: '1px 8px', borderRadius: 6, fontSize: '.6rem', fontWeight: 600,
                    background: conv.status === 'active' ? '#f0fdf4' : '#f1f5f9',
                    color: conv.status === 'active' ? '#16a34a' : '#94a3b8',
                  }}>{conv.status === 'active' ? 'نشط' : 'مغلق'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── نافذة الرسائل ─── */}
        {selectedConv && (
          <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button onClick={() => { setSelectedConv(null); setMessages([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'grid', placeItems: 'center', padding: 4, borderRadius: 8 }}>
                <ChevronLeft size={20} />
              </button>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <User size={16} color="#94a3b8" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '.88rem', fontWeight: 700, color: '#0b1020', margin: 0 }}>{selectedConvData?.customer_name || 'زائر'}</h4>
                <p style={{ fontSize: '.68rem', color: '#94a3b8', margin: 0 }}>
                  {selectedConvData?.customer_email || selectedConvData?.conversation_id?.slice(0, 12) + '...'}
                </p>
              </div>
              {selectedConvData?.status === 'active' && (
                <button onClick={() => closeConv(selectedConv)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                  <X size={12} /> إغلاق
                </button>
              )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc' }}>
              {msgLoading && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ display: 'inline-flex', gap: 4 }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', animation: `bounce .6s ${i * .15}s infinite alternate` }} />)}
                  </div>
                </div>
              )}
              {!msgLoading && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: '.8rem' }}>لا توجد رسائل بعد</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{
                  maxWidth: '78%',
                  alignSelf: msg.sender_type === 'admin' ? 'flex-start' : 'flex-end',
                  padding: '10px 14px', borderRadius: 16, fontSize: '.82rem', lineHeight: 1.6,
                  wordBreak: 'break-word',
                  ...(msg.sender_type === 'admin'
                    ? { background: 'linear-gradient(135deg,#7c5cff,#6366f1)', color: '#fff', borderBottomRightRadius: 6 }
                    : { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderBottomLeftRadius: 6 }),
                }}>
                  <div>{msg.message}</div>
                  <div style={{ fontSize: '.62rem', opacity: .6, marginTop: 3, textAlign: msg.sender_type === 'admin' ? 'left' : 'right' }}>
                    {msg.sender_type === 'admin' ? 'أنت' : 'الزبون'} • {formatTime(msg.created_at)}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            {selectedConvData?.status === 'active' && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center', background: '#fff', flexShrink: 0 }}>
                <input ref={inputRef} value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="اكتب ردك..."
                  style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: '.82rem', outline: 'none', fontFamily: 'Tajawal, sans-serif' }} />
                <button onClick={sendReply} disabled={!reply.trim() || sending}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: 'none',
                    background: 'linear-gradient(135deg,#7c5cff,#6366f1)', color: '#fff',
                    cursor: !reply.trim() || sending ? 'default' : 'pointer',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    opacity: !reply.trim() || sending ? .4 : 1, transition: 'opacity .15s',
                  }}>
                  <Send size={16} />
                </button>
              </div>
            )}
            {selectedConvData?.status === 'closed' && (
              <div style={{ padding: '14px', textAlign: 'center', background: '#fafbfc', borderTop: '1px solid #f1f5f9', fontSize: '.78rem', color: '#94a3b8', fontWeight: 600 }}>
                🔒 هذه المحادثة مغلقة
              </div>
            )}
          </div>
        )}

        {!selectedConv && !loading && conversations.length > 0 && (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <MessageCircle size={48} style={{ margin: '0 auto 12px', opacity: .2 }} />
              <p style={{ fontSize: '.88rem', fontWeight: 600 }}>اختر محادثة للبدء</p>
              <p style={{ fontSize: '.72rem', color: '#cbd5e1' }}>اضغط على أي محادثة من القائمة</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes bounce{to{transform:translateY(-4px);opacity:.4}}
      `}</style>
    </div>
  );
}
