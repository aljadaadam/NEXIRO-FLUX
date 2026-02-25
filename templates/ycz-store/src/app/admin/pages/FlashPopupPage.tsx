'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Save, Eye, Image, Type, Palette, Link2, Loader2, X, CheckCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

function getFontStyleCSS(style: string): Record<string, string | number> {
  switch (style) {
    case 'block': return { fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' };
    case 'outlined': return { fontWeight: 800, WebkitTextStroke: '1px currentColor', color: 'transparent' };
    case 'shadow': return { fontWeight: 800, textShadow: '2px 2px 4px rgba(0,0,0,.4)' };
    case 'neon': return { fontWeight: 700, textShadow: '0 0 8px currentColor, 0 0 16px currentColor' };
    case 'italic': return { fontWeight: 700, fontStyle: 'italic' };
    default: return {};
  }
}

export default function FlashPopupPage() {
  const { t, isRTL } = useAdminLang();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [bgColor, setBgColor] = useState('#7c5cff');
  const [textColor, setTextColor] = useState('#ffffff');
  const [btnText, setBtnText] = useState('حسناً');
  const [btnUrl, setBtnUrl] = useState('');
  const [fontStyle, setFontStyle] = useState('normal');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await adminApi.getFlashSettings() as Record<string, unknown>;
      const c = (res as { customization?: Record<string, unknown> })?.customization || res;
      if (c) {
        setEnabled(!!c.flash_enabled);
        setTitle((c.flash_title as string) || '');
        setBody((c.flash_body as string) || '');
        setImage((c.flash_image as string) || '');
        setBgColor((c.flash_bg_color as string) || '#7c5cff');
        setTextColor((c.flash_text_color as string) || '#ffffff');
        setBtnText((c.flash_btn_text as string) || 'حسناً');
        setBtnUrl((c.flash_btn_url as string) || '');
        setFontStyle((c.flash_font_style as string) || 'normal');
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateFlashSettings({
        flash_enabled: enabled,
        flash_title: title,
        flash_body: body,
        flash_image: image,
        flash_bg_color: bgColor,
        flash_text_color: textColor,
        flash_btn_text: btnText,
        flash_btn_url: btnUrl,
        flash_font_style: fontStyle,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(t('حجم الصورة يجب أن يكون أقل من 5MB')); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#7c5cff" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          ⚡ {t('فلاش الإعلان')}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPreview(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
            background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: '.8rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}>
            <Eye size={14} /> {t('معاينة')}
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 10,
            background: saved ? '#16a34a' : 'linear-gradient(135deg,#7c5cff,#6366f1)', color: '#fff',
            border: 'none', fontSize: '.82rem', fontWeight: 700, cursor: saving ? 'default' : 'pointer',
            fontFamily: 'Tajawal, sans-serif', opacity: saving ? .6 : 1, transition: 'all .2s',
          }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? t('حفظ...') : saved ? t('تم الحفظ ✓') : t('حفظ')}
          </button>
        </div>
      </div>

      {/* Toggle */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
        padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#0b1020' }}>{t('تفعيل الفلاش')}</div>
          <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 2 }}>{t('يظهر للزائر عند فتح الموقع مرة واحدة')}</div>
        </div>
        <button onClick={() => setEnabled(!enabled)} style={{
          width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
          background: enabled ? '#7c5cff' : '#e2e8f0', position: 'relative', transition: 'background .2s',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2, transition: 'all .2s',
            ...(enabled ? { left: 24 } : { left: 2 }),
            boxShadow: '0 1px 3px rgba(0,0,0,.15)',
          }} />
        </button>
      </div>

      {/* Settings Card */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
        padding: 24, opacity: enabled ? 1 : .5, pointerEvents: enabled ? 'auto' : 'none', transition: 'opacity .2s',
      }}>
        {/* Title */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            <Type size={14} color="#7c5cff" /> {t('العنوان')}
          </label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('عنوان الإعلان...')}
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: '.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif', boxSizing: 'border-box' }} />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            <Type size={14} color="#7c5cff" /> {t('المحتوى')}
          </label>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={t('نص الإعلان... (يدعم أسطر متعددة)')}
            rows={3}
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: '.85rem', outline: 'none', fontFamily: 'Tajawal, sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        {/* Image */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            <Image size={14} color="#7c5cff" /> {t('صورة / GIF (اختياري)')}
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={image} onChange={e => setImage(e.target.value)} placeholder={t('رابط صورة أو GIF...')}
              style={{ flex: 1, minWidth: 200, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', outline: 'none', fontFamily: 'Tajawal, sans-serif' }} />
            <button onClick={() => fileRef.current?.click()} style={{
              padding: '10px 16px', borderRadius: 10, border: '1.5px dashed #d1d5db', background: '#f9fafb',
              color: '#64748b', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>
              📁 رفع صورة
            </button>
            <input ref={fileRef} type="file" accept="image/*,.gif" style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>
          {image && (
            <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
              <img src={image} alt="preview" style={{ maxWidth: 200, maxHeight: 120, borderRadius: 10, border: '1px solid #e5e7eb' }} />
              <button onClick={() => setImage('')} style={{
                position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Colors */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              <Palette size={14} color="#7c5cff" /> {t('لون الخلفية')}
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                style={{ width: 40, height: 40, border: '1.5px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input value={bgColor} onChange={e => setBgColor(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: '.82rem', outline: 'none', fontFamily: 'monospace' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              <Palette size={14} color="#7c5cff" /> {t('لون النص')}
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                style={{ width: 40, height: 40, border: '1.5px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input value={textColor} onChange={e => setTextColor(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: '.82rem', outline: 'none', fontFamily: 'monospace' }} />
            </div>
          </div>
        </div>

        {/* Quick Color Presets */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{t('ألوان سريعة')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { bg: '#7c5cff', text: '#fff', name: 'بنفسجي' },
              { bg: '#ef4444', text: '#fff', name: 'أحمر' },
              { bg: '#f59e0b', text: '#fff', name: 'برتقالي' },
              { bg: '#16a34a', text: '#fff', name: 'أخضر' },
              { bg: '#0ea5e9', text: '#fff', name: 'أزرق' },
              { bg: '#1e293b', text: '#fff', name: 'داكن' },
              { bg: '#fff', text: '#1e293b', name: 'أبيض' },
              { bg: 'linear-gradient(135deg,#7c5cff,#f472b6)', text: '#fff', name: 'تدرج' },
            ].map((preset, i) => (
              <button key={i} onClick={() => { setBgColor(preset.bg); setTextColor(preset.text); }}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: bgColor === preset.bg ? '2px solid #7c5cff' : '1.5px solid #e5e7eb',
                  background: preset.bg, color: preset.text, fontSize: '.7rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', minWidth: 60, textAlign: 'center',
                }}>
                {t(preset.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Button */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              {t('نص الزر')}
            </label>
            <input value={btnText} onChange={e => setBtnText(e.target.value)} placeholder={t('حسناً')}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', outline: 'none', fontFamily: 'Tajawal, sans-serif', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              <Link2 size={14} color="#7c5cff" /> {t('رابط الزر (اختياري)')}
            </label>
            <input value={btnUrl} onChange={e => setBtnUrl(e.target.value)} placeholder="https://..."
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', outline: 'none', fontFamily: 'Tajawal, sans-serif', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Font Style */}
        <div style={{ marginBottom: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            <Type size={14} color="#7c5cff" /> {t('تصميم الخط')}
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'normal', name: 'عادي', preview: { fontWeight: 400 } },
              { id: 'block', name: 'Block', preview: { fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' as const } },
              { id: 'outlined', name: 'مخطط', preview: { fontWeight: 800, WebkitTextStroke: '1px currentColor', color: 'transparent' } },
              { id: 'shadow', name: 'ظل', preview: { fontWeight: 800, textShadow: '2px 2px 4px rgba(0,0,0,.4)' } },
              { id: 'neon', name: 'نيون', preview: { fontWeight: 700, textShadow: '0 0 8px currentColor, 0 0 16px currentColor' } },
              { id: 'italic', name: 'مائل', preview: { fontWeight: 700, fontStyle: 'italic' as const } },
            ].map(s => (
              <button key={s.id} onClick={() => setFontStyle(s.id)}
                style={{
                  padding: '10px 18px', borderRadius: 10,
                  border: fontStyle === s.id ? '2px solid #7c5cff' : '1.5px solid #e5e7eb',
                  background: fontStyle === s.id ? '#f8f6ff' : '#fff',
                  color: '#374151', fontSize: '.82rem', cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif', minWidth: 70, textAlign: 'center' as const,
                  ...s.preview,
                }}>
                {t(s.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div onClick={() => setPreview(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
          display: 'grid', placeItems: 'center', padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 420, borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', animation: 'nxrChatIn .3s ease-out',
          }}>
            {/* Flash content */}
            <div style={{
              background: bgColor, color: textColor, padding: image ? '20px 24px' : '32px 24px',
              textAlign: 'center', fontFamily: 'Tajawal, sans-serif',
            }}>
              {image && (
                <div style={{ marginBottom: 16 }}>
                  <img src={image} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, objectFit: 'contain' }} />
                </div>
              )}
              {title && <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px', color: textColor, ...getFontStyleCSS(fontStyle) }}>{title}</h3>}
              {body && <p style={{ fontSize: '.88rem', lineHeight: 1.7, margin: '0 0 20px', opacity: .9, whiteSpace: 'pre-wrap', color: textColor, ...getFontStyleCSS(fontStyle) }}>{body}</p>}
              <button onClick={() => setPreview(false)} style={{
                padding: '10px 36px', borderRadius: 12, border: `2px solid ${textColor}40`,
                background: `${textColor}20`, color: textColor, fontSize: '.88rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
              }}>
                {btnText || t('حسناً')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes nxrChatIn{from{opacity:0;transform:translateY(20px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}
