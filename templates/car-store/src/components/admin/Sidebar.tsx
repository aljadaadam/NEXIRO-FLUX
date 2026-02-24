'use client';

import { useTheme } from '@/providers/ThemeProvider';
import {
  LayoutDashboard, Car, ShoppingCart, Users, MapPin,
  Palette, Settings, LogOut, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  open: boolean;
}

export default function Sidebar({ activePage, onNavigate, open }: SidebarProps) {
  const { currentTheme, darkMode, storeName, logoPreview, t } = useTheme();
  const accent = currentTheme.accent || '#e94560';
  const bg = darkMode ? '#0c0c1a' : '#fff';
  const textColor = darkMode ? '#fff' : '#1a1a2e';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('نظرة عامة') },
    { id: 'cars', icon: Car, label: t('إدارة السيارات') },
    { id: 'orders', icon: ShoppingCart, label: t('الطلبات') },
    { id: 'customers', icon: Users, label: t('العملاء') },
    { id: 'branches', icon: MapPin, label: t('إدارة الفروع') },
    { id: 'customize', icon: Palette, label: t('التخصيص') },
    { id: 'settings', icon: Settings, label: t('الإعدادات') },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    window.location.href = '/admin';
  };

  return (
    <aside className={`dash-sidebar ${open ? 'open' : ''}`} style={{
      background: bg,
      borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logoPreview ? (
            <img src={logoPreview} alt={storeName} style={{ height: 38, borderRadius: 10 }} />
          ) : (
            <div style={{ width: 42, height: 42, borderRadius: 14, background: currentTheme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={20} color="#fff" />
            </div>
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: textColor }}>{storeName}</div>
            <div style={{ fontSize: 11, color: mutedColor }}>{t('لوحة التحكم')}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '16px 0', flex: 1 }}>
        {menuItems.map(item => {
          const active = activePage === item.id;
          return (
            <div
              key={item.id}
              className="dash-sidebar-link"
              onClick={() => onNavigate(item.id)}
              style={{
                background: active ? `${accent}15` : 'transparent',
                color: active ? accent : textColor,
                fontWeight: active ? 700 : 500,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} style={{ marginInlineStart: 'auto', opacity: 0.5 }} />}
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="dash-sidebar-link" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <LogOut size={20} />
          <span>{t('تسجيل الخروج')}</span>
        </div>
      </div>
    </aside>
  );
}
