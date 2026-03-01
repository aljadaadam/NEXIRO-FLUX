'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { MessageCircle, X, Send } from 'lucide-react';
import { storeApi } from '@/lib/api';

export default function ChatWidget() {
  const { currentTheme, darkMode, isRTL, t } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; sender_type: string; message: string; created_at: string }>>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);

  const startChat = useCallback(async () => {
    const cid = `smm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await storeApi.chatStart(cid, name || 'زائر');
      setConvId(cid);
      setStarted(true);
    } catch { /* ignore */ }
  }, [name]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !convId) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender_type: 'customer', message: msg, created_at: new Date().toISOString() }]);
    try {
      await storeApi.chatSend(convId, msg, name);
    } catch { /* ignore */ }
  }, [input, convId, name]);

  // Poll for messages
  useEffect(() => {
    if (!convId || !open) return;
    const interval = setInterval(async () => {
      try {
        const last = messages.length > 0 ? messages[messages.length - 1].id : undefined;
        const data = await storeApi.chatMessages(convId, last);
        if (data.messages?.length > 0) {
          setMessages(prev => [...prev, ...data.messages]);
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [convId, open, messages]);

  return (
    <>
      {/* Chat FAB */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 80, [isRTL ? 'left' : 'right']: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: currentTheme.gradient,
          border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          color: '#fff', zIndex: 90,
          boxShadow: `0 4px 20px ${currentTheme.primary}40`,
          transition: 'all 0.3s ease',
        }}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 145, [isRTL ? 'left' : 'right']: 20,
          width: 360, maxWidth: 'calc(100vw - 40px)',
          height: 460, maxHeight: 'calc(100vh - 200px)',
          borderRadius: 20, zIndex: 90,
          background: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#fff',
          border: `1px solid ${darkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(0,0,0,0.1)'}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: darkMode ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: currentTheme.gradient,
            color: '#fff',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('محادثة مباشرة')}</h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, marginTop: 2 }}>{t('كيف يمكننا مساعدتك؟')}</p>
          </div>

          {/* Messages / Start */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {!started ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0' }}>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                  {t('أدخل اسمك لبدء المحادثة')}
                </p>
                <input
                  className="glass-input"
                  placeholder={t('الاسم')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <button
                  onClick={startChat}
                  className="neon-btn"
                  style={{ background: currentTheme.gradient, color: '#fff', width: '100%' }}
                >
                  {t('ابدأ محادثة')}
                </button>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender_type === 'customer' ? 'flex-end' : 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <div style={{
                    maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
                    background: msg.sender_type === 'customer' ? currentTheme.gradient : (darkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                    color: msg.sender_type === 'customer' ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.85rem', lineHeight: 1.5,
                  }}>
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          {started && (
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex', gap: 8,
            }}>
              <input
                className="glass-input"
                placeholder={t('أرسل رسالة')}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1, padding: '10px 14px' }}
              />
              <button
                onClick={sendMessage}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: currentTheme.gradient,
                  border: 'none', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                  color: '#fff', flexShrink: 0,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
