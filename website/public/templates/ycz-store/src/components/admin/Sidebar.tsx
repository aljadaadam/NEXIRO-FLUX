'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  Link2, Paintbrush, Megaphone, BookOpen, MessageCircle, Settings, ChevronRight, ChevronLeft,
  Zap, LogOut, X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  theme: ColorTheme;
  logoPreview: string | null;
  storeName: string;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
  { id: 'products', icon: Package, label: 'المنتجات' },
  { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
  { id: 'users', icon: Users, label: 'المستخدمين' },
  { id: 'payments', icon: CreditCard, label: 'المدفوعات' },
  { id: 'sources', icon: Link2, label: 'المصادر' },
  { id: 'customize', icon: Paintbrush, label: 'التخصيص' },
  { id: 'announcements', icon: Megaphone, label: 'الإعلانات' },
  { id: 'blog', icon: BookOpen, label: 'المدونة' },
  { id: 'chat', icon: MessageCircle, label: 'الدردشة' },
  { id: 'settings', icon: Settings, label: 'الإعدادات' },
];

export default function Sidebar({
  currentPage, setCurrentPage, collapsed, setCollapsed,
  mobileOpen, onCloseMobile, theme, logoPreview, storeName, onLogout,
}: SidebarProps) {
  const [chatUnread, setChatUnread] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await adminApi.getChatUnread() as { unread?: number; totalUnread?: number };
      setChatUnread(res?.unread || res?.totalUnread || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchUnread();
    pollRef.current = setInterval(fetchUnread, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchUnread]);

  return (
    <aside
      className={`dash-sidebar ${mobileOpen ? 'dash-sidebar-open' : ''}`}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: collapsed ? 70 : 260,
        background: '#fff',
        borderLeft: '1px solid #f1f5f9',
        transition: 'all 0.3s',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoPreview ? (
            <img src={logoPreview} alt="logo" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: theme.gradient,
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Zap size={16} color="#fff" />
            </div>
          )}
          {!collapsed && (
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1020' }}>{storeName}</span>
          )}
        </div>
        <button
          className="dash-mobile-close"
          onClick={onCloseMobile}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1px solid #f1f5f9',
            background: '#fff',
            cursor: 'pointer',
            display: 'none',
            placeItems: 'center',
          }}
          aria-label="إغلاق القائمة"
        >
          <X size={14} color="#64748b" />
        </button>
        <button className="dash-collapse-btn" onClick={() => setCollapsed(!collapsed)} style={{
          width: 28, height: 28, borderRadius: 6,
          border: '1px solid #f1f5f9', background: '#fff',
          cursor: 'pointer', display: collapsed ? 'none' : 'grid',
          placeItems: 'center',
        }}>
          <ChevronRight size={14} color="#94a3b8" />
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                display: 'flex', alignItems: 'center',
                gap: 10,
                padding: collapsed ? '0.65rem' : '0.65rem 1rem',
                borderRadius: 10, border: 'none',
                background: active ? `${theme.primary}12` : 'transparent',
                color: active ? theme.primary : '#64748b',
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                fontSize: '0.85rem', fontWeight: active ? 700 : 500,
                transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                textAlign: 'right',
                position: 'relative',
              }}>
                <Icon size={18} />
                {!collapsed && <span style={{flex:1,textAlign:'right'}}>{item.label}</span>}
                {item.id === 'chat' && chatUnread > 0 && (
                  <span style={{
                    minWidth: collapsed ? 16 : 20, height: collapsed ? 16 : 20,
                    borderRadius: 10, background: '#ef4444', color: '#fff',
                    fontSize: collapsed ? '.55rem' : '.65rem', fontWeight: 700,
                    display: 'grid', placeItems: 'center', padding: '0 4px',
                    fontFamily: 'system-ui', lineHeight: 1,
                    position: collapsed ? 'absolute' as const : 'static' as const,
                    top: collapsed ? 4 : undefined, left: collapsed ? 4 : undefined,
                  }}>{chatUnread}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      {!collapsed && (
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '0.6rem 1rem',
            borderRadius: 10, border: 'none',
            background: '#fef2f2', color: '#dc2626',
            fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
          }}>
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      )}
    </aside>
  );
}
