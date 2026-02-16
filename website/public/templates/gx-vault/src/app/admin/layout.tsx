'use client';

import { useState, useEffect } from 'react';
import GxvCockpitHeader from '@/elements/cockpit/GxvCockpitHeader';
import GxvCockpitSidebar from '@/elements/cockpit/GxvCockpitSidebar';
import GxvOverviewPanel from './panels/GxvOverviewPanel';
import GxvProductsPanel from './panels/GxvProductsPanel';
import GxvOrdersPanel from './panels/GxvOrdersPanel';
import GxvUsersPanel from './panels/GxvUsersPanel';
import GxvPaymentsPanel from './panels/GxvPaymentsPanel';
import GxvSourcesPanel from './panels/GxvSourcesPanel';
import GxvCustomizePanel from './panels/GxvCustomizePanel';
import GxvAnnouncementsPanel from './panels/GxvAnnouncementsPanel';
import GxvSettingsPanel from './panels/GxvSettingsPanel';

const GXV_PAGE_LABELS: Record<string, string> = {
  overview: 'نظرة عامة',
  products: 'إدارة المنتجات',
  orders: 'إدارة الطلبات',
  users: 'إدارة المستخدمين',
  payments: 'بوابات الدفع',
  sources: 'المصادر الخارجية',
  customize: 'تخصيص المتجر',
  announcements: 'الإعلانات',
  settings: 'الإعدادات',
};

const GXV_PANELS: Record<string, React.ComponentType> = {
  overview: GxvOverviewPanel,
  products: GxvProductsPanel,
  orders: GxvOrdersPanel,
  users: GxvUsersPanel,
  payments: GxvPaymentsPanel,
  sources: GxvSourcesPanel,
  customize: GxvCustomizePanel,
  announcements: GxvAnnouncementsPanel,
  settings: GxvSettingsPanel,
};

export default function GxvAdminLayout({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState('overview');
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_key');
    if (!token) {
      window.location.href = '/login';
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#050510', color: '#555577',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          animation: 'gxvSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes gxvSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const ActivePanel = GXV_PANELS[currentPage] || GxvOverviewPanel;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#050510',
      direction: 'rtl',
    }}>
      <GxvCockpitSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <GxvCockpitHeader currentPage={currentPage} pageLabels={GXV_PAGE_LABELS} />

        <main style={{
          flex: 1, padding: '24px',
          paddingBottom: 80,
          overflow: 'auto',
        }}>
          <ActivePanel />
        </main>
      </div>
    </div>
  );
}
