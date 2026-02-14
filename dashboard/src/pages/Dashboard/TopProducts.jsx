// src/components/dashboard/TopProducts.jsx
import React from 'react';

const TopProducts = () => {
  const products = [
    { id: 1, name: 'دورة React المتقدمة 2026', sales: 142, revenue: '$12,780', growth: '+24%' },
    { id: 2, name: 'قالب Dashboard احترافي', sales: 98, revenue: '$8,820', growth: '+18%' },
    { id: 3, name: 'حزمة أيقونات فريدة', sales: 76, revenue: '$3,800', growth: '+32%' },
    { id: 4, name: 'دورة تصميم واجهات UI/UX', sales: 65, revenue: '$5,850', growth: '+12%' },
    { id: 5, name: 'إضافة متجر إلكتروني', sales: 54, revenue: '$4,266', growth: '+8%' },
  ];

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center ml-3">
              <i className="fas fa-box text-blue-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{product.name}</h4>
              <p className="text-gray-500 text-sm">{product.sales} مبيعات</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-800">{product.revenue}</div>
            <div className="text-green-600 text-sm font-medium">{product.growth}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopProducts;