// src/components/dashboard/RecentOrders.jsx
import React from 'react';

const RecentOrders = () => {
  const orders = [
    { id: '2026-001', customer: 'أحمد السيد', product: 'قالب ويب متكامل', amount: '$149', status: 'مكتمل', date: 'الياس 10:30' },
    { id: '2026-002', customer: 'شركة التقنية', product: 'حزمة تطوير', amount: '$499', status: 'قيد التنفيذ', date: 'الياس 09:15' },
    { id: '2026-003', customer: 'مريم عبدالرحمن', product: 'دورة تصميم UI/UX', amount: '$89', status: 'مكتمل', date: 'أمس 16:45' },
    { id: '2026-004', customer: 'أكاديمية البرمجة', product: 'رخصة نظام إدارة', amount: '$1,299', status: 'معلق', date: 'أمس 11:20' },
    { id: '2026-005', customer: 'عبدالله القحطاني', product: 'إضافة متجر إلكتروني', amount: '$79', status: 'ملغي', date: '2 يوم' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'قيد التنفيذ': return 'bg-blue-100 text-blue-800';
      case 'معلق': return 'bg-amber-100 text-amber-800';
      case 'ملغي': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-medium text-gray-800">#{order.id}</span>
                <div className="text-gray-500 text-xs">{order.date}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">
                {order.customer}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                {order.product}
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-800">
                {order.amount}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;