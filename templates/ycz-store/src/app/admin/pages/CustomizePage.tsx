'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { COLOR_THEMES } from '@/lib/themes';
import { adminApi, isDemoMode } from '@/lib/api';
import {
  Image, Upload, Palette, Layout, Monitor, Moon,
  Megaphone, Zap, Check, Paintbrush, ShoppingCart, Share2,
  Trash2, RotateCcw, Globe, X,
} from 'lucide-react';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

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

const PRODUCT_LAYOUT_OPTIONS = [
  { id: 'grid', label: 'شبكة (مربع)', icon: '▦' },
  { id: 'list', label: 'قائمة (مستطيل)', icon: '☰' },
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/* ─── Toggle Switch Component ─── */
function Toggle({ value, onChange, color = '#7c5cff' }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? color : '#e2e8f0',
        position: 'relative', transition: 'all 0.3s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        right: value ? 3 : 'auto',
        left: value ? 'auto' : 3,
        transition: 'all 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

/* ─── Section Card Component ─── */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '1.5rem',
      border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {icon}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function CustomizePage() {
  const theme = useTheme();
  const { t, isRTL } = useAdminLang();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = COLOR_THEMES.find(ct => ct.id === theme.themeId) || COLOR_THEMES[0];

  /* ─── Save ─── */
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
        social_links: theme.socialLinks,
        store_language: theme.language,
        custom_css: theme.customCss,
        footer_text: theme.footerText,
        product_layout: theme.productLayout,
      });
      // في وضع الديمو لا نستدعي refetch لأنه يعيد البيانات الافتراضية ويمسح تغييرات الزائر
      if (!isDemoMode()) {
        await theme.refetch();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[Customize] Save failed:', err);
      alert(t('فشل حفظ التخصيصات! تأكد من اتصالك بالسيرفر.'));
    } finally {
      setSaving(false);
    }
  };

  /* ─── Reset to Default ─── */
  const handleReset = async () => {
    if (!confirm(t('هل أنت متأكد من إعادة التخصيص للقيم الافتراضية؟ لا يمكن التراجع.'))) return;
    setResetting(true);
    try {
      await adminApi.resetCustomize();
      // في وضع الديمو نعيد القيم يدوياً للافتراضية
      if (isDemoMode()) {
        theme.setThemeId('purple');
        theme.setLogoPreview(null);
        theme.setFontFamily('Tajawal');
        theme.setDarkMode(false);
        theme.setButtonRadius('14');
        theme.setHeaderStyle('default');
        theme.setShowBanner(true);
        theme.setStoreName('المتجر');
        theme.setSocialLinks({});
        theme.setLanguage('ar');
        theme.setProductLayout('grid');
      } else {
        await theme.refetch();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[Customize] Reset failed:', err);
      alert(t('فشل إعادة التعيين!'));
    } finally {
      setResetting(false);
    }
  };

  /* ─── Logo Upload with Validation ─── */
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoError(t('نوع الملف غير مدعوم. استخدم PNG, JPG, WebP أو SVG'));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError(isRTL ? `حجم الملف ${(file.size / 1024 / 1024).toFixed(1)}MB — الحد الأقصى 2MB` : `File size ${(file.size / 1024 / 1024).toFixed(1)}MB — max 2MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => theme.setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = () => {
    theme.setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ─── Social Link Items ─── */
  const socialItems: { key: string; label: string; placeholder: string; color: string; icon: React.ReactNode }[] = [
    { key: 'whatsapp', label: 'واتساب', placeholder: 'https://wa.me/249123456789', color: '#25D366', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { key: 'telegram', label: 'تليجرام', placeholder: 'https://t.me/username', color: '#0088cc', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { key: 'facebook', label: 'فيسبوك', placeholder: 'https://facebook.com/page', color: '#1877F2', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { key: 'instagram', label: 'انستقرام', placeholder: 'https://instagram.com/username', color: '#E4405F', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg> },
    { key: 'twitter', label: 'X (تويتر)', placeholder: 'https://x.com/username', color: '#000', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600,
    fontFamily: 'Tajawal, sans-serif', outline: 'none',
    background: '#f8fafc', color: '#0b1020', boxSizing: 'border-box' as const,
  };

  return (
    <>
      {/* ─── Top Bar ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>🎨 {t('تخصيص المتجر')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 1.2rem', borderRadius: 10,
              background: '#fff', color: '#ef4444',
              border: '1px solid #fecaca', fontSize: '0.82rem', fontWeight: 700,
              cursor: resetting ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
              transition: 'all 0.3s',
            }}
          >
            <RotateCcw size={14} /> {resetting ? t('جاري...') : t('إعادة تعيين')}
          </button>
          {/* Save Button */}
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
            {saved ? <><Check size={16} /> {t('تم الحفظ')}</> : saving ? t('جاري الحفظ...') : <><Paintbrush size={16} /> {t('حفظ التعديلات')}</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>

        {/* ═══════════ 1. Logo & Identity ═══════════ */}
        <Section icon={<Image size={18} color="#7c5cff" />} title={t("الشعار والهوية")}>
          {/* Logo Upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>{t('شعار المتجر')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 14,
                background: '#f8fafc', border: '2px dashed #e2e8f0',
                display: 'grid', placeItems: 'center', overflow: 'hidden',
                position: 'relative',
              }}>
                {theme.logoPreview ? (
                  <>
                    <img src={theme.logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={handleDeleteLogo}
                      style={{
                        position: 'absolute', top: 2, right: 2,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none',
                        cursor: 'pointer', display: 'grid', placeItems: 'center',
                      }}
                    >
                      <X size={10} />
                    </button>
                  </>
                ) : (
                  <Upload size={24} color="#cbd5e1" />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#475569', marginBottom: 4,
                  }}
                >
                  <Upload size={12} style={{ marginLeft: isRTL ? 4 : 0, marginRight: isRTL ? 0 : 4 }} /> {t('رفع شعار')}
                </button>
                <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t('PNG, JPG, WebP, SVG — حد أقصى 2MB')}</p>
                {logoError && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 4, fontWeight: 600 }}>{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Store Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>{t('اسم المتجر')}</label>
            <input
              value={theme.storeName}
              onChange={e => theme.setStoreName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Language Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={14} color="#64748b" /> {t('لغة المتجر')}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'ar' as const, label: 'العربية 🇸🇦', sub: 'RTL' },
                { id: 'en' as const, label: 'English 🇺🇸', sub: 'LTR' },
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => theme.setLanguage(lang.id)}
                  style={{
                    flex: 1, padding: '0.65rem', borderRadius: 10,
                    border: theme.language === lang.id ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                    background: theme.language === lang.id ? '#f5f3ff' : '#fff',
                    cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0b1020' }}>{lang.label}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>{lang.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>{t('الخط')}</label>
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
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0b1020' }}>{t(font.label)}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t(font.sample)}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════ 2. Site Colors ═══════════ */}
        <Section icon={<Palette size={18} color="#7c5cff" />} title={t("ألوان الموقع")}>
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: ct.primary }} />
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: ct.secondary }} />
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: ct.accent }} />
                </div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0b1020' }}>{t(ct.name)}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* ═══════════ 3. Page Layout ═══════════ */}
        <Section icon={<Layout size={18} color="#7c5cff" />} title={t("تخطيط الصفحة")}>
          {/* Header Style */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>{t('نمط الهيدر')}</label>
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
                >{t(hs.label)}</button>
              ))}
            </div>
          </div>

          {/* Button Radius */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>{t('انحناء الأزرار')}</label>
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
                >{t(r.label)}</button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Moon size={16} color="#64748b" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{t('الوضع الداكن')}</span>
              </div>
              <Toggle value={theme.darkMode} onChange={theme.setDarkMode} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Megaphone size={16} color="#64748b" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0b1020' }}>{t('إظهار البانر')}</span>
              </div>
              <Toggle value={theme.showBanner} onChange={theme.setShowBanner} />
            </div>
          </div>

          {/* Product Layout */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>{t('تخطيط عرض المنتجات')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRODUCT_LAYOUT_OPTIONS.map(lo => (
                <button
                  key={lo.id}
                  onClick={() => theme.setProductLayout(lo.id)}
                  style={{
                    flex: 1, padding: '0.7rem', borderRadius: 8,
                    border: theme.productLayout === lo.id ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                    background: theme.productLayout === lo.id ? '#f5f3ff' : '#fff',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'Tajawal, sans-serif', color: '#0b1020',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{lo.icon}</span> {t(lo.label)}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            <div style={{ marginTop: 12, padding: '0.75rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>{t('معاينة مباشرة')}</p>
              {theme.productLayout === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { name: 'Unlocktool 12 Months', cat: 'Unlocktool Activation', price: '$42', time: '1-3 Hours' },
                    { name: 'Unlocktool 3 Months', cat: 'Unlocktool Activation', price: '$18.4', time: '1-3 Hours' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0.65rem',
                      background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: '0.9rem' }}>🔑</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0b1020', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{item.cat}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#7c5cff', color: '#fff', padding: '0.12rem 0.4rem', borderRadius: 6 }}>{item.price}</span>
                        <span style={{ fontSize: '0.55rem', color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '0.1rem 0.3rem', borderRadius: 4 }}>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { name: 'Unlocktool 12M', price: '$42' },
                    { name: 'Unlocktool 3M', price: '$18.4' },
                    { name: 'Unlocktool 6M', price: '$26.4' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '0.5rem', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center',
                    }}>
                      <div style={{ width: '100%', height: 28, borderRadius: 6, background: '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: '0.8rem', marginBottom: 4 }}>🔑</div>
                      <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0b1020', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#7c5cff' }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ═══════════ 4. Social Links ═══════════ */}
        <Section icon={<Share2 size={18} color="#7c5cff" />} title={t("روابط التواصل الاجتماعي")}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 16 }}>{t('أضف روابط حساباتك لتظهر في أسفل المتجر')}</p>
          {socialItems.map(s => (
            <div key={s.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                {s.icon} {t(s.label)}
              </label>
              <input
                value={(theme.socialLinks as Record<string, string>)[s.key] || ''}
                onChange={e => theme.setSocialLinks({ ...theme.socialLinks, [s.key]: e.target.value })}
                placeholder={s.placeholder}
                dir="ltr"
                style={{ ...inputStyle, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
            </div>
          ))}
        </Section>

        {/* ═══════════ 6. Live Preview ═══════════ */}
        <Section icon={<Monitor size={18} color="#7c5cff" />} title={t("معاينة مباشرة")}>
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
                <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>{theme.storeName || t('اسم المتجر')}</span>
              </div>
              {theme.headerStyle !== 'minimal' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {[t('الرئيسية'), t('الخدمات')].map((l, i) => (
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
                <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{isRTL ? `مرحباً بك في ${theme.storeName || 'المتجر'} 🎉` : `Welcome to ${theme.storeName || 'Store'} 🎉`}</p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', marginTop: 4 }}>{t('اكتشف أفضل الخدمات')}</p>
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
                  }}>{t('منتج')} {i}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: currentTheme.primary }}>$9.99</span>
                    <button style={{
                      padding: '0.25rem 0.5rem', borderRadius: parseInt(theme.buttonRadius) || 14,
                      background: currentTheme.primary, color: '#fff', border: 'none',
                      fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                    }}>{t('شراء')}</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Preview */}
            <div style={{
              borderTop: `1px solid ${theme.darkMode ? '#374151' : '#e2e8f0'}`,
              padding: '0.6rem 1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: theme.darkMode ? '#0f172a' : '#f8fafc',
            }}>
              <span style={{ fontSize: '0.58rem', color: theme.darkMode ? '#94a3b8' : '#64748b' }}>
                {theme.footerText || `© 2025 ${theme.storeName}`}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {Object.entries(theme.socialLinks).filter(([, v]) => v).map(([k]) => (
                  <div key={k} style={{ width: 14, height: 14, borderRadius: '50%', background: currentTheme.primary + '22', display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: currentTheme.primary }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Language Badge */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
              background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd',
            }}>
              🌐 {theme.language === 'ar' ? t('العربية (RTL)') : 'English (LTR)'}
            </span>
            <span style={{
              padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
              background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
            }}>
              🎨 {t(currentTheme.name)}
            </span>
            <span style={{
              padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
              background: theme.darkMode ? '#1e1b4b' : '#fefce8',
              color: theme.darkMode ? '#c4b5fd' : '#a16207',
              border: `1px solid ${theme.darkMode ? '#4338ca' : '#fde68a'}`,
            }}>
              {theme.darkMode ? t('🌙 داكن') : t('☀️ فاتح')}
            </span>
          </div>
        </Section>
      </div>
    </>
  );
}
