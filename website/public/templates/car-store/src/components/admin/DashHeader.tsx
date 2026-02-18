'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Menu, Bell, Sun, Moon, Globe } from 'lucide-react';

interface DashHeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export default function DashHeader({ title, onToggleSidebar }: DashHeaderProps) {
  const { currentTheme, darkMode, setDarkMode, t } = useTheme();
  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0e0e1e' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';

  return (
    <div className="dash-header" style={{
      background: bg,
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onToggleSidebar} style={{
          padding: 10, borderRadius: 12,
          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: textColor, display: 'none',
        }}
          className="dash-sidebar-toggle">
          <Menu size={20} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: textColor }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          padding: 10, borderRadius: 12,
          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: textColor, display: 'flex',
        }}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div style={{
          padding: 10, borderRadius: 12, position: 'relative',
          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: textColor, display: 'flex', cursor: 'pointer',
        }}>
          <Bell size={18} />
          <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: accent }} />
        </div>
      </div>
    </div>
  );
}
