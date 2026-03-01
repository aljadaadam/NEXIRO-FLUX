'use client';

import { useState } from 'react';
import type { ColorTheme } from '@/lib/themes';
import { Settings, Shield, Key, Bell, Globe, Save } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

export default function SmmSettingsPage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [tab, setTab] = useState<'general' | 'security' | 'notifications'>('general');

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const tabs = [
    { id: 'general' as const, icon: Settings, label: t('عام') },
    { id: 'security' as const, icon: Shield, label: t('الأمان') },
    { id: 'notifications' as const, icon: Bell, label: t('الإشعارات') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>⚙️ {t('الإعدادات')}</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {tabs.map(tb => {
          const Icon = tb.icon;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
              borderRadius: 10, border: 'none',
              background: tab === tb.id ? theme.gradient : `${theme.primary}08`,
              color: tab === tb.id ? '#fff' : text,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              <Icon size={14} /> {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'general' && (
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 20 }}>{t('إعدادات عامة')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('اسم الموقع')}</label>
              <input defaultValue="" placeholder={t('اسم الموقع')} style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('البريد الإلكتروني')}</label>
              <input type="email" defaultValue="" placeholder="admin@example.com" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>
                <Globe size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} /> {t('اللغة الافتراضية')}
              </label>
              <select defaultValue="ar" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('العملة')}</label>
              <select defaultValue="USD" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }}>
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (﷼)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <button style={{
              padding: '12px', border: 'none', borderRadius: Number(buttonRadius),
              background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Save size={14} /> {t('حفظ')}
            </button>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} /> {t('تغيير كلمة المرور')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('كلمة المرور الحالية')}</label>
              <input type="password" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('كلمة المرور الجديدة')}</label>
              <input type="password" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('تأكيد كلمة المرور')}</label>
              <input type="password" style={{ width: '100%', height: 40, padding: '0 14px', border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <button style={{
              padding: '12px', border: 'none', borderRadius: Number(buttonRadius),
              background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Shield size={14} /> {t('تحديث')}
            </button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 20 }}>{t('إعدادات الإشعارات')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: t('إشعارات الطلبات الجديدة'), key: 'orders' },
              { label: t('إشعارات المدفوعات'), key: 'payments' },
              { label: t('إشعارات العملاء الجدد'), key: 'customers' },
              { label: t('إشعارات المحادثات'), key: 'chats' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontSize: 13, color: text }}>{item.label}</span>
                <button style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: theme.gradient, position: 'relative',
                }}>
                  <span style={{ position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
                </button>
              </div>
            ))}
            <button style={{
              padding: '12px', border: 'none', borderRadius: Number(buttonRadius),
              background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Save size={14} /> {t('حفظ')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
