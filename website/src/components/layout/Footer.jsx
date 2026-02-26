import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import ReservationModal from '../common/ReservationModal';

export default function Footer() {
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [showReservation, setShowReservation] = useState(false);

  const footerLinks = {
    product: [
      { label: isRTL ? 'القوالب' : 'Templates', to: '/templates' },
      { label: isRTL ? 'الأسعار' : 'Pricing', to: '/pricing' },
      { label: isRTL ? 'الميزات' : 'Features', to: '/#features' },
      { label: isRTL ? 'العروض التجريبية' : 'Live Demos', to: '/demo/ycz-store' },
    ],
    company: [
      { label: isRTL ? 'الرئيسية' : 'Home', to: '/' },
      { label: isRTL ? 'احجز الآن' : 'Book Now', to: isAuthenticated ? '/templates' : '#reservation', action: !isAuthenticated ? () => setShowReservation(true) : null },
      { label: isRTL ? 'تسجيل الدخول' : 'Login', to: '/login' },
      { label: isRTL ? 'تواصل معنا' : 'Contact', to: 'mailto:info@nexiro-flux.com' },
    ],
    support: [
      { label: isRTL ? 'الأسعار والخطط' : 'Pricing & Plans', to: '/pricing' },
      { label: isRTL ? 'الدعم الفني' : 'Technical Support', to: 'mailto:support@nexiro-flux.com' },
      { label: isRTL ? 'القوالب' : 'Templates', to: '/templates' },
    ],
    legal: [
      { label: isRTL ? 'الشروط والأحكام' : 'Terms of Service', to: '/terms' },
      { label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy', to: '/privacy' },
      { label: isRTL ? 'سياسة الاسترجاع' : 'Refund Policy', to: '/refund' },
    ],
  };

  return (
    <>
    <footer className="relative bg-dark-950 border-t border-white/5">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold">
                <span className="text-white">NEXIRO</span>
                <span className="text-primary-400">-</span>
                <span className="gradient-text">FLUX</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: 'https://x.com/nexiroflux' },
                { Icon: Instagram, href: 'https://instagram.com/nexiroflux' },
                { Icon: Linkedin, href: 'https://linkedin.com/company/nexiroflux' },
                { Icon: Github, href: 'https://github.com/nexiroflux' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary-500/20 border border-white/5 hover:border-primary-500/30 flex items-center justify-center text-dark-400 hover:text-primary-400 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                {t(`footer.${key}`)}
              </h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    {link.to.startsWith('mailto:') ? (
                      <a
                        href={link.to}
                        className="text-dark-400 hover:text-primary-400 text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : link.action ? (
                      <button
                        onClick={link.action}
                        className="text-dark-400 hover:text-primary-400 text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-dark-400 hover:text-primary-400 text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} NEXIRO-FLUX. {t('footer.rights')}.
          </p>
          <div className="flex items-center gap-6">
            <a href="mailto:info@nexiro-flux.com" className="flex items-center gap-2 text-dark-500 hover:text-dark-300 text-sm transition-colors">
              <Mail className="w-3.5 h-3.5" />
              info@nexiro-flux.com
            </a>
          </div>
        </div>
      </div>
    </footer>

    <ReservationModal
      isOpen={showReservation}
      onClose={() => setShowReservation(false)}
    />
    </>
  );
}
