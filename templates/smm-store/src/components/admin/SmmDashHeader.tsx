'use client';

import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import type { ColorTheme } from '@/lib/themes';

interface SmmDashHeaderProps {
  onMenuToggle: () => void;
  theme: ColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
  onToggleDark?: () => void;
}

export default function SmmDashHeader({ onMenuToggle, theme, darkMode, t, onToggleDark }: SmmDashHeaderProps) {
  const bg = darkMode ? '#0a0e1aee' : '#ffffffee';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#64748b' : '#94a3b8';
  const border = darkMode ? '#1a1f35' : '#f1f5f9';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: bg, backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${border}`,
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="smm-dash-menu-btn"
          onClick={onMenuToggle}
          style={{ display: 'none', background: 'none', border: 'none', color: text, cursor: 'pointer', padding: 4 }}
        >
          <Menu size={22} />
        </button>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            right: 12, color: subtext,
          }} />
          <input
            placeholder={t('بحث...')}
            style={{
              paddingRight: 36, paddingLeft: 14, height: 38,
              border: `1px solid ${border}`, borderRadius: 10,
              background: darkMode ? '#141830' : '#f8fafc',
              color: text, fontSize: 13, outline: 'none', width: 220,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            style={{
              background: 'none', border: 'none', color: subtext,
              cursor: 'pointer', padding: 6, borderRadius: 8,
            }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <button style={{
          position: 'relative', background: 'none', border: 'none',
          color: subtext, cursor: 'pointer', padding: 6,
        }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 8, height: 8,
            borderRadius: '50%', background: theme.primary,
            boxShadow: `0 0 6px ${theme.primary}`,
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: theme.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
            boxShadow: theme.glow,
          }}>
            A
          </div>
          <div className="smm-dash-profile-text">
            <div style={{ fontSize: 13, fontWeight: 700, color: text }}>{t('المدير')}</div>
            <div style={{ fontSize: 11, color: subtext }}>admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
