// src/components/layout/Sidebar.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// 🎨 LINE ICONS - SVG Components
// ============================================================================
const LineIcon = ({ name, active, collapsed }) => {
  const strokeColor = active ? 'var(--text-secondary)' : 'var(--text-primary)';
  const size = collapsed ? '24' : '20';
  
  const icons = {
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
    products: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    orders: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    analytics: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m8.66-15.66-4.24 4.24m-4.24 4.24-4.24 4.24m16.72.48-4.24-4.24m-4.24-4.24-4.24-4.24" />
      </svg>
    ),
  };
  
  return icons[name] || icons.dashboard;
};

const Sidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile = () => {} }) => {
  // ============================================================================
  // 📍 HOOKS AND STATE DECLARATIONS
  // ============================================================================
  const location = useLocation();
  const { t, dir, theme, toggleLanguage, language } = useLanguage();
  const { logout } = useAuth();
  const [manualSubmenu, setManualSubmenu] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isManualAction = React.useRef(false); // ✅ ref يحدد إننا في تفاعل يدوي

  // ============================================================================
  // 🎯 AUTO-CALCULATE ACTIVE MENU (NO RE-RENDER LOOP)
  // ============================================================================
  const autoActiveSubmenu = useMemo(() => {
    const currentPath = location.pathname;
    
    const menuItemsWithSubmenus = [
      { title: t('products'), basePath: '/products' },
      { title: t('users'), basePath: '/users' },
      { title: t('analytics'), basePath: '/analytics' },
      { title: t('settings'), basePath: '/settings' },
    ];
    
    const activeMenu = menuItemsWithSubmenus.find(menu => 
      currentPath.startsWith(menu.basePath)
    );
    
    return activeMenu ? activeMenu.title : null;
  }, [location.pathname, t]);

  // القائمة النشطة: إما اليدوية أو التلقائية
  const activeSubmenu = manualSubmenu !== null ? manualSubmenu : autoActiveSubmenu;

  // ============================================================================
  // ✅ 1. لا تغيّر activeSubmenu إذا هو نفسه (منع الوميض)
  // ✅ إذا كان هناك تفاعل يدوي، لا تتحكم تلقائيًا
  // ============================================================================
  useEffect(() => {
    // ✅ عند الضغط اليدوي، عطّل أي تحكم تلقائي بالكامل
    if (isManualAction.current) return;

    if (autoActiveSubmenu && autoActiveSubmenu !== manualSubmenu) {
      setManualSubmenu(autoActiveSubmenu);
    }
  }, [autoActiveSubmenu, manualSubmenu]);

  // ============================================================================
  // 🖱️ HANDLE SUBMENU TOGGLE (MEMOIZED)
  // ============================================================================
  const toggleSubmenu = useCallback((menuTitle) => {
    // ✅ ضبط ref لإيقاف التحكم التلقائي
    isManualAction.current = true;
    setIsAnimating(true);

    setManualSubmenu(prev => prev === menuTitle ? null : menuTitle);

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  }, []);

  // ============================================================================
  // ⛔ Remove auto-reset to avoid flicker when switching main menus
  // - We now rely on explicit clicks to control `manualSubmenu`.
  // - Auto highlighting still works when `manualSubmenu` is null.
  // ============================================================================

  // ============================================================================
  // 📋 MENU ITEMS CONFIGURATION (MEMOIZED)
  // ============================================================================
  /**
   * هيكل البيانات: يحتوي على جميع عناصر القائمة الرئيسية
   * كل عنصر يحتوي على:
   * - title: النص المعروض (مترجم)
   * - icon: أيقونة FontAwesome
   * - path: الرابط الرئيسي
   * - badge: إشعار رقمي (اختياري)
   * - submenu: القائمة الفرعية (اختياري)
   */
  const menuItems = useMemo(() => [
    {
      title: t('dashboard'),
      icon: 'dashboard',
      path: '/dashboard',
      badge: null,
    },
    {
      title: t('products'),
      icon: 'products',
      path: '/products',
      badge: null,
      submenu: [
        { title: t('allProducts'), path: '/products' },
        { title: dir === 'rtl' ? 'إدارة المصادر' : 'Sources Management', path: '/products/sources' },
      ],
    },
    {
      title: t('orders'),
      icon: 'orders',
      path: '/orders',
      badge: null,
    },
    {
      title: t('users'),
      icon: 'users',
      path: '/users',
      submenu: [
        { title: t('allUsers'), path: '/users/all' },
        { title: t('companies'), path: '/users/companies' },
        { title: t('admins'), path: '/users/admins' },
      ],
    },
    {
      title: t('analytics'),
      icon: 'analytics',
      path: '/analytics',
      submenu: [
        { title: t('sales'), path: '/analytics/sales' },
        { title: t('usersAnalytics'), path: '/analytics/users' },
        { title: t('productsAnalytics'), path: '/analytics/products' },
      ],
    },
    {
      title: t('settings'),
      icon: 'settings',
      path: '/settings',
      submenu: [
        { title: t('general'), path: '/settings/general' },
        { title: t('themeSettings'), path: '/settings/theme' },
        { title: t('payment'), path: '/settings/payment' },
        { title: t('notificationsSettings'), path: '/settings/notifications' },
      ],
    },
  ], [t, dir]);

  // ============================================================================
  // 🎨 SIDEBAR POSITION BASED ON LANGUAGE DIRECTION
  // ============================================================================
  /**
   * تحديد موقع الشريط الجانبي بناءً على اتجاه اللغة
   * - RTL (العربية): الجانب الأيمن
   * - LTR (الإنجليزية): الجانب الأيسر
   */
  const sidebarPosition = dir === 'rtl' ? 'right-0' : 'left-0';

  // ============================================================================
  // 📱 MOBILE DRAWER TRANSFORM
  // ============================================================================
  const drawerTransform = mobileOpen 
    ? 'translate-y-0' 
    : 'translate-y-6';

  return (
    <>
      {/* ========================================== */}
      {/* 📱 OVERLAY - للموبايل فقط */}
      {/* ========================================== */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={onCloseMobile}
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        />
      )}

      {/* ========================================== */}
      {/* 💻 DESKTOP SIDEBAR - ثابت دائماً */}
      {/* ========================================== */}
      <div className={`hidden lg:block h-screen lg:fixed top-0 ${sidebarPosition} z-30 transition-all duration-300 border-r ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ 
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border-color)'
      }}>
      
      {/* ======================================================================== */}
      {/* 🏢 STORE LOGO SECTION (VISIBLE ONLY WHEN NOT COLLAPSED) */}
      {/* ======================================================================== */}
    {/* ===================== LOGO AREA ===================== */}
{!collapsed && (
  <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-color)' }}>
    <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Brand text (always first in DOM) */}
      <div
        className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
        style={dir === 'ltr' ? { marginRight: '1rem' } : undefined}
      >
        <h3 className="font-bold text-xl leading-tight" style={{ color: 'var(--text-primary)' }}>
          {t('brandName')}
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('brandSubtitle')}</p>
      </div>

      {/* Logo box */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold tracking-wide flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg`}
        style={dir === 'rtl' ? { minWidth: '48px', height: '48px', marginLeft: '1rem' } : { minWidth: '48px', height: '48px' }}
      >
        {'{ NF }'}
      </div>

    </div>
  </div>
)}
      {/* ======================================================================== */}
      {/* 🧭 MAIN NAVIGATION MENU */}
      {/* ======================================================================== */}
      <nav className="p-4 overflow-y-auto h-[calc(100vh-8rem)]">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            // 🔍 CHECK ACTIVE STATES
            /**
             * isActive: إذا كان المسار الحالي مطابقاً للرابط الرئيسي
             * isSubmenuActive: إذا كانت القائمة الفرعية مفتوحة حالياً
             * shouldHighlight: إذا كان العنصر يجب أن يظهر كنشط (إما الرابط الرئيسي أو القائمة الفرعية)
             */
            const isActive = location.pathname === item.path || 
                            location.pathname.startsWith(item.path + '/');
            const isSubmenuActive = activeSubmenu === item.title;
            const shouldHighlight = isActive || (item.submenu && isSubmenuActive);
            
            return (
              <li key={index}>
                {/* 🎯 MAIN MENU ITEM */}
                <div className="relative">
                  <NavLink
                    to={item.submenu ? '#' : item.path}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 rounded-xl mb-1 ${
                        shouldHighlight
                          ? 'text-primary'
                          : 'text-secondary'
                      }`
                    }
                    style={{
                      backgroundColor: shouldHighlight ? 'var(--active-bg)' : 'transparent',
                      // ✅ 3. ثبّت مساحة الـ border (لا يظهر فجأة)
                      borderLeft: dir === 'ltr' ? '3px solid transparent' : 'none',
                      borderRight: dir === 'rtl' ? '3px solid transparent' : 'none',
                      ...(shouldHighlight && {
                        [dir === 'ltr' ? 'borderLeftColor' : 'borderRightColor']: 'var(--accent-primary)'
                      }),
                      transform: 'scale(1)',
                      // ✅ 2. استبدل transition-all بـ محدد
                      transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.97) translateY(1px)';
                      e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    }}
                    onMouseEnter={(e) => {
                      if (!shouldHighlight) {
                        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!shouldHighlight) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    }}
                    onClick={(e) => {
                      if (item.submenu) {
                        e.preventDefault();
                        setTimeout(() => {
                          toggleSubmenu(item.title);
                        }, 30);
                      } else {
                        setTimeout(() => {
                          setManualSubmenu(null);
                        }, 30);
                      }
                    }}
                  >
                    {/* 🔘 Icon */}
                    <div className={`${collapsed ? 'mx-auto' : ''}`}>
                      <LineIcon name={item.icon} active={shouldHighlight} collapsed={collapsed} />
                    </div>
                    
                    {/* 📝 Text and Indicators (Visible when not collapsed) */}
                    {!collapsed && (
                      <>
                        <span className={`flex-1 ${dir === 'rtl' ? 'mr-3' : 'ml-3'}`}>
                          {item.title}
                        </span>
                        
                        {/* 🔴 Notification Badge */}
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {item.badge}
                          </span>
                        )}
                        
                        {/* 🔽 Submenu Indicator Arrow - Always visible when there's a submenu */}
                        {item.submenu && (
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke={isSubmenuActive ? 'var(--text-primary)' : 'var(--text-secondary)'} 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`transition-transform duration-300 ${
                              isSubmenuActive ? 'rotate-90' : ''
                            }`}
                            style={{ transform: dir === 'rtl' && !isSubmenuActive ? 'scaleX(-1)' : undefined }}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </>
                    )}
                  </NavLink>
                  
                  {/* 🔴 Compact Mode Badge */}
                  {collapsed && item.badge && (
                    <span className={`absolute top-1 ${
                      dir === 'rtl' ? 'left-1' : 'right-1'
                    } bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* ================================================================ */}
                {/* 📂 SUBMENU ITEMS (VISIBLE WHEN EXPANDED) */}
                {/* 3️⃣ ظهور الخيارات الفرعية - Staggered Reveal */}
                {/* ================================================================ */}
                {item.submenu && !collapsed && (
                  <div 
                    className={`overflow-hidden ${
                      dir === 'rtl' ? 'mr-12' : 'ml-12'
                    }`}
                    style={{
                      maxHeight: isSubmenuActive ? `${item.submenu.length * 48}px` : '0px',
                      opacity: isSubmenuActive ? 1 : 0,
                      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
                      transitionDelay: isSubmenuActive ? '0s, 0s' : '0.1s, 0.1s',
                    }}
                  >
                    <ul className="mt-1 space-y-1">
                      {item.submenu.map((subItem, subIndex) => {
                        const isSubItemActive = location.pathname === subItem.path;
                        
                        return (
                          <li 
                            key={subIndex}
                            style={{
                              // 3️⃣ ظهور متدرج - كل عنصر يظهر بعد الآخر بـ 70ms
                              animation: isSubmenuActive ? `slideInSubmenu 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${subIndex * 70}ms forwards` : 'none',
                              opacity: 0,
                              transform: dir === 'rtl' ? 'translateX(10px)' : 'translateX(-10px)',
                            }}
                          >
                            <NavLink
                              to={subItem.path}
                              className={`block py-2 px-4 rounded-lg text-sm ${
                                isSubItemActive
                                  ? 'text-primary'
                                  : 'text-secondary'
                              }`}
                              style={{
                                backgroundColor: isSubItemActive ? 'var(--active-bg)' : 'transparent',
                                // ✅ 3. ثبّت border للعناصر الفرعية
                                borderLeft: dir === 'ltr' ? '2px solid transparent' : 'none',
                                borderRight: dir === 'rtl' ? '2px solid transparent' : 'none',
                                ...(isSubItemActive && {
                                  [dir === 'ltr' ? 'borderLeftColor' : 'borderRightColor']: 'var(--accent-primary)'
                                }),
                                transform: 'scale(1)',
                                // ✅ 2. transitions محددة (ليس all)
                                transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s, border-color 0.15s',
                              }}
                              onMouseDown={(e) => {
                                e.currentTarget.style.transform = 'scale(0.96) translateY(1px)';
                                e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1), color 0.08s';
                              }}
                              onMouseUp={(e) => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s';
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubItemActive) {
                                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubItemActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                              }}
                              onClick={() => {
                                // 4️⃣ صفّر العلم عند اختيار عنصر فرعي
                                isManualAction.current = false;
                              }}
                            >
                              {subItem.title}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        
        {/* ======================================================================== */}
        {/* 🆘 HELP AND SUPPORT SECTION */}
        {/* ======================================================================== */}
        {!collapsed && (
          <div className={`mt-8 p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-800/30'
              : 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-800/30'
          }`}>
            <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                dir === 'rtl' ? 'ml-3' : 'mr-3'
              } ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600'
                  : 'bg-gradient-to-r from-green-500 to-teal-500'
              }`}>
                <i className="fas fa-question text-white"></i>
              </div>
              <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                <h4 className="text-white font-bold">{t('needHelp')}</h4>
                <p className="text-gray-300 text-xs">{t('weAreHere')}</p>
              </div>
            </div>
            <button className={`w-full py-2 rounded-lg transition text-sm font-medium ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-green-700 to-teal-700 hover:from-green-600 hover:to-teal-600 text-white'
                : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white'
            }`}>
              <i className={`fas fa-headset ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
              {t('contactSupport')}
            </button>
          </div>
        )}
      </nav>
      
      {/* ======================================================================== */}
      {/* 🎯 ACTION BUTTONS SECTION (BOTTOM OF SIDEBAR) */}
      {/* ======================================================================== */}
      {!collapsed && (
        <div className="absolute bottom-0 w-full p-3 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              dir === 'rtl' ? 'flex-row-reverse' : ''
            }`}
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              transitionProperty: 'background-color, transform',
              transitionDuration: '0.15s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97) translateY(1px)';
              e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="text-sm font-medium" style={{ direction: language === 'ar' ? 'ltr' : 'rtl' }}>
              {language === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              dir === 'rtl' ? 'flex-row-reverse' : ''
            }`}
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              transitionProperty: 'background-color, transform',
              transitionDuration: '0.15s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97) translateY(1px)';
              e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      )}
    </div>

      {/* ========================================== */}
      {/* 📱 MOBILE DRAWER - يظهر فقط في الموبايل */}
      {/* ========================================== */}
      <div className={`
        lg:hidden
        fixed bottom-4 left-1/2 -translate-x-1/2
        w-[90%] max-w-sm
        rounded-3xl
        shadow-2xl
        transition-all duration-300 ease-out
        z-50
        ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${drawerTransform}
      `}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        filter: mobileOpen ? 'blur(0px)' : 'blur(6px)',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      >
        
        {/* Header Section with Close Button and Logout */}
        <div 
          className="relative p-4 flex items-center justify-between" 
          style={{ 
            borderBottom: '1px solid var(--border-color)',
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.25s ease-out 50ms',
          }}
        >
          {/* زر الإغلاق */}
          <button
            onClick={onCloseMobile}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition"
            style={{ backgroundColor: 'transparent' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* زر تسجيل الخروج */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>

        {/* Logo المربع الكبير */}
        <div 
          className="flex justify-center py-6"
          style={{
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.25s ease-out 100ms',
          }}
        >
          <div className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-white font-bold bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl">
            <div className="text-3xl mb-1">{'{ NF }'}</div>
            <div className="text-xs font-normal opacity-90">{t('brandName')}</div>
          </div>
        </div>

        {/* القائمة في الموبايل */}
        <nav 
          className="px-4 overflow-y-auto flex-1" 
          style={{ 
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.25s ease-out 150ms',
          }}
        >
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const isSubmenuActive = activeSubmenu === item.title;
              const shouldHighlight = isActive || (item.submenu && isSubmenuActive);
              
              return (
                <li 
                  key={index}
                  style={{
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
                    transition: `all 0.25s ease-out ${200 + (index * 60)}ms`,
                  }}
                >
                  <div className="relative">
                    <NavLink
                      to={item.submenu ? '#' : item.path}
                      className="flex items-center px-4 py-3 rounded-xl mb-1"
                      style={{
                        backgroundColor: shouldHighlight ? 'var(--active-bg)' : 'transparent',
                        color: 'var(--text-primary)',
                        borderLeft: dir === 'ltr' ? '3px solid transparent' : 'none',
                        borderRight: dir === 'rtl' ? '3px solid transparent' : 'none',
                        ...(shouldHighlight && {
                          [dir === 'ltr' ? 'borderLeftColor' : 'borderRightColor']: 'var(--accent-primary)'
                        }),
                        transform: 'scale(1)',
                        transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.97) translateY(1px)';
                        e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
                      }}
                      onMouseEnter={(e) => {
                        if (!shouldHighlight) {
                          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!shouldHighlight) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      }}
                      onClick={(e) => {
                        if (item.submenu) {
                          e.preventDefault();
                          setTimeout(() => {
                            toggleSubmenu(item.title);
                          }, 30);
                        } else {
                          setTimeout(() => {
                            setManualSubmenu(null);
                            onCloseMobile();
                          }, 30);
                        }
                      }}
                    >
                      <div>
                        <LineIcon name={item.icon} active={shouldHighlight} collapsed={false} />
                      </div>
                      <span className={`flex-1 ${dir === 'rtl' ? 'mr-3' : 'ml-3'}`}>{item.title}</span>
                      {item.badge && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{item.badge}</span>}
                      {item.submenu && (
                        <svg 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke={isSubmenuActive ? 'var(--text-primary)' : 'var(--text-secondary)'} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className={`transition-transform duration-300 ${
                            isSubmenuActive ? 'rotate-90' : ''
                          }`}
                          style={{ transform: dir === 'rtl' && !isSubmenuActive ? 'scaleX(-1)' : undefined }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </NavLink>
                  </div>
                  
                  {item.submenu && (
                    <div 
                      className={`overflow-hidden ${
                        dir === 'rtl' ? 'mr-12' : 'ml-12'
                      }`}
                      style={{
                        maxHeight: isSubmenuActive ? `${item.submenu.length * 48}px` : '0px',
                        opacity: isSubmenuActive ? 1 : 0,
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
                        transitionDelay: isSubmenuActive ? '0s, 0s' : '0.1s, 0.1s',
                      }}
                    >
                      <ul className="mt-1 space-y-1">
                        {item.submenu.map((subItem, subIndex) => {
                          const isSubItemActive = location.pathname === subItem.path;
                          return (
                            <li 
                              key={subIndex}
                              style={{
                                animation: isSubmenuActive ? `slideInSubmenu 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${subIndex * 70}ms forwards` : 'none',
                                opacity: 0,
                                transform: dir === 'rtl' ? 'translateX(10px)' : 'translateX(-10px)',
                              }}
                            >
                              <NavLink
                                to={subItem.path}
                                className="block py-2 px-4 rounded-lg text-sm"
                                style={{
                                    backgroundColor: isSubItemActive ? 'var(--active-bg)' : 'transparent',
                                    color: isSubItemActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  borderLeft: dir === 'ltr' ? '2px solid transparent' : 'none',
                                  borderRight: dir === 'rtl' ? '2px solid transparent' : 'none',
                                  ...(isSubItemActive && {
                                    [dir === 'ltr' ? 'borderLeftColor' : 'borderRightColor']: 'var(--accent-primary)'
                                  }),
                                  transform: 'scale(1)',
                                  transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s, border-color 0.15s',
                                }}
                                onMouseDown={(e) => {
                                  e.currentTarget.style.transform = 'scale(0.96) translateY(1px)';
                                  e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1), color 0.08s';
                                }}
                                onMouseUp={(e) => {
                                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                  e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s';
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubItemActive) {
                                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSubItemActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }
                                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                }}
                                onClick={() => {
                                  // 4️⃣ صفّر العلم عند اختيار عنصر فرعي في الموبايل
                                  isManualAction.current = false;
                                  onCloseMobile();
                                }}
                              >
                                {subItem.title}
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* 🎯 Language Toggle Button - Mobile Bottom */}
        <div 
          className="p-3" 
          style={{ 
            borderTop: '1px solid var(--border-color)',
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.25s ease-out 500ms',
          }}
        >
          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              dir === 'rtl' ? 'flex-row-reverse' : ''
            }`}
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              transitionProperty: 'background-color, transform',
              transitionDuration: '0.15s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97) translateY(1px)';
              e.currentTarget.style.transition = 'background-color 0.08s, transform 0.08s cubic-bezier(0.4, 0, 0.6, 1)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.transition = 'background-color 0.15s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="text-sm font-medium" style={{ direction: language === 'ar' ? 'ltr' : 'rtl' }}>
              {language === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;