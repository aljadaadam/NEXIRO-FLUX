'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { COLOR_THEMES, ColorTheme, getTheme } from '@/lib/themes';
import { translate, Language } from '@/lib/translations';

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
  language: Language;
  isRTL: boolean;
  t: (key: string) => string;
  dateLocale: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function safeGet(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

const PREFIX = 'car_';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('midnight');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('أوتو زون');
  const [darkMode, setDarkMode] = useState(true);
  const [buttonRadius, setButtonRadius] = useState('12');
  const [headerStyle, setHeaderStyle] = useState('default');
  const [showBanner, setShowBanner] = useState(true);
  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [language, setLanguage] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fetchIdRef = useRef(0);

  const isRTL = language === 'ar';
  const dateLocale = language === 'ar' ? 'ar-EG' : 'en-US';
  const t = useCallback((key: string) => translate(key, language), [language]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.lang = language;
    html.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.fontFamily = isRTL
      ? 'Tajawal, Cairo, sans-serif'
      : 'Inter, system-ui, -apple-system, sans-serif';
  }, [language, isRTL]);

  useEffect(() => {
    setThemeId(safeGet(`${PREFIX}themeId`, 'midnight'));
    setLogoPreview(localStorage.getItem(`${PREFIX}logo`));
    setStoreName(safeGet(`${PREFIX}storeName`, 'أوتو زون'));
    setDarkMode(safeGet(`${PREFIX}darkMode`, 'true') === 'true');
    setButtonRadius(safeGet(`${PREFIX}buttonRadius`, '12'));
    setHeaderStyle(safeGet(`${PREFIX}headerStyle`, 'default'));
    setShowBanner(safeGet(`${PREFIX}showBanner`, 'true') !== 'false');
    setFontFamily(safeGet(`${PREFIX}fontFamily`, 'Tajawal'));
    const cachedLang = safeGet(`${PREFIX}language`, 'ar');
    if (cachedLang === 'en' || cachedLang === 'ar') setLanguage(cachedLang);
    setMounted(true);
  }, []);

  const fetchFromServer = useCallback(async () => {
    const myId = ++fetchIdRef.current;
    try {
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
        if (c.store_language === 'en' || c.store_language === 'ar') setLanguage(c.store_language);
      }
    } catch {
      console.warn('[ThemeProvider] فشل جلب التخصيص من الخادم');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchFromServer();
  }, [mounted, fetchFromServer]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(`${PREFIX}themeId`, themeId);
      if (logoPreview) localStorage.setItem(`${PREFIX}logo`, logoPreview); else localStorage.removeItem(`${PREFIX}logo`);
      localStorage.setItem(`${PREFIX}storeName`, storeName);
      localStorage.setItem(`${PREFIX}darkMode`, String(darkMode));
      localStorage.setItem(`${PREFIX}buttonRadius`, buttonRadius);
      localStorage.setItem(`${PREFIX}headerStyle`, headerStyle);
      localStorage.setItem(`${PREFIX}showBanner`, String(showBanner));
      localStorage.setItem(`${PREFIX}fontFamily`, fontFamily);
      localStorage.setItem(`${PREFIX}language`, language);
    } catch { /* ignore */ }
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, language, mounted]);

  const saveToServer = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;
    if (!token) return;
    try {
      await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          theme_id: themeId, logo_url: logoPreview, store_name: storeName,
          dark_mode: darkMode, button_radius: buttonRadius, header_style: headerStyle,
          show_banner: showBanner, font_family: fontFamily, store_language: language,
        }),
      });
    } catch { /* ignore */ }
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, language]);

  useEffect(() => {
    if (!mounted || !loaded) return;
    const adminKey = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;
    if (!adminKey) return;
    const timer = setTimeout(() => saveToServer(), 600);
    return () => clearTimeout(timer);
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, language, mounted, loaded, saveToServer]);

  const currentTheme = getTheme(themeId);

  return (
    <ThemeContext.Provider value={{
      themeId, setThemeId, currentTheme, logoPreview, setLogoPreview,
      storeName, setStoreName, darkMode, setDarkMode, buttonRadius, setButtonRadius,
      headerStyle, setHeaderStyle, showBanner, setShowBanner, fontFamily, setFontFamily,
      colorThemes: COLOR_THEMES, loaded, refetch: fetchFromServer,
      language, isRTL, t, dateLocale,
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
