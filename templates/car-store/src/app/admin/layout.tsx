'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const bg = darkMode ? '#0a0a12' : '#f5f5fa';

  useEffect(() => {
    // Demo mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' || sessionStorage.getItem('demo_mode') === '1') {
      setAuthed(true);
      return;
    }
    const key = localStorage.getItem('admin_key');
    setAuthed(!!key);
  }, []);

  if (authed === null) {
    return <div style={{ background: bg, minHeight: '100vh' }} />;
  }

  if (!authed) {
    // page.tsx handles the login UI, just render it
    return <div style={{ background: bg, minHeight: '100vh' }}>{children}</div>;
  }

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {children}
    </div>
  );
}
