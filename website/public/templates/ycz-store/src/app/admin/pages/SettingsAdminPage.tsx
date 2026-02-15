'use client';

export default function SettingsAdminPage() {
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>⚙️ الإعدادات</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Store Settings */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>🏪 إعدادات المتجر</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>اسم المتجر</label>
              <input defaultValue="المتجر" style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>العملة</label>
              <select style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box',
              }}>
                <option>USD ($)</option>
                <option>SAR (ر.س)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>🔔 الإشعارات</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'إشعار طلب جديد', desc: 'عند استلام طلب جديد', on: true },
              { label: 'إشعار تسجيل مستخدم', desc: 'عند تسجيل مستخدم جديد', on: true },
              { label: 'إشعار بريد إلكتروني', desc: 'إرسال ملخص يومي', on: false },
            ].map((n, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10,
              }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0b1020' }}>{n.label}</p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{n.desc}</p>
                </div>
                <div style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: n.on ? '#22c55e' : '#e2e8f0',
                  position: 'relative', cursor: 'pointer',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2, transition: 'all 0.2s',
                    ...(n.on ? { left: 2 } : { right: 2 }),
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020', marginBottom: 16 }}>🔒 الأمان</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>كلمة المرور الحالية</label>
              <input type="password" placeholder="••••••••" style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>كلمة المرور الجديدة</label>
              <input type="password" placeholder="••••••••" style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>
            <button style={{
              padding: '0.7rem 1.5rem', borderRadius: 10,
              background: '#7c5cff', color: '#fff',
              border: 'none', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', alignSelf: 'flex-start',
            }}>
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
