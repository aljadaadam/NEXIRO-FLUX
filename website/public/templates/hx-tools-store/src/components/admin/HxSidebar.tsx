'use client';

import { LayoutDashboard, Package, ShoppingCart, Users, CreditCard, MapPin, DollarSign, Palette, Bell, Settings, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { HxColorTheme } from '@/lib/hxThemes';

interface HxSidebarProps {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  theme: HxColorTheme;
  darkMode: boolean;
  isRTL: boolean;
  t: (s: string) => string;
  onLogout: () => void;
}

const hxMenuItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
  { id: 'products', icon: Package, label: 'المنتجات' },
  { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
  { id: 'customers', icon: Users, label: 'العملاء' },
  { id: 'payments', icon: CreditCard, label: 'بوابات الدفع' },
  { id: 'delivery', icon: MapPin, label: 'مناطق التوصيل' },
  { id: 'currencies', icon: DollarSign, label: 'العملات' },
  { id: 'customize', icon: Palette, label: 'التخصيص' },
  { id: 'announcements', icon: Bell, label: 'الإعلانات' },
  { id: 'settings', icon: Settings, label: 'الإعدادات' },
];

export default function HxSidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen, theme, darkMode, isRTL, t, onLogout }: HxSidebarProps) {
  const bg = darkMode ? '#0f172a' : '#fff';
  const border = darkMode ? '#1e293b' : '#f1f5f9';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const subtext = darkMode ? '#64748b' : '#94a3b8';

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 12px' : '20px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && <span style={{ fontSize: 18, fontWeight: 900, color: theme.primary }}>🔧 HX Admin</span>}
        {collapsed && <span style={{ fontSize: 22 }}>🔧</span>}
        <button className="hx-sidebar-close-mobile" onClick={() => setMobileOpen(false)} style={{ display: 'none', background: 'none', border: 'none', color: subtext, cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {hxMenuItems.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
              title={collapsed ? t(item.label) : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 14px', marginBottom: 2,
                border: 'none', borderRadius: 10, cursor: 'pointer',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? `${theme.primary}12` : 'transparent',
                color: active ? theme.primary : text,
                fontWeight: active ? 700 : 500, fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={18} />
              {!collapsed && <span>{t(item.label)}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse + Logout */}
      <div style={{ padding: '12px 8px', borderTop: `1px solid ${border}` }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hx-sidebar-collapse-btn"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px 0' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            background: 'transparent', color: subtext, fontSize: 13,
          }}
        >
          {isRTL ? (collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />) : (collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />)}
          {!collapsed && <span>{t('طي القائمة')}</span>}
        </button>

        {!collapsed && (
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', border: 'none', borderRadius: 10,
              cursor: 'pointer', background: '#ef444412', color: '#ef4444',
              fontSize: 13, fontWeight: 600, marginTop: 4,
            }}
          >
            <LogOut size={18} />
            <span>{t('تسجيل الخروج')}</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hx-sidebar-desktop"
        style={{
          position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0, bottom: 0,
          width: collapsed ? 70 : 260, background: bg, borderLeft: isRTL ? 'none' : `1px solid ${border}`,
          borderRight: isRTL ? `1px solid ${border}` : 'none',
          transition: 'width 0.2s ease', zIndex: 40, overflowX: 'hidden',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="hx-sidebar-mobile-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className="hx-sidebar-mobile"
        style={{
          position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: mobileOpen ? 0 : -280, bottom: 0,
          width: 260, background: bg, zIndex: 51, transition: 'all 0.3s ease',
          boxShadow: mobileOpen ? '0 0 30px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
