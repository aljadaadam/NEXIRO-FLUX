'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import adminEn from '@/lib/adminEn';

type Language = 'ar' | 'en';

interface AdminLangContextType {
  language: Language;
  setLanguage: (v: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const AdminLangContext = createContext<AdminLangContextType | null>(null);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('smm_admin_language');
        if (cached === 'en' || cached === 'ar') return cached;
      } catch { /* ignore */ }
    }
    return 'ar';
  });

  const isRTL = language === 'ar';

  const t = useCallback((key: string) => {
    if (language === 'ar') return key;
    return adminEn[key] || key;
  }, [language]);

  const handleSetLanguage = useCallback((v: Language) => {
    setLanguage(v);
    try { localStorage.setItem('smm_admin_language', v); } catch { /* ignore */ }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = v;
      document.documentElement.dir = v === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  return (
    <AdminLangContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error('useAdminLang must be used within AdminLanguageProvider');
  return ctx;
}
