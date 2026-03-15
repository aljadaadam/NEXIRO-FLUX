'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { storeApi } from '@/lib/api';
import type { PaymentGateway } from '@/lib/types';
import { Search, ShoppingCart, Loader2, X, CheckCircle, AlertCircle, Upload } from 'lucide-react';

const CAT_PARAM_MAP: Record<string, string> = {
  starlink: 'ستارلينك',
  bein: 'beIN Sports',
  games: 'ألعاب',
  offers: 'عروض خاصة',
};



interface ProductField {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'number' | 'tel';
}

interface DisplayProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  qnt?: number;
  custom_fields?: ProductField[];
}

export default function ServicesPage() {
  return (
    <Suspense>
      <ServicesContent />
    </Suspense>
  );
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');
  const [showLogin, setShowLogin] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['الكل']);
  const [loading, setLoading] = useState(true);
  const [catApplied, setCatApplied] = useState(false);

  // Order modal state
  const [orderProduct, setOrderProduct] = useState<DisplayProduct | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');

  // Payment method state
  const [enabledGateways, setEnabledGateways] = useState<PaymentGateway[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bankak'>('wallet');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [receiptRef, setReceiptRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');

  useEffect(() => {
    storeApi.getProducts()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.products || [];
        if (list.length > 0) {
          const mapped = list.map((p: Record<string, unknown>) => {
            let custom_fields = p.requires_custom_json || p.customFields || p.custom_fields;
            if (typeof custom_fields === 'string') {
              try { custom_fields = JSON.parse(custom_fields); } catch { custom_fields = []; }
            }
            return {
              id: p.id as number,
              name: (p.arabic_name || p.name) as string,
              category: (p.group_name || p.category || '') as string,
              price: (p.final_price || p.price) as number,
              image: (p.image || '/images/default-product.svg') as string,
              qnt: p.qnt as number | undefined,
              custom_fields: Array.isArray(custom_fields) ? custom_fields as ProductField[] : [],
            };
          });
          setProducts(mapped);
          const cats = ['الكل', ...Array.from(new Set(mapped.map((p: DisplayProduct) => p.category).filter(Boolean)))];
          setCategories(cats as string[]);
        }
      })
      .catch(() => {
      })
      .finally(() => setLoading(false));

    // Load enabled payment gateways
    storeApi.getEnabledGateways()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.gateways || [];
        setEnabledGateways(list);
      })
      .catch(() => {});
  }, []);

  // Set page title
  useEffect(() => { document.title = 'التصنيفات | متجر ستيلار'; }, []);

  // Escape key closes modals
  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (orderProduct && !orderLoading) setOrderProduct(null);
      else if (showLogin) setShowLogin(false);
    }
  }, [orderProduct, orderLoading, showLogin]);
  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [handleEscKey]);

  // Apply ?cat= param when categories load
  useEffect(() => {
    if (catParam && !catApplied && categories.length > 1) {
      const mapped = CAT_PARAM_MAP[catParam];
      if (mapped && categories.includes(mapped)) {
        setActiveCategory(mapped);
      }
      setCatApplied(true);
    }
  }, [catParam, categories, catApplied]);

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === 'الكل' || p.category === activeCategory;
    const matchSearch = !search || p.name.includes(search);
    return matchCategory && matchSearch;
  });

  const handleOrderClick = (product: DisplayProduct) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setShowLogin(true);
      return;
    }
    setOrderProduct(product);
    setOrderNotes('');
    setFieldValues({});
    setOrderSuccess('');
    setOrderError('');
    setPaymentMethod('wallet');
    setSelectedGateway(null);
    setReceiptRef('');
    setReceiptFile(null);
    setReceiptPreview('');
  };

  const handleSubmitOrder = async () => {
    if (!orderProduct) return;
    // Validate required custom fields
    const fields = orderProduct.custom_fields || [];
    for (const f of fields) {
      if (f.required !== false && !fieldValues[f.name]?.trim()) {
        setOrderError(`يرجى تعبئة حقل "${f.label}"`);
        return;
      }
    }
    // Validate bankak receipt
    if (paymentMethod === 'bankak') {
      if (!receiptRef.trim() && !receiptFile) {
        setOrderError('يرجى إدخال رقم الإيصال أو إرفاق صورة الإيصال');
        return;
      }
    }
    // Validate wallet balance
    if (paymentMethod === 'wallet') {
      try {
        const stored = localStorage.getItem('customer');
        if (stored) {
          const cust = JSON.parse(stored);
          if (typeof cust.wallet_balance === 'number' && cust.wallet_balance < orderProduct.price) {
            setOrderError(`رصيد المحفظة غير كافي (${cust.wallet_balance.toLocaleString()} SDG). يرجى شحن المحفظة أولاً.`);
            return;
          }
        }
      } catch { /* ignore parse errors */ }
    }
    setOrderLoading(true);
    setOrderError('');
    // Build notes with field values
    const fieldParts = fields
      .filter(f => fieldValues[f.name]?.trim())
      .map(f => `${f.label}: ${fieldValues[f.name].trim()}`);
    // Add bankak receipt info to notes
    if (paymentMethod === 'bankak') {
      if (selectedGateway) {
        fieldParts.push(`بوابة الدفع: ${selectedGateway.name}`);
      }
      if (receiptRef.trim()) {
        fieldParts.push(`رقم الإيصال: ${receiptRef.trim()}`);
      }
    }
    const allNotes = [...fieldParts, ...(orderNotes.trim() ? [orderNotes.trim()] : [])].join('\n');
    try {
      const orderData: Record<string, unknown> = {
        product_id: orderProduct.id,
        product_name: orderProduct.name,
        quantity: 1,
        payment_method: paymentMethod,
        notes: allNotes || undefined,
      };
      if (paymentMethod === 'bankak' && receiptPreview) {
        orderData.receipt_image = receiptPreview;
      }
      await storeApi.createOrder(orderData as Parameters<typeof storeApi.createOrder>[0]);
      setOrderSuccess(paymentMethod === 'bankak'
        ? 'تم تقديم الطلب بنجاح! سيتم مراجعة الإيصال وتأكيد الطلب.'
        : 'تم تقديم الطلب بنجاح! يمكنك متابعته من صفحة حسابي.');
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('انتهت الجلسة')) {
        setOrderProduct(null);
        setShowLogin(true);
      } else {
        setOrderError(e instanceof Error ? e.message : 'خطأ في تقديم الطلب');
      }
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              <span className="text-gold-gradient">التصنيفات</span>
            </h1>
            <p className="text-navy-400">تصفح جميع المنتجات والخدمات المتاحة</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-navy-900/60 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                    : 'bg-navy-900/60 text-navy-300 border border-navy-700/50 hover:border-gold-500/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product, idx) => {
              const outOfStock = product.qnt != null && product.qnt <= 0;
              return (
              <div
                key={product.id}
                onClick={() => !outOfStock && handleOrderClick(product)}
                className={`group rounded-2xl bg-navy-900/60 border border-navy-700/40 hover:border-gold-500/30 transition-all hover:-translate-y-1 overflow-hidden animate-fadeInUp ${outOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Image area */}
                <div className="relative h-32 sm:h-40 bg-gradient-to-b from-navy-800/60 to-navy-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image || '/images/default-product.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 bg-navy-950/60 flex items-center justify-center">
                      <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-lg">نفد المخزون</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3 sm:p-5">
                  {product.category && (
                    <span className="text-[10px] sm:text-xs text-gold-500 font-medium bg-gold-500/10 px-2 py-1 rounded-lg">
                      {product.category}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-sm sm:text-base mt-2 sm:mt-3 mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gold-500 font-black text-sm sm:text-lg">{product.price.toLocaleString()} <span className="text-[10px] sm:text-xs text-navy-500">SDG</span></span>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!outOfStock) handleOrderClick(product); }}
                      disabled={outOfStock}
                      aria-label={`طلب ${product.name}`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gold-500/10 disabled:hover:text-gold-500"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-navy-400 text-lg">لا توجد منتجات مطابقة</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Order Confirmation Modal */}
      {orderProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop" onClick={() => !orderLoading && setOrderProduct(null)} role="dialog" aria-modal="true" aria-label="تأكيد الطلب">
          <div className="relative w-full max-w-md rounded-2xl bg-navy-900/95 backdrop-blur-2xl border border-navy-700/60 shadow-2xl shadow-black/40 animate-fadeInUp" onClick={e => e.stopPropagation()}>
            <button onClick={() => !orderLoading && setOrderProduct(null)} className="absolute top-4 left-4 p-1.5 text-navy-400 hover:text-white transition-colors rounded-lg hover:bg-navy-800/50">
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-black text-white mb-6 text-center">
                تأكيد <span className="text-gold-gradient">الطلب</span>
              </h2>

              {/* Product summary */}
              <div className="flex items-center gap-4 p-4 bg-navy-800/50 rounded-xl mb-6">
                <img src={orderProduct.image} alt={orderProduct.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{orderProduct.name}</h3>
                  <p className="text-navy-400 text-xs">{orderProduct.category}</p>
                  <p className="text-gold-500 font-black mt-1">{orderProduct.price.toLocaleString()} SDG</p>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-4">
                <label className="block text-navy-400 text-sm mb-2">طريقة الدفع</label>
                <div className="space-y-2">
                  {/* Wallet option */}
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('wallet'); setSelectedGateway(null); }}
                    className={`w-full p-3 rounded-xl text-sm font-medium text-right flex items-center gap-3 transition-all ${
                      paymentMethod === 'wallet'
                        ? 'bg-navy-800/50 border-2 border-gold-500/50 text-gold-500'
                        : 'bg-navy-800/30 border border-navy-700/40 text-navy-300 hover:border-navy-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'wallet' ? 'border-gold-500' : 'border-navy-600'}`}>
                      {paymentMethod === 'wallet' && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                    </div>
                    المحفظة (خصم من الرصيد)
                  </button>

                  {/* Bankak gateways */}
                  {enabledGateways.map(gw => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => { setPaymentMethod('bankak'); setSelectedGateway(gw); }}
                      className={`w-full p-3 rounded-xl text-sm font-medium text-right flex items-center gap-3 transition-all ${
                        paymentMethod === 'bankak' && selectedGateway?.id === gw.id
                          ? 'bg-navy-800/50 border-2 border-gold-500/50 text-gold-500'
                          : 'bg-navy-800/30 border border-navy-700/40 text-navy-300 hover:border-navy-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'bankak' && selectedGateway?.id === gw.id ? 'border-gold-500' : 'border-navy-600'}`}>
                        {paymentMethod === 'bankak' && selectedGateway?.id === gw.id && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                      </div>
                      {gw.logo && <img src={gw.logo} alt={gw.name} className="w-6 h-6 rounded object-contain" />}
                      {gw.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bankak Bank Details */}
              {paymentMethod === 'bankak' && selectedGateway && (
                <div className="mb-4 p-4 bg-navy-800/50 border border-gold-500/20 rounded-xl space-y-3">
                  <h4 className="text-gold-500 font-bold text-sm flex items-center gap-2">
                    {selectedGateway.logo && <img src={selectedGateway.logo} alt="" className="w-5 h-5 rounded object-contain" />}
                    بيانات التحويل
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-navy-400">رقم الحساب:</span>
                      <span className="text-white font-bold" dir="ltr">{selectedGateway.config?.account_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-navy-400">اسم الحساب:</span>
                      <span className="text-white font-bold">{selectedGateway.config?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-navy-400">المبلغ المطلوب:</span>
                      <span className="text-gold-500 font-black">{orderProduct.price.toLocaleString()} SDG</span>
                    </div>
                    {selectedGateway.config?.receipt_note && (
                      <div className="mt-2 p-2 bg-gold-500/5 border border-gold-500/10 rounded-lg text-navy-300 text-xs">
                        💡 {selectedGateway.config.receipt_note}
                      </div>
                    )}
                  </div>

                  {/* Receipt reference */}
                  <div className="pt-2">
                    <label className="block text-navy-400 text-xs mb-1.5">رقم الإيصال / مرجع التحويل <span className="text-red-400">*</span></label>
                    <input
                      value={receiptRef}
                      onChange={e => setReceiptRef(e.target.value)}
                      placeholder="أدخل رقم الإيصال أو مرجع العملية"
                      className="w-full px-3 py-2.5 bg-navy-900/60 border border-navy-700/40 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
                      dir="ltr"
                    />
                  </div>

                  {/* Receipt image upload */}
                  <div>
                    <label className="block text-navy-400 text-xs mb-1.5">صورة الإيصال (اختياري)</label>
                    <label className="flex items-center gap-2 px-3 py-2.5 bg-navy-900/60 border border-navy-700/40 rounded-xl text-navy-400 hover:border-gold-500/30 transition-all cursor-pointer text-sm">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span className="truncate">{receiptFile ? receiptFile.name : 'اختر صورة الإيصال'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setOrderError('حجم الصورة يجب أن يكون أقل من 5MB');
                              return;
                            }
                            setReceiptFile(file);
                            const reader = new FileReader();
                            reader.onload = () => setReceiptPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {receiptPreview && (
                      <div className="mt-2 relative">
                        <img src={receiptPreview} alt="إيصال" className="w-full max-h-40 object-contain rounded-lg border border-navy-700/30" />
                        <button
                          type="button"
                          onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                          className="absolute top-1 left-1 p-1 bg-navy-900/80 rounded-full text-navy-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {orderProduct.custom_fields && orderProduct.custom_fields.length > 0 && (
                <div className="mb-4 space-y-3">
                  {orderProduct.custom_fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-navy-400 text-sm mb-2">
                        {field.label} {field.required !== false && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type={field.type || 'text'}
                        value={fieldValues[field.name] || ''}
                        onChange={e => setFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.label}
                        required={field.required !== false}
                        className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-navy-400 text-sm mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={2}
                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all resize-none text-sm"
                />
              </div>

              {/* Messages */}
              {orderError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {orderError}
                </div>
              )}
              {orderSuccess && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {orderSuccess}
                </div>
              )}

              {/* Actions */}
              {orderSuccess ? (
                <button onClick={() => setOrderProduct(null)} className="w-full py-3.5 text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all">
                  إغلاق
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setOrderProduct(null)} disabled={orderLoading} className="flex-1 py-3.5 text-sm font-bold text-navy-300 bg-navy-800/60 border border-navy-600/50 rounded-xl hover:text-white transition-all">
                    إلغاء
                  </button>
                  <button onClick={handleSubmitOrder} disabled={orderLoading} className="flex-1 py-3.5 text-base font-bold text-navy-950 bg-gradient-to-l from-gold-500 to-gold-400 rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد الطلب'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onAuth={() => window.dispatchEvent(new Event('auth-change'))} />
    </>
  );
}
