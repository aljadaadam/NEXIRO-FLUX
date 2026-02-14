import React, { useState, useEffect } from 'react';

const ProductEditPanel = ({
  theme,
  dir,
  product,
  onOptionSelect
}) => {
  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <svg className="w-12 h-12 mb-3" 
          fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'اختر منتج للتعديل' : 'Select a product to edit'}
        </p>
      </div>
    );
  }

  const OptionIcon = ({ type }) => {
    const icons = {
      overview: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
      edit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      fields: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
      api: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
      status: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    };
    return icons[type] || null;
  };

  const editOptions = [
    {
      id: 'overview',
      title: dir === 'rtl' ? 'نظرة عامة' : 'Overview',
      description: dir === 'rtl' ? 'Basic product information' : 'Basic product information'
    },
    {
      id: 'edit',
      title: dir === 'rtl' ? 'تعديل المنتج' : 'Edit Product',
      description: dir === 'rtl' ? 'Edit name, price, time' : 'Edit name, price, time'
    },
    {
      id: 'fields',
      title: dir === 'rtl' ? 'تعديل الحقول' : 'Edit Fields',
      description: dir === 'rtl' ? 'Edit custom product fields' : 'Edit custom product fields'
    },
    {
      id: 'image',
      title: dir === 'rtl' ? 'الصورة' : 'Image',
      description: dir === 'rtl' ? 'Manage product image' : 'Manage product image'
    },
    {
      id: 'api',
      title: dir === 'rtl' ? 'اتصال API' : 'API Connection',
      description: dir === 'rtl' ? 'Connection settings' : 'Connection settings'
    },
    {
      id: 'status',
      title: dir === 'rtl' ? 'الحالة' : 'Status',
      description: dir === 'rtl' ? 'Enable/disable product' : 'Enable/disable product'
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
      {/* رأس */}
      <div className="p-4 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"/>
          </svg>
          <span>{dir === 'rtl' ? 'خيارات المنتج' : 'Product Options'}</span>
        </h3>
        <p className="text-xs mt-2 truncate" style={{ color: 'var(--text-secondary)' }}>
          {product?.SERVICENAME}
        </p>
      </div>

      {/* قائمة الخيارات */}
      <div key={product?.SERVICEID} className="flex-1 overflow-y-auto p-4 animate-fadeIn">
        <div className="space-y-2">
          {editOptions.map(option => (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className={`w-full p-3 rounded-lg text-${dir === 'rtl' ? 'right' : 'left'} transition-all duration-200`}
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  <OptionIcon type={option.id} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{option.title}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {option.description}
                  </p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                    d={dir === 'rtl' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductEditPanel;
