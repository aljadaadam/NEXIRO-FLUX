// src/pages/Settings/SettingsPage.jsx
import React from 'react';
import AppLayout from '../../components/layout/AppLayout';

const SettingsPage = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">الإعدادات</h1>
            <p className="text-gray-600">تخصيص وتعديل إعدادات النظام</p>
          </div>
          
          <button className="btn btn-primary mt-4 md:mt-0">
            <i className="fas fa-save ml-2"></i>
            حفظ التغييرات
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="text-center py-12">
            <i className="fas fa-cogs text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-700 mb-2">صفحة الإعدادات</h3>
            <p className="text-gray-500">سيتم إضافة خيارات الإعدادات هنا قريباً</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;