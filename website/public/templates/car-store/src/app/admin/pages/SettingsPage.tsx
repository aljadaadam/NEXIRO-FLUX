'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { adminApi } from '@/lib/api';
import { Settings, Save, Globe, Phone, Mail, MapPin } from 'lucide-react';

export default function SettingsPage() {
  const { currentTheme, darkMode, t } = useTheme();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  useEffect(() => {
    adminApi.getSettings().then((d: { settings?: Record<string, string> }) => {
      setSettings(d.settings || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
  };

  const updateField = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: mutedColor }}>{t('جاري التحميل...')}</div>;
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{
        background: cardBg, borderRadius: 20, padding: 28, marginBottom: 24,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }} className="anim-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Settings size={20} color={accent} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{t('إعدادات المتجر')}</h3>
        </div>

        {[
          { key: 'store_phone', label: t('رقم الهاتف'), icon: Phone, dir: 'ltr' as const },
          { key: 'store_email', label: t('البريد الإلكتروني'), icon: Mail },
          { key: 'store_address', label: t('العنوان'), icon: MapPin },
          { key: 'whatsapp', label: t('واتساب'), icon: Phone, dir: 'ltr' as const },
          { key: 'instagram', label: 'Instagram', icon: Globe },
          { key: 'twitter', label: 'X / Twitter', icon: Globe },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, fontWeight: 600, color: mutedColor }}>
              <field.icon size={14} />
              {field.label}
            </label>
            <input
              className="car-form-input"
              value={settings[field.key] || ''}
              onChange={e => updateField(field.key, e.target.value)}
              dir={field.dir}
              style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}
            />
          </div>
        ))}

        <button className="car-btn-primary" onClick={handleSave} style={{
          background: accent, borderRadius: 14, width: '100%', marginTop: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <Save size={16} />
          {saved ? '✓ ' + t('تم الحفظ') : t('حفظ الإعدادات')}
        </button>
      </div>
    </div>
  );
}
