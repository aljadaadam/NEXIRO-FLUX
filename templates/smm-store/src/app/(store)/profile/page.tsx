'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { storeApi } from '@/lib/api';
import {
  User, Wallet, CreditCard, LogOut, Edit3, Save, Mail, Phone, Key,
  Eye, EyeOff, ArrowDown, ArrowUp, Plus, Gift
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProfileData = Record<string, unknown>;
type Transaction = Record<string, unknown>;

export default function ProfilePage() {
  const { currentTheme, darkMode, isRTL, t } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'password'>('profile');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: string; text: string } | null>(null);
  const [walletHistory, setWalletHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    storeApi.getProfile().then(data => {
      const p = data as ProfileData;
      setProfile(p);
      setName(String(p.name || ''));
      setPhone(String(p.phone || ''));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      router.push('/auth');
    });
    storeApi.getWalletHistory?.()?.then?.((d: unknown) => setWalletHistory(d as Transaction[])).catch?.(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await storeApi.updateProfile({ name, phone });
      setProfile(prev => prev ? { ...prev, name, phone } : prev);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPassMsg(null);
    try {
      await storeApi.changePassword(oldPass, newPass);
      setPassMsg({ type: 'success', text: t('تم تغيير كلمة المرور') });
      setOldPass('');
      setNewPass('');
    } catch (err: unknown) {
      setPassMsg({ type: 'error', text: err instanceof Error ? err.message : t('حدث خطأ') });
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smm_auth_token');
      localStorage.removeItem('smm_user');
      router.push('/');
      router.refresh();
    }
  };

  const tabs = [
    { key: 'profile', icon: <User size={16} />, label: t('الملف الشخصي') },
    { key: 'wallet', icon: <Wallet size={16} />, label: t('المحفظة') },
    { key: 'password', icon: <Key size={16} />, label: t('كلمة المرور') },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 24, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 24 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 20px 60px' }}>
      {/* Header Card */}
      <div className="neon-card" style={{
        padding: '24px', marginBottom: 20,
        background: darkMode ? `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.95))` : undefined,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: currentTheme.gradient,
            display: 'grid', placeItems: 'center',
            boxShadow: currentTheme.glow,
            fontSize: '1.6rem', color: '#fff', fontWeight: 900,
          }}>
            {String(profile?.name || '?')[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {String(profile?.name || t('مستخدم'))}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(profile?.email || '')}</p>
          </div>
          <div style={{
            padding: '10px 16px', borderRadius: 14,
            background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{t('الرصيد')}</span>
            <span style={{
              fontSize: '1.1rem', fontWeight: 900,
              background: currentTheme.gradient,
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {String(profile?.balance || profile?.wallet_balance || '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              flex: 1, padding: '10px 6px', borderRadius: 14, border: 'none',
              background: activeTab === tab.key ? currentTheme.gradient : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: activeTab === tab.key ? `0 4px 15px ${currentTheme.primary}30` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="neon-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('معلومات الحساب')}</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{
                padding: '6px 14px', borderRadius: 10, border: 'none',
                background: `${currentTheme.primary}15`, color: currentTheme.primary,
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Edit3 size={14} /> {t('تعديل')}
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} style={{
                padding: '6px 14px', borderRadius: 10, border: 'none',
                background: currentTheme.gradient, color: '#fff',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Save size={14} /> {saving ? '...' : t('حفظ')}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldRow icon={<User size={16} />} label={t('الاسم')} editing={editing} value={name} onChange={setName} isRTL={isRTL} darkMode={darkMode} />
            <FieldRow icon={<Mail size={16} />} label={t('البريد الإلكتروني')} value={String(profile?.email || '')} isRTL={isRTL} darkMode={darkMode} />
            <FieldRow icon={<Phone size={16} />} label={t('رقم الهاتف')} editing={editing} value={phone} onChange={setPhone} isRTL={isRTL} darkMode={darkMode} />
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: 24, padding: '10px 20px', borderRadius: 12,
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
              color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <LogOut size={16} /> {t('تسجيل الخروج')}
          </button>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div>
          <div className="neon-card" style={{ padding: '28px', textAlign: 'center', marginBottom: 16 }}>
            <Gift size={40} style={{ color: currentTheme.primary, marginBottom: 10 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{t('رصيدك الحالي')}</span>
            <span style={{
              fontSize: '2.2rem', fontWeight: 900,
              background: currentTheme.gradient,
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {String(profile?.balance || profile?.wallet_balance || '0')}
            </span>
          </div>

          {walletHistory.length > 0 && (
            <div className="neon-card" style={{ padding: '18px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>{t('سجل المعاملات')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {walletHistory.map((tx, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: Number(tx.amount) >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      display: 'grid', placeItems: 'center',
                      color: Number(tx.amount) >= 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {Number(tx.amount) >= 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{String(tx.description || tx.type || '')}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {tx.created_at ? new Date(String(tx.created_at)).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : ''}
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: '0.85rem',
                      color: Number(tx.amount) >= 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {Number(tx.amount) >= 0 ? '+' : ''}{String(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="neon-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>{t('تغيير كلمة المرور')}</h3>

          {passMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, marginBottom: 14,
              background: passMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: passMsg.type === 'success' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
              color: passMsg.type === 'success' ? '#22c55e' : '#ef4444',
              fontSize: '0.82rem',
            }}>
              {passMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                {t('كلمة المرور الحالية')}
              </label>
              <input className="glass-input" type={showPass ? 'text' : 'password'} value={oldPass} onChange={e => setOldPass(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                {t('كلمة المرور الجديدة')}
              </label>
              <input className="glass-input" type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} />
              {t('إظهار كلمة المرور')}
            </label>
            <button
              onClick={handleChangePassword}
              className="neon-btn"
              style={{ padding: '12px', background: currentTheme.gradient, color: '#fff' }}
            >
              {t('تغيير كلمة المرور')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ icon, label, value, editing, onChange, isRTL, darkMode }: {
  icon: React.ReactNode; label: string; value: string; editing?: boolean;
  onChange?: (v: string) => void; isRTL: boolean; darkMode: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    }}>
      <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{label}</span>
        {editing && onChange ? (
          <input
            className="glass-input"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ marginTop: 4, padding: '6px 10px', fontSize: '0.85rem' }}
          />
        ) : (
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value || '-'}</span>
        )}
      </div>
    </div>
  );
}
