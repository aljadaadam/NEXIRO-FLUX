import { Link } from 'react-router-dom';
import { ChevronLeft, Ban, AlertTriangle, ShieldX, Eye, MessageCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/common/SEO';

export default function RefundPage() {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO
        title="Refund Policy"
        titleAr="سياسة الاسترجاع"
        description="Read NEXIRO-FLUX refund policy. Understand our refund terms, conditions, and how to request support."
        descriptionAr="اقرأ سياسة الاسترجاع في NEXIRO-FLUX. تعرّف على شروط الاسترجاع وكيفية طلب الدعم."
        canonicalPath="/refund"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-8 transition-colors group">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center">
            <Ban className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-3">
            {isRTL ? 'سياسة الاسترجاع' : 'Refund Policy'}
          </h1>
          <p className="text-dark-400 text-sm">
            {isRTL ? 'آخر تحديث: فبراير 2026' : 'Last updated: February 2026'}
          </p>
        </div>

        {/* Main Notice - No Refunds */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl border border-red-500/20 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldX className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">
                {isRTL ? '⚠️ لا يوجد استرجاع بعد المعاينة والشراء' : '⚠️ No Refunds After Preview & Purchase'}
              </h2>
              <p className="text-dark-300 text-sm leading-relaxed">
                {isRTL
                  ? 'نظراً لطبيعة المنتجات الرقمية وإمكانية معاينة القالب بالكامل قبل الشراء عبر العرض التجريبي المباشر (Live Demo)، فإن جميع عمليات الشراء نهائية وغير قابلة للاسترجاع أو الاسترداد.'
                  : 'Due to the nature of digital products and the ability to fully preview the template before purchase through the Live Demo, all purchases are final and non-refundable.'}
              </p>
              <p className="text-dark-400 text-sm leading-relaxed mt-3">
                {isRTL
                  ? 'ملاحظة: شحن المحفظة يُضاف كرصيد للاستخدام داخل المنصة فقط، ولا يمكن سحب الرصيد إلى البنك مرة أخرى.'
                  : 'Note: Wallet top-ups are added as platform credit only and cannot be withdrawn back to your bank.'}
              </p>
            </div>
          </div>
        </div>

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-white">{isRTL ? 'معاينة كاملة متاحة' : 'Full Preview Available'}</h3>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              {isRTL
                ? 'نوفر عرض تجريبي مباشر (Live Demo) لكل قالب يمكنك تجربته بالكامل قبل الشراء. هذا يمنحك فرصة كاملة لتقييم القالب والتأكد من مناسبته لاحتياجاتك.'
                : 'We provide a Live Demo for each template that you can fully test before purchasing. This gives you a complete opportunity to evaluate the template and ensure it meets your needs.'}
            </p>
          </div>

          <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white">{isRTL ? 'منتج رقمي' : 'Digital Product'}</h3>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              {isRTL
                ? 'القوالب والخدمات المقدمة هي منتجات رقمية يتم تفعيلها فوراً بعد الدفع. بمجرد التفعيل، يصبح المنتج مستخدماً ولا يمكن "إرجاعه" كالمنتجات المادية.'
                : 'Templates and services provided are digital products that are activated immediately after payment. Once activated, the product is considered used and cannot be "returned" like physical products.'}
            </p>
          </div>
        </div>

        {/* What We Guarantee */}
        <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{isRTL ? 'ما نضمنه لك' : 'What We Guarantee'}</h2>
          </div>
          <ul className="space-y-3">
            {(isRTL ? [
              'دعم فني مستمر لحل أي مشاكل تقنية تواجهك بعد الشراء',
              'تحديثات مجانية للقالب خلال فترة اشتراكك النشط',
              'فترة تجريبية مجانية 14 يوم قبل الدفع لتقييم الخدمة',
              'مساعدة في الإعداد والتخصيص من فريقنا المتخصص',
              'ضمان وقت تشغيل 99.9% لموقعك',
            ] : [
              'Continuous technical support to resolve any issues after purchase',
              'Free template updates during your active subscription',
              'Free 14-day trial before payment to evaluate the service',
              'Setup and customization assistance from our specialized team',
              '99.9% uptime guarantee for your site',
            ]).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-dark-300 text-sm">
                <span className="text-emerald-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Exceptions */}
        <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{isRTL ? 'استثناءات محدودة' : 'Limited Exceptions'}</h2>
          </div>
          <p className="text-dark-300 text-sm leading-relaxed mb-4">
            {isRTL
              ? 'في حالات نادرة واستثنائية، قد ننظر في طلب الاسترداد فقط في الحالات التالية:'
              : 'In rare and exceptional cases, we may consider a refund request only in the following situations:'}
          </p>
          <ul className="space-y-2">
            {(isRTL ? [
              'خلل تقني كبير في القالب لم نتمكن من إصلاحه خلال 7 أيام عمل',
              'تم خصم المبلغ أكثر من مرة بسبب خطأ في بوابة الدفع (الخصم المكرر فقط)',
            ] : [
              'A major technical defect in the template that we were unable to fix within 7 business days',
              'Amount was charged more than once due to a payment gateway error (duplicate charge only)',
            ]).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-dark-400 text-sm">
                <span className="text-blue-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center bg-white/5 rounded-2xl border border-white/5 p-6">
          <p className="text-dark-400 text-sm">
            {isRTL
              ? 'لأي استفسارات حول سياسة الاسترجاع، تواصل معنا على:'
              : 'For any questions about this refund policy, contact us at:'}
          </p>
          <a href="mailto:support@nexiro-flux.com" className="text-red-400 hover:text-red-300 font-medium text-sm mt-1 inline-block">
            support@nexiro-flux.com
          </a>
        </div>
      </div>
    </div>
  );
}
