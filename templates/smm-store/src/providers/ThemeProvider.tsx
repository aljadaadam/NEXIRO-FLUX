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
  socialLinks: { whatsapp?: string; telegram?: string; facebook?: string; instagram?: string; twitter?: string };
  setSocialLinks: (v: { whatsapp?: string; telegram?: string; facebook?: string; instagram?: string; twitter?: string }) => void;
  language: Language;
  setLanguage: (v: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
  dateLocale: string;
  customCss: string;
  setCustomCss: (v: string) => void;
  footerText: string;
  setFooterText: (v: string) => void;
  productLayout: string;
  setProductLayout: (v: string) => void;
  formatPrice: (amount: number | string) => string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function safeGet(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(() => safeGet('smm_themeId', 'neon-blue'));
  const [logoPreview, setLogoPreview] = useState<string | null>(() => {
    try { return typeof window !== 'undefined' ? localStorage.getItem('smm_logo') : null; } catch { return null; }
  });
  const [storeName, setStoreName] = useState(() => safeGet('smm_storeName', 'SMM Boost'));
  const [darkMode, setDarkMode] = useState(() => safeGet('smm_darkMode', 'true') === 'true');
  const [buttonRadius, setButtonRadius] = useState(() => safeGet('smm_buttonRadius', '16'));
  const [headerStyle, setHeaderStyle] = useState(() => safeGet('smm_headerStyle', 'glass'));
  const [showBanner, setShowBanner] = useState(() => safeGet('smm_showBanner', 'true') !== 'false');
  const [fontFamily, setFontFamily] = useState(() => safeGet('smm_fontFamily', 'Tajawal'));
  const [socialLinks, setSocialLinks] = useState<{ whatsapp?: string; telegram?: string; facebook?: string; instagram?: string; twitter?: string }>({});
  const [customCss, setCustomCss] = useState(() => safeGet('smm_customCss', ''));
  const [footerText, setFooterText] = useState(() => safeGet('smm_footerText', ''));
  const [productLayout, setProductLayout] = useState(() => safeGet('smm_productLayout', 'grid'));
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('smm_language');
        if (cached === 'en' || cached === 'ar') return cached;
      } catch { /* ignore */ }
      const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || '';
      if (browserLang.startsWith('ar')) return 'ar';
      return 'ar';
    }
    return 'ar';
  });
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
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (darkMode) { html.classList.add('dark'); } else { html.classList.remove('dark'); }
  }, [darkMode]);

  // ─── Persist state to localStorage ───
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('smm_themeId', themeId);
      localStorage.setItem('smm_storeName', storeName);
      localStorage.setItem('smm_darkMode', String(darkMode));
      localStorage.setItem('smm_buttonRadius', buttonRadius);
      localStorage.setItem('smm_headerStyle', headerStyle);
      localStorage.setItem('smm_showBanner', String(showBanner));
      localStorage.setItem('smm_fontFamily', fontFamily);
      localStorage.setItem('smm_language', language);
      localStorage.setItem('smm_customCss', customCss);
      localStorage.setItem('smm_footerText', footerText);
      localStorage.setItem('smm_productLayout', productLayout);
      if (logoPreview) localStorage.setItem('smm_logo', logoPreview);
      else localStorage.removeItem('smm_logo');
    } catch { /* ignore */ }
  }, [mounted, themeId, storeName, darkMode, buttonRadius, headerStyle, showBanner, fontFamily, language, customCss, footerText, productLayout, logoPreview]);

  const fetchCustomization = useCallback(async () => {
    const id = ++fetchIdRef.current;
    try {
      if (isDemoMode()) {
        if (id !== fetchIdRef.current) return;
        setLoaded(true);
        return;
      }
      const res = await fetch('/api/customization/store', { cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) { setLoaded(true); return; }
      const data = await res.json();
      if (id !== fetchIdRef.current) return;
      const c = data?.customization;
      if (c) {
        if (c.theme_id) setThemeId(c.theme_id);
        if (c.store_name) setStoreName(c.store_name);
        if (c.logo_url) setLogoPreview(c.logo_url);
        if (c.dark_mode !== undefined) setDarkMode(!!c.dark_mode);
        if (c.button_radius) setButtonRadius(String(c.button_radius));
        if (c.header_style) setHeaderStyle(c.header_style);
        if (c.show_banner !== undefined) setShowBanner(!!c.show_banner);
        if (c.font_family) setFontFamily(c.font_family);
        if (c.social_links) setSocialLinks(typeof c.social_links === 'string' ? JSON.parse(c.social_links) : c.social_links);
        if (c.custom_css) setCustomCss(c.custom_css);
        if (c.footer_text) setFooterText(c.footer_text);
        if (c.product_layout) setProductLayout(c.product_layout);
      }
      setLoaded(true);
    } catch {
      if (id === fetchIdRef.current) setLoaded(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchCustomization();
  }, [fetchCustomization]);

  const currentTheme = getTheme(themeId);

  const formatPrice = (amount: number | string) => {
    const n = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return `$${n.toFixed(2)}`;
  };

  const value: ThemeContextType = {
    themeId, setThemeId,
    currentTheme,
    logoPreview, setLogoPreview,
    storeName, setStoreName,
    darkMode, setDarkMode,
    buttonRadius, setButtonRadius,
    headerStyle, setHeaderStyle,
    showBanner, setShowBanner,
    fontFamily, setFontFamily,
    colorThemes: COLOR_THEMES,
    loaded,
    refetch: fetchCustomization,
    socialLinks, setSocialLinks,
    language, setLanguage,
    isRTL, t, dateLocale,
    customCss, setCustomCss,
    footerText, setFooterText,
    productLayout, setProductLayout,
    formatPrice,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
