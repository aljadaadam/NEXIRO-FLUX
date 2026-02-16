'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvPaymentsPanel() {
  const { currentTheme } = useGxvTheme();
  const [gateways, setGateways] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gxvAdminApi.getPaymentGateways().then(data => {
      setGateways(Array.isArray(data) ? data : data?.gateways || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const gatewayIcons: Record<string, string> = {
    paypal: '💳', binance: '🪙', usdt: '💲', stripe: '💎', manual: '🏦',
  };

  return (
    <div>
      <p style={{ color: '#666688', fontSize: '0.85rem', marginBottom: 24 }}>
        إدارة بوابات الدفع المتصلة بمتجرك
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {gateways.map((gw, i) => {
            const name = String(gw.name || gw.gateway_name || 'بوابة').toLowerCase();
            const icon = gatewayIcons[name] || '🔌';
            const enabled = !!gw.is_active;
            return (
              <div key={i} className="gxv-card-hover" style={{
                padding: '20px', borderRadius: 16,
                background: 'rgba(15,15,35,0.7)',
                border: `1px solid ${enabled ? `${currentTheme.primary}15` : 'rgba(255,255,255,0.06)'}`,
                animation: `gxvSlideUp ${0.15 + i * 0.05}s ease-out both`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.6rem' }}>{icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e8e8ff', margin: 0, textTransform: 'capitalize' }}>
                        {String(gw.name || gw.gateway_name || '')}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#555577' }}>
                        {gw.fees ? `رسوم: ${gw.fees}%` : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: 6,
                    background: enabled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
                    color: enabled ? '#4ade80' : '#f87171',
                    fontSize: '0.72rem', fontWeight: 600,
                  }}>
                    {enabled ? 'مفعّل' : 'معطّل'}
                  </div>
                </div>
              </div>
            );
          })}
          {gateways.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555577', gridColumn: '1/-1' }}>
              <CreditCard size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p>لا توجد بوابات دفع مكوّنة</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
