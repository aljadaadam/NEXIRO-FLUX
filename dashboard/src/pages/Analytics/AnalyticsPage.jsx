// src/pages/Analytics/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { SkeletonAnalytics, SkeletonCard, SkeletonChart } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        {isLoading ? (
          <SkeletonAnalytics />
        ) : (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">التقارير والتحليلات</h1>
                <p className="text-gray-600">تحليل أداء متجرك واتخاذ قرارات مستنيرة</p>
              </div>
              
              <div className="flex space-x-2 space-x-reverse mt-4 md:mt-0">
                <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-download ml-2"></i>
                  تصدير تقرير
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-filter ml-2"></i>
                  تصفية البيانات
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center py-12">
                <i className="fas fa-chart-line text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-700 mb-2">صفحة التحليلات</h3>
                <p className="text-gray-500">سيتم إضافة مخططات وتحليلات متقدمة هنا قريباً</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;