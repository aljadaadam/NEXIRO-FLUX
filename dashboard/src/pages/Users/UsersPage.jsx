// src/pages/Users/UsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonUsers } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const UsersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { theme, dir, t } = useLanguage();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/auth/users');
      const data = res.data?.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: dir === 'rtl' ? 'مدير' : 'Admin' },
      editor: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: dir === 'rtl' ? 'محرر' : 'Editor' },
      viewer: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', label: dir === 'rtl' ? 'مشاهد' : 'Viewer' },
    };
    const s = styles[role] || styles.viewer;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        {isLoading ? (
          <SkeletonUsers />
        ) : (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management'}
                </h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {dir === 'rtl' ? 'إدارة وعرض جميع أعضاء الفريق' : 'Manage and view all team members'}
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className={`mt-4 md:mt-0 p-2 rounded-lg border transition ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700 text-gray-400'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-600'
                }`}
                title={dir === 'rtl' ? 'تحديث' : 'Refresh'}
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>

            {error ? (
              <div className={`rounded-2xl shadow-lg p-6 border text-center ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <i className={`fas fa-exclamation-triangle text-3xl mb-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}></i>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
                <button onClick={fetchUsers} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {dir === 'rtl' ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : users.length > 0 ? (
              <div className={`rounded-2xl shadow-lg border overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'المستخدم' : 'User'}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'الدور' : 'Role'}
                        </th>
                        <th className={`px-6 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {dir === 'rtl' ? 'تاريخ الانضمام' : 'Joined'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {users.map((user) => (
                        <tr key={user.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=A3A7F6&color=fff`}
                                alt={user.name}
                                className={`w-10 h-10 rounded-full object-cover ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`}
                              />
                              <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl shadow-lg p-12 border text-center ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <i className={`fas fa-users text-4xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}></i>
                <h3 className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {dir === 'rtl' ? 'لا يوجد مستخدمين' : 'No users yet'}
                </h3>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UsersPage;
