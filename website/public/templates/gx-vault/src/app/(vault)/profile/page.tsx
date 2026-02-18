'use client';

import { useState, useEffect } from 'react';
import {
  User, Mail, Lock, LogIn, UserPlus, Wallet, LogOut,
  Package, ShoppingCart, Headphones, ChevronLeft,
  Plus, CreditCard, Sparkles, Shield, Calendar, Hash,
  TrendingUp, Zap, X, Copy, Check,
} from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvStoreApi, gxvIsDemoMode } from '@/engine/gxvApi';

export default function GxvProfilePage() {
  const { currentTheme } = useGxvTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeMsg, setRechargeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const isDemo = gxvIsDemoMode();

  useEffect(() => {
    if (isDemo) {
      setIsLoggedIn(true);
      gxvStoreApi.getProfile().then(data => { if (data?.name) setProfile(data); });
      gxvStoreApi.getOrders().then(data => {
        const list = Array.isArray(data) ? data : data?.orders || [];
        setOrders(list);
      });
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      gxvStoreApi.getProfile().then(data => { if (data?.name) setProfile(data); });
      gxvStoreApi.getOrders().then(data => {
        const list = Array.isArray(data) ? data : data?.orders || [];
        setOrders(list);
      });
    }
  }, [isDemo]);

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
        gxvStoreApi.getOrders().then(data => {
          const list = Array.isArray(data) ? data : data?.orders || [];
          setOrders(list);
        });
        setMsg({ ok: true, text: mode === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح' });
      }
    } catch (err: unknown) {
      setMsg({ ok: false, text: (err as Error).message || 'حدث خطأ' });
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    if (isDemo) return;
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setProfile(null);
    setOrders([]);
  };

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount <= 0) { setRechargeMsg({ ok: false, text: 'أدخل مبلغ صحيح' }); return; }
    setRechargeLoading(true); setRechargeMsg(null);
    try {
      const res = await gxvStoreApi.chargeWallet({ amount });
      if (res.error) throw new Error(res.error);
      setRechargeMsg({ ok: true, text: `تم شحن $${amount.toFixed(2)} بنجاح! ✨` });
      if (profile) setProfile({ ...profile, balance: Number(profile.balance || 0) + amount });
      setTimeout(() => { setShowRecharge(false); setRechargeMsg(null); setRechargeAmount(''); }, 2000);
    } catch (err: unknown) {
      setRechargeMsg({ ok: false, text: (err as Error).message || 'حدث خطأ' });
    } finally { setRechargeLoading(false); }
  };

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const memberSince = profile?.created_at
    ? new Date(String(profile.created_at)).toLocaleDateString('ar', { year: 'numeric', month: 'long' })
    : '';

  // ─── Auth Screen (Login/Register) ───
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 80px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
              boxShadow: currentTheme.glow,
            }}>
              <User size={32} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              {mode === 'login' ? 'مرحباً بعودتك! 👋' : 'أنشئ حسابك 🚀'}
            </h1>
            <p style={{ color: '#666688', fontSize: '0.9rem', margin: 0 }}>
              {mode === 'login' ? 'سجّل دخولك للوصول لحسابك ومتابعة طلباتك' : 'انضم إلينا واستمتع بأفضل عروض الشحن'}
            </p>
          </div>

          <div style={{
            borderRadius: 24, background: 'rgba(15,15,35,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden', backdropFilter: 'blur(20px)',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {(['login', 'register'] as const).map(tab => (
                <button key={tab} onClick={() => { setMode(tab); setMsg(null); }} style={{
                  flex: 1, padding: '16px', border: 'none', cursor: 'pointer',
                  background: mode === tab ? currentTheme.surface : 'transparent',
                  color: mode === tab ? currentTheme.primary : '#555577',
                  fontSize: '0.88rem', fontWeight: 700,
                  borderBottom: mode === tab ? `2px solid ${currentTheme.primary}` : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}>
                  {tab === 'login' ? <><LogIn size={16} /> تسجيل الدخول</> : <><UserPlus size={16} /> حساب جديد</>}
                </button>
              ))}
            </div>

            <div style={{ padding: '28px 24px' }}>
              {mode === 'register' && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
                    <User size={13} color={currentTheme.primary} /> الاسم
                  </label>
                  <input type="text" placeholder="أدخل اسمك الكامل" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
                  <Mail size={13} color={currentTheme.primary} /> البريد الإلكتروني
                </label>
                <input type="email" placeholder="email@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
                  <Lock size={13} color={currentTheme.primary} /> كلمة المرور
                </label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>

              {msg && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12, marginBottom: 18, textAlign: 'center',
                  background: msg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: msg.ok ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600,
                }}>{msg.text}</div>
              )}

              <button onClick={handleAuth} disabled={loading} style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: currentTheme.gradient, color: '#fff', border: 'none',
                cursor: loading ? 'wait' : 'pointer', fontSize: '1rem', fontWeight: 700,
                boxShadow: currentTheme.glow, opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}>
                {loading ? (
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'gxvSpin 0.6s linear infinite' }} />
                ) : (
                  <>{mode === 'login' ? <><LogIn size={18} /> تسجيل الدخول</> : <><Sparkles size={18} /> إنشاء الحساب</>}</>
                )}
              </button>
            </div>
          </div>

          {/* Security note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, color: '#444466', fontSize: '0.78rem' }}>
            <Shield size={13} /> جميع البيانات مشفرة وآمنة
          </div>
        </div>
      </div>
    );
  }

  // ─── Profile Dashboard ───
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 24px 80px' }}>

      {/* Profile Header Card */}
      <div style={{
        borderRadius: 24, overflow: 'hidden', marginBottom: 20,
        background: 'rgba(15,15,35,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Gradient Banner */}
        <div style={{
          height: 100, position: 'relative',
          background: currentTheme.gradient,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div style={{ padding: '0 28px 28px', marginTop: -40 }}>
          {/* Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 22,
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
              fontSize: '2rem', color: '#fff', fontWeight: 800,
              border: '4px solid #0f0f23',
              boxShadow: currentTheme.glow,
              flexShrink: 0,
            }}>
              {String(profile?.name || '?').charAt(0)}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                {String(profile?.name || 'المستخدم')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#666688', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={12} /> {String(profile?.email || '')}
                </span>
                {memberSince && (
                  <span style={{ color: '#555577', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> عضو منذ {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="gxv-grid-stats" style={{ gap: 12 }}>
            {/* Wallet Balance */}
            <div className="gxv-card-hover" style={{
              padding: '18px', borderRadius: 18,
              background: `linear-gradient(135deg, ${currentTheme.primary}12, ${currentTheme.primary}05)`,
              border: `1px solid ${currentTheme.primary}20`,
              cursor: 'pointer',
            }} onClick={() => setShowRecharge(true)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: `${currentTheme.primary}20`,
                  display: 'grid', placeItems: 'center',
                  color: currentTheme.primary,
                }}>
                  <Wallet size={18} />
                </div>
                <Plus size={16} style={{ color: currentTheme.primary, opacity: 0.7 }} />
              </div>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 2px' }}>الرصيد</p>
              <p style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                ${Number(profile?.balance || 0).toFixed(2)}
              </p>
            </div>

            {/* Total Orders */}
            <div style={{
              padding: '18px', borderRadius: 18,
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.12)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'rgba(59,130,246,0.12)',
                display: 'grid', placeItems: 'center',
                color: '#3b82f6', marginBottom: 8,
              }}>
                <Package size={18} />
              </div>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 2px' }}>إجمالي الطلبات</p>
              <p style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{orders.length}</p>
            </div>

            {/* Completed */}
            <div style={{
              padding: '18px', borderRadius: 18,
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.12)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'rgba(34,197,94,0.12)',
                display: 'grid', placeItems: 'center',
                color: '#22c55e', marginBottom: 8,
              }}>
                <TrendingUp size={18} />
              </div>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 2px' }}>مكتمل</p>
              <p style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{completedOrders}</p>
            </div>

            {/* User ID */}
            <div style={{
              padding: '18px', borderRadius: 18,
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: 'rgba(168,85,247,0.12)',
                  display: 'grid', placeItems: 'center',
                  color: '#a855f7',
                }}>
                  <Hash size={18} />
                </div>
                <button onClick={() => {
                  navigator.clipboard?.writeText(String(profile?.id || ''));
                  setCopiedId(true); setTimeout(() => setCopiedId(false), 1500);
                }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: copiedId ? '#22c55e' : '#555577', transition: 'color 0.2s',
                }}>
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 2px' }}>معرّف الحساب</p>
              <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>#{String(profile?.id || '0')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        {[
          { label: 'شحن رصيد', icon: <Plus size={20} />, color: currentTheme.primary, action: () => setShowRecharge(true) },
          { label: 'طلباتي', icon: <Package size={20} />, color: '#3b82f6', href: '/orders' },
          { label: 'ابدأ الشحن', icon: <ShoppingCart size={20} />, color: '#22c55e', href: '/services' },
          { label: 'الدعم الفني', icon: <Headphones size={20} />, color: '#f59e0b', href: '/support' },
        ].map((item, i) => (
          item.href ? (
            <a key={i} href={item.href} className="gxv-card-hover" style={{
              padding: '20px 18px', borderRadius: 18,
              background: 'rgba(15,15,35,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `${item.color}12`,
                display: 'grid', placeItems: 'center',
                color: item.color, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#e8e8ff', fontSize: '0.9rem', fontWeight: 700 }}>{item.label}</span>
              </div>
              <ChevronLeft size={16} style={{ color: '#444466' }} />
            </a>
          ) : (
            <button key={i} onClick={item.action} className="gxv-card-hover" style={{
              padding: '20px 18px', borderRadius: 18,
              background: 'rgba(15,15,35,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'right',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `${item.color}12`,
                display: 'grid', placeItems: 'center',
                color: item.color, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#e8e8ff', fontSize: '0.9rem', fontWeight: 700 }}>{item.label}</span>
              </div>
              <ChevronLeft size={16} style={{ color: '#444466' }} />
            </button>
          )
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{
        borderRadius: 20, background: 'rgba(15,15,35,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e8e8ff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} color={currentTheme.primary} /> آخر الطلبات
          </h2>
          <a href="/orders" style={{
            color: currentTheme.primary, fontSize: '0.8rem', fontWeight: 600,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            عرض الكل <ChevronLeft size={14} />
          </a>
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#555577' }}>
            <Package size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>لا توجد طلبات بعد</p>
            <a href="/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 12, padding: '10px 24px', borderRadius: 12,
              background: currentTheme.gradient, color: '#fff',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              boxShadow: currentTheme.glow,
            }}>
              <Zap size={14} /> ابدأ أول طلب
            </a>
          </div>
        ) : (
          <div style={{ padding: '8px 12px' }}>
            {orders.slice(0, 4).map((order, i) => {
              const status = String(order.status || 'pending');
              const statusMap: Record<string, { color: string; label: string }> = {
                completed: { color: '#22c55e', label: 'مكتمل' },
                pending: { color: '#f59e0b', label: 'قيد الانتظار' },
                processing: { color: '#3b82f6', label: 'قيد المعالجة' },
                cancelled: { color: '#ef4444', label: 'ملغي' },
                failed: { color: '#ef4444', label: 'فشل' },
              };
              const st = statusMap[status] || statusMap.pending;
              return (
                <div key={String(order.id || i)} style={{
                  padding: '14px 12px', borderRadius: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 12, flexWrap: 'wrap',
                  borderBottom: i < Math.min(orders.length, 4) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 160 }}>
                    <span style={{ fontSize: '1.1rem' }}>{String(order.icon || '🎮')}</span>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e8ff', margin: 0 }}>
                        {String(order.product || order.product_name || `طلب #${order.id}`)}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#555577', margin: '2px 0 0' }}>
                        {order.date || order.created_at ? new Date(String(order.date || order.created_at)).toLocaleDateString('ar') : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                      {order.price ? String(order.price) : order.total_price ? `$${Number(order.total_price).toFixed(2)}` : ''}
                    </span>
                    <span style={{
                      padding: '4px 10px', borderRadius: 8,
                      background: `${st.color}12`, color: st.color,
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logout */}
      {!isDemo && (
        <button onClick={handleLogout} style={{
          width: '100%', padding: '15px', borderRadius: 16,
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.12)',
          color: '#f87171', cursor: 'pointer',
          fontSize: '0.88rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
        >
          <LogOut size={16} /> تسجيل الخروج
        </button>
      )}

      {/* ═══ Wallet Recharge Modal ═══ */}
      {showRecharge && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center', padding: 16,
          animation: 'gxvFadeIn 0.2s ease-out',
        }} onClick={() => { setShowRecharge(false); setRechargeMsg(null); }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 420, borderRadius: 24,
            background: '#0f0f23', border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden', animation: 'gxvSlideUp 0.3s ease-out',
          }}>
            {/* Header */}
            <div style={{
              padding: '22px 24px',
              background: `linear-gradient(135deg, ${currentTheme.primary}15, transparent)`,
              borderBottom: `1px solid ${currentTheme.primary}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${currentTheme.primary}20`,
                  display: 'grid', placeItems: 'center',
                  color: currentTheme.primary,
                }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>شحن الرصيد</h3>
                  <p style={{ color: '#666688', fontSize: '0.78rem', margin: 0 }}>الرصيد الحالي: ${Number(profile?.balance || 0).toFixed(2)}</p>
                </div>
              </div>
              <button onClick={() => { setShowRecharge(false); setRechargeMsg(null); }} style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: 'none',
                color: '#666688', cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Quick amounts */}
              <p style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600, marginBottom: 10 }}>اختر المبلغ</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
                {[5, 10, 25, 50, 100, 250].map(amt => (
                  <button key={amt} onClick={() => setRechargeAmount(String(amt))} style={{
                    padding: '12px', borderRadius: 12,
                    background: rechargeAmount === String(amt)
                      ? `linear-gradient(135deg, ${currentTheme.primary}25, ${currentTheme.primary}10)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${rechargeAmount === String(amt) ? `${currentTheme.primary}40` : 'rgba(255,255,255,0.06)'}`,
                    color: rechargeAmount === String(amt) ? currentTheme.primary : '#b8b8cc',
                    cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700,
                    transition: 'all 0.2s',
                  }}>
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <p style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>أو أدخل مبلغ مخصص</p>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <span style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  color: currentTheme.primary, fontWeight: 800, fontSize: '1rem',
                }}>$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={rechargeAmount}
                  onChange={e => setRechargeAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 16px 16px 16px', paddingRight: 36,
                    borderRadius: 14, background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${rechargeAmount ? `${currentTheme.primary}40` : 'rgba(255,255,255,0.08)'}`,
                    color: '#e8e8ff', fontSize: '1.1rem', fontWeight: 700,
                    outline: 'none', fontFamily: 'Tajawal, sans-serif',
                    textAlign: 'left', direction: 'ltr',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
                  onBlur={e => {
                    if (!rechargeAmount) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                />
              </div>

              {/* Recharge message */}
              {rechargeMsg && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'center',
                  background: rechargeMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${rechargeMsg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: rechargeMsg.ok ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 600,
                }}>{rechargeMsg.text}</div>
              )}

              {/* Confirm */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleRecharge} disabled={rechargeLoading} style={{
                  flex: 1, padding: '16px', borderRadius: 16,
                  background: currentTheme.gradient, color: '#fff', border: 'none',
                  cursor: rechargeLoading ? 'wait' : 'pointer',
                  fontSize: '0.95rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: currentTheme.glow,
                  opacity: rechargeLoading ? 0.7 : 1,
                }}>
                  {rechargeLoading ? (
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'gxvSpin 0.6s linear infinite' }} />
                  ) : (
                    <><CreditCard size={16} /> شحن الرصيد</>
                  )}
                </button>
                <button onClick={() => { setShowRecharge(false); setRechargeMsg(null); }} style={{
                  padding: '16px 20px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8888aa', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: 600,
                }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
