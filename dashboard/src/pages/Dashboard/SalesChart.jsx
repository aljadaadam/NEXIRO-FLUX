// src/components/dashboard/SalesChart.jsx
import React from 'react';

const SalesChart = () => {
  // في تطبيق حقيقي، سيتم استخدام مكتبة مثل Chart.js أو Recharts
  return (
    <div className="relative h-64">
      {/* محاكاة لمخطط بياني */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-48 px-4">
        {[40, 65, 80, 60, 75, 90, 70].map((height, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
              style={{ height: `${height}%` }}
            ></div>
            <div className="mt-2 text-gray-500 text-xs">
              {['أحد', 'اثن', 'ثلاث', 'أرب', 'خم', 'جمعة', 'سبت'][index]}
            </div>
          </div>
        ))}
      </div>
      
      {/* تسميات المحور Y */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4 text-xs text-gray-500">
        <span>$10K</span>
        <span>$7.5K</span>
        <span>$5K</span>
        <span>$2.5K</span>
        <span>$0</span>
      </div>
      
      {/* مفتاح الرسم البياني */}
      <div className="absolute top-0 left-0 flex items-center space-x-4 space-x-reverse">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full ml-2"></div>
          <span className="text-gray-600 text-sm">المبيعات</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full ml-2"></div>
          <span className="text-gray-600 text-sm">العملاء الجدد</span>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;