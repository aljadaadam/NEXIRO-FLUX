'use client';

export default function PaymentsPage() {
  const gateways = [
    { name: 'Binance Pay', icon: '🟡', status: true, fees: '0.5%', desc: 'دفع عبر العملات الرقمية' },
    { name: 'PayPal', icon: '🔵', status: true, fees: '2.9%', desc: 'بطاقات ائتمان و PayPal' },
    { name: 'التحويل البنكي', icon: '🏦', status: true, fees: '0%', desc: 'تحويل بنكي مباشر' },
    { name: 'Stripe', icon: '💳', status: false, fees: '2.5%', desc: 'بطاقات ائتمان دولية' },
    { name: 'USDT (TRC20)', icon: '💚', status: true, fees: '1%', desc: 'تيثر على شبكة Tron' },
  ];

  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', marginBottom: 20 }}>💳 بوابات الدفع</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {gateways.map((gw, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: '1.5rem',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{gw.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>{gw.name}</h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{gw.desc}</p>
                </div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 11,
                background: gw.status ? '#22c55e' : '#e2e8f0',
                position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2, transition: 'all 0.2s',
                  ...(gw.status ? { left: 2 } : { right: 2 }),
                }} />
              </div>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem', background: '#f8fafc', borderRadius: 10,
            }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>رسوم المعالجة</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{gw.fees}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
