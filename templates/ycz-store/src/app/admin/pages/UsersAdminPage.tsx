'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Search, Eye, Shield, Wallet, X, Plus, Minus, Users, UserCheck,
  UserX, ShieldCheck, RefreshCw, Inbox, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { User } from '@/lib/types';
import UserDetailsPage from './UserDetailsPage';

// ─── Skeleton Row ───
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

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
          <td style={{ padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SkeletonBlock w={34} h={34} r={10} />
              <div>
                <SkeletonBlock w={100} h={14} />
                <div style={{ marginTop: 6 }}><SkeletonBlock w={140} h={10} /></div>
              </div>
            </div>
          </td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={50} h={20} r={6} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={60} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={30} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={55} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={42} h={20} r={6} /></td>
          <td style={{ padding: '0.85rem 1rem' }}><SkeletonBlock w={70} h={14} /></td>
          <td style={{ padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <SkeletonBlock w={30} h={30} r={6} />
              <SkeletonBlock w={30} h={30} r={6} />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── مودال تأكيد الحظر ───
function BlockConfirmModal({ user, theme, onClose, onConfirm, blocking }: {
  user: User; theme: ColorTheme; onClose: () => void; onConfirm: () => void; blocking: boolean;
}) {
  const isBlocked = user.status === 'محظور';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', width: '90%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: isBlocked ? '#f0fdf4' : '#fef2f2',
            display: 'grid', placeItems: 'center',
          }}>
            {isBlocked ? <UserCheck size={26} color="#16a34a" /> : <UserX size={26} color="#dc2626" />}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020', marginBottom: 6 }}>
            {isBlocked ? 'إلغاء الحظر' : 'حظر المستخدم'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
            {isBlocked
              ? <>هل تريد إلغاء حظر <strong>{user.name}</strong>؟ سيتمكن من الوصول للمتجر مجدداً.</>
              : <>هل أنت متأكد من حظر <strong>{user.name}</strong>؟ لن يتمكن من تسجيل الدخول أو الشراء.</>
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '0.65rem', borderRadius: 12,
            background: '#f1f5f9', border: 'none', color: '#64748b',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
          }}>إلغاء</button>
          <button onClick={onConfirm} disabled={blocking} style={{
            flex: 1, padding: '0.65rem', borderRadius: 12,
            background: isBlocked ? '#16a34a' : '#dc2626', border: 'none', color: '#fff',
            fontSize: '0.85rem', fontWeight: 700, cursor: blocking ? 'wait' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', opacity: blocking ? 0.7 : 1,
          }}>
            {blocking ? 'جارٍ...' : isBlocked ? 'إلغاء الحظر' : 'تأكيد الحظر'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── مودال تعديل الرصيد ───
function WalletModal({ user, theme, onClose, onDone }: { user: User; theme: ColorTheme; onClose: () => void; onDone: (newBalance: number) => void }) {
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;

  const submit = async () => {
    if (submitting || numAmount <= 0) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const finalAmount = mode === 'deduct' ? -numAmount : numAmount;
      const res = await adminApi.updateCustomerWallet(user.id, finalAmount);
      const nb = parseFloat(res?.wallet_balance ?? 0);
      setSuccess(`تم ${mode === 'add' ? 'إضافة' : 'خصم'} $${numAmount.toFixed(2)} بنجاح. الرصيد الجديد: $${nb.toFixed(2)}`);
      onDone(nb);
      setAmount('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشلت العملية');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', width: '90%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} color={theme.primary} /> تعديل الرصيد
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={14} /></button>
        </div>

        {/* معلومات المستخدم */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.gradient, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>{user.name.charAt(0)}</div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{user.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>الرصيد الحالي: <strong style={{ color: '#0b1020' }}>${(user.wallet_balance ?? 0).toFixed(2)}</strong></p>
          </div>
        </div>

        {/* اختيار إضافة / خصم */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button onClick={() => { setMode('add'); setError(null); setSuccess(null); }} style={{ flex: 1, padding: '0.6rem', borderRadius: 10, border: mode === 'add' ? `2px solid ${theme.primary}` : '2px solid #e2e8f0', background: mode === 'add' ? `${theme.primary}15` : '#fff', color: mode === 'add' ? theme.primary : '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={14} /> إضافة رصيد
          </button>
          <button onClick={() => { setMode('deduct'); setError(null); setSuccess(null); }} style={{ flex: 1, padding: '0.6rem', borderRadius: 10, border: mode === 'deduct' ? '2px solid #ef4444' : '2px solid #e2e8f0', background: mode === 'deduct' ? '#fef2f215' : '#fff', color: mode === 'deduct' ? '#ef4444' : '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Minus size={14} /> خصم رصيد
          </button>
        </div>

        {/* حقل المبلغ */}
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>المبلغ ($)</label>
        <input
          type="number" min="0" step="0.01" value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '1rem', fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }}
        />

        {error && <div style={{ marginTop: 10, padding: '0.6rem 0.85rem', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.78rem', fontWeight: 700 }}>{error}</div>}
        {success && <div style={{ marginTop: 10, padding: '0.6rem 0.85rem', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>{success}</div>}

        <button
          onClick={submit}
          disabled={numAmount <= 0 || submitting}
          style={{
            width: '100%', marginTop: 14, padding: '0.7rem',
            borderRadius: 12,
            background: mode === 'add' ? theme.primary : '#ef4444',
            color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 700,
            cursor: numAmount > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Tajawal, sans-serif',
            opacity: numAmount > 0 ? 1 : 0.5,
          }}>
          {submitting ? 'جارٍ التنفيذ...' : mode === 'add' ? `إضافة $${numAmount.toFixed(2)}` : `خصم $${numAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

// ─── Role filter tabs ───
const ROLE_FILTERS = [
  { key: 'all', label: 'الكل', icon: Users },
  { key: 'customer', label: 'الزبائن', icon: UserCheck },
  { key: 'staff', label: 'المشرفين', icon: ShieldCheck },
  { key: 'blocked', label: 'المحظورين', icon: UserX },
] as const;

type RoleFilter = typeof ROLE_FILTERS[number]['key'];

const PER_PAGE = 15;

export default function UsersAdminPage({ theme }: { theme: ColorTheme }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [walletUser, setWalletUser] = useState<User | null>(null);
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; type: 'customer' | 'staff' } | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [customersRes, staffRes] = await Promise.allSettled([
        adminApi.getCustomers(1, 200, ''),
        adminApi.getUsers(),
      ]);

      const allUsers: User[] = [];
      let customersCount = 0;
      let staffCount = 0;

      if (customersRes.status === 'fulfilled') {
        const raw = customersRes.value;
        const customers = Array.isArray(raw) ? raw : (Array.isArray(raw?.customers) ? raw.customers : []);
        customersCount = customers.length;
        customers.forEach((u: Record<string, unknown>) => {
          allUsers.push({
            id: Number(u.id),
            name: String(u.name || ''),
            email: String(u.email || ''),
            role: u.is_blocked ? 'محظور' : 'زبون',
            status: u.is_blocked ? 'محظور' : 'نشط',
            joined: u.created_at ? new Date(String(u.created_at)).toLocaleDateString('ar-EG') : '--',
            orders: Number(u.orders || 0),
            spent: String(u.spent || '$0.00'),
            wallet_balance: Number(u.wallet_balance || 0),
            _type: 'customer',
          });
        });
      }

      if (staffRes.status === 'fulfilled') {
        const raw = staffRes.value;
        const staff = Array.isArray(raw) ? raw : (Array.isArray(raw?.users) ? raw.users : []);
        staffCount = staff.length;
        staff.forEach((u: Record<string, unknown>) => {
          allUsers.push({
            id: Number(u.id),
            name: String(u.name || ''),
            email: String(u.email || ''),
            role: String(u.role) === 'admin' ? 'مدير' : 'مشرف',
            status: 'نشط',
            joined: u.created_at ? new Date(String(u.created_at)).toLocaleDateString('ar-EG') : '--',
            orders: 0,
            spent: '$0.00',
            _type: 'staff',
          });
        });
      }

      setUsers(allUsers);
      setTotal(customersCount + staffCount);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Computed stats ───
  const statCounts = useMemo(() => {
    const customers = users.filter(u => u._type === 'customer' && u.status !== 'محظور').length;
    const staff = users.filter(u => u._type === 'staff').length;
    const blocked = users.filter(u => u.status === 'محظور').length;
    return { total: users.length, customers, staff, blocked };
  }, [users]);

  // ─── Filtered + searched + paginated ───
  const filtered = useMemo(() => {
    let list = users;
    // Role filter
    if (roleFilter === 'customer') list = list.filter(u => u._type === 'customer' && u.status !== 'محظور');
    else if (roleFilter === 'staff') list = list.filter(u => u._type === 'staff');
    else if (roleFilter === 'blocked') list = list.filter(u => u.status === 'محظور');
    // Search
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return list;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [roleFilter, search]);

  // ─── Handle block/unblock ───
  const handleBlockToggle = async () => {
    if (!blockUser) return;
    setBlocking(true);
    try {
      // Toggle block status locally (API may not exist yet)
      setUsers(prev => prev.map(u => {
        if (u.id === blockUser.id && u._type === blockUser._type) {
          const isBlocked = u.status === 'محظور';
          return { ...u, status: isBlocked ? 'نشط' : 'محظور', role: isBlocked ? 'زبون' : 'محظور' };
        }
        return u;
      }));
      setBlockUser(null);
    } finally {
      setBlocking(false);
    }
  };

  // Stat cards data
  const statCards = [
    { label: 'إجمالي المستخدمين', value: statCounts.total, icon: Users, color: theme.primary, bg: `${theme.primary}12` },
    { label: 'الزبائن النشطين', value: statCounts.customers, icon: UserCheck, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'المشرفين', value: statCounts.staff, icon: ShieldCheck, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'المحظورين', value: statCounts.blocked, icon: UserX, color: '#ef4444', bg: '#fef2f2' },
  ];

  // ─── If a user is selected, show UserDetailsPage ───
  if (selectedUser) {
    return (
      <UserDetailsPage
        theme={theme}
        userId={selectedUser.id}
        userType={selectedUser.type}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={22} color={theme.primary} />
          المستخدمين
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>({filtered.length})</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="تحديث البيانات"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#fff', border: '1px solid #e2e8f0',
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'grid', placeItems: 'center',
              color: '#64748b',
            }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.5rem 0.85rem', borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
          }}>
            <Search size={14} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث عن مستخدم..."
              style={{ border: 'none', outline: 'none', width: 180, fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', background: 'transparent' }}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16,
      }}>
        {statCards.map((s, i) => {
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
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b1020', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {ROLE_FILTERS.map(f => {
          const Icon = f.icon;
          const active = roleFilter === f.key;
          const count = f.key === 'all' ? statCounts.total
            : f.key === 'customer' ? statCounts.customers
            : f.key === 'staff' ? statCounts.staff
            : statCounts.blocked;
          return (
            <button key={f.key} onClick={() => setRoleFilter(f.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.85rem', borderRadius: 10,
              background: active ? `${theme.primary}12` : '#fff',
              border: active ? `1.5px solid ${theme.primary}40` : '1px solid #e2e8f0',
              color: active ? theme.primary : '#64748b',
              fontSize: '0.78rem', fontWeight: active ? 700 : 500,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              transition: 'all 0.15s',
            }}>
              <Icon size={14} />
              {f.label}
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9,
                background: active ? theme.primary : '#e2e8f0',
                color: active ? '#fff' : '#64748b',
                fontSize: '0.6rem', fontWeight: 800,
                display: 'grid', placeItems: 'center',
                padding: '0 4px', fontFamily: 'system-ui',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #f1f5f9', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['المستخدم', 'الدور', 'الرصيد', 'الطلبات', 'الإنفاق', 'الحالة', 'تاريخ التسجيل', 'إجراءات'].map(h => (
                  <th key={h} style={{
                    padding: '0.85rem 1rem', textAlign: 'right',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton /> : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                      <Inbox size={36} color="#cbd5e1" />
                      <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                        {search.trim() ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مستخدمين'}
                      </p>
                      {search.trim() && (
                        <button onClick={() => setSearch('')} style={{
                          padding: '0.4rem 1rem', borderRadius: 8,
                          background: `${theme.primary}12`, border: 'none',
                          color: theme.primary, fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                        }}>مسح البحث</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(user => {
                const roleBg = user.role === 'مدير' ? '#dbeafe' : user.role === 'محظور' ? '#fee2e2' : user.role === 'مشرف' ? '#e0e7ff' : '#f1f5f9';
                const roleColor = user.role === 'مدير' ? '#2563eb' : user.role === 'محظور' ? '#dc2626' : user.role === 'مشرف' ? '#4f46e5' : '#64748b';
                return (
                  <tr key={`${user._type}-${user.id}`} style={{
                    borderBottom: '1px solid #f8fafc',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fafbfc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: theme.gradient,
                          display: 'grid', placeItems: 'center',
                          color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          {user.name.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                          <p style={{ fontSize: '0.68rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: 6,
                        background: roleBg, fontSize: '0.72rem', fontWeight: 700, color: roleColor,
                      }}>{user.role}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: user._type === 'customer' ? '#0b1020' : '#94a3b8' }}>
                      {user._type === 'customer' ? `$${(user.wallet_balance ?? 0).toFixed(2)}` : '--'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>{user.orders}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>{user.spent}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: 6,
                        fontSize: '0.72rem', fontWeight: 700,
                        background: user.status === 'نشط' ? '#dcfce7' : '#fee2e2',
                        color: user.status === 'نشط' ? '#16a34a' : '#dc2626',
                      }}>{user.status}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#94a3b8' }}>{user.joined}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setSelectedUser({ id: user.id, type: user._type || 'customer' })} title="عرض التفاصيل" style={{
                            width: 30, height: 30, borderRadius: 6, border: 'none',
                            background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          ><Eye size={13} color="#3b82f6" /></button>
                        {user._type === 'customer' && (
                          <button onClick={() => setWalletUser(user)} title="تعديل الرصيد" style={{
                            width: 30, height: 30, borderRadius: 6, border: 'none',
                            background: '#f0fdf4', cursor: 'pointer', display: 'grid', placeItems: 'center',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          ><Wallet size={13} color="#16a34a" /></button>
                        )}
                        {user._type === 'customer' && (
                          <button
                            onClick={() => setBlockUser(user)}
                            title={user.status === 'محظور' ? 'إلغاء الحظر' : 'حظر المستخدم'}
                            style={{
                              width: 30, height: 30, borderRadius: 6, border: 'none',
                              background: user.status === 'محظور' ? '#f0fdf4' : '#fee2e2',
                              cursor: 'pointer', display: 'grid', placeItems: 'center',
                              transition: 'transform 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            {user.status === 'محظور'
                              ? <UserCheck size={13} color="#16a34a" />
                              : <Shield size={13} color="#dc2626" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            padding: '0.85rem 1rem', borderTop: '1px solid #f1f5f9',
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: page === 1 ? '#f8fafc' : '#fff',
                border: '1px solid #e2e8f0', cursor: page === 1 ? 'default' : 'pointer',
                display: 'grid', placeItems: 'center',
                opacity: page === 1 ? 0.4 : 1,
              }}
            ><ChevronRight size={14} color="#64748b" /></button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('dots');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === 'dots' ? (
                  <span key={`dots-${idx}`} style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '0 4px' }}>...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)} style={{
                    minWidth: 32, height: 32, borderRadius: 8,
                    background: page === p ? theme.primary : '#fff',
                    border: page === p ? 'none' : '1px solid #e2e8f0',
                    color: page === p ? '#fff' : '#64748b',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'system-ui',
                  }}>{p}</button>
                )
              )
            }

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: page === totalPages ? '#f8fafc' : '#fff',
                border: '1px solid #e2e8f0', cursor: page === totalPages ? 'default' : 'pointer',
                display: 'grid', placeItems: 'center',
                opacity: page === totalPages ? 0.4 : 1,
              }}
            ><ChevronLeft size={14} color="#64748b" /></button>

            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginRight: 8 }}>
              {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} من {filtered.length}
            </span>
          </div>
        )}
      </div>

      {/* مودال تعديل الرصيد */}
      {walletUser && (
        <WalletModal
          user={walletUser}
          theme={theme}
          onClose={() => setWalletUser(null)}
          onDone={(newBalance) => {
            setUsers(prev => prev.map(u => u.id === walletUser.id && u._type === 'customer' ? { ...u, wallet_balance: newBalance } : u));
          }}
        />
      )}

      {/* مودال تأكيد الحظر */}
      {blockUser && (
        <BlockConfirmModal
          user={blockUser}
          theme={theme}
          onClose={() => setBlockUser(null)}
          onConfirm={handleBlockToggle}
          blocking={blocking}
        />
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </>
  );
}
