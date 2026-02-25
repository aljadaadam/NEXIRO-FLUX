'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowRight, Mail, Phone, MapPin, Calendar, Wallet, Shield,
  ShoppingCart, CreditCard, CheckCircle2, XCircle, Clock, AlertTriangle,
  RefreshCw, UserCheck, UserX, ShieldCheck, BadgeCheck, BadgeX,
  Package, DollarSign, X, Plus, Minus, Eye, Hash,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { User, Order } from '@/lib/types';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

/* ═══ Skeleton ═══ */
function SkeletonBlock({ w, h, r = 6 }: { w: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
        <SkeletonBlock w={64} h={64} r={16} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBlock w={140} h={18} />
          <SkeletonBlock w={200} h={12} />
        </div>
      </div>
      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '1rem' }}>
            <SkeletonBlock w={80} h={12} />
            <div style={{ marginTop: 8 }}><SkeletonBlock w={100} h={20} /></div>
          </div>
        ))}
      </div>
      {/* Orders table skeleton */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem' }}>
        <SkeletonBlock w={120} h={18} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} w="100%" h={42} r={8} />)}
        </div>
      </div>
    </div>
  );
}

/* ═══ مودال تعديل الرصيد ═══ */
function WalletModal({ user, theme, onClose, onDone }: { user: User; theme: ColorTheme; onClose: () => void; onDone: (nb: number) => void }) {
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t, isRTL } = useAdminLang();

  const num = parseFloat(amount) || 0;

  const submit = async () => {
    if (submitting || num <= 0) return;
    setError(null); setSuccess(null); setSubmitting(true);
    try {
      const res = await adminApi.updateCustomerWallet(user.id, mode === 'deduct' ? -num : num);
      const nb = parseFloat(res?.wallet_balance ?? 0);
      setSuccess(isRTL ? `تم ${mode === 'add' ? 'إضافة' : 'خصم'} $${num.toFixed(2)}. الرصيد الجديد: $${nb.toFixed(2)}` : `${mode === 'add' ? 'Added' : 'Deducted'} $${num.toFixed(2)}. New balance: $${nb.toFixed(2)}`);
      onDone(nb);
      setAmount('');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : t('فشلت العملية')); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', width: '90%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} color={theme.primary} /> {t('تعديل الرصيد')}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.gradient, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>{user.name.charAt(0)}</div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('الرصيد الحالي:')} <strong style={{ color: '#0b1020' }}>${(user.wallet_balance ?? 0).toFixed(2)}</strong></p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['add', 'deduct'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }} style={{
              flex: 1, padding: '0.6rem', borderRadius: 10,
              border: mode === m ? `2px solid ${m === 'add' ? theme.primary : '#ef4444'}` : '2px solid #e2e8f0',
              background: mode === m ? (m === 'add' ? `${theme.primary}15` : '#fef2f215') : '#fff',
              color: mode === m ? (m === 'add' ? theme.primary : '#ef4444') : '#64748b',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {m === 'add' ? <><Plus size={14} /> {t('إضافة رصيد')}</> : <><Minus size={14} /> {t('خصم رصيد')}</>}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>{t('المبلغ ($)')}</label>
        <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
          style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '1rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }} />

        {error && <div style={{ marginTop: 10, padding: '0.6rem 0.85rem', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.78rem', fontWeight: 700 }}>{error}</div>}
        {success && <div style={{ marginTop: 10, padding: '0.6rem 0.85rem', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>{success}</div>}

        <button onClick={submit} disabled={num <= 0 || submitting} style={{
          width: '100%', marginTop: 14, padding: '0.7rem', borderRadius: 12,
          background: mode === 'add' ? theme.primary : '#ef4444',
          color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700,
          cursor: num > 0 ? 'pointer' : 'not-allowed', fontFamily: 'Tajawal, sans-serif', opacity: num > 0 ? 1 : 0.5,
        }}>
          {submitting ? t('جارٍ التنفيذ...') : mode === 'add' ? (isRTL ? `إضافة $${num.toFixed(2)}` : `Add $${num.toFixed(2)}`) : (isRTL ? `خصم $${num.toFixed(2)}` : `Deduct $${num.toFixed(2)}`)}
        </button>
      </div>
    </div>
  );
}

/* ═══ Status helpers ═══ */
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  completed: { label: 'مكتمل', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
  pending: { label: 'قيد الانتظار', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
  processing: { label: 'قيد المعالجة', color: '#3b82f6', bg: '#eff6ff', icon: RefreshCw },
  failed: { label: 'فاشل', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
  cancelled: { label: 'ملغي', color: '#64748b', bg: '#f8fafc', icon: XCircle },
  refunded: { label: 'مسترجع', color: '#8b5cf6', bg: '#f5f3ff', icon: AlertTriangle },
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useAdminLang();
  const s = STATUS_MAP[status] || { label: status, color: '#64748b', bg: '#f8fafc', icon: Clock };
  const Icon = s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '0.2rem 0.55rem', borderRadius: 6,
      background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 700,
    }}>
      <Icon size={11} /> {t(s.label)}
    </span>
  );
}

/* ═══ Section Card ═══ */
function Section({ title, icon: Icon, children, extra }: {
  title: string; icon: typeof Package; children: React.ReactNode; extra?: React.ReactNode;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc',
      }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={17} /> {title}
        </h3>
        {extra}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════
   ███ UserDetailsPage ███
   ═══════════════════════════════════ */

interface UserDetailsPageProps {
  theme: ColorTheme;
  userId: number;
  userType: 'customer' | 'staff';
  onBack: () => void;
}

export default function UserDetailsPage({ theme, userId, userType, onBack }: UserDetailsPageProps) {
  const { t, isRTL } = useAdminLang();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'verification'>('orders');

  // بيانات التحقق من الهوية (محلية — يمكن ربطها لاحقاً بالباكند)
  const verificationStatus = useMemo(() => {
    if (!user) return null;
    const isCustomer = userType === 'customer';
    return {
      emailVerified: true, // الزبون سجل بنجاح ← تم التحقق من الإيميل
      phoneVerified: !!user.phone,
      identityVerified: false, // لم يُضاف بعد — حقل مستقبلي
      accountAge: user.joined,
      isBlocked: user.status === 'محظور',
      isCustomer,
    };
  }, [user, userType]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load all customers and find the one we need
      const [customersRes, staffRes] = await Promise.allSettled([
        adminApi.getCustomers(1, 200, ''),
        adminApi.getUsers(),
      ]);

      let found: User | null = null;

      if (userType === 'customer' && customersRes.status === 'fulfilled') {
        const raw = customersRes.value;
        const customers = Array.isArray(raw) ? raw : (Array.isArray(raw?.customers) ? raw.customers : []);
        const c = customers.find((u: Record<string, unknown>) => Number(u.id) === userId);
        if (c) {
          found = {
            id: Number(c.id), name: String(c.name || ''), email: String(c.email || ''),
            role: c.is_blocked ? 'محظور' : 'زبون',
            status: c.is_blocked ? 'محظور' : 'نشط',
            joined: c.created_at ? new Date(String(c.created_at)).toLocaleDateString('ar-EG') : '--',
            orders: Number(c.orders || 0), spent: String(c.spent || '$0.00'),
            wallet_balance: Number(c.wallet_balance || 0), _type: 'customer',
            phone: String(c.phone || ''), country: String(c.country || ''),
            is_verified: c.is_verified, last_login_at: c.last_login_at ? String(c.last_login_at) : undefined,
          };
        }
      }

      if (userType === 'staff' && staffRes.status === 'fulfilled') {
        const raw = staffRes.value;
        const staff = Array.isArray(raw) ? raw : (Array.isArray(raw?.users) ? raw.users : []);
        const s = staff.find((u: Record<string, unknown>) => Number(u.id) === userId);
        if (s) {
          found = {
            id: Number(s.id), name: String(s.name || ''), email: String(s.email || ''),
            role: String(s.role) === 'admin' ? 'مدير' : 'مشرف',
            status: 'نشط',
            joined: s.created_at ? new Date(String(s.created_at)).toLocaleDateString('ar-EG') : '--',
            orders: 0, spent: '$0.00', _type: 'staff',
          };
        }
      }

      setUser(found);

      // Load customer orders & payments
      if (userType === 'customer') {
        try {
          const ordRes = await adminApi.getCustomerOrders(userId);
          const ordArr = Array.isArray(ordRes) ? ordRes : (Array.isArray(ordRes?.orders) ? ordRes.orders : []);
          setOrders(ordArr);
        } catch { setOrders([]); }

        try {
          const payRes = await adminApi.getCustomerPayments(userId);
          const payArr = Array.isArray(payRes) ? payRes : (Array.isArray(payRes?.payments) ? payRes.payments : []);
          setPayments(payArr);
        } catch { setPayments([]); }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => { loadData(); }, [loadData]);

  // حظر/إلغاء حظر
  const handleToggleBlock = async () => {
    if (!user || blocking) return;
    const isBlocked = user.status === 'محظور';
    setBlocking(true);
    try {
      await adminApi.toggleBlockCustomer(user.id, !isBlocked);
      setUser(prev => prev ? {
        ...prev,
        status: isBlocked ? 'نشط' : 'محظور',
        role: isBlocked ? 'زبون' : 'محظور',
      } : null);
    } catch { /* ignore */ }
    finally { setBlocking(false); }
  };

  // Summary stats
  const orderStats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'completed').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const totalSpent = orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.total_price || 0), 0);
    return { total: orders.length, completed, pending, totalSpent };
  }, [orders]);

  if (loading) {
    return (
      <div>
        {/* Back button */}
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10,
          background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', marginBottom: 16,
          fontSize: '0.82rem', fontWeight: 700, color: '#64748b', fontFamily: 'Tajawal, sans-serif',
        }}>
          <ArrowRight size={14} /> {t('رجوع للمستخدمين')}
        </button>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <AlertTriangle size={40} color="#cbd5e1" />
        <p style={{ marginTop: 12, fontSize: '0.9rem', fontWeight: 700 }}>{t('المستخدم غير موجود')}</p>
        <button onClick={onBack} style={{
          marginTop: 12, padding: '0.5rem 1.5rem', borderRadius: 10,
          background: theme.primary, color: '#fff', border: 'none',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
        }}>{t('رجوع')}</button>
      </div>
    );
  }

  const isCustomer = userType === 'customer';
  const isBlocked = user.status === 'محظور';

  const TABS = [
    { key: 'orders' as const, label: t('الطلبات'), icon: ShoppingCart, count: orders.length },
    { key: 'payments' as const, label: t('المدفوعات'), icon: CreditCard, count: payments.length },
    { key: 'verification' as const, label: t('التحقق من الهوية'), icon: ShieldCheck, count: null },
  ];

  return (
    <>
      {/* ─── Back button ─── */}
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10,
        background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', marginBottom: 16,
        fontSize: '0.82rem', fontWeight: 700, color: '#64748b', fontFamily: 'Tajawal, sans-serif',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
      >
        <ArrowRight size={14} /> {t('رجوع للمستخدمين')}
      </button>

      {/* ═══ Profile Header ═══ */}
      <div style={{
        background: '#fff', borderRadius: 18, padding: '1.5rem',
        border: '1px solid #f1f5f9', marginBottom: 16,
        display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start',
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: theme.gradient,
          display: 'grid', placeItems: 'center',
          color: '#fff', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0,
        }}>
          {user.name.charAt(0)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b1020' }}>{user.name}</h2>
            {/* Role badge */}
            <span style={{
              padding: '0.2rem 0.65rem', borderRadius: 8,
              background: user.role === 'مدير' ? '#dbeafe' : user.role === 'محظور' ? '#fee2e2' : user.role === 'مشرف' ? '#e0e7ff' : `${theme.primary}12`,
              color: user.role === 'مدير' ? '#2563eb' : user.role === 'محظور' ? '#dc2626' : user.role === 'مشرف' ? '#4f46e5' : theme.primary,
              fontSize: '0.72rem', fontWeight: 700,
            }}>{t(user.role)}</span>
            {/* Status */}
            <span style={{
              padding: '0.2rem 0.65rem', borderRadius: 8,
              background: isBlocked ? '#fee2e2' : '#dcfce7',
              color: isBlocked ? '#dc2626' : '#16a34a',
              fontSize: '0.72rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {isBlocked ? <><UserX size={11} /> {t('محظور')}</> : <><UserCheck size={11} /> {t('نشط')}</>}
            </span>
          </div>

          {/* Contact info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#64748b' }}>
              <Mail size={13} /> {user.email}
            </span>
            {user.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#64748b' }}>
                <Phone size={13} /> {user.phone}
              </span>
            )}
            {user.country && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#64748b' }}>
                <MapPin size={13} /> {user.country}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#64748b' }}>
              <Calendar size={13} /> {t('انضم')} {user.joined}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {isCustomer && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setWalletModalOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.55rem 1rem', borderRadius: 10,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              color: '#16a34a', fontSize: '0.8rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              transition: 'transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Wallet size={14} /> {t('تعديل الرصيد')}
            </button>
            <button onClick={handleToggleBlock} disabled={blocking} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.55rem 1rem', borderRadius: 10,
              background: isBlocked ? '#f0fdf4' : '#fef2f2',
              border: isBlocked ? '1px solid #bbf7d0' : '1px solid #fecaca',
              color: isBlocked ? '#16a34a' : '#dc2626',
              fontSize: '0.8rem', fontWeight: 700,
              cursor: blocking ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
              opacity: blocking ? 0.6 : 1, transition: 'transform 0.15s',
            }}
              onMouseEnter={e => { if (!blocking) e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isBlocked ? <><UserCheck size={14} /> {t('إلغاء الحظر')}</> : <><Shield size={14} /> {t('حظر')}</>}
            </button>
          </div>
        )}
      </div>

      {/* ═══ Quick Stats ═══ */}
      {isCustomer && (
        <div className="dash-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16,
        }}>
          {[
            { label: t('الرصيد'), value: `$${(user.wallet_balance ?? 0).toFixed(2)}`, icon: Wallet, color: theme.primary, bg: `${theme.primary}12` },
            { label: t('إجمالي الطلبات'), value: orderStats.total, icon: ShoppingCart, color: '#3b82f6', bg: '#eff6ff' },
            { label: t('مكتملة'), value: orderStats.completed, icon: CheckCircle2, color: '#22c55e', bg: '#f0fdf4' },
            { label: t('إجمالي الإنفاق'), value: `$${orderStats.totalSpent.toFixed(2)}`, icon: DollarSign, color: '#f59e0b', bg: '#fffbeb' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '1rem',
                border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12,
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0b1020', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Tab Switcher ═══ */}
      {isCustomer && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 0.9rem', borderRadius: 10,
                background: active ? `${theme.primary}12` : '#fff',
                border: active ? `1.5px solid ${theme.primary}40` : '1px solid #e2e8f0',
                color: active ? theme.primary : '#64748b',
                fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s',
              }}>
                <Icon size={14} />
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: active ? theme.primary : '#e2e8f0',
                    color: active ? '#fff' : '#64748b',
                    fontSize: '0.6rem', fontWeight: 800,
                    display: 'grid', placeItems: 'center',
                    padding: '0 4px', fontFamily: 'system-ui',
                  }}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Orders Tab ═══ */}
      {(activeTab === 'orders' && isCustomer) && (
        <Section title={t('الطلبات')} icon={ShoppingCart} extra={
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{orders.length} {t('طلب')}</span>
        }>
          {orders.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <Package size={32} color="#cbd5e1" />
              <p style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700 }}>{t('لا توجد طلبات لهذا العميل')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['#', t('المنتج'), t('الكمية'), t('السعر'), t('الإجمالي'), t('الحالة'), t('طريقة الدفع'), t('التاريخ')].map(h => (
                      <th key={h} style={{
                        padding: '0.75rem 0.85rem', textAlign: isRTL ? 'right' : 'left', fontSize: '0.72rem',
                        fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafbfc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Hash size={10} />{order.order_number}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, color: '#0b1020', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_name}</td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600, textAlign: 'center' }}>{order.quantity}</td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: '#334155' }}>${Number(order.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>${Number(order.total_price).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 0.85rem' }}><StatusBadge status={order.status} /></td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.78rem', color: '#64748b' }}>{order.payment_method || '--'}</td>
                      <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {/* ═══ Payments Tab ═══ */}
      {(activeTab === 'payments' && isCustomer) && (
        <Section title={t('المدفوعات')} icon={CreditCard} extra={
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{payments.length} {t('عملية')}</span>
        }>
          {payments.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <CreditCard size={32} color="#cbd5e1" />
              <p style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700 }}>{t('لا توجد عمليات دفع')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['#', t('النوع'), t('المبلغ'), t('الطريقة'), t('الحالة'), t('التاريخ')].map(h => (
                      <th key={h} style={{
                        padding: '0.75rem 0.85rem', textAlign: isRTL ? 'right' : 'left', fontSize: '0.72rem',
                        fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => {
                    const typeMap: Record<string, string> = { deposit: t('إيداع'), purchase: t('شراء'), refund: t('استرجاع'), subscription: t('اشتراك') };
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fafbfc'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>{Number(p.id)}</td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <span style={{
                            padding: '0.18rem 0.5rem', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700,
                            background: String(p.type) === 'deposit' ? '#eff6ff' : String(p.type) === 'refund' ? '#f5f3ff' : '#f8fafc',
                            color: String(p.type) === 'deposit' ? '#3b82f6' : String(p.type) === 'refund' ? '#8b5cf6' : '#64748b',
                          }}>{typeMap[String(p.type)] || String(p.type)}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>${Number(p.amount || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.78rem', color: '#64748b' }}>{String(p.payment_method || '--')}</td>
                        <td style={{ padding: '0.75rem 0.85rem' }}><StatusBadge status={String(p.status || 'pending')} /></td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                          {p.created_at ? new Date(String(p.created_at)).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {/* ═══ Verification Tab ═══ */}
      {(activeTab === 'verification' && isCustomer) && (
        <Section title={t('التحقق من الهوية')} icon={ShieldCheck}>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {/* Email Verification */}
              <VerificationCard
                icon={Mail}
                title={t('البريد الإلكتروني')}
                description={user.email}
                verified={verificationStatus?.emailVerified ?? false}
                theme={theme}
              />
              {/* Phone Verification */}
              <VerificationCard
                icon={Phone}
                title={t('رقم الهاتف')}
                description={user.phone || t('لم يتم إضافة رقم هاتف')}
                verified={verificationStatus?.phoneVerified ?? false}
                theme={theme}
              />
              {/* Identity Verification */}
              <VerificationCard
                icon={Shield}
                title={t('التحقق من الهوية')}
                description={verificationStatus?.identityVerified ? t('تم التحقق من وثيقة الهوية') : t('لم يتم تقديم وثيقة هوية بعد')}
                verified={verificationStatus?.identityVerified ?? false}
                theme={theme}
              />
              {/* Account Age */}
              <VerificationCard
                icon={Calendar}
                title={t('عمر الحساب')}
                description={isRTL ? `تاريخ الإنشاء: ${user.joined}` : `Created: ${user.joined}`}
                verified={true}
                theme={theme}
              />
              {/* Last Login */}
              <VerificationCard
                icon={Eye}
                title={t('آخر تسجيل دخول')}
                description={
                  user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString(isRTL ? 'ar-EG' : 'en-US')
                    : t('لم يسجل دخول بعد')
                }
                verified={!!user.last_login_at}
                theme={theme}
              />
              {/* Block Status */}
              <VerificationCard
                icon={isBlocked ? UserX : UserCheck}
                title={t('حالة الحساب')}
                description={isBlocked ? t('هذا الحساب محظور حالياً') : t('الحساب نشط بدون قيود')}
                verified={!isBlocked}
                theme={theme}
                danger={isBlocked}
              />
            </div>
          </div>
        </Section>
      )}

      {/* ═══ Staff info ═══ */}
      {!isCustomer && (
        <Section title={t('معلومات المشرف')} icon={ShieldCheck}>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              <VerificationCard icon={Mail} title={t('البريد الإلكتروني')} description={user.email} verified={true} theme={theme} />
              <VerificationCard icon={ShieldCheck} title={t('الصلاحية')} description={user.role === 'مدير' ? t('مدير النظام - صلاحيات كاملة') : t('مشرف - صلاحيات محدودة')} verified={true} theme={theme} />
              <VerificationCard icon={Calendar} title={t('تاريخ الإنشاء')} description={user.joined} verified={true} theme={theme} />
            </div>
          </div>
        </Section>
      )}

      {/* ═══ Wallet Modal ═══ */}
      {walletModalOpen && user && (
        <WalletModal
          user={user}
          theme={theme}
          onClose={() => setWalletModalOpen(false)}
          onDone={(nb) => { setUser(prev => prev ? { ...prev, wallet_balance: nb } : null); }}
        />
      )}

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </>
  );
}

/* ═══ Verification Card ═══ */
function VerificationCard({ icon: Icon, title, description, verified, theme, danger }: {
  icon: typeof Mail; title: string; description: string; verified: boolean; theme: ColorTheme; danger?: boolean;
}) {
  return (
    <div style={{
      padding: '1rem', borderRadius: 14,
      border: `1px solid ${danger ? '#fecaca' : verified ? '#bbf7d0' : '#e2e8f0'}`,
      background: danger ? '#fef2f2' : verified ? '#f0fdf4' : '#fafbfc',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: danger ? '#fee2e2' : verified ? '#dcfce7' : '#f1f5f9',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Icon size={17} color={danger ? '#dc2626' : verified ? '#16a34a' : '#94a3b8'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{title}</p>
          {danger ? (
            <BadgeX size={14} color="#dc2626" />
          ) : verified ? (
            <BadgeCheck size={14} color="#16a34a" />
          ) : (
            <BadgeX size={14} color="#94a3b8" />
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</p>
      </div>
    </div>
  );
}
