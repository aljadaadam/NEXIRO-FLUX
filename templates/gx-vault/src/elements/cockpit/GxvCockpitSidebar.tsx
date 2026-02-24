'use client';

import {
  LayoutDashboard, Package, ShoppingBag, Users, CreditCard,
  Globe, Palette, Megaphone, Settings, Gamepad2,
  ChevronRight, ChevronLeft,
} from 'lucide-react';
import { useGxvTheme } from '@/core/GxvThemeCore';
import { useState } from 'react';

const GXV_SIDEBAR_ITEMS = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
  { id: 'users', label: 'المستخدمين', icon: Users },
  { id: 'payments', label: 'المدفوعات', icon: CreditCard },
  { id: 'sources', label: 'المصادر', icon: Globe },
  { id: 'customize', label: 'التخصيص', icon: Palette },
  { id: 'announcements', label: 'الإعلانات', icon: Megaphone },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

interface GxvCockpitSidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function GxvCockpitSidebar({ currentPage, setCurrentPage }: GxvCockpitSidebarProps) {
  const { currentTheme, storeName, logoPreview } = useGxvTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="gxv-hide-mobile" style={{
        width: collapsed ? 72 : 240,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a1f 0%, #080818 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed', top: 0, right: 0, bottom: 0,
        zIndex: 40,
        overflow: 'hidden',
      }}>
        {/* Logo area */}
        <div style={{
          padding: collapsed ? '20px 12px' : '20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {logoPreview ? (
            <img src={logoPreview} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: currentTheme.gradient,
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}>
              <Gamepad2 size={17} color="#fff" />
            </div>
          )}
          {!collapsed && (
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', display: 'block' }}>{storeName}</span>
              <span style={{ fontSize: '0.65rem', color: '#555577' }}>لوحة التحكم</span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {GXV_SIDEBAR_ITEMS.map(item => {
            const active = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: 12,
                  background: active ? currentTheme.surface : 'transparent',
                  border: active ? `1px solid ${currentTheme.primary}25` : '1px solid transparent',
                  color: active ? currentTheme.primary : '#777799',
                  cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: active ? 700 : 500,
                  transition: 'all 0.2s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#aaaacc';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#777799';
                  }
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', right: collapsed ? '50%' : -10,
                    top: '50%', transform: collapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
                    width: 3, height: 20, borderRadius: 2,
                    background: currentTheme.primary,
                    display: collapsed ? 'none' : 'block',
                  }} />
                )}
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            margin: '10px', padding: '10px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#555577', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* Mobile Bottom Nav for Admin */}
      <nav className="gxv-hide-desktop" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(8,8,20,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '4px 4px 8px',
        display: 'flex',
        overflowX: 'auto',
      }}>
        {GXV_SIDEBAR_ITEMS.slice(0, 6).map(item => {
          const active = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
              flex: '1 0 auto', minWidth: 56,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 6px', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: active ? currentTheme.primary : '#555577',
            }}>
              <Icon size={18} />
              <span style={{ fontSize: '0.58rem', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Spacer for desktop sidebar */}
      <div className="gxv-hide-mobile" style={{ width: collapsed ? 72 : 240, flexShrink: 0, transition: 'width 0.3s' }} />
    </>
  );
}
