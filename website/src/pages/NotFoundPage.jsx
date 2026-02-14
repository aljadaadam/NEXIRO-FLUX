import { Link } from 'react-router-dom';
import { Home, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-8">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-8xl font-display font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h2>
        <p className="text-dark-400 mb-8">
          {isRTL
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>

        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          <Arrow className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
