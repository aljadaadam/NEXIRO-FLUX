'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { HxColorTheme } from '@/lib/hxThemes';

interface HxDashHeaderProps {
  onMenuToggle: () => void;
  theme: HxColorTheme;
  darkMode: boolean;
  t: (s: string) => string;
}

export default function HxDashHeader({ onMenuToggle, theme, darkMode, t }: HxDashHeaderProps) {
  const bg = darkMode ? '#0f172aee' : '#ffffffee';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#64748b' : '#94a3b8';
  const border = darkMode ? '#1e293b' : '#f1f5f9';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: bg, backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${border}`,
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="hx-dash-menu-btn"
          onClick={onMenuToggle}
          style={{ display: 'none', background: 'none', border: 'none', color: text, cursor: 'pointer', padding: 4 }}
        >
          <Menu size={22} />
        </button>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: subtext }} />
          <input
            placeholder={t('بحث...')}
            style={{
              paddingRight: 36, paddingLeft: 14, height: 38,
              border: `1px solid ${border}`, borderRadius: 10,
              background: darkMode ? '#1e293b' : '#f8fafc',
              color: text, fontSize: 13, outline: 'none', width: 220,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button style={{
          position: 'relative', background: 'none', border: 'none',
          color: subtext, cursor: 'pointer', padding: 6,
        }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 8, height: 8,
            borderRadius: '50%', background: '#ef4444',
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>
            A
          </div>
          <div className="hx-dash-profile-text">
            <div style={{ fontSize: 13, fontWeight: 700, color: text }}>{t('المدير')}</div>
            <div style={{ fontSize: 11, color: subtext }}>admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
