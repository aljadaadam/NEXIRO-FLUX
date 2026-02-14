// src/components/common/Skeleton.jsx
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Skeleton = ({ width = 'w-full', height = 'h-4', className = '', rounded = 'rounded' }) => {
  const { theme, dir } = useLanguage();
  
  return (
    <div 
      className={`${width} ${height} ${rounded} ${className} ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      } relative overflow-hidden`}
    >
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${
          dir === 'rtl' ? 'animate-shimmer-rtl' : 'animate-shimmer-ltr'
        }`}
      ></div>
    </div>
  );
};

// Skeleton للبطاقات
export const SkeletonCard = () => {
  const { theme } = useLanguage();
  
  return (
    <div className={`p-6 rounded-2xl ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="w-32" height="h-6" />
        <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
      </div>
      <Skeleton width="w-24" height="h-8" className="mb-2" />
      <Skeleton width="w-40" height="h-4" />
    </div>
  );
};

// Skeleton للجدول
export const SkeletonTable = ({ rows = 5 }) => {
  const { theme } = useLanguage();
  
  return (
    <div className={`rounded-2xl overflow-hidden ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="grid grid-cols-4 gap-4">
          <Skeleton width="w-full" height="h-5" />
          <Skeleton width="w-full" height="h-5" />
          <Skeleton width="w-full" height="h-5" />
          <Skeleton width="w-full" height="h-5" />
        </div>
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, index) => (
        <div 
          key={index}
          className={`p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-3">
              <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
              <Skeleton width="w-32" height="h-4" />
            </div>
            <Skeleton width="w-40" height="h-4" />
            <Skeleton width="w-24" height="h-4" />
            <Skeleton width="w-20" height="h-8" rounded="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton للرسم البياني
export const SkeletonChart = () => {
  const { theme } = useLanguage();
  
  return (
    <div className={`p-6 rounded-2xl ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="w-40" height="h-6" />
        <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
      </div>
      
      {/* Chart bars */}
      <div className="flex items-end justify-between gap-2 h-64">
        {[...Array(7)].map((_, index) => (
          <Skeleton 
            key={index}
            width="w-full" 
            height={`h-${Math.floor(Math.random() * 40) + 20}`}
            rounded="rounded-t-lg"
          />
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 mt-2">
        {[...Array(7)].map((_, index) => (
          <Skeleton key={index} width="w-full" height="h-4" />
        ))}
      </div>
    </div>
  );
};

// Skeleton للقائمة
export const SkeletonList = ({ items = 5 }) => {
  const { theme } = useLanguage();
  
  return (
    <div className={`rounded-2xl overflow-hidden ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-lg p-4 space-y-4`}>
      {[...Array(items)].map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton width="w-12" height="h-12" rounded="rounded-lg" />
          <div className="flex-1">
            <Skeleton width="w-3/4" height="h-5" className="mb-2" />
            <Skeleton width="w-1/2" height="h-4" />
          </div>
          <Skeleton width="w-16" height="h-8" rounded="rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// Skeleton لصفحة Dashboard كاملة
export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Chart and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonList />
      </div>
      
      {/* Table */}
      <SkeletonTable />
    </div>
  );
};

// Skeleton لصفحة Orders
export const SkeletonOrders = () => {
  const { theme } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <Skeleton width="w-48" height="h-8" className="mb-2" />
          <Skeleton width="w-64" height="h-4" />
        </div>
        <Skeleton width="w-36" height="h-10" rounded="rounded-lg" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton width="w-full md:w-64" height="h-10" rounded="rounded-lg" />
        <Skeleton width="w-full md:w-48" height="h-10" rounded="rounded-lg" />
        <Skeleton width="w-full md:w-48" height="h-10" rounded="rounded-lg" />
      </div>

      {/* Table */}
      <SkeletonTable rows={8} />
    </div>
  );
};

// Skeleton لصفحة Users
export const SkeletonUsers = () => {
  const { theme } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Skeleton width="w-full md:w-96" height="h-10" rounded="rounded-lg" />
        <div className="flex gap-3">
          <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
          <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
        </div>
      </div>

      {/* Users Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className={`p-6 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center gap-4 mb-4">
              <Skeleton width="w-16" height="h-16" rounded="rounded-full" />
              <div className="flex-1">
                <Skeleton width="w-32" height="h-5" className="mb-2" />
                <Skeleton width="w-24" height="h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton width="w-full" height="h-4" />
              <Skeleton width="w-full" height="h-4" />
              <Skeleton width="w-2/3" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton لصفحة Analytics
export const SkeletonAnalytics = () => {
  const { theme } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton width="w-56" height="h-8" className="mb-2" />
          <Skeleton width="w-72" height="h-4" />
        </div>
        <Skeleton width="w-40" height="h-10" rounded="rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <Skeleton width="w-48" height="h-6" className="mb-4" />
          <Skeleton width="w-full" height="h-64" rounded="rounded-lg" />
        </div>
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <Skeleton width="w-32" height="h-6" className="mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton width="w-10" height="h-10" rounded="rounded-lg" />
                <div className="flex-1">
                  <Skeleton width="w-full" height="h-4" className="mb-2" />
                  <Skeleton width="w-20" height="h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton لصفحة Settings
export const SkeletonSettings = () => {
  const { theme } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton width="w-40" height="h-8" className="mb-2" />
          <Skeleton width="w-64" height="h-4" />
        </div>
        <Skeleton width="w-36" height="h-10" rounded="rounded-lg" />
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((section) => (
          <div key={section} className={`p-6 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <Skeleton width="w-48" height="h-6" className="mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton width="w-40" height="h-5" className="mb-2" />
                    <Skeleton width="w-64" height="h-4" />
                  </div>
                  <Skeleton width="w-20" height="h-10" rounded="rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton لصفحة Products
export const SkeletonProducts = () => {
  const { theme, dir } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <Skeleton width="w-48" height="h-8" className="mb-2" />
          <Skeleton width="w-64" height="h-4" />
        </div>
        <div className="flex gap-3">
          <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
          <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton width="w-36" height="h-12" rounded="rounded-xl" />
        <Skeleton width="w-36" height="h-12" rounded="rounded-xl" />
        <Skeleton width="w-36" height="h-12" rounded="rounded-xl" />
      </div>

      {/* Products Groups */}
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`p-6 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton width="w-48" height="h-6" />
              <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton width="w-full" height="h-12" rounded="rounded-lg" />
              <Skeleton width="w-full" height="h-12" rounded="rounded-lg" />
              <Skeleton width="w-full" height="h-12" rounded="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton لصفحة Sources
export const SkeletonSources = () => {
  const { theme } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton width="w-64" height="h-8" className="mb-2" />
          <Skeleton width="w-96" height="h-4" />
        </div>
        <Skeleton width="w-40" height="h-10" rounded="rounded-lg" />
      </div>

      {/* Sources Cards */}
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`p-6 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton width="w-48" height="h-6" />
                  <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
                </div>
                <Skeleton width="w-full" height="h-4" className="mb-3" />
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Skeleton width="w-24" height="h-4" className="mb-2" />
                    <Skeleton width="w-32" height="h-6" />
                  </div>
                  <div>
                    <Skeleton width="w-24" height="h-4" className="mb-2" />
                    <Skeleton width="w-32" height="h-6" />
                  </div>
                  <div>
                    <Skeleton width="w-24" height="h-4" className="mb-2" />
                    <Skeleton width="w-20" height="h-6" />
                  </div>
                  <div>
                    <Skeleton width="w-24" height="h-4" className="mb-2" />
                    <Skeleton width="w-16" height="h-6" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton width="w-10" height="h-10" rounded="rounded-lg" />
                <Skeleton width="w-10" height="h-10" rounded="rounded-lg" />
                <Skeleton width="w-10" height="h-10" rounded="rounded-lg" />
              </div>
            </div>
            <div className={`flex gap-3 pt-4 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Skeleton width="w-40" height="h-10" rounded="rounded-lg" />
              <Skeleton width="w-40" height="h-10" rounded="rounded-lg" />
              <Skeleton width="w-40" height="h-10" rounded="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
