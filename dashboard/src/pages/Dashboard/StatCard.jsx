// src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, change, trend, icon, color }) => {
  const isPositive = trend === 'up';
  
  return (
    <div 
      className="rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ 
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)'
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
          <h3 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center shadow-md`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <i className={`fas fa-chevron-${isPositive ? 'up' : 'down'} ml-1`}></i>
          <span className="font-medium">{change}</span>
        </div>
        <span className="text-sm mr-2" style={{ color: 'var(--text-muted)' }}>مقارنة بالفترة الماضية</span>
      </div>
    </div>
  );
};

export default StatCard;