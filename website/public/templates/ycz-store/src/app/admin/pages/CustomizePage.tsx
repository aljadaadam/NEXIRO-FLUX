'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { COLOR_THEMES } from '@/lib/themes';
import { adminApi } from '@/lib/api';
import {
  Image, Upload, Palette, Layout, Monitor, Moon,
  Megaphone, Zap, Check, Paintbrush, ShoppingCart,
} from 'lucide-react';

const FONT_OPTIONS = [
  { id: 'Tajawal', label: 'تجوال', sample: 'خط عربي حديث وأنيق' },
  { id: 'Cairo', label: 'القاهرة', sample: 'خط عربي كلاسيكي' },
  { id: 'IBM Plex Sans Arabic', label: 'IBM عربي', sample: 'خط تقني احترافي' },
  { id: 'Noto Sans Arabic', label: 'نوتو', sample: 'خط عالمي متوافق' },
];

const HEADER_STYLES = [
  { id: 'default', label: 'كلاسيكي' },
  { id: 'centered', label: 'وسطي' },
  { id: 'minimal', label: 'بسيط' },
];

const RADIUS_OPTIONS = [
  { id: '8', label: 'صغير (8px)' },
  { id: '14', label: 'متوسط (14px)' },
  { id: '20', label: 'كبير (20px)' },
];

export default function CustomizePage() {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = COLOR_THEMES.find(t => t.id === theme.themeId) || COLOR_THEMES[0];

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateCustomize({
        theme_id: theme.themeId,
        logo_url: theme.logoPreview,
        font_family: theme.fontFamily,
        dark_mode: theme.darkMode,
        button_radius: theme.buttonRadius,
        header_style: theme.headerStyle,
        show_banner: theme.showBanner,
        store_name: theme.storeName,
      });
      // إعادة قراءة القيم من السيرفر للتأكد
      await theme.refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[Customize] فشل حفظ التخصيص:', err);
      alert('فشل حفظ التخصيصات! تأكد من اتصالك بالسيرفر.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      theme.setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🎨 تخصيص المتجر</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.6rem 1.5rem', borderRadius: 10,
            background: saved ? '#16a34a' : saving ? '#94a3b8' : '#7c5cff', color: '#fff',
            border: 'none', fontSize: '0.82rem', fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
            transition: 'all 0.3s',
          }}
        >
          {saved ? <><Check size={16} /> تم الحفظ</> : saving ? 'جاري الحفظ...' : <><Paintbrush size={16} /> حفظ التعديلات</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {/* Logo & Identity */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Image size={18} color="#7c5cff" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>الشعار والهوية</h3>
          </div>

          {/* Logo Upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>شعار المتجر</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 14,
                background: '#f8fafc', border: '2px dashed #e2e8f0',
                display: 'grid', placeItems: 'center', overflow: 'hidden',
              }}>
                {theme.logoPreview ? (
                  <img src={theme.logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload size={24} color="#cbd5e1" />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#475569', marginBottom: 4,
                  }}
                >
                  <Upload size={12} style={{ marginLeft: 4 }} /> رفع شعار
                </button>
                <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>PNG, JPG — حد أقصى 2MB</p>
              </div>
            </div>
          </div>

          {/* Store Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>اسم المتجر</label>
            <input
              value={theme.storeName}
              onChange={e => theme.setStoreName(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600,
                fontFamily: 'Tajawal, sans-serif', outline: 'none',
                background: '#f8fafc', color: '#0b1020',
              }}
            />
          </div>

          {/* Font Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>الخط</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FONT_OPTIONS.map(font => (
                <button
                  key={font.id}
                  onClick={() => theme.setFontFamily(font.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', borderRadius: 10,
                    border: theme.fontFamily === font.id ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                    background: theme.fontFamily === font.id ? '#f5f3ff' : '#fff',
                    cursor: 'pointer', fontFamily: font.id + ', sans-serif',
                    textAlign: 'right',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{font.label}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{font.sample}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Site Colors */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Palette size={18} color="#7c5cff" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>ألوان الموقع</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {COLOR_THEMES.map(ct => (
              <button
                key={ct.id}
                onClick={() => theme.setThemeId(ct.id)}
                style={{
                  padding: '1rem', borderRadius: 12,
                  border: theme.themeId === ct.id ? `2px solid ${ct.primary}` : '1px solid #e2e8f0',
                  background: theme.themeId === ct.id ? ct.light : '#fff',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s', position: 'relative',
                }}
              >
                {theme.themeId === ct.id && (
                  <div style={{
                    position: 'absolute', top: 6, left: 6, width: 18, height: 18,
                    borderRadius: '50%', background: ct.primary, display: 'grid', placeItems: 'center',
                  }}>
                    <Check size={10} color="#fff" />
                  </div>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8,
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: ct.primary }} />
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: ct.secondary }} />
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: ct.accent }} />
                </div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0b1020' }}>{ct.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Page Layout */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Layout size={18} color="#7c5cff" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>تخطيط الصفحة</h3>
          </div>

          {/* Header Style */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>نمط الهيدر</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {HEADER_STYLES.map(hs => (
                <button
                  key={hs.id}
                  onClick={() => theme.setHeaderStyle(hs.id)}
                  style={{
                    flex: 1, padding: '0.55rem', borderRadius: 8,
                    border: theme.headerStyle === hs.id ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                    background: theme.headerStyle === hs.id ? '#f5f3ff' : '#fff',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#0b1020',
                  }}
                >{hs.label}</button>
              ))}
            </div>
          </div>

          {/* Button Radius */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>انحناء الأزرار</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => theme.setButtonRadius(r.id)}
                  style={{
                    flex: 1, padding: '0.55rem', borderRadius: 8,
                    border: theme.buttonRadius === r.id ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                    background: theme.buttonRadius === r.id ? '#f5f3ff' : '#fff',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#0b1020',
                  }}
                >{r.label}</button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Dark Mode */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Moon size={16} color="#64748b" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>الوضع الداكن</span>
              </div>
              <button
                onClick={() => theme.setDarkMode(!theme.darkMode)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: theme.darkMode ? '#7c5cff' : '#e2e8f0',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  right: theme.darkMode ? 3 : 'auto',
                  left: theme.darkMode ? 'auto' : 3,
                  transition: 'all 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>

            {/* Banner */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Megaphone size={16} color="#64748b" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>إظهار البانر</span>
              </div>
              <button
                onClick={() => theme.setShowBanner(!theme.showBanner)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: theme.showBanner ? '#7c5cff' : '#e2e8f0',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  right: theme.showBanner ? 3 : 'auto',
                  left: theme.showBanner ? 'auto' : 3,
                  transition: 'all 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Monitor size={18} color="#7c5cff" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>معاينة مباشرة</h3>
          </div>

          <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: theme.darkMode ? '#111827' : '#fafbfc',
            fontFamily: theme.fontFamily + ', sans-serif',
          }}>
            {/* Mini Header Preview */}
            <div style={{
              background: currentTheme.primary,
              padding: '0.65rem 1rem',
              display: 'flex', justifyContent: theme.headerStyle === 'centered' ? 'center' : 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {theme.logoPreview ? (
                  <img src={theme.logoPreview} alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'cover' }} />
                ) : (
                  <Zap size={16} color="#fff" />
                )}
                <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>{theme.storeName || 'اسم المتجر'}</span>
              </div>
              {theme.headerStyle !== 'minimal' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {['الرئيسية', 'الخدمات'].map((l, i) => (
                    <span key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', fontWeight: 600 }}>{l}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Banner Preview */}
            {theme.showBanner && (
              <div style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                padding: '1.25rem 1rem', textAlign: 'center',
              }}>
                <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>مرحباً بك في {theme.storeName || 'المتجر'} 🎉</p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', marginTop: 4 }}>اكتشف أفضل الخدمات</p>
              </div>
            )}

            {/* Products Preview */}
            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  background: theme.darkMode ? '#1f2937' : '#fff',
                  borderRadius: parseInt(theme.buttonRadius) || 14,
                  padding: '0.75rem', border: '1px solid',
                  borderColor: theme.darkMode ? '#374151' : '#f1f5f9',
                }}>
                  <div style={{
                    height: 55, borderRadius: (parseInt(theme.buttonRadius) || 14) - 4,
                    background: `linear-gradient(135deg, ${currentTheme.light}, ${currentTheme.accent}22)`,
                    marginBottom: 8, display: 'grid', placeItems: 'center',
                  }}>
                    <ShoppingCart size={18} color={currentTheme.primary} />
                  </div>
                  <p style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: theme.darkMode ? '#f1f5f9' : '#0b1020',
                    marginBottom: 4,
                  }}>منتج {i}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: currentTheme.primary }}>$9.99</span>
                    <button style={{
                      padding: '0.25rem 0.5rem', borderRadius: parseInt(theme.buttonRadius) || 14,
                      background: currentTheme.primary, color: '#fff', border: 'none',
                      fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                    }}>شراء</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
