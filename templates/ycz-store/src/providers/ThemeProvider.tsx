'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { COLOR_THEMES, ColorTheme, getTheme } from '@/lib/themes';
import { translate, Language } from '@/lib/translations';
import { isDemoMode } from '@/lib/api';
import { demoSettings } from '@/lib/demoData';

interface ThemeContextType {
  themeId: string;
  setThemeId: (id: string) => void;
  currentTheme: ColorTheme;
  logoPreview: string | null;
  setLogoPreview: (url: string | null) => void;
  storeName: string;
  setStoreName: (name: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  buttonRadius: string;
  setButtonRadius: (v: string) => void;
  headerStyle: string;
  setHeaderStyle: (v: string) => void;
  showBanner: boolean;
  setShowBanner: (v: boolean) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  colorThemes: ColorTheme[];
  loaded: boolean;
  refetch: () => Promise<void>;
  // ─── Social links ───
  socialLinks: { whatsapp?: string; telegram?: string; facebook?: string; instagram?: string; twitter?: string };
  setSocialLinks: (v: { whatsapp?: string; telegram?: string; facebook?: string; instagram?: string; twitter?: string }) => void;
  // ─── Language support ───
  language: Language;
  setLanguage: (v: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
  dateLocale: string;
  // ─── Custom CSS & Footer ───
  customCss: string;
  setCustomCss: (v: string) => void;
  footerText: string;
  setFooterText: (v: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function safeGet(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('purple');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('المتجر');
  const [darkMode, setDarkMode] = useState(false);
  const [buttonRadius, setButtonRadius] = useState('14');
  const [headerStyle, setHeaderStyle] = useState('default');
  const [showBanner, setShowBanner] = useState(true);
  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [socialLinks, setSocialLinks] = useState<{ whatsapp?: string; telegram?: string; facebook?: string; instagram?: string; twitter?: string }>({});
  const [customCss, setCustomCss] = useState('');
  const [footerText, setFooterText] = useState('');
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('ycz_language');
        if (cached === 'en' || cached === 'ar') return cached;
      } catch { /* ignore */ }
      const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || '';
      if (browserLang.startsWith('ar')) return 'ar';
      return 'en';
    }
    return 'ar';
  });
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fetchIdRef = useRef(0);

  const isRTL = language === 'ar';
  const dateLocale = language === 'ar' ? 'ar-EG' : 'en-US';
  const t = useCallback((key: string) => translate(key, language), [language]);

  // ─── Update <html> lang & dir dynamically ───
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.lang = language;
    html.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.fontFamily = isRTL
      ? 'Tajawal, Cairo, sans-serif'
      : 'Inter, system-ui, -apple-system, sans-serif';
  }, [language, isRTL]);

  // ─── Apply dark mode class on <html> ───
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  // ─── Apply custom CSS dynamically ───
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let style = document.getElementById('ycz-custom-css') as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'ycz-custom-css';
      document.head.appendChild(style);
    }
    style.textContent = customCss || '';
  }, [customCss]);

  // ─── 1. قراءة من localStorage كـ cache أولي (سريع) ───
  useEffect(() => {
    setThemeId(safeGet('ycz_themeId', 'purple'));
    setLogoPreview(localStorage.getItem('ycz_logo'));
    setStoreName(safeGet('ycz_storeName', 'المتجر'));
    setDarkMode(safeGet('ycz_darkMode', 'false') === 'true');
    setButtonRadius(safeGet('ycz_buttonRadius', '14'));
    setHeaderStyle(safeGet('ycz_headerStyle', 'default'));
    setShowBanner(safeGet('ycz_showBanner', 'true') !== 'false');
    setFontFamily(safeGet('ycz_fontFamily', 'Tajawal'));
    setCustomCss(safeGet('ycz_customCss', ''));
    setFooterText(safeGet('ycz_footerText', ''));
    const cachedLang = safeGet('ycz_language', '');
    if (cachedLang === 'en' || cachedLang === 'ar') {
      setLanguage(cachedLang);
    } else {
      const bl = navigator.language || '';
      setLanguage(bl.startsWith('ar') ? 'ar' : 'en');
    }
    setMounted(true);
  }, []);

  // ─── 2. جلب التخصيص من الباك اند (مصدر الحقيقة) ───
  const fetchFromServer = useCallback(async () => {
    const myId = ++fetchIdRef.current;
    try {
      // في وضع الديمو نستخدم البيانات الوهمية مباشرة
      if (isDemoMode()) {
        const c = demoSettings;
        if (c.theme_id) setThemeId(c.theme_id);
        if (c.logo_url) setLogoPreview(c.logo_url);
        if (c.font_family) setFontFamily(c.font_family);
        if (c.dark_mode !== undefined) setDarkMode(!!c.dark_mode);
        if (c.button_radius) setButtonRadius(c.button_radius);
        if (c.header_style) setHeaderStyle(c.header_style);
        if (c.show_banner !== undefined) setShowBanner(!!c.show_banner);
        if (c.store_name) setStoreName(c.store_name);
        setLoaded(true);
        return;
      }

      const adminToken = localStorage.getItem('admin_key');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

      const customRes = await fetch(`/api/customization/store?_t=${Date.now()}`, { headers, cache: 'no-store' });
      if (customRes.ok && myId === fetchIdRef.current) {
        const data = await customRes.json();
        const c = data.customization || data;
        if (c.theme_id) setThemeId(c.theme_id);
        if (c.logo_url) setLogoPreview(c.logo_url);
        if (c.font_family) setFontFamily(c.font_family);
        if (c.dark_mode !== undefined) setDarkMode(!!c.dark_mode);
        if (c.button_radius) setButtonRadius(c.button_radius);
        if (c.header_style) setHeaderStyle(c.header_style);
        if (c.show_banner !== undefined) setShowBanner(!!c.show_banner);
        if (c.store_name) setStoreName(c.store_name);
        if (c.custom_css !== undefined) setCustomCss(c.custom_css || '');
        if (c.footer_text !== undefined) setFooterText(c.footer_text || '');
        if (c.social_links) {
          const sl = typeof c.social_links === 'string' ? JSON.parse(c.social_links) : c.social_links;
          setSocialLinks(sl);
        }
        if (c.store_language === 'en' || c.store_language === 'ar') setLanguage(c.store_language);
        try {
          localStorage.setItem('ycz_configTimestamp', String(Date.now()));
        } catch { /* ignore */ }
      }
    } catch {
      console.warn('[ThemeProvider] فشل جلب التخصيص من الخادم، استخدام الكاش المحلي');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchFromServer();
  }, [mounted, fetchFromServer]);

  // ─── 3. حفظ في localStorage عند التغيير (للكاش) ───
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('ycz_themeId', themeId);
      if (logoPreview) localStorage.setItem('ycz_logo', logoPreview); else localStorage.removeItem('ycz_logo');
      localStorage.setItem('ycz_storeName', storeName);
      localStorage.setItem('ycz_darkMode', String(darkMode));
      localStorage.setItem('ycz_buttonRadius', buttonRadius);
      localStorage.setItem('ycz_headerStyle', headerStyle);
      localStorage.setItem('ycz_showBanner', String(showBanner));
      localStorage.setItem('ycz_fontFamily', fontFamily);
      localStorage.setItem('ycz_language', language);
      localStorage.setItem('ycz_customCss', customCss);
      localStorage.setItem('ycz_footerText', footerText);
    } catch { /* ignore */ }
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, language, customCss, footerText, mounted]);

  const currentTheme = getTheme(themeId);

  return (
    <ThemeContext.Provider value={{
      themeId, setThemeId, currentTheme,
      logoPreview, setLogoPreview,
      storeName, setStoreName,
      darkMode, setDarkMode,
      buttonRadius, setButtonRadius,
      headerStyle, setHeaderStyle,
      showBanner, setShowBanner,
      fontFamily, setFontFamily,
      socialLinks, setSocialLinks,
      customCss, setCustomCss,
      footerText, setFooterText,
      colorThemes: COLOR_THEMES,
      loaded,
      refetch: fetchFromServer,
      language, setLanguage, isRTL, t, dateLocale,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
