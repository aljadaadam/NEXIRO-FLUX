'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, ShieldCheck, Search } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvUsersPanel() {
  const { currentTheme } = useGxvTheme();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    gxvAdminApi.getUsers().then(data => {
      setUsers(Array.isArray(data) ? data : data?.users || []);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    !search || String(u.name || u.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 300 }}>
        <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555577' }} />
        <input type="text" placeholder="بحث عن مستخدم..." value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 36px 10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#e8e8ff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
          }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((user, i) => (
            <div key={user.id as number} style={{
              padding: '16px 18px', borderRadius: 14,
              background: 'rgba(15,15,35,0.7)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              animation: `gxvSlideUp ${0.1 + i * 0.03}s ease-out both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: currentTheme.surface,
                  display: 'grid', placeItems: 'center',
                  color: currentTheme.primary, fontWeight: 800, fontSize: '0.95rem',
                }}>
                  {String(user.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
                    {String(user.name || 'مستخدم')}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, color: '#555577', fontSize: '0.75rem' }}>
                    <Mail size={11} />
                    {String(user.email || '')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: String(user.role) === 'admin' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.1)',
                  color: String(user.role) === 'admin' ? '#a78bfa' : '#60a5fa',
                  fontSize: '0.72rem', fontWeight: 600,
                }}>
                  {String(user.role) === 'admin' ? 'مدير' : 'مستخدم'}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555577' }}>
              <Users size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p>لا يوجد مستخدمين</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
