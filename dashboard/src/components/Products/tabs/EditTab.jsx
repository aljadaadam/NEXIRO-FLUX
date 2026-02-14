import React from 'react';

/**
 * Edit Tab Component - allows editing product details
 */
const EditTab = ({ 
  dir, 
  product, 
  editValues, 
  onEditChange, 
  onSave 
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="space-y-2">
        <label className="text-sm font-bold block" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'اسم الخدمة' : 'Service Name'}
        </label>
        <input
          type="text"
          value={editValues?.SERVICENAME ?? ''}
          onChange={(e) => onEditChange?.('SERVICENAME', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border"
          style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold block" style={{ color: 'var(--text-secondary)' }}>
            {dir === 'rtl' ? 'السعر (CREDIT)' : 'Price (CREDIT)'}
          </label>
          <input
            type="number"
            value={editValues?.CREDIT ?? ''}
            onChange={(e) => onEditChange?.('CREDIT', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold block" style={{ color: 'var(--text-secondary)' }}>
            {dir === 'rtl' ? 'الوقت (TIME)' : 'Time (TIME)'}
          </label>
          <input
            type="text"
            value={editValues?.TIME ?? ''}
            onChange={(e) => onEditChange?.('TIME', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold block" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'معلومات (INFO)' : 'Info (INFO)'}
        </label>
        <textarea
          rows={4}
          value={editValues?.INFO ?? ''}
          onChange={(e) => onEditChange?.('INFO', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border"
          style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={(editValues?.enabled ?? product?.enabled) !== false}
          onChange={(e) => onEditChange?.('enabled', e.target.checked)}
        />
        {dir === 'rtl' ? 'تفعيل المنتج' : 'Enabled'}
      </label>

      <button 
        type="button" 
        onClick={onSave} 
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition"
      >
        {dir === 'rtl' ? 'حفظ التعديلات' : 'Save Changes'}
      </button>
    </div>
  );
};

export default EditTab;
