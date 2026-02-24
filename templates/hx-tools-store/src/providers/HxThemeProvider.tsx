'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { HX_COLOR_THEMES, HxColorTheme, getHxTheme } from '@/lib/hxThemes';
import { hxTranslate, HxLanguage } from '@/lib/hxTranslations';
import { HxCurrency, HxCartItem, HxDeliveryZone } from '@/lib/hxTypes';

interface HxThemeContextType {
  themeId: string;
  setThemeId: (id: string) => void;
  currentTheme: HxColorTheme;
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
  colorThemes: HxColorTheme[];
  loaded: boolean;
  refetch: () => Promise<void>;
  language: HxLanguage;
  isRTL: boolean;
  t: (key: string) => string;
  dateLocale: string;
  // Cart
  cart: HxCartItem[];
  addToCart: (item: HxCartItem) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  // Currency
  currencies: HxCurrency[];
  activeCurrency: HxCurrency;
  setActiveCurrency: (code: string) => void;
  formatPrice: (usdPrice: number) => string;
  // Delivery
  deliveryZones: HxDeliveryZone[];
}

const HxThemeContext = createContext<HxThemeContextType | null>(null);

function hxSafeGet(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

const DEFAULT_CURRENCIES: HxCurrency[] = [
  { id: 1, code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 1, is_default: true },
  { id: 2, code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 3.75, is_default: false },
  { id: 3, code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 3.67, is_default: false },
  { id: 4, code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 50.5, is_default: false },
  { id: 5, code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع', rate: 1310, is_default: false },
];

const DEFAULT_DELIVERY_ZONES: HxDeliveryZone[] = [];

export function HxThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('tech-blue');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('HX Tools');
  const [darkMode, setDarkMode] = useState(false);
  const [buttonRadius, setButtonRadius] = useState('12');
  const [headerStyle, setHeaderStyle] = useState('default');
  const [showBanner, setShowBanner] = useState(true);
  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [language, setLanguage] = useState<HxLanguage>('ar');
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fetchIdRef = useRef(0);

  // Cart state
  const [cart, setCart] = useState<HxCartItem[]>([]);

  // Currency state
  const [currencies, setCurrencies] = useState<HxCurrency[]>(DEFAULT_CURRENCIES);
  const [activeCurrencyCode, setActiveCurrencyCode] = useState('USD');

  // Delivery zones
  const [deliveryZones, setDeliveryZones] = useState<HxDeliveryZone[]>(DEFAULT_DELIVERY_ZONES);

  const isRTL = language === 'ar';
  const dateLocale = language === 'ar' ? 'ar-EG' : 'en-US';
  const t = useCallback((key: string) => hxTranslate(key, language), [language]);

  const activeCurrency = currencies.find(c => c.code === activeCurrencyCode) || currencies[0];

  const formatPrice = useCallback((usdPrice: number) => {
    const converted = usdPrice * activeCurrency.rate;
    const formatted = activeCurrency.rate >= 100 ? Math.round(converted).toLocaleString() : converted.toFixed(2);
    return isRTL ? `${formatted} ${activeCurrency.symbol}` : `${activeCurrency.symbol}${formatted}`;
  }, [activeCurrency, isRTL]);

  // Cart functions
  const addToCart = useCallback((item: HxCartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === item.product.id);
      if (existing) {
        return prev.map(c => c.product.id === item.product.id ? { ...c, quantity: c.quantity + item.quantity } : c);
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.product.id !== productId));
    } else {
      setCart(prev => prev.map(c => c.product.id === productId ? { ...c, quantity: qty } : c));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem('hx_cart', JSON.stringify(cart)); } catch {}
    }
  }, [cart, mounted]);

  // Update HTML lang & dir
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.lang = language;
    html.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.fontFamily = isRTL
      ? `${fontFamily}, Cairo, sans-serif`
      : 'Inter, system-ui, -apple-system, sans-serif';
  }, [language, isRTL, fontFamily]);

  // Read from localStorage as initial cache
  useEffect(() => {
    setThemeId(hxSafeGet('hx_themeId', 'tech-blue'));
    setLogoPreview(localStorage.getItem('hx_logo'));
    setStoreName(hxSafeGet('hx_storeName', 'HX Tools'));
    setDarkMode(hxSafeGet('hx_darkMode', 'false') === 'true');
    setButtonRadius(hxSafeGet('hx_buttonRadius', '12'));
    setHeaderStyle(hxSafeGet('hx_headerStyle', 'default'));
    setShowBanner(hxSafeGet('hx_showBanner', 'true') !== 'false');
    setFontFamily(hxSafeGet('hx_fontFamily', 'Tajawal'));
    const cachedLang = hxSafeGet('hx_language', 'ar');
    if (cachedLang === 'en' || cachedLang === 'ar') setLanguage(cachedLang);
    const cachedCur = hxSafeGet('hx_currency', 'USD');
    setActiveCurrencyCode(cachedCur);
    // Load cart
    try {
      const savedCart = localStorage.getItem('hx_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}
    setMounted(true);
  }, []);

  // Fetch customization from backend
  const fetchFromServer = useCallback(async () => {
    const myId = ++fetchIdRef.current;
    try {
      const adminToken = localStorage.getItem('hx_admin_key');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      const res = await fetch('/api/customization/store', { headers, cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (myId !== fetchIdRef.current) return;
      const c = data.customization || data;
      if (c.theme_id) { setThemeId(c.theme_id); localStorage.setItem('hx_themeId', c.theme_id); }
      if (c.store_name) { setStoreName(c.store_name); localStorage.setItem('hx_storeName', c.store_name); }
      if (c.logo_url) { setLogoPreview(c.logo_url); localStorage.setItem('hx_logo', c.logo_url); }
      if (c.dark_mode !== undefined) { setDarkMode(!!c.dark_mode); localStorage.setItem('hx_darkMode', String(!!c.dark_mode)); }
      if (c.button_radius) { setButtonRadius(c.button_radius); localStorage.setItem('hx_buttonRadius', c.button_radius); }
      if (c.header_style) { setHeaderStyle(c.header_style); localStorage.setItem('hx_headerStyle', c.header_style); }
      if (c.show_banner !== undefined) { setShowBanner(c.show_banner !== false); localStorage.setItem('hx_showBanner', String(c.show_banner !== false)); }
      if (c.font_family) { setFontFamily(c.font_family); localStorage.setItem('hx_fontFamily', c.font_family); }
      if (c.language && (c.language === 'ar' || c.language === 'en')) {
        setLanguage(c.language);
        localStorage.setItem('hx_language', c.language);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (mounted) fetchFromServer();
  }, [mounted, fetchFromServer]);

  const setActiveCurrency = useCallback((code: string) => {
    setActiveCurrencyCode(code);
    try { localStorage.setItem('hx_currency', code); } catch {}
  }, []);

  const currentTheme = getHxTheme(themeId);

  if (!mounted) return null;

  return (
    <HxThemeContext.Provider value={{
      themeId, setThemeId, currentTheme,
      logoPreview, setLogoPreview,
      storeName, setStoreName,
      darkMode, setDarkMode,
      buttonRadius, setButtonRadius,
      headerStyle, setHeaderStyle,
      showBanner, setShowBanner,
      fontFamily, setFontFamily,
      colorThemes: HX_COLOR_THEMES,
      loaded,
      refetch: fetchFromServer,
      language, isRTL, t, dateLocale,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
      currencies, activeCurrency, setActiveCurrency, formatPrice,
      deliveryZones,
    }}>
      {children}
    </HxThemeContext.Provider>
  );
}

export function useHxTheme() {
  const ctx = useContext(HxThemeContext);
  if (!ctx) throw new Error('useHxTheme must be used within HxThemeProvider');
  return ctx;
}
