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

let _chatAudioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!_chatAudioCtx) _chatAudioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (_chatAudioCtx.state === 'suspended') _chatAudioCtx.resume();
  return _chatAudioCtx;
}
function playNotifSound() {
  try {
    const ctx = getAudioCtx();
    // نغمة 1
    const osc1 = ctx.createOscillator(); const g1 = ctx.createGain();
    osc1.connect(g1); g1.connect(ctx.destination);
    osc1.type = 'sine'; osc1.frequency.value = 800;
    g1.gain.setValueAtTime(0.5, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.15);
    // نغمة 2
    const osc2 = ctx.createOscillator(); const g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(ctx.destination);
    osc2.type = 'sine'; osc2.frequency.value = 1100;
    g2.gain.setValueAtTime(0.5, ctx.currentTime + 0.16);
    g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc2.start(ctx.currentTime + 0.16); osc2.stop(ctx.currentTime + 0.35);
  } catch { /* silent */ }
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
        const adminMsgs = msgs.filter(m => m.sender_type === 'admin');
        if (!open && adminMsgs.length) {
          setUnread(u => u + adminMsgs.length);
          playNotifSound();
        }
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
        .nxr-chat-fab{position:fixed;bottom:24px;left:20px;z-index:9999;width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 24px rgba(124,92,255,.45);background:linear-gradient(135deg,#7c5cff,#6366f1);transition:transform .25s,box-shadow .25s}
        .nxr-chat-fab:hover{transform:scale(1.1);box-shadow:0 8px 32px rgba(124,92,255,.6)}
        .nxr-chat-fab svg{fill:#fff;width:26px;height:26px}
        .nxr-chat-badge{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;border-radius:11px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;padding:0 5px;font-family:system-ui;box-shadow:0 2px 8px rgba(239,68,68,.4);animation:nxrPulse 2s infinite}
        @keyframes nxrPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        .nxr-chat-panel{position:fixed;bottom:24px;left:20px;z-index:9999;width:380px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100dvh - 48px);border-radius:20px;background:#fff;box-shadow:0 16px 60px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.04);display:flex;flex-direction:column;overflow:hidden;animation:nxrChatIn .3s cubic-bezier(.16,1,.3,1);font-family:Tajawal,sans-serif}
        @keyframes nxrChatIn{from{opacity:0;transform:translateY(20px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}
        .nxr-chat-header{background:linear-gradient(135deg,#7c5cff 0%,#6366f1 50%,#818cf8 100%);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;position:relative}
        .nxr-chat-header::after{content:'';position:absolute;bottom:-8px;left:0;right:0;height:8px;background:linear-gradient(to bottom,rgba(0,0,0,.04),transparent);pointer-events:none}
        .nxr-chat-header-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);display:grid;place-items:center;font-size:20px;flex-shrink:0;border:2px solid rgba(255,255,255,.25)}
        .nxr-chat-online{position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#34d399;border:2px solid #7c5cff}
        .nxr-chat-header-info{flex:1;min-width:0}
        .nxr-chat-header-info h4{font-size:.9rem;font-weight:700;margin:0;text-shadow:0 1px 2px rgba(0,0,0,.1)}
        .nxr-chat-header-info p{font-size:.7rem;margin:2px 0 0;opacity:.85;display:flex;align-items:center;gap:4px}
        .nxr-chat-header-info p::before{content:'';width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block}
        .nxr-chat-close{background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;padding:8px;border-radius:10px;display:grid;place-items:center;transition:background .15s;flex-shrink:0;-webkit-tap-highlight-color:transparent}
        .nxr-chat-close:hover,.nxr-chat-close:active{background:rgba(255,255,255,.3)}
        .nxr-chat-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:#f9fafb}
        .nxr-chat-body::-webkit-scrollbar{width:3px}
        .nxr-chat-body::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
        .nxr-msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:.84rem;line-height:1.65;word-break:break-word;position:relative;animation:nxrMsgIn .2s ease-out}
        @keyframes nxrMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .nxr-msg-customer{align-self:flex-start;background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;border-bottom-right-radius:6px;box-shadow:0 2px 8px rgba(124,92,255,.2)}
        .nxr-msg-admin{align-self:flex-end;background:#fff;color:#1e293b;border:1px solid #e5e7eb;border-bottom-left-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
        .nxr-msg-time{font-size:.6rem;opacity:.55;margin-top:4px;display:block}
        .nxr-msg-customer .nxr-msg-time{text-align:left}
        .nxr-msg-admin .nxr-msg-time{text-align:right}
        .nxr-chat-input-area{padding:12px 14px;border-top:1px solid #f3f4f6;display:flex;gap:8px;align-items:center;background:#fff;flex-shrink:0}
        .nxr-chat-input{flex:1;border:1.5px solid #e5e7eb;border-radius:24px;padding:10px 16px;font-size:16px;outline:none;font-family:Tajawal,sans-serif;transition:border-color .15s,box-shadow .15s;background:#f9fafb}
        .nxr-chat-input:focus{border-color:#7c5cff;box-shadow:0 0 0 3px rgba(124,92,255,.1);background:#fff}
        .nxr-chat-send{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:opacity .15s,transform .15s;-webkit-tap-highlight-color:transparent}
        .nxr-chat-send:active:not(:disabled){transform:scale(.92)}
        .nxr-chat-send:disabled{opacity:.35;cursor:default}
        .nxr-chat-send svg{width:18px;height:18px}
        .nxr-chat-welcome{text-align:center;padding:32px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;flex:1;justify-content:center}
        .nxr-chat-welcome h3{font-size:1.05rem;font-weight:700;color:#111827;margin:0}
        .nxr-chat-welcome p{font-size:.8rem;color:#9ca3af;margin:0;line-height:1.6}
        .nxr-chat-name-input{width:100%;max-width:260px;border:1.5px solid #e5e7eb;border-radius:14px;padding:12px 16px;font-size:16px;outline:none;text-align:center;font-family:Tajawal,sans-serif;transition:border-color .15s,box-shadow .15s;background:#f9fafb}
        .nxr-chat-name-input:focus{border-color:#7c5cff;box-shadow:0 0 0 3px rgba(124,92,255,.1);background:#fff}
        .nxr-chat-name-btn{padding:11px 36px;border-radius:14px;border:none;background:linear-gradient(135deg,#7c5cff,#6366f1);color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 14px rgba(124,92,255,.3)}
        .nxr-chat-name-btn:hover{transform:scale(1.03);box-shadow:0 6px 20px rgba(124,92,255,.4)}
        .nxr-chat-name-btn:disabled{opacity:.5;cursor:default;transform:none}
        .nxr-chat-empty{text-align:center;padding:20px;color:#9ca3af;font-size:.8rem}
        @media(max-width:640px){
          .nxr-chat-panel{width:100%;left:0;right:0;bottom:0;top:0;height:100dvh;max-height:100dvh;border-radius:0;animation:nxrChatInMobile .25s ease-out}
          .nxr-chat-header{padding:14px 16px;padding-top:max(14px,env(safe-area-inset-top))}
          .nxr-chat-close{padding:10px;border-radius:12px;background:rgba(255,255,255,.2)}
          .nxr-chat-input-area{padding:10px 12px;padding-bottom:max(10px,env(safe-area-inset-bottom))}
          .nxr-chat-fab{bottom:24px;left:16px;width:54px;height:54px}
        }
        @keyframes nxrChatInMobile{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
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
            <div className="nxr-chat-header-avatar" style={{position:'relative'}}>
              💬
              <span className="nxr-chat-online" />
            </div>
            <div className="nxr-chat-header-info">
              <h4>الدعم المباشر</h4>
              <p>متصل الآن</p>
            </div>
            <button className="nxr-chat-close" onClick={() => setOpen(false)} aria-label="إغلاق">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
