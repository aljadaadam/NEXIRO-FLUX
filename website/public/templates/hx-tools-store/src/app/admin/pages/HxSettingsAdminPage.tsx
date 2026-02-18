'use client';

import { useState, useEffect } from 'react';
import { hxAdminApi } from '@/lib/hxApi';
import { HxColorTheme } from '@/lib/hxThemes';
import { Settings, Save, Store, Globe, MessageCircle, Phone, Mail, Link as LinkIcon } from 'lucide-react';

interface Props { theme: HxColorTheme; darkMode: boolean; t: (s: string) => string; buttonRadius: string; }

export default function HxSettingsAdminPage({ theme, darkMode, t, buttonRadius }: Props) {
  const [settings, setSettings] = useState({
    store_name: '', store_description: '', support_email: '', support_phone: '',
    support_whatsapp: '', store_language: 'ar', social_facebook: '', social_twitter: '',
    social_instagram: '', social_telegram: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await hxAdminApi.getSettings();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch {}
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await hxAdminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${border}` }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{label}</label>
      <input className="hx-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>⚙️ {t('الإعدادات')}</h2>

      {saved && (
        <div style={{ padding: 12, borderRadius: 12, background: '#10b98115', color: '#10b981', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
          ✅ {t('تم حفظ الإعدادات بنجاح')}
        </div>
      )}

      <Section title={t('معلومات المتجر')} icon={<Store size={18} style={{ color: theme.primary }} />}>
        <Field label={t('اسم المتجر')} value={settings.store_name} onChange={v => setSettings({ ...settings, store_name: v })} placeholder="HX Tools" />
        <Field label={t('وصف المتجر')} value={settings.store_description} onChange={v => setSettings({ ...settings, store_description: v })} placeholder={t('متجر أدوات الصيانة والبرمجة')} />
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: subtext, marginBottom: 4, display: 'block' }}>{t('لغة المتجر')}</label>
          <select className="hx-select" value={settings.store_language} onChange={e => setSettings({ ...settings, store_language: e.target.value })}>
            <option value="ar">{t('العربية')}</option>
            <option value="en">{t('الإنجليزية')}</option>
          </select>
        </div>
      </Section>

      <Section title={t('بيانات الدعم')} icon={<MessageCircle size={18} style={{ color: theme.primary }} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Field label={t('البريد الإلكتروني')} value={settings.support_email} onChange={v => setSettings({ ...settings, support_email: v })} placeholder="support@hxtools.com" type="email" />
          <Field label={t('رقم الهاتف')} value={settings.support_phone} onChange={v => setSettings({ ...settings, support_phone: v })} placeholder="+966 50 000 0000" />
        </div>
        <Field label={t('واتساب')} value={settings.support_whatsapp} onChange={v => setSettings({ ...settings, support_whatsapp: v })} placeholder="+966500000000" />
      </Section>

      <Section title={t('روابط التواصل الاجتماعي')} icon={<LinkIcon size={18} style={{ color: theme.primary }} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Field label="Facebook" value={settings.social_facebook} onChange={v => setSettings({ ...settings, social_facebook: v })} />
          <Field label="Twitter / X" value={settings.social_twitter} onChange={v => setSettings({ ...settings, social_twitter: v })} />
          <Field label="Instagram" value={settings.social_instagram} onChange={v => setSettings({ ...settings, social_instagram: v })} />
          <Field label="Telegram" value={settings.social_telegram} onChange={v => setSettings({ ...settings, social_telegram: v })} />
        </div>
      </Section>

      <button onClick={handleSave} disabled={saving} className="hx-btn-primary" style={{ background: theme.primary, borderRadius: Number(buttonRadius), alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Save size={16} /> {saving ? t('جاري الحفظ...') : t('حفظ الإعدادات')}
      </button>
    </div>
  );
}
