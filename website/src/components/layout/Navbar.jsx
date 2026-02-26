import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Sparkles, LayoutDashboard, LogOut, User, CalendarCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import ReservationModal from '../common/ReservationModal';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const { t, toggleLang, lang, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/templates', label: t('nav.templates') },
    { to: '/pricing', label: t('nav.pricing') },
  ];

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-dark-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            </div>
            <span className="text-xl font-display font-bold">
              <span className="text-white">NEXIRO</span>
              <span className="text-primary-400">-</span>
              <span className="gradient-text">FLUX</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors duration-300"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark-400 hover:text-red-400 transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  {isRTL ? 'خروج' : 'Logout'}
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors duration-300"
                >
                  {t('nav.login')}
                </Link>
                <button
                  onClick={() => setShowReservation(true)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 hover:to-primary-400 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary-500/25"
                >
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 py-4 bg-dark-950/95 backdrop-blur-xl border-t border-white/5 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-dark-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-white/5 my-2" />
          <div className="flex items-center gap-3 px-4 py-2">
            <button onClick={toggleLang} className="flex items-center gap-2 text-dark-400 hover:text-white">
              <Globe className="w-4 h-4" />
              <span className="text-sm">{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
          {isAuthenticated ? (
            <>
              <Link to="/my-dashboard" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-dark-300 hover:text-white rounded-xl hover:bg-white/5">
                <LayoutDashboard className="w-4 h-4" />
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-dark-400 hover:text-red-400 rounded-xl hover:bg-white/5 text-start"
              >
                <LogOut className="w-4 h-4" />
                {isRTL ? 'تسجيل خروج' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-4 py-3 text-center text-sm font-medium text-dark-300 hover:text-white rounded-xl hover:bg-white/5">
                {t('nav.login')}
              </Link>
              <button onClick={() => { setShowReservation(true); setMobileOpen(false); }} className="block w-full px-4 py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl">
                {t('nav.register')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>

    {/* Reservation Modal */}
    <ReservationModal
      isOpen={showReservation}
      onClose={() => setShowReservation(false)}
    />
    </>
  );
}
