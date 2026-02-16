'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GXV_COLOR_THEMES, GxvColorTheme, gxvGetTheme } from '@/engine/gxvThemes';

interface GxvThemeCoreType {
  themeId: string;
  setThemeId: (id: string) => void;
  currentTheme: GxvColorTheme;
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
  colorThemes: GxvColorTheme[];
  loaded: boolean;
  saveToServer: () => Promise<void>;
}

const GxvThemeCtx = createContext<GxvThemeCoreType | null>(null);

function gxvSafeGet(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

export function GxvThemeCore({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('neon-violet');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('GX Vault');
  const [darkMode, setDarkMode] = useState(true);
  const [buttonRadius, setButtonRadius] = useState('12');
  const [headerStyle, setHeaderStyle] = useState('default');
  const [showBanner, setShowBanner] = useState(true);
  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [serverFetched, setServerFetched] = useState(false);

  // ─── 1. قراءة من localStorage كـ cache أولي ───
  useEffect(() => {
    setThemeId(gxvSafeGet('gxv_themeId', 'neon-violet'));
    setLogoPreview(localStorage.getItem('gxv_logo'));
    setStoreName(gxvSafeGet('gxv_storeName', 'GX Vault'));
    setDarkMode(gxvSafeGet('gxv_darkMode', 'true') === 'true');
    setButtonRadius(gxvSafeGet('gxv_buttonRadius', '12'));
    setHeaderStyle(gxvSafeGet('gxv_headerStyle', 'default'));
    setShowBanner(gxvSafeGet('gxv_showBanner', 'true') !== 'false');
    setFontFamily(gxvSafeGet('gxv_fontFamily', 'Tajawal'));
    setMounted(true);
  }, []);

  // ─── 2. جلب التخصيص من الباك اند ───
  useEffect(() => {
    if (!mounted || serverFetched) return;
    async function fetchConfig() {
      try {
        const token = localStorage.getItem('admin_key') || localStorage.getItem('auth_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const customRes = await fetch('/api/customization', { headers });
        if (customRes.ok) {
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
          try { localStorage.setItem('gxv_configTimestamp', String(Date.now())); } catch { /* ignore */ }
        }
      } catch {
        console.warn('[GxvThemeCore] فشل جلب التخصيص، استخدام الكاش');
      } finally {
        setLoaded(true);
        setServerFetched(true);
      }
    }
    fetchConfig();
  }, [mounted, serverFetched]);

  // ─── 3. حفظ في localStorage عند التغيير ───
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('gxv_themeId', themeId);
      if (logoPreview) localStorage.setItem('gxv_logo', logoPreview); else localStorage.removeItem('gxv_logo');
      localStorage.setItem('gxv_storeName', storeName);
      localStorage.setItem('gxv_darkMode', String(darkMode));
      localStorage.setItem('gxv_buttonRadius', buttonRadius);
      localStorage.setItem('gxv_headerStyle', headerStyle);
      localStorage.setItem('gxv_showBanner', String(showBanner));
      localStorage.setItem('gxv_fontFamily', fontFamily);
    } catch { /* ignore */ }
  }, [themeId, logoPreview, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, mounted]);

  // ─── 4. حفظ في الباكند ───
  const saveToServer = useCallback(async () => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('admin_key') || localStorage.getItem('auth_token'))
      : null;
    if (!token) return;
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

  const currentTheme = gxvGetTheme(themeId);

  return (
    <GxvThemeCtx.Provider value={{
      themeId, setThemeId, currentTheme,
      logoPreview, setLogoPreview,
      storeName, setStoreName,
      darkMode, setDarkMode,
      buttonRadius, setButtonRadius,
      headerStyle, setHeaderStyle,
      showBanner, setShowBanner,
      fontFamily, setFontFamily,
      colorThemes: GXV_COLOR_THEMES,
      loaded,
      saveToServer,
    }}>
      {children}
    </GxvThemeCtx.Provider>
  );
}

export function useGxvTheme() {
  const ctx = useContext(GxvThemeCtx);
  if (!ctx) throw new Error('useGxvTheme must be used within GxvThemeCore');
  return ctx;
}
