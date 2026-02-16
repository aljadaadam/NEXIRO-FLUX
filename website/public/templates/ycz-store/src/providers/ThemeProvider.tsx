'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { COLOR_THEMES, ColorTheme, getTheme } from '@/lib/themes';

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
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fetchIdRef = useRef(0);

  // ─── 1. قراءة من localStorage كـ cache أولي (سريع)  ───
  useEffect(() => {
    setThemeId(safeGet('ycz_themeId', 'purple'));
    setLogoPreview(localStorage.getItem('ycz_logo'));
    setStoreName(safeGet('ycz_storeName', 'المتجر'));
    setDarkMode(safeGet('ycz_darkMode', 'false') === 'true');
    setButtonRadius(safeGet('ycz_buttonRadius', '14'));
    setHeaderStyle(safeGet('ycz_headerStyle', 'default'));
    setShowBanner(safeGet('ycz_showBanner', 'true') !== 'false');
    setFontFamily(safeGet('ycz_fontFamily', 'Tajawal'));
    setMounted(true);
  }, []);

  // ─── 2. جلب التخصيص من الباك اند (مصدر الحقيقة) ───
  const fetchFromServer = useCallback(async () => {
    const myId = ++fetchIdRef.current;
    try {
      const token = localStorage.getItem('admin_key') || localStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // جلب التخصيص (ألوان، خط، تخطيط) — بدون كاش
      const customRes = await fetch(`/api/customization?_t=${Date.now()}`, { headers, cache: 'no-store' });
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
        // حفظ في localStorage كـ cache
        try {
          localStorage.setItem('ycz_configTimestamp', String(Date.now()));
        } catch { /* ignore */ }
      }
    } catch {
      // إذا فشل الـ API — نبقى على localStorage cache
      console.warn('[ThemeProvider] فشل جلب التخصيص من الخادم، استخدام الكاش المحلي');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchFromServer();
  }, [mounted, fetchFromServer]);

  // ─── 3. حفظ في localStorage عند التغيير (للكاش + الأدمن) ───
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
    } catch { /* ignore */ }
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, mounted]);

  // ─── 4. حفظ التخصيص في الباك اند عند التعديل من الأدمن ───
  const saveToServer = useCallback(async () => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('admin_key') || localStorage.getItem('auth_token'))
      : null;
    if (!token) return; // فقط الأدمن يحفظ
    try {
      await fetch('/api/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          theme_id: themeId,
          logo_url: logoPreview,
          font_family: fontFamily,
          dark_mode: darkMode,
          button_radius: buttonRadius,
          header_style: headerStyle,
          show_banner: showBanner,
          store_name: storeName,
        }),
      });
    } catch { /* silent */ }
  }, [themeId, logoPreview, fontFamily, darkMode, buttonRadius, headerStyle, showBanner, storeName]);

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
      colorThemes: COLOR_THEMES,
      loaded,
      refetch: fetchFromServer,
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
