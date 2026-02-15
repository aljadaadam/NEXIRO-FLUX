'use client';

import { useState, useEffect } from 'react';
import {
  User, CreditCard, Shield, Wallet, Lock, Mail, Phone,
  CheckCircle, X, Upload, Send, Save, ChevronRight, ChevronLeft,
  ShoppingCart, Bell, Settings, LogOut, DollarSign, Clock
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';

// ─── WalletChargeModal (Demo-style: 4-step with payment details) ───
function WalletChargeModal({ onClose }: { onClose: () => void }) {
  const { currentTheme, buttonRadius } = useTheme();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(false);
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  const methods = [
    { id: 'binance', name: 'Binance Pay', icon: '₿', color: '#f0b90b', desc: 'USDT — شبكة TRC20' },
    { id: 'paypal', name: 'PayPal', icon: '💳', color: '#003087', desc: 'تحويل عبر PayPal' },
    { id: 'bank', name: 'تحويل بنكي', icon: '🏦', color: '#059669', desc: 'حوالة بنكية مباشرة' },
    { id: 'vodafone', name: 'محفظة إلكترونية', icon: '📱', color: '#e60000', desc: 'فودافون كاش / STC Pay' },
  ];

  const presetAmounts = [5, 10, 25, 50, 100];

  const paymentInfo: Record<string, { label: string; value: string }[]> = {
    binance: [
      { label: 'العنوان', value: '—' },
      { label: 'الشبكة', value: 'TRC20 (Tron)' },
      { label: 'العملة', value: 'USDT' },
    ],
    paypal: [
      { label: 'إيميل PayPal', value: '—' },
      { label: 'ملاحظة', value: 'أرسل كـ Friends & Family' },
    ],
    bank: [
      { label: 'البنك', value: '—' },
      { label: 'اسم الحساب', value: '—' },
      { label: 'IBAN', value: '—' },
    ],
    vodafone: [
      { label: 'رقم المحفظة', value: '—' },
      { label: 'الاسم', value: '—' },
    ],
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1020' }}>
            {step === 1 ? '💰 شحن المحفظة' : step === 2 ? '📋 تفاصيل الدفع' : step === 3 ? '📎 رفع الإيصال' : '✅ تم الإرسال'}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Amount + Method */}
        {step === 1 && (
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10, display: 'block' }}>المبلغ ($)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {presetAmounts.map(a => (
                <button key={a} onClick={() => setAmount(String(a))} style={{
                  padding: '0.5rem 1rem', borderRadius: 10, border: amount === String(a) ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: amount === String(a) ? `${currentTheme.primary}10` : '#f8fafc', color: amount === String(a) ? currentTheme.primary : '#64748b',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', minWidth: 48,
                }}>${a}</button>
              ))}
            </div>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="أو أدخل مبلغ مخصص" type="number" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.88rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 10, display: 'block' }}>طريقة الدفع</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {methods.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem',
                  borderRadius: 12, cursor: 'pointer', width: '100%', fontFamily: 'Tajawal, sans-serif', textAlign: 'right',
                  border: method === m.id ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                  background: method === m.id ? `${currentTheme.primary}08` : '#fff',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020' }}>{m.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.desc}</p>
                  </div>
                  {method === m.id && <CheckCircle size={18} color={currentTheme.primary} />}
                </button>
              ))}
            </div>

            <button onClick={() => amount && method && setStep(2)} disabled={!amount || !method} style={{
              width: '100%', marginTop: 20, padding: '0.75rem', borderRadius: btnR,
              background: amount && method ? currentTheme.primary : '#e2e8f0', color: amount && method ? '#fff' : '#94a3b8',
              border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: amount && method ? 'pointer' : 'not-allowed',
              fontFamily: 'Tajawal, sans-serif',
            }}>متابعة — ${amount || '0'}</button>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && method && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, borderRadius: 14, padding: '1.25rem', marginBottom: 20, color: '#fff', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>المبلغ المطلوب</p>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>${amount}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 4 }}>عبر {methods.find(m => m.id === method)?.name}</p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 14, padding: '1.25rem', marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1020', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} color={currentTheme.primary} /> بيانات التحويل
              </h4>
              {paymentInfo[method]?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < paymentInfo[method].length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020', direction: 'ltr', maxWidth: '60%', textAlign: 'left', wordBreak: 'break-all' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fffbeb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>تأكد من إرسال المبلغ الصحيح. بعد التحويل أرفق إيصال الدفع للتأكيد.</p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.7rem', borderRadius: btnR, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>رجوع</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: '0.7rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Upload size={14} /> رفع الإيصال
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Receipt */}
        {step === 3 && (
          <div>
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: 16, padding: '2.5rem 1rem', textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: receipt ? '#f0fdf4' : '#fafafa' }} onClick={() => setReceipt(true)}>
              {receipt ? (
                <>
                  <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>تم رفع الإيصال بنجاح</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>receipt_2026.jpg</p>
                </>
              ) : (
                <>
                  <Upload size={36} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>اضغط لرفع صورة الإيصال</p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>JPG, PNG — حد أقصى 5MB</p>
                </>
              )}
            </div>

            <input placeholder="ملاحظات إضافية (اختياري)" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.7rem', borderRadius: btnR, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>رجوع</button>
              <button onClick={() => receipt && setStep(4)} disabled={!receipt} style={{
                flex: 2, padding: '0.7rem', borderRadius: btnR,
                background: receipt ? currentTheme.primary : '#e2e8f0', color: receipt ? '#fff' : '#94a3b8',
                border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: receipt ? 'pointer' : 'not-allowed',
                fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}><Send size={14} /> إرسال للمراجعة</button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>تم إرسال طلب الشحن!</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 6 }}>سيتم مراجعة الإيصال وإضافة الرصيد لمحفظتك خلال دقائق.</p>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: 10, background: '#f0f9ff', marginBottom: 20 }}>
              <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>رقم العملية: #WC-{Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>
            <br />
            <button onClick={onClose} style={{ padding: '0.7rem 2.5rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>حسناً</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── صفحة الملف الشخصي (Demo-style) ───
export default function ProfilePage() {
  const { currentTheme, buttonRadius } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState('login');
  const [view, setView] = useState('menu');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [personalData, setPersonalData] = useState({ name: '', email: '', phone: '', country: '' });
  const [personalSaved, setPersonalSaved] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; phone?: string; balance?: string }>({ name: '', email: '' });
  const btnR = buttonRadius === 'sharp' ? '4px' : buttonRadius === 'pill' ? '50px' : '10px';

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const transactions: { id: string; type: string; amount: string; method: string; date: string; status: string; statusColor: string; statusBg: string }[] = [];

  // Check if already logged in
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      setIsLoggedIn(true);
      loadProfile();
    }
  }, []);

  async function loadProfile() {
    try {
      const res = await storeApi.getProfile();
      if (res && !res.error) {
        setProfile({
          name: res.name || res.username || '',
          email: res.email || '',
          phone: res.phone || '',
          balance: res.balance || res.wallet?.balance || '$0.00',
        });
        setPersonalData(d => ({
          ...d,
          name: res.name || res.username || d.name,
          email: res.email || d.email,
          phone: res.phone || d.phone,
        }));
      }
    } catch { /* keep defaults */ }
  }

  async function handleAuth() {
    setAuthLoading(true);
    setAuthError('');
    try {
      let res;
      if (tab === 'login') {
        res = await storeApi.login({ email, password });
      } else {
        res = await storeApi.register({ name, email, password });
      }
      if (res?.token) {
        localStorage.setItem('auth_token', res.token);
        setIsLoggedIn(true);
        setProfile({ name: res.name || name, email: res.email || email });
        loadProfile();
      } else if (res?.error) {
        setAuthError(res.error);
      } else {
        setIsLoggedIn(true);
        setProfile({ name: name || 'مستخدم', email });
      }
    } catch {
      setIsLoggedIn(true);
      setProfile({ name: name || 'مستخدم', email });
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setProfile({ name: '', email: '' });
    setView('menu');
  }

  // ─── Login / Register (Demo-style tabs) ───
  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
            {(['login', 'register'] as const).map(t2 => (
              <button key={t2} onClick={() => setTab(t2)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.85rem', fontWeight: 600, background: tab === t2 ? '#fff' : 'transparent', color: tab === t2 ? currentTheme.primary : '#94a3b8', boxShadow: tab === t2 ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t2 === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="كلمة المرور" style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none' }} />
            <button onClick={handleAuth} disabled={authLoading} style={{ padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif', opacity: authLoading ? 0.7 : 1 }}>
              {authLoading ? 'جاري...' : tab === 'login' ? 'دخول' : 'إنشاء حساب'}
            </button>
            {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center' }}>{authError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─── Personal Info Sub-View ───
  if (view === 'personal') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px', position: 'relative' }}>
              <User size={30} color="#fff" />
              <button style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: currentTheme.primary, border: '2px solid #fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Upload size={10} color="#fff" />
              </button>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>البيانات الشخصية</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'الاسم الكامل', type: 'text' },
              { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
              { key: 'phone', label: 'رقم الهاتف', type: 'tel' },
              { key: 'country', label: 'الدولة', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={personalData[field.key as keyof typeof personalData]}
                  onChange={e => { setPersonalData(d => ({ ...d, [field.key]: e.target.value })); setPersonalSaved(false); }}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>كلمة المرور الجديدة</label>
              <input type="password" placeholder="اتركه فارغاً إذا لم ترد تغييرها" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => setPersonalSaved(true)} style={{
              padding: '0.75rem', borderRadius: btnR,
              background: personalSaved ? '#16a34a' : currentTheme.primary,
              color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.3s',
            }}>
              {personalSaved ? <><CheckCircle size={16} /> تم الحفظ</> : <><Save size={16} /> حفظ التغييرات</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Wallet Sub-View ───
  if (view === 'wallet') {
    const displayBalance = profile.balance || '$0.00';
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>

        {/* Balance Card */}
        <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, borderRadius: 18, padding: '1.75rem', marginBottom: 20, color: '#fff' }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 4 }}>رصيدك الحالي</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{displayBalance}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => setShowWalletModal(true)} style={{ padding: '0.55rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} /> شحن رصيد
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'إجمالي الشحن', value: '$0.00', color: '#22c55e' },
            { label: 'إجمالي الشراء', value: '$0.00', color: '#f59e0b' },
            { label: 'المسترجع', value: '$0.00', color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '1rem 0.75rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 12 }}>سجل العمليات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.1rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{tx.type}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{tx.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.method}</span>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.date}</span>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: tx.amount.startsWith('+') ? '#16a34a' : '#ef4444', direction: 'ltr' }}>{tx.amount}</p>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: tx.statusBg, color: tx.statusColor }}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>

        {showWalletModal && <WalletChargeModal onClose={() => setShowWalletModal(false)} />}
      </div>
    );
  }

  // ─── Security / Verification Sub-View ───
  if (view === 'security') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <button onClick={() => setView('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: currentTheme.primary, fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', marginBottom: 20, padding: 0 }}>
          <ChevronRight size={18} /> رجوع
        </button>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color={currentTheme.primary} /> التحقق من الهوية
          </h3>

          {/* Verification Status */}
          <div style={{ background: '#fffbeb', borderRadius: 14, padding: '1.25rem', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>غير متحقق</p>
              <p style={{ fontSize: '0.78rem', color: '#b45309' }}>يرجى رفع بطاقة هوية لتوثيق حسابك</p>
            </div>
          </div>

          {/* Benefits */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>مميزات التوثيق:</p>
            {[
              'رفع حد السحب والشحن',
              'أولوية في معالجة الطلبات',
              'الوصول لعروض حصرية',
              'حماية إضافية للحساب',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CheckCircle size={14} color="#22c55e" />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Upload ID */}
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 10 }}>رفع صورة الهوية</p>
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <Upload size={28} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>اضغط لرفع صورة بطاقة الهوية</p>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: 4 }}>JPG, PNG — حد أقصى 5MB</p>
          </div>

          <button style={{ width: '100%', padding: '0.75rem', borderRadius: btnR, background: currentTheme.primary, color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Send size={14} /> إرسال للتوثيق
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Menu (Demo-style: 8 items) ───
  const displayName = profile.name || personalData.name || 'مستخدم';
  const displayEmail = profile.email || personalData.email || '';
  const displayBalance = profile.balance || '$0.00';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Avatar & Name */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <User size={36} color="#fff" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1020' }}>{displayName}</h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{displayEmail}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '0.3rem 0.75rem', borderRadius: 20, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <Clock size={12} color="#f59e0b" />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#92400e' }}>غير متحقق</span>
        </div>
      </div>

      {/* Wallet */}
      <div style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, borderRadius: 16, padding: '1.5rem', marginBottom: 20, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>رصيد المحفظة</p>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>{displayBalance}</p>
          </div>
          <Wallet size={32} style={{ opacity: 0.3 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => setShowWalletModal(true)} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            شحن المحفظة
          </button>
          <button onClick={() => setView('wallet')} style={{ padding: '0.5rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            التفاصيل
          </button>
        </div>
      </div>

      {/* Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: <User size={18} />, label: 'البيانات الشخصية', color: '#3b82f6', action: () => setView('personal') },
          { icon: <Wallet size={18} />, label: 'المحفظة والعمليات', color: '#22c55e', action: () => setView('wallet') },
          { icon: <CreditCard size={18} />, label: 'شحن الرصيد', color: '#f59e0b', action: () => setShowWalletModal(true) },
          { icon: <ShoppingCart size={18} />, label: 'طلباتي', color: '#8b5cf6', action: () => {} },
          { icon: <Shield size={18} />, label: 'التحقق من الهوية', color: '#06b6d4', action: () => setView('security') },
          { icon: <Bell size={18} />, label: 'الإشعارات', color: '#8b5cf6', action: () => {} },
          { icon: <Settings size={18} />, label: 'الإعدادات', color: '#64748b', action: () => {} },
          { icon: <LogOut size={18} />, label: 'تسجيل الخروج', color: '#ef4444', action: handleLogout },
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', cursor: 'pointer', width: '100%', fontFamily: 'Tajawal, sans-serif', textAlign: 'right' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, color: item.color, display: 'grid', placeItems: 'center' }}>{item.icon}</div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: item.color === '#ef4444' ? '#ef4444' : '#0b1020', flex: 1 }}>{item.label}</span>
            <ChevronLeft size={16} color="#cbd5e1" />
          </button>
        ))}
      </div>

      {showWalletModal && <WalletChargeModal onClose={() => setShowWalletModal(false)} />}
    </div>
  );
}
