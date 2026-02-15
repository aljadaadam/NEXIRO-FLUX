'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Shield } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mockData';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import type { User } from '@/lib/types';

export default function UsersAdminPage({ theme }: { theme: ColorTheme }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getUsers();
        if (Array.isArray(res)) setUsers(res);
        else if (res?.users && Array.isArray(res.users)) setUsers(res.users);
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = users.filter(u =>
    u.name.includes(search) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>👥 المستخدمين</h2>
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
              {filtered.map(user => (
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
                      background: user.role.includes('VIP') ? '#fef3c7' : '#f1f5f9',
                      fontSize: '0.72rem', fontWeight: 700,
                      color: user.role.includes('VIP') ? '#d97706' : '#64748b',
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
