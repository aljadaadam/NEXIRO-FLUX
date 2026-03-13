import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-navy-950 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gold-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">الصفحة غير موجودة</h1>
        <p className="text-navy-400 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 text-sm font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20"
        >
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
