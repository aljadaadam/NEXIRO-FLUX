'use client';

import { useState, useEffect } from 'react';
import { useHxTheme } from '@/providers/HxThemeProvider';
import { hxStoreApi } from '@/lib/hxApi';
import { User, Mail, Phone, MapPin, LogOut, Edit3, Save, ShoppingBag, Wallet } from 'lucide-react';

export default function HxProfilePage() {
  const { currentTheme, darkMode, t, isRTL, formatPrice, buttonRadius } = useHxTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const token = localStorage.getItem('hx_auth_token');
    if (token) {
      setIsLoggedIn(true);
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await hxStoreApi.getProfile();
      setProfile(data.customer || data);
    } catch {
      setIsLoggedIn(false);
      localStorage.removeItem('hx_auth_token');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await hxStoreApi.login(loginEmail, loginPassword);
      localStorage.setItem('hx_auth_token', data.token);
      setProfile(data.customer);
      setIsLoggedIn(true);
    } catch (err: any) {
      setMessage(err.message || t('خطأ'));
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (regPassword !== regConfirm) {
      setMessage(t('كلمة المرور غير متطابقة'));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const data = await hxStoreApi.register({
        name: regName, email: regEmail, password: regPassword,
        phone: regPhone, country: regCountry, city: regCity, address: regAddress,
      });
      localStorage.setItem('hx_auth_token', data.token);
      setProfile(data.customer);
      setIsLoggedIn(true);
    } catch (err: any) {
      setMessage(err.message || t('خطأ'));
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hx_auth_token');
    setIsLoggedIn(false);
    setProfile(null);
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await hxStoreApi.updateProfile(profile);
      setEditing(false);
      setMessage(t('تم الحفظ بنجاح'));
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || t('خطأ'));
    }
    setLoading(false);
  };

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        {!isLoggedIn ? (
          /* ─── Login / Register ─── */
          <div className="hx-animate-fade">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: currentTheme.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: `0 8px 25px ${currentTheme.primary}40`,
              }}>
                <User size={36} color="#fff" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: text }}>
                {isRegister ? t('إنشاء حساب') : t('تسجيل دخول')}
              </h1>
            </div>

            <div style={{
              background: cardBg, borderRadius: 20, padding: 28,
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
              {!isRegister ? (
                /* Login Form */
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('البريد الإلكتروني')}</label>
                    <input className="hx-input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('كلمة المرور')}</label>
                    <input className="hx-input" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={loading || !loginEmail || !loginPassword}
                    className="hx-btn-primary"
                    style={{
                      width: '100%', background: currentTheme.primary,
                      borderRadius: Number(buttonRadius), padding: '14px', fontSize: 16,
                      opacity: (loading || !loginEmail || !loginPassword) ? 0.6 : 1,
                    }}
                  >
                    {loading ? t('جاري المعالجة...') : t('تسجيل دخول')}
                  </button>
                </div>
              ) : (
                /* Register Form */
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الاسم')} *</label>
                      <input className="hx-input" value={regName} onChange={e => setRegName(e.target.value)} placeholder={t('الاسم')} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('رقم الهاتف')}</label>
                      <input className="hx-input" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+966 5x xxx xxxx" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('البريد الإلكتروني')} *</label>
                    <input className="hx-input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('كلمة المرور')} *</label>
                      <input className="hx-input" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('تأكيد كلمة المرور')} *</label>
                      <input className="hx-input" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="••••••••" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الدولة')}</label>
                      <input className="hx-input" value={regCountry} onChange={e => setRegCountry(e.target.value)} placeholder={t('الدولة')} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('المدينة')}</label>
                      <input className="hx-input" value={regCity} onChange={e => setRegCity(e.target.value)} placeholder={t('المدينة')} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('عنوان التوصيل')}</label>
                    <input className="hx-input" value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder={t('عنوان التوصيل')} />
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={loading || !regName || !regEmail || !regPassword}
                    className="hx-btn-primary"
                    style={{
                      width: '100%', background: currentTheme.primary,
                      borderRadius: Number(buttonRadius), padding: '14px', fontSize: 16,
                      opacity: (loading || !regName || !regEmail || !regPassword) ? 0.6 : 1,
                    }}
                  >
                    {loading ? t('جاري المعالجة...') : t('إنشاء حساب')}
                  </button>
                </div>
              )}

              {message && (
                <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, background: message.includes('نجاح') ? '#10b98115' : '#ef444415', color: message.includes('نجاح') ? '#10b981' : '#ef4444', fontSize: 13, fontWeight: 600 }}>
                  {message}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: subtext }}>
                {isRegister ? t('لديك حساب؟') : t('ليس لديك حساب؟')}{' '}
                <button onClick={() => { setIsRegister(!isRegister); setMessage(''); }} style={{
                  background: 'none', border: 'none', color: currentTheme.primary,
                  cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                }}>
                  {isRegister ? t('تسجيل دخول') : t('إنشاء حساب')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── Profile View ─── */
          <div className="hx-animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: text }}>👤 {t('حسابي')}</h1>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: Number(buttonRadius),
                background: '#ef444415', color: '#ef4444', border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}>
                <LogOut size={14} />
                {t('تسجيل خروج')}
              </button>
            </div>

            {/* Profile Card */}
            <div style={{
              background: cardBg, borderRadius: 20, padding: 28, marginBottom: 20,
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: currentTheme.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#fff', fontWeight: 900,
                }}>
                  {((profile?.name as string) || 'U').charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: text }}>{profile?.name as string}</h2>
                  <p style={{ fontSize: 13, color: subtext }}>{profile?.email as string}</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ textAlign: 'center', padding: 16, background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 12 }}>
                  <ShoppingBag size={20} style={{ color: currentTheme.primary, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 20, fontWeight: 800, color: text }}>{(profile?.orders_count as number) || 0}</div>
                  <div style={{ fontSize: 11, color: subtext }}>{t('طلباتي')}</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 12 }}>
                  <Wallet size={20} style={{ color: '#10b981', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 20, fontWeight: 800, color: text }}>{formatPrice((profile?.wallet_balance as number) || 0)}</div>
                  <div style={{ fontSize: 11, color: subtext }}>{t('المحفظة')}</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 12 }}>
                  <MapPin size={20} style={{ color: '#f59e0b', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{(profile?.country as string) || '—'}</div>
                  <div style={{ fontSize: 11, color: subtext }}>{t('الدولة')}</div>
                </div>
              </div>

              {/* Profile Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {editing ? (
                  <>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الاسم')}</label>
                      <input className="hx-input" value={(profile?.name as string) || ''} onChange={e => setProfile({ ...profile!, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('رقم الهاتف')}</label>
                      <input className="hx-input" value={(profile?.phone as string) || ''} onChange={e => setProfile({ ...profile!, phone: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('الدولة')}</label>
                      <input className="hx-input" value={(profile?.country as string) || ''} onChange={e => setProfile({ ...profile!, country: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 6, display: 'block' }}>{t('المدينة')}</label>
                      <input className="hx-input" value={(profile?.city as string) || ''} onChange={e => setProfile({ ...profile!, city: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button onClick={handleUpdateProfile} disabled={loading} className="hx-btn-primary" style={{ flex: 1, background: currentTheme.primary, borderRadius: Number(buttonRadius) }}>
                        <Save size={16} /> {loading ? t('جاري المعالجة...') : t('حفظ')}
                      </button>
                      <button onClick={() => setEditing(false)} className="hx-btn-secondary" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', color: text, borderRadius: Number(buttonRadius) }}>
                        {t('إلغاء')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { icon: <Mail size={16} />, label: t('البريد الإلكتروني'), value: profile?.email },
                      { icon: <Phone size={16} />, label: t('رقم الهاتف'), value: profile?.phone || '—' },
                      { icon: <MapPin size={16} />, label: t('العنوان'), value: `${profile?.country || ''} ${profile?.city || ''}`.trim() || '—' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: darkMode ? '#111827' : '#f1f5f9', borderRadius: 10 }}>
                        <span style={{ color: currentTheme.primary }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: subtext }}>{item.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{item.value as string}</div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setEditing(true)} className="hx-btn-secondary" style={{ borderColor: currentTheme.primary, color: currentTheme.primary, borderRadius: Number(buttonRadius), marginTop: 8 }}>
                      <Edit3 size={16} /> {t('تعديل')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {message && (
              <div style={{ padding: '10px 16px', borderRadius: 10, background: '#10b98115', color: '#10b981', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                {message}
              </div>
            )}

            <a href="/orders" className="hx-btn-primary" style={{
              width: '100%', background: darkMode ? '#334155' : '#f1f5f9',
              color: text, borderRadius: Number(buttonRadius),
              display: 'flex', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} />
              {t('طلباتي السابقة')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
