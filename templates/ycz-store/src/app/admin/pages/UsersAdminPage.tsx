'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, Eye, Shield, Loader2, Wallet, X, Plus, Minus } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { User } from '@/lib/types';

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
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1020' }}>💰 تعديل الرصيد</h3>
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

export default function UsersAdminPage({ theme }: { theme: ColorTheme }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [walletUser, setWalletUser] = useState<User | null>(null);

  // تحميل مرة واحدة فقط عند فتح الصفحة (بدون تحميل متكرر أثناء البحث)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
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

        if (!cancelled) {
          setUsers(allUsers);
          setTotal(customersCount + staffCount);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    ));
  }, [users, search]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>👥 المستخدمين <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>({search.trim() ? filtered.length : total})</span></h2>
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
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 size={20} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} /> جارٍ التحميل...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  لا يوجد مستخدمين
                </td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: theme.gradient,
                        display: 'grid', placeItems: 'center',
                        color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                      }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{user.name}</p>
                        <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6,
                      background: user.role === 'مدير' ? '#dbeafe' : user.role === 'محظور' ? '#fee2e2' : user.role === 'مشرف' ? '#e0e7ff' : '#f1f5f9',
                      fontSize: '0.72rem', fontWeight: 700,
                      color: user.role === 'مدير' ? '#2563eb' : user.role === 'محظور' ? '#dc2626' : user.role === 'مشرف' ? '#4f46e5' : '#64748b',
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
                      background: user.status === 'نشط' ? '#dcfce7' : '#fef3c7',
                      color: user.status === 'نشط' ? '#16a34a' : '#d97706',
                    }}>{user.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#94a3b8' }}>{user.joined}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {user._type === 'customer' && (
                        <button onClick={() => setWalletUser(user)} title="تعديل الرصيد" style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#f0fdf4', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Wallet size={13} color="#16a34a" /></button>
                      )}
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#eff6ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Eye size={13} color="#3b82f6" /></button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Shield size={13} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </>
  );
}
