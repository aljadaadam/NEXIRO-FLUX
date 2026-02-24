'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Check, Globe, Key, Shield } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { gxvAdminApi } from '@/engine/gxvApi';

export default function GxvSettingsPanel() {
  const { currentTheme } = useGxvTheme();
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    gxvAdminApi.getSettings().then(data => {
      setSettings(data?.customization || data || {});
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await gxvAdminApi.updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: currentTheme.primary, borderRadius: '50%', animation: 'gxvSpin 0.8s linear infinite' }} />
      </div>
    );
  }

  const fields = [
    { key: 'store_name', label: 'اسم المتجر', icon: <Globe size={14} />, placeholder: 'اسم المتجر' },
    { key: 'store_description', label: 'وصف المتجر', icon: <Settings size={14} />, placeholder: 'وصف قصير للمتجر' },
    { key: 'contact_email', label: 'بريد التواصل', icon: <Shield size={14} />, placeholder: 'email@example.com' },
  ];

  return (
    <div style={{ maxWidth: 600 }}>
      <p style={{ color: '#666688', fontSize: '0.85rem', marginBottom: 28 }}>
        إعدادات المتجر العامة
      </p>

      {fields.map(field => (
        <div key={field.key} style={{ marginBottom: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8,
          }}>
            <span style={{ color: currentTheme.primary }}>{field.icon}</span>
            {field.label}
          </label>
          <input
            type="text"
            placeholder={field.placeholder}
            value={String(settings[field.key] || '')}
            onChange={e => updateField(field.key, e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e8e8ff', fontSize: '0.9rem', outline: 'none',
              fontFamily: 'Tajawal, sans-serif',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
      ))}

      <button onClick={handleSave} disabled={saving} style={{
        padding: '14px 32px', borderRadius: 14, marginTop: 12,
        background: saved ? 'rgba(34,197,94,0.15)' : currentTheme.gradient,
        border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
        color: saved ? '#4ade80' : '#fff',
        cursor: saving ? 'wait' : 'pointer',
        fontSize: '0.95rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: saved ? 'none' : currentTheme.glow,
        opacity: saving ? 0.7 : 1,
      }}>
        {saved ? <><Check size={16} /> تم الحفظ!</> : <><Save size={16} /> حفظ الإعدادات</>}
      </button>
    </div>
  );
}
