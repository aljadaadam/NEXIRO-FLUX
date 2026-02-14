import React from 'react';

// Line Icons للفئات
const CategoryIcon = ({ type, active }) => {
  const strokeColor = active ? 'var(--text-primary)' : 'var(--text-secondary)';
  
  const icons = {
    SERVER: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
        <line x1="6" y1="6" x2="6.01" y2="6"></line>
        <line x1="6" y1="18" x2="6.01" y2="18"></line>
      </svg>
    ),
    IMEI: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
    ),
    REMOTE: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    )
  };
  
  return icons[type] || icons.SERVER;
};

const ProductsSidebar = ({
  theme,
  dir,
  tabs,
  activeTab,
  onTabChange,
  onImport,
  onSync,
  syncing,
  getServiceCount
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* عنوان القسم */}
      <div className="p-3 md:p-4 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{dir === 'rtl' ? 'الفئات' : 'Categories'}</span>
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {dir === 'rtl' ? 'اختر نوع الخدمة' : 'Select service type'}
        </p>
      </div>

      {/* أزرار الفئات - عمودي */}
      <div className="p-2 md:p-4 space-y-2 md:space-y-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-between text-sm md:text-base ${
              activeTab === tab.id
                ? (theme === 'dark' ? 'text-gray-200' : 'text-gray-900')
                : (theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--active-bg)' : 'transparent'
            }}
          >
            <span className="flex items-center gap-2 md:gap-3">
              <CategoryIcon type={tab.id} active={activeTab === tab.id} />
              <span className="text-xs md:text-sm">{tab.label}</span>
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              activeTab === tab.id
                ? 'bg-white/10 text-gray-300'
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              {getServiceCount(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {/* أزرار الإجراءات - أسفل */}
      <div className="p-2 md:p-3 space-y-2 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
        {/* زر الاستيراد */}
        <button
          onClick={onImport}
          className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 border-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span className="text-sm">{dir === 'rtl' ? 'استيراد' : 'Import'}</span>
          </span>
        </button>

        {/* زر المزامنة */}
        <button
          onClick={onSync}
          disabled={syncing}
          className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 shadow-md ${
            syncing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className={syncing ? 'animate-spin' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span className="text-sm">
              {syncing 
                ? (dir === 'rtl' ? 'مزامنة...' : 'Syncing...')
                : (dir === 'rtl' ? 'مزامنة' : 'Sync')}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductsSidebar;
