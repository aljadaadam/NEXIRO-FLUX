// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// إعدادات الحماية
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 دقيقة
const WARNING_TIMEOUT = 13 * 60 * 1000; // 13 دقيقة (تحذير قبل دقيقتين من الخروج)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 دقائق
const MAX_LOGIN_ATTEMPTS = 5; // عدد المحاولات المسموح بها
const LOCKOUT_DURATION = 15 * 60 * 1000; // مدة الحظر 15 دقيقة

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [site, setSite] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const tokenCheckTimerRef = useRef(null);
  const lockoutTimerRef = useRef(null);

  // تسجيل الخروج التلقائي
  const autoLogout = () => {
    console.warn('🔒 تسجيل خروج تلقائي بسبب عدم النشاط');
    logout();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  // إعادة تعيين مؤقت عدم النشاط
  const resetInactivityTimer = () => {
    // إخفاء التحذير إذا كان ظاهرًا
    setShowInactivityWarning(false);
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    
    if (token) {
      // عرض تحذير قبل دقيقتين
      warningTimerRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
        console.warn('⚠️ تحذير: سيتم تسجيل الخروج خلال دقيقتين بسبب عدم النشاط');
      }, WARNING_TIMEOUT);
      
      // تسجيل خروج تلقائي
      inactivityTimerRef.current = setTimeout(autoLogout, INACTIVITY_TIMEOUT);
    }
  };

  // بدء العد التنازلي للحظر
  const startLockoutCountdown = (lockoutEndTime) => {
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
    }

    lockoutTimerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.ceil((lockoutEndTime - now) / 1000);
      
      if (remaining <= 0) {
        setIsLockedOut(false);
        setLockoutTimeRemaining(0);
        setLoginAttempts(0);
        localStorage.removeItem('lockoutEnd');
        localStorage.removeItem('loginAttempts');
        clearInterval(lockoutTimerRef.current);
      } else {
        setLockoutTimeRemaining(remaining);
      }
    }, 1000);
  };

  // التحقق من صلاحية الـ token
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      if (!response.data.valid) {
        console.warn('🔒 Token غير صالح');
        autoLogout();
      }
    } catch (error) {
      console.error('❌ خطأ في التحقق من Token:', error);
      if (error.response?.status === 401) {
        autoLogout();
      }
    }
  };

  useEffect(() => {
    // قراءة البيانات من localStorage عند تشغيل التطبيق
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedSite = localStorage.getItem('site');
    const lastActivity = localStorage.getItem('lastActivity');
    const storedAttempts = localStorage.getItem('loginAttempts');
    const lockoutEnd = localStorage.getItem('lockoutEnd');

    // التحقق من حالة الحظر
    if (lockoutEnd) {
      const lockoutEndTime = parseInt(lockoutEnd);
      const now = Date.now();
      
      if (now < lockoutEndTime) {
        setIsLockedOut(true);
        setLockoutTimeRemaining(Math.ceil((lockoutEndTime - now) / 1000));
        startLockoutCountdown(lockoutEndTime);
      } else {
        // انتهت مدة الحظر، مسح البيانات
        localStorage.removeItem('lockoutEnd');
        localStorage.removeItem('loginAttempts');
      }
    }

    // استعادة عدد المحاولات
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    if (storedToken && storedUser) {
      // التحقق من آخر نشاط
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          console.warn('🔒 انتهت صلاحية الجلسة');
          localStorage.clear();
          setIsLoading(false);
          return;
        }
      }

      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedSite) {
        setSite(JSON.parse(storedSite));
      }
      
      // تحديث آخر نشاط
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // بدء مراقبة النشاط
      resetInactivityTimer();
      
      // بدء التحقق الدوري من الـ token
      tokenCheckTimerRef.current = setInterval(verifyToken, TOKEN_CHECK_INTERVAL);
    }
    setIsLoading(false);
  }, []);

  // مراقبة أحداث النشاط
  useEffect(() => {
    if (!token) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
      resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [token]);

  // مراقبة تغييرات الشبكة
  useEffect(() => {
    if (!token) return;

    const handleOnline = () => {
      console.log('🌐 الاتصال بالإنترنت تم استعادته');
      // التحقق من صلاحية الـ token عند العودة للاتصال
      verifyToken();
    };

    const handleOffline = () => {
      console.warn('⚠️ انقطع الاتصال بالإنترنت');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  // مراقبة تغيير التبويب (Visibility Change)
  useEffect(() => {
    if (!token) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ المستخدم عاد للتطبيق');
        const lastActivity = localStorage.getItem('lastActivity');
        
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
          
          if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
            console.warn('🔒 انتهت صلاحية الجلسة أثناء الغياب');
            autoLogout();
          } else {
            // التحقق من صلاحية الـ token
            verifyToken();
            resetInactivityTimer();
          }
        }
      } else {
        console.log('👋 المستخدم غادر التطبيق');
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token]);

  // تنظيف المؤقتات عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (tokenCheckTimerRef.current) {
        clearInterval(tokenCheckTimerRef.current);
      }
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
      }
    };
  }, []);

  const login = async (email, password) => {
    console.log('🔓 محاولة تسجيل دخول جديدة');
    
    // إزالة أي حظر موجود للتطوير فقط
    if (import.meta.env.DEV) {
      localStorage.removeItem('lockoutEnd');
      localStorage.removeItem('loginAttempts');
      setIsLockedOut(false);
      setLockoutTimeRemaining(0);
      setLoginAttempts(0);
      console.log('🔧 تم إلغاء الحظر (وضع التطوير)');
    }
    
    // التحقق من حالة الحظر
    if (isLockedOut) {
      const minutes = Math.floor(lockoutTimeRemaining / 60);
      const seconds = lockoutTimeRemaining % 60;
      return {
        success: false,
        error: `تم حظر تسجيل الدخول لمدة ${minutes}:${seconds.toString().padStart(2, '0')} دقيقة بسبب المحاولات الخاطئة المتكررة`
      };
    }

    try {
      const loginData = {
        email,
        password,
        site_key: import.meta.env.VITE_SITE_KEY,
      };
      console.log('📤 إرسال بيانات تسجيل الدخول:', loginData);
      console.log('🔗 الاتصال بـ:', import.meta.env.VITE_API_URL);
      
      const startTime = Date.now();
      const response = await api.post('/auth/login', loginData);
      const duration = Date.now() - startTime;
      console.log(`📥 استجابة تسجيل الدخول (${duration}ms):`, response.data);

      const data = response.data;

      // نجح تسجيل الدخول - إعادة تعيين المحاولات
      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lockoutEnd');

      // تخزين البيانات
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('site', JSON.stringify(data.site));
      localStorage.setItem('site_key', data.site_key);
      localStorage.setItem('lastActivity', Date.now().toString());

      setToken(data.token);
      setUser(data.user);
      setSite(data.site);

      // بدء مراقبة النشاط
      resetInactivityTimer();
      
      // بدء التحقق الدوري من الـ token
      if (tokenCheckTimerRef.current) {
        clearInterval(tokenCheckTimerRef.current);
      }
      tokenCheckTimerRef.current = setInterval(verifyToken, TOKEN_CHECK_INTERVAL);

      return { success: true, data };
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      console.error('📋 تفاصيل الخطأ:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // فشل تسجيل الدخول - زيادة عدد المحاولات
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      console.warn(`⚠️ محاولة تسجيل دخول فاشلة (${newAttempts}/${MAX_LOGIN_ATTEMPTS})`);

      // التحقق من تجاوز الحد الأقصى
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem('lockoutEnd', lockoutEnd.toString());
        setIsLockedOut(true);
        setLockoutTimeRemaining(Math.ceil(LOCKOUT_DURATION / 1000));
        startLockoutCountdown(lockoutEnd);
        
        console.error('🔒 تم حظر تسجيل الدخول لمدة 15 دقيقة');
        
        return {
          success: false,
          error: 'تم حظر تسجيل الدخول لمدة 15 دقيقة بسبب تجاوز عدد المحاولات المسموح بها (5 محاولات)',
          locked: true
        };
      }

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
      const errorMessage = error.response?.data?.message || error.message || 'فشل تسجيل الدخول';
      
      return {
        success: false,
        error: errorMessage,
        attempts: newAttempts,
        remaining: remainingAttempts
      };
    }
  };

  const logout = () => {
    // مسح البيانات
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('site');
    localStorage.removeItem('site_key');
    localStorage.removeItem('lastActivity');

    setToken(null);
    setUser(null);
    setSite(null);
    setShowInactivityWarning(false);

    // إيقاف المؤقتات
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (tokenCheckTimerRef.current) {
      clearInterval(tokenCheckTimerRef.current);
    }
  };

  const isAuthenticated = () => {
    return !!token;
  };

  // تنسيق وقت العد التنازلي
  const formatLockoutTime = () => {
    const minutes = Math.floor(lockoutTimeRemaining / 60);
    const seconds = lockoutTimeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value = {
    user,
    site,
    token,
    isLoading,
    showInactivityWarning,
    isLockedOut,
    lockoutTimeRemaining,
    loginAttempts,
    formatLockoutTime,
    login,
    logout,
    isAuthenticated,
    resetInactivityTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* تحذير عدم النشاط */}
      {showInactivityWarning && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-[9999] animate-fadeIn">
          <div className="bg-yellow-500 text-white rounded-lg shadow-2xl p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">⚠️ تحذير عدم النشاط</h3>
              <p className="text-sm">سيتم تسجيل خروجك تلقائياً خلال دقيقتين بسبب عدم النشاط. قم بأي نشاط للاستمرار.</p>
            </div>
            <button 
              onClick={() => setShowInactivityWarning(false)}
              className="flex-shrink-0 hover:bg-yellow-600 rounded p-1 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
