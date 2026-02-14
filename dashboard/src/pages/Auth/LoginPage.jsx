import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLockedOut, formatLockoutTime, lockoutTimeRemaining, loginAttempts } = useAuth();
  const { theme, dir, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAttempts, setShowAttempts] = useState(false);

  // الترجمات
  const translations = {
    accountLocked: dir === 'rtl' ? '🔒 الحساب محظور مؤقتاً' : '🔒 Account Temporarily Locked',
    lockoutMessage: (time) => dir === 'rtl' 
      ? `تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار ${time} قبل المحاولة مرة أخرى.`
      : `Too many failed attempts. Please wait ${time} before trying again.`,
    remainingAttempts: dir === 'rtl' ? 'المحاولات المتبقية' : 'Remaining Attempts',
    loginSuccess: dir === 'rtl' ? 'تم تسجيل الدخول بنجاح! ✓' : 'Login Successful! ✓',
    fillFields: dir === 'rtl' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password',
    locked: (time) => dir === 'rtl' ? `🔒 محظور (${time})` : `🔒 Locked (${time})`,
    loggingIn: dir === 'rtl' ? 'جاري تسجيل الدخول...' : 'Logging in...',
    loginButton: dir === 'rtl' ? 'تسجيل الدخول' : 'Login',
    emailPlaceholder: dir === 'rtl' ? 'البريد الإلكتروني' : 'Email',
    passwordPlaceholder: dir === 'rtl' ? 'كلمة المرور' : 'Password',
  };

  // إخفاء Toast بعد 5 ثواني
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'error', attempts = null) => {
    setToast({ message, type, attempts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setIsLoading(true);

    // التحقق من البيانات
    if (!email || !password) {
      showToast(translations.fillFields, "warning");
      setIsLoading(false);
      return;
    }

    // استدعاء API تسجيل الدخول
    const result = await login(email, password);

    if (result.success) {
      // الانتقال مباشرة إلى الداشبورد بدون رسالة
      document.body.style.transition = 'opacity 0.5s ease-in';
      document.body.style.opacity = '0';
      setTimeout(() => {
        navigate("/dashboard");
        document.body.style.opacity = '1';
      }, 500);
    } else {
      // حالة الحظر: عرض رسالة Toast
      if (result.locked) {
        const message = result.error || translations.lockoutMessage(formatLockoutTime());
        showToast(message, 'locked');
      }
      // حالة تحذير المحاولات: عدم عرض Toast (سيتم عرضها فوق الحقول)
      else if (result.remaining !== undefined) {
        setShowAttempts(true);
      }
      // حالة خطأ عام: عرض رسالة Toast
      else {
        const message = result.error || (dir === 'rtl' ? "فشل تسجيل الدخول، يرجى المحاولة مرة أخرى" : "Login failed, please try again");
        showToast(message, 'error');
      }
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center px-4 overflow-x-hidden relative ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
      dir={dir}
    >
      {/* Toast Notification - منسدل من الأعلى في نفس مكان الحظر */}
      {toast && (
        <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-16 absolute top-8 z-50 ${
          dir === 'rtl' ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'
        }`}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            <div></div> {/* فراغ لليسار */}
            <div 
              className="animate-slideDown"
              style={{
                animation: 'slideDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}
            >
              <div className={`
                rounded-2xl shadow-xl p-4 flex items-start gap-3
                border-2 transition-all duration-200 hover:shadow-2xl
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                ${toast.type === 'success' ? (theme === 'dark' ? 'border-green-400' : 'border-green-500') : ''}
                ${toast.type === 'warning' ? (theme === 'dark' ? 'border-orange-400' : 'border-orange-500') : ''}
                ${toast.type === 'error' ? (theme === 'dark' ? 'border-red-400' : 'border-red-500') : ''}
                ${toast.type === 'locked' ? (theme === 'dark' ? 'border-red-500' : 'border-red-600') : ''}
              `}>
                {/* الأيقونة */}
                <div className="flex-shrink-0 mt-0.5">
                  {toast.type === 'success' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'warning' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                    }`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'error' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'locked' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse ${
                      theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* المحتوى */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm leading-relaxed break-words
                    ${toast.type === 'success' ? (theme === 'dark' ? 'text-green-300' : 'text-green-800') : ''}
                    ${toast.type === 'warning' ? (theme === 'dark' ? 'text-orange-300' : 'text-orange-800') : ''}
                    ${toast.type === 'error' ? (theme === 'dark' ? 'text-red-300' : 'text-red-800') : ''}
                    ${toast.type === 'locked' ? (theme === 'dark' ? 'text-red-300' : 'text-red-800') : ''}
                  `}>
                    {toast.message}
                  </p>
                  {toast.attempts !== null && toast.attempts !== undefined && (
                    <div className="mt-3 space-y-1.5">
                      <div className={`flex items-center justify-between text-xs ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span>{translations.remainingAttempts}</span>
                        <span className="font-bold">{toast.attempts}/5</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`h-full transition-all duration-500 ease-out rounded-full
                            ${toast.type === 'warning' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}
                          `}
                          style={{ width: `${(toast.attempts / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* زر الإغلاق */}
                <button 
                  onClick={() => setToast(null)}
                  className={`flex-shrink-0 rounded-full p-1.5 transition-all duration-200 hover:rotate-90 ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الحاوية الرئيسية - مرن على الموبايل، شبكة على الديسكتوب */}
      <div className="w-full max-w-7xl flex flex-col lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-0 py-8">
        
        {/* ======================= قسم الأنيميشن (يظهر أولاً في الموبايل) ======================= */}
        <div className="flex justify-center w-full order-first lg:order-last mb-6 lg:mb-0">
          <img
            src="/animations/security.gif"
            alt="Security Animation"
            className="w-full max-w-xs sm:max-w-sm lg:max-w-xl object-contain"
          />
        </div>

        {/* ======================= قسم النموذج (يسار) ======================= */}
        <div className="flex flex-col items-start justify-center w-full px-4 sm:px-6 md:px-16 order-last lg:order-first">

          {/* رسالة الحظر الثابتة */}
          {isLockedOut && (
            <div className={`w-full mb-4 p-4 rounded-2xl shadow-xl border-2 flex items-start gap-3 ${
              theme === 'dark' ? 'bg-gray-800 border-red-500' : 'bg-white border-red-600'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse ${
                theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <strong className={`block mb-1 text-sm font-semibold ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-800'
                }`}>{translations.accountLocked}</strong>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>{translations.lockoutMessage(formatLockoutTime())}</p>
              </div>
            </div>
          )}

          {/* رسالة تحذير المحاولات المتبقية */}
          {!isLockedOut && showAttempts && (
            <div className={`w-full mb-4 p-4 rounded-2xl shadow-xl border-2 flex items-start gap-3 ${
              theme === 'dark' ? 'bg-gray-800 border-orange-500' : 'bg-white border-orange-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <strong className={`block mb-1 text-sm font-semibold ${
                  theme === 'dark' ? 'text-orange-300' : 'text-orange-800'
                }`}>
                  {dir === 'rtl' ? '⚠️ تحذير: محاولة خاطئة' : '⚠️ Warning: Failed Attempt'}
                </strong>
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
                }`}>
                  {dir === 'rtl' 
                    ? 'كلمة المرور أو البريد الإلكتروني غير صحيح. يرجى المحاولة مرة أخرى.'
                    : 'Incorrect email or password. Please try again.'}
                </p>
                <div className="space-y-1.5">
                  <div className={`flex items-center justify-between text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span>{translations.remainingAttempts}</span>
                    <span className="font-bold">{5 - loginAttempts}/5</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                      style={{ width: `${(loginAttempts / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder={translations.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isLockedOut}
            className="
              w-full py-3 sm:py-4 px-4 sm:px-6 
              border border-gray-300 
              rounded-2xl sm:rounded-3xl text-base sm:text-xl 
              focus:outline-none 
              focus:ring-2 focus:ring-gray-400
              mb-4 sm:mb-6 tracking-wide
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />

          {/* Password */}
          <input
            type="password"
            placeholder={translations.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isLockedOut}
            className="
              w-full py-3 sm:py-4 px-4 sm:px-6 
              border border-gray-300 
              rounded-2xl sm:rounded-3xl text-base sm:text-xl 
              focus:outline-none 
              focus:ring-2 focus:ring-gray-400
              mb-6 sm:mb-8 tracking-wide
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || isLockedOut}
            className={`
              w-full py-3 sm:py-4 text-lg sm:text-2xl 
              rounded-2xl sm:rounded-full transition tracking-widest
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center
              ${isLockedOut ? 'bg-gray-200 text-gray-500' : 'bg-gray-300 hover:bg-gray-400'}
            `}
          >
            {isLockedOut ? (
              <>
                {translations.locked(formatLockoutTime())}
              </>
            ) : isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {translations.loggingIn}
              </>
            ) : (
              translations.loginButton
            )}
          </button>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-12 w-full text-gray-600 text-xs sm:text-sm tracking-wide">
            <p>© 2026 Nexiro Flux. All rights reserved.</p>
            <p className="mt-1">Version 3.0.0</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
