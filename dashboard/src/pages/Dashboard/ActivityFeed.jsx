// src/components/dashboard/ActivityFeed.jsx
import React from 'react';

const ActivityFeed = () => {
  const activities = [
    { id: 1, user: 'أحمد محمد', action: 'قام بإنشاء منتج جديد', target: 'دورة React المتقدمة', time: 'منذ 5 دقائق', icon: 'fas fa-plus', color: 'bg-green-100 text-green-600' },
    { id: 2, user: 'سارة عبدالله', action: 'قامت بتحديث الطلب', target: '#2026-045', time: 'منذ 15 دقيقة', icon: 'fas fa-edit', color: 'bg-blue-100 text-blue-600' },
    { id: 3, user: 'نظام الدفع', action: 'تم استلام دفعة ناجحة', target: 'بقيمة $249', time: 'منذ ساعة', icon: 'fas fa-dollar-sign', color: 'bg-emerald-100 text-emerald-600' },
    { id: 4, user: 'محمد خالد', action: 'أضاف تقييماً جديداً', target: '4.5 نجوم', time: 'منذ 3 ساعات', icon: 'fas fa-star', color: 'bg-amber-100 text-amber-600' },
    { id: 5, user: 'نظام التسويق', action: 'تم إطلاق حملة جديدة', target: 'خصم الصيف', time: 'منذ 5 ساعات', icon: 'fas fa-bullhorn', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-xl transition-colors">
          <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center ml-3 flex-shrink-0`}>
            <i className={activity.icon}></i>
          </div>
          <div className="flex-1">
            <p className="text-gray-800">
              <span className="font-medium">{activity.user}</span> {activity.action}{' '}
              <span className="font-medium text-blue-600">{activity.target}</span>
            </p>
            <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-2">
        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
          <i className="fas fa-history ml-1"></i>
          عرض سجل الأنشطة الكامل
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;