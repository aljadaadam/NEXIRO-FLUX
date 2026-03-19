'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { storeApi } from '@/lib/api';
import type { Customer, Order, PaymentGateway } from '@/lib/types';
import { User, Package, Wallet, Settings, LogOut, Loader2, CheckCircle, Clock, XCircle, AlertCircle, Upload, X, Plus, Ban } from 'lucide-react';

type ActiveTab = 'info' | 'orders' | 'wallet' | 'settings';

const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'قيد الانتظار', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', icon: Clock },
  processing: { label: 'قيد المعالجة', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Clock },
  completed: { label: 'مكتمل', color: 'text-green-400 bg-green-500/10 border-green-500/30', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
  failed: { label: 'فشل', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
};

export default function ProfilePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [allowCancel, setAllowCancel] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Wallet charge state
  const [showCharge, setShowCharge] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [enabledGateways, setEnabledGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [chargeReceiptRef, setChargeReceiptRef] = useState('');
  const [chargeReceiptFile, setChargeReceiptFile] = useState<File | null>(null);
  const [chargeReceiptPreview, setChargeReceiptPreview] = useState('');
  const [chargeLoading, setChargeLoading] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState('');
  const [chargeError, setChargeError] = useState('');
  const [chargeStep, setChargeStep] = useState<'amount' | 'pay'>('amount');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Set page title
  useEffect(() => { document.title = 'حسابي | متجر ستيلار'; }, []);

  // Read tab from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['info', 'orders', 'wallet', 'settings'].includes(tab)) {
      setActiveTab(tab as ActiveTab);
    }
  }, []);

  // Escape key closes modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogin) setShowLogin(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showLogin]);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoading(false); setShowLogin(true); return; }
    try {
      const res = await storeApi.getProfile();
      const c = res.customer || res;
      setCustomer(c);
      setEditName(c.name || '');
      setEditEmail(c.email || '');
      setEditPhone(c.phone || '');
      localStorage.setItem('customer', JSON.stringify(c));
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('customer');
      setShowLogin(true);
    } finally { setLoading(false); }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await storeApi.getOrders();
      setOrders(Array.isArray(res) ? res : res.orders || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => {
    storeApi.getStoreSettings()
      .then((data: Record<string, unknown>) => {
        const c = data?.customization as Record<string, unknown> | undefined;
        if (c?.allow_customer_cancel) setAllowCancel(true);
      })
      .catch(() => {});
  }, []);
  useEffect(() => { if (customer && activeTab === 'orders') loadOrders(); }, [customer, activeTab, loadOrders]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) { setError('يرجى إدخال الاسم'); return; }
    if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const res = await storeApi.updateProfile({ name: editName, email: editEmail, phone: editPhone });
      const c = res.customer || res;
      setCustomer(c);
      localStorage.setItem('customer', JSON.stringify(c));
      window.dispatchEvent(new Event('auth-change'));
      setMessage('تم حفظ التغييرات بنجاح');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطأ في الحفظ');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  const onAuth = () => {
    loadProfile();
    window.dispatchEvent(new Event('auth-change'));
  };

  const tabs = [
    { key: 'info' as ActiveTab, icon: User, label: 'معلوماتي' },
    { key: 'orders' as ActiveTab, icon: Package, label: 'طلباتي' },
    { key: 'wallet' as ActiveTab, icon: Wallet, label: 'المحفظة' },
    { key: 'settings' as ActiveTab, icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">
            <span className="text-gold-gradient">حسابي</span>
          </h1>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>
          ) : !customer ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-navy-500 mx-auto mb-4" />
              <p className="text-navy-400 mb-4">يرجى تسجيل الدخول للوصول إلى حسابك</p>
              <button onClick={() => setShowLogin(true)} className="px-8 py-3 bg-gradient-to-l from-gold-500 to-gold-400 text-navy-950 font-bold rounded-xl">
                تسجيل الدخول
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="glass-card rounded-2xl p-6 h-fit space-y-2">
                {/* User avatar */}
                <div className="text-center mb-4 pb-4 border-b border-navy-700/50">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center mb-3">
                    <User className="w-8 h-8 text-gold-500" />
                  </div>
                  <h3 className="text-white font-bold">{customer.name}</h3>
                  <p className="text-navy-400 text-sm">{customer.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 bg-gold-500/10 px-3 py-1 rounded-full">
                    <Wallet className="w-3.5 h-3.5 text-gold-500" />
                    <span className="text-gold-500 text-sm font-bold">{(customer.wallet_balance || 0).toLocaleString()} SDG</span>
                  </div>
                </div>

                {tabs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === item.key
                          ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                          : 'text-navy-400 hover:text-white hover:bg-navy-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut className="w-5 h-5" />
                  تسجيل خروج
                </button>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-8">
                {/* Messages */}
                {message && (
                  <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {message}
                  </div>
                )}
                {error && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
                )}

                {/* Info Tab */}
                {activeTab === 'info' && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-6">المعلومات الشخصية</h2>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-navy-400 text-sm mb-2">الاسم</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-navy-400 text-sm mb-2">البريد الإلكتروني</label>
                        <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-navy-400 text-sm mb-2">رقم الهاتف</label>
                        <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+249..."
                          className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 transition-all" />
                      </div>
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="px-8 py-3 bg-gradient-to-l from-gold-500 to-gold-400 text-navy-950 font-bold rounded-xl hover:from-gold-400 hover:to-gold-300 transition-all shadow-md shadow-gold-500/20 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        حفظ التغييرات
                      </button>
                    </div>
                  </>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">طلباتي</h2>
                      <span className="text-sm text-navy-400">{orders.length} طلب</span>
                    </div>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-navy-600 mx-auto mb-3" />
                        <p className="text-navy-400">لا توجد طلبات حتى الآن</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => {
                          const st = statusMap[order.status] || statusMap.pending;
                          const StIcon = st.icon;
                          return (
                            <div key={order.id} className="p-4 bg-navy-800/30 border border-navy-700/40 rounded-xl">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-bold text-sm truncate">{order.product_name}</h4>
                                  <p className="text-navy-500 text-xs mt-1">#{order.order_number}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${st.color}`}>
                                  <StIcon className="w-3 h-3" />
                                  {st.label}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-700/30">
                                <span className="text-gold-500 font-bold text-sm">{(order.total_price || 0).toLocaleString()} SDG</span>
                                <span className="text-navy-500 text-xs">{order.created_at ? new Date(order.created_at).toLocaleDateString('ar') : ''}</span>
                              </div>
                              {(order.server_response || order.response) && (
                                <div className="mt-3 p-3 bg-navy-900/50 rounded-lg">
                                  <p className="text-xs text-navy-400 mb-1">الرد:</p>
                                  <p className="text-sm text-white break-all select-all">{order.server_response || order.response}</p>
                                </div>
                              )}
                              {allowCancel && order.status === 'pending' && (
                                <div className="mt-3 pt-3 border-t border-navy-700/30">
                                  <button
                                    onClick={async () => {
                                      if (cancellingId) return;
                                      if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
                                      setCancellingId(order.id);
                                      try {
                                        await storeApi.cancelOrder(order.id);
                                        setMessage('تم إلغاء الطلب بنجاح');
                                        loadOrders();
                                        loadProfile();
                                      } catch (e: unknown) {
                                        setError(e instanceof Error ? e.message : 'خطأ في إلغاء الطلب');
                                      } finally {
                                        setCancellingId(null);
                                      }
                                    }}
                                    disabled={cancellingId === order.id}
                                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                  >
                                    {cancellingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                                    إلغاء الطلب
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Wallet Tab */}
                {activeTab === 'wallet' && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-6">المحفظة</h2>
                    <div className="text-center py-8">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center mb-4">
                        <Wallet className="w-10 h-10 text-gold-500" />
                      </div>
                      <p className="text-navy-400 text-sm mb-1">رصيدك الحالي</p>
                      <p className="text-4xl font-black text-gold-500">{(customer.wallet_balance || 0).toLocaleString()}</p>
                      <p className="text-navy-500 text-sm">SDG</p>

                      {!showCharge ? (
                        <button
                          onClick={() => {
                            setShowCharge(true);
                            setChargeStep('amount');
                            setChargeAmount('');
                            setSelectedGateway(null);
                            setChargeReceiptRef('');
                            setChargeReceiptFile(null);
                            setChargeReceiptPreview('');
                            setChargeSuccess('');
                            setChargeError('');
                            storeApi.getEnabledGateways()
                              .then(data => setEnabledGateways(Array.isArray(data) ? data : data?.gateways || []))
                              .catch(() => {});
                          }}
                          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-all text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          شحن المحفظة
                        </button>
                      ) : chargeSuccess ? (
                        <div className="mt-6 max-w-sm mx-auto">
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2 mb-4">
                            <CheckCircle className="w-4 h-4 shrink-0" /> {chargeSuccess}
                          </div>
                          <button
                            onClick={() => { setShowCharge(false); setChargeSuccess(''); loadProfile(); }}
                            className="w-full py-3 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-all text-sm"
                          >
                            إغلاق
                          </button>
                        </div>
                      ) : (
                        <div className="mt-6 max-w-sm mx-auto text-right space-y-4">
                          {chargeStep === 'amount' && (
                            <>
                              <div>
                                <label className="block text-navy-400 text-sm mb-2">المبلغ المراد شحنه (SDG)</label>
                                <input
                                  type="number"
                                  value={chargeAmount}
                                  onChange={e => setChargeAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                  placeholder="أدخل المبلغ"
                                  min="1"
                                  step="1"
                                  className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
                                  dir="ltr"
                                />
                              </div>
                              <div>
                                <label className="block text-navy-400 text-sm mb-2">اختر بوابة الدفع</label>
                                <div className="space-y-2">
                                  {enabledGateways.length === 0 ? (
                                    <p className="text-navy-500 text-sm text-center py-4">لا توجد بوابات دفع متاحة</p>
                                  ) : (
                                    enabledGateways.map(gw => (
                                      <button
                                        key={gw.id}
                                        type="button"
                                        onClick={() => setSelectedGateway(gw)}
                                        className={`w-full p-3 rounded-xl text-sm font-medium text-right flex items-center gap-3 transition-all ${
                                          selectedGateway?.id === gw.id
                                            ? 'bg-navy-800/50 border-2 border-gold-500/50 text-gold-500'
                                            : 'bg-navy-800/30 border border-navy-700/40 text-navy-300 hover:border-navy-600'
                                        }`}
                                      >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedGateway?.id === gw.id ? 'border-gold-500' : 'border-navy-600'}`}>
                                          {selectedGateway?.id === gw.id && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                                        </div>
                                        {gw.logo && <img src={gw.logo} alt={gw.name} className="w-6 h-6 rounded object-contain" />}
                                        {gw.name}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => setShowCharge(false)}
                                  className="flex-1 py-3 text-sm font-bold text-navy-300 bg-navy-800/60 border border-navy-600/50 rounded-xl hover:text-white transition-all"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => {
                                    if (!chargeAmount || Number(chargeAmount) <= 0) { setChargeError('أدخل مبلغ صحيح'); return; }
                                    if (Number(chargeAmount) > 10000000) { setChargeError('الحد الأقصى للشحن 10,000,000 SDG'); return; }
                                    if (!selectedGateway) { setChargeError('اختر بوابة دفع'); return; }
                                    setChargeError('');
                                    setChargeStep('pay');
                                  }}
                                  disabled={!chargeAmount || !selectedGateway}
                                  className="flex-1 py-3 text-sm font-bold text-navy-950 bg-gold-500 rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50"
                                >
                                  التالي
                                </button>
                              </div>
                            </>
                          )}

                          {chargeStep === 'pay' && selectedGateway && (
                            <>
                              <div className="p-4 bg-navy-800/50 border border-gold-500/20 rounded-xl space-y-3">
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
                                    <span className="text-gold-500 font-black">{Number(chargeAmount).toLocaleString()} SDG</span>
                                  </div>
                                  {selectedGateway.config?.receipt_note && (
                                    <div className="mt-2 p-2 bg-gold-500/5 border border-gold-500/10 rounded-lg text-navy-300 text-xs">
                                      💡 {selectedGateway.config.receipt_note}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-navy-400 text-xs mb-1.5">صورة الإيصال (اختياري)</label>
                                <label className="flex items-center gap-2 px-3 py-2.5 bg-navy-800/50 border border-navy-700/50 rounded-xl text-navy-400 hover:border-gold-500/30 transition-all cursor-pointer text-sm">
                                  <Upload className="w-4 h-4 shrink-0" />
                                  <span className="truncate">{chargeReceiptFile ? chargeReceiptFile.name : 'اختر صورة الإيصال'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                          setChargeError('حجم الصورة يجب أن يكون أقل من 5MB');
                                          return;
                                        }
                                        setChargeReceiptFile(file);
                                        const reader = new FileReader();
                                        reader.onload = () => setChargeReceiptPreview(reader.result as string);
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                {chargeReceiptPreview && (
                                  <div className="mt-2 relative">
                                    <img src={chargeReceiptPreview} alt="إيصال" className="w-full max-h-40 object-contain rounded-lg border border-navy-700/30" />
                                    <button
                                      type="button"
                                      onClick={() => { setChargeReceiptFile(null); setChargeReceiptPreview(''); }}
                                      className="absolute top-1 left-1 p-1 bg-navy-900/80 rounded-full text-navy-400 hover:text-white"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {chargeError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0" /> {chargeError}
                                </div>
                              )}

                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => setChargeStep('amount')}
                                  disabled={chargeLoading}
                                  className="flex-1 py-3 text-sm font-bold text-navy-300 bg-navy-800/60 border border-navy-600/50 rounded-xl hover:text-white transition-all"
                                >
                                  رجوع
                                </button>
                                <button
                                  onClick={async () => {
                                    setChargeLoading(true);
                                    setChargeError('');
                                    try {
                                      const res = await storeApi.initCheckout({
                                        gateway_id: selectedGateway.id,
                                        amount: Number(chargeAmount),
                                        type: 'deposit',
                                      });
                                      const paymentId = res?.payment?.id || res?.paymentId || res?.id;
                                      if (paymentId) {
                                        await storeApi.uploadReceipt(paymentId, {
                                          receipt_url: chargeReceiptPreview || '',
                                          notes: chargeReceiptFile ? 'مرفق: صورة إيصال' : '',
                                        });
                                      }
                                      setChargeSuccess('تم إرسال طلب الشحن بنجاح! سيتم مراجعة الإيصال وإضافة الرصيد لمحفظتك.');
                                    } catch (e: unknown) {
                                      setChargeError(e instanceof Error ? e.message : 'حدث خطأ أثناء إرسال الطلب');
                                    } finally {
                                      setChargeLoading(false);
                                    }
                                  }}
                                  disabled={chargeLoading}
                                  className="flex-1 py-3 text-sm font-bold text-navy-950 bg-gold-500 rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {chargeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال الإيصال'}
                                </button>
                              </div>
                            </>
                          )}

                          {chargeError && chargeStep === 'amount' && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" /> {chargeError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-6">الإعدادات</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-navy-800/30 border border-navy-700/40 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-bold text-sm">تغيير كلمة المرور</h4>
                            <p className="text-navy-500 text-xs mt-1">قم بتحديث كلمة مرور حسابك</p>
                          </div>
                          {!showPasswordForm && (
                            <button onClick={() => { setShowPasswordForm(true); setPasswordMessage(''); setPasswordError(''); }} className="text-sm text-gold-500 hover:text-gold-400 font-medium">
                              تغيير
                            </button>
                          )}
                        </div>
                        {showPasswordForm && (
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="block text-navy-400 text-xs mb-1.5">كلمة المرور الجديدة</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="8 أحرف على الأقل"
                                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
                                autoComplete="new-password"
                              />
                            </div>
                            <div>
                              <label className="block text-navy-400 text-xs mb-1.5">تأكيد كلمة المرور</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="أعد إدخال كلمة المرور"
                                className="w-full px-4 py-3 bg-navy-800/50 border border-navy-700/50 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-gold-500/50 text-sm"
                                autoComplete="new-password"
                              />
                            </div>
                            {passwordError && (
                              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {passwordError}
                              </div>
                            )}
                            {passwordMessage && (
                              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 shrink-0" /> {passwordMessage}
                              </div>
                            )}
                            <div className="flex gap-3">
                              <button
                                onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }}
                                disabled={passwordLoading}
                                className="flex-1 py-3 text-sm font-bold text-navy-300 bg-navy-800/60 border border-navy-600/50 rounded-xl hover:text-white transition-all"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={async () => {
                                  if (newPassword.length < 8) { setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
                                  if (newPassword !== confirmPassword) { setPasswordError('كلمتا المرور غير متطابقتين'); return; }
                                  setPasswordLoading(true);
                                  setPasswordError('');
                                  try {
                                    await storeApi.updateProfile({ password: newPassword });
                                    setPasswordMessage('تم تغيير كلمة المرور بنجاح');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setTimeout(() => setShowPasswordForm(false), 2000);
                                  } catch (e: unknown) {
                                    setPasswordError(e instanceof Error ? e.message : 'خطأ في تغيير كلمة المرور');
                                  } finally {
                                    setPasswordLoading(false);
                                  }
                                }}
                                disabled={passwordLoading}
                                className="flex-1 py-3 text-sm font-bold text-navy-950 bg-gold-500 rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ كلمة المرور'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onAuth={onAuth} />
    </>
  );
}
