'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Palette, Moon, Sun, Type, CornerDownRight, Image, Save } from 'lucide-react';

export default function CustomizePage() {
  const {
    currentTheme, themeId, setThemeId, darkMode, setDarkMode,
    storeName, setStoreName, logoPreview, setLogoPreview,
    buttonRadius, setButtonRadius, fontFamily, setFontFamily,
    colorThemes, t,
  } = useTheme();

  const accent = currentTheme.accent || '#e94560';
  const cardBg = darkMode ? '#12121e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Theme Colors */}
      <div style={{
        background: cardBg, borderRadius: 20, padding: 28, marginBottom: 24,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }} className="anim-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Palette size={20} color={accent} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{t('سمة الألوان')}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {colorThemes.map(theme => (
            <button key={theme.id} onClick={() => setThemeId(theme.id)} style={{
              padding: 16, borderRadius: 16, textAlign: 'center',
              background: themeId === theme.id ? `${theme.accent}15` : (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
              border: `2px solid ${themeId === theme.id ? theme.accent : 'transparent'}`,
              transition: 'all 0.3s', cursor: 'pointer',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.gradient, margin: '0 auto 10px' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Store Name & Logo */}
      <div style={{
        background: cardBg, borderRadius: 20, padding: 28, marginBottom: 24,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }} className="anim-fade-up anim-delay-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Image size={20} color={accent} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{t('الهوية')}</h3>
        </div>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: mutedColor }}>{t('اسم المتجر')}</label>
        <input className="car-form-input" value={storeName} onChange={e => setStoreName(e.target.value)}
          style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: mutedColor }}>{t('رابط الشعار')}</label>
        <input className="car-form-input" value={logoPreview || ''} onChange={e => setLogoPreview(e.target.value || null)} placeholder="https://..."
          style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }} />
        {logoPreview && <img src={logoPreview} alt="Logo" style={{ height: 50, borderRadius: 12, marginTop: 8 }} />}
      </div>

      {/* Appearance */}
      <div style={{
        background: cardBg, borderRadius: 20, padding: 28, marginBottom: 24,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }} className="anim-fade-up anim-delay-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Type size={20} color={accent} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{t('المظهر')}</h3>
        </div>

        {/* Dark mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 16, borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {darkMode ? <Moon size={18} color={accent} /> : <Sun size={18} color={accent} />}
            <span style={{ fontWeight: 700, color: textColor }}>{t('الوضع الداكن')}</span>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            width: 52, height: 28, borderRadius: 14, position: 'relative',
            background: darkMode ? accent : '#ccc', transition: 'background 0.3s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              [darkMode ? 'left' : 'right']: 3,
              transition: 'all 0.3s',
            }} />
          </button>
        </div>

        {/* Button Radius */}
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: mutedColor }}>{t('استدارة الأزرار')}: {buttonRadius}px</label>
        <input type="range" min="0" max="30" value={buttonRadius} onChange={e => setButtonRadius(e.target.value)}
          style={{ width: '100%', marginBottom: 20, accentColor: accent }} />

        {/* Font */}
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: mutedColor }}>{t('الخط')}</label>
        <select className="car-form-input" value={fontFamily} onChange={e => setFontFamily(e.target.value)}
          style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textColor }}>
          <option value="Tajawal">Tajawal</option>
          <option value="Cairo">Cairo</option>
          <option value="Inter">Inter</option>
        </select>
      </div>

      <p style={{ color: mutedColor, fontSize: 13, textAlign: 'center' }}>
        {t('التغييرات تُحفظ تلقائياً')} ✓
      </p>
    </div>
  );
}
