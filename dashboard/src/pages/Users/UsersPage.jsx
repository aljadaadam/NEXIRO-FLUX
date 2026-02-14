// src/pages/Users/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonUsers } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';

const UsersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        {isLoading ? (
          <SkeletonUsers />
        ) : (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة المستخدمين</h1>
                <p className="text-gray-600">إدارة وعرض جميع مستخدمي النظام</p>
              </div>
              
              <button className="btn btn-primary mt-4 md:mt-0">
                <i className="fas fa-user-plus ml-2"></i>
                إضافة مستخدم جديد
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center py-12">
                <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-700 mb-2">صفحة المستخدمين</h3>
                <p className="text-gray-500">سيتم إضافة محتوى إدارة المستخدمين هنا قريباً</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UsersPage;