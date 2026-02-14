import React, { useState } from 'react';

const GroupSelector = ({
  theme,
  dir,
  groups,
  selectedGroup,
  onSelectGroup,
  loading
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(group =>
    group.GROUPNAME?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectGroup = (group) => {
    onSelectGroup(group);
    setDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span>{dir === 'rtl' ? 'اختر المجموعة' : 'Select Group'}</span>
      </label>
      
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <span className="flex items-center gap-2">
          {selectedGroup ? (
            <>
              <span className="font-medium">{selectedGroup.GROUPNAME}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' }}>
                {Object.keys(selectedGroup.SERVICES || {}).length} {dir === 'rtl' ? 'منتج' : 'products'}
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>
              {dir === 'rtl' ? 'اختر مجموعة...' : 'Select a group...'}
            </span>
          )}
        </span>
        <svg className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-lg border-2 shadow-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          {/* Search في Dropdown */}
          <div className="p-3 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative">
              <input
                type="text"
                placeholder={dir === 'rtl' ? 'بحث في المجموعات...' : 'Search groups...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 ${dir === 'rtl' ? 'pr-9' : 'pl-9'} rounded-lg border text-sm transition focus:outline-none`}
                style={{ 
                  backgroundColor: 'var(--page-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                onClick={(e) => e.stopPropagation()}
              />
              <svg className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4`} fill="none" viewBox="0 0 24 24" stroke="var(--text-secondary)" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* قائمة المجموعات */}
          <div className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {dir === 'rtl' ? 'لا توجد مجموعات' : 'No groups found'}
                </p>
              </div>
            ) : (
              filteredGroups.map(group => {
                const servicesCount = Object.keys(group.SERVICES || {}).length;
                const isSelected = selectedGroup?.groupKey === group.groupKey;
                
                return (
                  <button
                    key={group.groupKey}
                    onClick={() => handleSelectGroup(group)}
                    className={`w-full text-${dir === 'rtl' ? 'right' : 'left'} px-3 py-2.5 rounded-lg transition-all mb-1`}
                    style={{
                      backgroundColor: isSelected ? 'var(--active-bg)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {group.GROUPNAME}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(160, 160, 165, 0.15)',
                        color: isSelected ? '#818CF8' : '#A0A0A5'
                      }}>
                        {servicesCount}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSelector;
