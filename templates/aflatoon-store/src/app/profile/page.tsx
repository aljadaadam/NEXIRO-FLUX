'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { storeApi } from '@/lib/api';
import type { Customer, Order } from '@/lib/types';
import { User, Package, Wallet, Settings, LogOut, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

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

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

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
  useEffect(() => { if (customer && activeTab === 'orders') loadOrders(); }, [customer, activeTab, loadOrders]);

  const handleSaveProfile = async () => {
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
                              {order.response && (
                                <div className="mt-3 p-3 bg-navy-900/50 rounded-lg">
                                  <p className="text-xs text-navy-400 mb-1">الرد:</p>
                                  <p className="text-sm text-white break-all select-all">{order.response}</p>
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
                      <p className="text-navy-500 text-sm mt-6">لشحن المحفظة تواصل مع إدارة المتجر</p>
                    </div>
                  </>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-6">الإعدادات</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-navy-800/30 border border-navy-700/40 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-bold text-sm">تغيير كلمة المرور</h4>
                          <p className="text-navy-500 text-xs mt-1">قم بتحديث كلمة مرور حسابك</p>
                        </div>
                        <button onClick={() => { setShowLogin(true); }} className="text-sm text-gold-500 hover:text-gold-400 font-medium">
                          تغيير
                        </button>
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
