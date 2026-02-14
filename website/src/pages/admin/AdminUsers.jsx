import { useState, useEffect } from 'react';
import {
  Users, Search, Mail, Shield, Ban, CheckCircle, Eye,
  ChevronLeft, ChevronRight, CreditCard, Crown, Loader2,
  RefreshCw, AlertTriangle, Wallet
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const statusConfig = {
  active: { labelAr: 'نشط', labelEn: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  inactive: { labelAr: 'غير نشط', labelEn: 'Inactive', color: 'bg-dark-500/10 text-dark-400 border-dark-500/20' },
  banned: { labelAr: 'محظور', labelEn: 'Banned', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  blocked: { labelAr: 'محظور', labelEn: 'Blocked', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function AdminUsers() {
  const { isRTL } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [siteUsers, setSiteUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('customers'); // 'customers' | 'team'
  const perPage = 10;

  useEffect(() => { loadData(); }, [currentPage, search]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersRes, usersRes] = await Promise.allSettled([
        api.getCustomers({ page: currentPage, limit: perPage, search }),
        api.getSiteUsers(),
      ]);
      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value?.customers || []);
        setTotalCount(customersRes.value?.total || 0);
      }
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value?.users || usersRes.value || [];
        setSiteUsers(Array.isArray(users) ? users : []);
      }
    } catch (err) {
      setError(err?.error || 'فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (customer) => {
    const newBlocked = !customer.blocked;
    try {
      await api.toggleBlockCustomer(customer.id, newBlocked);
      await loadData();
    } catch (err) {
      alert(err?.error || 'فشل تحديث الحالة');
    }
  };

  const displayList = viewMode === 'customers' ? customers : siteUsers;
  const totalPages = Math.ceil(totalCount / perPage);

  const filteredList = displayList.filter(u => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'banned') return u.blocked;
    if (filterStatus === 'active') return !u.blocked;
    return true;
  });

  const buyersCount = customers.filter(u => (u.orders_count || 0) > 0).length;
  const totalRevenue = customers.reduce((sum, u) => sum + (u.total_spent || 0), 0);

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-dark-400 text-sm">{error}</p>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm transition-all">
          <RefreshCw className="w-4 h-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isRTL ? 'إدارة المستخدمين' : 'Users Management'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL
              ? `${totalCount} عميل — ${siteUsers.length} فريق`
              : `${totalCount} customers — ${siteUsers.length} team`
            }
          </p>
        </div>
        <button onClick={loadData} className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { labelAr: 'إجمالي العملاء', labelEn: 'Total Customers', value: totalCount, icon: Users, color: 'text-primary-400 bg-primary-500/10' },
          { labelAr: 'فريق العمل', labelEn: 'Team', value: siteUsers.length, icon: Shield, color: 'text-amber-400 bg-amber-500/10' },
          { labelAr: 'النشطين', labelEn: 'Active', value: customers.filter(u => !u.blocked).length, icon: CheckCircle, color: 'text-cyan-400 bg-cyan-500/10' },
          { labelAr: 'المحظورين', labelEn: 'Blocked', value: customers.filter(u => u.blocked).length, icon: Ban, color: 'text-red-400 bg-red-500/10' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[#111827] rounded-xl border border-white/5 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-dark-500 text-xs">{isRTL ? s.labelAr : s.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${viewMode === 'customers' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30' : 'bg-[#111827] text-dark-400 border border-white/5'}`}
        >
          {isRTL ? 'العملاء' : 'Customers'}
        </button>
        <button
          onClick={() => setViewMode('team')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${viewMode === 'team' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-[#111827] text-dark-400 border border-white/5'}`}
        >
          {isRTL ? 'فريق العمل' : 'Team'}
        </button>
      </div>

      {/* Filters */}
      {viewMode === 'customers' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#111827] border border-white/5 flex-1">
            <Search className="w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder={isRTL ? 'ابحث بالاسم أو الإيميل...' : 'Search by name or email...'}
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-dark-500 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'active', 'banned'].map(st => (
              <button
                key={st}
                onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  filterStatus === st
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                    : 'bg-[#111827] text-dark-400 border border-white/5 hover:text-white'
                }`}
              >
                {st === 'all' ? (isRTL ? 'الكل' : 'All') : st === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'محظور' : 'Blocked')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المستخدم' : 'User'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الدور' : 'Role'}</th>
                {viewMode === 'customers' && (
                  <>
                    <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الرصيد' : 'Wallet'}</th>
                    <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الحالة' : 'Status'}</th>
                  </>
                )}
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'التاريخ' : 'Date'}</th>
                {viewMode === 'customers' && (
                  <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredList.map(user => (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${
                        user.role === 'admin' || user.role === 'super_admin'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                      }`}>
                        {user.role === 'admin' || user.role === 'super_admin' ? <Crown className="w-4 h-4" /> : (user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs flex items-center gap-1.5">
                          {user.name || '-'}
                          {(user.role === 'admin' || user.role === 'super_admin') && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">{user.role}</span>}
                        </p>
                        <p className="text-dark-500 text-[11px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-dark-400 text-xs capitalize">{user.role || 'customer'}</td>
                  {viewMode === 'customers' && (
                    <>
                      <td className="px-5 py-3">
                        <span className="text-white text-xs font-medium flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-emerald-400" />
                          ${user.wallet_balance || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.blocked
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {user.blocked ? (isRTL ? 'محظور' : 'Blocked') : (isRTL ? 'نشط' : 'Active')}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-5 py-3 text-dark-400 text-xs">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  {viewMode === 'customers' && (
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleBan(user)}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.blocked
                              ? 'text-emerald-400 hover:bg-emerald-500/5'
                              : 'text-dark-400 hover:text-red-400 hover:bg-red-500/5'
                          }`}
                          title={user.blocked ? (isRTL ? 'إلغاء الحظر' : 'Unblock') : (isRTL ? 'حظر' : 'Block')}
                        >
                          {user.blocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-dark-500 text-sm">
                    {isRTL ? 'لا توجد نتائج' : 'No results'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (only for customers) */}
        {viewMode === 'customers' && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-dark-500 text-xs">
              {isRTL ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-dark-400 hover:text-white disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-dark-400 hover:text-white disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="bg-[#111827] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary-400" />
              {isRTL ? 'تفاصيل العميل' : 'Customer Details'}
            </h3>
            <button onClick={() => setSelectedUser(null)} className="text-dark-400 hover:text-white text-xs">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الاسم' : 'Name'}</p>
              <p className="text-white text-sm font-medium">{selectedUser.name || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'البريد' : 'Email'}</p>
              <p className="text-white text-sm font-medium">{selectedUser.email || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'رصيد المحفظة' : 'Wallet Balance'}</p>
              <p className="text-emerald-400 text-sm font-bold">${selectedUser.wallet_balance || 0}</p>
            </div>
          </div>
          {selectedUser.phone && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الهاتف' : 'Phone'}</p>
              <p className="text-white text-sm font-medium">{selectedUser.phone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
