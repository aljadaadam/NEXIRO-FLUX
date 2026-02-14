// src/components/layout/AppLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLanguage } from '../../context/LanguageContext';

const AppLayout = ({ children }) => {
  const { dir, theme } = useLanguage();
  
  // حالة للكمبيوتر: تحكم في collapse/expand
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // حالة للموبايل: تحكم في فتح/إغلاق الـ Drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div 
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-primary)' }}
    >
      {/* الشريط الجانبي - يتبع اتجاه اللغة */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />
      
      {/* حاوية المحتوى الرئيسي - margins فقط على lg screens (desktop) */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden ${
          sidebarCollapsed 
            ? (dir === 'rtl' ? 'lg:mr-20' : 'lg:ml-20') 
            : (dir === 'rtl' ? 'lg:mr-64' : 'lg:ml-64')
        }`}
      >
        {/* رأس الصفحة مع زر التحكم بالشريط الجانبي */}
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
          mobileSidebarOpen={mobileSidebarOpen}
        />
        
        {/* محتوى الصفحة الفعلي */}
        <main 
          className={`flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6 ${
            dir === 'rtl' ? 'text-right' : 'text-left'
          } transition-opacity duration-500 animate-fadeIn`}
          style={{ backgroundColor: 'var(--page-bg)' }}
        >
          {children}
        </main>
        
        {/* تذييل الصفحة */}
        <footer className={`py-3 sm:py-4 lg:py-4 px-3 sm:px-4 lg:px-6 text-center text-xs sm:text-sm border-t transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-gray-400' 
            : 'bg-white border-gray-200 text-gray-500'
        } ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <p>© 2026 Nexiro Flux. {dir === 'rtl' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'} إصدار 3.0.0</p>
          <p className="mt-1">
            {dir === 'rtl' 
              ? 'لوحة تحكم متقدمة لإدارة خدمات المنتجات الرقمية' 
              : 'Advanced dashboard for managing digital products and services'
            }
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;