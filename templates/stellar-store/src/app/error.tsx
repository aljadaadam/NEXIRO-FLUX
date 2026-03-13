'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">حدث خطأ</h1>
        <p className="text-navy-400 mb-8">
          عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
        </p>
        <button
          onClick={reset}
          className="inline-block px-8 py-3 text-sm font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
