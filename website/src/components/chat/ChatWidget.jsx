import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Translations ───
const chatT = {
  ar: {
    title: 'الدعم المباشر',
    subtitle: 'نحن هنا لمساعدتك',
    online: 'متصل الآن',
    offline: 'غير متصل',
    nameLabel: 'الاسم',
    namePlaceholder: 'اسمك الكريم',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'email@example.com',
    startChat: 'بدء المحادثة',
    messagePlaceholder: 'اكتب رسالتك...',
    send: 'إرسال',
    welcome: 'مرحباً! 👋 كيف يمكننا مساعدتك اليوم؟',
    typingHint: 'اكتب رسالة وسيرد عليك فريقنا',
    powered: 'NEXIRO FLUX',
    you: 'أنت',
    admin: 'الدعم',
    justNow: 'الآن',
    minAgo: 'د',
    connecting: 'جاري الاتصال...',
    error: 'حدث خطأ، حاول مرة أخرى',
  },
  en: {
    title: 'Live Support',
    subtitle: "We're here to help",
    online: 'Online',
    offline: 'Offline',
    nameLabel: 'Name',
    namePlaceholder: 'Your name',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    startChat: 'Start Chat',
    messagePlaceholder: 'Type your message...',
    send: 'Send',
    welcome: 'Hello! 👋 How can we help you today?',
    typingHint: 'Type a message and our team will respond',
    powered: 'NEXIRO FLUX',
    you: 'You',
    admin: 'Support',
    justNow: 'Now',
    minAgo: 'm',
    connecting: 'Connecting...',
    error: 'Something went wrong, try again',
  },
};

// ─── Icons (inline SVGs to avoid dependencies) ───
const ChatIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

// ─── Utility: generate/get conversation ID ───
function getConversationId() {
  let id = localStorage.getItem('nf_chat_conv_id');
  if (!id) {
    id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('nf_chat_conv_id', id);
  }
  return id;
}

function getSavedVisitor() {
  try {
    return JSON.parse(localStorage.getItem('nf_chat_visitor') || 'null');
  } catch { return null; }
}

function saveVisitor(data) {
  localStorage.setItem('nf_chat_visitor', JSON.stringify(data));
}

// ─── Relative Time ───
function timeAgo(dateStr, t) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return t.justNow;
  if (diff < 3600) return Math.floor(diff / 60) + t.minAgo;
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Chat API calls ───
async function chatApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

// ─── NEW MESSAGE SOUND ───
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 1100;
      gain2.gain.value = 0.06;
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.15);
    }, 130);
  } catch {}
}


export default function ChatWidget() {
  const { lang, isRTL } = useLanguage();
  const t = chatT[lang] || chatT.en;

  // ── State ──
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro | chat
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastMsgId, setLastMsgId] = useState(0);
  const [unread, setUnread] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [bubblePulse, setBubblePulse] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const convId = useRef(getConversationId());

  // ── Restore visitor ──
  useEffect(() => {
    const saved = getSavedVisitor();
    if (saved) {
      setName(saved.name || '');
      setEmail(saved.email || '');
      setPhase('chat');
    }
  }, []);

  // ── Open animation ──
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
      setBubblePulse(false);
      setUnread(0);
      if (phase === 'chat') {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Polling ──
  const pollMessages = useCallback(async () => {
    try {
      const data = await chatApi(`/chat/public/messages?conversation_id=${convId.current}&after=${lastMsgId}`);
      if (data.messages?.length) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newOnes = data.messages.filter(m => !existingIds.has(m.id));
          if (newOnes.length) {
            const hasAdminMsg = newOnes.some(m => m.sender_type === 'admin');
            if (hasAdminMsg && !isOpen) {
              setUnread(u => u + newOnes.filter(m => m.sender_type === 'admin').length);
              playNotifSound();
            }
            if (hasAdminMsg && isOpen) {
              playNotifSound();
            }
          }
          return [...prev, ...newOnes];
        });
        const maxId = Math.max(...data.messages.map(m => m.id));
        setLastMsgId(maxId);
      }
    } catch {}
  }, [lastMsgId, isOpen]);

  useEffect(() => {
    if (phase === 'chat') {
      pollMessages();
      pollRef.current = setInterval(pollMessages, 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [phase, pollMessages]);

  // ── Start conversation ──
  async function handleStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    saveVisitor({ name: name.trim(), email: email.trim() });
    try {
      await chatApi('/chat/public/start', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: convId.current,
          customer_name: name.trim(),
          customer_email: email.trim(),
        }),
      });
      setPhase('chat');
      setTimeout(() => inputRef.current?.focus(), 200);
    } catch {}
  }

  // ── Send message ──
  async function handleSend(e) {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    setInput('');
    // Optimistic add
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, sender_type: 'customer', message: msg, created_at: new Date().toISOString(), _temp: true }]);
    try {
      await chatApi('/chat/public/send', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: convId.current,
          message: msg,
          customer_name: name.trim(),
          customer_email: email.trim(),
        }),
      });
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  }

  // ── Key handler ──
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const toggle = () => setIsOpen(!isOpen);

  // ───────────────────────────────
  //  RENDER
  // ───────────────────────────────
  return (
    <>
      {/* ── Injected Styles ── */}
      <style>{`
        @keyframes nf-chat-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nf-chat-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5); }
          50%      { box-shadow: 0 0 0 14px rgba(124, 58, 237, 0); }
        }
        @keyframes nf-chat-bounce {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        @keyframes nf-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nf-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1); opacity: 1; }
        }
        .nf-chat-widget * { box-sizing: border-box; }
        .nf-chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .nf-chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .nf-chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      <div className="nf-chat-widget" style={{ position: 'fixed', bottom: 16, [isRTL ? 'left' : 'right']: 16, zIndex: 99999, fontFamily: "'Segoe UI', 'Cairo', system-ui, sans-serif", direction: isRTL ? 'rtl' : 'ltr' }}>

        {/* ════════ Chat Window ════════ */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: 72,
            [isRTL ? 'left' : 'right']: 0,
            width: 380,
            maxWidth: 'calc(100vw - 24px)',
            height: 520,
            maxHeight: 'calc(100vh - 100px)',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#0c0f1a',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124, 58, 237, 0.1)',
            animation: animate ? 'nf-chat-slide-up 0.3s ease forwards' : 'none',
            opacity: animate ? 1 : 0,
          }}>

            {/* ─── Header ─── */}
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
              padding: '18px 20px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -20, [isRTL ? 'left' : 'right']: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', bottom: -30, [isRTL ? 'right' : 'left']: 40, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'grid', placeItems: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    <span style={{ fontSize: 20 }}>💬</span>
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{t.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 500 }}>{t.online}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={toggle} aria-label="Close" style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', color: '#fff',
                    display: 'grid', placeItems: 'center',
                    transition: 'background 0.2s',
                  }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                    <CloseIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Intro Phase ─── */}
            {phase === 'intro' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 24px' }}>
                {/* Welcome */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))',
                    display: 'grid', placeItems: 'center',
                    border: '1px solid rgba(124,58,237,0.3)',
                  }}>
                    <span style={{ fontSize: 30 }}>👋</span>
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>{t.subtitle}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: 0 }}>{t.typingHint}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>{t.nameLabel} *</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      required
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '0.9rem', outline: 'none',
                        transition: 'border 0.2s',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>{t.emailLabel}</label>
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      type="email"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '0.9rem', outline: 'none',
                        transition: 'border 0.2s',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <button type="submit" style={{
                    marginTop: 4, padding: '12px 0', borderRadius: 12,
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    border: 'none', color: '#fff', fontSize: '0.92rem',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'transform 0.15s, box-shadow 0.2s',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.4)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.3)'; }}
                  >
                    {t.startChat}
                  </button>
                </form>
              </div>
            )}

            {/* ─── Chat Phase ─── */}
            {phase === 'chat' && (
              <>
                {/* Messages */}
                <div className="nf-chat-scrollbar" style={{
                  flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  background: 'linear-gradient(180deg, #0c0f1a 0%, #0e1225 100%)',
                }}>
                  {/* Welcome message */}
                  {messages.length === 0 && (
                    <div style={{ animation: 'nf-msg-in 0.3s ease' }}>
                      <div style={{
                        display: 'flex', gap: 8, alignItems: 'flex-end',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 10,
                          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                          display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 14 }}>🤖</span>
                        </div>
                        <div style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: isRTL ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          padding: '10px 14px',
                          maxWidth: '80%',
                        }}>
                          <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{t.welcome}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isCustomer = msg.sender_type === 'customer';
                    return (
                      <div key={msg.id || i} style={{
                        display: 'flex', gap: 8,
                        flexDirection: isCustomer
                          ? (isRTL ? 'row' : 'row-reverse')
                          : (isRTL ? 'row-reverse' : 'row'),
                        alignItems: 'flex-end',
                        animation: 'nf-msg-in 0.25s ease',
                      }}>
                        {/* Avatar for admin */}
                        {!isCustomer && (
                          <div style={{
                            width: 28, height: 28, borderRadius: 9,
                            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 12 }}>🛡️</span>
                          </div>
                        )}
                        <div style={{ maxWidth: '78%' }}>
                          <div style={{
                            background: isCustomer
                              ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                              : 'rgba(255,255,255,0.06)',
                            border: isCustomer ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: isCustomer
                              ? (isRTL ? '16px 16px 16px 4px' : '16px 16px 4px 16px')
                              : (isRTL ? '16px 4px 16px 16px' : '4px 16px 16px 16px'),
                            padding: '10px 14px',
                            boxShadow: isCustomer ? '0 2px 10px rgba(124,58,237,0.25)' : 'none',
                          }}>
                            <p style={{ color: isCustomer ? '#fff' : '#e2e8f0', fontSize: '0.85rem', margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</p>
                          </div>
                          <p style={{
                            fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', margin: '3px 4px 0',
                            textAlign: isCustomer ? (isRTL ? 'left' : 'right') : (isRTL ? 'right' : 'left'),
                          }}>
                            {msg.created_at ? timeAgo(msg.created_at, t) : t.justNow}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={{
                  padding: '12px 14px 14px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: '#0a0d18',
                }}>
                  <form onSubmit={handleSend} style={{
                    display: 'flex', gap: 8, alignItems: 'flex-end',
                  }}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.messagePlaceholder}
                      rows={1}
                      style={{
                        flex: 1, resize: 'none',
                        padding: '10px 14px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '0.88rem',
                        outline: 'none', fontFamily: 'inherit',
                        maxHeight: 80, lineHeight: 1.4,
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <button type="submit" disabled={!input.trim() || sending} style={{
                      width: 42, height: 42, borderRadius: 14,
                      background: input.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.05)',
                      border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                      color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                      transition: 'all 0.2s',
                      transform: isRTL ? 'scaleX(-1)' : 'none',
                    }}>
                      <SendIcon />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Footer branding */}
            <div style={{
              padding: '6px', textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: '#080b14',
            }}>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)', fontWeight: 600, letterSpacing: '0.05em' }}>
                ⚡ {t.powered}
              </span>
            </div>
          </div>
        )}

        {/* ════════ Floating Bubble ════════ */}
        <button
          onClick={toggle}
          aria-label="Chat"
          style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            border: 'none', cursor: 'pointer', color: '#fff',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 8px 30px rgba(124,58,237,0.4), 0 2px 8px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: bubblePulse ? 'nf-chat-pulse 2s ease infinite' : 'none',
            position: 'relative',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.5), 0 2px 8px rgba(0,0,0,0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.4), 0 2px 8px rgba(0,0,0,0.3)'; }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}

          {/* Unread badge */}
          {!isOpen && unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, [isRTL ? 'left' : 'right']: -4,
              width: 22, height: 22, borderRadius: '50%',
              background: '#ef4444', color: '#fff',
              fontSize: '0.72rem', fontWeight: 800,
              display: 'grid', placeItems: 'center',
              border: '2px solid #0c0f1a',
              animation: 'nf-chat-bounce 0.5s ease',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
