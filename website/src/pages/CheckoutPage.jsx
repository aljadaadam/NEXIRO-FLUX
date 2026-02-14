import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, Landmark, Bitcoin, Wallet, Loader2, CheckCircle2,
  XCircle, Clock, Copy, ExternalLink, ArrowRight, Shield,
  Globe, RefreshCw, Upload, AlertCircle, ChevronLeft, QrCode
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const gatewayIcons = {
  paypal: Wallet,
  bank_transfer: Landmark,
  usdt: Bitcoin,
  binance: CreditCard,
};

const gatewayColors = {
  paypal: 'from-blue-500 to-blue-600',
  bank_transfer: 'from-emerald-500 to-emerald-600',
  usdt: 'from-green-500 to-teal-600',
  binance: 'from-yellow-500 to-orange-500',
};

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const productId = params.get('product');
  const productName = params.get('name') || '';
  const productPrice = params.get('price') || '0';

  const [step, setStep] = useState('select'); // select → processing → paying → done
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState('');
  const [checking, setChecking] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Customer fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Detect country (simple)
  const [country, setCountry] = useState(null);
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setCountry(d.country_code))
      .catch(() => setCountry(null));
  }, []);

  // Load gateways
  const fetchGateways = useCallback(async () => {
    setLoading(true);
    try {
      const q = country ? `?country=${country}` : '';
      const data = await api.getEnabledPaymentGateways(country);
      setGateways(data.gateways || []);
    } catch (err) {
      console.error('Failed to load gateways:', err);
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    if (country !== null) fetchGateways();
  }, [country, fetchGateways]);

  // Copy to clipboard
  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // ─── Start Payment ───
  const handlePay = async () => {
    if (!selectedGateway) return;
    if (!customerEmail.trim()) {
      setError(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }
    setError(null);
    setProcessing(true);

    try {
      const result = await api.initCheckout({
        gateway_id: selectedGateway.id,
        amount: productPrice,
        currency: 'USD',
        product_id: productId,
        description: productName,
        customer_name: customerName,
        customer_email: customerEmail,
        country,
      });

      setPaymentId(result.paymentId);
      setPaymentResult(result);

      // PayPal → redirect
      if (result.method === 'redirect' && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      // Binance → redirect or show QR
      if (result.method === 'qr_or_redirect' && result.checkoutUrl) {
        setStep('paying');
      }

      // USDT → show wallet
      if (result.method === 'manual_crypto') {
        setStep('paying');
      }

      // Bank → show details
      if (result.method === 'manual_bank') {
        setStep('paying');
      }
    } catch (err) {
      setError(err.message || (isRTL ? 'فشل في بدء الدفع' : 'Payment failed'));
    } finally {
      setProcessing(false);
    }
  };

  // ─── Check USDT ───
  const handleCheckUsdt = async () => {
    if (!paymentId) return;
    setChecking(true);
    try {
      const result = await api.checkUsdtPayment(paymentId);
      if (result.confirmed) {
        setStep('done');
      } else {
        setError(isRTL ? 'لم يتم العثور على تحويل مطابق بعد. حاول خلال دقائق.' : 'No matching transfer found yet. Try again in a few minutes.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  // ─── Upload Receipt ───
  const handleUploadReceipt = async () => {
    if (!receiptUrl.trim()) {
      setError(isRTL ? 'يرجى إدخال رابط الإيصال' : 'Please enter receipt URL');
      return;
    }
    setUploadingReceipt(true);
    try {
      await api.uploadBankReceipt(paymentId, { receipt_url: receiptUrl, notes: receiptNotes });
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };

  // ─── Check Binance ───
  const handleCheckBinance = async () => {
    if (!paymentId) return;
    setChecking(true);
    try {
      const result = await api.checkPaymentStatusPublic(paymentId);
      if (result.status === 'completed') {
        setStep('done');
      } else {
        setError(isRTL ? 'لم يتم تأكيد الدفع بعد' : 'Payment not confirmed yet');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        {/* Card */}
        <div className="bg-[#0d1221] border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{isRTL ? 'الدفع الآمن' : 'Secure Checkout'}</h1>
                <p className="text-dark-400 text-xs">{isRTL ? 'جميع المدفوعات مشفرة ومحمية' : 'All payments are encrypted and secure'}</p>
              </div>
            </div>
            {productName && (
              <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-dark-300 text-sm">{productName}</span>
                <span className="text-white font-bold text-lg">${productPrice}</span>
              </div>
            )}
          </div>

          {/* ═══ Step: Select Gateway ═══ */}
          {step === 'select' && (
            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-dark-300">{isRTL ? 'بياناتك' : 'Your Information'}</h3>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder={isRTL ? 'البريد الإلكتروني *' : 'Email Address *'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50"
                  dir="ltr"
                />
              </div>

              {/* Gateway Selection */}
              <div>
                <h3 className="text-sm font-medium text-dark-300 mb-3">{isRTL ? 'اختر طريقة الدفع' : 'Choose Payment Method'}</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : gateways.length === 0 ? (
                  <div className="text-center py-8 text-dark-500 text-sm">
                    {isRTL ? 'لا توجد بوابات دفع متاحة حالياً' : 'No payment gateways available'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gateways.map(gw => {
                      const Icon = gatewayIcons[gw.type] || CreditCard;
                      const color = gatewayColors[gw.type] || 'from-gray-500 to-gray-600';
                      const isSelected = selectedGateway?.id === gw.id;
                      return (
                        <button
                          key={gw.id}
                          onClick={() => setSelectedGateway(gw)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-primary-500/50 bg-primary-500/5 shadow-lg shadow-primary-500/5'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-start">
                            <p className={`font-medium ${isSelected ? 'text-white' : 'text-dark-300'}`}>
                              {isRTL ? gw.name : (gw.name_en || gw.name)}
                            </p>
                            <p className="text-dark-500 text-xs mt-0.5">
                              {gw.type === 'paypal' && (isRTL ? 'دفع فوري عبر PayPal' : 'Instant PayPal payment')}
                              {gw.type === 'binance' && (isRTL ? 'دفع فوري عبر Binance Pay' : 'Instant Binance Pay')}
                              {gw.type === 'usdt' && (isRTL ? `تحويل USDT (${gw.config?.network || 'TRC20'})` : `USDT Transfer (${gw.config?.network || 'TRC20'})`)}
                              {gw.type === 'bank_transfer' && (isRTL ? 'تحويل بنكي' : 'Bank Transfer')}
                            </p>
                          </div>
                          {gw.is_default && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold border border-yellow-500/20">
                              {isRTL ? 'موصى' : 'Recommended'}
                            </span>
                          )}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-600'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={!selectedGateway || processing}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    {isRTL ? `ادفع $${productPrice}` : `Pay $${productPrice}`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ═══ Step: Paying ═══ */}
          {step === 'paying' && paymentResult && (
            <div className="p-6 space-y-5">
              {/* Binance Pay */}
              {paymentResult.method === 'qr_or_redirect' && (
                <>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{isRTL ? 'الدفع عبر Binance Pay' : 'Pay with Binance Pay'}</h3>
                    <p className="text-dark-400 text-sm">
                      {isRTL ? 'افتح تطبيق Binance واكمل الدفع' : 'Open Binance app and complete payment'}
                    </p>
                    <a
                      href={paymentResult.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isRTL ? 'فتح Binance Pay' : 'Open Binance Pay'}
                    </a>
                  </div>
                  <button
                    onClick={handleCheckBinance}
                    disabled={checking}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isRTL ? 'تحقق من حالة الدفع' : 'Check Payment Status'}
                  </button>
                </>
              )}

              {/* USDT */}
              {paymentResult.method === 'manual_crypto' && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                      <Bitcoin className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{isRTL ? 'أرسل USDT' : 'Send USDT'}</h3>
                    <p className="text-dark-400 text-sm">
                      {isRTL ? `عبر شبكة ${paymentResult.network}` : `via ${paymentResult.network} network`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-dark-500 text-xs mb-1">{isRTL ? 'المبلغ المطلوب' : 'Amount Required'}</p>
                    <p className="text-3xl font-bold text-white">{paymentResult.amount} <span className="text-lg text-dark-400">USDT</span></p>
                  </div>

                  {/* Wallet Address */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                    <p className="text-dark-500 text-xs mb-2">{isRTL ? 'عنوان المحفظة' : 'Wallet Address'}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-white font-mono break-all bg-white/5 px-3 py-2 rounded-lg">{paymentResult.walletAddress}</code>
                      <button
                        onClick={() => copyText(paymentResult.walletAddress, 'wallet')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-dark-400 hover:text-white transition-all flex-shrink-0"
                      >
                        {copied === 'wallet' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-dark-500 text-[11px] mt-2 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {isRTL ? `الشبكة: ${paymentResult.network}` : `Network: ${paymentResult.network}`}
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{isRTL ? paymentResult.instructions?.ar : paymentResult.instructions?.en}</span>
                  </div>

                  {/* Check button */}
                  <button
                    onClick={handleCheckUsdt}
                    disabled={checking}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isRTL ? 'تحقق من الدفع' : 'Verify Payment'}
                  </button>
                </>
              )}

              {/* Bank Transfer */}
              {paymentResult.method === 'manual_bank' && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                      <Landmark className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</h3>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl divide-y divide-white/5">
                    {Object.entries(paymentResult.bankDetails).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-3">
                        <span className="text-dark-500 text-xs capitalize">{k.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{v}</span>
                          <button
                            onClick={() => copyText(v, k)}
                            className="text-dark-500 hover:text-white transition-colors"
                          >
                            {copied === k ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reference */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                    <span className="text-primary-400 text-xs font-medium">{isRTL ? 'رقم المرجع' : 'Reference'}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-white text-sm font-mono">{paymentResult.referenceId}</code>
                      <button onClick={() => copyText(paymentResult.referenceId, 'ref')} className="text-dark-500 hover:text-white">
                        {copied === 'ref' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Upload Receipt */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-dark-300">{isRTL ? 'رفع إيصال الدفع' : 'Upload Payment Receipt'}</h4>
                    <input
                      type="url"
                      value={receiptUrl}
                      onChange={e => setReceiptUrl(e.target.value)}
                      placeholder={isRTL ? 'رابط صورة الإيصال' : 'Receipt image URL'}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50"
                      dir="ltr"
                    />
                    <textarea
                      value={receiptNotes}
                      onChange={e => setReceiptNotes(e.target.value)}
                      placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-dark-600 outline-none focus:border-primary-500/50 resize-none"
                    />
                    <button
                      onClick={handleUploadReceipt}
                      disabled={uploadingReceipt}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {uploadingReceipt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {isRTL ? 'إرسال الإيصال' : 'Submit Receipt'}
                    </button>
                  </div>
                </>
              )}

              {/* Error in paying step */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ═══ Step: Done ═══ */}
          {step === 'done' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{isRTL ? 'تم بنجاح!' : 'Payment Successful!'}</h3>
              <p className="text-dark-400">
                {paymentResult?.method === 'manual_bank'
                  ? (isRTL ? 'تم استلام الإيصال. سيتم تأكيد الدفع خلال 24 ساعة.' : 'Receipt received. Payment will be confirmed within 24 hours.')
                  : (isRTL ? 'تم تأكيد الدفع. شكراً لك!' : 'Payment confirmed. Thank you!')}
              </p>
              {paymentId && (
                <p className="text-dark-500 text-xs">
                  {isRTL ? 'رقم العملية:' : 'Transaction ID:'} #{paymentId}
                </p>
              )}
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:shadow-lg transition-all"
              >
                {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-center gap-2 text-dark-600 text-[11px]">
            <Shield className="w-3 h-3" />
            {isRTL ? 'مدفوعات مشفرة ومحمية — NEXIRO-FLUX' : 'Encrypted & Secure — NEXIRO-FLUX'}
          </div>
        </div>
      </div>
    </div>
  );
}
