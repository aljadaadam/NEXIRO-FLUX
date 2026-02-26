import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isPlatformAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // On dash.nexiroflux.com, redirect to main site login
    const isDashSubdomain = typeof window !== 'undefined' && window.location.hostname === 'dash.nexiroflux.com';
    if (isDashSubdomain) {
      window.location.href = `https://nexiroflux.com/login`;
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-dark-400 text-sm">Redirecting...</p>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin routes require platform admin (is_platform_admin=true)
  if (requireAdmin && !isPlatformAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
