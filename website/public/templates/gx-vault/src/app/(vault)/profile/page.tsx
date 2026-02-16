'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, LogIn, UserPlus, Wallet, LogOut } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvStoreApi } from '@/engine/gxvApi';

export default function GxvProfilePage() {
  const { currentTheme } = useGxvTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      gxvStoreApi.getProfile().then(data => {
        if (data?.name) setProfile(data);
      });
    }
  }, []);

  const handleAuth = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = mode === 'login'
        ? await gxvStoreApi.login({ email: form.email, password: form.password })
        : await gxvStoreApi.register({ name: form.name, email: form.email, password: form.password });
      if (res.error) throw new Error(res.error);
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
        setIsLoggedIn(true);
        gxvStoreApi.getProfile().then(data => { if (data?.name) setProfile(data); });
        setMsg({ ok: true, text: mode === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح' });
      }
    } catch (err: unknown) {
      setMsg({ ok: false, text: (err as Error).message || 'حدث خطأ' });
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setProfile(null);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{
          borderRadius: 20, background: 'rgba(15,15,35,0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'register'] as const).map(tab => (
              <button key={tab} onClick={() => { setMode(tab); setMsg(null); }} style={{
                flex: 1, padding: '14px', border: 'none', cursor: 'pointer',
                background: mode === tab ? currentTheme.surface : 'transparent',
                color: mode === tab ? currentTheme.primary : '#666688',
                fontSize: '0.9rem', fontWeight: 700,
                borderBottom: mode === tab ? `2px solid ${currentTheme.primary}` : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {tab === 'login' ? <><LogIn size={15} /> تسجيل الدخول</> : <><UserPlus size={15} /> حساب جديد</>}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>الاسم</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
                  <input type="text" placeholder="اسمك" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 40px 12px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                    }} />
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>البريد الإلكتروني</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
                <input type="email" placeholder="email@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 40px 12px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                  }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 40px 12px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                  }} />
              </div>
            </div>

            {msg && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 16, textAlign: 'center',
                background: msg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: msg.ok ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600,
              }}>{msg.text}</div>
            )}

            <button onClick={handleAuth} disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: currentTheme.gradient, color: '#fff', border: 'none',
              cursor: loading ? 'wait' : 'pointer', fontSize: '0.95rem', fontWeight: 700,
              boxShadow: currentTheme.glow, opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'جاري...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in profile
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '30px 24px 80px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 24 }}>👤 حسابي</h1>

      <div style={{
        borderRadius: 20, background: 'rgba(15,15,35,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '24px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: currentTheme.gradient,
            display: 'grid', placeItems: 'center',
            fontSize: '1.5rem', color: '#fff', fontWeight: 800,
          }}>
            {String(profile?.name || '?').charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {String(profile?.name || 'المستخدم')}
            </h3>
            <p style={{ color: '#666688', fontSize: '0.85rem', margin: 0 }}>
              {String(profile?.email || '')}
            </p>
          </div>
        </div>

        {profile?.balance !== undefined && (
          <div style={{
            padding: '16px', borderRadius: 14,
            background: currentTheme.surface,
            border: `1px solid ${currentTheme.primary}20`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Wallet size={20} style={{ color: currentTheme.primary }} />
            <div>
              <span style={{ color: '#888', fontSize: '0.78rem' }}>الرصيد</span>
              <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                ${Number(profile.balance).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleLogout} style={{
        width: '100%', padding: '14px', borderRadius: 14,
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        color: '#f87171', cursor: 'pointer',
        fontSize: '0.9rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <LogOut size={16} /> تسجيل الخروج
      </button>
    </div>
  );
}
