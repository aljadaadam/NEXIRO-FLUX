'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { storeApi } from '@/lib/api';
import type { ChatMsg } from '@/lib/types';

/* ════════════════════════════════════════════
   ودجة الدردشة – تصميم عصري عائم
   ════════════════════════════════════════════ */

function generateId() {
  return 'cx_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [convId, setConvId] = useState('');
  const lastMsgId = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // تهيئة معرّف المحادثة
  useEffect(() => {
    const stored = localStorage.getItem('chat_conv_id');
    const storedName = localStorage.getItem('chat_name');
    if (stored) { setConvId(stored); setNameSubmitted(true); }
    else { const id = generateId(); setConvId(id); localStorage.setItem('chat_conv_id', id); }
    if (storedName) { setName(storedName); setNameSubmitted(true); }
  }, []);

  // التمرير للأسفل
  const scrollBottom = useCallback(() => {
    setTimeout(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, 60);
  }, []);

  // جلب الرسائل (polling)
  const fetchMessages = useCallback(async () => {
    if (!convId || !nameSubmitted) return;
    try {
      const res = await storeApi.chatMessages(convId, lastMsgId.current) as { messages?: ChatMsg[] };
      const msgs = res?.messages || [];
      if (msgs.length) {
        setMessages(prev => {
          const real = prev.filter(m => m.id > 0);
          const ids = new Set(real.map(m => m.id));
          const fresh = msgs.filter(m => !ids.has(m.id));
          return fresh.length ? [...real, ...fresh] : real.length !== prev.length ? real : prev;
        });
        lastMsgId.current = msgs[msgs.length - 1].id;
        if (!open) setUnread(u => u + msgs.filter(m => m.sender_type === 'admin').length);
        scrollBottom();
      }
    } catch { /* silent */ }
  }, [convId, nameSubmitted, open, scrollBottom]);

  // بدأ/إيقاف polling
  useEffect(() => {
    if (nameSubmitted && convId) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [nameSubmitted, convId, fetchMessages]);

  // عند فتح الشات
  useEffect(() => {
    if (open) { setUnread(0); scrollBottom(); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [open, scrollBottom]);

  // حفظ الاسم
  const submitName = async () => {
    if (!name.trim()) return;
    localStorage.setItem('chat_name', name.trim());
    setNameSubmitted(true);
    try { await storeApi.chatStart(convId, name.trim()); } catch { /* ok */ }
  };

  // إرسال رسالة
  const send = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    // إضافة مؤقتة
    const temp: ChatMsg = { id: -Date.now(), conversation_id: convId, sender_type: 'customer', message: msg, is_read: false, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    scrollBottom();
    try {
      await storeApi.chatSend(convId, msg, name);
      // جلب فوري
      setTimeout(fetchMessages, 300);
    } catch { /* keep temp */ }
    finally { setSending(false); }
  };

  const formatTime = (d: string) => {
    try { return new Date(d).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  return (
    <>
      {/* ─── CSS ─── */}
      <style>{`
        .nxr-chat-fab{position:fixed;bottom:90px;left:20px;z-index:9999;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 20px rgba(124,92,255,.4);background:linear-gradient(135deg,#7c5cff,#6366f1);transition:transform .2s,box-shadow .2s}
        .nxr-chat-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(124,92,255,.55)}
        .nxr-chat-fab svg{fill:#fff;width:26px;height:26px}
        .nxr-chat-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;padding:0 5px;font-family:system-ui}
        .nxr-chat-panel{position:fixed;bottom:90px;left:20px;z-index:9999;width:370px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);border-radius:20px;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.16);display:flex;flex-direction:column;overflow:hidden;animation:nxrChatIn .25s ease-out;font-family:Tajawal,sans-serif}
        @keyframes nxrChatIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        .nxr-chat-header{background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;padding:18px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0}
        .nxr-chat-header-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:grid;place-items:center;font-size:20px;flex-shrink:0}
        .nxr-chat-header-info h4{font-size:.92rem;font-weight:700;margin:0}
        .nxr-chat-header-info p{font-size:.72rem;margin:2px 0 0;opacity:.8}
        .nxr-chat-close{background:none;border:none;color:#fff;opacity:.7;cursor:pointer;padding:4px;border-radius:8px;margin-right:auto;display:grid;place-items:center}
        .nxr-chat-close:hover{opacity:1;background:rgba(255,255,255,.15)}
        .nxr-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#f8fafc}
        .nxr-chat-body::-webkit-scrollbar{width:4px}
        .nxr-chat-body::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        .nxr-msg{max-width:82%;padding:10px 14px;border-radius:16px;font-size:.82rem;line-height:1.6;word-break:break-word;position:relative}
        .nxr-msg-customer{align-self:flex-start;background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;border-bottom-right-radius:6px}
        .nxr-msg-admin{align-self:flex-end;background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-bottom-left-radius:6px}
        .nxr-msg-time{font-size:.62rem;opacity:.6;margin-top:3px;display:block}
        .nxr-msg-customer .nxr-msg-time{text-align:left}
        .nxr-msg-admin .nxr-msg-time{text-align:right}
        .nxr-chat-input-area{padding:12px 16px;border-top:1px solid #f1f5f9;display:flex;gap:8px;align-items:center;background:#fff;flex-shrink:0}
        .nxr-chat-input{flex:1;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px;font-size:16px;outline:none;font-family:Tajawal,sans-serif;transition:border-color .15s}
        .nxr-chat-input:focus{border-color:#7c5cff}
        .nxr-chat-send{width:38px;height:38px;border-radius:50%;border:none;background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:opacity .15s}
        .nxr-chat-send:disabled{opacity:.4;cursor:default}
        .nxr-chat-send svg{width:18px;height:18px}
        .nxr-chat-welcome{text-align:center;padding:28px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;flex:1;justify-content:center}
        .nxr-chat-welcome h3{font-size:1rem;font-weight:700;color:#0b1020;margin:0}
        .nxr-chat-welcome p{font-size:.78rem;color:#94a3b8;margin:0;line-height:1.6}
        .nxr-chat-name-input{width:100%;max-width:260px;border:1.5px solid #e2e8f0;border-radius:12px;padding:11px 16px;font-size:16px;outline:none;text-align:center;font-family:Tajawal,sans-serif;transition:border-color .15s}
        .nxr-chat-name-input:focus{border-color:#7c5cff}
        .nxr-chat-name-btn{padding:10px 32px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif;transition:transform .15s}
        .nxr-chat-name-btn:hover{transform:scale(1.03)}
        .nxr-chat-empty{text-align:center;padding:20px;color:#94a3b8;font-size:.78rem}
        .nxr-typing{display:flex;gap:4px;align-items:center;padding:8px 14px}
        .nxr-typing span{width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:nxrBounce .6s infinite alternate}
        .nxr-typing span:nth-child(2){animation-delay:.15s}
        .nxr-typing span:nth-child(3){animation-delay:.3s}
        @keyframes nxrBounce{to{transform:translateY(-4px);opacity:.4}}
        @media(max-width:480px){.nxr-chat-panel{width:calc(100vw - 16px);left:8px;bottom:80px;height:calc(100vh - 100px);border-radius:16px}.nxr-chat-fab{bottom:80px;left:14px;width:50px;height:50px}}
      `}</style>

      {/* ─── FAB Button ─── */}
      {!open && (
        <button className="nxr-chat-fab" onClick={() => setOpen(true)} aria-label="فتح الدردشة">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
          {unread > 0 && <span className="nxr-chat-badge">{unread}</span>}
        </button>
      )}

      {/* ─── Chat Panel ─── */}
      {open && (
        <div className="nxr-chat-panel" dir="rtl">
          {/* Header */}
          <div className="nxr-chat-header">
            <div className="nxr-chat-header-avatar">💬</div>
            <div className="nxr-chat-header-info">
              <h4>الدعم المباشر</h4>
              <p>متصل الآن • نرد بسرعة</p>
            </div>
            <button className="nxr-chat-close" onClick={() => setOpen(false)} aria-label="إغلاق">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Body */}
          {!nameSubmitted ? (
            <div className="nxr-chat-welcome">
              <div style={{ fontSize: '2.5rem' }}>👋</div>
              <h3>مرحباً بك!</h3>
              <p>أدخل اسمك لبدء المحادثة مع فريق الدعم</p>
              <input className="nxr-chat-name-input" placeholder="اسمك..." value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitName()} />
              <button className="nxr-chat-name-btn" onClick={submitName} disabled={!name.trim()}>ابدأ المحادثة</button>
            </div>
          ) : (
            <>
              <div className="nxr-chat-body" ref={scrollRef}>
                {/* رسالة ترحيب */}
                <div className="nxr-msg nxr-msg-admin">
                  <div>مرحباً {name || 'بك'}! 👋<br />كيف يمكننا مساعدتك اليوم؟</div>
                  <span className="nxr-msg-time">الدعم</span>
                </div>

                {messages.length === 0 && (
                  <div className="nxr-chat-empty">اكتب رسالتك وسنرد عليك في أقرب وقت ⚡</div>
                )}

                {messages.map(msg => (
                  <div key={msg.id} className={`nxr-msg ${msg.sender_type === 'customer' ? 'nxr-msg-customer' : 'nxr-msg-admin'}`}>
                    <div>{msg.message}</div>
                    <span className="nxr-msg-time">{formatTime(msg.created_at)}</span>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="nxr-chat-input-area">
                <input ref={inputRef} className="nxr-chat-input" placeholder="اكتب رسالتك..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()} />
                <button className="nxr-chat-send" onClick={send} disabled={!input.trim() || sending} aria-label="إرسال">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
