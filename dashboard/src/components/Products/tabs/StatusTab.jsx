import React from 'react';

/**
 * Status Tab Component - displays and toggles product status
 */
const StatusTab = ({ 
  dir, 
  theme, 
  product, 
  editValues, 
  onToggleStatus 
}) => {
  if (!product) return null;
  
  const enabled = (editValues?.enabled ?? product.enabled) !== false;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {dir === 'rtl' ? 'الحالة الحالية:' : 'Current status:'}
        </span>
        <span className={`font-bold ${enabled ? 'text-green-500' : 'text-red-500'}`}>
          {enabled ? (dir === 'rtl' ? 'مفعل' : 'Active') : (dir === 'rtl' ? 'معطل' : 'Inactive')}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggleStatus}
        className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition ${
          enabled ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {enabled 
          ? (dir === 'rtl' ? 'تعطيل المنتج' : 'Disable Product') 
          : (dir === 'rtl' ? 'تفعيل المنتج' : 'Enable Product')
        }
      </button>
    </div>
  );
};

export default StatusTab;
