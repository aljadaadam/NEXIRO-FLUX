import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, ChevronLeft, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const configs = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    titleAr: 'تم الدفع بنجاح!',
    titleEn: 'Payment Successful!',
    descAr: 'تم تأكيد عملية الدفع. شكراً لك!',
    descEn: 'Your payment has been confirmed. Thank you!',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    titleAr: 'فشل الدفع',
    titleEn: 'Payment Failed',
    descAr: 'حدث خطأ أثناء عملية الدفع. يمكنك المحاولة مرة أخرى.',
    descEn: 'An error occurred during payment. You can try again.',
  },
  cancelled: {
    icon: AlertCircle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    titleAr: 'تم إلغاء الدفع',
    titleEn: 'Payment Cancelled',
    descAr: 'تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ.',
    descEn: 'Payment was cancelled. No amount was charged.',
  },
};

export default function CheckoutResultPage({ type = 'success' }) {
  const [params] = useSearchParams();
  const { isRTL } = useLanguage();
  const paymentId = params.get('payment_id');
  const cfg = configs[type] || configs.success;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md text-center">
        <div className={`w-24 h-24 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-12 h-12 ${cfg.color}`} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{isRTL ? cfg.titleAr : cfg.titleEn}</h1>
        <p className="text-dark-400 mb-6">{isRTL ? cfg.descAr : cfg.descEn}</p>
        {paymentId && (
          <p className="text-dark-500 text-sm mb-6">
            {isRTL ? 'رقم العملية:' : 'Transaction:'} #{paymentId}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {type === 'success' ? (
            <Link
              to={`/setup?payment_ref=${paymentId || ''}&template=${params.get('template') || ''}&plan=${params.get('plan') || ''}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-all"
            >
              {isRTL ? 'متابعة إعداد الموقع →' : 'Continue to Site Setup →'}
            </Link>
          ) : (
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:shadow-lg transition-all"
            >
              {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          )}
          {type !== 'success' && (
            <Link
              to="/checkout"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
            </Link>
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-dark-600 text-[11px]">
          <Shield className="w-3 h-3" />
          NEXIRO-FLUX
        </div>
      </div>
    </div>
  );
}
