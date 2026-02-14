// src/services/api.js
import axios from 'axios';

// إنشاء instance من axios مع الإعدادات الأساسية
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for SSH tunnel
});

// Request Interceptor - إضافة الـ token لكل طلب
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 إرسال طلب: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    const startTime = Date.now();
    config.metadata = { startTime };
    
    const token = localStorage.getItem('token');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // التحقق من انتهاء الجلسة قبل إرسال الطلب
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 دقيقة
        
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(new axios.Cancel('Session expired due to inactivity'));
        }
      }
      
      // تحديث آخر نشاط
      localStorage.setItem('lastActivity', Date.now().toString());
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - معالجة الأخطاء
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`✅ استجابة ناجحة (${duration}ms): ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime ? Date.now() - error.config.metadata.startTime : 0;
    console.error(`❌ خطأ في الطلب (${duration}ms):`, error.message);
    
    // إذا كان الخطأ بسبب إلغاء الطلب، لا نحتاج لفعل شيء
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // إذا كان الخطأ 401 (Unauthorized)، إعادة توجيه لصفحة تسجيل الدخول
    if (error.response && error.response.status === 401) {
      console.warn('🔒 Token غير صالح أو منتهي الصلاحية');
      localStorage.clear();
      
      // تجنب إعادة التوجيه المتكررة
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // إذا كان الخطأ 403 (Forbidden)
    if (error.response && error.response.status === 403) {
      console.error('🚫 ليس لديك صلاحية للوصول لهذا المورد');
    }
    
    // خطأ في الشبكة
    if (!error.response) {
      console.error('❌ خطأ في الاتصال بالشبكة');
    }
    
    return Promise.reject(error);
  }
);

export default api;
