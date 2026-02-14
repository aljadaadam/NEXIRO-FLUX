import { useState } from 'react';
import {
  Users, Search, Filter, MoreVertical, ShoppingCart, Mail,
  UserPlus, Shield, Ban, CheckCircle, Clock, Eye, Download,
  ChevronLeft, ChevronRight, Star, CreditCard, Crown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Mock users data
const mockUsers = [
  { id: 1, name: 'أحمد المالكي', email: 'ahmed@mail.com', avatar: 'A', role: 'customer', status: 'active', joined: '2026-01-15', purchases: [{ template: 'Digital Services Store', plan: 'Lifetime', amount: 899, date: '2026-01-20' }], lastLogin: '2026-02-14', totalSpent: 899 },
  { id: 2, name: 'سارة الحربي', email: 'sarah@mail.com', avatar: 'S', role: 'customer', status: 'active', joined: '2026-01-22', purchases: [{ template: 'Digital Services Store', plan: 'Yearly', amount: 349, date: '2026-01-25' }], lastLogin: '2026-02-13', totalSpent: 349 },
  { id: 3, name: 'محمد العتيبي', email: 'mohammed@mail.com', avatar: 'M', role: 'customer', status: 'active', joined: '2026-02-01', purchases: [{ template: 'Digital Services Store', plan: 'Monthly', amount: 39, date: '2026-02-05' }], lastLogin: '2026-02-12', totalSpent: 39 },
  { id: 4, name: 'نورة القحطاني', email: 'noura@mail.com', avatar: 'N', role: 'customer', status: 'active', joined: '2026-02-05', purchases: [{ template: 'Digital Services Store', plan: 'Yearly', amount: 349, date: '2026-02-06' }], lastLogin: '2026-02-11', totalSpent: 349 },
  { id: 5, name: 'خالد الشمري', email: 'khaled@mail.com', avatar: 'K', role: 'customer', status: 'inactive', joined: '2025-12-10', purchases: [], lastLogin: '2026-01-05', totalSpent: 0 },
  { id: 6, name: 'فاطمة الزهراني', email: 'fatima@mail.com', avatar: 'F', role: 'customer', status: 'active', joined: '2026-02-08', purchases: [{ template: 'Digital Services Store', plan: 'Monthly', amount: 39, date: '2026-02-10' }], lastLogin: '2026-02-14', totalSpent: 39 },
  { id: 7, name: 'عبدالله العمري', email: 'abdullah@mail.com', avatar: 'A', role: 'customer', status: 'active', joined: '2026-01-30', purchases: [{ template: 'Digital Services Store', plan: 'Lifetime', amount: 899, date: '2026-02-01' }], lastLogin: '2026-02-14', totalSpent: 899 },
  { id: 8, name: 'ريم الدوسري', email: 'reem@mail.com', avatar: 'R', role: 'customer', status: 'banned', joined: '2025-11-20', purchases: [{ template: 'Digital Services Store', plan: 'Monthly', amount: 39, date: '2025-12-01' }], lastLogin: '2025-12-15', totalSpent: 39 },
  { id: 9, name: 'يوسف الغامدي', email: 'yousef@mail.com', avatar: 'Y', role: 'admin', status: 'active', joined: '2025-10-01', purchases: [], lastLogin: '2026-02-14', totalSpent: 0 },
  { id: 10, name: 'هند البقمي', email: 'hind@mail.com', avatar: 'H', role: 'customer', status: 'active', joined: '2026-02-10', purchases: [], lastLogin: '2026-02-13', totalSpent: 0 },
];

const statusConfig = {
  active: { labelAr: 'نشط', labelEn: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  inactive: { labelAr: 'غير نشط', labelEn: 'Inactive', color: 'bg-dark-500/10 text-dark-400 border-dark-500/20' },
  banned: { labelAr: 'محظور', labelEn: 'Banned', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function AdminUsers() {
  const { isRTL } = useLanguage();
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, buyers, non-buyers
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const filtered = users.filter(u => {
    const matchesSearch = u.name.includes(search) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchesType = filterType === 'all' || (filterType === 'buyers' ? u.purchases.length > 0 : u.purchases.length === 0);
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const buyersCount = users.filter(u => u.purchases.length > 0).length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
  const activeCount = users.filter(u => u.status === 'active').length;

  const toggleBan = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u));
  };

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
              ? `${users.length} مستخدم — ${buyersCount} مشتري — $${totalRevenue.toLocaleString()} إجمالي`
              : `${users.length} users — ${buyersCount} buyers — $${totalRevenue.toLocaleString()} total`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-dark-400 text-sm hover:text-white transition-all">
            <Download className="w-4 h-4" />
            {isRTL ? 'تصدير' : 'Export'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-all">
            <Mail className="w-4 h-4" />
            {isRTL ? 'رسالة جماعية' : 'Bulk Email'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { labelAr: 'إجمالي المستخدمين', labelEn: 'Total Users', value: users.length, icon: Users, color: 'text-primary-400 bg-primary-500/10' },
          { labelAr: 'المشترين', labelEn: 'Buyers', value: buyersCount, icon: ShoppingCart, color: 'text-emerald-400 bg-emerald-500/10' },
          { labelAr: 'النشطين', labelEn: 'Active', value: activeCount, icon: CheckCircle, color: 'text-cyan-400 bg-cyan-500/10' },
          { labelAr: 'الإيرادات', labelEn: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-amber-400 bg-amber-500/10' },
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

      {/* Filters */}
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
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'active', 'inactive', 'banned'].map(st => (
            <button
              key={st}
              onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterStatus === st
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                  : 'bg-[#111827] text-dark-400 border border-white/5 hover:text-white'
              }`}
            >
              {st === 'all' ? (isRTL ? 'الكل' : 'All') : (isRTL ? statusConfig[st]?.labelAr : statusConfig[st]?.labelEn)}
            </button>
          ))}
          <div className="w-px h-6 bg-white/5" />
          {['all', 'buyers', 'non-buyers'].map(ft => (
            <button
              key={ft}
              onClick={() => { setFilterType(ft); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterType === ft
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#111827] text-dark-400 border border-white/5 hover:text-white'
              }`}
            >
              {ft === 'all' ? (isRTL ? 'الكل' : 'All') : ft === 'buyers' ? (isRTL ? 'المشترين' : 'Buyers') : (isRTL ? 'غير مشترين' : 'Non-Buyers')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المستخدم' : 'User'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المشتريات' : 'Purchases'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الإنفاق' : 'Spent'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الانضمام' : 'Joined'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(user => (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${
                        user.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                      }`}>
                        {user.role === 'admin' ? <Crown className="w-4 h-4" /> : user.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs flex items-center gap-1.5">
                          {user.name}
                          {user.role === 'admin' && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Admin</span>}
                        </p>
                        <p className="text-dark-500 text-[11px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig[user.status]?.color || ''}`}>
                      {isRTL ? statusConfig[user.status]?.labelAr : statusConfig[user.status]?.labelEn}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.purchases.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-white text-xs">{user.purchases.length}</span>
                        <span className="text-dark-500 text-[11px]">
                          ({user.purchases.map(p => p.plan).join(', ')})
                        </span>
                      </div>
                    ) : (
                      <span className="text-dark-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${user.totalSpent > 0 ? 'text-white' : 'text-dark-600'}`}>
                      {user.totalSpent > 0 ? `$${user.totalSpent}` : '$0'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-dark-400 text-xs">{user.joined}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"
                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/5 transition-all"
                        title={isRTL ? 'إرسال رسالة' : 'Send Email'}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleBan(user.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.status === 'banned'
                              ? 'text-emerald-400 hover:bg-emerald-500/5'
                              : 'text-dark-400 hover:text-red-400 hover:bg-red-500/5'
                          }`}
                          title={user.status === 'banned' ? (isRTL ? 'إلغاء الحظر' : 'Unban') : (isRTL ? 'حظر' : 'Ban')}
                        >
                          {user.status === 'banned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-dark-500 text-xs">
              {isRTL ? `عرض ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, filtered.length)} من ${filtered.length}` : `Showing ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-dark-400 hover:text-white disabled:opacity-30 disabled:hover:text-dark-400 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === i + 1 ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-white'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-dark-400 hover:text-white disabled:opacity-30 disabled:hover:text-dark-400 transition-all">
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
              {isRTL ? 'تفاصيل المستخدم' : 'User Details'}
            </h3>
            <button onClick={() => setSelectedUser(null)} className="text-dark-400 hover:text-white text-xs">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'الاسم' : 'Name'}</p>
              <p className="text-white text-sm font-medium">{selectedUser.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'البريد' : 'Email'}</p>
              <p className="text-white text-sm font-medium">{selectedUser.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-dark-500 text-[11px] mb-1">{isRTL ? 'آخر دخول' : 'Last Login'}</p>
              <p className="text-white text-sm font-medium">{selectedUser.lastLogin}</p>
            </div>
          </div>
          {selectedUser.purchases.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-dark-400 mb-2">{isRTL ? 'المشتريات' : 'Purchases'}</h4>
              <div className="space-y-2">
                {selectedUser.purchases.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-white text-xs font-medium">{p.template}</p>
                      <p className="text-dark-500 text-[11px]">{p.plan} — {p.date}</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">${p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
