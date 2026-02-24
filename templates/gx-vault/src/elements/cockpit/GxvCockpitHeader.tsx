'use client';

import { Bell, Search, User, Moon, Sun, LogOut, Gamepad2 } from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';

interface GxvCockpitHeaderProps {
  currentPage: string;
  pageLabels: Record<string, string>;
}

export default function GxvCockpitHeader({ currentPage, pageLabels }: GxvCockpitHeaderProps) {
  const { currentTheme, darkMode, setDarkMode, storeName } = useGxvTheme();

  return (
    <header style={{
      height: 64,
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(10,10,26,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: currentTheme.gradient,
          display: 'grid', placeItems: 'center',
        }}>
          <Gamepad2 size={16} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8e8ff', margin: 0 }}>
            {pageLabels[currentPage] || 'لوحة التحكم'}
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#555577' }}>{storeName}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#888', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#888', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          position: 'relative',
        }}>
          <Bell size={15} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 6, height: 6, borderRadius: '50%',
            background: '#ef4444',
          }} />
        </button>

        <button
          onClick={() => { localStorage.removeItem('admin_key'); window.location.href = '/login'; }}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: '#f87171', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
