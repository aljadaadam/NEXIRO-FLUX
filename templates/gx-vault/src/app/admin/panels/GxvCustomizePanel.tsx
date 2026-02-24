'use client';

import { useState } from 'react';
import { Palette, Check, Type, Square, Image, Save, Moon, Sun } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';

export default function GxvCustomizePanel() {
  const theme = useGxvTheme();
  const { currentTheme, colorThemes, themeId, setThemeId, storeName, setStoreName,
    darkMode, setDarkMode, buttonRadius, setButtonRadius, fontFamily, setFontFamily,
    showBanner, setShowBanner, logoPreview, setLogoPreview, saveToServer } = theme;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveToServer();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fonts = [
    { id: 'Tajawal', name: 'تجوال' },
    { id: 'Cairo', name: 'القاهرة' },
  ];

  return (
    <div style={{ maxWidth: 700 }}>
      <p style={{ color: '#666688', fontSize: '0.85rem', marginBottom: 28 }}>
        خصّص مظهر متجرك — الألوان والخطوط والتخطيط
      </p>

      {/* Store Name */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
          <Type size={14} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
          اسم المتجر
        </label>
        <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
          style={{
            width: '100%', maxWidth: 400, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e8e8ff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Tajawal, sans-serif',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = `${currentTheme.primary}50`; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
      </div>

      {/* Color Theme */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 12 }}>
          <Palette size={14} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
          ثيم الألوان
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {colorThemes.map(ct => (
            <button key={ct.id} onClick={() => setThemeId(ct.id)} style={{
              padding: '14px', borderRadius: 14,
              background: themeId === ct.id ? ct.surface : 'rgba(255,255,255,0.03)',
              border: `2px solid ${themeId === ct.id ? ct.primary : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s',
              position: 'relative',
            }}>
              {themeId === ct.id && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: ct.primary, display: 'grid', placeItems: 'center',
                }}>
                  <Check size={12} color="#fff" />
                </div>
              )}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: ct.gradient, margin: '0 auto 8px',
                boxShadow: themeId === ct.id ? ct.glow : 'none',
              }} />
              <span style={{ color: themeId === ct.id ? ct.primary : '#888', fontSize: '0.78rem', fontWeight: 600 }}>
                {ct.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 10 }}>الخط</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {fonts.map(f => (
            <button key={f.id} onClick={() => setFontFamily(f.id)} style={{
              padding: '10px 20px', borderRadius: 10,
              background: fontFamily === f.id ? currentTheme.surface : 'rgba(255,255,255,0.03)',
              border: `1px solid ${fontFamily === f.id ? `${currentTheme.primary}40` : 'rgba(255,255,255,0.06)'}`,
              color: fontFamily === f.id ? currentTheme.primary : '#888',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: f.id,
            }}>
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Button Radius */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: '#b8b8cc', fontSize: '0.82rem', fontWeight: 700, marginBottom: 10 }}>
          <Square size={14} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
          زوايا الأزرار: {buttonRadius}px
        </label>
        <input type="range" min="0" max="24" value={buttonRadius}
          onChange={e => setButtonRadius(e.target.value)}
          style={{ width: '100%', maxWidth: 300, accentColor: currentTheme.primary }}
        />
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ color: '#b8b8cc', fontSize: '0.85rem', fontWeight: 600 }}>
            {darkMode ? <Moon size={14} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} /> : <Sun size={14} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />}
            الوضع الداكن
          </span>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: darkMode ? currentTheme.primary : '#333',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              right: darkMode ? 3 : 25,
              transition: 'right 0.2s',
            }} />
          </button>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ color: '#b8b8cc', fontSize: '0.85rem', fontWeight: 600 }}>
            <Image size={14} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
            البانر الرئيسي
          </span>
          <button onClick={() => setShowBanner(!showBanner)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: showBanner ? currentTheme.primary : '#333',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              right: showBanner ? 3 : 25,
              transition: 'right 0.2s',
            }} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving} style={{
        padding: '14px 32px', borderRadius: 14,
        background: saved ? 'rgba(34,197,94,0.15)' : currentTheme.gradient,
        border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
        color: saved ? '#4ade80' : '#fff',
        cursor: saving ? 'wait' : 'pointer',
        fontSize: '0.95rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: saved ? 'none' : currentTheme.glow,
        opacity: saving ? 0.7 : 1,
        transition: 'all 0.3s',
      }}>
        {saved ? <><Check size={16} /> تم الحفظ!</> : <><Save size={16} /> حفظ التخصيص</>}
      </button>
    </div>
  );
}
