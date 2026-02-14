// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleSidebar, onToggleMobileSidebar, mobileSidebarOpen = false }) => {
  const { language, dir, currentLanguage, theme, toggleLanguage, toggleTheme, t } = useLanguage();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: t('newOrder'), message: t('newOrderMessage'), time: t('5MinutesAgo'), read: false },
    { id: 2, title: t('newReview'), message: t('newReviewMessage'), time: t('1HourAgo'), read: false },
    { id: 3, title: t('systemUpdate'), message: t('systemUpdateMessage'), time: t('1DayAgo'), read: true },
  ]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // إغلاق الإشعارات عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const formatTime = (date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: language === 'ar' 
    });
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // إضافة تأثير fade out للصفحة بالكامل
    document.body.style.transition = 'opacity 0.8s ease-out';
    document.body.style.opacity = '0';
    
    // الانتقال لصفحة تسجيل الدخول بعد انتهاء الانيميشن
    setTimeout(() => {
      logout(); // مسح بيانات المصادقة
      navigate('/login');
      document.body.style.opacity = '1';
    }, 800);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // نص زر المينو حسب اللغة
  const menuLabel = dir === 'rtl' ? 'القائمة' : 'menu';
  const menuTextClass =
    dir === 'rtl'
      ? 'text-sm font-medium'
      : 'uppercase tracking-[0.35em] text-xs font-medium';

  return (
    <>
      {/* =================== MOBILE HEADER =================== */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4"
        style={{ 
          backgroundColor: 'var(--header-bg)', 
          borderBottom: '1px solid var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {/* زر المينو */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2.5 rounded-xl border transition-colors"
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'transparent'
          }}
        >
          {mobileSidebarOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* الأربع عناصر مع بعض */}
        <div className="flex items-center gap-2">
          {/* زر البحث */}
          <button
            type="button"
            onClick={() => {/* يمكن فتح مودال بحث */}}
            className="p-2.5 rounded-xl border transition-colors"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* زر الوضع الليلي */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border transition-colors"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'transparent'
            }}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* زر الإشعارات */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl border transition-colors"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadNotificationsCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] font-semibold"
                style={{ backgroundColor: '#FF8C5F' }}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* صورة المستخدم */}
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-10 h-10 rounded-full border-2 transition-colors overflow-hidden"
            style={{ 
              borderColor: 'var(--border-color)'
            }}
          >
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User')}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        {/* قائمة الإشعارات في الموبايل */}
        {notificationsOpen && (
          <div className={`absolute top-14 inset-x-3 z-40 rounded-xl shadow-2xl border p-4 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {t('notifications')}
              </h3>
              <button 
                className={`text-sm hover:opacity-80 ${
                  theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
                onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
              >
                {t('markAllAsRead')}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b rounded-lg transition ${
                      !notification.read 
                        ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-100') 
                        : (theme === 'dark' ? 'border-gray-700' : 'border-gray-100')
                    } ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        {notification.title}
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {notification.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i className={`fas fa-bell-slash text-xl mb-2 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}></i>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('noNotifications')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =================== DESKTOP HEADER =================== */}
      <header 
        className="hidden lg:flex items-center sticky top-0 z-20 px-12 py-5 transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--header-bg)',
          color: 'var(--text-primary)'
        }}
      >

        {/* ICONS (LTR: right) (RTL: left) */}
        <div className="flex items-center gap-8 order-3">
          {/* زر تبديل الوضع - Line Icon */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 flex items-center justify-center rounded-xl bg-transparent border hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-all duration-200"
            style={{ borderColor: 'var(--border-color)' }}
            title={theme === 'light' ? t('switchToDark') : t('switchToLight')}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          
          {/* زر الإشعارات - Line Icon */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 flex items-center justify-center rounded-xl bg-transparent border hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-all duration-200 relative"
              style={{ borderColor: 'var(--border-color)' }}
              aria-label={t('notifications')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A3A7F6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            
            {/* قائمة الإشعارات (ديسكتوب) */}
            {notificationsOpen && (
              <div className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-80 rounded-xl shadow-2xl border p-4 z-40 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {t('notifications')}
                  </h3>
                  <button 
                    className={`text-sm hover:opacity-80 ${
                      theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  >
                    {t('markAllAsRead')}
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b rounded-lg transition ${
                          !notification.read 
                            ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-100') 
                            : (theme === 'dark' ? 'border-gray-700' : 'border-gray-100')
                        } ${
                          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex justify-between">
                          <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                            {notification.title}
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {notification.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <i className={`fas fa-bell-slash text-2xl mb-2 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}></i>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {t('noNotifications')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className={`mt-4 pt-3 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <a href="#" className={`text-center block font-medium hover:opacity-80 ${
                    theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}>
                    {t('viewAllNotifications')}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* صورة الملف الشخصي */}
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-0.5 rounded-full border hover:border-[#A3A7F6] transition-all duration-200"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <img
                src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=A3A7F6&color=fff"}
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
            
            {/* قائمة المستخدم */}
            {userMenuOpen && (
              <div 
                className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-56 rounded-xl shadow-2xl border p-2 z-40`}
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user?.name || 'User'}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
                
                <a href="#" className={`flex items-center p-3 rounded-lg transition ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <i className={`fas fa-user-circle ${dir === 'rtl' ? 'ml-3' : 'mr-3'} ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}></i>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {t('profile')}
                  </span>
                </a>
                <a href="#" className={`flex items-center p-3 rounded-lg transition ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <i className={`fas fa-cog ${dir === 'rtl' ? 'ml-3' : 'mr-3'} ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}></i>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {t('settings')}
                  </span>
                </a>
                <a href="#" className={`flex items-center p-3 rounded-lg transition ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <i className={`fas fa-question-circle ${dir === 'rtl' ? 'ml-3' : 'mr-3'} ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}></i>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {t('help')}
                  </span>
                </a>
                
                <div className={`border-t mt-2 pt-2 ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`flex items-center justify-center w-full p-3 rounded-lg transition ${
                      theme === 'dark' 
                        ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-50 text-red-600 hover:text-red-800'
                    } ${dir === 'rtl' ? 'flex-row-reverse' : ''} ${
                      isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className={`animate-spin h-4 w-4 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t('loggingOut') || 'جاري تسجيل الخروج...'}</span>
                      </>
                    ) : (
                      <>
                        <i className={`fas fa-sign-out-alt ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`}></i>
                        <span>{t('logout')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER - SEARCH */}
        <div className="flex-1 flex justify-center order-2 px-6">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              dir={dir}
              placeholder={dir === 'rtl' ? 'ابحث هنا...' : 'Search here...'}
              className={`w-full py-2.5 bg-transparent border placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[#A3A7F6] transition-all duration-200 text-sm rounded-2xl ${
                dir === 'rtl' ? 'pr-12 pl-6 text-right' : 'pl-12 pr-6 text-left'
              }`}
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`absolute top-1/2 -translate-y-1/2 ${
              dir === 'rtl' ? 'right-5' : 'left-5'
            }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="flex items-center gap-3 order-1">
          <h1 className="text-2xl font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {dir === 'rtl' ? 'نظرة عامة' : 'Overview'}
          </h1>
        </div>
      </header>
    </>
  );
};

export default Header;
