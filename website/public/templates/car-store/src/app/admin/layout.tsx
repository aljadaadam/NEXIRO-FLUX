'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import Sidebar from '@/components/admin/Sidebar';
import DashHeader from '@/components/admin/DashHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bg = darkMode ? '#0a0a12' : '#f5f5fa';

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {children}
    </div>
  );
}
