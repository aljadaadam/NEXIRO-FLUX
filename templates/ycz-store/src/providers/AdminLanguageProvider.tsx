'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import adminEn from '@/lib/adminEn';

type AdminLang = 'ar' | 'en';

interface AdminLanguageContextValue {
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue>({
  lang: 'ar',
  setLang: () => {},
  t: (k) => k,
  isRTL: true,
});

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('ar');

  // Load saved language preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_lang') as AdminLang | null;
      if (saved === 'en' || saved === 'ar') setLangState(saved);
    } catch {}
  }, []);

  const setLang = useCallback((l: AdminLang) => {
    setLangState(l);
    try { localStorage.setItem('admin_lang', l); } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    if (lang === 'ar') return key;
    return adminEn[key] || key;
  }, [lang]);

  const isRTL = lang === 'ar';

  return (
    <AdminLanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLang() {
  return useContext(AdminLanguageContext);
}
