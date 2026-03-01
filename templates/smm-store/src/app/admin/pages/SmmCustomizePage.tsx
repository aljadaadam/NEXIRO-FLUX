'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { COLOR_THEMES } from '@/lib/themes';
import type { ColorTheme } from '@/lib/themes';
import { Palette, Sun, Moon, Save, RotateCcw, Image, Type, Square } from 'lucide-react';

interface Props {
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  buttonRadius?: string;
}

export default function SmmCustomizePage({ theme, darkMode, t, buttonRadius = '12' }: Props) {
  const [settings, setSettings] = useState({
    theme_id: 'neon-blue', store_name: '', logo_url: '', dark_mode: true,
    button_radius: '12', header_style: 'glass', font_family: 'Tajawal',
    show_banner: true, footer_text: '', custom_css: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cardBg = darkMode ? '#141830' : '#fff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#1e2642' : '#e2e8f0';
  const inputBg = darkMode ? '#0f1322' : '#f8fafc';

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getCustomize();
      const c = data?.customization || data || {};
      setSettings({
        theme_id: c.theme_id || 'neon-blue',
        store_name: c.store_name || '',
        logo_url: c.logo_url || '',
        dark_mode: c.dark_mode !== false,
        button_radius: String(c.button_radius || '12'),
        header_style: c.header_style || 'glass',
        font_family: c.font_family || 'Tajawal',
        show_banner: c.show_banner !== false,
        footer_text: c.footer_text || '',
        custom_css: c.custom_css || '',
      });
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.updateCustomize(settings); } catch {}
    setSaving(false);
  };

  const handleReset = async () => {
    if (!confirm(t('هل أنت متأكد من إعادة التعيين؟'))) return;
    try { await adminApi.resetCustomize(); load(); } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: subtext }}>{t('جاري التحميل...')}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: text }}>🎨 {t('التخصيص')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            borderRadius: Number(buttonRadius), border: `1px solid ${border}`,
            background: 'transparent', color: subtext, fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            <RotateCcw size={14} /> {t('إعادة تعيين')}
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
            borderRadius: Number(buttonRadius), border: 'none',
            background: theme.gradient, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}>
            <Save size={14} /> {saving ? '...' : t('حفظ')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Theme selection */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} /> {t('الثيم')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {COLOR_THEMES.map(th => (
              <button key={th.id} onClick={() => setSettings(s => ({ ...s, theme_id: th.id }))} style={{
                padding: 12, borderRadius: 12, border: settings.theme_id === th.id ? `2px solid ${th.primary}` : `1px solid ${border}`,
                background: settings.theme_id === th.id ? `${th.primary}12` : 'transparent',
                cursor: 'pointer', textAlign: 'center',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: th.gradient, margin: '0 auto 6px' }} />
                <span style={{ fontSize: 11, color: text, fontWeight: settings.theme_id === th.id ? 700 : 500 }}>{th.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* General settings */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Type size={18} /> {t('عام')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('اسم المتجر')}</label>
              <input value={settings.store_name} onChange={e => setSettings(s => ({ ...s, store_name: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('رابط الشعار')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={settings.logo_url} onChange={e => setSettings(s => ({ ...s, logo_url: e.target.value }))} placeholder="https://..." style={{ flex: 1, height: 38, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
                <div style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: inputBg }}>
                  {settings.logo_url ? <img src={settings.logo_url} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} /> : <Image size={16} style={{ color: subtext }} />}
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('الخط')}</label>
              <select value={settings.font_family} onChange={e => setSettings(s => ({ ...s, font_family: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: text, fontSize: 13, outline: 'none' }}>
                {['Tajawal', 'Cairo', 'Almarai', 'IBM Plex Sans Arabic', 'Noto Kufi Arabic'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />} {t('المظهر')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: text }}>{t('الوضع الداكن')}</span>
              <button onClick={() => setSettings(s => ({ ...s, dark_mode: !s.dark_mode }))} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: settings.dark_mode ? theme.gradient : `${subtext}30`,
                position: 'relative', transition: 'all 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 2, [settings.dark_mode ? 'left' : 'right']: 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: text }}>{t('إظهار البانر')}</span>
              <button onClick={() => setSettings(s => ({ ...s, show_banner: !s.show_banner }))} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: settings.show_banner ? theme.gradient : `${subtext}30`,
                position: 'relative', transition: 'all 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 2, [settings.show_banner ? 'left' : 'right']: 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('انحناء الأزرار')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['0', '8', '12', '20', '50'].map(r => (
                  <button key={r} onClick={() => setSettings(s => ({ ...s, button_radius: r }))} style={{
                    flex: 1, height: 34, borderRadius: Number(r), border: settings.button_radius === r ? `2px solid ${theme.primary}` : `1px solid ${border}`,
                    background: settings.button_radius === r ? `${theme.primary}12` : 'transparent',
                    color: text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Square size={14} style={{ borderRadius: Number(r) / 3 }} /> {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Custom CSS */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 16 }}>⚙️ {t('متقدم')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>{t('نص الفوتر')}</label>
              <input value={settings.footer_text} onChange={e => setSettings(s => ({ ...s, footer_text: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: subtext, display: 'block', marginBottom: 4 }}>CSS {t('مخصص')}</label>
              <textarea rows={4} value={settings.custom_css} onChange={e => setSettings(s => ({ ...s, custom_css: e.target.value }))} style={{ width: '100%', padding: 12, border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: text, fontSize: 12, outline: 'none', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
