'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import type { ChatConversation, ChatMsg } from '@/lib/types';
import type { ColorTheme } from '@/lib/themes';
import { MessageCircle, Send, X, RefreshCw, Lock } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

export default function SmmChatPage({ theme, darkMode, t }: Props) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const loadConversations = useCallback(async () => {
    try {
      const data = await adminApi.getChatConversations();
      setConversations(Array.isArray(data) ? data : data?.conversations || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const data = await adminApi.getChatMessages(convId);
      setMessages(Array.isArray(data) ? data : data?.messages || []);
      setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
    } catch {}
  }, []);

  useEffect(() => {
    if (selected) {
      loadMessages(selected.conversation_id);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(selected.conversation_id), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected, loadMessages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      await adminApi.sendChatReply(selected.conversation_id, newMsg);
      setNewMsg('');
      loadMessages(selected.conversation_id);
    } catch {}
    setSending(false);
  };

  const handleClose = async (convId: string) => {
    try { await adminApi.closeChatConversation(convId); loadConversations(); setSelected(null); } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>💬 {t('المحادثات')}</h2>

      <div style={{
        display: 'grid', gridTemplateColumns: selected ? '280px 1fr' : '1fr',
        gap: 16, height: 'calc(100vh - 200px)',
      }}
        className="admin-chat-grid"
      >
        {/* Conversations list */}
        <div style={{
          background: cardBg, borderRadius: 16, border: `1px solid ${border}`,
          overflowY: 'auto', display: selected ? undefined : undefined,
        }}
          className={selected ? 'admin-chat-sidebar' : ''}
        >
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{t('المحادثات')} ({conversations.length})</span>
            <button onClick={() => { setLoading(true); loadConversations(); }} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}>
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 30, textAlign: 'center', color: subtext }}>{t('جاري التحميل...')}</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: subtext }}>
              <MessageCircle size={30} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>{t('لا توجد محادثات')}</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => setSelected(conv)} style={{
                width: '100%', padding: '12px 16px', border: 'none',
                borderBottom: `1px solid ${border}`, cursor: 'pointer',
                background: selected?.id === conv.id ? `${theme.primary}10` : 'transparent',
                textAlign: 'start', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: conv.status === 'active' ? `${theme.primary}15` : `${subtext}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: conv.status === 'active' ? theme.primary : subtext,
                }}>
                  {conv.status === 'active' ? <MessageCircle size={16} /> : <Lock size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{conv.customer_name}</div>
                  <div style={{ fontSize: 11, color: subtext, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.last_message || '—'}
                  </div>
                </div>
                {conv.unread_admin > 0 && (
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: theme.primary, color: '#fff',
                    fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {conv.unread_admin}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        {selected && (
          <div style={{
            background: cardBg, borderRadius: 16, border: `1px solid ${border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Chat header */}
            <div style={{
              padding: '12px 16px', borderBottom: `1px solid ${border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: text }}>{selected.customer_name}</h4>
                <span style={{ fontSize: 11, color: subtext }}>{selected.customer_email || ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.status === 'active' && (
                  <button onClick={() => handleClose(selected.conversation_id)} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: '#ef444412', color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {t('إغلاق المحادثة')}
                  </button>
                )}
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex', justifyContent: msg.sender_type === 'admin' ? 'flex-start' : 'flex-end',
                  marginBottom: 10,
                }}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
                    background: msg.sender_type === 'admin' ? `${theme.primary}15` : inputBg,
                    color: text, fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.message}
                    <div style={{ fontSize: 10, color: subtext, marginTop: 4 }}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {selected.status === 'active' && (
              <div style={{ padding: 12, borderTop: `1px solid ${border}`, display: 'flex', gap: 8 }}>
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={t('اكتب رسالة...')}
                  style={{
                    flex: 1, height: 40, padding: '0 14px',
                    border: `1px solid ${border}`, borderRadius: 10,
                    background: inputBg, color: text, fontSize: 13, outline: 'none',
                  }}
                />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()} style={{
                  width: 40, height: 40, borderRadius: 10, border: 'none',
                  background: theme.gradient, color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: sending || !newMsg.trim() ? 0.5 : 1,
                }}>
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
