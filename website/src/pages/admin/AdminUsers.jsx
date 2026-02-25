import { useState, useEffect } from 'react';
import {
  Users, Search, Shield, Crown, Loader2,
  RefreshCw, AlertTriangle, UserPlus,
  ChevronLeft, ChevronRight, Globe, Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const roleConfig = {
  admin:       { labelAr: 'مدير',          labelEn: 'Admin',       color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  super_admin: { labelAr: 'مدير أعلى',     labelEn: 'Super Admin', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  user:        { labelAr: 'مستخدم',        labelEn: 'User',        color: 'bg-primary-500/10 text-primary-400 border-primary-500/20' },
  customer:    { labelAr: 'عميل',          labelEn: 'Customer',    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  moderator:   { labelAr: 'مشرف',          labelEn: 'Moderator',   color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
};

export default function AdminUsers() {
  const { isRTL } = useLanguage();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, admins: 0, regularUsers: 0, newToday: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const perPage = 20;

  useEffect(() => { loadData(); }, [currentPage, search, roleFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: perPage };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await api.getPlatformUsers(params);
      setUsers(data.users || []);
      setTotalCount(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError(err?.error || 'فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error && users.length === 0) {
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
            {isRTL ? 'مستخدمو المنصة' : 'Platform Users'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isRTL
              ? `${stats.totalUsers} مستخدم مسجّل في المنصة`
              : `${stats.totalUsers} users registered on the platform`
            }
          </p>
        </div>
        <button onClick={loadData} className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{stats.totalUsers}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</p>
        </div>
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
            <Crown className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{stats.admins}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'المديرين' : 'Admins'}</p>
        </div>
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2">
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{stats.regularUsers}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'مستخدمين عاديين' : 'Regular Users'}</p>
        </div>
        <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            <UserPlus className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-white">{stats.newToday}</p>
          <p className="text-dark-500 text-xs">{isRTL ? 'مسجّلين اليوم' : 'New Today'}</p>
        </div>
      </div>

      {/* Search & Filter */}
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
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#111827] border border-white/5 min-w-[160px]">
          <Filter className="w-4 h-4 text-dark-500" />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-sm text-white w-full cursor-pointer appearance-none"
          >
            <option value="" className="bg-[#111827]">{isRTL ? 'كل الأدوار' : 'All Roles'}</option>
            <option value="admin" className="bg-[#111827]">{isRTL ? 'مدير' : 'Admin'}</option>
            <option value="user" className="bg-[#111827]">{isRTL ? 'مستخدم' : 'User'}</option>
            <option value="customer" className="bg-[#111827]">{isRTL ? 'عميل' : 'Customer'}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المستخدم' : 'User'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الدور' : 'Role'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs hidden sm:table-cell">{isRTL ? 'الموقع' : 'Site'}</th>
                <th className="text-start px-5 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'التاريخ' : 'Joined'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const rc = roleConfig[user.role] || roleConfig.user;
                return (
                  <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${rc.color}`}>
                          {user.role === 'admin' || user.role === 'super_admin'
                            ? <Crown className="w-4 h-4" />
                            : (user.name || user.email || '?')[0].toUpperCase()
                          }
                        </div>
                        <div>
                          <p className="text-white font-medium text-xs">{user.name || '-'}</p>
                          <p className="text-dark-500 text-[11px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rc.color}`}>
                        {isRTL ? rc.labelAr : rc.labelEn}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-dark-600" />
                        <span className="text-dark-400 text-xs truncate max-w-[140px]" title={user.site_domain}>
                          {user.site_name || user.site_domain || user.site_key}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-dark-400 text-xs">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '-'}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-dark-500 text-sm">
                    {isRTL ? 'لا توجد نتائج' : 'No results'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
    </div>
  );
}
