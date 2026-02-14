import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getUser());
  const [site, setSite] = useState(() => api.getSite());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getProfile();
        setUser(data.user);
        api.setUser(data.user);
      } catch {
        // Token invalid
        api.removeToken();
        setUser(null);
        setSite(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Listen for forced logout (401/403)
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setSite(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      if (data.site) setSite(data.site);
      return data;
    } catch (err) {
      const msg = err.error || 'فشل تسجيل الدخول';
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const data = await api.registerAdmin(name, email, password);
      setUser(data.user);
      if (data.site) setSite(data.site);
      return data;
    } catch (err) {
      const msg = err.error || 'فشل إنشاء الحساب';
      setError(msg);
      throw err;
    }
  }, []);

  const googleLogin = useCallback(async (tokenData) => {
    setError(null);
    try {
      const data = await api.googleLogin(tokenData);
      setUser(data.user);
      if (data.site) setSite(data.site);
      return data;
    } catch (err) {
      const msg = err.error || 'فشل تسجيل الدخول عبر Google';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setSite(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      site,
      loading,
      error,
      setError,
      isAuthenticated,
      isAdmin,
      login,
      register,
      googleLogin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
