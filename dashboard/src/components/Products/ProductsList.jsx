import React from 'react';

const ProductsList = ({
  theme,
  dir,
  group,
  selectedProduct,
  onSelectProduct
}) => {
  if (!group) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'اختر مجموعة' : 'Select a group'}
        </p>
      </div>
    );
  }

  const services = Object.entries(group.SERVICES || {});

  return (
    <div key={group.groupKey} className="space-y-3 animate-fadeIn">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span>{services.length} {dir === 'rtl' ? 'منتج' : 'products'}</span>
      </h3>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        {services.map(([serviceId, service]) => {
          const isSelected = selectedProduct?.id === service.id;
          
          return (
            <button
              key={serviceId}
              onClick={() => onSelectProduct(service)}
              className={`w-full text-${dir === 'rtl' ? 'right' : 'left'} px-4 py-3 rounded-lg mb-2 transition-all`}
              style={{
                backgroundColor: isSelected ? 'var(--active-bg)' : 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
              onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* اسم المنتج الكامل */}
                  <p className="font-medium text-sm leading-tight mb-1" style={{ 
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {service.SERVICENAME}
                  </p>
                  {/* عرض اسم API Service (Product) الكامل إذا كان موجود */}
                  {service.external_service_name && (
                    <p className="text-xs leading-tight mb-1" style={{ 
                      color: 'var(--text-secondary)',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      <span className="inline-flex items-start gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}>
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span>{service.external_service_name}</span>
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs flex items-center gap-1" style={{ color: '#10B981' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      {service.CREDIT}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: '#3B82F6' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {service.TIME}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0" style={{
                  backgroundColor: service.enabled !== false 
                    ? (isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)') 
                    : (isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'),
                  color: service.enabled !== false ? '#10B981' : '#EF4444'
                }}>
                  {service.enabled !== false 
                    ? (dir === 'rtl' ? 'مفعّل' : 'Active')
                    : (dir === 'rtl' ? 'معطل' : 'Inactive')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsList;
