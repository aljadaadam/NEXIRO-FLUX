'use client';

import { Search, Bell, Menu, User } from 'lucide-react';
import type { ColorTheme } from '@/lib/themes';

interface DashHeaderProps {
  collapsed: boolean;
  onMenuToggle: () => void;
  theme: ColorTheme;
  logoPreview: string | null;
}

export default function DashHeader({ collapsed, onMenuToggle, theme, logoPreview }: DashHeaderProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #f1f5f9',
      padding: '0 1rem',
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile menu */}
        <button className="dash-menu-btn" onClick={onMenuToggle} style={{
          display: 'none', width: 38, height: 38, borderRadius: 10,
          border: '1px solid #f1f5f9', background: '#fff',
          cursor: 'pointer', placeItems: 'center',
        }}>
          <Menu size={18} color="#64748b" />
        </button>

        {/* Search */}
        <div className="dash-search" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.5rem 0.85rem', borderRadius: 10,
          background: '#f8fafc', border: '1px solid #f1f5f9',
          width: 240,
        }}>
          <Search size={15} color="#94a3b8" />
          <input placeholder="بحث..." style={{
            border: 'none', outline: 'none', width: '100%',
            fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif',
            background: 'transparent', color: '#334155',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notifications */}
        <button style={{
          width: 38, height: 38, borderRadius: 10,
          border: '1px solid #f1f5f9', background: '#fff',
          cursor: 'pointer', display: 'grid', placeItems: 'center',
          position: 'relative',
        }}>
          <Bell size={16} color="#64748b" />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: '#ef4444', border: '2px solid #fff',
          }} />
        </button>

        {/* Profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.35rem 0.5rem 0.35rem 0.85rem',
          borderRadius: 10, border: '1px solid #f1f5f9',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: theme.gradient,
            display: 'grid', placeItems: 'center',
          }}>
            <User size={14} color="#fff" />
          </div>
          <div className="dash-profile-text">
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0b1020', lineHeight: 1 }}>المدير</p>
            <p style={{ fontSize: '0.62rem', color: '#94a3b8' }}>admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
