'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, Eye, Shield, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { User } from '@/lib/types';

export default function UsersAdminPage({ theme }: { theme: ColorTheme }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

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
                {['المستخدم', 'الدور', 'الطلبات', 'الإنفاق', 'الحالة', 'تاريخ التسجيل', 'إجراءات'].map(h => (
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
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 size={20} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} /> جارٍ التحميل...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
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
    </>
  );
}
