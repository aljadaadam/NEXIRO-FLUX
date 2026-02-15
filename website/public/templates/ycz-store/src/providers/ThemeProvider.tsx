'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [buttonRadius, setButtonRadius] = useState('rounded');
  const [headerStyle, setHeaderStyle] = useState('sticky');
  const [showBanner, setShowBanner] = useState(true);
  const [fontFamily, setFontFamily] = useState('tajawal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeId(safeGet('ycz_themeId', 'purple'));
    setLogoPreview(localStorage.getItem('ycz_logo'));
    setStoreName(safeGet('ycz_storeName', 'المتجر'));
    setDarkMode(safeGet('ycz_darkMode', 'false') === 'true');
    setButtonRadius(safeGet('ycz_buttonRadius', 'rounded'));
    setHeaderStyle(safeGet('ycz_headerStyle', 'sticky'));
    setShowBanner(safeGet('ycz_showBanner', 'true') !== 'false');
    setFontFamily(safeGet('ycz_fontFamily', 'tajawal'));
    setMounted(true);
  }, []);

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
